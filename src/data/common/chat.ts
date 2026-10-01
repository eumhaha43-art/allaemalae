/**
 * Mock content for the chat screens
 * (Figma 761:1026 "채팅방 홈" and 564:6197 "채팅방_대화").
 *
 * Same deal as `@/data/common/community` — there is no backend yet, so the rooms and
 * the seeded thread live here and the components only read these shapes.
 */

import type { Message, Room, SortId, Thread, Typing } from "@/types/chat";

export type { Message, Room, SortId, Thread, Typing };


/** House rule pinned to the top of every room. */
export const NOTICE = "출처 없는 주장엔 ‘카더라’ 태그를 붙여주세요";

/** 로비의 가로등 옆 안내 — 한 번 눌러 볼 때까지 붙어 있다. */
export const LAMP_HINT = "가로등을 누르면 낮·밤이 바뀌어요";

/** What a host can switch on when opening a room; the first two start on. */
export const ROOM_RULES = [
  "출처 없는 주장에는 ‘카더라’ 태그를 붙인다",
  "욕설·비방은 3회 누적 시 자동 퇴장",
  "24시간 대화가 없으면 방을 자동 정리한다",
] as const;

export const DEFAULT_RULES: readonly boolean[] = [true, true, false];

/**
 * What the lobby shows, one table pair at a time. The reset button in the
 * corner walks through these, so each set is a different pair of tables.
 * The first is the pair drawn in the design.
 */
// Authored newest-first, so 최근 대화순 leaves the pairing the design drew.
export const roomSets: Room[][] = [
  [
    {
      id: "night-trivia",
      title: "새벽 3시 잡지식 창고",
      live: true,
      host: "야간알바중",
      members: 14,
      capacity: 20,
      minutesAgo: 0,
      saves: 128,
    },
    {
      id: "sourced-only",
      title: "출처 있는 것만 말하기",
      host: "온도0도",
      members: 8,
      capacity: 15,
      minutesAgo: 12,
      saves: 96,
    },
  ],
  [
    {
      id: "new-arrivals",
      title: "편의점 신상 털어보기",
      host: "삼각김밥러버",
      members: 11,
      capacity: 20,
      minutesAgo: 18,
      saves: 54,
    },
    {
      id: "useless-facts",
      title: "오늘 배운 쓸데없는 지식",
      live: true,
      host: "새벽두시",
      members: 2,
      capacity: 12,
      minutesAgo: 24,
      saves: 210,
    },
  ],
  [
    {
      id: "night-shift",
      title: "야간 알바 생존 노하우",
      live: true,
      host: "점심에컵라면",
      members: 4,
      capacity: 12,
      minutesAgo: 33,
      saves: 41,
    },
    {
      id: "no-hearsay",
      title: "카더라 금지 구역",
      live: true,
      host: "팩트체커",
      members: 3,
      capacity: 15,
      minutesAgo: 41,
      saves: 173,
    },
  ],
  [
    {
      id: "expiry-debate",
      title: "유통기한 vs 소비기한",
      host: "냉장고지킴이",
      members: 19,
      capacity: 20,
      minutesAgo: 55,
      saves: 88,
    },
    {
      id: "late-night",
      title: "새벽에만 열리는 잡담방",
      host: "온도0도",
      members: 1,
      capacity: 8,
      minutesAgo: 70,
      saves: 12,
    },
  ],
];

export const rooms: Room[] = roomSets.flat();

