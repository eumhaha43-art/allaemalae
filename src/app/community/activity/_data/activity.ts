/**
 * 나의 활동 — Figma 1731:5274 (리디자인).
 *
 * 커뮤니티 탭의 네 번째 칸이다. 회원증(`/my`)이 「내가 누구인가」를 보여 준다면
 * 여기는 「내가 무엇을 했는가」를 보여 준다 — 등급과 남은 조건, 반응이 좋았던
 * 내 글, 그리고 최근에 쓴 글·댓글·근거·스크랩이다.
 *
 * 이 파일에는 **씨앗과 문구**만 둔다. 화면에 실제로 뜨는 값은
 * `_lib/useMyActivity` 가 이 씨앗에 저장소(글·댓글·근거·좋아요/담기)의 실제
 * 활동을 더해서 만든다. 씨앗을 직접 고쳐 쓰지 않는다 — 요구사항 7-8.
 *
 * 글꼴은 프레임의 Noto Sans KR 대신 앱 공용(Pretendard)이고, 크기는 스타일
 * 가이드 단계(heading 18~24 · body 12~16)로 맞췄다 — 프레임의 10 · 11px 은
 * 읽기 힘들어 12 로 올렸다(기획 요청: 가이드대로, 단 사용성은 지킨다).
 *
 * 지금은 이 화면 폴더 안에 있다. 다른 화면도 이 값을 보게 되면 `src/data/common`
 * 으로 옮긴다.
 */

/** 최근 활동 거르개 */
export const filters = ["작성한 글", "댓글 남긴 글", "참여한 토론", "스크랩"] as const;

export type ActivityFilter = (typeof filters)[number];

/**
 * 최근 활동 카드 한 장.
 *
 * 무엇이든(내 글·댓글 남긴 글·토론방·스크랩) 같은 모양으로 그린다. 카드마다
 * 다른 것은 맨 윗줄의 갈래 칩 색과, 눌렀을 때 열리는 화면뿐이다.
 */
export type ActivityEntry = {
  id: string;
  kind: ActivityFilter;
  category?: string;
  title: string;
  /** 한 줄로 자른다 — 글의 본문 첫 줄. */
  excerpt: string;
  /**
   * 내가 남긴 말 — 댓글이면 그 댓글, 토론이면 내 근거.
   *
   * 글 본문(excerpt)과 따로 둔다. 프레임은 이것을 보라 띠가 붙은 인용 상자에
   * 넣어 「이 글에서 내가 한 말」이 한눈에 보이게 했다.
   */
  quote?: string;
  when: string;
  /**
   * 아랫줄 숫자들 — 없는 것은 그리지 않는다.
   *
   * 글에는 셋 다 있지만 토론방에는 담기가 없다. 없는 값을 0 으로 채우면
   * 「아무도 담지 않은 글」처럼 읽힌다.
   */
  likes?: number;
  comments?: number;
  saves?: number;
  /**
   * 열리는 화면이 있을 때만 준다.
   *
   * 없으면 카드가 눌리지 않는다 — 지금 화면에 없는 글을 억지로 링크하면
   * 「삭제된 글」로 튕긴다. 뜨는 지식 목록(TrendingList)이 `postId` 없는 줄을
   * 그냥 두는 것과 같은 규칙이다.
   */
  href?: string;
  /** 대표 지식 카드에 깔 그림 — 이 기기에서 쓴 글에 사진이 있으면 그것. */
  image?: string;
};

/**
 * 등급 막대.
 *
 * 프레임은 「다음 등급까지 70%」— **찬** 비율을 적고 막대도 그만큼 차 있다.
 * 씨앗 168 / 240 = 70% 가 그대로 나온다. 글을 쓰거나 댓글을 달면 그만큼 막대가
 * 찬다 — 눌러도 아무 일 없는 장식이 아니다.
 */
export const level = {
  label: "다음 등급까지",
  seedPoints: 168,
  goal: 240,
  /** 활동 하나에 붙는 점수 — 글이 제일 무겁고 댓글이 제일 가볍다. */
  points: { post: 5, comment: 1, debate: 3 },
} as const;

/**
 * 등급 카드 문구 — 이름은 `useUserName` 이 채운다.
 *
 * 프레임(VIP · Lv.3 · 70%)은 기존 회원 한상현의 것이다. 오늘 막 가입한
 * 김민정(`persona.fresh`)에게는 씨앗을 하나도 주지 않는다 — 손님 · Lv.1 · 0%
 * 에서 시작하고, 막대 밑에 무엇을 하면 차는지 한 줄 적어 첫 활동을 부른다.
 * 편의점에 막 들어온 사람은 「손님」이다(기획) — 직원 등급(VIP)은 활동으로 딴다.
 */
export const me = {
  /** 「김민정 님」 */
  greet: (name: string) => `${name} 님`,
  tier: "VIP",
  level: "Lv.3",
  fresh: {
    tier: "손님",
    level: "Lv.1",
    nudge: `첫 글 ${level.points.post}점 · 토론 근거 ${level.points.debate}점 · 댓글 ${level.points.comment}점 — 하나만 남겨도 막대가 차요`,
  },
} as const;

