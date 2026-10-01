/** 커뮤니티 게시글 도메인 타입. 데이터는 `@/data/common/community`. */

export type Tab = {
  id: string;
  label: string;
  /** Set once the tab has a screen of its own; the rest are still unbuilt. */
  href?: string;
};

export type TrendingItem = {
  id: string;
  title: string;
  category: string;
  when: string;
  /** The post it opens, when the feed carries the same knowledge. */
  postId?: string;
};

/** A line in a post's comment thread — Figma 787:3488. */
export type Comment = {
  id: string;
  author: string;
  avatar: string;
  when: string;
  /** Epoch ms, on comments written here — the label is derived so it ages. */
  at?: number;
  text: string;
  likes: number;
  /** Indented under the comment above it. */
  reply?: boolean;
  /** Set on replies written here — which top-level comment they sit under. */
  parentId?: string;
  /** 고쳐 쓴 댓글 — 줄 끝에 「수정됨」이 붙는다. */
  edited?: boolean;
};

/** The O/X question 글쓰기 offers to generate — Figma 787:3447. */
export type Quiz = {
  question: string;
  answer: "O" | "X";
};

export type Post = {
  id: string;
  category: string;
  /**
   * 세부 갈래 — 메뉴 분야 카드 밑에 적힌 것(범죄 / 경제 / … ) 중 하나. 지식
   * 목록이 「사회 법률」처럼 분야 뒤에 붙여 적는다. 글쓰기로 쓴 글에는 없다.
   */
  topic?: string;
  /** Extra outlined badge, e.g. 인기 */
  badge?: string;
  title: string;
  excerpt: string;
  author: string;
  when: string;
  likes: number;
  comments: number;
  saves: number;
  /**
   * Where the writer got it from — shown on the detail.
   *
   * 글쓰기에서 선택이다. 비어 있으면 글에 「카더라」가 붙는다: 안 쓴 것과
   * 못 찾은 것을 굳이 나누지 않는다 — 읽는 쪽에는 둘 다 「확인 안 된 말」이다.
   */
  source?: string;
  /**
   * 출처의 실제 주소 — 있으면 「링크 이동」이 여기로 간다. 없으면 출처 이름으로
   * 검색한다(sourceHref). 카드뉴스는 디자이너가 프레임 주석에 적어 둔 주소다.
   */
  sourceUrl?: string;
  /** Posts without a thumbnail render text full-width. */
  image?: string;

  // Everything below only exists on the seeded posts. A post written here has
  // its body in `excerpt`, so the detail screen falls back to that.
  authorAvatar?: string;
  /** 편의점 rank badge next to the name — Figma 787:3419. */
  authorLevel?: string;
  views?: number;
  /** Body paragraphs, in order. */
  body?: string[];
  tags?: string[];
  quiz?: Quiz;
  thread?: Comment[];
  /**
   * 카드뉴스 — 본문을 글 대신 그림 카드로 넘겨 보는 지식(Figma 1632:7537).
   *
   * 한 장이 354 × 218 이고 디자이너가 그린 것을 2배로 뽑아 그대로 쓴다(글자까지
   * 그림 안에 있다). 있으면 상세가 글 카드 대신 이것을 편다(CardNewsDetail).
   * `body` 는 그래도 둔다 — 커뮤니티 · 검색 · 퀴즈가 글을 읽는다.
   */
  cards?: string[];
  /** 카드뉴스 끝에 「영수증에 기록하세요」 초록 카드를 붙일지 — 디자인에 있는 글만. */
  recordCard?: boolean;
};

/** 글쓰기 「출처 검색」이 뒤지는 자료 한 건. */
export type PostSource = {
  id: string;
  title: string;
  /** 어디 것인지 — 「www.mfds.go.kr · 정부기관」처럼 출처와 갈래를 함께 적는다. */
  meta: string;
  /** 제목·본문에서 이 자료를 끌어낼 실마리 낱말. */
  keywords: string[];
};
