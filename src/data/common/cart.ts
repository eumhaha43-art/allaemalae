/**
 * 장바구니 — Figma 1021:15139.
 *
 * 그림은 새로 받지 않고 홈에서 쓰던 파일을 그대로 가져다 쓴다 — 같은 지식이
 * 홈과 장바구니에 함께 나오므로 파일이 갈라지면 한쪽만 바뀐다.
 *
 * 아이스크림만 조각 두 개로 그려져 있어 배열로 둔다. 나머지는 한 장이다.
 */

import { categoryColors } from "@/data/common/community";
import type { CartItem } from "@/types/cart";
import { getKnowledge, knowledgeIdFor, tagOf } from "@/data/common/knowledge";
import { topicIconOf } from "@/data/common/menu";

/**
 * 탭은 셋 — 「담아둠」은 없다(사용자 결정). 담은 지식은 아직 안 열어 봤어도
 * 곧 먹는 중 0% 다. 담아둠을 따로 두면 담은 것이 어디 갔는지 한 번 더 찾아야
 * 했고, 0% 한 칸이면 「담겼고, 아직 안 읽었다」가 한눈에 읽힌다.
 */
export const tabs = ["전체", "먹는 중", "다 먹음"] as const;

/**
 * 한 장짜리 그림 — 칸 안에 비율대로 꽉 채운다.
 *
 * max-w/max-h 로는 큰 그림만 줄어들고 작은 그림(32x26)은 원본 그대로 남아
 * 크기가 안 맞는다. 칸을 꽉 채우게 두고 object-contain 이 비율을 지키게 한다.
 */
const one = (src: string) => ({
  parts: [{ src, className: "size-full object-contain" }],
});

/**
 * 몇 장 봤는지 → %. 상세가 적는 값(useReadProgress — 본 장 수 / 카드 수)과
 * 같은 셈이라, 이어 보다 돌아와도 숫자가 앞뒤가 맞는다. 카드뉴스는 카드 수,
 * 글 카드는 문단 수가 분모다.
 */
const seen = (id: string, pages: number) => {
  const post = getKnowledge(id);
  const total = post?.cards?.length || post?.body?.length || 1;
  return Math.round((pages / total) * 100);
};

/**
 * 갈래 그림 — 지식 목록의 검은 네모에 앉는 그것(topicIconOf)을 흰 칸에 제 크기로.
 * 냉장고의 칸은 다 그림이어야 한다(사용자 지시 — 다 먹은 것들처럼, 사진이 아니라).
 * 전에는 카드뉴스 첫 장을 동그랗게 잘라 썼다(photo). 그림은 검은 네모(60)용
 * 크기라 조금 키우되(1.15) 칸(52 ~ 57)을 넘지 않게 한다.
 */
const topicArt = (knowledgeId: string) => {
  const post = getKnowledge(knowledgeId);
  const icon = topicIconOf(post?.category ?? "", post?.topic);
  const scale = Math.min(1.15, 46 / Math.max(icon.width, icon.height));
  return {
    parts: [{ src: icon.src, className: "max-w-none object-contain", width: icon.width * scale, height: icon.height * scale }],
  };
};

/** 카드뉴스 지식 한 칸 — 얼굴은 갈래 그림, 진행률은 본 장 수로. */
const reading = (id: string, title: string[], pages: number): CartItem => ({
  id,
  tag: tagOf(id),
  title,
  art: topicArt(id),
  state: "먹는 중",
  progress: seen(id, pages),
});

