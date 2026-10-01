/**
 * Mock content for the community screen (Figma node 564:5271 "게시글Home").
 * Swap for API calls later — the components only read from these shapes.
 */

import type { Comment, Post, PostSource, Quiz, Tab, TrendingItem } from "@/types/community";
import { seedPosts } from "@/data/common/posts";

// 화면들이 데이터와 타입을 한 곳에서 가져오도록 다시 내보낸다.
export type { Comment, Post, PostSource, Quiz, Tab, TrendingItem };


export const tabs: Tab[] = [
  { id: "posts", label: "게시글", href: "/community" },
  { id: "chat", label: "채팅방", href: "/community/chat" },
  { id: "debate", label: "토론방", href: "/community/debate" },
  { id: "mine", label: "나의 활동", href: "/community/activity" },
];

export const poll = {
  label: "오늘의 지식 투표",
  remaining: "11시간 24분 남음",
  title: ["유통기한 지난", "편의점 음식, 괜찮다?"],
  cta: "투표하기",
  image: "/assets/community/hero-photo.png",
  /** 같은 주제의 토론방 — 거기서 A vs B 로 투표한다(debate.ts sourced-only). */
  href: "/community/debate/sourced-only",
} as const;

export const categories = [
  "전체",
  "역사",
  "과학",
  "생활",
  "사회",
  "문화",
] as const;

/**
 * 처음 골라져 있는 칩. 디자인 프레임은 「역사」를 켜 두었지만, 칩이 실제로
 * 목록을 거르게 된 뒤로는 「전체」로 시작한다 — 열자마자 역사만 보이면 다른
 * 갈래의 글이 없는 줄 안다.
 */
export const defaultCategory = "전체";

/**
 * 카테고리마다 정해진 색 — Figma 856:8687~8692.
 *
 * 「전체」는 카테고리가 아니라 필터 해제라 메인 색을 쓴다. 카테고리 칩과
 * 글쓰기의 카테고리 뱃지가 같은 표를 본다.
 */
export const categoryColors: Record<string, string> = {
  전체: "#008154",
  역사: "#008ede",
  과학: "#728627",
  생활: "#ff77b7",
  사회: "#f9b208",
  문화: "#7c73e6",
};

/**
 * 목록 카드 제목 위의 갈래 칩 — 갈래 색을 연하게 깐 바탕에 진한 글씨.
 *
 * 위의 원색을 그대로 칠하면 카드마다 색 덩어리가 하나씩 생겨 제목보다
 * 먼저 읽힌다. 같은 계열의 200(바탕) · 900(글씨)로 낮춘다. 나의 활동의
 * chipTone 과 같은 표를 본다.
 */
export const categoryChip: Record<string, string> = {
  역사: "bg-blue-200 text-blue-900",
  // 과학의 원색(#728627)은 팔레트에 계단이 없어 연한 바탕과 진한 글씨를 직접 적는다
  과학: "bg-[#e6ebd6] text-[#3d4a12]",
  생활: "bg-pink-200 text-pink-900",
  사회: "bg-yellow-200 text-yellow-900",
  문화: "bg-purple-200 text-purple-900",
};

export const CATEGORY_CHIP_FALLBACK = "bg-gray-200 text-gray-800";


export const trending = {
  title: "지금 뜨는 커뮤니티 지식",
  viewAll: "전체보기",
  /** 한 번에 보여 주는 줄 수 — 열 개를 이만큼씩 넘긴다. */
  perPage: 3,
  /** 다음 세 개로 넘어가기까지 — 한 줄을 읽고 남을 만큼. */
  turnMs: 4200,
  items: [
    { id: "t1", title: "왜 판사는 망치를 두드릴까?", category: "역사", when: "어제", postId: "p1" },
    {
      id: "t2",
      title: "삼각김밥 포장이 3단계인 이유",
      category: "생활",
      when: "2일 전",
      postId: "p2",
    },
    {
      id: "t3",
      title: "바나나는 나무가 아니라 풀이다",
      category: "과학",
      when: "3일 전",
    },
    {
      id: "t4",
      title: "클레오파트라는 피라미드보다 아이폰에 더 가깝다",
      category: "역사",
      when: "3일 전",
      postId: "p3",
    },
    {
      id: "t5",
      title: "편의점 가격표 끝자리가 900원인 이유",
      category: "사회",
      when: "4일 전",
    },
    {
      id: "t6",
      title: "청바지 작은 주머니는 회중시계 자리였다",
      category: "생활",
      when: "4일 전",
    },
    {
      id: "t7",
      title: "팝콘을 금지했다가 망할 뻔한 극장들",
      category: "문화",
      when: "5일 전",
    },
    {
      id: "t8",
      title: "아인슈타인의 뇌는 240조각이 됐다",
      category: "역사",
      when: "5일 전",
    },
    {
      id: "t9",
      title: "‘OK’는 원래 오타를 놀리는 말이었다",
      category: "언어",
      when: "6일 전",
    },
    {
      id: "t10",
      title: "유통기한과 소비기한은 다른 날짜다",
      category: "생활",
      when: "일주일 전",
    },
  ] as TrendingItem[],
} as const;