/** 활동 현황. 여기 숫자는 지금까지의 합계라 씨앗에서 시작한다. */
export const stats = {
  posts: { label: "작성한 글", seed: 12 },
  comments: { label: "댓글", seed: 28 },
  debates: { label: "참여한 토론", seed: 5 },
} as const;

/** 다음 등급까지 남은 조건 */
export const mission = {
  title: "다음 등급까지",
  /** 오른쪽 알약 — 「2개 남음」. 다 채우면 「모두 달성」 */
  left: (n: number) => (n === 0 ? "모두 달성" : `${n}개 남음`),
  now: (now: number, goal: number) => `현재 ${now} / ${goal} 달성`,
  done: "달성",
} as const;

export type Mission = {
  /** 무엇을 세는 조건인지 — 실제 수는 `useMyActivity` 가 센다. */
  id: "sourced" | "liked";
  label: string;
  /**
   * 아직 하나도 못 채웠을 때 「현재 0 / 2 달성」 대신 적는 말.
   *
   * 0 은 상태만 알려 주고 다음 걸음은 알려 주지 않는다 — 어디서 무엇을 누르면
   * 채워지는지 한 줄로 적어 첫 활동을 부른다(손님 김민정).
   */
  hint: string;
  icon: string;
  /**
   * 카드 색 — 프레임은 두 장을 보라 · 노랑으로 갈라 그렸다.
   *
   * 보라 위에는 흰 글씨, 노랑 위에는 검정 글씨다. 막대 바탕도 그에 맞춘다.
   */
  tone: {
    card: string;
    iconBox: string;
    sub: string;
    track: string;
    fill: string;
  };
  /** 이미 해 둔 만큼. 여기에 이 기기에서 한 것을 더한다. */
  seed: number;
  goal: number;
};

export const missions: Mission[] = [
  {
    id: "sourced",
    label: "출처 있는 글 2개 작성하기",
    hint: "글쓰기에서 출처를 붙여 올리면 채워져요",
    icon: "/assets/community/activity/mission-post.svg",
    tone: {
      card: "bg-purple text-white",
      iconBox: "bg-white/22",
      sub: "text-white/70",
      track: "bg-gray-black/20",
      fill: "bg-white",
    },
    seed: 1,
    goal: 2,
  },
  {
    id: "liked",
    label: "게시글에 좋아요 5번 누르기",
    hint: "마음에 드는 글에 ♥ 를 누르면 채워져요",
    icon: "/assets/community/activity/mission-like.svg",
    tone: {
      card: "bg-yellow-500 text-gray-black",
      iconBox: "bg-white/40",
      sub: "text-gray-black/70",
      track: "bg-gray-black/14",
      fill: "bg-gray-black",
    },
    seed: 4,
    goal: 5,
  },
];

/** 반응이 좋았던 내 글 */
export const top = {
  title: (name: string) => `${name} 님의 대표 지식`,
  sub: "내가 남긴 글 중 반응이 좋았어요",
  total: (n: number) => `전체 ${n}`,
  /** 보여 줄 장 수 — 첫 장이 크고 나머지는 한 단 작다. */
  count: 4,
  /**
   * 카드 색 — 차례대로 노랑 · 보라 · 파랑 · 초록.
   *
   * 갈래 색이 아니라 차례 색이다. 프레임이 그렇게 그렸고, 갈래 색을 쓰면 역사
   * 글이 셋이면 파랑 셋이 나란히 선다.
   */
  tones: [
    { card: "bg-yellow-500 text-gray-black", chip: "bg-gray-black/12", panel: "bg-white/45" },
    { card: "bg-purple-500 text-white", chip: "bg-white/25", panel: "bg-white/18" },
    { card: "bg-blue-600 text-white", chip: "bg-white/25", panel: "bg-white/18" },
    { card: "bg-primary-600 text-white", chip: "bg-white/25", panel: "bg-white/18" },
  ],
  /** 쓴 글이 하나도 없을 때 — 비었다고만 하지 않고 글쓰기로 보낸다. */
  empty: {
    title: "아직 남긴 지식이 없어요",
    body: "첫 글을 쓰면 여기에 대표로 걸려요",
    cta: "첫 지식 남기기",
    href: "/community/write",
  },
} as const;

export const recent = {
  title: "최근 활동",
  /** 처음에 보여 주는 장 수 — 「더보기」로 나머지를 펼친다. */
  fold: 3,
  more: "더보기",
  less: "접기",
  /** 인용 상자 머리 — 댓글이면 「내 댓글」, 근거면 「내 근거」 */
  quoteLabel: { "댓글 남긴 글": "내 댓글", "참여한 토론": "내 근거" } as Partial<
    Record<ActivityFilter, string>
  >,
  /** 아랫줄 — 「♥ 34 · 댓글 12 · 저장 87」 */
  stat: { likes: "♥", comments: "댓글", saves: "저장" },
} as const;

