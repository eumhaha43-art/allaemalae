/** 홈 도메인 타입 — Figma 846:3503. 데이터는 `@/data/common/home`. */

/**
 * 관심 분야 하나의 진열대 — Today/역사 1727:3985 · Today/사회 1727:4044 와
 * Section 2 (1906:4467) 의 나머지 세트.
 *
 * 위의 관심 태그를 누르면 진열대가 통째로 바뀐다 — 역사는 우유 셋, 사회는
 * 컵라면 셋, 문화는 커피, 생활은 초콜릿, 과학은 과자. 태그는 설문에서 고른
 * 분야만 놓인다(surveyStore). 태그 색은 그 분야의 갈래 색이다.
 */
export type ProductSet = {
  /** 분야 id — `menu.ts` fields 와 같다(설문의 관심사 id). */
  id: string;
  label: string;
  /** 켜진 태그의 색 */
  color: string;
  /**
   * 상품 그림 한 장의 크기 — 프레임 그대로(우유 95 × 115 · 컵라면 93.6 × 117.25 ·
   * 커피 90 × 108 · 초콜릿 103 × 123 · 과자 91 × 107). 폭이 모자라면 진열대가
   * 다섯 세트를 같은 배율로 줄인다(RecommendSection).
   */
  size: { w: number; h: number };
  /** 고른 상품의 오른쪽 위를 한 입 베어 문 자국을 낼지 — 초콜릿(생활)만. */
  bite?: boolean;
  /** 고르면 지붕 왼쪽 입구가 열릴지 — 우유(역사)만(MilkSpout, 시안 1970:3247). */
  spout?: boolean;
  /** 뚜껑을 닫아 두었다가 고르면 뜯어 열지 — 컵라면(사회)만(CupLid). */
  lid?: boolean;
  /** 고르면 김이 피어오를지 — 커피(문화)만(CoffeeSteam). */
  steam?: boolean;
  /** 위 봉한 띠를 뜯어 열지 — 과자 봉지(과학)만(SnackTear). */
  tear?: boolean;
  products: Product[];
};

/**
 * 오늘의 상품 진열대에 놓인 상품 하나 — 856:8361.
 *
 * 고른 상품만 컬러로 켜지고 나머지는 회색이며, 아래 추천 지식 줄도 고른
 * 상품 것으로 바뀐다 — 856:8320 / 856:8341.
 */
export type Product = {
  id: string;
  label: string;
  /** 안 고른 상태(회색) */
  art: string;
  /** 고른 상태(컬러) */
  artOn: string;
  pick: ProductPick;
};

/** 진열대 밑에 붙는 추천 지식 한 줄 — 856:8320. */
export type ProductPick = {
  /** 지식 id — 누르면 그 상세로 가고, 담기도 이 이름으로 담긴다. 카드뉴스가 있는 지식만. */
  id: string;
  title: string;
  tag: string;
  /** 왼쪽 검은 상자 안 그림은 따로 적지 않는다 — 지식의 분야 · 소분류가 정한다(menu.ts topicIcons). */
};

/** 잡지식 세트의 퀴즈 한 줄. 상태에 따라 칠, 테두리, 회색으로 나뉜다 — 846:3607. */
export type QuizStep = {
  n: number;
  text: string;
  state: "done" | "current" | "todo";
};

/** 점장님 Pick 카드 — 846:3647. 첫 장이 크고 나머지는 옆으로 이어진다. */
export type PickCard = {
  id: string;
  tag: string;
  title: string[];
  /** 카드 바탕색 */
  color: string;
  /** 큰 카드(240x310)인지 */
  wide?: boolean;
  /** 광고면 광고주 — 「AD」 표와 「광고 · 누구」 줄이 붙는다(PickBox) */
  ad?: string;
};

/**
 * 랜덤 지식깡에서 나오는 카드 한 장 — 856:8474.
 *
 * 프레임은 120x180 흰 카드 한 장뿐이고 안은 비어 있다("추가 예정"). 카드뉴스가
 * 들어갈 자리라 홈의 다른 카드와 같은 짜임으로 채웠다 — 분류 배지 · 제목 ·
 * 검은 그림 상자.
 */
export type LuckyCard = {
  id: string;
  tag: string;
  /**
   * 줄바꿈을 직접 나눈 제목.
   *
   * 카드 안쪽 폭이 100px 뿐이라 브라우저에 맡기면 어디서 끊길지 모른다.
   * 한 줄에 9자까지만 쓴다.
   */
  title: string[];
  /** 분류 배지 색 */
  color: string;
  /** 검은 상자 안 그림 */
  art: LuckyArt;
};

export type LuckyArt =
  | "lang"
  | "nature"
  | "jeans"
  | "ice"
  | "food"
  | "king"
  | "life"
  | "history"
  | "society"
  | "universe"
  | "culture";

/** 남겨둔 지식 상품 — 846:3717. */
export type ContinueItem = {
  id: string;
  type: string;
  title: string;
  date: string;
  color: string;
  /** 검은 상자 안 그림. 분류 그림이 기본이고, 주제 전용 그림이 있으면 그것을 쓴다. */
  art: "lang" | "life" | "jeans" | "ice" | "nature" | "culture" | "history" | "society";
  /** 0 ~ 100 */
  progress: number;
};
