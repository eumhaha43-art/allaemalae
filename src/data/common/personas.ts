/**
 * 시연용 퍼소나 — `docs/00_프로젝트_입력정보.md` 의 퍼소나 A · B.
 *
 * 기획 문서(Figma `SB77jDRNhgLomD8ptTAIEv` node `203:52`)에 정해진 것은 이 둘
 * 뿐이다. 문서에 임시로 적어 둔 퍼소나 C 는 「교체 필요」로 표시되어 있어 여기
 * 넣지 않는다 — 확정되면 한 칸 더 붙이면 된다.
 *
 * 고르는 것이 곧 로그인을 대신한다. 나중에 로그인 화면이 붙으면, 그 화면이
 * 여기 대신 `personaStore` 에 사람을 앉히면 된다.
 */

import type { Persona } from "@/types/persona";

export type { Persona };

/**
 * 내 프로필 사진 — 회원증 뒷면에 붙은 사진과 같은 파일이다. 메뉴 위 프로필,
 * 내가 쓴 글과 댓글의 얼굴이 전부 이것을 쓴다 — 자리마다 다른 얼굴이면 같은
 * 사람인지 모른다.
 */
export const MY_AVATAR = "/assets/my/card-photo.png";

export const personas: Persona[] = [
  {
    id: "minjeong",
    name: "김민정",
    tag: "신규 가입",
    line: "처음 시작하는 기록형 수집가",
    fresh: true,
    tier: "",
    // 오늘 막 가입한 사람 — 출석과 퀴즈로 모아 가며 쓰는 자리에서 시작한다
    coins: 5,
    // 체크카드에는 무료 쿠폰이 없다 — 가챠는 한 판 1코인
    coupons: 0,
    card: "check",
    // 가입 화면의 더미 사진(안경 쓴 토끼 인형)과 같은 파일 — join.ts profileSamplePhoto
    photo: "/assets/join/sample-minjeong.jpg",
    receipts: 0,
    // 입력정보의 퍼소나 A — 문화 · 생활
    interests: ["culture", "life"],
  },
  {
    id: "sanghyeon",
    name: "한상현",
    tag: "기존 회원",
    line: "블랙카드로 전부 열려 있는 검증형",
    fresh: false,
    tier: "BLACK CARD",
    // 블랙카드 — 회원증 뒷면과 뽑기 화면에 적혀 있던 수
    coins: 80,
    // 블랙카드는 달마다 무료 쿠폰 한 장 — 이달 것
    coupons: 1,
    card: "black",
    photo: MY_AVATAR,
    // 프레임(1554:3831)에 적혀 있던 수
    receipts: 12,
    // MY 프레임의 「역사 · 사회」 — Today/역사 · Today/사회 진열대가 이 사람 것이다
    interests: ["history", "society"],
  },
];

/**
 * 이 탭에서 직접 가입한 사람 — 고르는 자리(PersonaPicker)에는 안 나온다.
 *
 * PC 셸에서 퍼소나를 고르지 않고 온보딩부터 가입을 마치면 이 사람이 된다
 * (ProfileForm 이 앉힌다). 전에는 아무도 안 골라진 채로 홈에 닿아 프레임의
 * 자리 표시(홍길동 · 블랙카드 · 80코인 · 장바구니 아홉)가 그대로 나왔다 —
 * 기획과 정반대다(감수 지적). 김민정과 같은 「오늘 막 가입한 사람」의 지갑과
 * 빈 장바구니로 시작하고, 이름과 사진은 가입 때 넣은 것(surveyStore)이 이긴다.
 */
export const signup: Persona = {
  id: "signup",
  name: "회원",
  tag: "신규 가입",
  line: "방금 가입한 사람",
  fresh: true,
  tier: "",
  coins: 5,
  coupons: 0,
  card: "check",
  // 사진을 안 넣었으면 빈 사람 그림 — 프레임의 사진은 한상현의 것이다
  photo: "/assets/join/avatar.svg",
  receipts: 0,
  // 김민정과 같은 「오늘 막 가입한 사람」 — 설문에서 바꾸면 그것이 이긴다
  interests: ["culture", "life"],
};

/** 아무도 안 골랐을 때 화면이 쓰는 이름 — 프레임에 적혀 있던 그대로. */
export const guest = { name: "홍길동", tier: "BLACK CARD" } as const;

/** 퍼소나 고르는 자리에 붙는 말 — PC 셸의 왼쪽 칸과 모바일 바텀시트. */
export const picker = {
  ask: "어떤 알래말래븐으로 시작할까요?",
  restart: "이 계정 처음부터 체험 ↺",
  /** 모바일 왼쪽 아래 칩 — 「데모 계정: 김민정 ▾」 */
  chip: "데모 계정:",
  none: "고르기",
  sheetTitle: "데모 계정 바꾸기",
  /** MY 프로필 줄 오른쪽 단추와 그 읽어 주는 이름(T1-R) */
  switch: "계정 전환",
  switchLabel: "데모 계정 전환",
  /** 모바일 첫 진입 시트 — 제목과 건너뛰기(T1-R) */
  firstTitle: "데모 계정 고르기",
  skip: "지금은 건너뛰기",
} as const;

export const findPersona = (id: string | null): Persona | null =>
  personas.find((one) => one.id === id) ?? (id === signup.id ? signup : null);
