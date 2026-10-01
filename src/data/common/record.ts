/**
 * 기록 — Figma 829:2595(영수증) · 829:2501(꾸미기) · 855:3309(꾸민 뒤).
 *
 * 그날 읽은 지식이 영수증 한 장으로 나온다. 줄에 적히는 제목은 앱에 이미 있는
 * 잡지식에서 가져왔다 — 같은 지식이 홈·장바구니에도 나오므로 문구가 갈라지지
 * 않게 한다.
 */

import { items as cartItems } from "@/data/common/cart";
import type { FontId, Paper, ReceiptLine, SavedRecord, Sticker } from "@/types/record";

export const tabs = ["영수증", "월간지식", "주간지식"] as const;

/**
 * 오늘 영수증 — 829:2595.
 *
 * `issued` 는 서버가 그릴 때만 쓰는 자리다. 브라우저에서는 저장소에 찍힌
 * 진짜 발행 시각으로 갈린다 — `@/state/receiptStore`.
 */
export const receipt = {
  /** 맨 위 브랜드 마크의 대체 문구. 그림은 assets/logo-wide.svg 를 쓴다. */
  brand: "알래말래븐",
  shop: "알래말래븐 · 24시간 지식 편의점",
  issued: "2026-09-06 13:00:00",
  dateLabel: "Date:",
  /**
   * 아직 뽑은 것이 없을 때 보이는 줄 — 장바구니에서 다 먹은 것 셋(cart.ts). 전에는
   * 따로 적혀 있어 장바구니에 없는 지식이 영수증에 찍혀 있었다(감수 지적).
   */
  lines: cartItems
    .filter((item) => item.state === "다 먹음")
    .slice(0, 3)
    .map((item) => ({ title: item.title.join(" "), price: "1코인" })) as ReceiptLine[],
  totalLabel: "가격",
  total: "3코인",
  /** 담은 것이 하나도 없는 사람의 영수증 한 줄 */
  emptyLine: "아직 다 먹은 지식이 없어요",
} as const;

/** 기록 홈의 문구 — 829:2595 · 855:3309 */
export const recordCopy = {
  /**
   * 영수증 밑 안내 — 사실대로 말한다(사용자 요청).
   *
   * 기록에 들어가는 것은 「바로 뽑기」나 꾸미기의 「기록 저장하기」를 누른 순간이지
   * 꾸민 순간이 아니다. 전에는 「꾸미면 캘린더에 나타나요」라고 해서 꾸미기만
   * 하고 나간 사람이 저장된 줄 알았다.
   */
  unsavedNote: "아직 오늘 기록에 넣지 않았어요 — 꾸미거나 바로 뽑으면 들어가요",
  savedNote: "이 영수증은 오늘 기록에 들어가 있어요 · 꾸미면 캘린더에도 꾸민 모습으로 보여요",
  savedDecoratedNote: "이 영수증은 오늘 기록에 들어가 있어요 · 캘린더에도 꾸민 모습 그대로 보여요",
  decorate: "영수증 꾸미러 가기",
  /** 좁은 자리(뽑기 결과의 반 폭 단추 · 360 미만)에서는 짧게 */
  decorateShort: "꾸미러 가기",
  /** 꾸미지 않고 그대로 기록에 넣는다 — 뽑히는 장면이 뜬다. */
  pull: "영수증 바로 뽑기",
  /**
   * 영수증에 더 얹으러 가는 길 — 냉장고의 다 먹음 탭으로(사용자 결정). 거기서
   * 다 먹은 지식을 여럿 골라 「영수증 뽑기」를 누르면 이 화면으로 돌아온다.
   * 카드뉴스 끝의 「기록하러 가기」로 온 사람이 한 편만 얹고 끝나지 않게.
   */
  more: "더 담으러 가기",
  share: "SNS 공유",
  save: "핸드폰 저장",
  again: "다시 꾸미기",
  /** 그림을 만드는 동안 단추에 뜨는 말 */
  making: "영수증 만드는 중…",
  shareTitle: "오늘의 지식 영수증",
  shareText: "알래말래븐에서 오늘 읽은 지식이에요.",
  /**
   * 저장하고 나서 알려 주는 말.
   *
   * 웹에서 사진첩에 바로 넣을 수는 없다 — 휴대폰은 공유 창을 거쳐야 하고 PC 는
   * 내려받기가 된다. 어디로 갔는지 말해 주지 않으면 눌러도 아무 일도 안 난 줄
   * 안다.
   */
  sharedOk: "공유했어요",
  savedToPhone: "공유 창에서 「이미지 저장」을 누르면 사진첩에 담겨요",
  savedToDisk: "사진첩에 저장했어요",
  saveFailed: "저장하지 못했어요. 잠시 뒤 다시 해 주세요",
} as const;

