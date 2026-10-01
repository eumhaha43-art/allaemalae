/**
 * Mock content for the home screen — Figma 846:3503.
 *
 * Swap these for API calls once the backend is wired up; the components only
 * read from these shapes. Types live in `@/types/home`.
 */

import { tagOf } from "@/data/common/knowledge";
import type {
  ContinueItem,
  LuckyCard,
  PickCard,
  Product,
  ProductPick,
  ProductSet,
  QuizStep,
} from "@/types/home";

export type { ContinueItem, LuckyCard, PickCard, Product, ProductPick, ProductSet, QuizStep };

/**
 * 코인은 앱 전체가 한 수를 본다(`state/coinStore`) — 여기가 그 시작값이다.
 *
 * 80 은 회원증 뒷면(1021:10591)과 뽑기 화면(1442:8977)에 적혀 있던 수다.
 * 코인이 바닥난 모습을 보려면 이 수를 1~2 로 낮춘다.
 */
export const user = { name: "길동", coins: 80 } as const;

/**
 * 코인 안내 — 처음 온 사람(김민정)이 홈에 들어서면 한 번 뜨는 팝업(CoinGuide).
 *
 * 이 앱의 지식은 전부 코인을 내고 연다. 그 규칙을 모른 채 들어오면 첫 지식을
 * 여는 자리에서 왜 막히는지 모른다 — 들어서자마자 한 번 일러 준다(사용자
 * 요청). `{coins}` 자리에 그 사람이 들고 시작하는 수가 들어간다.
 *
 * 코인 모으는 길은 잡지식 세트(퀴즈, 3코인)와 출석이다 — 아래 `quizSet` 과
 * MY 출석에 적힌 것과 어긋나면 안 된다.
 */
export const coinGuide = {
  title: "지식은 코인으로 열어요",
  steps: [
    "모든 지식은 하나 여는 데 1코인이 들어요",
    "지금 지갑에 {coins}코인이 있어요 — 머리 왼쪽에 늘 보여요",
    "잡지식 세트 퀴즈를 다 맞히면 3코인, 출석하면 조금씩 쌓여요",
  ],
  note: "무료 코너와 뽑기 쿠폰은 코인 없이도 열려요. 코인을 누르면 회원증에서 자세히 볼 수 있어요.",
  close: "알겠어요",
} as const;

/**
 * 상단 공지 — 856:7933.
 *
 * 새로 들어온 지식은 NEW!, 많이 읽힌 지식은 HOT! 으로 돌아가며 뜬다.
 * 프레임에는 첫 줄만 그려져 있고, 나머지는 같은 형식으로 채운 예시다.
 * id 는 지식 id — 누르면 그 카드뉴스 상세로 간다(전에는 눌러도 아무 일이
 * 없었다, 사용자 지적). 전부 카드뉴스가 있는 지식이다.
 */
export const ticker = {
  items: [
    { id: "toothpaste", badge: "NEW!", text: "양치물을 변기통에 뱉으면 생기는 일" },
    { id: "banana-radiation", badge: "HOT", text: "바나나도 아주 조금은 방사능을 낸다" },
    { id: "torn-bill", badge: "NEW!", text: "지폐 찢어졌을 때 보상 기준" },
    { id: "jeans-blue", badge: "HOT", text: "청바지가 파란색인 이유" },
    { id: "sci-5", badge: "NEW!", text: "금성에서는 하루가 1년보다 길다" },
  ],
} as const;

/** 인사 배너 — 846:3505 */
export const banner = {
  greeting: ["어서오세요!", "알래말래븐 입니다."],
  sub: "새로 들어온 따끈한 지식을 만나보세요!",
  /**
   * 점원 옆에 붙는 작은 안내.
   *
   * 점원은 처음 온 사람에게 저절로 한 번 인사하는데 3초 남짓이라 한눈팔면
   * 지나간다 — 그러고 나면 눌러서 다시 볼 수 있다는 것을 알 길이 없다.
   */
  hint: "터치하면 인사해요!",
} as const;

