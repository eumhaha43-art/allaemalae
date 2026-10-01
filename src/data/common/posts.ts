import type { Comment, Post, Quiz } from "@/types/community";

/**
 * 커뮤니티 게시글 씨앗 — 갈래마다 열 편씩.
 *
 * 분류 칩으로 걸러 보는 화면이라 갈래마다 한 화면(4편)은 넘게 있어야 거르는
 * 맛이 난다. 전부 앱의 다른 자리(홈 · 채팅 · 토론 · 검색)에 안 나온 잡지식으로
 * 골랐다 — 같은 이야기가 두 군데 있으면 「이 앱에는 지식이 몇 개 없구나」가
 * 된다. 사진은 갈래마다 한 쪽(4편)에 하나 이상은 보이도록 붙였다(`image`) —
 * 없는 글은 목록 카드가 글 전체 폭으로 나온다. Unsplash 에서 받은 것은 줄마다
 * 사진가와 사진 주소를 적어 둔다(무료 라이선스 · 표기 의무는 없지만 남긴다).
 *
 * 출처는 실제 기관 · 매체와 자료 이름이다. 링크는 걸지 않는다(상세의 출처 줄이
 * 검색으로 보낸다). 출처를 비운 몇 편은 일부러 「카더라」로 남긴 것 — 목록에
 * 카더라 칩이 하나도 없으면 그 표시가 무엇인지 보여 줄 수 없다.
 */

const AVATAR = {
  night: "/assets/post/avatar-1.png",
  fridge: "/assets/post/avatar-2.png",
  ramen: "/assets/post/avatar-3.png",
  patrick: "/assets/post/avatar-patrick.jpg",
  cow: "/assets/post/avatar-cow.jpg",
  smile: "/assets/post/avatar-smile.jpg",
  wakeup: "/assets/post/avatar-wakeup.jpg",
  what: "/assets/post/avatar-what.jpg",
  monchhichi: "/assets/post/avatar-monchhichi.jpg",
  snowman: "/assets/post/avatar-snowman.jpg",
  pepper: "/assets/post/avatar-pepper.jpg",
  duck: "/assets/post/avatar-duck.jpg",
  orange: "/assets/post/avatar-orange.jpg",
  mii: "/assets/post/avatar-mii.jpg",
} as const;

/**
 * 사람들 — 이름과 등급, 얼굴이 전부 다르다. 앞의 여섯 중 셋(야간알바중 ·
 * 냉장고문닫아 · 점심에컵라면)은 채팅방 · 댓글 · 알림에도 같은 얼굴로 나오므로
 * 그대로 두고, 나머지 열하나는 받은 프로필 사진 열한 장을 하나씩 가진다.
 */
const WHO = [
  { author: "야간알바중", authorAvatar: AVATAR.night, authorLevel: "점장 Lv.3" },
  { author: "온도0도", authorAvatar: AVATAR.snowman, authorLevel: "알바 Lv.5" },
  { author: "삼각김밥러버", authorAvatar: AVATAR.smile, authorLevel: "단골 Lv.2" },
  { author: "냉장고문닫아", authorAvatar: AVATAR.fridge, authorLevel: "단골 Lv.4" },
  { author: "점심에컵라면", authorAvatar: AVATAR.ramen, authorLevel: "손님 Lv.1" },
  { author: "폐기담당", authorAvatar: AVATAR.duck, authorLevel: "알바 Lv.2" },
  { author: "새벽두시반", authorAvatar: AVATAR.patrick, authorLevel: "단골 Lv.6" },
  { author: "우유는뒤에", authorAvatar: AVATAR.cow, authorLevel: "점장 Lv.1" },
  { author: "바코드찍는손", authorAvatar: AVATAR.monchhichi, authorLevel: "알바 Lv.7" },
  { author: "1+1사냥꾼", authorAvatar: AVATAR.pepper, authorLevel: "단골 Lv.3" },
  { author: "출처는어디", authorAvatar: AVATAR.what, authorLevel: "손님 Lv.2" },
  { author: "빙그레한잔", authorAvatar: AVATAR.wakeup, authorLevel: "점장 Lv.2" },
  { author: "폐점10분전", authorAvatar: AVATAR.orange, authorLevel: "알바 Lv.4" },
  { author: "잡지식수집가", authorAvatar: AVATAR.mii, authorLevel: "단골 Lv.8" },
] as const;

/** 댓글 시각 — 글보다 뒤라야 하므로 「n시간 전」보다 짧은 말들을 돌려 쓴다. */
const AGO = ["방금", "12분 전", "35분 전", "1시간 전", "2시간 전", "4시간 전", "어제"];

type Seed = {
  id: string;
  category: string;
  /** 세부 갈래 — 메뉴 분야 카드 밑에 적힌 것 중 하나. 지식 목록이 「사회 법률」처럼 붙여 적는다. */
  topic: string;
  /** 목록 카드 오른쪽의 그림이자 상세 맨 위의 사진. 없으면 글이 전체 폭을 쓴다. */
  image?: string;
  title: string;
  /** 목록 카드의 두 줄 — 상세에서는 본문의 첫 문단이 된다. */
  excerpt: string;
  body: string[];
  /** 비우면 카더라. */
  source?: string;
  /** 출처의 실제 주소 — 카드뉴스는 프레임 주석에 적힌 것. */
  sourceUrl?: string;
  quiz: Quiz;
  who: number;
  when: string;
  /** [조회, 좋아요, 저장] — 댓글 수는 아래 댓글 수와 같다. */
  n: [number, number, number];
  /**
   * 댓글 — 첫 줄은 이 글에만 맞는 말, 둘째부터는 짧은 반응. 둘째 줄이 있으면
   * 첫 댓글에 단 답글로 붙는다. 다는 사람은 글쓴이를 뺀 나머지에서 돌려 뽑는다.
   */
  talk: string[];
  badge?: string;
  tags?: string[];
  /** 카드뉴스 그림들 — 있으면 상세가 글 카드 대신 이것을 편다(Post.cards). */
  cards?: string[];
  /** 카드뉴스 끝의 「영수증에 기록하세요」 카드 */
  recordCard?: boolean;
};

/** 글쓴이가 아닌 사람을 k 번째로 — 글마다 다른 사람이 달게 id 로 시작점을 옮긴다. */
function someone(who: number, seedText: string, k: number) {
  let h = 0;
  for (const ch of seedText) h = (h * 31 + ch.charCodeAt(0)) % 9973;
  const others = WHO.filter((_, i) => i !== who);
  return others[(h + k * 5) % others.length];
}

function make(seed: Seed): Post {
  const { who, n, talk, ...rest } = seed;
  const thread: Comment[] = talk.map((text, i) => {
    const person = someone(who, seed.id, i);
    return {
      id: `${seed.id}-c${i + 1}`,
      author: person.author,
      avatar: person.authorAvatar,
      when: AGO[(i * 2 + seed.id.length) % AGO.length],
      text,
      likes: (n[1] * (i + 3)) % 17,
      ...(i === 1 ? { reply: true } : null),
    };
  });
  return {
    ...rest,
    ...WHO[who],
    views: n[0],
    likes: n[1],
    comments: thread.length,
    saves: n[2],
    thread,
  };
}