/**
 * 열 개를 세 개씩 끊어 넘길 자리들.
 *
 * 마지막 쪽은 끝에 붙여 잡는다. 10 을 3 으로 나누면 마지막에 하나가 남는데,
 * 그대로 두면 줄이 셋에서 하나로 줄어 자리가 접혔다 펴진다. 8·9·10 으로
 * 잡으면 두 줄이 겹쳐 보이지만, 늘 세 줄이고 번호도 차례대로 오른다.
 */
export function trendingPages(total: number, perPage: number): number[] {
  const starts: number[] = [];
  for (let at = 0; at + perPage <= total; at += perPage) starts.push(at);
  const last = starts.at(-1) ?? 0;
  if (last + perPage < total) starts.push(Math.max(0, total - perPage));
  return starts.length ? starts : [0];
}



const AVATAR = {
  night: "/assets/post/avatar-1.png",
  fridge: "/assets/post/avatar-2.png",
  ramen: "/assets/post/avatar-3.png",
  // 온도0도 · 삼각김밥러버의 얼굴 — posts.ts 의 WHO 와 같아야 한다
  snowman: "/assets/post/avatar-snowman.jpg",
  smile: "/assets/post/avatar-smile.jpg",
} as const;

/** 최신 글 정렬 — 최신순은 목록에 적힌 차례 그대로, 나머지는 숫자로. */
export type PostSort = "recent" | "likes" | "comments" | "saves";

export const POST_SORTS: { id: PostSort; label: string }[] = [
  { id: "recent", label: "최신순" },
  { id: "likes", label: "인기순" },
  { id: "comments", label: "댓글순" },
  { id: "saves", label: "스크랩순" },
];

/**
 * 정렬한 사본 — 최신순은 들어온 차례(방금 쓴 글이 맨 앞)이고, 나머지는 그
 * 숫자가 큰 것부터. 같은 숫자면 원래 차례를 지킨다(sort 는 안정 정렬).
 */
export function sortPosts(list: Post[], sort: PostSort): Post[] {
  if (sort === "recent") return list;
  return [...list].sort((a, b) => b[sort] - a[sort]);
}

