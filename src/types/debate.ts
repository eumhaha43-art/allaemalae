/** 토론방 도메인 타입. 데이터는 `@/data/common/debate`. */

export type DebateRoom = {
  id: string;
  title: string;
  live?: boolean;
  /** 비공개 rooms get the padlock next to the title. */
  locked?: boolean;
  /** 비공개 방의 네 자리 비밀번호 — 들어가려면 물어본다. */
  password?: string;
  /** 목록의 작은 사진 — 방 배경과 같은 것. 없으면 회색 알래봇 얼굴. */
  thumb?: string;
  when: string;
  lastMessage: string;
  members: number;
  capacity: number;
  tags: string[];
  /** Rooms without a detail screen yet are dimmed and not linked. */
  ready?: boolean;
  /** 내가 들어가 있는 방 — 「참여 중」 필터가 이것으로 거른다. */
  joined?: boolean;
};

export type Side = "A" | "B";

export type Ground = {
  id: string;
  rank: number;
  text: string;
  side: Side;
  /** 출처 있음 rows are marked dark; the rest read 카더라. */
  sourced: boolean;
  likes?: number;
  /** Just posted — shows NEW instead of a count. */
  fresh?: boolean;
  /** Trimmed wording for the collapsed card — Figma 805:3679. */
  short?: string;
};

export type Debate = {
  id: string;
  topic: string;
  /** Two lines, as the vote card wraps it. */
  topicLines: string[];
  remaining: string;
  members: number;
  voters: number;
  options: { side: Side; label: string; percent: number }[];
  /** The ticker of messages rising behind the sheet — what is on screen at first. */
  chatter: { id: string; author: string; text: string }[];
  /** 그 뒤로 계속 올라오는 말. 끝까지 가면 처음부터 다시 돈다. */
  incoming: { author: string; text: string }[];
  grounds: Ground[];
  /** Total 근거 on the topic; the sheet lists only the top few. */
  groundCount: number;
  likes: number;
  saves: number;
  /** 근거 달기의 출처 검색 결과 — 방의 주제에 맞는 자료 셋. */
  sources: SourceHit[];
  /** 방 뒤에 깔리는 사진 — 없으면 편의점 진열대(stage.png). */
  background?: string;
  /** 「더미 텍스트」 단추가 채우는 근거 한 줄 — 시연용. */
  sample: { side: Side; text: string };
};

export type SourceHit = {
  id: string;
  title: string;
  meta: string;
  /** The top hit is highlighted in mint — Figma 805:4344. */
  best?: boolean;
};
