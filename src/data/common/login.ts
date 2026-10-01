/**
 * 로그인 — Figma 1554:3556.
 *
 * 쓰던 사람(한상현)의 첫 화면이다: 여는 화면 → 로그인 → 홈. 실제 로그인은
 * 아직 없다 — 퍼소나를 고른 것이 로그인이다. 아이디 · 비밀번호 칸과 소셜
 * 단추는 어느 쪽을 눌러도 들어간다. 「더미 텍스트 입력」이 두 칸을 채운다.
 */
export const login = {
  title: "알래말래븐",
  sub: "세상의 모든 궁금증이 맛있는 지식이 되는 공간",
  lead: "지금 바로 지식 편의점에 입장해보세요",
  idPlaceholder: "아이디 입력",
  pwPlaceholder: "비밀번호 입력",
  cta: "로그인",
  /** 단추 아래 세 개 — 세로 선으로 나뉜다. 마지막 것만 회원가입으로 간다. */
  links: ["아이디 찾기", "비밀번호 찾기", "회원가입"],
  sns: "SNS 계정으로 로그인",
  dummy: "더미 텍스트 입력",
  /** 더미가 들어 있을 때의 단추 — 누르면 비워서 손으로 넣는다. */
  manual: "직접 입력하기",
} as const;

/**
 * 소셜 단추 넷 — 1554:3583. 동그라미 바탕색과 그 안의 그림.
 *
 * 네이버만 그림이 없다 — 디자인이 글자 「N」을 그대로 쓴다.
 */
export const socialLogins = [
  { id: "kakao", label: "카카오로 시작하기", color: "#fee500", icon: "/assets/login/kakao.svg", size: 30 },
  { id: "naver", label: "네이버로 시작하기", color: "#5ec536", mark: "N" },
  { id: "google", label: "Google로 시작하기", color: "#dcdcdc", icon: "/assets/login/google.svg", size: 27 },
  { id: "apple", label: "Apple로 로그인", color: "#000000", icon: "/assets/login/apple.svg", size: 25 },
] as const;