export const recent = {
  title: "최신 글",
  /** 처음에 보여 주는 글 수 — 「더 보기」로 이만큼씩 이어 붙는다. */
  perPage: 4,
  /** 「4편 더 보기 (남은 11편)」 */
  more: (next: number, left: number) => `${next}편 더 보기 · 남은 ${left}편`,
  posts: [
    {
      id: "p1",
      category: "역사",
      topic: "세계사",
      title: "왜 판사는 망치를 두드릴까?",
      excerpt: "영국 법정에는 망치가 없다. 우리가 아는 그 장면은 대부분 미국 드라마다.",
      author: "야간알바중",
      authorAvatar: AVATAR.night,
      authorLevel: "점장 Lv.3",
      when: "3시간 전",
      views: 1204,
      likes: 34,
      comments: 12,
      saves: 87,
      image: "/assets/community/post-1.png",
      body: [
        "법정 드라마에서 판사가 “땅땅땅” 망치를 두드리는 장면, 다들 한 번쯤 봤을 거다. 그런데 정작 영국 법정에는 이 망치(gavel)가 없다.",
        "망치는 원래 경매장에서 낙찰을 알리던 도구였고, 미국 법원이 이를 가져다 쓰면서 “재판=망치”라는 이미지가 굳어졌다. 한국 법정에도 망치는 없다.",
      ],
      source: "BBC History Extra · “Why do judges use gavels?”",
      tags: ["역사", "법정오해", "미드에서본것"],
      quiz: { question: "영국 법정에서도 판사는 망치를 사용한다.", answer: "X" },
      thread: [
        {
          id: "p1c1",
          author: "냉장고문닫아",
          avatar: AVATAR.fridge,
          when: "2시간 전",
          text: "헐 그럼 드라마에서 본 게 다 거짓말이었네요… 방금 검색해봤는데 진짜 없다고 나오네요",
          likes: 8,
        },
        {
          id: "p1c2",
          author: "야간알바중",
          avatar: AVATAR.night,
          when: "1시간 전",
          text: "ㅋㅋㅋ 저도 이거 알고 좀 충격이었어요",
          likes: 2,
          reply: true,
        },
        {
          id: "p1c3",
          author: "점심에컵라면",
          avatar: AVATAR.ramen,
          when: "42분 전",
          text: "출처 링크 감사합니다. 이런 글 더 올려주세요",
          likes: 5,
        },
      ],
    },
    {
      id: "p2",
      category: "생활",
      topic: "음식",
      badge: "인기",
      title: "삼각김밥 포장이 3단계인 이유",
      excerpt:
        "1번을 먼저 당기지 않으면 김이 눅눅해진다. 어찌구 저찌구 그래서 삼김 포장 3단계라고 함",
      author: "온도0도",
      authorAvatar: AVATAR.snowman,
      authorLevel: "알바 Lv.5",
      when: "6시간 전",
      views: 2340,
      likes: 128,
      comments: 41,
      saves: 203,
      image: "/assets/community/post-2.png",
      body: [
        "편의점 삼각김밥 포장에는 1, 2, 3 번호가 찍혀 있다. 순서대로 당기라는 뜻인데, 이 순서를 지켜야 김이 눅눅해지지 않는다.",
        "비밀은 김과 밥 사이에 낀 얇은 필름이다. 1번을 당기면 포장이 가운데에서 갈라지고, 2번과 3번을 좌우로 빼내면 필름만 쏙 빠져나가면서 김이 그제서야 밥에 처음 닿는다.",
        "순서를 건너뛰고 김만 먼저 꺼내면 필름이 김을 찢거나 밥알이 필름에 붙어버린다. 김을 마지막 순간까지 밥과 떼어놓는 것, 그게 3단계 포장의 전부다.",
      ],
      source: "한국식품커뮤니케이션포럼 · 「편의점 삼각김밥 포장 구조」",
      tags: ["생활", "편의점", "삼각김밥"],
      quiz: { question: "삼각김밥은 2번을 먼저 당겨야 김이 눅눅해지지 않는다.", answer: "X" },
      thread: [
        {
          id: "p2c1",
          author: "야간알바중",
          avatar: AVATAR.night,
          when: "5시간 전",
          text: "야간에 이거 뜯다가 김 찢어먹는 손님 하루에 세 명은 봄",
          likes: 31,
        },
        {
          id: "p2c2",
          author: "온도0도",
          avatar: AVATAR.snowman,
          when: "4시간 전",
          text: "그쵸 ㅋㅋ 급하면 무조건 2번부터 뜯더라고요",
          likes: 6,
          reply: true,
        },
        {
          id: "p2c3",
          author: "점심에컵라면",
          avatar: AVATAR.ramen,
          when: "1시간 전",
          text: "필름 때문이었구나… 그냥 뜯는 순서인 줄 알았는데 이유가 있었네요",
          likes: 12,
        },
      ],
    },
    {
      id: "p3",
      category: "역사",
      topic: "세계사",
      title: "클레오파트라는 피라미드보다 아이폰에 더 가깝다",
      excerpt:
        "기자 피라미드 완공은 기원전 2560년, 클레오파트라는 기원전 69년생이다. 무슨말인지 모르겠다",
      author: "삼각김밥러버",
      authorAvatar: AVATAR.smile,
      authorLevel: "단골 Lv.2",
      when: "어제",
      views: 890,
      likes: 76,
      comments: 23,
      saves: 150,
      body: [
        "기자의 대피라미드가 완공된 건 대략 기원전 2560년, 클레오파트라 7세가 태어난 건 기원전 69년이다. 둘 사이는 약 2,500년이다.",
        "그런데 클레오파트라와 지금 우리 사이는 약 2,100년. 아이폰이 처음 나온 2007년까지만 따져도 마찬가지다. 즉 클레오파트라는 피라미드가 세워지던 시대보다 아이폰이 나온 시대에 더 가까운 사람이다.",
        "이집트 역사가 3,000년 넘게 이어졌다는 걸 실감하기 어려워서 생기는 착시다. 우리 머릿속에서는 피라미드와 클레오파트라가 나란히 붙어 있지만, 실제로는 그 사이에 우리가 아는 역사 전체만큼의 시간이 들어 있다.",
      ],
      source: "대영박물관 · 「Ancient Egypt timeline」",
      tags: ["역사", "고대이집트", "시간감각"],
      quiz: {
        question: "클레오파트라는 피라미드 완공보다 아이폰 출시에 더 가까운 시대를 살았다.",
        answer: "O",
      },
      thread: [
        {
          id: "p3c1",
          author: "냉장고문닫아",
          avatar: AVATAR.fridge,
          when: "20시간 전",
          text: "이거 계산해보고 진짜 소름 돋았어요. 피라미드가 너무 오래됐네",
          likes: 19,
        },
        {
          id: "p3c2",
          author: "야간알바중",
          avatar: AVATAR.night,
          when: "14시간 전",
          text: "클레오파트라 입장에서 피라미드가 이미 유적이었다는 거잖아요",
          likes: 24,
        },
        {
          id: "p3c3",
          author: "삼각김밥러버",
          avatar: AVATAR.smile,
          when: "11시간 전",
          text: "맞아요, 관광하러 갔다는 기록도 있대요",
          likes: 7,
          reply: true,
        },
      ],
    },
    ...seedPosts,
  ] as Post[],
} as const;

