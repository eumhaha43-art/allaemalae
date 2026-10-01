/**
 * 토론방 씨앗 데이터
 * (Figma 761:2346 목록, 805:3605 상세, 805:3731 근거 팝업).
 *
 * 처음에는 첫 방(1+1)만 상세가 있고 나머지는 흐리게 놓여 있었다. 목록이
 * 전부 죽어 보여서, 방마다 주제 · 투표 · 떠도는 말 · 근거 · 출처를 갖춰 다
 * 열어 둔다. 주제는 편의점 잡담부터 과학 · 사회 · 역사까지 고르게 — 한
 * 결로만 있으면 토론방이 아니라 1+1 팬클럽이다.
 *
 * 방마다 「더미 텍스트」 근거 하나를 적어 둔다(sample) — 근거 달기 화면의
 * 단추가 채운다. 시연에서 글자를 치지 않고도 등록까지 보여 주기 위해서다.
 */

import type { Debate, DebateRoom, Ground, Side, SourceHit } from "@/types/debate";

export type { Debate, DebateRoom, Ground, Side, SourceHit };

export const filters = ["전체", "참여 중 3", "공개", "비공개"] as const;

/**
 * 목록 — 위에서부터 최근 말이 있었던 순. 「참여 중」은 내가 들어가 있는 방
 * (joined)이다 — 필터 이름의 3 이 이 수다.
 */
export const rooms: DebateRoom[] = [
  {
    id: "one-plus-one",
    title: "편의점 1+1 이득이다 vs 아니다",
    // 배경은 편의점 진열대(stage.png) — 방 뒤에 깔리는 그 그림을 썸네일로도
    thumb: "/assets/debate/stage.png",
    live: true,
    when: "방금",
    lastMessage: "아니 유통기한이 그럼 왜 있음, 당연 안되지;;;",
    members: 26,
    capacity: 100,
    tags: ["심야", "아무말"],
    ready: true,
    joined: true,
  },
  {
    id: "sauce",
    title: "탕수육 부먹 vs 찍먹",
    thumb: "/assets/debate/bg/sauce.jpg",
    live: true,
    when: "3분 전",
    lastMessage: "배달은 무조건 찍먹이지 눅눅해지는데",
    members: 41,
    capacity: 100,
    tags: ["음식", "아무말"],
    ready: true,
  },
  {
    id: "sourced-only",
    title: "출처 있는 것만 말하기",
    when: "12분 전",
    lastMessage: "논문 링크 첨부합니다. 2019년 자료라 좀 오래되긴 했는데",
    members: 8,
    capacity: 15,
    tags: ["팩트체크"],
    ready: true,
    joined: true,
  },
  {
    id: "four-day",
    title: "주 4일제, 생산성 오른다 vs 떨어진다",
    thumb: "/assets/debate/bg/four-day.jpg",
    live: true,
    when: "25분 전",
    lastMessage: "아이슬란드 실험 결과 보셨어요? 생산성 그대로였대요",
    members: 33,
    capacity: 50,
    tags: ["사회", "경제"],
    ready: true,
  },
  {
    id: "ai-knowledge",
    title: "AI가 쓴 글도 지식일까?",
    thumb: "/assets/debate/bg/ai-knowledge.jpg",
    when: "40분 전",
    lastMessage: "출처가 없으면 카더라랑 뭐가 다름",
    members: 19,
    capacity: 50,
    tags: ["과학", "팩트체크"],
    ready: true,
  },
  {
    id: "history-dig",
    title: "역사 파고들기 (초보 환영)",
    when: "1시간 전",
    lastMessage: "클레오파트라 편 진짜 충격이었음 ㅋㅋㅋ",
    members: 20,
    capacity: 20,
    tags: ["역사"],
    ready: true,
  },
  {
    id: "zoo",
    title: "동물원, 있어야 한다 vs 없애야 한다",
    when: "2시간 전",
    lastMessage: "멸종위기종 보전은 동물원 없이 어떻게 함",
    members: 14,
    capacity: 30,
    tags: ["사회", "과학"],
    ready: true,
  },
  {
    id: "overnight",
    title: "편의점 24시간, 계속 vs 심야 휴업",
    when: "5시간 전",
    lastMessage: "새벽 3시에 컵라면 사러 가는 사람 저요",
    members: 11,
    capacity: 30,
    tags: ["심야", "사회"],
    ready: true,
  },
  {
    id: "study-group",
    title: "우리 조 스터디방",
    thumb: "/assets/debate/bg/study-group.jpg",
    locked: true,
    // 시연용 — 네 자리
    password: "1234",
    when: "어제",
    lastMessage: "내일 10시에 봐요~",
    members: 4,
    capacity: 6,
    tags: ["비공개"],
    ready: true,
    joined: true,
  },
];

