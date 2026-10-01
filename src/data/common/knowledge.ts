/**
 * 홈에 진열된 지식의 본문 — 장바구니의 「지식 보러가기」가 여는 것.
 *
 * 홈(오늘의 상품 · 점장님 Pick · 뽑기 · 남겨둔 지식)의 카드는 제목과 그림만
 * 있고 본문이 없었다. 장바구니에서 담은 지식을 「보러 간다」면 열 화면이
 * 있어야 하므로, 그 지식들에 짧은 본문과 출처를 붙인다. 커뮤니티 글과 같은
 * 꼴(`Post`)이라 지식 상세(440:151)가 그대로 그린다. 글쓴이는 점장님이다 —
 * 손님이 올린 글이 아니라 가게가 진열한 지식이다.
 *
 * 커뮤니티 최신 글 목록에는 넣지 않는다 — 거기는 손님이 쓴 글의 자리다.
 */

import { getPost } from "@/data/common/community";
import { fieldCategory, fields } from "@/data/common/menu";
import type { Post } from "@/types/community";

const MANAGER = { author: "점장님", authorLevel: "점장", authorAvatar: "/assets/home/ai.svg" } as const;

const shelf = (
  seed: Pick<
    Post,
    "id" | "category" | "topic" | "title" | "excerpt" | "body" | "source" | "sourceUrl" | "image" | "cards" | "recordCard"
  > & {
    n: [views: number, likes: number, saves: number];
  },
): Post => ({
  ...MANAGER,
  id: seed.id,
  category: seed.category,
  topic: seed.topic,
  title: seed.title,
  excerpt: seed.excerpt,
  body: seed.body,
  source: seed.source,
  sourceUrl: seed.sourceUrl,
  image: seed.image,
  cards: seed.cards,
  recordCard: seed.recordCard,
  when: "점장님 진열",
  views: seed.n[0],
  likes: seed.n[1],
  comments: 0,
  saves: seed.n[2],
  thread: [],
});

