import Anthropic from "@anthropic-ai/sdk";
import { recent } from "@/data/common/community";
import { getKnowledge, shelfKnowledge } from "@/data/common/knowledge";
import { fieldCategory, fields } from "@/data/common/menu";
import type { Post } from "@/types/community";

/**
 * 알래봇의 실제 답 — Claude 에게 물어 온다.
 *
 * 열쇠는 서버에서만 읽는다. 브라우저에서 부르면(`NEXT_PUBLIC_`) 열쇠가 그대로
 * 딸려 나가 아무나 쓸 수 있게 된다 — 그래서 화면은 이 길로 물어보고, 여기서만
 * Anthropic 에 붙는다.
 *
 * 열쇠는 `.env.local` 에 `ANTHROPIC_API_KEY=...` 로 둔다(`.gitignore` 가
 * `.env*` 를 이미 막고 있다). 없으면 화면에 「아직 연결되지 않았다」고
 * 알린다 — 조용히 미리 적어 둔 말로 돌아가면 붙은 줄 알게 된다.
 *
 * 알래봇은 잡지식을 직접 풀어 주지 않는다. 이 앱은 사람들이 올린 잡지식을
 * 읽는 곳이라, 봇이 다 알려 주면 글을 읽을 이유가 없다. 그래서 봇은
 * 「안내 데스크」다 — 앱에 있는 글이면 그 글로 보내고, 없으면 바깥 검색
 * 링크를 쥐여 주면서 직접 등록해 달라고 한다. 앱 사용법만 직접 답한다.
 *
 * 그러려면 봇이 앱에 어떤 글이 있는지 알아야 한다 — 글 목록을 통째로
 * 시스템 프롬프트에 넣는다(쉰 편 남짓, 4천 토큰쯤). 매번 같은 내용이라
 * 캐시에 얹어 두면 두 번째부터는 값이 열 배 싸다.
 *
 * 답은 글자가 아니라 정해진 모양(JSON)으로 받는다 — 어느 글로 보낼지,
 * 검색어는 무엇인지, 글쓰기를 권할지를 화면이 단추로 그려야 하기 때문이다.
 * 모델이 주소를 지어내지 못하게 링크는 「어디서 무엇을 검색」만 받고 주소는
 * 여기서 만든다.
 *
 * 지식문의(about) — 지식 상세에서 「알래봇에게 물어보기」로 들어온 대화는 그 글
 * 하나를 두고 묻는 것이다(1202:3843: 「아인슈타인 뇌는 지금 어디에 있어?」 →
 * 답 + 출처). 이때는 규칙 1 을 접고 그 글의 본문을 시스템에 붙여 직접 답하게
 * 한다 — 이미 읽은 글이라 「읽어 보세요」는 헛말이다. 출처는 모델이 아니라 여기서
 * 글의 것을 붙인다(answered 가 true 일 때) — 모델이 지어낸 출처를 막는다.
 */

/** 대화 한 줄 — 화면이 들고 있는 것 그대로. */
type Turn = { role: "user" | "assistant"; text: string };

/** 모델이 돌려주는 모양. */
type Answer = {
  text: string;
  /** 안내할 글의 id — 목록에 있는 것만. */
  posts: string[];
  /** 앱에 없을 때 쥐여 줄 바깥 검색. */
  links: { site: "google" | "wikipedia"; query: string }[];
  /** 글쓰기를 권할지. */
  write: boolean;
  /** 지식문의 글을 근거로 직접 답했는지 — 화면이 그 글의 출처를 붙인다. */
  answered: boolean;
};

const ANSWER_SCHEMA = {
  type: "object",
  properties: {
    text: { type: "string", description: "말풍선에 들어갈 말. 두세 문장. 마크다운 없이." },
    posts: {
      type: "array",
      items: { type: "string" },
      description: "안내할 글의 id. 목록에 있는 것만, 최대 3개. 없으면 빈 배열.",
    },
    links: {
      type: "array",
      items: {
        type: "object",
        properties: {
          site: { type: "string", enum: ["google", "wikipedia"] },
          query: { type: "string", description: "검색어. 한국어로 짧게." },
        },
        required: ["site", "query"],
        additionalProperties: false,
      },
      description: "앱에 없는 지식일 때만. 최대 2개. 아니면 빈 배열.",
    },
    write: { type: "boolean", description: "앱에 없는 지식이라 직접 등록을 권할 때 true." },
    answered: {
      type: "boolean",
      description: "지식문의 중인 글에 관한 질문에 그 글을 근거로 직접 답했으면 true. 아니면 false.",
    },
  },
  required: ["text", "posts", "links", "write", "answered"],
  additionalProperties: false,
} as const;

