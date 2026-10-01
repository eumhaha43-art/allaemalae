/**
 * 회원가입 — Figma 1254:4024(아이디·비밀번호) · 1265:5625(사진·닉네임).
 *
 * 온보딩을 지나면 바로 여기로 온다. 두 장으로 나뉘어 있는데 앞 장에서 계정을
 * 만들고 뒷 장에서 얼굴과 이름을 정한다.
 *
 * 시연용이라 어디에도 보내지 않는다 — 「더미 텍스트 입력」이 칸을 한 번에
 * 채우고, 다 차면 아래 단추가 메인 색으로 살아난다.
 */

export const join = {
  title: "회원가입",
  idLabel: "아이디",
  idPlaceholder: "아이디",
  idCheck: "중복확인",
  idChecked: "쓸 수 있는 아이디예요",
  pwLabel: "비밀번호",
  pwPlaceholder: "비밀번호",
  pw2Placeholder: "비밀번호 확인",
  pwHint: "6~20자 / 영문 대문자, 소문자, 숫자, 특수문자 중 2가지 이상 조합",
  pwMismatch: "비밀번호가 서로 달라요",
  /** 필수 동의 — 비밀번호 아래 두 줄. 둘 다 켜야 가입할 수 있다. */
  consents: ["[필수] 개인정보 수집 및 이용에 동의합니다", "[필수] 만 14세 이상입니다"],
  cta: "가입하기",
  dummy: "더미 텍스트 입력",
  /** 더미가 들어 있을 때의 단추 — 누르면 비워서 손으로 넣는다. */
  manual: "직접 입력하기",
} as const;

/**
 * 「더미 텍스트 입력」이 채우는 값.
 *
 * 아이디는 가게 이름을 로마자로 적은 것이다 — 시연에서 무엇을 넣었는지 한눈에
 * 읽히는 편이 낫다. 비밀번호는 바로 아래 적힌 규칙(6~20자 · 영문 대·소문자와
 * 숫자 중 두 가지 이상)을 지킨다. 확인 칸까지 같은 값으로 함께 채운다.
 */
export type JoinSample = { id: string; password: string };

export const joinSample: JoinSample = {
  id: "allaemallaebeun",
  password: "Allaemallae24",
};

/**
 * 가입 칸의 더미 — 퍼소나마다.
 *
 * 김민정으로 시작한 시연에 「allaemallaebeun」이라는 아이디가 박히면, 뒷 장의
 * 닉네임(그 사람 이름)과 어긋나 두 화면이 다른 사람 이야기가 된다 — 사용자 지적.
 * 사진까지 그 사람 몫을 쓰고 있으므로(`profileSamplePhoto`) 아이디만 남겨 둘
 * 이유가 없다.
 *
 * 아무도 안 골랐을 때만 위의 가게 이름을 쓴다. 비밀번호는 셋 다 아래 규칙
 * (6~20자 · 영문 대·소문자와 숫자 중 두 가지 이상)을 지킨다.
 */
export const joinSampleBy: Readonly<Record<string, JoinSample>> = {
  minjeong: { id: "kimminjeong", password: "Minjeong24" },
  sanghyeon: { id: "hansanghyeon", password: "Sanghyeon24" },
};

export const profile = {
  heading: ["사진과 이름을", "등록해주세요."],
  namePlaceholder: "닉네임",
  nameHint: "닉네임은 나중에 다시 수정할 수 있어요!",
  photoPick: "사진 고르기",
  clear: "지우기",
  cta: "시작하기",
  dummy: "더미 텍스트 입력",
  manual: "직접 입력하기",
} as const;

/**
 * 프로필 장의 더미 이름.
 *
 * 퍼소나를 고르고 들어왔으면 그 사람 이름을 넣는다 — 김민정으로 시작한 시연에
 * 「알래말래븐」이라는 닉네임이 박히면, 뒤따르는 화면들이 부르는 이름과 어긋난다.
 * 아무도 안 골랐을 때만 디자인에 적혀 있던 이름을 쓴다.
 */
export const profileSample = {
  name: "알래말래븐",
} as const;

/**
 * 프로필 장의 더미 사진 — 퍼소나마다.
 *
 * 김민정으로 들어왔으면 안경 쓴 토끼 인형 사진이 함께 들어간다(사용자가 준
 * 것). 사람 얼굴이 아니라 인형이라, 실재하지 않는 사람의 얼굴을 만들어 붙이는
 * 일과는 다르다 — 퍼소나 얼굴도 사람 얼굴이 아니라 인형과 물건 사진이다.
 *
 * 여기 없는 사람은 이름만 들어간다 — 사진은 넣어도 되고 말아도 되는 칸이라,
 * 고른 사진이 있으면 그대로 두고 없으면 빈 채로 둔다.
 */
export const profileSamplePhoto: Readonly<Record<string, string>> = {
  minjeong: "/assets/join/sample-minjeong.jpg",
};

/** 가입을 마치면 가는 곳 — 관심사부터 묻는 설문. */
export const AFTER_JOIN = "/survey";