/** "방금", "12분 전", "1시간 전" — the label the bubbles and list rows print. */
export function sinceLabel(minutes: number): string {
  if (minutes < 1) return "방금";
  if (minutes < 60) return `${minutes}분 전`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}시간 전`;
  return `${Math.floor(hours / 24)}일 전`;
}


export const SORTS: { id: SortId; label: string }[] = [
  { id: "recent", label: "최근 대화순" },
  { id: "popular", label: "인기순" },
  { id: "saved", label: "저장순" },
];

/** Sorts a copy — callers pass the merged list, which they reuse elsewhere. */
export function sortRooms(list: Room[], sort: SortId): Room[] {
  const by = {
    recent: (a: Room, b: Room) => a.minutesAgo - b.minutesAgo,
    popular: (a: Room, b: Room) => b.members - a.members,
    saved: (a: Room, b: Room) => b.saves - a.saves,
  }[sort];
  return [...list].sort(by);
}

export const getRoom = (id: string): Room | undefined => rooms.find((room) => room.id === id);

/**
 * How many grey figures sit at a room's table. A table seats two, so a room
 * that is half full or better fills both chairs and a quiet one leaves a
 * single person waiting.
 */
export const seatCount = (room: Room): 1 | 2 => (room.members * 2 >= room.capacity ? 2 : 1);




const AVATAR = {
  cold: "/assets/chat/avatar-1.png",
  night: "/assets/chat/avatar-2.png",
  ramen: "/assets/chat/avatar-3.png",
} as const;

const TODAY = { kind: "chip", id: "d1", label: "오늘 · 8월 30일" } as const;

export const threads: Record<string, Thread> = {
  "night-trivia": {
    messages: [
      TODAY,
      { kind: "chip", id: "j1", label: "온도0도님이 들어왔어요" },
      {
        kind: "text",
        id: "m1",
        author: "온도0도",
        avatar: AVATAR.cold,
        text: "그럼 편의점 우유는 유통기한 지나도 먹어도 되는 거예요?",
        time: "02:58",
      },
      { kind: "text", id: "m2", text: "며칠까지 괜찮은 거지", time: "02:58" },
      {
        kind: "post",
        id: "m3",
        author: "야간알바중",
        avatar: AVATAR.night,
        title: "편의점 우유 유통기한, 하루는 더 괜찮다?",
        excerpt: "유통기한은 팔아도 되는 기한, 소비기한은 먹어도 되는 기한",
        time: "03:01",
      },
      {
        kind: "text",
        id: "m4",
        mine: true,
        text: "와 이거 저도 궁금했는데 정리 감사합니다 ㄳㄳ",
        time: "03:02",
      },
      {
        kind: "text",
        id: "m5",
        author: "점심에컵라면",
        avatar: AVATAR.ramen,
        text: "근데 이거 출처 어디예요? 그냥 카더라면 태그 붙여야 할 듯",
        time: "03:04",
      },
    ],
    typing: { avatar: "/assets/chat/avatar-typing.svg" },
    live: [
      { kind: "text", id: "l1", author: "야간알바중", avatar: AVATAR.night, text: "식약처 소비기한 안내에 그대로 있어요. 미개봉 냉장 우유는 45일까지 봅니다", time: "" },
      { kind: "text", id: "l2", author: "점심에컵라면", avatar: AVATAR.ramen, text: "출처 있으면 인정이죠 ㅋㅋ", time: "" },
      { kind: "text", id: "l3", author: "온도0도", avatar: AVATAR.cold, text: "우유는 그렇다 치고 삼각김밥은요?", time: "" },
      { kind: "text", id: "l4", author: "야간알바중", avatar: AVATAR.night, text: "그건 진짜 그날 안에 드세요. 밥이 굳는 것도 문제라서요", time: "" },
      { kind: "chip", id: "l5", label: "새벽두시님이 들어왔어요" },
      { kind: "text", id: "l6", author: "새벽두시", avatar: AVATAR.cold, text: "뭐예요 이 시간에 다들 안 자고", time: "" },
      { kind: "text", id: "l7", author: "점심에컵라면", avatar: AVATAR.ramen, text: "야간이라 지금이 저희 점심시간입니다", time: "" },
      { kind: "text", id: "l8", author: "새벽두시", avatar: AVATAR.cold, text: "아 맞다, 편의점 우유가 마트 우유보다 유통기한이 짧다던데요", time: "" },
      { kind: "text", id: "l9", author: "야간알바중", avatar: AVATAR.night, text: "그거 출처 있어요? 없으면 카더라 태그 붙여 주세요", time: "" },
      { kind: "text", id: "l10", author: "새벽두시", avatar: AVATAR.cold, tag: "카더라", text: "출처는 없고 전에 같이 알바하던 형한테 들었어요", time: "" },
    ],
  },
  "useless-facts": {
    messages: [
      TODAY,
      { kind: "chip", id: "j1", label: "야간알바중님이 들어왔어요" },
      {
        kind: "text",
        id: "m1",
        author: "새벽두시",
        avatar: AVATAR.cold,
        text: "오늘의 쓸데없는 지식: 바나나는 나무가 아니라 풀입니다",
        time: "02:40",
      },
      { kind: "text", id: "m2", mine: true, text: "엥 그럼 바나나가 열매가 아니라는 건가요", time: "02:41" },
      {
        kind: "text",
        id: "m3",
        author: "새벽두시",
        avatar: AVATAR.cold,
        text: "열매는 맞는데 나무에서 안 열려요 ㅋㅋ",
        time: "02:41",
      },
    ],
    typing: { avatar: "/assets/chat/avatar-typing.svg" },
    live: [
      { kind: "text", id: "l1", author: "야간알바중", avatar: AVATAR.night, text: "그럼 바나나밭이지 바나나숲이 아니네요", time: "" },
      { kind: "text", id: "l2", author: "새벽두시", avatar: AVATAR.cold, text: "정확합니다. 우리가 줄기라고 부르는 것도 사실 잎자루예요", time: "" },
      { kind: "chip", id: "l3", label: "삼각김밥러버님이 들어왔어요" },
      { kind: "text", id: "l4", author: "삼각김밥러버", avatar: AVATAR.ramen, text: "저도 하나 — 문어는 심장이 세 개예요", time: "" },
      { kind: "text", id: "l5", author: "야간알바중", avatar: AVATAR.night, text: "두 개는 아가미로, 하나는 온몸으로 피를 보낸다고 하더라고요", time: "" },
      { kind: "text", id: "l6", author: "삼각김밥러버", avatar: AVATAR.ramen, text: "헤엄칠 때는 몸쪽 심장이 멈춰서 문어가 기어다니는 걸 더 좋아한대요", time: "" },
      { kind: "text", id: "l7", author: "새벽두시", avatar: AVATAR.cold, text: "이 방 오늘 수확 좋다", time: "" },
      { kind: "text", id: "l8", author: "삼각김밥러버", avatar: AVATAR.ramen, text: "아 그리고 우유 많이 마시면 키 큰다는 것도 있잖아요", time: "" },
      { kind: "text", id: "l9", author: "새벽두시", avatar: AVATAR.cold, text: "그건 출처 있어요? 없으면 카더라 태그 붙여 주세요", time: "" },
      { kind: "text", id: "l10", author: "삼각김밥러버", avatar: AVATAR.ramen, tag: "카더라", text: "없습니다. 어릴 때 엄마한테 들은 거예요", time: "" },
    ],
  },
  "night-shift": {
    messages: [
      TODAY,
      { kind: "chip", id: "j1", label: "온도0도님이 들어왔어요" },
      {
        kind: "text",
        id: "m1",
        author: "점심에컵라면",
        avatar: AVATAR.ramen,
        text: "야간 첫날인데 뭐부터 하면 되나요",
        time: "01:12",
      },
      {
        kind: "text",
        id: "m2",
        author: "온도0도",
        avatar: AVATAR.cold,
        text: "일단 유통기한 도는 것부터요. 그게 제일 오래 걸려요",
        time: "01:13",
      },
    ],
    typing: { avatar: "/assets/chat/avatar-typing.svg" },
    live: [
      { kind: "text", id: "l1", author: "점심에컵라면", avatar: AVATAR.ramen, text: "삼각김밥은 몇 시에 빼요?", time: "" },
      { kind: "text", id: "l2", author: "온도0도", avatar: AVATAR.cold, text: "폐기 시간표가 냉장고 옆에 붙어 있을 거예요", time: "" },
      { kind: "text", id: "l3", text: "없으면 점장님한테 달라고 하세요", time: "" },
      { kind: "chip", id: "l4", label: "야간알바중님이 들어왔어요" },
      { kind: "text", id: "l5", author: "야간알바중", avatar: AVATAR.night, text: "새벽 4시가 제일 힘들어요. 그때 마실 거 미리 빼두세요", time: "" },
      { kind: "text", id: "l6", author: "점심에컵라면", avatar: AVATAR.ramen, text: "메모했습니다 ㄳㄳ", time: "" },
      { kind: "text", id: "l7", author: "온도0도", avatar: AVATAR.cold, text: "담배 진열은 손님 없을 때 미리 채워두면 편해요", time: "" },
      { kind: "text", id: "l8", author: "야간알바중", avatar: AVATAR.night, text: "6시부터 출근길 손님이 한꺼번에 몰리거든요", time: "" },
      { kind: "text", id: "l9", author: "점심에컵라면", avatar: AVATAR.ramen, text: "야간은 무조건 시급 1.5배라던데 맞아요?", time: "" },
      { kind: "text", id: "l10", author: "온도0도", avatar: AVATAR.cold, text: "가게마다 달라요. 출처 없으면 카더라 태그 붙여 주세요", time: "" },
      { kind: "text", id: "l11", author: "점심에컵라면", avatar: AVATAR.ramen, tag: "카더라", text: "친구가 그렇게 받는다고 해서 그런 줄 알았어요", time: "" },
    ],
  },
  "no-hearsay": {
    messages: [
      TODAY,
      { kind: "chip", id: "j1", label: "새벽두시님이 들어왔어요" },
      {
        kind: "text",
        id: "m1",
        author: "팩트체커",
        avatar: AVATAR.night,
        text: "여기는 출처 없으면 카더라 태그 붙이는 방입니다",
        time: "23:40",
      },
      {
        kind: "text",
        id: "m2",
        author: "새벽두시",
        avatar: AVATAR.cold,
        text: "그럼 «혀 부위별로 맛을 느낀다»는 카더라죠?",
        time: "23:42",
      },
    ],
    typing: { avatar: "/assets/chat/avatar-typing.svg" },
    live: [
      { kind: "text", id: "l1", author: "팩트체커", avatar: AVATAR.night, text: "맞아요. 1901년 논문을 잘못 옮긴 게 100년을 갔습니다", time: "" },
      { kind: "text", id: "l2", text: "혀는 어디서나 다섯 가지 맛을 다 느껴요", time: "" },
      { kind: "text", id: "l3", author: "새벽두시", avatar: AVATAR.cold, text: "학교에서 배운 건데 억울하네요", time: "" },
      { kind: "chip", id: "l4", label: "온도0도님이 들어왔어요" },
      { kind: "text", id: "l5", author: "온도0도", avatar: AVATAR.cold, text: "«금붕어 기억력 3초»도 카더라인가요?", time: "" },
      { kind: "text", id: "l6", author: "팩트체커", avatar: AVATAR.night, text: "네. 실험에서는 몇 달까지 기억합니다", time: "" },
      { kind: "text", id: "l7", author: "온도0도", avatar: AVATAR.cold, text: "«박쥐는 눈이 안 보인다»는요?", time: "" },
      { kind: "text", id: "l8", author: "팩트체커", avatar: AVATAR.night, text: "박쥐도 눈 있어요. 큰박쥐는 시력이 꽤 좋습니다", time: "" },
      { kind: "text", id: "l9", author: "새벽두시", avatar: AVATAR.cold, text: "사람이 뇌의 10%만 쓴다는 것도 아닌가요", time: "" },
      { kind: "text", id: "l10", author: "팩트체커", avatar: AVATAR.night, text: "출처 대실 수 있어요? 없으면 카더라 태그 붙여 주세요", time: "" },
      { kind: "text", id: "l11", author: "새벽두시", avatar: AVATAR.cold, tag: "카더라", text: "영화에서 봤습니다...", time: "" },
    ],
  },
  /** Nobody has said anything here yet — only the join line the design shows. */
  "sourced-only": {
    messages: [TODAY, { kind: "chip", id: "j1", label: "온도0도님이 들어왔어요" }],
  },
};

/** A room nobody has written a thread for opens on today's date and nothing else. */
export const getThread = (id: string): Thread => threads[id] ?? { messages: [TODAY] };

/**
 * 대화가 오간 방인지. 날짜·입장 알림만 있는 방은 아직 아무 말도 없는 방이다.
 *
 * 로비에서 방이 살아 있는지 흐리게 보일지를 이 값으로 가른다 — 들어가 보기
 * 전에는 조용한 방인지 알 수 없어, 다 똑같이 보이면 아무 데나 눌러 보고
 * 빈 방을 만난다.
 */
export const hasTalk = (id: string): boolean =>
  (threads[id]?.messages ?? []).some((message) => message.kind !== "chip");