/**
 * 오늘의 상품 — Today/역사 1727:3985 · Today/사회 1727:4044, 나머지 셋은 Section 2
 * (1906:4467)의 세트. 상품 그림은 우유 1896:2610 · 컵라면 1896:2787 · 커피 1896:3215 ·
 * 초콜릿 1896:3086 · 과자 1896:3326, 추천 줄의 아이콘은 같은 프레임의 Details.
 *
 * 분야마다 상품 셋이 한 벌이고(`id` 는 분야 id), 관심 태그는 설문에서 고른 분야
 * 것만 놓인다 — 김민정은 문화 · 생활, 한상현은 역사 · 사회(personas.ts). 태그를
 * 누르면 진열대가 바뀌고, 상품을 고르면 아래 추천 지식 줄이 바뀐다. 셋째 우유의
 * 「인류 역사상 가장 짧은 전쟁」은 hist-5, 사회의 둘째 · 셋째 컵은 Details/society
 * (1828:3070)의 「소시오패스의 정체」 · 「엥 이것도 범죄?」 — 프레임에 제목만 있어
 * 글은 posts.ts 에 채웠다(사용자 지시). 문화 · 생활 · 과학의 추천은
 * 프레임의 Details 그림(스포츠 · 대중 문화 · 문학 / 생활 · 음식 / 우주 · 자연 · 기술)에
 * 맞는 지식이다 — 생활의 셋째는 프레임대로 「지폐 찢어졌을 때 보상 기준」(생활 · 일상,
 * 사용자 결정 — 사회 · 경제가 아니다)이고 그림은 「31」 달력 스티커(life).
 *
 * 그림 크기는 프레임 그대로다 — 초콜릿(103 × 123)이 가장 크다.
 */
