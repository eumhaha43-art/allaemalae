/** 순위가 어떻게 움직였는지 — Figma 556:5287 */
export type RankMove =
  | { kind: "up"; by: number }
  | { kind: "down"; by: number }
  | { kind: "same" }
  | { kind: "new" };

/** 인기 지식 한 줄 — Figma 556:5271 */
export type RankItem = {
  id: string;
  title: string;
  /** 조회수 — 「2.3k」처럼 이미 줄여 놓은 값이다 */
  views: string;
  move: RankMove;
};