/** 근거 목록을 짧게 적는 도우미 — rank 는 차례대로. */
const grounds = (
  rows: [text: string, side: Side, sourced: boolean, likes: number | "new"][],
): Ground[] =>
  rows.map(([text, side, sourced, likes], i) => ({
    id: `g${i + 1}`,
    rank: i + 1,
    text,
    side,
    sourced,
    ...(likes === "new" ? { fresh: true } : { likes }),
  }));

export const debates: Debate[] = [
  {
    id: "one-plus-one",
    topic: "편의점 1+1, 결국 이득일까?",
    topicLines: ["편의점 1+1,", "이득이다 vs 아니다"],
    remaining: "08:12:44",
    members: 26,
    voters: 56,
    options: [
      { side: "A", label: "이득이다", percent: 47 },
      { side: "B", label: "손해다", percent: 53 },
    ],
    chatter: [
      { id: "c1", author: "자취3년차", text: "혼자 살면 유통기한 안에 다 못 먹어요 ㅋㅋ" },
      { id: "c2", author: "야간알바중", text: "안 살 것도 사게 되던데 그건 손해 아님?" },
      { id: "c3", author: "점심에컵라면", text: "필요한 거면 무조건 이득이지 뭘 따져" },
      { id: "c4", author: "가격표스캐너", text: "1+1 붙기 전에 가격 올린 사례 적발됐대요" },
    ],
    incoming: [
      { author: "편의점털이범", text: "냉동은 1+1이 무조건 이득임 안 상함" },
      { author: "영수증모으는사람", text: "단가 계산해 보면 낱개가 더 비싼 게 대부분" },
      { author: "자취3년차", text: "저는 유통기한 짧은 건 그냥 낱개로 사요" },
      { author: "새벽두시", text: "묶어 팔면 재고 도는 속도가 달라서 점포도 이득이래" },
      { author: "야간알바중", text: "결국 필요 없는 걸 샀으면 그건 손해 맞지 않나요" },
      { author: "가격표스캐너", text: "행사 전 가격 캡처해 두면 진짜 비교됨" },
      { author: "점심에컵라면", text: "나눠 먹을 사람 있으면 완전 이득이긴 함" },
      { author: "라면수집가", text: "안 먹고 버린 게 몇 갠지 세어 보면 답 나옴 ㅋㅋ" },
    ],
    grounds: [
      {
        id: "g1",
        rank: 1,
        text: "안 사도 될 물건까지 사게 만드는 유인 효과가 크다",
        side: "B",
        sourced: true,
        likes: 84,
        short: "안 사도 될 물건까지 사게 만드는 유인 효과",
      },
      { id: "g2", rank: 2, text: "낱개로 사면 개당 단가가 더 비싼 경우가 많다", side: "A", sourced: true, likes: 71 },
      { id: "g3", rank: 3, text: "1+1 붙기 직전에 원래 가격을 올린 사례가 적발됐다", side: "B", sourced: true, likes: 55 },
      { id: "g4", rank: 4, text: "혼자 살면 유통기한 안에 다 못 써서 결국 버린다", side: "B", sourced: false, likes: 32 },
      { id: "g5", rank: 5, text: "휴지·물처럼 반드시 쓰는 품목이면 확실히 남는다", side: "A", sourced: false, fresh: true },
    ],
    groundCount: 22,
    likes: 341,
    saves: 22,
    sources: [
      { id: "s1", title: "한국소비자원 · 1+1 행사 가격 실태조사", meta: "www.kca.go.kr · 정부기관", best: true },
      { id: "s2", title: "묶음할인이 단위가격보다 비싼 경우", meta: "알래말래븐 지식 · 사회·경제" },
      { id: "s3", title: "미끼 효과와 충동구매 : 행동경제학", meta: "대한경영학회 · 2024" },
    ],
    sample: {
      side: "A",
      text: "생수·휴지·라면처럼 어차피 계속 사는 물건은 1+1로 사 두면 개당 값이 확실히 내려간다. 소비자원 조사에서도 생필품은 묶음이 단위가격 기준으로 더 쌌다.",
    },
  },
  {
    id: "sauce",
    background: "/assets/debate/bg/sauce.jpg",
    topic: "탕수육, 부어 먹을까 찍어 먹을까?",
    topicLines: ["탕수육,", "부먹 vs 찍먹"],
    remaining: "02:40:10",
    members: 41,
    voters: 128,
    options: [
      { side: "A", label: "부먹", percent: 38 },
      { side: "B", label: "찍먹", percent: 62 },
    ],
    chatter: [
      { id: "c1", author: "탕슉장인", text: "원래 중국집에서는 부어서 나옵니다 부먹이 원조" },
      { id: "c2", author: "바삭러", text: "배달은 무조건 찍먹이지 눅눅해지는데" },
      { id: "c3", author: "점심에컵라면", text: "소스 양 조절이 되는 찍먹이 합리적임" },
      { id: "c4", author: "새벽두시", text: "부먹은 마지막 한 조각까지 소스가 배어서 좋음" },
    ],
    incoming: [
      { author: "야간알바중", text: "찍먹파는 다 먹고 남은 소스 어떻게 함" },
      { author: "탕슉장인", text: "볶음 탕수육은 애초에 부어 나오는 거예요" },
      { author: "바삭러", text: "튀김옷 식감이 반인데 그걸 왜 죽임" },
      { author: "영수증모으는사람", text: "반은 붓고 반은 찍으면 되는 거 아닌가" },
      { author: "자취3년차", text: "혼자 먹으면 찍먹이 다음날까지 바삭함" },
      { author: "새벽두시", text: "식당에서 바로 먹으면 부먹이 맞고 배달은 찍먹" },
    ],
    grounds: grounds([
      ["배달은 오는 동안 튀김옷이 눅눅해져 찍먹이 식감을 지킨다", "B", true, 96],
      ["원조 중국 요리(궈바오러우)는 소스에 볶아 내는 부먹 방식이다", "A", true, 74],
      ["찍먹은 소스 양을 조절할 수 있어 짜게 먹지 않는다", "B", false, 51],
      ["부먹은 튀김옷 안까지 소스가 배어 마지막까지 맛이 같다", "A", false, 40],
      ["둘 다 시켜서 비교해 봤는데 갓 나온 건 부먹이 이겼다", "A", false, "new"],
    ]),
    groundCount: 37,
    likes: 512,
    saves: 48,
    sources: [
      { id: "s1", title: "농촌진흥청 · 튀김 식감과 수분 흡수 연구", meta: "www.rda.go.kr · 정부기관", best: true },
      { id: "s2", title: "궈바오러우와 한국식 탕수육의 차이", meta: "알래말래븐 지식 · 문화·음식" },
      { id: "s3", title: "배달 음식 만족도 조사 : 식감 항목", meta: "한국외식산업연구원 · 2023" },
    ],
    sample: {
      side: "B",
      text: "배달 탕수육은 도착까지 20~30분이 걸리는데 그 사이 소스가 닿은 튀김옷은 수분을 먹고 눅눅해진다. 찍먹은 먹는 순간까지 튀김옷을 지키는 유일한 방법이다.",
    },
  },
  {
    id: "sourced-only",
    topic: "유통기한 지난 음식, 먹어도 될까?",
    topicLines: ["유통기한 지난 음식,", "먹어도 된다 vs 안 된다"],
    remaining: "11:05:30",
    members: 8,
    voters: 21,
    options: [
      { side: "A", label: "먹어도 된다", percent: 57 },
      { side: "B", label: "안 된다", percent: 43 },
    ],
    chatter: [
      { id: "c1", author: "팩트체커", text: "유통기한은 판매 가능 기한이지 섭취 기한이 아닙니다" },
      { id: "c2", author: "가격표스캐너", text: "2023년부터 소비기한 표시로 바뀐 이유가 그거죠" },
      { id: "c3", author: "자취3년차", text: "우유는 냉장 보관하면 유통기한 지나도 며칠은 괜찮았음" },
      { id: "c4", author: "영수증모으는사람", text: "논문 링크 첨부합니다. 2019년 자료라 좀 오래되긴 했는데" },
    ],
    incoming: [
      { author: "팩트체커", text: "식약처 자료: 소비기한은 유통기한보다 평균 20~30% 길어요" },
      { author: "야간알바중", text: "저희 매장은 유통기한 지나면 무조건 폐기입니다" },
      { author: "가격표스캐너", text: "폐기 기준이랑 먹어도 되는 기준은 다른 얘기죠" },
      { author: "새벽두시", text: "생선회 같은 건 유통기한이고 뭐고 냄새로 판단" },
      { author: "영수증모으는사람", text: "보관 온도가 안 지켜졌으면 기한 안이라도 위험" },
      { author: "팩트체커", text: "결론: 기한보다 보관 상태를 봐야 한다는 게 자료 요지" },
    ],
    grounds: grounds([
      ["유통기한은 「팔 수 있는 기한」이고 먹을 수 있는 기한(소비기한)은 더 길다", "A", true, 63],
      ["식약처가 2023년부터 소비기한 표시제로 바꾼 것이 그 근거다", "A", true, 48],
      ["보관 온도가 안 지켜진 식품은 기한 안이라도 상할 수 있다", "B", true, 35],
      ["편의점은 유통기한이 지나면 무조건 폐기한다 — 안전 쪽으로 보는 게 맞다", "B", false, 22],
      ["우유는 냉장 보관하면 기한 뒤 3일까지 괜찮았다(개인 경험)", "A", false, "new"],
    ]),
    groundCount: 15,
    likes: 133,
    saves: 19,
    sources: [
      { id: "s1", title: "식품의약품안전처 · 소비기한 표시제 안내", meta: "www.mfds.go.kr · 정부기관", best: true },
      { id: "s2", title: "유통기한과 소비기한은 다른 날짜다", meta: "알래말래븐 지식 · 생활" },
      { id: "s3", title: "식품 보관 온도와 미생물 증식 : 식품과학회지", meta: "한국식품과학회 · 2019" },
    ],
    sample: {
      side: "A",
      text: "유통기한은 「팔아도 되는 날짜」이고 먹어도 되는 날짜는 소비기한이다. 식약처가 2023년부터 소비기한 표시제로 바꾼 이유가 바로 멀쩡한 음식이 버려지는 것을 막기 위해서다.",
    },
  },
  {
    id: "four-day",
    background: "/assets/debate/bg/four-day.jpg",
    topic: "주 4일제, 생산성은 어떻게 될까?",
    topicLines: ["주 4일제,", "오른다 vs 떨어진다"],
    remaining: "05:55:00",
    members: 33,
    voters: 89,
    options: [
      { side: "A", label: "오른다", percent: 64 },
      { side: "B", label: "떨어진다", percent: 36 },
    ],
    chatter: [
      { id: "c1", author: "칼퇴요정", text: "아이슬란드 실험 결과 보셨어요? 생산성 그대로였대요" },
      { id: "c2", author: "야간알바중", text: "사무직 얘기지 서비스업은 그냥 하루 더 쉬는 게 아님" },
      { id: "c3", author: "점심에컵라면", text: "집중도가 올라가서 4일에 5일 일을 한다는 게 핵심" },
      { id: "c4", author: "새벽두시", text: "결국 같은 일을 4일에 몰아서 하면 밀도만 높아지는 거 아닌가" },
    ],
    incoming: [
      { author: "칼퇴요정", text: "영국 61개 기업 실험에서 92%가 계속하기로 했대요" },
      { author: "가격표스캐너", text: "매출은 유지되고 이직률이 확 떨어졌다는 게 포인트" },
      { author: "야간알바중", text: "교대 근무는 사람을 더 뽑아야 돼서 비용 문제임" },
      { author: "자취3년차", text: "쉬는 날이 늘면 소비도 늘지 않을까" },
      { author: "새벽두시", text: "하루 10시간씩 4일이면 그게 그거" },
      { author: "점심에컵라면", text: "회의만 줄여도 하루는 나온다는 게 경험담" },
    ],
    grounds: grounds([
      ["영국 61개 기업 6개월 실험에서 매출은 유지되고 92%가 제도를 이어 갔다", "A", true, 102],
      ["아이슬란드 공공부문 실험에서 생산성이 유지되거나 올랐다", "A", true, 77],
      ["교대 근무·서비스업은 인력을 더 뽑아야 해서 비용이 는다", "B", true, 44],
      ["같은 일을 4일에 몰면 하루 밀도가 올라 번아웃이 온다", "B", false, 29],
      ["회의를 줄이니 하루가 남더라 — 시간이 아니라 일의 방식 문제", "A", false, "new"],
    ]),
    groundCount: 28,
    likes: 287,
    saves: 61,
    sources: [
      { id: "s1", title: "4 Day Week Global · 영국 실험 결과 보고서(2023)", meta: "www.4dayweek.com · 연구단체", best: true },
      { id: "s2", title: "Autonomy · 아이슬란드 단축근무 실험 분석", meta: "autonomy.work · 2021" },
      { id: "s3", title: "노동시간 단축과 노동생산성 : 노동연구원", meta: "한국노동연구원 · 2022" },
    ],
    sample: {
      side: "A",
      text: "영국에서 61개 기업이 6개월 동안 주 4일제를 실험했는데 매출은 유지되고 이직률은 57% 줄었다. 실험이 끝난 뒤 92%가 제도를 계속하기로 했다는 게 결과를 말해 준다.",
    },
  },
  {
    id: "ai-knowledge",
    background: "/assets/debate/bg/ai-knowledge.jpg",
    topic: "AI가 쓴 글도 지식이라 할 수 있을까?",
    topicLines: ["AI가 쓴 글,", "지식이다 vs 아니다"],
    remaining: "09:30:15",
    members: 19,
    voters: 44,
    options: [
      { side: "A", label: "지식이다", percent: 41 },
      { side: "B", label: "아니다", percent: 59 },
    ],
    chatter: [
      { id: "c1", author: "팩트체커", text: "출처가 없으면 카더라랑 뭐가 다름" },
      { id: "c2", author: "새벽두시", text: "사람이 쓴 글도 출처 없으면 카더라잖아요 똑같지" },
      { id: "c3", author: "영수증모으는사람", text: "AI는 없는 논문을 지어내는 경우가 있어서 문제" },
      { id: "c4", author: "점심에컵라면", text: "검증만 되면 누가 썼는지가 중요한가?" },
    ],
    incoming: [
      { author: "팩트체커", text: "핵심은 「검증 가능한가」지 「누가 썼나」가 아니라고 봄" },
      { author: "야간알바중", text: "알래봇도 답 안 하고 글로 보내잖아요 그게 맞는 방향" },
      { author: "자취3년차", text: "AI 글은 틀려도 자신 있게 말해서 더 위험함" },
      { author: "가격표스캐너", text: "출처 붙이고 사람이 확인하면 도구일 뿐" },
      { author: "새벽두시", text: "백과사전도 결국 사람이 정리한 2차 자료임" },
      { author: "영수증모으는사람", text: "그래서 이 앱에 카더라 태그가 있는 거" },
    ],
    grounds: grounds([
      ["지식의 조건은 검증 가능성이지 저자가 누구인지가 아니다", "A", true, 58],
      ["AI는 존재하지 않는 논문·인용을 지어내는 경우가 보고됐다(환각)", "B", true, 67],
      ["사람이 출처를 확인해 붙인 AI 글은 백과사전의 2차 자료와 다르지 않다", "A", false, 31],
      ["틀린 내용을 확신에 찬 문장으로 써서 독자가 의심하기 어렵다", "B", true, 40],
      ["출처 없는 글에 카더라를 붙이는 규칙이 있으면 누가 썼든 같은 잣대다", "A", false, "new"],
    ]),
    groundCount: 19,
    likes: 176,
    saves: 33,
    sources: [
      { id: "s1", title: "Nature · 대형 언어모델의 환각(hallucination) 연구", meta: "www.nature.com · 학술지", best: true },
      { id: "s2", title: "출처 없는 주장에 카더라 태그가 붙는 이유", meta: "알래말래븐 지식 · 사회" },
      { id: "s3", title: "생성형 AI 정보 신뢰도 인식 조사", meta: "한국언론진흥재단 · 2024" },
    ],
    sample: {
      side: "B",
      text: "AI는 있지도 않은 논문을 그럴듯한 제목과 저자까지 붙여 지어내는 일이 있다. 검증 전에는 지식이 아니라 카더라이고, 확신에 찬 문장이라 오히려 더 의심하기 어렵다.",
    },
  },
  {
    id: "history-dig",
    topic: "훈민정음, 세종 혼자 만들었을까?",
    topicLines: ["훈민정음,", "혼자 만들었다 vs 함께 만들었다"],
    remaining: "23:10:05",
    members: 20,
    voters: 52,
    options: [
      { side: "A", label: "혼자 만들었다", percent: 55 },
      { side: "B", label: "함께 만들었다", percent: 45 },
    ],
    chatter: [
      { id: "c1", author: "역사덕후", text: "실록에 「임금이 친히 28자를 지었다」고 적혀 있어요" },
      { id: "c2", author: "새벽두시", text: "클레오파트라 편 진짜 충격이었음 ㅋㅋㅋ" },
      { id: "c3", author: "점심에컵라면", text: "근데 집현전 학자들은 뭘 한 거예요 그럼" },
      { id: "c4", author: "역사덕후", text: "해례본, 그러니까 설명서를 썼죠. 글자 자체는 아니고" },
    ],
    incoming: [
      { author: "야간알바중", text: "최만리가 반대 상소 올렸을 때 세종이 직접 반박한 기록도 있음" },
      { author: "자취3년차", text: "신하들도 만드는 걸 몰랐다는 게 신기함" },
      { author: "역사덕후", text: "정의공주가 도왔다는 설은 후대 기록이라 약해요" },
      { author: "가격표스캐너", text: "혼자 만들고 설명서는 같이 — 반반이네" },
      { author: "새벽두시", text: "1443년 창제, 1446년 반포. 3년 사이가 해례본 작업" },
      { author: "점심에컵라면", text: "다음 주제는 클레오파트라로 가죠" },
    ],
    grounds: grounds([
      ["세종실록 1443년 12월 기사에 「임금이 친히 언문 28자를 지었다」고 적혀 있다", "A", true, 88],
      ["훈민정음 해례본은 정인지 등 집현전 학자들이 왕명으로 엮은 것이다", "B", true, 61],
      ["최만리의 반대 상소에 세종이 직접 음운 이론으로 반박한 기록이 있다", "A", true, 47],
      ["창제 과정이 신하들에게도 비밀이었다는 기록이 여럿이다", "A", false, 30],
      ["정의공주가 도왔다는 기록은 후대 문헌이라 근거가 약하다", "A", false, "new"],
    ]),
    groundCount: 24,
    likes: 209,
    saves: 45,
    sources: [
      { id: "s1", title: "국립한글박물관 · 훈민정음 창제와 해례본", meta: "www.hangeul.go.kr · 공공기관", best: true },
      { id: "s2", title: "세종대왕은 혼자 한글을 만들었을까?", meta: "알래말래븐 지식 · 역사·인물" },
      { id: "s3", title: "조선왕조실록 세종 25년 12월 30일", meta: "국사편찬위원회 · sillok.history.go.kr" },
    ],
    sample: {
      side: "A",
      text: "세종실록 1443년 12월 기사에 「임금이 친히 언문 28자를 지었다」고 분명히 적혀 있다. 집현전 학자들이 한 일은 3년 뒤 해례본, 즉 설명서를 엮은 것이지 글자를 만든 게 아니다.",
    },
  },
  {
    id: "zoo",
    topic: "동물원, 있어야 할까 없애야 할까?",
    topicLines: ["동물원,", "있어야 한다 vs 없애야 한다"],
    remaining: "14:20:00",
    members: 14,
    voters: 38,
    options: [
      { side: "A", label: "있어야 한다", percent: 48 },
      { side: "B", label: "없애야 한다", percent: 52 },
    ],
    chatter: [
      { id: "c1", author: "동물친구", text: "멸종위기종 보전은 동물원 없이 어떻게 함" },
      { id: "c2", author: "새벽두시", text: "북극곰이 35도 서울에 있는 게 보전임?" },
      { id: "c3", author: "점심에컵라면", text: "아이들이 동물을 실제로 볼 수 있는 유일한 곳이긴 함" },
      { id: "c4", author: "자취3년차", text: "영상으로 보는 게 더 자세하고 동물도 안 힘듦" },
    ],
    incoming: [
      { author: "동물친구", text: "따오기·황새 복원은 동물원 사육 기술로 해낸 거예요" },
      { author: "야간알바중", text: "좁은 우리에서 왔다갔다 하는 정형행동 보면 마음 아픔" },
      { author: "가격표스캐너", text: "동물원을 없애는 게 아니라 생추어리로 바꾸자는 쪽이 현실적" },
      { author: "영수증모으는사람", text: "입장료가 보전 기금으로 가는 구조면 찬성" },
      { author: "새벽두시", text: "코끼리·고래류는 어떤 시설에서도 스트레스가 크다는 연구 있음" },
      { author: "동물친구", text: "결국 어떤 동물을 어떻게 키우느냐 문제" },
    ],
    grounds: grounds([
      ["따오기·황새 등 멸종위기종 복원은 동물원의 사육·번식 기술로 이뤄졌다", "A", true, 72],
      ["좁은 사육장의 동물에게 정형행동(반복 행동)이 나타난다는 연구가 많다", "B", true, 66],
      ["코끼리·고래류는 어떤 시설에서도 스트레스가 크다는 보고가 있다", "B", true, 49],
      ["아이들이 동물을 직접 보는 경험이 생명 감수성을 기른다", "A", false, 27],
      ["없애는 게 아니라 생추어리(보호구역)형으로 바꾸는 것이 현실적이다", "B", false, "new"],
    ]),
    groundCount: 17,
    likes: 154,
    saves: 28,
    sources: [
      { id: "s1", title: "국립생태원 · 멸종위기종 증식·복원 사업 보고", meta: "www.nie.re.kr · 공공기관", best: true },
      { id: "s2", title: "사육 동물의 정형행동 연구", meta: "한국동물복지학회 · 2021" },
      { id: "s3", title: "동물원 및 수족관의 관리에 관한 법률", meta: "국가법령정보센터 · law.go.kr" },
    ],
    sample: {
      side: "B",
      text: "좁은 우리 안에서 같은 길을 왔다 갔다 하는 정형행동은 동물이 스트레스를 받고 있다는 신호다. 특히 코끼리와 고래류는 어떤 시설에서도 스트레스가 크다는 연구가 이어지고 있다.",
    },
  },
  {
    id: "overnight",
    topic: "편의점 24시간 영업, 계속해야 할까?",
    topicLines: ["편의점 24시간,", "계속 vs 심야 휴업"],
    remaining: "18:45:30",
    members: 11,
    voters: 29,
    options: [
      { side: "A", label: "계속", percent: 59 },
      { side: "B", label: "심야 휴업", percent: 41 },
    ],
    chatter: [
      { id: "c1", author: "새벽두시", text: "새벽 3시에 컵라면 사러 가는 사람 저요" },
      { id: "c2", author: "야간알바중", text: "새벽 매출로 야간 인건비도 안 나오는 점포 많아요" },
      { id: "c3", author: "자취3년차", text: "24시간이 편의점의 정체성 아님?" },
      { id: "c4", author: "가격표스캐너", text: "일본도 심야 휴업 점포가 늘고 있대요" },
    ],
    incoming: [
      { author: "야간알바중", text: "점주가 정하게 두면 되는 문제 아닌가요" },
      { author: "점심에컵라면", text: "새벽에 열린 곳이 있다는 안심감도 가치임" },
      { author: "새벽두시", text: "야간 범죄 신고 거점 역할도 한다는 기사 봄" },
      { author: "영수증모으는사람", text: "무인 편의점으로 심야를 돌리는 게 절충" },
      { author: "자취3년차", text: "심야 물건값을 올리는 것도 방법" },
      { author: "가격표스캐너", text: "결국 상권마다 다르다는 결론" },
    ],
    grounds: grounds([
      ["심야 매출이 야간 인건비를 못 넘는 점포가 적지 않다(가맹점 조사)", "B", true, 45],
      ["새벽에 열린 곳이 있다는 안심감과 야간 치안 거점 역할이 있다", "A", true, 52],
      ["일본은 심야 휴업을 허용한 뒤 점포 유지율이 올랐다", "B", true, 33],
      ["24시간은 편의점의 정체성이라 심야가 닫히면 마트와 다를 게 없다", "A", false, 21],
      ["무인 운영으로 심야를 돌리면 둘 다 잡을 수 있다", "A", false, "new"],
    ]),
    groundCount: 13,
    likes: 98,
    saves: 14,
    sources: [
      { id: "s1", title: "전국편의점가맹점협회 · 심야 영업 실태 조사", meta: "가맹점 단체 · 2023", best: true },
      { id: "s2", title: "우리나라 편의점은 5만 개가 넘는다", meta: "알래말래븐 지식 · 사회·경제" },
      { id: "s3", title: "일본 편의점 심야 휴업 허용 이후 변화", meta: "일본경제신문 · 2022" },
    ],
    sample: {
      side: "A",
      text: "편의점이 새벽에도 켜져 있다는 것 자체가 동네의 안심감이다. 야간에 위급한 사람이 들어와 도움을 받거나 범죄 신고 거점이 된 사례가 기사로 여럿 나왔다.",
    },
  },
  {
    id: "study-group",
    background: "/assets/debate/bg/study-group.jpg",
    topic: "발표 주제 정하기: 종이책 vs 전자책",
    topicLines: ["우리 조 발표,", "종이책 vs 전자책"],
    remaining: "1일 02:00:00",
    members: 4,
    voters: 4,
    options: [
      { side: "A", label: "종이책", percent: 75 },
      { side: "B", label: "전자책", percent: 25 },
    ],
    chatter: [
      { id: "c1", author: "김민정", text: "내일 10시에 봐요~" },
      { id: "c2", author: "한상현", text: "저는 종이책이요 밑줄 긋는 맛이 있음" },
      { id: "c3", author: "온도0도", text: "전자책은 검색이 돼서 자료 조사에 압도적" },
      { id: "c4", author: "김민정", text: "3:1이네요, 그래도 근거로 정하죠" },
    ],
    incoming: [
      { author: "한상현", text: "종이책이 이해도가 더 높다는 연구 찾았어요" },
      { author: "온도0도", text: "그 연구 표본이 학생 30명이던데요" },
      { author: "김민정", text: "둘 다 근거 달아 두면 내일 정리하기 편할 듯" },
      { author: "한상현", text: "ㅇㅋ 근거 달고 잘게요" },
    ],
    grounds: grounds([
      ["종이책이 긴 글의 이해도와 기억에 유리하다는 메타분석이 있다", "A", true, 3],
      ["전자책은 본문 검색·형광펜 모아보기가 돼 자료 조사에 빠르다", "B", true, 3],
      ["전자책은 한 기기에 수백 권을 넣을 수 있어 휴대에 유리하다", "B", false, 2],
      ["종이책은 눈이 덜 피로하고 잠들기 전에 읽기 좋다", "A", false, 2],
      ["둘 다 쓰는 사람이 제일 많다 — 발표는 「용도별 선택」으로", "A", false, "new"],
    ]),
    groundCount: 5,
    likes: 6,
    saves: 2,
    sources: [
      { id: "s1", title: "Delgado et al. · 종이 vs 화면 읽기 이해도 메타분석(2018)", meta: "Educational Research Review · 학술지", best: true },
      { id: "s2", title: "국민 독서실태 조사 : 전자책 이용률", meta: "문화체육관광부 · 2023" },
      { id: "s3", title: "디지털 읽기와 눈의 피로", meta: "대한안과학회 · 2022" },
    ],
    sample: {
      side: "A",
      text: "54개 연구를 모은 메타분석에서 같은 글을 종이로 읽은 쪽이 화면으로 읽은 쪽보다 이해도가 높았다. 특히 시간에 쫓기며 읽을 때 차이가 커졌다.",
    },
  },
];

/** 근거 rank colours run down the Primary ramp — Figma 805:3773 … 805:3825. */
export const RANK_COLORS = ["#004d32", "#006743", "#008154", "#66cda9", "#88e6c5"];

export const getDebate = (id: string): Debate | undefined =>
  debates.find((entry) => entry.id === id);

/** 출처 검색 결과 — 방마다 다르다. 없는 방은 첫 방 것을 쓴다. */
export const sourceHits: SourceHit[] = debates[0].sources;