export const today = {
  title: "{name} 님을 위한 오늘의 상품",
  sub: "원하는 상품을 터치하면 추천 지식을 볼 수 있어요",
  sets: [
    {
      id: "history",
      label: "# 역사",
      color: "#008ede",
      size: { w: 95, h: 115 },
      // 고르면 입구가 열린다 — 우유곽이라서(사용자 요청, 시안 1970:3247)
      spout: true,
      products: [
        {
          id: "milk1",
          label: "우유 1",
          art: "/assets/home/milk1-off.svg",
          artOn: "/assets/home/milk1-on.svg",
          pick: {
            id: "tootsie-roll",
            title: "한국전쟁 속 투시롤의 뜻밖의 쓰임",
            tag: tagOf("tootsie-roll"),
          },
        },
        {
          id: "milk2",
          label: "우유 2",
          art: "/assets/home/milk2-off.svg",
          artOn: "/assets/home/milk2-on.svg",
          pick: {
            id: "king",
            title: "세종대왕은 혼자 한글을 만들었을까?",
            tag: tagOf("king"),
          },
        },
        {
          id: "milk3",
          label: "우유 3",
          art: "/assets/home/milk3-off.svg",
          artOn: "/assets/home/milk3-on.svg",
          pick: {
            id: "hist-5",
            title: "인류 역사상 가장 짧은 전쟁",
            tag: tagOf("hist-5"),
          },
        },
      ],
    },
    {
      id: "society",
      label: "# 사회",
      color: "#f9b208",
      size: { w: 93.6, h: 117.25 },
      // 뚜껑이 닫혀 있다가(1960:2276) 고르면 그림처럼 뜯겨 열린다 — 컵라면이라서(사용자 요청)
      lid: true,
      products: [
        {
          id: "cup1",
          label: "컵라면 1",
          art: "/assets/home/cup1-off.svg",
          artOn: "/assets/home/cup1-on.svg",
          pick: {
            id: "conformity",
            title: "왜 우리는 남들이 고른 걸 따라갈까?",
            tag: tagOf("conformity"),
          },
        },
        {
          id: "cup2",
          label: "컵라면 2",
          art: "/assets/home/cup2-off.svg",
          artOn: "/assets/home/cup2-on.svg",
          pick: {
            id: "sociopath",
            title: "당신이 몰랐던 소시오패스의 정체",
            tag: tagOf("sociopath"),
          },
        },
        {
          id: "cup3",
          label: "컵라면 3",
          art: "/assets/home/cup3-off.svg",
          artOn: "/assets/home/cup3-on.svg",
          pick: {
            id: "petty-crime",
            title: "엥 이것도 범죄?",
            tag: tagOf("petty-crime"),
          },
        },
      ],
    },
    {
      id: "culture",
      label: "# 문화",
      color: "#7c73e6",
      size: { w: 90, h: 108 },
      // 고르면 김이 피어오른다 — 커피라서(사용자 요청, 시안 1970:3261)
      steam: true,
      products: [
        {
          id: "coffee1",
          label: "커피 1",
          art: "/assets/home/coffee1-off.svg",
          artOn: "/assets/home/coffee1-on.svg",
          pick: {
            id: "cul-2",
            title: "세계에서 가장 무서운 종이 두 장",
            tag: tagOf("cul-2"),
          },
        },
        {
          id: "coffee2",
          label: "커피 2",
          art: "/assets/home/coffee2-off.svg",
          artOn: "/assets/home/coffee2-on.svg",
          pick: {
            id: "cul-6",
            title: "두바이엔 없는 두바이 디저트?",
            tag: tagOf("cul-6"),
          },
        },
        {
          id: "coffee3",
          label: "커피 3",
          art: "/assets/home/coffee3-off.svg",
          artOn: "/assets/home/coffee3-on.svg",
          pick: {
            id: "cul-4",
            title: "누가 책갈피 얻으려고 오픈런해요",
            tag: tagOf("cul-4"),
          },
        },
      ],
    },
    {
      id: "life",
      label: "# 생활",
      color: "#ff77b7",
      size: { w: 103, h: 123 },
      // 고르면 한 입 베어 문다 — 초콜릿이라서(사용자 요청)
      bite: true,
      products: [
        {
          id: "choco1",
          label: "초콜릿 1",
          art: "/assets/home/choco1-off.svg",
          artOn: "/assets/home/choco1-on.svg",
          pick: {
            id: "toothpaste",
            title: "양치물을 변기통에 뱉으면 생기는 일",
            tag: tagOf("toothpaste"),
          },
        },
        {
          id: "choco2",
          label: "초콜릿 2",
          art: "/assets/home/choco2-off.svg",
          artOn: "/assets/home/choco2-on.svg",
          pick: {
            id: "hangover-food",
            title: "음주 전 먹어야 할 식품",
            tag: tagOf("hangover-food"),
          },
        },
        {
          id: "choco3",
          label: "초콜릿 3",
          art: "/assets/home/choco3-off.svg",
          artOn: "/assets/home/choco3-on.svg",
          pick: {
            id: "torn-bill",
            title: "지폐 찢어졌을 때 보상 기준",
            tag: tagOf("torn-bill"),
          },
        },
      ],
    },
    {
      id: "science",
      label: "# 과학",
      // 고르면 윗입구가 뜯긴다 — 과자 봉지라서(사용자 요청)
      tear: true,
      color: "#728627",
      size: { w: 91, h: 107 },
      products: [
        {
          id: "snack1",
          label: "과자 1",
          art: "/assets/home/snack1-off.svg",
          artOn: "/assets/home/snack1-on.svg",
          pick: {
            id: "sci-5",
            title: "금성에서는 하루가 1년보다 길다",
            tag: tagOf("sci-5"),
          },
        },
        {
          id: "snack2",
          label: "과자 2",
          art: "/assets/home/snack2-off.svg",
          artOn: "/assets/home/snack2-on.svg",
          pick: {
            id: "banana-radiation",
            title: "바나나도 아주 조금은 방사능을 낸다",
            tag: tagOf("banana-radiation"),
          },
        },
        {
          id: "snack3",
          label: "과자 3",
          art: "/assets/home/snack3-off.svg",
          artOn: "/assets/home/snack3-on.svg",
          pick: {
            id: "bug",
            title: "컴퓨터 ‘버그’는 진짜 벌레였다",
            tag: tagOf("bug"),
          },
        },
      ],
    },
  ] as ProductSet[],
} as const;