/**
 * Slots the comments written here into the seeded thread: a reply lands after
 * the comment it answers (and after any replies already there), everything
 * else at the end.
 */
export function buildThread(seeded: Comment[], written: Comment[]): Comment[] {
  const thread = [...seeded];
  for (const comment of written) {
    const parent = comment.parentId
      ? thread.findIndex((entry) => entry.id === comment.parentId)
      : -1;
    if (parent === -1) {
      thread.push(comment);
      continue;
    }
    let at = parent + 1;
    while (at < thread.length && thread[at].reply) at += 1;
    thread.splice(at, 0, comment);
  }
  return thread;
}

/** The top-level comment a reply to `id` should hang under. */
export function parentOf(thread: Comment[], id: string): string {
  const at = thread.findIndex((entry) => entry.id === id);
  for (let i = at; i >= 0; i -= 1) if (!thread[i].reply) return thread[i].id;
  return id;
}

/** "방금", "12분 전" — how old a comment written on this device is now. */
export function commentAge(at: number): string {
  const minutes = Math.floor((Date.now() - at) / 60000);
  if (minutes < 1) return "방금";
  if (minutes < 60) return `${minutes}분 전`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}시간 전`;
  return `${Math.floor(hours / 24)}일 전`;
}

export const getPost = (id: string): Post | undefined =>
  recent.posts.find((post) => post.id === id);

/**
 * 출처 검색이 뒤지는 자료 — 글쓰기 856:5538.
 *
 * 실제로 찾아가 뒤지는 곳이 아직 없어서, 이 앱이 다루는 갈래마다 실재하는
 * 자료를 한둘씩 적어 둔 서랍이다. 지어낸 링크를 걸지 않는 대신 기관과 자료
 * 이름까지만 적는다 — 눌러서 열리는 곳은 아직 없다.
 */
export const sourceLibrary: PostSource[] = [
  {
    id: "src-pester",
    title: "The Conversation · “Give in to pester power at the supermarket checkout?”",
    meta: "theconversation.com · 매체 (Health Promotion International, 2012 연구 소개)",
    keywords: ["계산대", "젤리", "사탕", "조르", "페스터", "아이", "눈높이"],
  },
  {
    id: "src-tesco",
    title: "Tesco PLC · “We’re removing sweets and chocolates from checkouts across the UK”",
    meta: "tescoplc.com · 기업 공지 (2014)",
    keywords: ["테스코", "계산대", "사탕", "초콜릿", "checkout"],
  },
  {
    id: "src-gavel",
    title: "BBC History Extra · “Why do judges use gavels?”",
    meta: "bbchistorymagazine.com · 매체",
    keywords: ["판사", "망치", "법정", "재판", "영국", "gavel"],
  },
  {
    id: "src-onigiri",
    title: "한국식품커뮤니케이션포럼 · 「편의점 삼각김밥 포장 구조」",
    meta: "www.foodnews.co.kr · 학회",
    keywords: ["삼각김밥", "김밥", "포장", "편의점", "김", "눅눅"],
  },
  {
    id: "src-egypt",
    title: "대영박물관 · 「Ancient Egypt timeline」",
    meta: "britishmuseum.org · 박물관",
    keywords: ["클레오파트라", "이집트", "피라미드", "연표", "고대"],
  },
  {
    id: "src-expiry",
    title: "식품의약품안전처 · 「소비기한 안내」(2023)",
    meta: "www.mfds.go.kr · 정부기관",
    keywords: ["유통기한", "소비기한", "식품", "보관", "상함", "안전", "식약처"],
  },
  {
    id: "src-banana",
    title: "국립생물자원관 · 「바나나는 여러해살이풀」",
    meta: "www.nibr.go.kr · 정부기관",
    keywords: ["바나나", "풀", "나무", "식물", "열매"],
  },
  {
    id: "src-popcorn",
    title: "미국영화협회 · 「극장 매점 수익 구조」",
    meta: "motionpictures.org · 협회",
    keywords: ["팝콘", "극장", "영화", "매점", "관람"],
  },
  {
    id: "src-jeans",
    title: "리바이스 아카이브 · 「워치 포켓의 유래」",
    meta: "levistrauss.com · 기업 자료",
    keywords: ["청바지", "주머니", "회중시계", "포켓", "의류"],
  },
  {
    id: "src-price",
    title: "한국소비자원 · 「끝자리 가격 표시와 소비자 인식」",
    meta: "www.kca.go.kr · 정부기관",
    keywords: ["가격", "끝자리", "900", "할인", "소비", "편의점"],
  },
  {
    id: "src-brain",
    title: "Smithsonian Magazine · “The Tragic Story of Einstein’s Brain”",
    meta: "smithsonianmag.com · 매체",
    keywords: ["아인슈타인", "뇌", "해부", "조각", "과학자"],
  },
  {
    id: "src-hangul",
    title: "국립국어원 · 「우리말샘」",
    meta: "www.korean.go.kr · 정부기관",
    keywords: ["한글", "세종", "말", "어원", "언어", "맞춤법", "훈민정음"],
  },
];

/** 띄어쓰기와 대소문자는 검색에서 무시한다. */
const flatten = (text: string) => text.toLowerCase().replace(/s+/g, "");

/**
 * 출처 찾기 — 친 글자로 찾고, 아직 안 쳤으면 제목·본문에서 알아서 찾는다.
 *
 * 두 경우의 맞춰 보는 방향이 반대다.
 * - 친 글자: 자료 쪽 글자 안에 친 것이 들어 있나 («식약» → 식품의약품안전처)
 * - 실마리: 자료의 낱말이 제목·본문 안에 들어 있나
 *
 * 실마리 쪽을 뒤집어 보는 이유는 조사다. 본문을 낱말로 잘라 「망치를」로
 * 맞춰 보면 자료의 「망치」에 안 걸린다 — 반대로 보면 걸린다.
 */
/**
 * 어떤 낱말로든 찾아갈 수 있는 곳 — 서랍에 없는 주제일 때 여기서 찾는다.
 *
 * 이것은 **출처가 아니라 찾아볼 곳**이다. 예전에는 이 셋을 찾은 자료처럼
 * 줄로 세워 「붙이기」를 달았더니, 「위키백과 · 「미란다」」가 글에 출처로
 * 박혔다 — 아직 아무것도 확인하지 않았는데 확인한 꼴이 된다. 그래서 붙이는
 * 길을 떼고 열어 보는 길만 남겼다.
 */
export const LOOKUPS = [
  {
    id: "wiki",
    name: "위키백과",
    search: (word: string) =>
      `https://ko.wikipedia.org/w/index.php?search=${encodeURIComponent(word)}`,
  },
  {
    id: "news",
    name: "네이버 뉴스",
    search: (word: string) =>
      `https://search.naver.com/search.naver?where=news&query=${encodeURIComponent(word)}`,
  },
  {
    id: "scholar",
    name: "구글 학술검색",
    search: (word: string) =>
      `https://scholar.google.com/scholar?q=${encodeURIComponent(word)}`,
  },
] as const;