/** 분야 이름 — 글의 갈래(category)를 메뉴의 분야 이름으로. */
const fieldName = (category: string) =>
  fields.find((f) => fieldCategory[f.id] === category)?.name ?? category;

/**
 * 앱에 있는 글의 목록 — 봇이 「어느 글로 보낼지」 고르는 표.
 *
 * 한 줄에 한 편: id · 분야 · 제목 · 첫 문장. 본문은 넣지 않는다 — 봇이
 * 본문을 알면 그걸 풀어 주고 싶어지고, 그러면 글을 읽을 이유가 없어진다.
 * 제목과 첫 문장이면 어느 글인지 고르기엔 충분하다.
 */
/**
 * 봇이 아는 글 전부 — 커뮤니티 글과 점장님이 진열한 지식(shelfKnowledge).
 * 전에는 커뮤니티 글만 넣어서 점장님 Pick 의 「세종대왕」을 물어도 없다고
 * 했다(감수 지적).
 */
const EVERYTHING: Post[] = [...recent.posts, ...shelfKnowledge];

const CATALOG = EVERYTHING
  .map((post) => `- ${post.id} | ${fieldName(post.category)} | ${post.title} | ${post.excerpt}`)
  .join("\n");

/**
 * 안내 카드가 갈 곳 — 카드뉴스가 있는 지식(진열 지식 · 카드가 붙은 글)은 지식
 * 상세, 나머지는 커뮤니티 글. 주소는 모델이 아니라 여기서 만든다.
 */
const hrefFor = (post: Post) =>
  post.cards?.length || shelfKnowledge.some((one) => one.id === post.id)
    ? `/menu/knowledge/${post.id}`
    : `/community/post/${post.id}`;

/** 분야별 편수 — 「가장 많이 본 분야」 같은 물음에 쓴다. */
const FIELD_COUNTS = fields
  .map((f) => {
    const mine = EVERYTHING.filter((p) => p.category === fieldCategory[f.id]);
    const views = mine.reduce((sum, p) => sum + (p.views ?? 0), 0);
    return `- ${f.name}: ${mine.length}편, 조회 ${views}`;
  })
  .join("\n");

/**
 * 알래봇이 누구인지.
 *
 * 핵심은 「잡지식을 직접 풀지 말 것」이다. 이 앱은 사람들이 올린 글을 읽는
 * 곳이라, 봇이 답을 다 해 버리면 글도 글쓰기도 죽는다. 봇은 길 안내만 한다.
 */