/** 잡지식 세트 — 846:3600 */
export const quizSet = {
  title: "잡지식 세트",
  sub: "모두 읽고 퀴즈를 풀면 3코인을 받을 수 있어요",
  cta: "퀴즈 풀러가기",
  /** 다 풀면 받는 코인 — 위 `sub` 에 적힌 수와 같아야 한다. */
  reward: 3,
  /** 다 풀고 나온 뒤 — 다음 세트가 열릴 때까지 보여 주는 자리. */
  solved: "일주일 후에 리셋돼요",
  steps: [
    { n: 1, text: "조선시대에도 ‘가짜 족보’가 거래됐다", state: "done" },
    { n: 2, text: "중세 유럽에서는 동물을 실제로 재판에 세웠다", state: "current" },
    { n: 3, text: "태종은 세종이 상중에도 고기를 먹도록 유언을 남겼다?", state: "todo" },
  ] as QuizStep[],
} as const;

/**
 * 점장님 Pick! — 856:8053. 가운데 온 카드가 커진다.
 *
 * 여섯 장 다 카드뉴스 상세가 있는 지식이다(사용자 결정 — 홈의 지식은 실제 상세가
 * 있는 것만). id 가 곧 지식 id 라 누르면 그 상세로 가고, 담기는 `home-card-<id>`
 * 로 담겨 같은 지식으로 읽힌다. 청바지는 디자이너가 이 자리의 상세를 「홈-점장 픽
 * 광고1」(1693:1293)로 그린 「청바지가 파란색인 이유」, 민음사는 「홈-점장 픽 광고 2」
 * (1731:2758)의 「누가 책갈피 얻으려고 오픈런해요」다 — 둘 다 광고라 ad 에 광고주를
 * 적는다. 광고 카드에는 「AD」 표와 「광고 · 누구」 줄이 붙어 다른 카드와 구별된다
 * (사용자 요청). 카드 색은 프레임의 여섯 그대로고, 상자 그림도 카드뉴스 첫 장이
 * 아니라 아이콘이다(사용자 결정) — 지식에 어울리는 것을 고른다.
 */
/**
 * 점장님 Pick — 856:8053. 카드 밑 그림은 그 지식 카드뉴스의 첫 장이라 여기 따로
 * 적지 않는다(PickBox 가 id 로 찾는다). id 는 전부 카드뉴스가 있는 지식이다.
 */
export const pick = {
  title: "점장님",
  accent: "Pick!",
  /** 광고 카드의 표와 줄 */
  adBadge: "AD",
  adBy: (by: string) => `광고 · ${by}`,
  cards: [
    {
      id: "king",
      tag: tagOf("king"),
      title: ["세종대왕은 정말 혼자서", "한글을 만들었을까?"],
      color: "#008ede",
      wide: true,
    },
    {
      id: "cul-2",
      tag: tagOf("cul-2"),
      title: ["세계에서 가장", "무서운 종이 두 장"],
      color: "#968feb",
    },
    {
      id: "jeans-blue",
      tag: tagOf("jeans-blue"),
      title: ["청바지가 파란색인", "이유는 식물 때문이다?"],
      color: "#ff77b7",
      // 「1분 생활 상식」(교보문고) 책 광고 — 마지막 장이 책 광고다
      ad: "교보문고",
    },
    {
      id: "torn-bill",
      tag: tagOf("torn-bill"),
      title: ["지폐 찢어졌을 때", "보상 기준은?"],
      color: "#ff77b7",
    },
    {
      id: "cul-4",
      tag: tagOf("cul-4"),
      title: ["누가 책갈피 얻으려고", "오픈런해요"],
      // 문화 — cul-2 와 같은 보라
      color: "#968feb",
      // 민음사 · GS25 세계문학전집 빵 광고(1731:2758)
      ad: "민음사",
    },
    {
      id: "banana-radiation",
      tag: tagOf("banana-radiation"),
      title: ["바나나도 아주 조금은", "방사능을 낸다"],
      color: "#728627",
    },
    {
      id: "bug",
      tag: tagOf("bug"),
      title: ["컴퓨터 ‘버그’는", "진짜 벌레였다"],
      // 과학 — 갈래 색(categoryColors 과학 · 올리브). 전에는 갈래에 없는 적갈색이었다(사용자 지적)
      color: "#728627",
    },
  ] as PickCard[],
} as const;