/**
 * 거르개마다 아무것도 없을 때 하는 말과 갈 곳 — 요구사항 6장(데이터 없음).
 *
 * 비었다고만 하면 막힌다. 그 활동을 할 수 있는 화면으로 보내는 고리를 함께 둔다.
 */
export const emptyBy: Record<ActivityFilter, { text: string; cta: string; href: string }> = {
  "작성한 글": { text: "아직 쓴 글이 없어요", cta: "글쓰기", href: "/community/write" },
  "댓글 남긴 글": { text: "아직 댓글을 남긴 글이 없어요", cta: "게시글 보기", href: "/community" },
  "참여한 토론": {
    text: "아직 근거를 단 토론방이 없어요",
    cta: "토론방 보기",
    href: "/community/debate",
  },
  스크랩: { text: "아직 스크랩한 글이 없어요", cta: "게시글 보기", href: "/community" },
};

/**
 * 갈래 칩(작성한 글 · 댓글 남긴 글 · …) 색 — 프레임은 초록 · 보라 · 파랑이다.
 *
 * 스크랩은 프레임에 없어 노랑으로 채웠다(대표 지식 첫 장과 같은 색).
 */
export const kindTone: Record<ActivityFilter, string> = {
  "작성한 글": "bg-primary-600 text-white",
  "댓글 남긴 글": "bg-purple text-white",
  "참여한 토론": "bg-blue-600 text-white",
  스크랩: "bg-yellow-500 text-gray-black",
};

/**
 * 내가 예전에 쓴 글.
 *
 * 상세 화면이 없는 글이라 `href` 가 없다(카드가 눌리지 않는다). 이 기기에서
 * 새로 쓴 글은 상세가 있으므로 목록 맨 앞에 링크로 붙는다.
 *
 * 「댓글 남긴 글 · 참여한 토론 · 스크랩」에는 씨앗을 두지 않는다. 그쪽은
 * 실제 글·토론방을 가리켜야 하는데, 씨앗으로 적어 두면 그 글의 댓글 목록에는
 * 내 댓글이 없어 화면끼리 말이 어긋난다. 비어 있으면 비었다고 알려 준다.
 */
export const seedActivity: ActivityEntry[] = [
  {
    id: "seed-1",
    kind: "작성한 글",
    category: "역사",
    title: "조선시대에도 배달 음식이 있었을까?",
    excerpt: "조선시대에서는 어떤 음식을 시켜 먹었을까요? 사실 조선시대에서는",
    when: "1시간 전",
    likes: 34,
    comments: 12,
    saves: 87,
  },
  {
    id: "seed-2",
    kind: "작성한 글",
    category: "생활",
    title: "전자레인지 문에 있는 검은 점들의 정체 ㄷㄷ",
    excerpt:
      "안녕하세요? 오늘도 신기한 지식을 들고 와봤어요. 매일 보던 전자레인지의 검은 점들, 단순한 무늬가 아니었어요.",
    when: "12시간 전",
    likes: 12,
    comments: 4,
    saves: 5,
  },
  {
    id: "seed-3",
    kind: "작성한 글",
    category: "역사",
    title: "조선시대 사람들도 아이스크림을 먹었다고?",
    excerpt: "요즘은 역사 이야기가 재밌네요ㅎㅎ 다들 아이스크림 좋아하시나요? 저는",
    when: "어제",
    likes: 23,
    comments: 11,
    saves: 12,
  },
];

/**
 * 맨 아래 안내 카드와, 눌렀을 때 올라오는 짧은 안내.
 *
 * 갈 화면이 따로 없어 전에는 눌러도 아무 일이 없었다. 눌리는 모양인데 반응이
 * 없으면 고장으로 읽혀서, 이 화면이 세는 것들을 네 줄로 풀어 시트에 담았다 —
 * 점수는 `level.points` 에서 뽑아 적으므로 값이 바뀌어도 말이 어긋나지 않는다.
 */
export const guide = {
  eyebrow: "처음이신가요?",
  /** 기존 회원에게는 「처음이신가요?」가 어색하다 — 같은 카드, 다른 한마디 */
  eyebrowAgain: "헷갈릴 때 다시 보기",
  label: "알래말래븐 커뮤니티 이용 가이드",
  sheetTitle: "커뮤니티 이용 가이드",
  steps: [
    {
      title: "지식을 글로 남겨요",
      body: "게시글 탭의 글쓰기로 아는 것을 적어요. 출처를 붙이면 「출처 있는 글」로 세요.",
    },
    {
      title: "반응을 남겨요",
      body: "마음에 드는 글에는 좋아요 · 댓글 · 스크랩을 눌러요. 누른 만큼 여기 최근 활동에 쌓여요.",
    },
    {
      title: "토론방에서 근거를 달아요",
      body: "찬성 · 반대 어느 쪽이든 근거를 하나 달면 「참여한 토론」으로 세요.",
    },
    {
      title: "쌓이면 등급이 올라요",
      body: `글 ${level.points.post}점 · 토론 근거 ${level.points.debate}점 · 댓글 ${level.points.comment}점. 다음 등급까지의 막대가 그만큼 차요.`,
    },
  ],
} as const;