const SYSTEM = `너는 「알래말래븐」이라는 24시간 지식 편의점 앱의 알바생 「알래봇」이다.
알래말래븐은 사람들이 잡지식(짧은 상식·트리비아)을 글로 올리고, 다른 사람이 그 글을 읽고 내 봉투에 넣어 두고 퀴즈를 푸는 앱이다.
너는 안내 데스크다. 손님이 원하는 지식이 있는 진열대(글)로 데려다주는 게 일이고, 지식 자체를 네가 풀어 주는 건 네 일이 아니다.

말투
- 편의점 알바생처럼 사근사근하고 짧게. 한국어 존댓말, 딱딱하지 않게.
- text 는 두세 문장. 마크다운 기호(**, #, -, 번호 목록)를 쓰지 않는다. 말풍선에 글자 그대로 보인다.
- 링크 주소나 글 id 를 text 에 적지 않는다. 그건 posts · links 로 따로 전달하면 화면이 단추로 그린다.

규칙 1 — 잡지식·사실을 묻는 질문에는 답을 직접 말하지 않는다.
- 아래 「글 목록」에서 관련 글을 찾아 posts 에 id 를 넣고(최대 3개), text 에는 「그거 여기 있어요, 읽어 보세요」 식으로 안내만 한다.
- 결론·정답·핵심 내용을 말하지 않는다. 궁금증만 살짝 키운다. 예: 「꿀이 안 썩는 이유, 3천 년 된 꿀 이야기로 정리해 둔 글이 있어요.」
- 관련 글이 여러 개면 가장 가까운 것부터 넣는다. 억지로 끼워 맞추지는 않는다.

규칙 2 — 글 목록에 없는 지식이면
- text 에 「아직 알래말래븐에는 그 지식이 없어요」라고 솔직히 말하고,
- links 에 검색을 하나둘 넣고(google 또는 wikipedia, 검색어는 한국어로 짧게),
- write 를 true 로 두고 text 에서 「찾아보고 직접 등록해 주시면 알래말래븐의 첫 글이 돼요」처럼 글쓰기를 권한다.
- 이때도 답을 대신 말해 주지 않는다. 「확실하진 않지만 아마 …」 같은 추측도 하지 않는다.

규칙 3 — 앱 사용법(글쓰기, 출처, 카더라, 내 봉투(읽을 지식을 넣어 두는 곳), 영수증, 퀴즈, 채팅방, 토론방, 출석, 통계)은 직접 답한다.
- 아는 대로 짧게 안내하고, 모르는 기능은 모른다고 한다.
- 출처 없는 글에는 「카더라」 표가 붙는다. 글쓰기는 커뮤니티의 글쓰기 단추에서 한다.

규칙 4 — 알약 단추
- 「지식 추천」: 글 목록에서 분야가 다른 글 3편을 posts 에 넣고 한 줄로 권한다.
- 「가장 많이 본 분야」: 아래 분야별 집계로 답하고, 그 분야 글 두어 편을 posts 에 넣는다.
- 「핵심 내용 요약」「이 글 요약해줘」: 요약은 해 주지 않는다. 어떤 글인지 묻고, 제목을 말하면 그 글로 안내한다(posts). 요약 대신 「글이 짧아서 금방 읽혀요」처럼 읽기를 권한다.
- 「출처 확인」: 어떤 글의 출처가 궁금한지 묻고, 글을 알면 그 글로 안내한다. 출처는 글 아래 「출처」 줄에 있고 링크 이동이 된다고 알려 준다.

규칙 5 — 인사·잡담은 짧게 받아 주고, 궁금한 지식이 있으면 물어보라고 한다.

분야별 집계
${FIELD_COUNTS}

글 목록 (id | 분야 | 제목 | 첫 문장)
${CATALOG}`;

/**
 * 지식문의 글 — 시스템에 덧붙이는 두 번째 덩어리. 글마다 다르니 캐시에는
 * 안 얹는다(앞의 긴 덩어리는 그대로 캐시).
 */
function inquiryBlock(post: Post): string {
  const source = post.source ? `${post.source}${post.sourceUrl ? ` (${post.sourceUrl})` : ""}` : "없음";
  return `지식문의
손님은 지금 아래 글을 읽다가 「알래봇에게 물어보기」를 눌러 들어왔다. 이 글에 관한 질문에는 규칙 1 을 접고 직접 답한다 — 이미 읽은 글이라 「읽어 보세요」는 헛말이다.
- 글 내용을 근거로 두세 문장으로 답하고 answered 를 true 로 둔다. 글에 없는 것을 물으면 아는 만큼 짧게 답하되 확실하지 않으면 그렇다고 말한다(이때도 answered 는 true).
- text 에 출처 주소를 적지 않는다 — 화면이 글의 출처를 따로 붙인다.
- 이 글과 상관없는 질문이면 평소 규칙대로 하고 answered 는 false.

글: ${post.title} (${fieldName(post.category)}${post.topic ? ` · ${post.topic}` : ""})
본문:
${(post.body ?? [post.excerpt]).join("\n")}
출처: ${source}`;
}

const client = new Anthropic();

/** 검색 주소는 여기서만 만든다 — 모델이 주소를 지어내지 못하게. */
function linkFor(link: Answer["links"][number]): { label: string; url: string } {
  const q = encodeURIComponent(link.query.trim());
  return link.site === "wikipedia"
    ? { label: `위키백과에서 「${link.query}」 찾기`, url: `https://ko.wikipedia.org/w/index.php?search=${q}` }
    : { label: `구글에서 「${link.query}」 검색`, url: `https://www.google.com/search?q=${q}` };
}