export const shelfKnowledge: Post[] = [
  shelf({
    id: "ice",
    category: "역사",
    topic: "한국사",
    title: "조선시대에도 아이스크림이 있었을까?",
    excerpt: "우유와 설탕을 얼린 아이스크림은 없었지만, 여름에 얼음을 먹는 사람들은 있었다.",
    body: [
      "조선에는 아이스크림은 없었다. 대신 겨울에 한강 얼음을 떠서 석빙고에 넣어 두고 여름에 꺼내 썼다. 얼음은 아무나 못 먹었다 — 나라가 관리하는 귀한 물건이라 관리들에게 「반빙」이라는 이름으로 나눠 주었다.",
      "그 얼음으로 만든 것이 「얼음 화채」다. 잘게 깬 얼음에 오미자 물이나 꿀물을 붓고 과일을 띄웠다. 지금의 빙수와 가장 가까운 음식이다.",
      "우유를 얼린 것은 없었다. 조선에서 우유는 「타락」이라 불리는 약재 취급이라, 임금의 보양식 타락죽에나 들어갔다.",
    ],
    source: "국립민속박물관 · 「한국세시풍속사전 — 반빙」",
    n: [1240, 88, 41],
  }),
  /*
    카드뉴스로 다시 만든 것 — Figma 1688:7119(「완성」 1595:4827 안). 카드 다섯과
    기록 카드. 글은 카드에 적힌 말을 옮긴 것이고 출처 주소는 프레임 주석에 적힌 것.
  */
  shelf({
    id: "king",
    category: "역사",
    topic: "인물, 사건",
    image: "/assets/knowledge/king/1.webp",
    title: "세종대왕은 정말 혼자서 한글을 만들었을까?",
    excerpt: "글자를 만든 것은 세종 혼자였고, 설명서를 쓴 것은 학자들이었다.",
    body: [
      "흔히 세종과 집현전 학자들이 함께 한글을 만들었다고 알고 있어요.",
      "하지만 실제 세종실록에는 세종이 새로운 문자 28자를 ‘친히 만들었다(親制)’고 기록되어 있어요.",
      "그럼 집현전 학자들은 뭘 했을까요? 정인지 · 신숙주 · 성삼문 등은 한글 창제 이후 문자를 연구하고 해설하는 작업에 참여했어요.",
      "기록상 한글을 직접 창제한 주체는 세종이에요. 학자들은 이후 해설과 연구에 힘을 보탰어요.",
    ],
    source: "국립한글박물관",
    sourceUrl: "https://www.hangeul.go.kr/news/newsDetail.do?bbs_id=9928&bbs_no=3&curr_menu_cd=0107000000&pageIndex=2",
    cards: [1, 2, 3, 4, 5].map((n) => `/assets/knowledge/king/${n}.webp`),
    recordCard: true,
    n: [2110, 154, 97],
  }),
  shelf({
    id: "price",
    category: "사회",
    topic: "심리학",
    title: "편의점 가격표 끝자리가 900원인 진짜 이유는?",
    excerpt: "1,900원은 2,000원보다 100원 싼 게 아니라, 머릿속에서 「1천 원대」로 읽힌다.",
    body: [
      "사람은 숫자를 왼쪽부터 읽는다. 1,900원을 보면 맨 앞의 「1」이 먼저 들어와서, 실제로는 2,000원과 100원 차이인데도 「1천 원대」로 느낀다. 이걸 왼쪽 자릿수 효과라고 부른다.",
      "실험에서 같은 물건을 2.00달러와 1.99달러로 팔았을 때 1.99달러가 훨씬 싸게 느껴졌지만, 2.99달러와 2.98달러 사이에는 그런 차이가 없었다. 앞자리가 바뀌느냐가 전부다.",
      "그래서 편의점만이 아니라 마트, 배달 앱, 옷가게까지 값의 끝자리가 900원 · 990원으로 끝난다.",
    ],
    source: "Thomas & Morwitz (2005) · Journal of Consumer Research, “Penny Wise and Pound Foolish”",
    n: [1870, 121, 63],
  }),
  shelf({
    id: "popcorn",
    category: "문화",
    topic: "대중 문화",
    title: "팝콘 금지했다가 망할 뻔한 극장들",
    excerpt: "1920년대 극장은 팝콘을 「싸구려 길거리 음식」이라며 문 앞에서 막았다.",
    body: [
      "무성영화 시절 극장은 오페라 극장처럼 고급스럽게 꾸미고 싶어 했다. 카펫이 더러워진다며 팝콘을 들고 들어오지 못하게 했고, 팝콘 장수는 극장 앞 길에서만 장사를 했다.",
      "대공황이 오자 사정이 바뀌었다. 표는 안 팔리는데 5센트짜리 팝콘은 계속 팔렸다. 극장 앞 팝콘 장수에게 자릿세를 받던 극장들이 아예 안으로 들여와 직접 팔기 시작했다.",
      "팝콘을 들인 극장은 살아남고, 끝까지 막은 극장은 문을 닫았다. 지금 극장 수익의 큰 몫이 매점인 것은 그때부터다.",
    ],
    source: "Smithsonian Magazine · “Why Do We Eat Popcorn at the Movies?”",
    n: [1530, 102, 58],
  }),
  shelf({
    id: "delivery",
    category: "역사",
    topic: "한국사",
    title: "조선시대 사람들도 배달음식을 먹었을까?",
    excerpt: "18세기 일기에 냉면을 시켜 먹은 기록이 있다.",
    body: [
      "1768년 7월, 학자 황윤석이 일기 「이재난고」에 이렇게 적었다 — 「과거 시험을 본 다음 날 점심에 냉면을 시켜 먹었다」. 조선에서 음식 배달을 적은 가장 이른 기록으로 꼽힌다.",
      "새벽 배달도 있었다. 남한산성 아래에서 끓인 해장국 「효종갱」을 밤새 항아리에 담아 서울 양반집으로 날랐다. 새벽 종소리(효종)가 울릴 때 도착한다고 그런 이름이 붙었다.",
      "물론 아무나 시켜 먹지는 못했다. 배달은 돈 있는 집의 사치였다.",
    ],
    source: "황윤석 · 「이재난고」(1768) · 한국학중앙연구원 해제",
    n: [1690, 117, 71],
  }),
  shelf({
    id: "brain",
    category: "역사",
    topic: "인물, 사건",
    title: "아인슈타인의 뇌는 도난당해 240조각이 됐다",
    excerpt: "부검을 맡은 병리학자가 허락 없이 뇌를 꺼내 갔다.",
    body: [
      "1955년 아인슈타인이 죽자 부검을 맡은 병리학자 토머스 하비가 뇌를 꺼내 가져갔다. 유족의 허락은 나중에 「연구에만 쓴다」는 조건으로 겨우 받았다.",
      "하비는 뇌를 240조각으로 잘라 유리병에 담고, 이후 40년 넘게 집 지하실과 차 트렁크에 보관하며 여러 연구자에게 조각을 나눠 주었다.",
      "조각들은 지금 필라델피아 뮈터 박물관 등에 남아 있다. 뇌의 어느 부위가 남달랐다는 연구도 있지만, 표본이 그렇게 보관된 탓에 신뢰하기 어렵다는 반론이 크다.",
    ],
    source: "Smithsonian Magazine · “The Tragic Story of How Einstein’s Brain Was Stolen”",
    n: [2320, 176, 104],
  }),
  shelf({
    id: "arbeit",
    category: "문화",
    topic: "언어",
    title: "‘아르바이트’는 어느 나라 말일까?",
    excerpt: "독일어다. 뜻은 「일」 — 짧게 하는 일이 아니라 그냥 일.",
    body: [
      "아르바이트는 독일어 Arbeit(아르바이트)에서 왔고, 독일어로는 그냥 「노동 · 일」이라는 뜻이다. 정규직도 Arbeit 다.",
      "「학생이 잠깐 하는 일」이라는 뜻은 일본에서 붙었다. 20세기 초 일본 대학생들이 독일어를 배우며 쓰던 은어가 일반 말이 됐고, 그것이 우리말로 건너왔다.",
      "그래서 독일 사람에게 「아르바이트 해요」라고 하면 「직장 다녀요」로 알아듣는다. 우리가 말하는 아르바이트는 독일어로 Nebenjob(부업)이나 Minijob 이다.",
    ],
    source: "국립국어원 · 「표준국어대사전 — 아르바이트」 어원",
    n: [980, 64, 33],
  }),
  shelf({
    id: "iceFloat",
    category: "과학",
    topic: "자연",
    title: "얼음은 왜 물 위에 뜰까?",
    excerpt: "얼면서 부피가 커지는 몇 안 되는 물질이라서다.",
    body: [
      "물질은 대개 얼면 분자가 촘촘해져서 무거워진다. 물은 반대다. 물 분자는 얼 때 수소 결합으로 육각형 격자를 만드는데, 이 격자가 액체일 때보다 틈이 많다.",
      "그래서 얼음은 같은 부피의 물보다 약 9% 가볍다(밀도 0.92). 가벼우니 뜬다. 얼음이 물 위에 뜨는 부분이 전체의 1할쯤이고 나머지는 물속에 잠긴다 — 빙산의 일각이 그 말이다.",
      "이 성질 덕에 호수는 위부터 언다. 얼음이 가라앉는 물질이었다면 호수 바닥부터 얼어 물고기가 겨울을 나지 못했을 것이다.",
    ],
    source: "한국물리학회 · 「물리학백과 — 물의 밀도와 수소 결합」",
    n: [1410, 93, 52],
  }),
  shelf({
    id: "jeans",
    category: "생활",
    topic: "일상",
    title: "청바지 작은 주머니의 정체는?",
    excerpt: "회중시계를 넣던 자리다 — 1873년부터.",
    body: [
      "청바지 오른쪽 앞주머니 안의 작은 주머니는 「워치 포켓」이다. 리바이스가 1873년 첫 청바지를 만들 때부터 있었고, 광부와 카우보이가 회중시계를 넣어 다녔다.",
      "손목시계가 흔해진 뒤로는 쓸모가 없어졌지만 디자인의 일부로 남았다. 리바이스는 지금도 「동전 · 라이터 · 티켓 주머니」로 쓰라고 안내한다.",
      "그래서 이름이 여럿이다 — 워치 포켓, 코인 포켓, 티켓 포켓. 무엇을 넣든 원래 주인은 시계였다.",
    ],
    source: "Levi Strauss & Co. · “What’s the Little Pocket on Jeans For?”",
    n: [1760, 128, 66],
  }),
  shelf({
    id: "banana",
    category: "과학",
    topic: "자연",
    title: "바나나는 나무가 아니라 풀이다",
    excerpt: "줄기처럼 보이는 것은 잎이 겹겹이 말린 것이다.",
    body: [
      "바나나는 키가 몇 미터씩 자라지만 나무가 아니다. 나무의 조건인 「목질 줄기」가 없다. 줄기처럼 보이는 기둥은 잎자루가 겹겹이 말려 단단해진 것으로, 가짜 줄기(위경)라고 부른다.",
      "그래서 식물학에서는 여러해살이풀로 분류한다. 세계에서 가장 큰 풀 중 하나다.",
      "열매를 한 번 맺은 기둥은 죽고, 땅속 뿌리줄기에서 새 기둥이 올라온다. 우리가 먹는 바나나는 씨가 없어 이렇게 뿌리를 나눠서만 번식한다.",
    ],
    source: "국립생물자원관 · 「한반도의 생물다양성 — 바나나」",
    n: [1330, 97, 49],
  }),
  shelf({
    id: "ok",
    category: "문화",
    topic: "언어",
    title: "‘OK’는 원래 오타를 놀리는 말이었다",
    excerpt: "1839년 보스턴 신문의 장난에서 시작됐다.",
    body: [
      "1839년 미국 보스턴의 신문들 사이에서 일부러 철자를 틀리게 쓰고 줄이는 장난이 유행했다. all correct(다 맞음)를 oll korrect 로 틀리게 쓰고 그 머리글자만 딴 것이 O.K. 다.",
      "이듬해 대통령 선거에서 후보 마틴 밴 뷰런의 별명 Old Kinderhook(고향 이름)과 글자가 겹쳐 선거 구호 「OK」로 쓰이면서 온 나라로 퍼졌다.",
      "지금은 세계에서 가장 많이 쓰이는 말 중 하나가 됐다. 인디언 말, 그리스어에서 왔다는 설도 있지만 신문 기록이 남은 것은 이 설뿐이다.",
    ],
    source: "Allan Metcalf · 「OK: The Improbable Story of America’s Greatest Word」(2010)",
    n: [1150, 81, 44],
  }),
  /*
    아래 둘은 카테고리 상세(1549:1341)의 과학 목록에 먼저 열어 둔 것 — 제목은
    사용자가 정했고, 본문은 그 제목의 사실을 짧게 적었다.
  */
  /* 카드뉴스 — Figma 1712:2955. 카드 넷과 기록 카드. 출처는 프레임 주석의 머니투데이 칼럼. */
  shelf({
    id: "bug",
    category: "과학",
    topic: "기술",
    image: "/assets/knowledge/bug/1.webp",
    title: "컴퓨터 ‘버그’는 진짜 벌레였다",
    excerpt: "1947년 하버드의 계산기 계전기에 낀 나방 한 마리가 로그북에 테이프로 붙어 남아 있다.",
    body: [
      "1947년 9월 9일, 하버드대의 마크 컴퓨터가 갑자기 말을 안 듣기 시작했어요. 원인을 찾아보니 릴레이 사이에 나방 한 마리가 끼어 있었죠.",
      "연구원들은 그 나방을 떼어내 로그북에 테이프로 붙여두고는 “버그가 발견된 최초의 실제 사례(First actual case of bug being found)”라고 적어놨어요.",
      "재미있는 건 ‘버그’라는 말 자체는 이미 에디슨 시대부터 기계 결함을 뜻하는 은어였다는 점이에요. 그러니까 이 사건은 단어가 생겨난 순간이 아니라, 진짜 벌레가 버그였던 최초의 기록인 셈이죠. 이 로그북은 지금도 스미스소니언에 보관돼 있어요.",
    ],
    source: "머니투데이",
    sourceUrl: "https://www.mt.co.kr/opinion/2025/09/22/2025092107091663045",
    cards: [1, 2, 3, 4].map((n) => `/assets/knowledge/bug/${n}.webp`),
    recordCard: true,
    n: [1420, 109, 57],
  }),
  /* 카드뉴스 — Figma 1658:11080. 카드 다섯과 기록 카드. 출처는 프레임 주석의 서울대 자료. */
  shelf({
    id: "banana-radiation",
    category: "과학",
    topic: "자연",
    image: "/assets/knowledge/banana-radiation/1.webp",
    title: "바나나도 아주 조금은 방사능을 낸다",
    excerpt: "칼륨 만 개 중 하나는 방사성 칼륨-40 — 바나나 한 개가 1초에 열세 번쯤 아주 약한 방사선을 낸다.",
    body: [
      "바나나에 칼륨이 많다는 건 다들 아실 거예요. 그런데 그 칼륨 중 만 개에 한 개쯤은 ‘칼륨-40’이라는 조금 특별한 칼륨이에요. 가만히 있어도 아주 약한 방사선을 내죠.",
      "바나나 한 개에서 1초에 열세 번 정도 나오는데, 몸에는 아무런 영향이 없는 수준이에요. 이 양이 워낙 일정하다 보니 과학자들은 방사선을 쉽게 설명할 때 아예 ‘바나나 몇 개어치’로 세기도 해요 — 가슴 CT 한 번이 바나나 7만 개쯤이에요.",
      "더 재미있는 건, 바나나를 먹어도 몸이 받는 방사선은 늘지 않는다는 거예요. 우리 몸이 칼륨을 늘 일정하게 유지해서, 들어온 만큼 바로 내보내거든요. 애초에 사람 몸에는 원래 칼륨-40이 바나나 한 개의 300배쯤 들어 있어서, 알고 보면 바나나보다 사람이 더 센 셈이죠.",
      "참고로 미국 항구에서 밀수 핵물질을 잡아내는 기계는 워낙 예민해서, 바나나를 가득 실은 트럭이 지나가면 경보가 울리기도 해요.",
    ],
    source: "서울대학교 · 「방사성 칼륨(K-40)과 식품; 바나나 선량」",
    sourceUrl: "https://atomic.snu.ac.kr/index.php/방사성_칼륨(K-40)과_식품;_바나나_선량",
    cards: [1, 2, 3, 4, 5].map((n) => `/assets/knowledge/banana-radiation/${n}.webp`),
    recordCard: true,
    n: [1380, 104, 52],
  }),
];

