/** 잡지식 세트 퀴즈 — Figma 907:10701 · 955:3144 · 955:3180 · 955:3215. */

export type QuizQuestion = {
  id: string;
  /** 두 줄로 끊어 쓰는 질문. */
  prompt: string[];
  /** 보기 두 개. */
  choices: string[];
  /** 정답인 보기의 자리. 결과 팝업이 이걸로 갈린다. */
  answer: number;
  /** 「힌트 보기」로 펼치는 한두 문장 — 답을 직접 말하지 않는다. */
  hint: string;
  /** 결과 화면의 풀이 — 왜 그 답인지 한두 문장. */
  why: string;
};