/**
 * 용지 — 기본 · 크래프트 · 패턴 · 직접 고른 사진.
 *
 * 패턴은 이미지 없이 잔점을 반복해 만든다. 사진은 색만 여기 값을 쓰고 무늬는
 * 고른 사진이 대신한다.
 */
export const papers = {
  plain: { label: "기본", tint: "#f3f3f3", pattern: null as string | null, patternSize: "auto" },
  kraft: { label: "크래프트", tint: "#f2ece1", pattern: null as string | null, patternSize: "auto" },
  pattern: {
    label: "패턴",
    tint: "#f2ece1",
    pattern:
      "radial-gradient(#d8cdb8 1px, transparent 1px), radial-gradient(#d8cdb8 1px, transparent 1px)",
    patternSize: "14px 14px, 14px 14px",
  },
  photo: { label: "내 이미지", tint: "#f3f3f3", pattern: null as string | null, patternSize: "auto" },
} as const;

/**
 * 글꼴 — 손으로 쓴 듯한 넷. 받는 곳은 `src/app/layout.tsx`(next/font)다.
 *
 * 구글이 내주는 이름을 그대로 적는다. 뒤에 붙은 대체 글꼴은 아직 글꼴이 안
 * 왔거나 못 받았을 때 한글이 깨지지 않게 받쳐 준다.
 *
 * `scale` 은 같은 크기로 적었을 때 기본 글꼴만큼 보이도록 곱하는 값이다.
 * 손글씨체는 글자 하나가 차지하는 자리에 견줘 획이 작게 들어가 있어, 그냥
 * 두면 고르는 순간 글씨가 확 작아 보인다. 「가」·「무」·「0」의 실제 잉크
 * 크기를 기본 글꼴과 재어 비교하고, 종이가 너무 길어지지 않게 조금 낮춰 잡았다.
 */
export const fonts = {
  basic: {
    label: "기본",
    stack: `"Pretendard Variable", Pretendard, -apple-system, "Apple SD Gothic Neo", "Malgun Gothic", sans-serif`,
    scale: 1,
  },
  gamja: {
    label: "감자꽃",
    stack: `"Gamja Flower", "Apple SD Gothic Neo", sans-serif`,
    scale: 1.3,
  },
  dokdo: {
    label: "동해독도",
    stack: `"East Sea Dokdo", "Apple SD Gothic Neo", sans-serif`,
    scale: 1.4,
  },
  pen: {
    label: "펜글씨",
    stack: `"Nanum Pen Script", "Apple SD Gothic Neo", cursive`,
    scale: 1.4,
  },
  yeon: {
    label: "연성",
    stack: `"Yeon Sung", "Apple SD Gothic Neo", sans-serif`,
    scale: 1.1,
  },
} as const;

/** 폰트 탭에 내놓는 차례 — 「기본」이 맨 앞이다. 고르기 전 모습으로 돌아갈 길. */
export const fontPicks = ["basic", "gamja", "dokdo", "pen", "yeon"] as const;

/**
 * 이름표로 글꼴을 찾는다. 모르는 이름이면 기본으로 본다.
 *
 * 저장해 둔 영수증에는 그때 고른 이름표가 그대로 적혀 있는데, 글꼴 목록이
 * 바뀌면 없는 이름이 된다. 그대로 찾으면 undefined 가 나와 화면이 통째로
 * 죽는다 — 글씨체 하나 때문에 기록을 못 보게 할 수는 없다.
 */
export const fontOf = (id: FontId | undefined) => fonts[id ?? "basic"] ?? fonts.basic;