/**
 * 제목 · 본문에서 찾아볼 만한 낱말 하나.
 *
 * 형태소 분석기가 없으니 낱말을 잘라 맨 앞엣것을 고르되, 두 가지를 손본다.
 *
 * 조사를 뗀다 — 안 떼면 「스페인에서」(5)가 「미란다」(3)를 길이로 이겨서,
 * 미란다 이야기에 스페인을 찾아보라고 내밀었다. 떼고 남는 몸통이 두 글자는
 * 되어야 뗀다: 「도시」의 「도」까지 떼면 낱말이 사라진다.
 *
 * 어느 글에나 나오는 말(출처 · 이유 · 진짜…)은 거른다. 그것으로 찾아 봐야
 * 아무 데도 닿지 않는다.
 */
const FILLER = [
  "출처", "이유", "진짜", "정말", "사실", "그냥", "우리", "이거", "저거", "그거",
  "때문", "경우", "정도", "가지", "무엇", "어디", "언제", "누가", "이야기", "질문",
];

/** 긴 것부터 봐야 「에서」를 떼기 전에 「에」가 먼저 떨어지지 않는다. */
const PARTICLES = [
  "에서는", "이라는", "에게서", "으로는", "에서", "에게", "라는", "부터", "까지",
  "으로", "한테", "보다", "처럼", "마다", "조차", "밖에", "이나", "는", "은", "이",
  "가", "을", "를", "의", "에", "로", "와", "과", "도", "만",
];

