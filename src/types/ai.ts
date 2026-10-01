/** 알래봇 대화 도메인 타입. 데이터는 `@/data/common/ai`. */

/** 알래봇이 한 번에 내놓는 것 한 덩어리. 이 단위로 하나씩 올라온다. */
export type BotLine =
  /**
   * 알래봇 말풍선. 줄바꿈은 배열로 나눠 적는다. 지식문의에 답한 말에는 출처가
   * 붙는다(1202:3843 — 말풍선 안 아래 줄에 「출처: …」).
   */
  | { kind: "bot"; text: string[]; source?: string; sourceUrl?: string }
  /**
   * 지식문의 — 지식 상세에서 「알래봇에게 물어보기」로 들어오면 그 글이 카드로
   * 올라간다(1202:3843). 「지식문의」 표, 제목, 갈래, 검은 네모의 갈래 그림.
   */
  | { kind: "inquiry"; id: string; title: string; category: string; topic?: string }
  /** 고를 수 있는 알약 단추 묶음 — 누르면 그 이름이 내 말로 올라간다. */
  | { kind: "chips"; items: string[] }
  /** 토론 주제 — 말풍선 안에 A VS B 가 들어간다(1191:2995). */
  | { kind: "versus"; text: string[]; a: string; b: string }
  /**
   * 안내 — 말풍선 밑에 붙는 갈 곳. 앱에 있는 글 카드, 바깥 검색 링크,
   * 글쓰기 단추. 알래봇은 지식을 풀어 주지 않고 여기로 보낸다.
   */
  | { kind: "refs"; posts: BotPostRef[]; links: BotLink[]; write: boolean }
  /** 내가 보낸 말. */
  | { kind: "mine"; text: string }
  /** 말 묶음 끝에 붙는 시각 — 올라오는 순간에 찍힌다. 없으면 화면이 연 때. */
  | { kind: "time"; at?: string };

/** 안내할 글 한 편 — 카드에 그릴 만큼만. */
export type BotPostRef = {
  id: string;
  title: string;
  category: string;
  /** 갈 곳 — 지식 상세 또는 커뮤니티 글. 서버가 정한다. 없으면 커뮤니티 글로. */
  href?: string;
};

/** 바깥 검색 링크. 주소는 서버가 만든다 — 모델이 지어내지 못하게. */
export type BotLink = { label: string; url: string };

/** /api/ai 가 돌려주는 것. */
export type BotAnswer = {
  text?: string;
  posts?: BotPostRef[];
  links?: BotLink[];
  write?: boolean;
  /** 지식문의에 글을 근거로 답했을 때 — 그 글의 출처. 서버가 글에서 붙인다 */
  source?: string;
  sourceUrl?: string;
};

export type BotScript = {
  /** 이 답을 끌어내는 알약 이름. */
  chip: string;
  lines: BotLine[];
};
