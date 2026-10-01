/**
 * 햄버거 메뉴 — Figma 965:5444.
 *
 * 분야 색은 커뮤니티 카테고리와 같은 표를 본다 — 여기서 값을 새로 박으면
 * 한쪽만 바뀌어 어긋난다.
 */

import { categoryColors, type Post } from "@/data/common/community";
import type { Field } from "@/types/menu";

/**
 * 다섯 갈래와 그 아래 소분류 — 앱의 갈래 표는 이것 하나다. 온보딩의 관심사
 * 고르기(survey.ts)도 이것을 그대로 쓴다. 전에는 두 곳이 따로 적혀 있어 사회의
 * 소분류가 서로 달랐고, 과학 밑에 「사회」가 끼어 있었다(감수 지적). 소분류는
 * 글 데이터(posts.ts)에 실제로 쓰인 topic 과 맞춘다.
 */
export const fields: Field[] = [
  /*
    bg 는 피그마 SubColor 토큰의 500 — Yellow #F9B208 · Blue #33A5E5 · Olive #8B9C4C 는
    변수로 확인한 값. Purple · Pink 는 파일에서 500 이 쓰인 자리를 못 찾아 600 과 400 의
    가운데(#968FEB) · 생활 그림의 중간 톤(#FF92C5)으로 잡았다 — 피그마의 Pink/600 은
    #FF77B7, Purple/600 은 #7C73E6 으로 globals.css 의 pink-600 · purple-600 과 다르다.
  */
  { id: "society", name: "사회", sub: "경제 / 정치 / 법률 / 심리학", color: categoryColors["사회"], bg: "#f9b208", icon: "/assets/menu/field-society.svg", product: "/assets/home/cup1-on.svg" },
  { id: "history", name: "역사", sub: "한국사 / 세계사 / 인물, 사건", color: categoryColors["역사"], bg: "#33a5e5", icon: "/assets/menu/field-history.svg", product: "/assets/home/milk1-on.svg" },
  { id: "science", name: "과학", sub: "기술 / 자연 / 동물 / 우주", color: categoryColors["과학"], bg: "#8b9c4c", icon: "/assets/menu/field-science.svg", product: "/assets/home/snack1-on.svg" },
  { id: "culture", name: "문화", sub: "예술 / 문학 / 스포츠 / 대중 / 언어", color: categoryColors["문화"], bg: "#968feb", icon: "/assets/menu/field-culture.svg", product: "/assets/home/coffee1-on.svg" },
  { id: "life", name: "생활", sub: "건강 / 음식 / 일상", color: categoryColors["생활"], bg: "#ff92c5", icon: "/assets/menu/field-life.svg", product: "/assets/home/choco1-on.svg" },
];

/**
 * 분야 id → 커뮤니티 갈래 이름(글 데이터의 category). 지식 목록 화면이 글을
 * 이것으로 거른다.
 */
export const fieldCategory: Record<string, string> = {
  society: "사회",
  history: "역사",
  science: "과학",
  culture: "문화",
  life: "생활",
};

export const fieldById = (id: string): Field | undefined => fields.find((f) => f.id === id);

/**
 * 지식 목록 위 칩 줄의 차례 — 1549:1481. 메뉴의 분야 카드 차례와 다르다.
 * 이름은 글 데이터의 갈래 이름(fieldCategory)을 쓴다.
 */
export const chipOrder = ["all", "history", "science", "life", "society", "culture"] as const;

/**
 * 열려 있는 지식 — 카드뉴스 상세가 있는 것만. 목록에서 이것만 눌리고 위에 오며,
 * 나머지는 흐리게 잠긴다(사용자 결정 — 못 만든 것을 눌러 옛 화면이 열리게 두지
 * 않는다). 전에는 분야마다 id 를 손으로 적어 두었는데(과학 셋 · 문화 셋), 디자이너가
 * 카드뉴스를 그리는 대로 늘어나므로 카드가 있느냐로 본다 — 데이터에 카드를 붙이면
 * 그 자리에서 열린다.
 *
 * 분야 목록 · 관련 지식 추천 · 냉장고가 이것으로 잠근다 — 냉장고는 눌러도
 * 「준비 중」이라고만 한다(사용자 지시: 글만 있는 옛 상세로는 못 들어가게).
 */
export function isReadyKnowledge(post: Pick<Post, "cards">): boolean {
  return Boolean(post.cards?.length);
}