/** 꾸미기 화면 — 829:2501 */
export const decorate = {
  title: "영수증 꾸미기",
  sub: "테마와 스티커로 오늘의 영수증을 꾸며보세요",
  reset: "초기화",
  /** 초기화 전에 한 번 묻는다 — 스티커 · 용지 · 글씨체가 한꺼번에 날아가는 일이라. */
  resetTitle: "꾸민 것을 모두 지울까요?",
  resetBody: "스티커 · 용지 · 글씨체가 처음 상태로 돌아가요.",
  resetConfirm: "지우기",
  cancel: "취소",
  /** 저장이 곧 완료다 — 저장하지 않고 나가면(뒤로) 붙이던 것은 버려진다. */
  save: "기록 저장하기",
  /** 그림을 만드는 동안 단추에 뜨는 말 */
  making: "영수증 만드는 중…",
  tabs: ["기본", "콜라보", "프리미엄", "용지/폰트"] as const,
  /**
   * 뽑기에서 한 장씩 나오는 스티커 — 받은 것이 「콜라보」 맨 위에 NEW 로 들어온다.
   * 디자이너가 모아 둔 서른세 장(Figma 2019:7851 — 토이 스토리 · 스파이더맨 ·
   * 산리오 토끼 · 케로로 · 무한도전 … 스물여덟, 2027:7852 — 리락쿠마 다섯)을 원본
   * PNG 에서 여백을 잘라 WebP 로.
   */
  packStickers: Array.from({ length: 33 }, (_, i) => `/assets/record/stickers/gacha/${String(i + 1).padStart(2, "0")}.webp`),
  packBadge: "NEW",
  /**
   * 묶음마다 다른 스티커 — 시트에서 개체별로 오려낸 PNG.
   *
   * 흰 배경만 지운 그림이라 어떤 용지 위에 붙여도 자연스럽다. 스티커를 더
   * 넣으려면 `public/assets/record/stickers/<묶음>/` 에 PNG를 두고 이 목록에만
   * 줄을 더하면 된다.
   */
  stickers: {
    "기본": [
      "/assets/record/stickers/basic/01.png",
      "/assets/record/stickers/basic/02.png",
      "/assets/record/stickers/basic/03.png",
      "/assets/record/stickers/basic/04.png",
      "/assets/record/stickers/basic/05.png",
      "/assets/record/stickers/basic/06.png",
      "/assets/record/stickers/basic/07.png",
      "/assets/record/stickers/basic/08.png",
      "/assets/record/stickers/basic/09.png",
      "/assets/record/stickers/basic/10.png",
      "/assets/record/stickers/basic/11.png",
      "/assets/record/stickers/basic/12.png",
      "/assets/record/stickers/basic/13.png",
      "/assets/record/stickers/basic/14.png",
      "/assets/record/stickers/basic/15.png",
      "/assets/record/stickers/basic/16.png",
      "/assets/record/stickers/basic/17.png",
      "/assets/record/stickers/basic/18.png",
      "/assets/record/stickers/basic/19.png",
      "/assets/record/stickers/basic/20.png",
      "/assets/record/stickers/basic/21.png",
      "/assets/record/stickers/basic/22.png",
      "/assets/record/stickers/basic/23.png",
      "/assets/record/stickers/basic/24.png",
      "/assets/record/stickers/basic/25.png",
      "/assets/record/stickers/basic/26.png",
      "/assets/record/stickers/basic/27.png",
      "/assets/record/stickers/basic/28.png",
      "/assets/record/stickers/basic/29.png",
      "/assets/record/stickers/basic/30.png",
      "/assets/record/stickers/basic/31.png",
      "/assets/record/stickers/basic/32.png",
      "/assets/record/stickers/basic/33.png",
      "/assets/record/stickers/basic/34.png",
      "/assets/record/stickers/basic/35.png",
      "/assets/record/stickers/basic/36.png",
      "/assets/record/stickers/basic/37.png",
      "/assets/record/stickers/basic/38.png",
      "/assets/record/stickers/basic/39.png",
      "/assets/record/stickers/basic/40.png",
    ],
    "콜라보": [
      "/assets/record/stickers/collab/01.png",
      "/assets/record/stickers/collab/02.png",
      "/assets/record/stickers/collab/03.png",
      "/assets/record/stickers/collab/04.png",
      "/assets/record/stickers/collab/05.png",
      "/assets/record/stickers/collab/06.png",
      "/assets/record/stickers/collab/07.png",
      "/assets/record/stickers/collab/08.png",
      "/assets/record/stickers/collab/09.png",
      "/assets/record/stickers/collab/10.png",
      "/assets/record/stickers/collab/11.png",
      "/assets/record/stickers/collab/12.png",
      "/assets/record/stickers/collab/13.png",
      "/assets/record/stickers/collab/14.png",
      "/assets/record/stickers/collab/15.png",
      "/assets/record/stickers/collab/16.png",
      "/assets/record/stickers/collab/17.png",
      "/assets/record/stickers/collab/18.png",
      "/assets/record/stickers/collab/19.png",
      "/assets/record/stickers/collab/20.png",
      "/assets/record/stickers/collab/21.png",
      "/assets/record/stickers/collab/22.png",
      "/assets/record/stickers/collab/23.png",
      "/assets/record/stickers/collab/24.png",
      "/assets/record/stickers/collab/25.png",
      "/assets/record/stickers/collab/26.png",
      "/assets/record/stickers/collab/27.png",
      "/assets/record/stickers/collab/28.png",
      "/assets/record/stickers/collab/29.png",
      "/assets/record/stickers/collab/30.png",
      "/assets/record/stickers/collab/31.png",
      "/assets/record/stickers/collab/32.png",
      "/assets/record/stickers/collab/33.png",
      "/assets/record/stickers/collab/34.png",
      "/assets/record/stickers/collab/35.png",
      "/assets/record/stickers/collab/36.png",
    ],
    "프리미엄": [
      "/assets/record/stickers/premium/01.png",
      "/assets/record/stickers/premium/02.png",
      "/assets/record/stickers/premium/03.png",
      "/assets/record/stickers/premium/04.png",
      "/assets/record/stickers/premium/05.png",
      "/assets/record/stickers/premium/06.png",
      "/assets/record/stickers/premium/07.png",
      "/assets/record/stickers/premium/08.png",
      "/assets/record/stickers/premium/09.png",
      "/assets/record/stickers/premium/10.png",
      "/assets/record/stickers/premium/11.png",
      "/assets/record/stickers/premium/12.png",
      "/assets/record/stickers/premium/13.png",
      "/assets/record/stickers/premium/14.png",
      "/assets/record/stickers/premium/15.png",
      "/assets/record/stickers/premium/16.png",
      "/assets/record/stickers/premium/17.png",
      "/assets/record/stickers/premium/18.png",
      "/assets/record/stickers/premium/19.png",
      "/assets/record/stickers/premium/20.png",
      "/assets/record/stickers/premium/21.png",
      "/assets/record/stickers/premium/22.png",
    ],
  },
  /**
   * 종이 밖은 잘린다는 알림.
   *
   * 붙일 때는 종이 위에 얹힌 것처럼 보이다가, 저장한 그림에서만 잘려 있으면
   * 망가진 것으로 읽힌다. 미리보기도 같이 잘라 두었으니(Receipt) 여기서는
   * 「왜 잘렸는지」만 한 줄로 말해 준다.
   */
  /** 붙인 것이 있을 때 — 손잡이가 있다는 것을 모르면 옮기지도 떼지도 못한다(감수 지적) */
  clipNote: "스티커를 누르면 옮기고 돌리고 뗄 수 있어요 · 종이 밖으로 나가면 잘려요",
  paperLabel: "용지",
  fontLabel: "폰트",
  photoPick: "사진 고르기",
  empty: "준비 중이에요",
  /** 붙인 스티커를 눌렀을 때 나오는 테두리와 손잡이 */
  sticker: {
    pick: "스티커 옮기기",
    remove: "스티커 떼기",
    flip: "좌우 뒤집기",
    turn: "돌리기",
    resize: "크기 조절",
  },
} as const;