export const items: CartItem[] = [
  {
    id: "ice",
    tag: "역사 · 음식",
    title: ["조선시대에도", "아이스크림이", "있었을까?"],
    art: {
      /*
        조각 둘이 겹쳐 하나가 되는 그림이라 원래 비율(0.727)대로 칸을 좁힌다.
        그림(<img>)은 inset 만 줘서는 늘어나지 않아 크기를 직접 준다.

        높이는 다른 카드 그림과 같은 58 에 맞춰 두었다 — 카드마다 그림이 차지하는
        자리가 다르면 제목 줄이 어긋나 보인다(1446:5746 의 달러가 기준).
      */
      box: "relative block h-[58px] w-[42.2px]",
      parts: [
        { src: "/assets/home/ice-top.svg", className: "absolute top-0 left-0 size-[42.2px]" },
        {
          src: "/assets/home/ice-bottom.svg",
          className: "absolute top-[35.9px] left-[6.4px] h-[22.1px] w-[29.4px]",
        },
      ],
    },
    state: "다 먹음",
  },
  {
    id: "king",
    tag: "역사 · 인물",
    // 지식의 제목 그대로 — 통계가 제목으로 갈래를 찾는다(Stats.fieldOfTitle)
    title: ["세종대왕은 정말", "혼자서 한글을", "만들었을까?"],
    art: one("/assets/home/king.svg"),
    state: "다 먹음",
  },
  {
    id: "price",
    tag: "사회 · 경제",
    title: ["편의점 가격표", "끝자리가 900원인", "진짜 이유는?"],
    art: one("/assets/home/pick-price.png"),
    state: "다 먹음",
  },
  {
    id: "popcorn",
    tag: "문화 · 영화",
    title: ["팝콘 금지했다가", "망할 뻔한 극장들"],
    // 배경 없는 아이콘 — 프레임 1446:5768 에서 받아 한 장으로 합친 것이다.
    art: one("/assets/home/popcorn.svg"),
    state: "다 먹음",
  },
  {
    id: "delivery",
    tag: "역사 · 생활",
    title: ["조선시대 사람들도", "배달음식을", "먹었을까?"],
    art: one("/assets/home/food.svg"),
    state: "다 먹음",
  },
  {
    id: "brain",
    tag: "역사 · 인물",
    title: ["아인슈타인의", "뇌는 도난당해", "240조각이 됐다"],
    art: one("/assets/home/brain.svg"),
    state: "다 먹음",
  },
  /*
    먹는 중 — 홈의 「남겨둔 지식 상품」 셋(1727:4318)과 같은 지식 · 같은 진행률이어야
    한다(continueSection: 두바이 2/5 · 바나나 4/5 · 양치물 1/5). 홈에서 이어 보라고 한
    지식이 장바구니에서 다르게 나오면 어느 쪽이 맞는지 알 수 없다. 셋 다 카드뉴스다.
  */
  reading("cul-6", ["두바이엔 없는", "두바이 디저트?"], 2),
  reading("banana-radiation", ["바나나도", "아주 조금은", "방사능을 낸다"], 4),
  reading("toothpaste", ["양치물을", "변기통에 뱉으면", "생기는 일"], 1),
];

/**
 * 탭마다 아래 단추가 하는 일.
 *
 * 다 먹은 지식은 여럿 골라 영수증을 뽑는다. 먹는 중인 것은 아직 읽는 중이라
 * 영수증이 아니라 그 지식으로 간다 — 한 번에 한 편만 읽을 수 있으니 하나만
 * 고른다. 전체 탭은 고른 것의 상태를 따른다.
 */
/**
 * 화면의 이름 — 「냉장고」. 앱의 비유는 지식을 넣고 → 먹고 → 영수증을 남기는
 * 것인데 이 화면만 「장바구니」라는 쇼핑 말이라 톤이 끊겼다(기획 피드백).
 * 넣기 · 빼기 · 냉장고에서 — 어디서나 이 표를 쓴다.
 */
export const fridge = {
  /** 화면 이름 — 탭 바의 「내 봉투」와 같은 말(807:3348). 넣기 · 빼기 말도 다 봉투다(사용자 지시) */
  title: "내 봉투",
  put: "내 봉투에 넣기",
  take: "내 봉투에서 빼기",
  putDone: "내 봉투에 넣었어요",
  already: "이미 내 봉투에 있는 지식이에요",
  /** 아무것도 없을 때 */
  empty: "아직 내 봉투에 넣어둔 지식이 없어요",
  /** 탭 바 배지의 읽어 주는 말 */
  badge: (n: number) => `내 봉투에 넣어둔 지식 ${n}개`,
  /** 카드뉴스가 아직 없는 지식(글만 있는 옛 상세)을 누르면 — 못 들어간다(사용자 지시) */
  soon: "카드뉴스를 준비 중인 지식이에요",
} as const;

/** 두 상태가 무엇인지 — 「전체」 탭 밑의 한 줄(기획 피드백: 섞여 있어 알 수 없었다). */
export const stateNote = "먹는 중 = 읽는 중인 지식 · 다 먹음 = 다 읽어서 영수증을 뽑을 수 있는 지식";
/** 「다 먹음」 탭 위의 띠 */
export const doneBanner = "다 먹은 지식만 영수증으로 뽑을 수 있어요";

export const actionLabel = {
  remove: "빼기",
  /** 빼기 전에 한 번 묻는다 — 잘못 눌러도 되돌릴 수 있게. */
  removeAsk: (n: number) => `지식 ${n}개를 내 봉투에서 뺄까요?`,
  removeNote: "뺀 지식은 다시 넣을 수 있어요",
  keep: "그대로 두기",
  removed: (n: number) => `${n}개를 뺐어요`,
  undo: "되돌리기",
  receipt: (n: number) => `다 먹은 지식 ${n}개 영수증 뽑기`,
  /** 좁은 폭(360 미만)에서는 짧게 — 긴 말은 두 줄로 접혔다 */
  receiptShort: (n: number) => `${n}개 영수증 뽑기`,
  /** 다 먹음 탭에서 아직 아무것도 안 골랐을 때 */
  receiptIdle: "영수증 뽑기",
  pickHint: "영수증 뽑을 지식을 골라주세요",
} as const;