export const seedPosts: Post[] = [
  // ── 역사 ─────────────────────────────────────────────────────────
  make({
    id: "hist-1",
    category: "역사",
    topic: "인물, 사건",
    image: "/assets/community/posts/hist-1-napoleon.jpg",
    title: "나폴레옹은 키가 작지 않았다",
    excerpt: "168cm — 당시 프랑스 남자 평균보다 조금 컸다. ‘땅딸보’는 영국 풍자화가 만든 이미지다.",
    body: [
      "나폴레옹의 키는 프랑스 단위로 5피에 2푸스, 오늘 단위로 약 168cm 였다. 당시 프랑스 성인 남성 평균(약 165cm)보다 오히려 컸다.",
      "그런데 프랑스 피에는 영국 피트보다 길어서, 영국 신문이 숫자를 그대로 옮겨 적으며 157cm 남짓으로 줄어들었다. 여기에 영국 풍자화가 그를 손바닥만 하게 그리면서 ‘작은 황제’가 굳어졌다.",
    ],
    source: "Fondation Napoléon · “Napoleon’s height”",
    quiz: { question: "나폴레옹은 당시 프랑스 남성 평균보다 키가 작았다.", answer: "X" },
    who: 0,
    when: "9시간 전",
    n: [1830, 96, 141],
    talk: [
      "영국 신문 단위 실수가 200년을 갔네요 ㅋㅋ",
      "풍자화 힘이 무섭긴 하다",
      "그럼 ‘나폴레옹 콤플렉스’도 근거가 없는 말이네",
    ],
    badge: "인기",
    tags: ["역사", "나폴레옹", "오해"],
  }),
  make({
    id: "hist-2",
    category: "역사",
    topic: "세계사",
    title: "로마 검투사는 대부분 경기에서 죽지 않았다",
    excerpt: "검투사는 몇 년을 들여 키운 비싼 자산이었다. 경기 대부분은 항복으로 끝났다.",
    body: [
      "영화 속 검투 경기는 둘 중 하나가 죽어야 끝나지만, 실제 기록은 다르다. 검투사 한 명을 키우는 데 몇 년과 큰돈이 들어서, 주인은 그를 쉽게 잃을 생각이 없었다.",
      "1세기 무렵의 경기 기록을 보면 열 경기 중 죽음으로 끝난 것은 하나 남짓이다. 항복 표시(손가락 들기)를 하면 대부분 살려 보냈고, 심판이 중간에 경기를 세우기도 했다.",
    ],
    source: "History Today · “The truth about gladiators”",
    quiz: { question: "로마 검투 경기는 대부분 한쪽이 죽어야 끝났다.", answer: "X" },
    who: 3,
    when: "12시간 전",
    n: [1204, 61, 88],
    talk: [
      "글래디에이터 다시 보면 안 되겠다…",
      "비싼 자산이라 못 죽인다는 게 현실적이라 더 와닿음",
      "손가락 들면 항복이었구나",
    ],
  }),
  make({
    id: "hist-3",
    category: "역사",
    topic: "세계사",
    // Unsplash · Ben Seymour (unsplash.com/photos/nqBUTBsDQNM)
    image: "/assets/community/posts/hist-3-oxford.jpg",
    title: "옥스퍼드 대학은 아즈텍 제국보다 오래됐다",
    excerpt: "옥스퍼드에서 강의가 있었다는 기록은 1096년. 아즈텍의 수도 테노치티틀란은 1325년에 세워졌다.",
    body: [
      "‘고대 문명’으로 배우는 아즈텍과 ‘지금도 있는 대학’인 옥스퍼드를 나란히 놓으면 이상하다. 그런데 옥스퍼드에서 가르쳤다는 가장 오래된 기록이 1096년이고, 아즈텍이 수도를 세운 것은 1325년이다.",
      "아즈텍이 사라진 1521년에 옥스퍼드는 이미 400년 넘게 학생을 받고 있었다. 우리가 ‘옛날’이라 뭉뚱그리는 시간이 실제로는 서로 한참 떨어져 있다.",
    ],
    source: "University of Oxford · “Introduction and history”",
    quiz: { question: "아즈텍의 수도 테노치티틀란은 옥스퍼드 대학보다 먼저 세워졌다.", answer: "X" },
    who: 2,
    when: "어제",
    n: [988, 44, 67],
    talk: [
      "시간 감각이 완전 뒤집히네요",
      "1096년이면 고려 초기인데 그때 대학이 있었다니",
      "아즈텍이 생각보다 최근이라는 게 포인트",
    ],
  }),
  make({
    id: "hist-4",
    category: "역사",
    topic: "한국사",
    title: "고려 벽란도에는 아라비아 상인도 왔다",
    excerpt: "개경 근처의 항구 벽란도에는 송·일본은 물론 아라비아 상인까지 드나들었다. ‘코리아’라는 이름도 이때 퍼졌다.",
    body: [
      "고려의 수도 개경에서 예성강을 따라 내려가면 벽란도가 있었다. 송나라와 일본 배가 늘 드나들었고, 고려사에는 1024년과 1040년에 대식국(아라비아) 상인이 와서 향료와 수은을 바쳤다는 기록이 있다.",
      "이들이 고려를 ‘Corea’로 부르며 서방에 전했다는 것이 ‘코리아’라는 이름의 유래로 널리 이야기된다. 조선의 쇄국 이미지 때문에 잊히기 쉽지만, 고려는 꽤 열린 나라였다.",
    ],
    source: "국사편찬위원회 · 「고려사」 세가 현종 15년",
    quiz: { question: "고려 시대에 아라비아 상인이 벽란도까지 왔다는 기록이 있다.", answer: "O" },
    who: 1,
    when: "어제",
    n: [1410, 77, 112],
    talk: [
      "고려사에 기록까지 있는 줄은 몰랐어요",
      "코리아 이름이 여기서 나왔다는 얘기 학교에서 들은 것 같아요",
      "벽란도 지금 가 보면 뭐가 남아 있나요?",
    ],
    tags: ["역사", "고려", "무역"],
  }),
  make({
    id: "hist-5",
    category: "역사",
    topic: "인물, 사건",
    title: "역사상 가장 짧은 전쟁은 40분 만에 끝났다",
    excerpt: "1896년 영국과 잔지바르 사이의 전쟁. 오전 9시에 시작해 9시 40분쯤 끝났다.",
    body: [
      "1896년 8월 27일, 잔지바르의 새 술탄이 영국의 뜻에 맞지 않는 사람이었다. 영국은 최후통첩을 보냈고, 답이 없자 함대가 궁전을 포격했다.",
      "궁전은 곧 불탔고 술탄은 도망쳤다. 시작부터 항복까지 38분에서 45분 — 기록마다 조금씩 다르지만 한 시간을 못 채운 것은 같다. 기네스에 ‘가장 짧은 전쟁’으로 올라 있다.",
    ],
    source: "Guinness World Records · “Shortest war”",
    quiz: { question: "영국–잔지바르 전쟁은 한 시간이 채 걸리지 않았다.", answer: "O" },
    who: 5,
    when: "2일 전",
    n: [760, 39, 51],
    talk: [
      "40분이면 야간 폐기 정리 시간보다 짧네",
      "궁전 불타는 데 40분… 화력이 ㄷㄷ",
      "기네스에 이런 것도 올라가는구나",
    ],
  }),
  make({
    id: "hist-6",
    category: "역사",
    topic: "인물, 사건",
    // Unsplash · Andrea De Santis (unsplash.com/photos/i2BcaGXomv0)
    image: "/assets/community/posts/hist-6-radios.jpg",
    title: "‘우주 전쟁’ 라디오 패닉은 신문이 부풀렸다",
    excerpt: "1938년 라디오 드라마 때문에 미국이 공황에 빠졌다는 이야기는, 라디오를 견제하던 신문이 키운 것이다.",
    body: [
      "오슨 웰스의 라디오 드라마 ‘우주 전쟁’이 화성인 침공을 뉴스처럼 내보내 온 나라가 도망쳤다는 이야기는 유명하다. 그런데 당시 청취율 조사에서 그 방송을 들은 사람은 전체의 2% 남짓이었다.",
      "다음 날 신문들이 ‘공황’을 1면에 실었는데, 광고비를 라디오에 빼앗기던 신문이 라디오의 위험을 부풀렸다는 것이 지금의 정설이다. 실제 경찰 기록에도 대규모 소동은 없다.",
    ],
    source: "Smithsonian Magazine · “The Infamous ‘War of the Worlds’ Radio Broadcast Was a Magnificent Fluke”",
    quiz: { question: "1938년 ‘우주 전쟁’ 방송으로 미국 전역이 실제로 공황에 빠졌다.", answer: "X" },
    who: 4,
    when: "2일 전",
    n: [640, 28, 40],
    talk: [
      "2%가 들었는데 전국 공황이었다는 게 말이 안 되긴 했음",
      "신문 vs 라디오 광고 전쟁이었다는 게 제일 재밌다",
      "그래서 지금까지도 교과서에 나오는 거 보면 신문이 이긴 듯",
    ],
  }),
  make({
    id: "hist-7",
    category: "역사",
    topic: "인물, 사건",
    image: "/assets/community/posts/hist-7-vangogh.jpg",
    title: "반 고흐는 살아서 그림을 딱 한 점 팔았다",
    excerpt: "확실하게 팔린 기록이 남은 것은 ‘붉은 포도밭’ 한 점. 지금 그의 그림은 한 점에 수천억 원이다.",
    body: [
      "반 고흐가 생전에 돈을 받고 판 것이 확실한 그림은 1890년 브뤼셀 전시에서 팔린 ‘붉은 포도밭’이다. 값은 400프랑, 지금 돈으로 몇백만 원 남짓이었다.",
      "그는 그해 세상을 떠났고, 동생 테오의 아내 요한나가 그림과 편지를 정리해 세상에 알리면서 이름이 퍼졌다. 그가 남긴 2천 점 넘는 작품은 거의 다 팔리지 않은 채 동생 집에 쌓여 있었다.",
    ],
    source: "Van Gogh Museum · “Did Van Gogh sell only one painting?”",
    quiz: { question: "반 고흐는 살아 있는 동안 그림을 수백 점 팔았다.", answer: "X" },
    who: 2,
    when: "3일 전",
    n: [1520, 103, 164],
    talk: [
      "살아서 한 점 팔았는데 지금은 수천억… 세상 참",
      "요한나가 없었으면 우리는 반 고흐를 몰랐을 수도",
      "붉은 포도밭 어디 있어요? 보러 가고 싶다",
    ],
    badge: "인기",
  }),
  make({
    id: "hist-8",
    category: "역사",
    topic: "세계사",
    title: "고대 올림픽 선수는 알몸으로 뛰었다",
    excerpt: "‘체육관’의 어원 gymnasion 은 ‘벌거벗은 곳’이라는 뜻이다.",
    body: [
      "고대 그리스 올림픽에서 선수들은 옷을 입지 않았다. 기원전 720년 무렵부터의 전통으로, 몸을 단련한 결과를 그대로 보여 주는 것이 자랑이었다.",
      "체육관을 뜻하는 영어 gymnasium 은 그리스어 gymnos(벌거벗은)에서 왔다. 여자는 관람도 할 수 없었고, 기혼 여성이 몰래 들어오면 벌을 받았다.",
    ],
    source: "Penn Museum · “The Real Story of the Ancient Olympic Games”",
    quiz: { question: "‘gymnasium’의 어원은 ‘벌거벗은’이라는 뜻의 그리스어다.", answer: "O" },
    who: 0,
    when: "3일 전",
    n: [870, 52, 63],
    talk: [
      "헬스장 갈 때마다 생각날 듯 ㅋㅋ",
      "기혼 여성 관람 금지는 처음 알았네요",
      "gym 어원이 이거였다니",
    ],
  }),
  make({
    id: "hist-9",
    category: "역사",
    topic: "세계사",
    // Unsplash · Anthony DELANOIX (unsplash.com/photos/Q0-fOL2nqZc)
    image: "/assets/community/posts/hist-9-eiffel.jpg",
    title: "에펠탑은 20년 뒤 철거될 예정이었다",
    excerpt: "1889년 박람회용으로 세워 1909년에 헐기로 했다. 무선 안테나로 쓸모가 생겨 살아남았다.",
    body: [
      "에펠탑은 1889년 파리 만국박람회의 입구로 세워졌고, 허가 조건은 ‘20년 뒤 철거’였다. 파리 예술가들은 ‘쓸모없는 쇠 괴물’이라며 철거를 주장했다.",
      "에펠은 탑을 살리려고 꼭대기를 무선 전신 실험에 내주었다. 1차 대전 때 이 안테나가 군 통신에 쓰이면서 탑은 철거 대상에서 빠졌고, 지금은 파리 그 자체가 됐다.",
    ],
    source: "La Tour Eiffel (SETE) · “History of the Eiffel Tower”",
    quiz: { question: "에펠탑은 처음부터 영구 건축물로 지어졌다.", answer: "X" },
    who: 3,
    when: "4일 전",
    n: [690, 33, 47],
    talk: [
      "안테나 덕분에 살아남은 거였다니",
      "쓸모없는 쇠 괴물 → 파리의 상징, 평가가 이렇게 바뀜",
      "그때 헐었으면 파리 사진이 다 달라졌겠네요",
    ],
  }),
  make({
    id: "hist-10",
    category: "역사",
    topic: "한국사",
    title: "조선 왕은 자기 실록을 볼 수 없었다",
    excerpt: "태종이 사냥 중 말에서 떨어지고 “사관이 모르게 하라”고 했는데, 사관은 그 말까지 적었다.",
    body: [
      "조선왕조실록은 왕이 죽은 뒤에 편찬됐고, 살아 있는 왕은 자기 기록을 볼 수 없었다. 왕이 보면 사관이 눈치를 보게 되어 기록이 휘어진다는 이유였다.",
      "태종 4년, 왕이 사냥 중 말에서 떨어지고는 “사관이 알게 하지 말라”고 했다. 실록에는 그 낙마와 그 말까지 그대로 적혀 있다. 왕도 지우지 못한 기록이 500년 동안 이어졌다.",
    ],
    source: "국사편찬위원회 · 「태종실록」 4년 2월 8일",
    quiz: { question: "조선의 왕은 원할 때 자기 실록을 열람할 수 있었다.", answer: "X" },
    who: 1,
    when: "5일 전",
    n: [2210, 158, 240],
    talk: [
      "사관이 진짜 그 말까지 적었다는 게 웃기고 대단함",
      "왕도 못 건드리는 기록이라 500년이 남은 거구나",
      "태종 낙마 기록 찾아서 읽어봤는데 진짜네요 ㅋㅋ",
    ],
    badge: "인기",
    tags: ["역사", "조선", "실록"],
  }),

  // ── 과학 ─────────────────────────────────────────────────────────
  make({
    id: "sci-1",
    category: "과학",
    topic: "자연",
    image: "/assets/community/posts/sci-1-honey.jpg",
    title: "꿀은 3천 년이 지나도 썩지 않는다",
    excerpt: "이집트 무덤에서 나온 꿀이 먹을 수 있는 상태였다. 수분이 거의 없고 산성이라 균이 못 산다.",
    body: [
      "꿀은 수분이 17% 안팎으로 매우 적고 당이 빽빽해서, 균이 물을 얻지 못해 살 수 없다. 여기에 벌이 넣는 효소가 과산화수소를 만들고, 꿀 자체가 약한 산성이다.",
      "그래서 밀봉만 잘 돼 있으면 상하지 않는다. 고고학자들이 이집트 무덤에서 꺼낸 수천 년 된 꿀 항아리가 그대로였다는 보고가 여러 건이다.",
    ],
    source: "Smithsonian Magazine · “The Science Behind Honey’s Eternal Shelf Life”",
    quiz: { question: "꿀은 밀봉만 잘 하면 수천 년이 지나도 상하지 않는다.", answer: "O" },
    who: 4,
    when: "7시간 전",
    n: [1690, 112, 198],
    talk: [
      "집에 있는 꿀 굳은 거 버렸는데… 아까워",
      "굳은 건 상한 게 아니라 결정이라고 하더라고요",
      "이집트 꿀 먹어본 사람 있나",
    ],
    badge: "인기",
  }),
  make({
    id: "sci-2",
    category: "과학",
    topic: "자연",
    image: "/assets/community/posts/sci-2-lightning.jpg",
    title: "번개는 같은 자리에 몇 번이고 친다",
    excerpt: "엠파이어 스테이트 빌딩은 한 해에 20번 넘게 번개를 맞는다. 높고 뾰족한 곳이 늘 먼저다.",
    body: [
      "‘번개는 같은 자리에 두 번 치지 않는다’는 속담은 틀렸다. 번개는 땅에서 가장 높고 뾰족한 곳을 고르기 때문에, 그런 곳은 계속 맞는다.",
      "뉴욕 엠파이어 스테이트 빌딩은 한 해 평균 20~25번 번개를 맞는다. 미국 해양대기청은 이 속담을 대표적인 번개 오해로 꼽는다.",
    ],
    source: "NOAA National Weather Service · “Lightning Myths”",
    quiz: { question: "번개는 같은 자리에 두 번 치지 않는다.", answer: "X" },
    who: 0,
    when: "14시간 전",
    n: [920, 48, 66],
    talk: [
      "속담이 틀렸다는 걸 이제 알았네요",
      "높고 뾰족한 데 서 있지 말라는 뜻이었구나",
      "엠파이어 스테이트 빌딩 피뢰침 일 많이 하네",
    ],
  }),
  make({
    id: "sci-3",
    category: "과학",
    topic: "우주",
    title: "우리 몸의 원자는 별 안에서 만들어졌다",
    excerpt: "탄소 · 산소 · 철 같은 원소는 별의 핵융합과 폭발에서 나왔다. 말 그대로 별의 먼지다.",
    body: [
      "우주가 처음 생겼을 때는 수소와 헬륨이 거의 전부였다. 사람 몸을 이루는 탄소, 산소, 질소, 철은 그 뒤 별 안에서 핵융합으로 만들어졌다.",
      "별이 수명을 다해 터지면서 이 원소들이 우주로 흩어졌고, 그것이 모여 지구와 생명이 됐다. 몸무게의 90% 넘는 원자가 별 출신이다.",
    ],
    source: "NASA · “We Are Stardust”",
    quiz: { question: "사람 몸의 탄소와 산소는 별 안에서 만들어진 원소다.", answer: "O" },
    who: 2,
    when: "어제",
    n: [1130, 89, 133],
    talk: [
      "별의 먼지라는 말이 그냥 낭만이 아니었네",
      "탄소 산소 철이 다 별에서… 소름",
      "그럼 우리 몸 중에 수소만 빅뱅 출신이라는 거죠?",
    ],
  }),
  make({
    id: "sci-4",
    category: "과학",
    topic: "자연",
    title: "물은 끓기 직전이 가장 시끄럽다",
    excerpt: "바닥에서 생긴 작은 기포가 위쪽 찬물에 닿아 터지는 소리다. 다 끓으면 오히려 조용해진다.",
    body: [
      "주전자가 끓기 전에 ‘쉬이익’ 하는 소리는 바닥의 물이 먼저 끓어 만든 작은 기포가 위쪽의 아직 찬 물을 만나 터지는 소리다. 수많은 기포가 터지며 내는 소리가 합쳐져 시끄럽다.",
      "물 전체가 끓는점에 이르면 기포가 터지지 않고 그대로 올라와 수면에서 터지므로 소리가 낮고 부드러워진다. 그래서 ‘끓기 전이 제일 시끄럽다’.",
    ],
    quiz: { question: "주전자는 물이 완전히 끓을 때 가장 시끄럽다.", answer: "X" },
    who: 5,
    when: "어제",
    n: [560, 27, 38],
    talk: [
      "라면 끓일 때마다 들었던 그 소리가 이거였구나",
      "끓기 전이 제일 시끄럽다 → 인생도 그런 듯",
      "출처 없어도 이건 집에서 바로 확인 가능해서 인정",
    ],
  }),
  /*
    카드뉴스로 다시 만든 것 — Figma 1658:10949(「완성」 1595:4827 안). 카드 셋과
    기록 카드. 출처 주소는 프레임 주석에 적힌 것이다.
  */
  make({
    id: "sci-5",
    category: "과학",
    topic: "우주",
    image: "/assets/knowledge/sci-5/1.webp",
    title: "금성에서는 하루가 1년보다 길다",
    excerpt: "한 바퀴 자전에 243일, 태양을 한 바퀴 도는 데 225일. 게다가 거꾸로 돈다.",
    body: [
      "하루가 1년보다 긴 행성이 있다고? 금성은 하루가 1년보다 더 긴, 아주 신기한 행성이에요.",
      "지구는 한 바퀴 도는 데 24시간이 걸리는 반면 금성은 243일이 걸리기 때문이에요. 그런데 태양을 한 바퀴 도는 공전은 225일이면 끝나요 — 하루가 1년보다 긴 셈이죠.",
      "게다가 다른 행성과 반대 방향으로 돌아요. 금성에서 해는 서쪽에서 떠서 동쪽으로 져요.",
    ],
    source: "NASA Science · “Venus: Facts”",
    sourceUrl: "https://science.nasa.gov/venus/venus-facts/",
    cards: [1, 2, 3].map((n) => `/assets/knowledge/sci-5/${n}.webp`),
    recordCard: true,
    quiz: { question: "금성은 자전 한 바퀴가 공전 한 바퀴보다 오래 걸린다.", answer: "O" },
    who: 1,
    when: "2일 전",
    n: [840, 41, 59],
    talk: [
      "하루가 1년보다 길다는 문장이 이해되는 데 30초 걸림",
      "해가 서쪽에서 뜬다는 말은 금성 얘기였네 ㅋㅋ",
      "거꾸로 도는 이유는 아직 모른다면서요",
    ],
  }),
  make({
    id: "sci-6",
    category: "과학",
    topic: "자연",
    title: "위산은 면도날도 녹인다",
    excerpt: "위액은 pH 1~2 로 강한 산이다. 실험에서 면도날이 하루 만에 절반 넘게 녹았다.",
    body: [
      "위액의 주성분은 염산이다. pH 1에서 2 사이로, 금속을 부식시킬 만큼 강하다. 위벽이 안 녹는 것은 점막이 계속 새로 덮이기 때문이다.",
      "1997년 한 실험에서 면도날을 위액에 넣자 24시간 뒤 무게가 절반 넘게 줄었다. 그렇다고 삼키면 안 된다 — 녹기 전에 다친다.",
    ],
    source: "Gastrointestinal Endoscopy · “Corrosion of razor blades in gastric acid” (1997)",
    quiz: { question: "위액은 금속을 녹일 만큼 강한 산성이다.", answer: "O" },
    who: 3,
    when: "2일 전",
    n: [1380, 71, 97],
    talk: [
      "점막이 매일 새로 덮인다는 게 핵심이네",
      "면도날 실험은 누가 왜 한 걸까 ㅋㅋ",
      "그래도 삼키면 안 된다는 마지막 줄 중요",
    ],
  }),
  make({
    id: "sci-7",
    category: "과학",
    topic: "동물",
    image: "/assets/community/posts/sci-7-shark.jpg",
    title: "상어는 나무보다 오래된 생물이다",
    excerpt: "상어는 약 4억 5천만 년 전에 나타났고, 나무는 그보다 뒤인 3억 5천만 년 전이다.",
    body: [
      "상어의 조상은 약 4억 5천만 년 전 바다에 나타났다. 지구에 나무가 처음 자란 것은 그보다 1억 년쯤 뒤다. 토성의 고리보다도 오래됐다는 계산도 있다.",
      "그 긴 시간 동안 다섯 번의 대멸종을 다 넘겼다. 모양이 크게 바뀌지 않은 것은 처음부터 잘 만들어졌기 때문이다.",
    ],
    source: "Natural History Museum (London) · “Shark evolution: a 450 million year timeline”",
    quiz: { question: "지구에는 상어보다 나무가 먼저 나타났다.", answer: "X" },
    who: 4,
    when: "3일 전",
    n: [1050, 63, 81],
    talk: [
      "대멸종 다섯 번을 다 넘겼다는 게 제일 무섭다",
      "토성 고리보다 오래됐다는 계산은 처음 봐요",
      "처음부터 잘 만들어져서 안 바뀌었다는 말 좋네",
    ],
  }),
  make({
    id: "sci-8",
    category: "과학",
    topic: "자연",
    title: "뜨거운 물이 찬물보다 먼저 얼 수 있다",
    excerpt: "음펨바 효과. 탄자니아 학생이 아이스크림을 만들다 발견했고, 아직도 이유가 다 밝혀지지 않았다.",
    body: [
      "1963년 탄자니아의 중학생 음펨바가 뜨거운 우유를 바로 얼렸더니 식힌 것보다 먼저 얼었다. 선생님은 비웃었지만, 방문한 물리학자가 실험으로 확인해 논문을 냈다.",
      "증발, 대류, 물속 녹은 기체 등 여러 설명이 있지만 조건에 따라 결과가 달라서 지금도 논쟁 중이다. 확실한 것은 ‘항상 찬물이 먼저 언다’가 틀렸다는 것.",
    ],
    source: "Royal Society of Chemistry · “The Mpemba effect”",
    quiz: { question: "조건에 따라 뜨거운 물이 찬물보다 먼저 얼기도 한다.", answer: "O" },
    who: 0,
    when: "4일 전",
    n: [720, 35, 49],
    talk: [
      "중학생 발견을 물리학자가 확인해 준 게 멋있다",
      "아직도 이유 논쟁 중이라는 게 더 신기",
      "얼음 틀에 뜨거운 물 넣어봐야지",
    ],
  }),
  make({
    id: "sci-9",
    category: "과학",
    topic: "우주",
    // Unsplash · James Lee (unsplash.com/photos/F15yYq9aAsM)
    image: "/assets/community/posts/sci-9-dinosaur.jpg",
    title: "공룡 시대의 하루는 23시간이었다",
    excerpt: "달이 지구 자전을 조금씩 늦춘다. 100년에 약 1.8밀리초씩, 쌓이면 꽤 된다.",
    body: [
      "달의 중력이 만드는 밀물과 썰물이 지구의 자전을 브레이크처럼 붙잡는다. 그 결과 하루는 100년에 약 1.8밀리초씩 길어지고 있다.",
      "거꾸로 가면 공룡이 살던 7천만 년 전의 하루는 약 23시간 반, 산호 화석으로 잰 4억 년 전의 하루는 22시간 남짓이었다. 그때 1년은 400일이 넘었다.",
    ],
    source: "NASA · “Earth’s rotation is slowing down”",
    quiz: { question: "지구의 하루는 옛날보다 지금이 더 길다.", answer: "O" },
    who: 2,
    when: "5일 전",
    n: [610, 30, 44],
    talk: [
      "공룡은 하루가 30분 짧았구나",
      "1년이 400일이었다니 달력이 달랐겠네요",
      "100년에 1.8밀리초… 쌓이면 이렇게 되는구나",
    ],
  }),
  make({
    id: "sci-10",
    category: "과학",
    topic: "자연",
    // Unsplash · Omar Lopez (unsplash.com/photos/vTknj2OxDVg)
    image: "/assets/community/posts/sci-10-baby.jpg",
    title: "아기는 뼈가 300개, 어른은 206개다",
    excerpt: "자라면서 뼈가 없어지는 게 아니라 여러 조각이 하나로 붙는다. 머리뼈가 대표적이다.",
    body: [
      "갓난아기의 뼈는 약 300개다. 태어날 때 산도를 지나기 쉽게 머리뼈가 여러 조각으로 나뉘어 있고, 팔다리의 긴 뼈도 양 끝이 연골로 따로 있다.",
      "자라면서 이 조각들이 맞붙어 어른이 되면 206개가 된다. 마지막으로 붙는 쇄골은 스무 살이 넘어서야 완전히 굳는다.",
    ],
    source: "Cleveland Clinic · “How Many Bones Does a Baby Have?”",
    quiz: { question: "사람은 자라면서 뼈의 개수가 줄어든다.", answer: "O" },
    who: 5,
    when: "6일 전",
    n: [930, 46, 62],
    talk: [
      "뼈가 줄어드는 게 아니라 붙는 거였네",
      "쇄골이 스무 살 넘어서 굳는다는 건 처음 알았어요",
      "아기 머리뼈가 조각인 이유가 이거였구나",
    ],
  }),

  // ── 생활 ─────────────────────────────────────────────────────
  make({
    id: "life-1",
    category: "생활",
    topic: "음식",
    // Unsplash · S. Laiba Ali (unsplash.com/photos/oVu0Xl3cu18)
    image: "/assets/community/posts/life-1-fridge.jpg",
    title: "냉장고 문 쪽 칸에 우유를 두면 안 된다",
    excerpt: "문을 여닫을 때마다 가장 따뜻해지는 자리가 문 쪽 선반이다. 우유는 안쪽 깊숙이.",
    body: [
      "냉장고 문 안쪽 선반은 문을 열 때마다 바깥 공기에 바로 닿아 온도가 가장 많이 오르내린다. 우유처럼 상하기 쉬운 것을 두기에 가장 나쁜 자리다.",
      "문 쪽에는 소스나 음료처럼 온도에 덜 민감한 것을 두고, 우유와 달걀은 안쪽 선반 뒤에 두는 것이 좋다. 냉장고를 절반 이상 채워 두면 온도도 덜 흔들린다.",
    ],
    source: "USDA FoodSafety.gov · “Are You Storing Food Safely?”",
    quiz: { question: "냉장고 문 쪽 선반은 우유를 두기 좋은 자리다.", answer: "X" },
    who: 1,
    when: "5시간 전",
    n: [2050, 134, 227],
    talk: [
      "문 쪽에 우유 넣던 사람 여기 있습니다…",
      "야간에 우유 채울 때 안쪽 뒤로 넣어요 이 이유",
      "냉장고 반 이상 채우라는 것도 처음 들음",
    ],
    badge: "인기",
    tags: ["생활", "냉장고", "보관"],
  }),
  make({
    id: "life-2",
    category: "생활",
    topic: "음식",
    title: "달걀은 뾰족한 쪽을 아래로 두면 오래 간다",
    excerpt: "둥근 쪽에 공기주머니가 있다. 그쪽이 위로 가야 노른자가 공기주머니에 안 닿는다.",
    body: [
      "달걀의 둥근 쪽 끝에는 공기주머니가 있다. 뾰족한 쪽을 아래로 세우면 공기주머니가 위에 머물러 노른자가 거기 닿지 않고 가운데에 머문다.",
      "노른자가 공기주머니 쪽 얇은 막에 닿으면 균이 들어오기 쉽다. 달걀판이 뾰족한 쪽을 아래로 꽂게 생긴 이유다.",
    ],
    source: "American Egg Board · “Egg Storage”",
    quiz: { question: "달걀은 둥근 쪽을 아래로 보관하는 것이 좋다.", answer: "X" },
    who: 4,
    when: "11시간 전",
    n: [1240, 68, 142],
    talk: [
      "달걀판 방향이 다 이유가 있었네",
      "둥근 쪽 공기주머니 확인해봤는데 진짜 있음",
      "편의점 달걀도 이렇게 꽂혀 있는 이유",
    ],
  }),
  make({
    id: "life-3",
    category: "생활",
    topic: "건강",
    title: "식은 밥을 실온에 오래 두면 ‘볶음밥 증후군’",
    excerpt: "밥에 있던 바실루스 세레우스 균은 끓여도 살아남는 포자를 만든다. 밥은 두 시간 안에 냉장.",
    body: [
      "쌀에는 원래 바실루스 세레우스라는 균의 포자가 있다. 밥을 지어도 포자는 살아남고, 밥이 실온에서 식는 동안 깨어나 독소를 만든다.",
      "이 독소는 다시 데워도 없어지지 않는다. 볶음밥으로 자주 탈이 나서 ‘볶음밥 증후군’이라 부른다. 남은 밥은 두 시간 안에 냉장하고, 냉장한 밥은 하루 안에 먹는 것이 좋다.",
    ],
    source: "식품의약품안전처 · 「바실루스 세레우스 식중독 예방 요령」",
    quiz: { question: "실온에 오래 둔 밥은 다시 데우면 안전하다.", answer: "X" },
    who: 0,
    when: "어제",
    n: [1580, 97, 176],
    talk: [
      "볶음밥 증후군이라는 이름이 있는지 몰랐어요",
      "다시 데워도 안 없어진다는 게 무섭네",
      "남은 밥은 바로 냉장, 메모",
    ],
  }),
  make({
    id: "life-4",
    category: "생활",
    topic: "일상",
    // Unsplash · Vlad Zaytsev (unsplash.com/photos/DV3xrcq6hU4)
    image: "/assets/community/posts/life-4-microwave.jpg",
    title: "전자레인지는 안에서부터 데우지 않는다",
    excerpt: "마이크로파는 겉에서 2~3cm 까지만 들어간다. 안쪽은 겉의 열이 전해져 데워지는 것.",
    body: [
      "‘전자레인지는 속부터 익힌다’는 말은 틀렸다. 마이크로파는 음식 겉면에서 2~3cm 깊이까지만 들어가 물 분자를 흔들고, 그 안쪽은 겉에서 전해진 열로 데워진다.",
      "그래서 두꺼운 음식은 가운데가 차갑게 남는다. 중간에 한 번 저어 주거나 뒤집는 이유, 그리고 조리 뒤 ‘1분 두세요’가 붙는 이유다.",
    ],
    source: "U.S. FDA · “Microwave Oven Radiation”",
    quiz: { question: "전자레인지의 마이크로파는 음식 한가운데까지 바로 들어간다.", answer: "X" },
    who: 3,
    when: "어제",
    n: [990, 52, 88],
    talk: [
      "속부터 익는다고 배웠는데 반대였네",
      "가운데 차가운 이유가 이거였구나",
      "1분 두세요가 괜히 붙은 게 아니었음",
    ],
  }),
  make({
    id: "life-5",
    category: "생활",
    topic: "음식",
    // Unsplash · Julia Kicova (unsplash.com/photos/2ip11Nhylts)
    image: "/assets/community/posts/life-5-apples.jpg",
    title: "감자 옆에 사과를 두면 싹이 안 난다",
    excerpt: "사과가 내는 에틸렌 가스가 감자의 싹 트는 것을 억누른다. 다른 과일은 반대로 빨리 익힌다.",
    body: [
      "사과는 에틸렌이라는 기체를 낸다. 대부분의 과일은 이 기체에 닿으면 빨리 익어서 사과와 같이 두면 금방 무르는데, 감자는 반대로 싹이 트는 것이 억눌린다.",
      "감자 상자에 사과 한두 알을 넣어 두면 보관 기간이 눈에 띄게 길어진다. 대신 사과 옆에 바나나나 키위를 두면 며칠 만에 익어 버린다.",
    ],
    source: "농촌진흥청 · 「감자 저장 관리 요령」",
    quiz: { question: "사과에서 나오는 에틸렌은 감자의 싹을 빨리 틔운다.", answer: "X" },
    who: 2,
    when: "2일 전",
    n: [870, 49, 103],
    talk: [
      "감자 상자에 사과 넣어봤는데 진짜 싹 안 나요",
      "바나나 옆에 사과 두면 안 되는 이유도 같은 거네",
      "에틸렌이 이렇게 양면적일 줄이야",
    ],
  }),
  make({
    id: "life-6",
    category: "생활",
    topic: "건강",
    title: "손은 20초 — ‘생일 축하합니다’ 두 번 길이",
    excerpt: "비누로 20초 넘게 문질러야 균이 충분히 떨어진다. 대부분은 6초 만에 끝낸다.",
    body: [
      "손 씻기의 핵심은 비누보다 시간이다. 비누 거품으로 20초 이상 문질러야 손의 균이 충분히 떨어져 나가는데, 조사에 따르면 사람들 대부분은 6초 안팎에 끝낸다.",
      "20초를 재기 어려우면 ‘생일 축하합니다’ 노래를 속으로 두 번 부르면 된다. 손톱 밑과 엄지, 손목까지가 자주 빠지는 자리다.",
    ],
    source: "CDC · “When and How to Wash Your Hands”",
    quiz: { question: "손은 비누로 20초 이상 문질러 씻는 것이 권장된다.", answer: "O" },
    who: 5,
    when: "2일 전",
    n: [640, 31, 55],
    talk: [
      "6초 만에 끝내는 사람 접니다",
      "생일 축하 노래 두 번 은근 길다",
      "엄지랑 손목이 자주 빠진다는 거 공감",
    ],
  }),
  make({
    id: "life-7",
    category: "생활",
    topic: "일상",
    // Unsplash · Andreas Haslinger (unsplash.com/photos/W9Z87k4hV08)
    image: "/assets/community/posts/life-7-charging.jpg",
    title: "스마트폰 배터리는 20~80% 사이가 제일 편하다",
    excerpt: "0%까지 쓰고 100%까지 채우는 것이 배터리에는 가장 힘든 일이다.",
    body: [
      "리튬이온 배터리는 완전히 비우거나 완전히 채운 상태에서 가장 빨리 늙는다. 20%에서 80% 사이를 오가면 같은 배터리로 더 많은 충전 횟수를 쓸 수 있다.",
      "요즘 폰의 ‘배터리 보호’ 설정은 충전을 80%에서 멈추는 기능이다. 밤새 꽂아 두는 것보다 낮에 조금씩 채우는 편이 낫다.",
    ],
    source: "Battery University · “BU-808: How to Prolong Lithium-based Batteries”",
    quiz: { question: "리튬이온 배터리는 0%까지 다 쓰고 충전하는 것이 수명에 좋다.", answer: "X" },
    who: 1,
    when: "3일 전",
    n: [1320, 84, 156],
    talk: [
      "밤새 꽂아두는 습관 고쳐야겠다",
      "배터리 보호 설정이 80%에서 멈추는 거였구나",
      "0%까지 쓰는 게 좋다는 말 옛날 배터리 얘기였네",
    ],
  }),
  make({
    id: "life-8",
    category: "생활",
    topic: "일상",
    title: "옷 라벨의 세모는 ‘표백’ 기호다",
    excerpt: "물통은 세탁, 세모는 표백, 네모는 건조, 다리미는 다림질, 동그라미는 드라이클리닝.",
    body: [
      "옷 안쪽 라벨의 그림은 다섯 가지뿐이다. 물이 담긴 통은 물세탁, 세모는 표백, 네모는 건조, 다리미는 다림질, 동그라미는 드라이클리닝이다.",
      "그림에 X가 그어져 있으면 ‘하지 말라’는 뜻이고, 안의 점 개수는 온도다. 세모에 빗금이 있으면 산소계 표백만 된다는 뜻이다.",
    ],
    source: "국가기술표준원 · KS K 0021 「섬유제품의 취급에 관한 표시 기호」",
    quiz: { question: "옷 라벨의 세모 기호는 건조 방법을 뜻한다.", answer: "X" },
    who: 4,
    when: "3일 전",
    n: [780, 40, 91],
    talk: [
      "세모가 표백인 줄 오늘 처음 알았어요",
      "점 개수가 온도라는 것도 처음",
      "라벨 볼 때마다 뭔지 몰랐는데 감사",
    ],
  }),
  make({
    id: "life-9",
    category: "생활",
    topic: "일상",
    title: "냄비 뚜껑만 덮어도 가스비가 준다",
    excerpt: "뚜껑을 덮으면 같은 물이 훨씬 빨리 끓는다. 에너지도 4분의 1쯤 아낀다.",
    body: [
      "물을 끓일 때 나가는 열의 상당 부분은 수증기로 날아간다. 뚜껑을 덮으면 그 열이 냄비 안에 머물러 같은 양의 물이 훨씬 빨리 끓는다.",
      "에너지공단 자료로는 뚜껑을 덮고 조리하면 연료를 약 25% 아낄 수 있다. 냄비 바닥에 맞는 화구를 쓰는 것도 같은 이유로 중요하다.",
    ],
    quiz: { question: "냄비 뚜껑을 덮으면 물이 더 빨리 끓는다.", answer: "O" },
    who: 0,
    when: "4일 전",
    n: [520, 24, 46],
    talk: [
      "뚜껑 덮으면 빨리 끓는 건 체감으로도 알겠음",
      "25%면 꽤 크네요",
      "출처 없어도 이건 물리라 믿음",
    ],
  }),
  make({
    id: "life-10",
    category: "생활",
    topic: "일상",
    image: "/assets/community/posts/life-10-bill.jpg",
    title: "지폐는 종이가 아니라 면으로 만든다",
    excerpt: "우리 지폐는 목화 솜으로 만든 면섬유다. 그래서 물에 젖어도 잘 안 찢어진다.",
    body: [
      "한국은행 지폐는 나무 펄프 종이가 아니라 목화에서 뽑은 면섬유로 만든다. 종이보다 질기고, 수천 번 접어도 잘 안 끊어지며, 세탁기에 들어가도 대개 멀쩡하다.",
      "만원권 한 장이 시중에서 버티는 기간은 평균 몇 년이다. 찢어진 지폐는 남은 면적이 4분의 3 이상이면 전액, 5분의 2 이상이면 반액으로 바꿔 준다.",
    ],
    source: "한국은행 · 「화폐 이야기: 은행권의 재질」",
    quiz: { question: "우리나라 지폐는 나무 펄프로 만든 종이다.", answer: "X" },
    who: 3,
    when: "5일 전",
    n: [1110, 66, 124],
    talk: [
      "세탁기에 넣은 만원이 멀쩡했던 이유가 이거였네",
      "면이라서 질긴 거였구나",
      "찢어진 지폐 반액 교환 기준 처음 알았어요",
    ],
  }),

  // ── 사회 ─────────────────────────────────────────────────────────
  make({
    id: "soc-1",
    category: "사회",
    topic: "법률",
    // Unsplash · engin akyurt (unsplash.com/photos/eb26eV-ys_k)
    image: "/assets/community/posts/soc-1-tomatoes.jpg",
    title: "토마토는 법적으로 채소다",
    excerpt: "1893년 미국 대법원이 관세 때문에 판결했다. 식물학으로는 과일이지만 밥상에서는 채소.",
    body: [
      "19세기 미국은 수입 채소에 관세를 매기고 과일에는 안 매겼다. 토마토 수입업자가 ‘토마토는 과일이니 관세를 돌려달라’며 소송을 냈다.",
      "대법원은 식물학적으로는 과일이 맞지만 사람들이 채소처럼 먹으니 관세법에서는 채소라고 판결했다. 1893년 닉스 대 헤든 사건이다.",
    ],
    source: "U.S. Supreme Court · Nix v. Hedden, 149 U.S. 304 (1893)",
    quiz: { question: "미국 대법원은 토마토를 관세법상 채소로 판결했다.", answer: "O" },
    who: 2,
    when: "8시간 전",
    n: [1460, 88, 131],
    talk: [
      "관세 때문에 대법원까지 간 게 웃기다",
      "식물학 vs 밥상 기준, 법이 밥상 편을 들었네",
      "그럼 딸기도 법적으로는 뭘까",
    ],
    badge: "인기",
  }),
  make({
    id: "soc-2",
    category: "사회",
    topic: "경제",
    // Unsplash · Frank Huang (unsplash.com/photos/4HnYOTF9A2c)
    image: "/assets/community/posts/soc-2-store.jpg",
    title: "우리나라 편의점은 5만 개가 넘는다",
    excerpt: "인구 1천 명당 한 곳꼴. 편의점의 나라라는 일본보다 인구당으로는 더 촘촘하다.",
    body: [
      "국내 편의점 점포 수는 2023년 기준 5만 5천 개를 넘었다. 인구 약 950명당 한 곳으로, 편의점이 많기로 이름난 일본(약 2,200명당 한 곳)보다 훨씬 촘촘하다.",
      "1989년 서울 방이동에 첫 편의점이 문을 연 지 35년 만이다. 이제는 택배, 세탁, 은행 업무까지 맡는 동네 거점이 됐다.",
    ],
    source: "한국편의점산업협회 · 「2023 편의점 산업 현황」",
    quiz: { question: "우리나라는 인구당 편의점 수가 일본보다 많다.", answer: "O" },
    who: 0,
    when: "13시간 전",
    n: [1980, 121, 177],
    talk: [
      "950명당 한 곳이면 우리 동네도 그 정도인 듯",
      "일본보다 촘촘하다는 게 의외",
      "1989년 방이동 첫 편의점… 35년밖에 안 됐구나",
    ],
    tags: ["사회", "편의점", "통계"],
  }),
  make({
    id: "soc-3",
    category: "사회",
    topic: "정치",
    // Unsplash · Daniel Moqvist (unsplash.com/photos/F2MJRGvRNxY)
    image: "/assets/community/posts/soc-3-road.jpg",
    title: "스웨덴은 하루 만에 차선 방향을 바꿨다",
    excerpt: "1967년 9월 3일 새벽, 온 나라의 차가 왼쪽에서 오른쪽 통행으로 옮겼다. ‘H의 날’.",
    body: [
      "스웨덴은 이웃 나라와 달리 왼쪽 통행이었다. 국경을 넘을 때마다 사고가 잦아 1967년 9월 3일 새벽 5시에 온 나라가 한꺼번에 오른쪽 통행으로 바꿨다.",
      "이날을 Dagen H(H의 날)라 부른다. 4년 동안 표지판을 바꾸고 방송으로 알렸는데, 정작 바꾼 날은 모두가 조심해서 사고가 평소보다 적었다.",
    ],
    source: "Swedish Transport Administration · “Dagen H”",
    quiz: { question: "스웨덴은 1967년에 좌측통행에서 우측통행으로 바꿨다.", answer: "O" },
    who: 5,
    when: "어제",
    n: [760, 43, 58],
    talk: [
      "하루 만에 바꿨는데 사고가 줄었다는 게 포인트",
      "4년 준비했다는 걸 보면 하루가 아니긴 함",
      "우리나라도 옛날엔 좌측통행이었다면서요",
    ],
  }),
  make({
    id: "soc-4",
    category: "사회",
    topic: "법률",
    title: "핀란드 과속 벌금은 월급에 비례한다",
    excerpt: "소득이 높을수록 벌금이 커진다. 한 기업인은 과속 한 번에 1억 원 넘게 냈다.",
    body: [
      "핀란드의 과속 벌금은 정해진 액수가 아니라 ‘하루 소득의 절반 × 며칠’로 계산한다. 같은 위반이라도 버는 만큼 낸다는 생각이다.",
      "2015년 한 기업인은 시속 80km 구간에서 103km로 달리다 약 5만 4천 유로, 우리 돈 8천만 원 넘는 벌금을 냈다. 그보다 큰 사례도 있다.",
    ],
    source: "BBC News · “Finland, home of the $103,000 speeding ticket”",
    quiz: { question: "핀란드의 과속 벌금은 소득에 따라 달라진다.", answer: "O" },
    who: 3,
    when: "어제",
    n: [1090, 62, 79],
    talk: [
      "8천만 원 벌금이면 차라리 안 밟는다",
      "소득 비례라는 생각 자체가 신선",
      "우리나라 도입되면 난리 날 듯",
    ],
  }),
  make({
    id: "soc-5",
    category: "사회",
    topic: "심리학",
    // Unsplash · Tsvetoslav Hristov (unsplash.com/photos/iJ-uantQb9I)
    image: "/assets/community/posts/soc-5-signal.jpg",
    title: "초록불을 왜 ‘파란불’이라고 부를까",
    excerpt: "옛 우리말에서 ‘푸르다’는 초록과 파랑을 다 가리켰다. 일본어도 같아서 신호등이 ‘아오’다.",
    body: [
      "신호등의 초록불을 우리는 파란불이라 부른다. 옛 우리말 ‘푸르다’가 풀색과 하늘색을 모두 뜻했기 때문이다. ‘푸른 산’, ‘푸른 하늘’이 같은 말로 쓰인다.",
      "일본어도 ‘아오(青)’가 둘을 함께 가리켜 신호등을 ‘아오신고’라 부른다. 국립국어원은 ‘파란불’과 ‘초록불’을 둘 다 표준으로 본다.",
    ],
    source: "국립국어원 · 「온라인가나다: 파란불과 초록불」",
    quiz: { question: "‘파란불’은 표준어가 아니다.", answer: "X" },
    who: 1,
    when: "2일 전",
    n: [1340, 79, 102],
    talk: [
      "파란불이 표준어인 줄 몰랐어요",
      "푸른 산 푸른 하늘 예시 납득",
      "일본어도 같다는 게 신기하네",
    ],
  }),
  make({
    id: "soc-6",
    category: "사회",
    topic: "심리학",
    title: "마트 카트가 커진 데는 이유가 있다",
    excerpt: "카트를 두 배 키웠더니 손님이 40% 더 담았다는 실험. 빈 자리가 사게 만든다.",
    body: [
      "마케팅 컨설턴트 마틴 린드스트롬은 한 마트에서 카트 크기를 두 배로 키우는 실험을 했다. 손님들은 평균 40% 더 많이 샀다. 카트가 반쯤 비어 있으면 덜 산 것처럼 느끼기 때문이다.",
      "요즘 대형마트 카트가 점점 커지는 이유다. 바구니만 들고 들어가면 사려던 것만 사고 나오기 쉽다.",
    ],
    quiz: { question: "카트가 커지면 사람들은 더 많이 사는 경향이 있다.", answer: "O" },
    who: 4,
    when: "3일 전",
    n: [880, 50, 94],
    talk: [
      "카트 반 비어 있으면 덜 산 느낌 진짜 있음",
      "바구니 들고 가라는 결론이네",
      "출처 없는데 마트 가 보면 알 수 있는 얘기라 인정",
    ],
  }),
  make({
    id: "soc-7",
    category: "사회",
    topic: "경제",
    // Unsplash · Kyle Glenn (unsplash.com/photos/nXt5HtLmlgE)
    image: "/assets/community/posts/soc-7-globe.jpg",
    title: "세계 인구 절반이 이 동그라미 안에 산다",
    excerpt: "남중국해 위에 반지름 4천km 원을 그리면 그 안에 40억 명이 산다. 밖에는 나머지 전부.",
    body: [
      "2013년 한 지리 교사가 지도에 원 하나를 그렸다. 중국 · 인도 · 동남아 · 일본 · 한국이 들어가는 반지름 약 4,000km 짜리 원인데, 그 안에 세계 인구의 절반이 산다.",
      "원의 절반은 바다이고 몽골이나 히말라야처럼 사람이 거의 안 사는 땅도 포함돼 있다. 그린 사람의 이름을 따 ‘발레리피에리스 원’이라 부른다.",
    ],
    source: "Ken Myers · “The Valeriepieris circle” (2013)",
    quiz: { question: "세계 인구의 절반이 동아시아·남아시아 일대의 한 원 안에 산다.", answer: "O" },
    who: 2,
    when: "3일 전",
    n: [1150, 73, 108],
    talk: [
      "원 안에 40억… 지도로 보면 더 충격",
      "몽골이랑 히말라야가 들어 있어도 절반이라는 게",
      "그린 사람 이름이 원 이름이 됐구나",
    ],
  }),
  make({
    id: "soc-8",
    category: "사회",
    topic: "정치",
    title: "가장 최근에 생긴 나라는 남수단이다",
    excerpt: "2011년 독립해 유엔의 193번째 회원국이 됐다. 그 뒤로 새 회원국은 없다.",
    body: [
      "남수단은 2011년 7월 9일 수단에서 분리 독립했고, 닷새 뒤 유엔 193번째 회원국이 됐다. 지금까지 마지막으로 가입한 나라다.",
      "유엔 회원국은 1945년 창립 때 51개에서 시작해 식민지 독립과 소련 해체를 거치며 늘었다. 바티칸과 팔레스타인은 회원국이 아닌 ‘옵서버’다.",
    ],
    source: "United Nations · “Member States”",
    quiz: { question: "유엔에 가장 최근 가입한 나라는 남수단이다.", answer: "O" },
    who: 5,
    when: "4일 전",
    n: [590, 29, 41],
    talk: [
      "2011년 이후로 새 나라가 없었다니",
      "바티칸이 회원국이 아니라는 건 처음 알았음",
      "193이라는 숫자 외워둬야지",
    ],
  }),
  make({
    id: "soc-9",
    category: "사회",
    topic: "경제",
    // Unsplash · Ibrahim Rifath (unsplash.com/photos/OApHds2yEGQ)
    image: "/assets/community/posts/soc-9-coins.jpg",
    title: "최저임금은 1988년에 시작됐다",
    excerpt: "첫해 시급은 462.5원이었다. 지금과 견주면 20배 넘게 올랐다.",
    body: [
      "우리나라 최저임금제는 1988년 1월 1일 시작됐다. 첫해에는 업종에 따라 시급 462.5원과 487.5원 두 가지였고, 적용 대상도 10인 이상 제조업뿐이었다.",
      "이듬해 전 산업으로 넓어졌고, 지금은 1인 이상 모든 사업장에 적용된다. 야간 알바 시급 계산도 여기서 시작한다.",
    ],
    source: "최저임금위원회 · 「연도별 최저임금 결정 현황」",
    quiz: { question: "우리나라 최저임금제는 1988년에 처음 시행됐다.", answer: "O" },
    who: 0,
    when: "5일 전",
    n: [840, 38, 57],
    talk: [
      "462원… 지금 시급이랑 비교하면 아득하다",
      "처음엔 제조업만이었다는 게 의외",
      "야간 알바 시급 계산할 때 이 얘기 해줘야지",
    ],
  }),
  make({
    id: "soc-10",
    category: "사회",
    topic: "경제",
    // Unsplash · Louie Martinez (unsplash.com/photos/IocJwyqRv3M)
    image: "/assets/community/posts/soc-10-tokyo.jpg",
    title: "도쿄 권역에는 호주 인구보다 많은 사람이 산다",
    excerpt: "도쿄 도시권 인구는 약 3,700만 명. 세계에서 가장 큰 도시권이고 호주 전체(2,600만)보다 많다.",
    body: [
      "유엔이 집계하는 도시권 인구에서 도쿄는 약 3,700만 명으로 1위다. 나라 하나인 호주(약 2,600만 명)보다 많고, 캐나다와 비슷하다.",
      "다만 도쿄는 이제 줄어드는 중이고, 델리가 2030년 무렵 1위를 넘겨받을 것으로 본다. 서울 도시권은 약 1,000만 명대로 30위 안팎이다.",
    ],
    source: "UN DESA · “The World’s Cities in 2018”",
    quiz: { question: "도쿄 도시권 인구는 호주 전체 인구보다 많다.", answer: "O" },
    who: 3,
    when: "6일 전",
    n: [670, 32, 45],
    talk: [
      "호주 인구보다 많다는 비교가 확 와닿네",
      "델리가 곧 1위라니",
      "서울이 30위 안팎이라는 것도 처음 알았어요",
    ],
  }),
  // 아래 둘은 홈 사회 매대의 둘째 · 셋째 추천(Details/society 1828:3070) — 프레임에 제목만 있어 글은 여기서 채웠다
  make({
    id: "sociopath",
    category: "사회",
    topic: "심리학",
    title: "당신이 몰랐던 소시오패스의 정체",
    excerpt: "소시오패스는 진단명이 아니다. 정신의학은 ‘반사회성 성격장애’ 하나로 부르고, 사이코패스와의 구분은 통념에 가깝다.",
    body: [
      "드라마에서 흔히 쓰는 ‘소시오패스’는 정식 진단명이 아니다. 미국정신의학회의 진단 편람(DSM-5)에는 ‘반사회성 성격장애’ 하나가 있을 뿐이다 — 남의 권리를 반복해서 무시하고, 거짓말과 충동성이 잦고, 잘못에 죄책감이 없는 양상이 18세 이후에도 이어질 때 붙는다.",
      "‘사이코패스는 타고나고 소시오패스는 자란 환경 탓’이라는 구분은 널리 퍼져 있지만 학계의 공식 분류가 아니다. 둘 다 같은 장애의 다른 얼굴로 본다.",
      "성인 100명 중 1~4명이 이 기준에 든다는 추정이 있는데, 그중 범죄와 이어지는 사람은 일부다. 차갑고 이기적인 사람을 ‘소시오패스’라 부르는 것은 진단이 아니라 욕에 가깝다.",
    ],
    source: "미국정신의학회(APA) · 「DSM-5-TR: 반사회성 성격장애」",
    quiz: { question: "‘소시오패스’는 정신의학의 정식 진단명이다.", answer: "X" },
    who: 1,
    when: "3일 전",
    n: [1520, 88, 117],
    talk: [
      "진단명이 아니라는 게 제일 놀랍네",
      "드라마에서 너무 쉽게 쓰는 말이었구나",
      "사이코패스 구분도 통념이라니",
    ],
  }),
  make({
    id: "petty-crime",
    category: "사회",
    topic: "법률",
    title: "엥 이것도 범죄?",
    excerpt: "길에서 주운 돈을 쓰면 점유이탈물횡령죄, 남의 집 벨을 누르고 도망가면 경범죄. 몰라서 하는 일 중 상당수가 법에는 이미 이름이 있다.",
    body: [
      "길에서 주운 지갑이나 돈을 그냥 가지면 점유이탈물횡령죄다(형법 제360조). 훔친 게 아니어도 ‘주인이 잃어버린 물건을 제 것으로 한’ 순간 성립하고, 1년 이하의 징역이나 300만 원 이하의 벌금이다. 경찰서나 주인에게 돌려주면 유실물법에 따라 보상금을 받을 수도 있다.",
      "남의 집 초인종을 누르고 도망가기, 밤에 큰 소리로 떠들기, 담배꽁초 버리기, 노상방뇨는 경범죄 처벌법 제3조에 하나하나 적혀 있다 — 10만 원 이하의 벌금 · 구류 · 과료다. 대개 범칙금 통고로 끝나지만 ‘범죄’라는 이름은 그대로다.",
      "무단횡단은 도로교통법 위반으로 범칙금 대상이고, 술에 취해 길에서 소란을 피우면 경범죄 처벌법의 ‘음주소란’이다. 벌금이 작다고 기록이 없는 것은 아니다.",
    ],
    source: "국가법령정보센터 · 「형법 제360조」 · 「경범죄 처벌법 제3조」",
    sourceUrl: "https://www.law.go.kr/법령/경범죄처벌법",
    quiz: { question: "길에서 주운 돈을 그냥 가지면 범죄가 된다.", answer: "O" },
    who: 3,
    when: "5일 전",
    n: [980, 61, 74],
    talk: [
      "주운 돈이 죄가 된다는 건 알았는데 초인종은 처음 알았네",
      "노상방뇨가 경범죄인 건 유명하죠",
      "벌금이 작다고 기록이 없는 건 아니라는 말 무섭다",
    ],
  }),

  // ── 문화 ─────────────────────────────────────────────────────────
  make({
    id: "cul-1",
    category: "문화",
    topic: "대중 문화",
    image: "/assets/community/posts/cul-1-cake.jpg",
    title: "‘해피 버스데이’는 2016년까지 저작권료를 받았다",
    excerpt: "영화 · 식당에서 이 노래를 틀려면 돈을 내야 했다. 법원이 무효라고 판결한 게 불과 몇 년 전.",
    body: [
      "세계에서 가장 많이 불리는 노래 ‘Happy Birthday to You’는 1935년 저작권이 등록됐고, 한 음반사가 해마다 수백만 달러를 받았다. 영화에서 이 노래가 나오면 제작사가 돈을 냈다.",
      "2015년 미국 법원은 그 저작권이 가사에는 미치지 않는다고 판결했고, 2016년 합의로 노래는 공유재산이 됐다. 그 전까지 식당 직원들이 다른 생일 노래를 부른 이유다.",
    ],
    source: "Los Angeles Times · “‘Happy Birthday’ is now in the public domain” (2016)",
    quiz: { question: "‘해피 버스데이’ 노래는 오래전부터 누구나 쓸 수 있는 공유재산이었다.", answer: "X" },
    who: 4,
    when: "10시간 전",
    n: [1270, 74, 95],
    talk: [
      "식당에서 다른 생일 노래 부르던 이유가 이거였구나",
      "2016년이면 진짜 최근이네",
      "가장 많이 불리는 노래가 저작권이 있었다는 게 아이러니",
    ],
  }),
  /*
    아래 셋(cul-2 · cul-6 · cul-4)은 카드뉴스로 다시 만든 것 — Figma 1632:7537 ·
    1632:7943 · 1632:8127. 제목과 카드는 디자이너가 정했고, 글(excerpt · body)은
    카드에 적힌 말을 문단으로 옮겨 적은 것이다 — 커뮤니티 · 검색 · 퀴즈가 글을
    읽는다. 카드 그림은 public/assets/knowledge/<id>/ 에 2배로 뽑아 두었다.
  */
  make({
    id: "cul-2",
    category: "문화",
    topic: "스포츠",
    image: "/assets/knowledge/cul-2/1.webp",
    title: "세계에서 가장 무서운 종이 두 장",
    excerpt: "레드카드는 신호등을 보다가 나왔다. 1966년 월드컵에서 말이 안 통해 퇴장이 안 되던 날이 계기였다.",
    body: [
      "1966년 잉글랜드 월드컵, 잉글랜드와 아르헨티나 경기. 독일인 주심이 아르헨티나 선수에게 퇴장을 명령했는데 말이 안 통해서 선수가 안 나갔다. 경기는 멈춰 있고, 보다 못한 심판위원장 켄 애스턴이 직접 그라운드로 내려왔다.",
      "그날 퇴근길 차 안, 신호등이 빨간불로 바뀌는 순간 애스턴은 경고 · 퇴장 카드를 떠올렸다. 색으로 하면 되잖아 — 노랑이면 진정해, 빨강이면 나가. 그래서 지금 축구 카드에는 글자가 없다.",
      "1970년 멕시코 월드컵에서 처음 쓰인 뒤 디자인이 한 번도 안 바뀌었다. 지금은 펜싱 · 하키 · 배구 등 열 개 넘는 종목이 그대로 쓴다.",
    ],
    source: "Wikipedia · “Ken Aston”",
    quiz: { question: "축구의 노란 카드와 빨간 카드는 신호등에서 착안했다.", answer: "O" },
    who: 1,
    when: "16시간 전",
    n: [910, 55, 72],
    talk: [
      "신호등 보다가 만든 거였다니 ㅋㅋ",
      "1970년부터 디자인 그대로라는 게 더 신기",
      "펜싱도 카드 쓰는 줄 처음 알았어요",
    ],
    tags: ["축구", "월드컵", "레드카드"],
    cards: [1, 2, 3, 4, 5].map((n) => `/assets/knowledge/cul-2/${n}.webp`),
    recordCard: true,
  }),
  make({
    id: "cul-3",
    category: "문화",
    topic: "예술",
    // Unsplash · Ben Stein (unsplash.com/photos/oCrbsw-iOz8)
    image: "/assets/community/posts/cul-3-louvre.jpg",
    title: "모나리자는 도둑맞고 나서 유명해졌다",
    excerpt: "1911년 루브르에서 사라지자 신문이 2년 내내 다뤘다. 그 전엔 그 방의 여러 그림 중 하나였다.",
    body: [
      "1911년 8월, 루브르에서 일하던 이탈리아인이 모나리자를 외투 속에 넣어 걸어 나갔다. 박물관은 하루가 지나서야 눈치챘고, 신문은 빈 벽 사진을 1면에 실었다.",
      "그림은 2년 뒤 피렌체에서 발견됐다. 그사이 세계가 모나리자를 찾았고, 돌아온 그림을 보러 사람들이 줄을 섰다. 오늘의 명성은 이 도난 사건에서 시작됐다는 것이 미술사가들의 설명이다.",
    ],
    source: "NPR · “The Theft That Made the ‘Mona Lisa’ a Masterpiece”",
    quiz: { question: "모나리자는 1911년 루브르에서 도난당한 적이 있다.", answer: "O" },
    who: 2,
    when: "어제",
    n: [1420, 91, 118],
    talk: [
      "도둑맞고 유명해졌다는 게 제일 아이러니",
      "외투 속에 넣어서 걸어 나갔다는 게 ㅋㅋ",
      "빈 벽 보러 줄 섰다는 얘기도 있다던데",
    ],
    badge: "인기",
  }),
  /*
    제목은 프레임(1632:8127)에 「금성에서는 하루가 1년보다 길다」라고 남아 있어 —
    과학 것을 복사한 자리 — 첫 카드의 큰 글씨를 그대로 제목으로 삼았다. 디자이너가
    제목을 정하면 여기만 바꾸면 된다.
  */
  make({
    id: "cul-4",
    category: "문화",
    topic: "문학",
    image: "/assets/knowledge/cul-4/1.webp",
    title: "누가 책갈피 얻으려고 오픈런해요",
    excerpt: "민음사 세계문학전집 표지를 입힌 GS25 빵이 3일 만에 5만 개 팔렸다. 책이 아니라 ‘책의 이미지’를 사는 문화다.",
    body: [
      "요즘 책이 힙하다. 진짜로. 작년 성인 독서율은 38.5%로 역대 최저인데(10년 전엔 67.4%), 20대만 올라 75.3%다. 근데 읽기만 하는 게 아니다. 표지, 책갈피, 북커버 — ‘책의 이미지’를 사는 문화로 번졌다.",
      "여기에 ‘랜덤’을 얹으면 어떻게 될까. 민음사와 GS25 가 세계문학전집 표지를 그대로 입힌 빵을 내고, 책갈피 20종 중 1개를 랜덤으로 넣었다. 3일 만에 5만 개, 매출 1억 5천만 원. GS25 전체 빵 중 1 · 2위, 납품 물량 95% 소진. 앱으로 점포 재고를 찾아다니는 오픈런까지 생겼다.",
      "다 안 읽어도 괜찮다. 표지랑 책갈피로 취향을 말할 수 있으니까. 민음사는 책이 아니라 문학을 경험하는 방식을 판 거다.",
    ],
    source: "민음사 출판사",
    quiz: { question: "민음사 표지를 입힌 GS25 빵은 3일 만에 5만 개가 팔렸다.", answer: "O" },
    who: 5,
    when: "어제",
    n: [730, 41, 56],
    talk: [
      "책갈피 때문에 빵 산 사람 저요",
      "독서율은 최저인데 20대만 올랐다는 게 신기",
      "이건 책이 아니라 굿즈지 ㅋㅋ",
    ],
    tags: ["민음사", "GS25", "세계문학전집"],
    cards: [1, 2, 3, 4, 5, 6].map((n) => `/assets/knowledge/cul-4/${n}.webp`),
  }),
  make({
    id: "cul-5",
    category: "문화",
    topic: "대중 문화",
    // Unsplash · Agnieszka Stankiewicz (unsplash.com/photos/c0VRNWVEjOA)
    image: "/assets/community/posts/cul-5-trooper.jpg",
    title: "다스 베이더는 몸과 목소리가 다른 사람이다",
    excerpt: "갑옷 안은 보디빌더 데이비드 프라우스, 목소리는 제임스 얼 존스. 촬영장에서는 프라우스가 대사를 했다.",
    body: [
      "스타워즈의 다스 베이더는 두 사람이다. 갑옷을 입고 연기한 것은 키 2m의 영국 배우 데이비드 프라우스이고, 그 위에 미국 배우 제임스 얼 존스의 목소리를 입혔다.",
      "프라우스는 촬영장에서 진짜 대사를 했지만 영국 시골 억양 때문에 목소리가 통째로 교체됐다. 그는 완성된 영화를 보고서야 그 사실을 알았다고 한다.",
    ],
    source: "Lucasfilm · StarWars.com “David Prowse”",
    quiz: { question: "다스 베이더의 목소리와 몸은 같은 배우가 연기했다.", answer: "X" },
    who: 0,
    when: "2일 전",
    n: [1010, 58, 77],
    talk: [
      "완성작 보고 알았다는 게 좀 짠하다",
      "시골 억양 때문에 통째로 교체… 냉정하네",
      "두 사람인 줄 진짜 몰랐어요",
    ],
  }),
  make({
    id: "cul-6",
    category: "문화",
    topic: "대중 문화",
    image: "/assets/knowledge/cul-6/1.webp",
    title: "두바이엔 없는 두바이 디저트?",
    excerpt: "두쫀쿠는 한국 디저트다. 시작은 두바이의 수제 초콜릿이었는데, 두바이 밖으로 배송을 안 해서 한국이 쿠키로 바꿨다.",
    body: [
      "시작은 두바이의 수제 초콜릿이었다. 피스타치오 크림에 카다이프를 넣은 초콜릿 바가 2023년 말 틱톡에서 터졌다. 주문은 분당 100건까지 뛰었는데 두바이 밖으로는 배송을 안 했다 — 전 세계가 못 먹게 된 것이다.",
      "못 먹으니까 그냥 만들자. 한국이 쿠키로 바꾼 것이 두쫀쿠다. 2025년 4월 김포의 한 쿠키집이 처음 공개했다. 정작 두바이엔 두쫀쿠가 없다.",
      "30분씩 줄 서고 ‘두케팅’이라는 말까지 생겼다. 카다이프가 품귀라 5천 원이던 것이 1만 원을 넘겼다. 못 사서 만든 건데 또 못 사게 됐다.",
    ],
    source: "하퍼스 바자 코리아",
    quiz: { question: "두쫀쿠는 두바이에서 만들어진 디저트다.", answer: "X" },
    who: 3,
    when: "2일 전",
    n: [880, 47, 64],
    talk: [
      "두바이엔 없다는 게 제일 웃김",
      "두케팅 실패한 사람 여기 있어요",
      "카다이프 값이 두 배 된 게 진짜였구나",
    ],
    tags: ["두쫀쿠", "두바이초콜릿", "디저트"],
    cards: [1, 2, 3, 4, 5].map((n) => `/assets/knowledge/cul-6/${n}.webp`),
    recordCard: true,
  }),
  make({
    id: "cul-7",
    category: "문화",
    topic: "대중 문화",
    // Unsplash · Felix Mooneeram (unsplash.com/photos/evlkOfkQ5rE)
    image: "/assets/community/posts/cul-7-cinema.jpg",
    title: "픽사 영화마다 ‘A113’이 숨어 있다",
    excerpt: "토이 스토리의 자동차 번호판, 라따뚜이의 문 번호… 감독들이 다닌 학교의 강의실 번호다.",
    body: [
      "픽사 영화를 자세히 보면 어딘가에 A113이 있다. 토이 스토리에서는 엄마 차의 번호판, 라따뚜이에서는 방 번호, 월-E에서는 지령 코드다.",
      "캘리포니아 예술대학(CalArts) 애니메이션과의 강의실 번호로, 존 라세터와 브래드 버드 등 픽사 감독들이 그 방에서 배웠다. 디즈니, 심슨 가족에도 나온다.",
    ],
    source: "Pixar · “Pixar’s A113 Explained”",
    quiz: { question: "A113은 픽사 감독들이 다닌 학교의 강의실 번호다.", answer: "O" },
    who: 4,
    when: "3일 전",
    n: [1190, 83, 141],
    talk: [
      "다음 픽사 영화 볼 때 A113 찾아봐야지",
      "심슨에도 나온다는 건 처음 알았어요",
      "강의실 번호가 이렇게 유명해질 줄 누가 알았을까",
    ],
  }),
  make({
    id: "cul-8",
    category: "문화",
    topic: "대중 문화",
    // Unsplash · Imad 786 (unsplash.com/photos/qla1_604R4c)
    image: "/assets/community/posts/cul-8-eggs.jpg",
    title: "‘Yesterday’의 원래 가제는 ‘스크램블드 에그’였다",
    excerpt: "폴 매카트니가 꿈에서 멜로디를 듣고 일어나 피아노로 옮겼다. 가사가 없어 아무 말이나 붙인 것.",
    body: [
      "폴 매카트니는 어느 아침 꿈에서 들은 멜로디를 그대로 피아노로 쳤다. 너무 완성돼 있어서 남의 곡을 베낀 줄 알고 몇 주 동안 주변에 물어보고 다녔다.",
      "가사가 없어 임시로 “Scrambled eggs, oh my baby how I love your legs”를 붙여 불렀다. 지금까지 가장 많이 리메이크된 노래 중 하나가 그렇게 시작됐다.",
    ],
    source: "The Beatles · 『The Beatles Anthology』 (2000)",
    quiz: { question: "‘Yesterday’는 처음에 ‘Scrambled Eggs’라는 가제로 불렸다.", answer: "O" },
    who: 2,
    when: "4일 전",
    n: [640, 36, 52],
    talk: [
      "스크램블드 에그 오 마이 베이비 ㅋㅋㅋ",
      "꿈에서 들은 멜로디를 남의 곡인 줄 알았다는 게 대단",
      "가장 많이 리메이크된 노래의 시작이 이거라니",
    ],
  }),
  make({
    id: "cul-9",
    category: "문화",
    topic: "언어",
    // Unsplash · Clark Gu (unsplash.com/photos/MlBwuVF8pzM)
    image: "/assets/community/posts/cul-9-hangul.jpg",
    title: "한글날은 원래 음력 9월 29일이었다",
    excerpt: "1926년 ‘가갸날’로 시작해 날짜가 세 번 바뀌었다. 10월 9일이 된 건 해례본이 발견된 뒤다.",
    body: [
      "한글날은 1926년 조선어연구회가 ‘가갸날’이라는 이름으로 음력 9월 29일에 처음 기념했다. 세종실록에 훈민정음이 완성된 달이 9월로 적혀 있어서다.",
      "1940년 훈민정음 해례본이 발견되면서 반포일이 음력 9월 상순으로 밝혀졌고, 이를 양력으로 옮겨 1945년부터 10월 9일이 됐다. 공휴일에서 빠졌다가 2013년에 다시 들어왔다.",
    ],
    source: "국립한글박물관 · 「한글날의 역사」",
    quiz: { question: "한글날은 처음부터 10월 9일이었다.", answer: "X" },
    who: 1,
    when: "5일 전",
    n: [1560, 104, 183],
    talk: [
      "가갸날이라는 이름 귀엽다",
      "해례본 발견으로 날짜가 바뀐 거였구나",
      "공휴일에서 빠졌던 적이 있다는 것도 처음",
    ],
    badge: "인기",
    tags: ["문화", "한글", "기념일"],
  }),
  make({
    id: "cul-10",
    category: "문화",
    topic: "대중 문화",
    // Unsplash · Carl Raw (unsplash.com/photos/m3hn2Kn5Bns)
    image: "/assets/community/posts/cul-10-arcade.jpg",
    title: "마리오의 이름은 창고 주인에게서 왔다",
    excerpt: "원래 이름은 ‘점프맨’. 닌텐도 미국 지사가 세 들어 살던 창고 주인 마리오 시갈리에게서 따왔다.",
    body: [
      "1981년 ‘동키콩’에 처음 나온 마리오는 이름이 없이 ‘점프맨’으로 불렸다. 캐릭터에 콧수염과 모자가 있는 것도 당시 화소로는 입과 머리카락을 그릴 수 없어서다.",
      "닌텐도 미국 지사가 창고를 빌려 쓰던 시절, 밀린 집세를 받으러 온 건물주 마리오 시갈리를 보고 직원들이 그 이름을 붙였다. 세계에서 가장 유명한 배관공의 시작이다.",
    ],
    source: "Nintendo · “Iwata Asks: Super Mario Bros. 25th Anniversary”",
    quiz: { question: "마리오는 처음부터 마리오라는 이름으로 나왔다.", answer: "X" },
    who: 5,
    when: "6일 전",
    n: [1330, 86, 129],
    talk: [
      "집세 받으러 온 건물주가 마리오라니 ㅋㅋ",
      "콧수염이 화소 때문이었다는 게 더 웃김",
      "점프맨 시절 동키콩 해본 사람?",
    ],
  }),

  // ── 카드뉴스 — Figma 「완성」 1595:4827 ──────────────────────────────
  /*
    디자이너가 카드뉴스로 그린 지식 여섯. 제목과 카드는 프레임 그대로이고,
    글(excerpt · body)은 카드에 적힌 말을 문단으로 옮겨 적은 것이다 — 커뮤니티 ·
    검색 · 퀴즈가 글을 읽는다. 카드 그림은 public/assets/knowledge/<id>/ 에 2배로
    뽑아 두었고, 출처 주소는 프레임의 「링크 이동」 주석에 적힌 것이다(사용자 요청).
    프레임 이름은 「과학/우주」로 복사돼 있어도 내용대로 분야를 정했다.
  */
  make({
    id: "toothpaste",
    category: "생활",
    topic: "일상",
    image: "/assets/knowledge/toothpaste/1.webp",
    title: "양치물을 변기통에 뱉으면 생기는 일",
    excerpt: "양치 후 양칫물을 변기에 뱉고 10분 뒤 물을 내리면 악취가 사라진다. 치약 속 계면활성제와 연마제 덕분이다.",
    body: [
      "양치 후 양칫물을 변기통에 뱉고 10분 후에 물을 내리면 악취가 사라져요. 이유는 바로 치약 속 두 가지 핵심 성분 덕분인데요.",
      "첫째는 계면활성제 — 오염물을 물에 녹아내리도록 분산시켜요.",
      "둘째는 연마제(탄산칼슘 · 실리카 등) — 표면에 달라붙은 오염을 물리적으로 떼어내 주는 역할을 해요.",
    ],
    source: "픽데일리뉴스 · 중부일보",
    sourceUrl: "https://www.pickdailynews.com/news/articleView.html?idxno=4122",
    quiz: { question: "치약 속 계면활성제는 오염물을 물에 분산시키는 역할을 한다.", answer: "O" },
    who: 3,
    when: "3시간 전",
    n: [640, 38, 47],
    talk: [
      "오늘부터 양칫물은 변기에 뱉는 걸로",
      "10분이 포인트네요, 바로 내리면 소용없다는 거",
      "연마제가 그래서 있는 거였구나",
    ],
    tags: ["양치", "치약", "변기"],
    cards: [1, 2, 3, 4, 5].map((n) => `/assets/knowledge/toothpaste/${n}.webp`),
    recordCard: true,
  }),
  make({
    id: "hangover-food",
    category: "생활",
    topic: "음식",
    image: "/assets/knowledge/hangover-food/1.webp",
    title: "음주 전 먹어야 할 식품",
    excerpt: "계란 · 바나나 · 우유. 술 마시기 전에 먹으면 숙취를 덜어 주는 세 가지.",
    body: [
      "술 마시기 전 계란 1~2개를 먹으면, 계란에 함유된 아미노산 L-시스테인 성분이 독소를 분해하고 빠르게 배출해요.",
      "다음은 바나나! 바나나를 먹으면 속쓰림과 위궤양을 예방할 수 있어요.",
      "마지막은 우유예요. 우유 속 뮤신 성분이 지방 · 단백질 · 비타민A와 함께 위 점막을 보호하고 알코올 흡수를 지연시켜요.",
      "단, 과음한 다음날 빈속에 우유를 마시는 건 칼슘 · 단백질이 위산 분비를 촉진해 속쓰림을 유발할 수 있어요!",
    ],
    source: "파이낸셜뉴스",
    sourceUrl: "https://www.fnnews.com/news/201911211336032268",
    quiz: { question: "과음한 다음날 빈속에 우유를 마시면 속쓰림이 가라앉는다.", answer: "X" },
    who: 5,
    when: "5시간 전",
    n: [910, 52, 66],
    talk: [
      "회식 전에 계란 두 개, 오늘부터 실천",
      "바나나가 나한테 바나나 ㅋㅋㅋ 카드 문구 미쳤다",
      "다음날 빈속 우유는 안 된다는 게 반전이네",
    ],
    tags: ["숙취", "계란", "우유"],
    cards: [1, 2, 3, 4, 5].map((n) => `/assets/knowledge/hangover-food/${n}.webp`),
    recordCard: true,
  }),
  make({
    id: "torn-bill",
    category: "생활",
    topic: "일상",
    image: "/assets/knowledge/torn-bill/1.webp",
    title: "지폐 찢어졌을 때 보상 기준",
    excerpt: "남은 면적이 3/4 이상이면 전액, 2/5 이상이면 반액. 그보다 작으면 무효다.",
    body: [
      "찢어진 지폐는 남은 면적에 따라 보상 기준이 달라요. 원래 크기의 3/4 이상인 경우는 전액, 2/5 이상인 경우는 반액으로 교환 가능해요.",
      "원래 크기의 2/5 미만인 경우는 무효 처리가 돼요.",
      "불에 탄 지폐는 재 부분이 상하지 않고 형태가 유지되어 같은 지폐 조각으로 인정되면 환수 기준에 포함돼요. 재를 털어내지 말고 용기 그대로 보존하여 가져가세요!",
      "단순 훼손권은 가까운 시중은행 · 농협 · 수협 · 우체국 등에서 교환 가능하고, 판정이 어렵거나 불에 탄 지폐는 한국은행 본부 및 지역본부에서 교환 가능해요.",
    ],
    source: "한국은행",
    sourceUrl: "https://www.bok.or.kr/portal/main/contents.do?menuNo=200393",
    quiz: { question: "찢어진 지폐가 원래 크기의 3/4 이상 남아 있으면 전액 교환된다.", answer: "O" },
    who: 1,
    when: "어제",
    n: [1180, 67, 93],
    talk: [
      "불에 탄 돈 재 털지 말라는 거 진짜 꿀팁",
      "2/5 미만이면 무효라니 반 이상은 남겨야겠다",
      "우체국에서도 바꿔 주는 줄 몰랐네요",
    ],
    tags: ["지폐", "한국은행", "훼손"],
    cards: [1, 2, 3, 4, 5].map((n) => `/assets/knowledge/torn-bill/${n}.webp`),
    recordCard: true,
  }),
  make({
    id: "tootsie-roll",
    category: "역사",
    topic: "한국사",
    image: "/assets/knowledge/tootsie-roll/1.webp",
    title: "한국전쟁 속 투시롤의 뜻밖의 쓰임",
    excerpt: "먹는 사탕으로 군용차를 고쳤다고? 1950년 장진호 전투에서 투시롤은 식량이자 수리 재료였다.",
    body: [
      "1950년 장진호 전투, 추위와 굶주림에 지친 병사들은 투시롤로 허기를 달랬어요.",
      "박격포탄을 뜻하는 암호 ‘투시롤’을 사탕으로 오해해, 실제 투시롤을 공중 투하했다는 이야기가 전해져요. 다만, 사실 여부에는 이견이 있어요.",
      "참전용사들의 증언에 따르면, 녹은 투시롤이 추위에 굳는 성질을 이용해 새는 라디에이터를 임시로 막기도 했어요.",
      "평소에는 달콤한 간식이던 투시롤. 장진호 전투에서는 허기를 달래는 식량이자, 차량 수리를 도운 재료로 기억되고 있어요.",
    ],
    source: "MCCS Camp Pendleton · “How Tootsie Rolls accidentally saved Marines during war”",
    sourceUrl: "https://pendleton.usmc-mccs.org/news/how-tootsie-rolls-accidentally-saved-marines-during-war",
    quiz: { question: "장진호 전투에서 녹은 투시롤로 새는 라디에이터를 막았다는 증언이 있다.", answer: "O" },
    who: 0,
    when: "어제",
    n: [870, 49, 61],
    talk: [
      "암호 오해로 사탕이 떨어졌다는 게 영화 같음",
      "사실 여부 이견 있다고 적어 준 게 좋네요",
      "라디에이터를 사탕으로 막다니 ㅋㅋ",
    ],
    tags: ["한국전쟁", "장진호", "투시롤"],
    cards: [1, 2, 3, 4, 5].map((n) => `/assets/knowledge/tootsie-roll/${n}.webp`),
    recordCard: true,
  }),
  make({
    id: "conformity",
    category: "사회",
    topic: "심리학",
    image: "/assets/knowledge/conformity/1.webp",
    title: "왜 우리는 남들이 고른 걸 따라갈까?",
    excerpt: "다수가 고른 것에 괜히 끌리는 이유 — 정답을 알아도 다수의 오답을 따라가는 ‘동조’.",
    body: [
      "다수가 선택한 것에 괜히 더 끌리는 이유, 우리의 심리 속에 답이 있어요.",
      "판단이 어려울수록 우리는 ‘다수가 고른 데는 이유가 있겠지’라고 생각해요.",
      "심리학자 솔로몬 애시는 주변 사람들이 일부러 같은 오답을 말하는 실험을 했어요. 정답을 알아도 따라갈까요? 정답이 명확했는데도 일부 참가자들은 다수의 잘못된 답에 동조했어요.",
      "다수의 의견에 맞춰 판단이나 행동을 바꾸는 현상 — 이것이 바로 ‘동조’예요. 다수의 선택이 항상 정답인 것은 아니에요.",
    ],
    source: "Simply Psychology · “Conformity”",
    sourceUrl: "https://www.simplypsychology.org/conformity.html",
    quiz: { question: "애시의 실험에서 정답이 명확하면 아무도 다수의 오답을 따라가지 않았다.", answer: "X" },
    who: 6,
    when: "2일 전",
    n: [1030, 58, 74],
    talk: [
      "메뉴 고를 때 남들 시키는 거 따라가는 이유가 이거였네",
      "애시 실험은 심리학 수업에서 봤는데 카드로 보니 더 와닿음",
      "다수가 항상 정답은 아니라는 말 새기고 갑니다",
    ],
    tags: ["동조", "심리학", "애시"],
    cards: [1, 2, 3, 4, 5, 6].map((n) => `/assets/knowledge/conformity/${n}.webp`),
    recordCard: true,
  }),
  /*
    「홈-점장 픽 광고1」(1693:1293) — 마지막 카드가 기록 카드가 아니라 책 광고라
    그것까지 그림으로 두고 기록 카드는 안 붙인다. 출처도 그 책이다.
  */
  make({
    id: "jeans-blue",
    category: "생활",
    topic: "일상",
    image: "/assets/knowledge/jeans-blue/1.webp",
    title: "청바지가 파란색인 이유",
    excerpt: "금광 광부의 작업복이던 청바지가 파란 이유 — 데님을 인디고로 물들이기 때문이다.",
    body: [
      "청바지는 1940년경 미국에서 유행하여 전파됐어요. 금광을 캐던 광부들이 주로 입던 작업용 바지였어요.",
      "납품이 불발되어 남아도는 재료로 바지를 만들어 판매하던 게 청바지의 시초예요.",
      "그럼 청바지는 왜 파란색일까요? 바로 데님(Denim)이라는 면 소재의 천에 ‘인디고(Indigo)’라고 하는 파란색 염료로 물들여서 청바지가 제작되기 때문이에요.",
      "인디고 염료는 여러 식물로 만들어지는데, 오늘날에는 천연염료만으로 청바지 생산량을 감당할 수 없어 합성염료를 주로 사용해요.",
    ],
    source: "1분 생활 상식 (교보문고)",
    sourceUrl: "https://product.kyobobook.co.kr/detail/S000001893825",
    quiz: { question: "청바지의 파란색은 인디고 염료로 데님을 물들인 것이다.", answer: "O" },
    who: 2,
    when: "2일 전",
    n: [760, 44, 52],
    talk: [
      "식물 때문이라는 첫 카드에 낚여서 끝까지 봄",
      "남는 천으로 만든 게 시초였다는 거 처음 알았어요",
      "요즘은 합성염료라니 조금 아쉽",
    ],
    tags: ["청바지", "데님", "인디고"],
    cards: [1, 2, 3, 4, 5, 6].map((n) => `/assets/knowledge/jeans-blue/${n}.webp`),
  }),
];