/**
 * 꾸미는 말로 보이는 끝 — 「궁금한 · 그르렁거리는 · 오래된」.
 *
 * 세 글자부터만 본다. 두 글자에는 「시한 · 통한」처럼 멀쩡한 이름씨가 있다.
 */
const MODIFIER = /^.{2,}(한|는|은|인|된|할|될|같은)$/;

function stem(word: string): string {
  for (const particle of PARTICLES) {
    if (word.length - particle.length >= 2 && word.endsWith(particle)) {
      return word.slice(0, -particle.length);
    }
  }
  return word;
}

function clueWord(text: string): string {
  const words = text
    .split(/[^가-힣a-zA-Z0-9]+/)
    .map(stem)
    .filter((word) => word.length > 1 && !FILLER.includes(word));
  // 가장 긴 것이 아니라 맨 앞엣것을 고른다. 우리말 제목은 무엇에 대한
  // 이야기인지를 앞에 놓고 뒤에 서술을 붙인다 — 길이로 고르면 「고양이는 왜
  // 그르렁거리나」에서 「그르렁거리나」가 이겨서 고양이를 놓친다.
  //
  // 다만 꾸미는 말은 뒤로 미룬다. 「진짜 출처가 궁금한 라면 이야기」의 맨
  // 앞은 「궁금한」인데, 그것으로 찾아 봐야 아무 데도 닿지 않는다 — 찾을
  // 것은 「라면」이다. 죄다 꾸미는 말뿐이면 그냥 맨 앞엣것을 쓴다.
  const naming = words.filter((word) => !MODIFIER.test(word));
  return naming[0] ?? words[0] ?? "";
}

/** 「직접 찾아보기」에 넣을 낱말 — 친 것이 있으면 그것, 없으면 글에서 고른다. */
export function lookupWord(typed: string, post: { title?: string; body?: string } = {}): string {
  return typed.trim() || clueWord(post.title ?? "") || clueWord(post.body ?? "");
}

/**
 * 서랍에서 맞는 자료 찾기 — 친 글자로 찾고, 아직 안 쳤으면 글에서 알아서.
 *
 * 없으면 빈 목록이다. 예전에는 여기서 찾아볼 곳을 지어 채웠는데, 그것이
 * 글에 출처로 박히는 문제가 되어 떼어 냈다 — 찾아볼 곳은 LOOKUPS 로 따로
 * 서고, 거기서는 붙일 수 없다.
 *
 * 맞춰 보는 방향이 두 경우에 반대다.
 * - 친 글자: 자료 쪽 글자 안에 친 것이 들어 있나 («식약» → 식품의약품안전처)
 * - 실마리: 자료의 낱말이 제목·본문 안에 들어 있나
 *
 * 실마리 쪽을 뒤집어 보는 이유는 조사다. 본문을 낱말로 잘라 「망치를」로
 * 맞춰 보면 자료의 「망치」에 안 걸린다 — 반대로 보면 걸린다.
 */