/**
 * 분류 알약의 바탕색 — 갈래 색을 채우고 흰 글씨를 얹는다(1446:5186).
 *
 * 「역사 · 음식」처럼 두 마디인데, 색은 앞마디(큰 갈래)가 정한다 — 커뮤니티 ·
 * 메뉴와 같은 표를 보므로 한 갈래는 앱 어디서나 같은 색이다.
 */
export function tagColor(tag: string): string {
  return categoryColors[tag.split(" · ")[0]] ?? categoryColors["전체"];
}

/** 탭마다 개수 앞에 붙는 말 — 「전체 9개 · 먹는 중 3개 · 다 먹음 6개」. 「담은」은 안 쓴다(기획 피드백). */
export const countLabel: Record<(typeof tabs)[number], string> = {
  "전체": "전체",
  "먹는 중": "먹는 중",
  "다 먹음": "다 먹음",
};

/* 「최근순」 단추는 화면에서 뺐다(사용자 지시) — 목록은 그대로 최근 담은 것이 앞이다 */

/**
 * 홈에서 담기 단추로 담은 지식 — 담은 id(`reactionStore.saved`)로 찾는다.
 *
 * 홈의 세 자리가 각자 다른 접두사로 담는다: 점장님 Pick 은 `home-card-`,
 * 오늘의 상품 추천은 `home-pick-`, 뽑기 카드는 `lucky-`. 접두사 뒤가 곧 지식
 * id 라(홈의 지식은 전부 카드뉴스가 있는 것이다) 그 글에서 얼굴과 제목을 만든다
 * — 전에는 홈 카드마다 그림과 제목을 여기 따로 적어 두었다.
 *
 * 커뮤니티 글의 「저장」은 같은 목록에 들어가지만 여기 없다 — 글은 장바구니에
 * 담는 상품이 아니다.
 */

/**
 * 제목을 카드에 들어갈 줄로 자른다 — 카드 안쪽이 100 남짓이라 한 줄에 여덟 자
 * 안팎이다. 띄어쓰기에서 자르고, 세 줄을 넘으면 마지막 줄을 줄임표로 접는다.
 */
function wrapTitle(title: string): string[] {
  const lines: string[] = [];
  let line = "";
  for (const word of title.split(" ")) {
    const next = line ? `${line} ${word}` : word;
    if (next.length > 8 && line) {
      lines.push(line);
      line = word;
    } else line = next;
  }
  if (line) lines.push(line);
  if (lines.length > 3) return [...lines.slice(0, 2), `${lines[2]}…`];
  return lines;
}

/** 장바구니에 담기는 이름의 접두사 — 커뮤니티 글의 저장(맨 id)은 여기 없다. */
const CART_PREFIXES = ["home-card-", "home-pick-", "lucky-", "post-"];

/**
 * 지식 하나를 냉장고 칸으로 — 그 지식의 글에서 만든다. 얼굴은 갈래 그림(topicArt)
 * — 전에는 사진(카드뉴스 첫 장)이었는데 다 먹은 칸들은 그림이라 섞여 보였다
 * (사용자 지시).
 *
 * 갓 들어온 것은 먹는 중 0% 로 선다 — 들어가 보면 본 만큼 오른다(cartStore.opened).
 */
function itemFor(id: string, knowledgeId: string): CartItem | null {
  const post = getKnowledge(knowledgeId);
  if (!post) return null;
  return {
    id,
    tag: tagOf(post),
    title: wrapTitle(post.title),
    art: topicArt(knowledgeId),
    state: "먹는 중",
    progress: 0,
  };
}

/**
 * 담은 id 를 냉장고 칸으로 — 넣기 단추로 넣은 것(reactionStore.saved). 냉장고에
 * 넣는 지식이 아니면(커뮤니티 글의 저장) null.
 */
export function savedItem(id: string): CartItem | null {
  if (!CART_PREFIXES.some((prefix) => id.startsWith(prefix))) return null;
  return itemFor(id, knowledgeIdFor(id));
}

/**
 * 읽은 지식을 냉장고 칸으로 — 코인을 치르고 상세에 들어간 것(cartStore.opened).
 *
 * 넣기 단추를 안 눌렀어도 코인을 내고 먹기 시작한 지식은 내 것이다 — 카드뉴스를
 * 끝까지 봤는데 냉장고에 없으면 어디 갔는지 모른다(사용자 지적). 칸의 이름은
 * 지식 id 그대로라, 처음부터 놓인 것과 같은 규칙으로 빼고(removeFromCart) 찾는다
 * (useCartEntry.shelved).
 */
export function readItem(knowledgeId: string): CartItem | null {
  return itemFor(knowledgeId, knowledgeId);
}