export async function POST(request: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json(
      { error: "no-key", text: "알래봇이 아직 연결되지 않았어요. (ANTHROPIC_API_KEY 없음)" },
      { status: 503 },
    );
  }

  let turns: Turn[];
  /** 지식문의 중인 글 — 있으면 그 글을 두고 답한다 */
  let about: Post | undefined;
  try {
    const body = (await request.json()) as { turns?: Turn[]; about?: string };
    turns = body.turns ?? [];
    about = typeof body.about === "string" ? getKnowledge(body.about) : undefined;
  } catch {
    return Response.json({ error: "bad-request" }, { status: 400 });
  }
  if (!turns.length) return Response.json({ error: "bad-request" }, { status: 400 });

  try {
    const response = await client.beta.messages.create({
      /*
        Sonnet 5 — 짧은 잡지식 문답과 앱 안내에는 Opus 와 차이가 안 나고,
        한 마디 값이 절반 아래다. 발표 뒤에도 포트폴리오 링크로 오래 열려
        있을 화면이라 크레딧이 천천히 닳는 쪽을 고른다.
      */
      model: "claude-sonnet-5",
      /*
        말풍선 하나에 들어갈 만큼만 받는다. 길게 받아도 화면에서 잘리고,
        기다리는 시간만 늘어난다.
      */
      max_tokens: 1024,
      // 짧은 대화라 낮게 — 생각을 끄는 대신 낮추는 쪽이다(끄면 도구 호출이
      // 글자로 새는 등 다른 문제가 생긴다).
      output_config: { effort: "low", format: { type: "json_schema", schema: ANSWER_SCHEMA } },
      // 안전 분류에 걸려 답이 멎으면 서버가 다른 모델로 이어 준다
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      // 글 목록까지 든 긴 프롬프트 — 매번 같으니 캐시에 얹는다
      system: [
        { type: "text", text: SYSTEM, cache_control: { type: "ephemeral" } },
        ...(about ? [{ type: "text" as const, text: inquiryBlock(about) }] : []),
      ],
      messages: turns.map((turn) => ({ role: turn.role, content: turn.text })),
    });

    if (response.stop_reason === "refusal") {
      return Response.json({ text: "그건 제가 답하기 어려운 이야기예요." });
    }

    const raw = response.content
      .filter((block) => block.type === "text")
      .map((block) => block.text)
      .join("")
      .trim();

    let answer: Answer;
    try {
      answer = JSON.parse(raw) as Answer;
    } catch {
      // 모양이 깨져 오면 글자만이라도 보여 준다
      return Response.json({ text: raw || "음… 뭐라고 답해야 할지 모르겠어요." });
    }

    /*
      글 id 는 목록에 있는 것만 통과시킨다 — 모델이 비슷한 id 를 지어내면
      화면이 빈 글로 보낸다. 제목과 분야를 붙여 보내 화면이 카드로 그린다.
    */
    const posts = (answer.posts ?? [])
      .map((id) => getKnowledge(id))
      .filter((post) => post !== undefined)
      .slice(0, 3)
      .map((post) => ({ id: post.id, title: post.title, category: post.category, href: hrefFor(post) }));

    const links = (answer.links ?? []).filter((link) => link.query?.trim()).slice(0, 2).map(linkFor);

    // 지식문의에 글을 근거로 답했으면 그 글의 출처를 붙인다 — 모델의 것이 아니라 글의 것
    const cited = about && answer.answered ? about : undefined;
    return Response.json({
      text: answer.text?.trim() || "음… 뭐라고 답해야 할지 모르겠어요.",
      posts,
      links,
      write: Boolean(answer.write),
      ...(cited?.source ? { source: cited.source, sourceUrl: cited.sourceUrl } : {}),
    });
  } catch (error) {
    // 어떤 이유로 막혔는지는 서버 기록에만 남긴다 — 화면에는 열쇠도 주소도 안 흘린다
    console.error("[ai] 알래봇 답을 받지 못했습니다:", error);
    const status =
      error instanceof Anthropic.RateLimitError
        ? "지금 사람이 몰렸어요. 잠시 뒤에 다시 물어봐 주세요."
        : "지금은 답을 가져오지 못했어요. 잠시 뒤에 다시 물어봐 주세요.";
    return Response.json({ error: "upstream", text: status }, { status: 502 });
  }
}