export function findSources(
  typed: string,
  post: { title?: string; body?: string } = {},
): PostSource[] {
  const query = flatten(typed);
  const haystack = (source: PostSource) =>
    flatten(`${source.title} ${source.meta} ${source.keywords.join(" ")}`);

  const shelf = query
    ? sourceLibrary.filter((source) => haystack(source).includes(query))
    : (() => {
        const clue = flatten(`${post.title ?? ""} ${post.body ?? ""}`);
        if (clue.length < 2) return [];
        return sourceLibrary.filter((source) =>
          source.keywords
            // 한 글자짜리는 실마리로 못 쓴다 — 「말」이 「정말일까」에 걸려
            // 판사 이야기에 국어원 자료가 딸려 나왔다. 쳐서 찾을 때는 쓴다.
            .filter((word) => word.length > 1)
            .some((word) => clue.includes(flatten(word))),
        );
      })();

  // 셋이면 고르기 좋고, 그보다 많으면 글쓰기 화면이 목록에 잡아먹힌다.
  return shelf.slice(0, 3);
}

/**
 * 출처에 적힌 것을 확인하러 가는 곳.
 *
 * 어느 문서인지까지는 모른다 — 기관과 자료 이름만 아는 서랍의 것도, 손으로
 * 친 것도 마찬가지다. 그래서 적힌 글 그대로 웹을 뒤진다. 읽는 쪽이 「이
 * 출처가 이 말과 맞나」를 보러 가는 자리라 검색 결과만 열려도 할 일은 된다.
 *
 * 없는 주소를 지어내 걸지는 않는다. 눌렀더니 없는 문서가 뜨는 것은 출처가
 * 아예 없는 것보다 나쁘다 — 확인한 척이 되기 때문이다.
 */
export function sourceLink(text: string): string {
  return `https://www.google.com/search?q=${encodeURIComponent(text)}`;
}

/**
 * 「링크 이동」이 갈 곳 — 실제 주소가 적혀 있으면 거기, 아니면 출처 이름으로 검색.
 * 카드뉴스 지식은 디자이너가 프레임 주석에 적어 둔 주소를 `sourceUrl` 에 옮겨 두었다.
 */
export function sourceHref(post: Pick<Post, "source" | "sourceUrl">): string {
  return post.sourceUrl ?? sourceLink(post.source ?? "");
}

/**
 * 본문에서 O/X 로 물을 만한 문장 하나를 고른다 — 「AI 퀴즈 자동 생성」.
 *
 * 여기 붙일 모델이 아직 없다. 대신 글에 이미 있는 문장 중에서 가장 「물어볼
 * 만한」 것을 골라 내민다 — 없는 말을 지어내는 대신, 쓴 사람이 쓴 말을
 * 그대로 쓴다.
 *
 * 제목도 후보로 함께 넣는다. 본문이 「여러해살이풀의 열매다.」처럼 앞 문장에
 * 기대어 있으면 그것만 떼어 놓았을 때 무엇에 대한 말인지 알 수 없는데,
 * 그럴 때는 제목이 이긴다. 반대로 제목이 물음이면(「왜 …까?」) 벌점을 받아
 * 본문 문장에 자리를 내준다.
 *
 * 고르는 눈은 세 가지다.
 * - 숫자가 든 문장. 「240조각」처럼 잰 값은 맞다·틀리다가 분명하다.
 * - 뒤집는 말이 든 문장(아니 · 없 · 사실 · 실제 · 오히려…). 상식과 다른
 *   대목이라 퀴즈로 낼 값어치가 거기 있다.
 * - 제목의 낱말이 든 문장. 곁가지가 아니라 이 글의 줄기라는 표시다.
 *
 * 답은 O 로 둔다. 글쓴이는 자기가 적은 것을 참이라고 여기고 쓴다 — 뒤집어
 * 내고 싶으면 글쓰기 화면에서 X 로 바꾸면 된다.
 */

/** 상식과 다른 대목을 짚는 말. 퀴즈로 낼 값어치가 여기 있다. */
const TWIST = /(아니|없|사실|실제|오히려|알고\s*보면|처음|최초|유일|아직|반대로)/;

/** 문장 맨 앞의 이음말 — 떼어 놓으면 앞 문장을 찾게 만든다. */
const CONNECTIVE = /^(그런데|하지만|그래서|그리고|근데|사실은|즉|또한|또|게다가|다만)[,\s]+/;

/** 물음은 O/X 로 답할 문장이 아니다. */
const ASKING = /[?？]\s*$|까\s*[?？]?\s*$/;

function sentences(text: string): string[] {
  return text
    .split(/(?<=[.!?…])\s+|\n+/)
    .map((line) => line.replace(CONNECTIVE, "").trim())
    .filter((line) => line.length > 1);
}