/**
 * 스티커를 붙일 때의 크기 — 여기에 스티커마다의 배율을 곱한다.
 *
 * 영수증 폭에 비례한다(미리보기 220 : 큰 영수증 280). 한쪽만 고치면 꾸밀 때와
 * 저장된 그림에서 스티커 크기가 달라 보이므로 둘을 같이 잡아 둔다. 내보내는
 * 그림(`@/utils/receiptImage`)도 이 값을 쓴다.
 */
export const stickerSize = { small: 28, big: 36 } as const;

/**
 * 스티커가 처음 놓이는 자리 — 붙이는 순서대로 돌아가며 쓴다.
 *
 * 값은 스티커 가운데가 놓일 자리다(%). 붙인 뒤에는 끌어서 옮길 수 있으니 여기
 * 값은 어디까지나 시작 자리고, 자리마다 기울기를 달리해 손으로 붙인 것처럼
 * 보이게 한다.
 */
export const stickerSpots = [
  { left: 14, top: 13, tilt: -12 },
  { left: 82, top: 12, tilt: 9 },
  { left: 84, top: 66, tilt: -7 },
  { left: 13, top: 72, tilt: 14 },
  { left: 48, top: 84, tilt: -5 },
  { left: 20, top: 41, tilt: 8 },
  { left: 86, top: 38, tilt: -14 },
  { left: 50, top: 9, tilt: 6 },
] as const;