/** 24시간 한정 지식 — 846:3624 */
export const free = {
  label: "오늘 밤 12시까지 무료!",
  /** 지식 id — 「지금 읽기」가 이 상세로 간다. 카드뉴스가 있는 지식. */
  id: "cul-4",
  title: ["누가 책갈피 얻으려고", "오픈런해요"],
  /** 여기서부터 1초씩 줄어든다. */
  remaining: "08:41:05",
  /** 「12시간 55분 남음」 — 시:분:초에 「초 남음」이 붙어 있었다(감수 지적) */
  unit: "남음",
  cta: "지금 읽기",
} as const;

/** 뽑기 기계(/gacha)로 가는 카드 — 랜덤 지식깡 밑. 지식깡과 다른 뽑기라 따로 잇는다. */
export const machine = {
  title: "뽑기 기계에서 스티커팩까지",
  coupon: (n: number) => `블랙카드 무료 쿠폰 ${n}장이 기다려요`,
  coin: "한 판 1코인 · 레버로 공을 집어요",
  go: "뽑으러 가기",
} as const;

/**
 * 랜덤 지식깡 — 846:3770. 뽑는 연출은 856:8268(노란 봉지) · 856:8474(카드).
 *
 * 보유 코인은 뽑을 때마다 줄어서 화면 쪽 상태다 — 여기에는 붙이는 말만 둔다.
 */
export const lucky = {
  title: "랜덤 지식깡 뽑기",
  sub: "버튼을 누르면 랜덤으로 지식카드 하나가 나와요",
  costLabel: "한 번 뽑을 때",
  /** 단위는 어디서나 「코인」 — coin · C 로 갈려 있었다(감수 지적) */
  cost: "-1코인",
  ownedLabel: "보유",
  cta: "카드 뽑기",
  /** 봉지가 도는 동안 — 누를 수 없다는 뜻으로 문구를 바꾼다. */
  drawing: "뽑는 중...",
  opened: "새 지식이 나왔어요!",
  again: "다시 뽑기",
  close: "닫기",
  /** 코인이 0 이면 뽑기 단추가 이 문구로 잠긴다. */
  broke: "코인이 부족해요",
  /**
   * 뽑기 통 — 856:8474 안에 들어갈 카드뉴스.
   *
   * 한 번 뽑을 때 이 중 하나가 나온다. 바로 앞에 나온 카드는 빼고 고르므로
   * 같은 카드가 연달아 나오지 않는다.
   */
  cards: [
    {
      id: "hangover-food",
      tag: tagOf("hangover-food"),
      title: ["음주 전", "먹어야 할 식품"],
      color: "#ff77b7",
      art: "food",
    },
    {
      id: "tootsie-roll",
      tag: tagOf("tootsie-roll"),
      title: ["한국전쟁 속", "투시롤의", "뜻밖의 쓰임"],
      color: "#728627",
      art: "history",
    },
    {
      id: "conformity",
      tag: tagOf("conformity"),
      title: ["왜 우리는 남들이", "고른 걸", "따라갈까?"],
      color: "#008ede",
      art: "society",
    },
    {
      id: "sci-5",
      tag: tagOf("sci-5"),
      title: ["금성에서는 하루가", "1년보다 길다"],
      color: "#33a5e5",
      art: "universe",
    },
    {
      id: "toothpaste",
      tag: tagOf("toothpaste"),
      title: ["양치물을 변기통에", "뱉으면 생기는 일"],
      color: "#8f332e",
      art: "life",
    },
    {
      id: "cul-6",
      tag: tagOf("cul-6"),
      title: ["두바이엔 없는", "두바이 디저트?"],
      color: "#f9b208",
      art: "culture",
    },
  ] as LuckyCard[],
} as const;

/**
 * 남겨둔 지식 상품 — section3 1727:4318.
 *
 * 장바구니의 먹는 중 셋(`cart.ts`)과 같은 지식 · 같은 진행률이어야 한다 — 「본 장 수
 * / 카드 수」다(두바이 2/5 · 바나나 4/5 · 양치물 1/5). 프레임의 32 · 79 · 27 은 자리
 * 표시라 실제 계산값으로 둔다. 바꾸면 저쪽도 같이.
 */
