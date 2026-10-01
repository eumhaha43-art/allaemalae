/** 채팅방 도메인 타입. 데이터는 `@/data/common/chat`. */

export type Room = {
  id: string;
  title: string;
  /** Rooms with someone talking right now get the red LIVE badge. */
  live?: boolean;
  host: string;
  members: number;
  capacity: number;
  /** Minutes since the last message — the lobby sorts and labels from this. */
  minutesAgo: number;
  /** How many people bookmarked the room. */
  saves: number;
  /** Pinned in place of the house rule, when the host wrote one. */
  intro?: string;
  tags?: string[];
  /** Cover thumbnail, shown in the lobby bubble. */
  image?: string;
  /** 승인제 rooms are vetted by the host; the rest are 선착순. */
  approval?: boolean;
  /** House rules the host switched on, pinned inside the room notice. */
  rules?: string[];
};

export type SortId = "recent" | "popular" | "saved";

export type Message =
  /** Centred grey chip — a day break or a join/leave line. */
  | { kind: "chip"; id: string; label: string }
  /** A plain bubble. `author` is omitted when it follows the same speaker. */
  | {
      kind: "text";
      id: string;
      mine?: boolean;
      author?: string;
      avatar?: string;
      text: string;
      time: string;
      /** 출처 없는 주장에 붙이는 표 — 방 공지가 요구하는 그 「카더라」다. */
      tag?: string;
    }
  /** A community post pasted into the room. */
  | {
      kind: "post";
      id: string;
      author: string;
      avatar: string;
      title: string;
      excerpt: string;
      time: string;
    };

/** Whoever is mid-sentence when the screen opens. */
export type Typing = { avatar: string };

export type Thread = {
  /** 방에 들어가면 한 줄씩 올라오는 대화. */
  messages: Message[];
  typing?: Typing;
  /**
   * 위 대화가 바닥난 뒤에 이어지는 말. 한 줄씩 올라오다가 마지막 줄에서
   * 멈춘다 — 되풀이하면 같은 말이 두 번 세 번 올라와, 살아 있는 방이 아니라
   * 고장 난 방으로 보인다.
   *
   * 끝은 늘 카더라다. 출처 없는 주장이 나오고 → 태그를 붙여 달라는 말이 오고
   * → 그 사람이 카더라를 달아 다시 말하는 데까지가 이 방의 약속(공지)이
   * 지켜지는 장면이라, 거기서 맺어야 이야기가 끝난다.
   *
   * 시각은 올라오는 순간의 시계로 찍으므로 여기서는 비워 둔다.
   */
  live?: Message[];
};