export const emptyBy: Record<(typeof tabs)[number], string> = {
  "영수증": "",
  "월간지식": "이번 달 기록이 아직 없어요",
  "주간지식": "이번 주 기록이 아직 없어요",
};

/**
 * 영수증이 뽑혀 나오는 자리 — 「기록 저장하기」를 누르면 화면을 덮는다.
 *
 * 프레임에는 없다. 저장한 것이 어디로 갔는지 보이지 않으면 눌러도 아무 일도 안
 * 난 것 같다는 요청으로, 프린터에서 영수증이 뽑히는 장면을 넣었다.
 */
export const printed = {
  title: "주간지식에 기록했어요",
  sub: "이번 주 기록에 오늘 영수증이 한 장 쌓였어요",
  share: "공유하기",
  save: "핸드폰에 저장하기",
  go: "주간지식 보러가기",
  close: "닫기",
} as const;

/** 월간지식 — 556:3016 */
export const monthly = {
  weekdays: ["일", "월", "화", "수", "목", "금", "토"],
  prev: "지난달",
  next: "다음달",
  notes: [
    "꾸미지 않은 날은 흰 바탕 기본 영수증으로 보여요",
    "날짜를 누르면 그날 영수증이 크게 열려요",
  ],
} as const;

/** 주간지식 — 556:3186 */
export const weekly = {
  prev: "지난주",
  next: "다음주",
  /**
   * 「이번 주 영수증 12장 · 지식 27개 · 완독 세트 1개」 — 세어서 채운다. 지식은
   * 영수증에 적힌 줄 수라 장수와 다르다 — 둘을 따로 적는다(감수 지적). 지난주 ·
   * 다음주를 보고 있을 때는 「이 주」로 — 「이번 주」가 과거 주에도 붙어 있었다
   * (감수 지적).
   */
  summary: (knowledge: number, receipts: number, sets: number, current: boolean) =>
    `${current ? "이번 주" : "이 주"} 영수증 ${receipts}장 · 지식 ${knowledge}개 · 완독 세트 ${sets}개`,
  /**
   * 아래 안내 — 영수증을 누르면 그날 것이 크게 열린다는 것. 전에는 「그 칸만
   * 위아래로 넘겨볼 수 있어요」였는데, 칸마다 따로 넘기는 것이 아니라 차트
   * 전체가 넘어가 없는 기능을 설명하고 있었다(감수 지적).
   */
  note: "영수증을 누르면 그날 영수증이 크게 열려요",
  /** 한 장도 없는 주 — 0 일곱 개만 두지 않는다. */
  empty: "이 주에는 저장한 영수증이 없어요",
  emptyCurrent: "아직 이번 주에 저장한 영수증이 없어요 — 영수증 탭에서 오늘 것을 뽑아 보세요",
} as const;