export const continueSection = {
  title: "남겨둔 지식 상품",
  sub: "{name} 님이 아직 다 읽지 못한 지식을 이어보세요!",
  /** 오늘 막 가입한 사람 — 읽다 만 것이 아직 없다. 그림 아래 한 줄, 메뉴로 보낸다(2095:2760). */
  empty: {
    title: "아직 읽다 만 지식이 없어요",
    go: "지식 고르러 가기",
  },
  items: [
    {
      id: "cul-6",
      type: tagOf("cul-6"),
      title: "두바이엔 없는 두바이 디저트?",
      date: "07/31",
      color: "#968feb",
      art: "lang",
      progress: 40,
    },
    {
      id: "banana-radiation",
      type: tagOf("banana-radiation"),
      title: "바나나도 아주 조금은 방사능을 낸다",
      date: "08/17",
      color: "#abc64b",
      art: "nature",
      progress: 80,
    },
    {
      id: "toothpaste",
      type: tagOf("toothpaste"),
      title: "양치물을 변기통에 뱉으면 생기는 일",
      date: "08/28",
      color: "#ff77b7",
      art: "life",
      progress: 20,
    },
  ] as ContinueItem[],
} as const;

/**
 * 하단 탭 — 807:3348(2026-09-18 디자이너가 차례 · 여백을 고친 것). 차례는 이 배열
 * 차례 그대로다: 냉장고 · 기록 · 홈(가운데) · 커뮤니티 · 메뉴.
 *
 * 탭마다 30x30 자리를 잡지만 아이콘 자체 크기는 다르다 — 홈 30(집은 그 안에
 * 20 남짓), 기록 · 커뮤니티 24, 메뉴 22x18, 냉장고 22. 늘려 그리면 안 된다.
 *
 * 아이콘 색은 SVG 안에 박혀 있어 CSS 로 못 바꾼다. 같은 그림의 색만 바꾼 짝을
 * 따로 만들어 둔다 — 켜짐(iconOn)은 흰 선(진한 초록 판 위에 선다, BottomNav 의
 * .tab-pill), 꺼짐은 gray-500(프레임의 #b9baba 는 너무 옅어 못 누르는 탭으로
 * 보였다, 사용자 지적).
 *
 * 첫 탭은 「내 봉투」(807:3348 · 2015:7533 「bag」, 2026-09-18) — 장바구니 → 냉장고
 * (기획 피드백, b126e17) → 봉투(디자이너)로 왔다. 그림은 NavBag 이 그린다(담으면
 * 봉투가 받는 움직임) — 여기 icon 은 다른 곳이 같은 그림을 찾을 때 쓴다.
 */
export const navItems = [
  {
    id: "cart",
    label: "내 봉투",
    icon: "/assets/home/nav-bag.svg",
    iconOn: "/assets/home/nav-bag-on.svg",
    // 봉투 그림(15 × 20)은 20 판에 가운데 두어 22 로 그린다 — 옆 아이콘(24)과 키가 맞는다
    w: 22,
    h: 22,
    href: "/cart",
  },
  {
    id: "record",
    label: "영수증",
    icon: "/assets/home/nav-record.svg",
    iconOn: "/assets/home/nav-record-on.svg",
    w: 24,
    h: 24,
    href: "/record",
  },
  {
    id: "home",
    label: "홈",
    icon: "/assets/home/nav-home-off.svg",
    iconOn: "/assets/home/nav-home.svg",
    w: 30,
    h: 30,
    href: "/",
  },
  {
    id: "community",
    label: "커뮤니티",
    icon: "/assets/home/nav-community.svg",
    iconOn: "/assets/home/nav-community-on.svg",
    w: 24,
    h: 24,
    href: "/community",
  },
  {
    // 프레임대로 헤더의 햄버거(22x18)와 같은 그림 — 색만 탭 색으로 바꾼 짝
    id: "menu",
    label: "메뉴",
    icon: "/assets/home/nav-menu.svg",
    iconOn: "/assets/home/nav-menu-on.svg",
    w: 22,
    h: 18,
    href: "/menu",
  },
] as const;