/**
 * 지식의 갈래 표 — 「역사 · 세계사」. 홈 카드 · 장바구니 · 남겨둔 지식이 전부
 * 이것으로 적는다. 전에는 자리마다 손으로 적어 두어 같은 글이 홈에서는
 * 「역사·한국사」, 뽑기에서는 「역사·세계사」로 나왔다(감수 지적) — 이제 글
 * 데이터 하나가 정한다. 큰 갈래는 분야 이름(menu.ts fields)으로.
 */
export function tagOf(post: Post | string): string {
  const one = typeof post === "string" ? getKnowledge(post) : post;
  if (!one) return "";
  const field = fields.find((f) => fieldCategory[f.id] === one.category)?.name ?? one.category;
  return one.topic ? `${field} · ${one.topic}` : field;
}

/** 커뮤니티 글이든 점장님이 진열한 지식이든 — id 로 찾는다. */
export function getKnowledge(id: string): Post | undefined {
  return getPost(id) ?? shelfKnowledge.find((post) => post.id === id);
}

/**
 * 장바구니 칸의 id → 지식의 id.
 *
 * 홈의 세 자리가 각자 다른 접두사로 담는다(점장님 Pick `home-card-`, 오늘의
 * 상품 `home-pick-`, 뽑기 `lucky-`) — 같은 지식이 여러 이름으로 들어온다.
 * 접두사 뒤가 곧 지식 id 다(홈의 지식은 전부 카드뉴스가 있는 것으로 맞췄다).
 * 지식 상세로 갈 때는 이름을 하나로 모은다. 커뮤니티 글은 `post-` 다.
 */
export function knowledgeIdFor(cartId: string): string {
  for (const prefix of ["home-card-", "home-pick-", "lucky-", "post-"]) {
    if (cartId.startsWith(prefix)) return cartId.slice(prefix.length);
  }
  return cartId;
}

/**
 * 이 지식이 담긴 장바구니 칸의 id — 어느 이름으로 담겼든.
 *
 * 홈에서 `home-card-brain` 으로 담은 것을 지식 상세에서 `post-brain` 으로
 * 또 담으면 장바구니에 같은 지식이 둘 쌓인다. 담기 전에 이미 담긴 이름이
 * 있는지 보고, 있으면 그 이름을 쓴다. 없으면 `post-` 로 새로 담는다.
 */
export function cartIdFor(knowledgeId: string, saved: readonly string[]): string {
  return saved.find((id) => knowledgeIdFor(id) === knowledgeId) ?? `post-${knowledgeId}`;
}