/**
 * 관련 지식 — 정말로 이어지는 것부터 셋.
 *
 * 같은 세부 갈래(+3) · 겹치는 태그(하나에 +2) · 같은 분야(+1) 로 점수를 매겨
 * 높은 것부터 고른다. 열려 있는지는 안 본다 — 열린 것만 고르면 「관련」이
 * 아니라 「있는 것」이 되어 버린다(사용자 지적). 잠긴 것은 보여 주되 누르면
 * 「준비 중」이라고만 한다(RelatedKnowledge).
 */
export function relatedKnowledge(post: Post, pool: Post[], count = 3): Post[] {
  const tags = new Set(post.tags ?? []);
  const score = (other: Post) =>
    (other.topic && other.topic === post.topic ? 3 : 0) +
    (other.tags ?? []).filter((tag) => tags.has(tag)).length * 2 +
    (other.category === post.category ? 1 : 0);
  return pool
    .filter((other) => other.id !== post.id)
    .map((other, at) => ({ other, at, score: score(other) }))
    .filter((one) => one.score > 0)
    // 점수가 같으면 원래 차례 — sort 가 안정적이어도 뜻을 적어 둔다
    .sort((a, b) => b.score - a.score || a.at - b.at)
    .slice(0, count)
    .map((one) => one.other);
}

export type TopicIcon = { src: string; width: number; height: number };

/**
 * 지식의 검은 네모(60)에 들어가는 세부 갈래 그림 — 「분야 · 소분류」 → 그림.
 * 지식 목록(KnowledgeList)과 홈 매대 추천 카드(RecommendSection PickRow)가 이
 * 표 하나를 본다 — 같은 지식은 어디서나 같은 그림이다(감수 지적: 전에는 홈이
 * 따로 표를 들고 있어 목록에서는 분야 그림으로 떨어졌다).
 *
 * 그림은 시안의 Details 묶음(1906:4467 · 1828:3070)과 지식 목록(1549:1341)에서
 * 온 것이고, 시안에 없는 소분류는 앱에 있던 그림으로 임시로 채웠다(감수 결정).
 * 크기는 그림마다 달라 같이 적는다(네모 안 가운데). 표에 없는 소분류는
 * topicIconOf 가 분야 그림(흰색 24)으로 떨어뜨린다.
 */
export const topicIcons: Record<string, TopicIcon> = {
  // 역사 — 태극은 Today/history 카드, 지구본 · 돋보기는 우유 3 · 2 의 스티커
  "역사 · 한국사": { src: "/assets/home/pick-history.svg", width: 35, height: 27.168 },
  "역사 · 세계사": { src: "/assets/home/pick-globe.svg", width: 26, height: 36 },
  "역사 · 인물, 사건": { src: "/assets/home/pick-magnifier.svg", width: 24, height: 24 },
  // 사회 — Details/society. 가격표는 점장님 Pick 의 그림(PNG)
  "사회 · 심리학": { src: "/assets/category/psychology.svg", width: 26, height: 32 },
  "사회 · 법률": { src: "/assets/category/law.svg", width: 37, height: 21 },
  "사회 · 경제": { src: "/assets/home/pick-price.png", width: 40, height: 33 },
  // 사회 · 정치 — 미정(디자이너 요청 중) → 분야 그림
  // 문화 — Details/culture. 언어는 남겨둔 지식의 말풍선
  "문화 · 스포츠": { src: "/assets/category/sports.svg", width: 33, height: 16 },
  "문화 · 대중 문화": { src: "/assets/category/pop-culture.svg", width: 28, height: 28 },
  "문화 · 문학": { src: "/assets/category/literature.svg", width: 32, height: 26 },
  "문화 · 언어": { src: "/assets/home/cat-lang.svg", width: 32, height: 26 },
  // 문화 · 예술 — 미정(디자이너 요청 중) → 분야 그림
  // 생활 — Details/life. 건강은 냉장고의 뇌 그림
  "생활 · 일상": { src: "/assets/category/daily.svg", width: 23, height: 26 },
  "생활 · 음식": { src: "/assets/category/food.svg", width: 37, height: 26 },
  "생활 · 건강": { src: "/assets/home/brain.svg", width: 40, height: 31.6 },
  // 과학 — 1549:1341 · Details/science
  "과학 · 우주": { src: "/assets/category/universe.svg", width: 40, height: 23 },
  "과학 · 자연": { src: "/assets/category/nature.svg", width: 34, height: 26 },
  "과학 · 기술": { src: "/assets/category/technology.svg", width: 34, height: 29 },
  "과학 · 동물": { src: "/assets/category/animal.svg", width: 30, height: 30 },
};