/** 제목에서 뽑은, 이 글의 줄기를 이루는 낱말. */
function topicWords(title: string): string[] {
  return title
    .split(/[^가-힣a-zA-Z0-9]+/)
    .map((word) => word.slice(0, 3))
    .filter((word) => word.length > 1);
}

function scoreOf(line: string, topic: string[]): number {
  let score = 0;
  if (/\d/.test(line)) score += 3;
  if (TWIST.test(line)) score += 3;
  if (topic.some((word) => line.includes(word))) score += 2;

  // 너무 짧으면 무엇에 대한 말인지 모르고, 너무 길면 퀴즈로 읽히지 않는다
  if (line.length >= 15 && line.length <= 60) score += 2;
  else if (line.length >= 10 && line.length <= 80) score += 1;
  else if (line.length < 10) score -= 3;

  if (ASKING.test(line)) score -= 4;
  return score;
}

/**
 * 글쓰기 화면에 미리 채워 두는 글 — 시연용.
 *
 * 빈 칸을 보여 주면 시연에서 글을 그 자리에서 지어내야 한다. 채워 둔 글로
 * 퀴즈 초안 · 출처 찾아보기 · 등록까지 바로 보여 줄 수 있다.
 *
 * 앱 어디에도 없는 잡지식이어야 한다 — 목록에 이미 있는 글을 또 쓰면
 * 시연에서 「방금 올린 글」과 「원래 있던 글」이 겹친다. 사진은 빵집 계산대
 * 옆 막대사탕 진열을 찍은 것(checkout-candy.jpg)이다.
 *
 * 계산대 앞 사탕·젤리를 아이 눈높이에 두는 「페스터 파워」는 근거가 있는
 * 이야기다 — 호주 암협회(Cancer Council NSW)·뉴캐슬대의 조사(Health
 * Promotion International, 2012)와 테스코의 2014년 계산대 사탕 철수가
 * 그것이고, 둘 다 출처 서랍(sourceLibrary)에 넣어 두어 붙이기 후보로 뜬다.
 * 사진은 빵집 계산대 옆 막대사탕 진열을 찍은 것이다.
 *
 * 퀴즈도 적어 둔다. 자동 초안(draftQuiz)은 본문 첫 문장을 그대로 문제로
 * 삼는데, 첫 문장이 늘 문제로 읽히지는 않는다.
 */
export const writeSample = {
  category: "생활",
  title: "계산대 밑 젤리는 왜 그렇게 낮은 칸에 있을까?",
  body: "빵집이나 마트 계산대 아래쪽에는 꼭 젤리와 사탕이 있다. 부모가 계산하느라 손이 묶인 순간, 아이 눈높이에 두어 ‘사 달라’고 조르게 만드는 자리다. 유통 업계는 이걸 ‘페스터 파워(조르기 힘)’라 부른다. 호주 암협회와 뉴캐슬대 조사에서는 부모 4명 중 3명이 계산대에서 아이에게 졸렸고, 그중 70%가 결국 사 줬다. 영국 테스코는 2015년부터 모든 매장 계산대에서 사탕과 초콜릿을 치웠다.",
  photo: "/assets/community/checkout-candy.jpg",
  quiz: { question: "계산대 밑 젤리가 낮은 칸에 있는 건 아이가 조르게 하려는 마케팅일까?", answer: "O" } as Quiz,
} as const;

export function draftQuiz(title: string, body: string): Quiz {
  const topic = topicWords(title);
  // 제목도 후보다 — 본문 문장이 죄다 앞말에 기대어 있으면 제목이 이긴다
  const candidates = [title.trim(), ...sentences(body)].filter(Boolean);
  if (!candidates.length) return { question: "", answer: "O" };

  let best = candidates[0];
  let bestScore = -Infinity;
  for (const line of candidates) {
    const score = scoreOf(line, topic);
    // 같은 점수면 앞엣것 — 글은 하려는 말을 앞에 놓는다
    if (score > bestScore) {
      bestScore = score;
      best = line;
    }
  }

  const question = best
    // 물음이 뽑혔다면(달리 고를 것이 없을 때) 문장 꼴로 세워 둔다
    .replace(/^(왜|과연|진짜|정말)\s+/, "")
    .replace(/[?？]+\s*$/, "")
    .trim();

  return { question, answer: "O" };
}