/**
 * 예시 기록 — 백엔드가 생기면 통째로 지운다.
 *
 * 처음 온 사람에게 빈 달력과 빈 막대를 보여 주지 않으려고 깔아 둔다. 오늘을
 * 기준으로 거슬러 만들므로 언제 열어도 이번 달·이번 주가 차 있다.
 *
 * `back` 은 며칠 전인지, `count` 는 그날 저장한 영수증 수다. 주간 막대가
 * 층층이 쌓인 모습이 나오도록 하루에 여러 장 있는 날을 섞었다.
 */
const SEED = [
  { back: 0, count: 2 },
  { back: 1, count: 5 },
  { back: 2, count: 1 },
  { back: 3, count: 3 },
  { back: 5, count: 4 },
  { back: 6, count: 2 },
  { back: 8, count: 1 },
  { back: 9, count: 3 },
  { back: 11, count: 2 },
  { back: 12, count: 1 },
  { back: 15, count: 4 },
  { back: 16, count: 1 },
  { back: 19, count: 2 },
  { back: 22, count: 3 },
] as const;

/** 예시로 붙일 스티커 — 묶음마다 앞쪽 몇 개씩만 섞어 쓴다. */
const SEED_ARTS = [
  ...decorate.stickers["기본"].slice(0, 14),
  ...decorate.stickers["콜라보"].slice(0, 8),
  ...decorate.stickers["프리미엄"].slice(0, 6),
];

/** 꾸민 영수증이 쓰는 용지 — 기본(흰 종이)은 「안 꾸민 것」 자리라 뺀다. */
const SEED_PAPERS: Paper[] = [{ kind: "kraft" }, { kind: "pattern" }];

/**
 * 예시 스티커 몇 장 — 자리 · 기울기는 실제로 붙일 때와 같은 자리표를 쓰고,
 * 크기와 좌우 뒤집기만 조금씩 달리해 손으로 붙인 티를 낸다.
 */
function seedStickers(seed: number, count: number): Sticker[] {
  return Array.from({ length: count }, (_, index) => {
    const spot = stickerSpots[(seed + index * 3) % stickerSpots.length];
    return {
      id: `seed-${seed}-${index}`,
      art: SEED_ARTS[(seed * 5 + index * 7) % SEED_ARTS.length],
      left: spot.left,
      top: spot.top,
      tilt: spot.tilt,
      scale: 0.8 + ((seed + index) % 4) * 0.2,
      flipped: (seed + index) % 3 === 0,
    };
  });
}

export function seedArchive(now: Date): SavedRecord[] {
  const out: SavedRecord[] = [];
  let seed = 0;
  SEED.forEach((day, dayIndex) => {
    for (let n = 0; n < day.count; n += 1) {
      const at = new Date(now);
      at.setDate(at.getDate() - day.back);
      // 같은 날 여러 장이 겹치지 않게 시각을 벌린다 — 시각이 곧 번호다.
      at.setHours(9 + n * 2, (dayIndex * 7 + n * 3) % 60, 0, 0);
      const iso = at.toISOString();
      /*
        넷에 하나는 안 꾸민 채로 둔다 — 프레임의 「꾸미지 않은 날은 흰 바탕
        기본 영수증으로 보여요」가 보이려면 흰 종이도 섞여 있어야 한다.
      */
      const decorated = (dayIndex + n) % 4 !== 0;
      out.push({
        id: iso,
        issued: iso,
        stickers: decorated ? seedStickers(seed, 1 + (seed % 3)) : [],
        paper: decorated ? SEED_PAPERS[seed % SEED_PAPERS.length] : { kind: "plain" },
        // 장마다 다른 지식이 찍히게 장바구니의 지식을 돌려 가며 두세 줄 — 같은 날
        // 석 장이 죄다 같은 내용이면 예시 티가 난다(감수 지적)
        lines: Array.from({ length: 2 + ((dayIndex + n) % 2) }, (_, k) => {
          const item = cartItems[(seed * 2 + k) % cartItems.length];
          return { title: item.title.join(" "), price: "1코인" };
        }),
      });
      seed += 1;
    }
  });
  return out.sort((a, b) => a.issued.localeCompare(b.issued));
}