/** 표에 없으면 분야 그림(흰색 24) — 정치 · 예술이 지금 이것을 탄다. */
export function topicIconOf(category: string, topic?: string): TopicIcon {
  const own = topic ? topicIcons[`${category} · ${topic}`] : undefined;
  if (own) return own;
  const field = fields.find((f) => fieldCategory[f.id] === category);
  return { src: field?.icon ?? "/assets/menu/field-science.svg", width: 24, height: 24 };
}

/** 지식 목록 화면의 문구 — 440:74 · 440:151 */
export const knowledgeCopy = {
  all: "전체",
  search: "검색",
  filter: "필터",
  share: "공유",
  source: "출처",
  sourceGo: "링크 이동",
  related: "관련 지식 추천",
  /** 봇의 이름으로 — 「AI에게」와 「알래봇」이 같은 것인지 몰랐다(감수 지적) */
  ask: "알래봇에게 물어보기",
  cart: "내 봉투에 넣기",
  carted: "넣음",
  empty: "아직 이 분야의 지식이 없어요",
  /** 카드뉴스 끝의 초록 카드 — 1632:7903. 「영수증」만 굵다. */
  recordCard: { line1: "다 먹은 잡지식을", strong: "영수증", line2: "에 기록하세요!", go: "기록하러 가기" },
  linkCopied: "링크를 복사했어요",
  linkFailed: "링크를 복사하지 못했어요",
  /** 아직 상세가 없는 관련 지식을 눌렀을 때 — 잠깐 떴다 사라진다(토스트). */
  soon: "준비 중입니다",
} as const;

/** MY 탭의 설정 줄 — Figma 965:5630. 「알림 설정」만 진짜 화면(판)이 있고 나머지는 준비 중. */
export const myLinks = [
  "내 정보 수정",
  "멤버십 변경",
  "회원등급 안내",
  "알림 설정",
  "고객센터",
  "약관 및 정책",
] as const;

/** 「은/는」 — 마지막 글자에 받침이 있으면 은, 없으면 는. 한글이 아니면 는. */
const topic = (word: string) => {
  const code = word.charCodeAt(word.length - 1) - 0xac00;
  return code >= 0 && code < 11172 && code % 28 !== 0 ? "은" : "는";
};

export const myLinksCopy = {
  soon: (what: string) => `${what}${topic(what)} 준비 중이에요`,
  alarmTitle: "알림 시간",
  alarmNote: "하루 한 번, 고른 시간대에 오늘의 지식을 알려 드려요",
  alarmOff: "받지 않음",
  alarmSaved: (when: string) => `알림 시간을 ${when}으로 바꿨어요`,
} as const;

/** 메뉴 위쪽 프로필 — 지금은 MY 화면의 회원증과 같은 사람이다. */
export const profile = { name: "홍길동", tier: "BLACK CARD" } as const;

/**
 * 코인 안내 — 지식은 공짜가 아니다.
 *
 * 지식 하나를 여는 데 1코인이 든다는 것을, 고르기 **전에** 알려야 한다. 다
 * 읽고 나서 「코인이 빠졌네」를 알게 되면 속은 기분이 든다. 그래서 목록과
 * 상세 양쪽에, 누르기 전에 눈에 드는 자리에 같은 문장을 둔다.
 *
 * 보유 수를 문장 옆에 같이 적는 것은 「그래서 내가 몇 개나 열 수 있는데」가
 * 바로 따라오는 물음이기 때문이다 — 값만 알려 주고 지갑은 안 보여 주면
 * 머리(헤더)로 눈을 올렸다 내려야 한다.
 */
export const coinCopy = {
  note: "지식 하나를 여는 데 1코인이 들어요",
  broke: "코인이 없어요 — 출석하거나 뽑기로 모아 보세요",
  /** 상세에 들어가며 치렀을 때 — 남은 수까지 말해야 줄어든 줄 안다. */
  spent: (left: number) => `코인 1개를 썼어요 · 남은 ${left}개`,
  /** 코인 없이 상세에 들어왔을 때 본문 자리에 놓는 말. */
  locked: "지식을 열려면 코인 1개가 필요해요",
  owned: "보유",
  unit: "개",
  /** 헤더의 코인을 눌렀을 때 읽어 줄 이름. */
  aria: "보유 코인",
} as const;
