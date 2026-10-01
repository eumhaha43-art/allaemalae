/** 영수증 한 줄 — 그날 읽은 지식 하나 — Figma 829:2595 */
export type ReceiptLine = {
  title: string;
  /** 한 줄에 붙는 값. 디자인은 전부 「1코인」이다. */
  price: string;
};

/**
 * 영수증 용지.
 *
 * 「기본」은 디자인의 흰 종이, 「크래프트」는 꾸민 화면의 누런 종이다. 「패턴」은
 * 크래프트 위에 잔무늬를 얹은 것이고, 그 밖에는 직접 고른 사진이 들어간다.
 */
export type Paper =
  | { kind: "plain" }
  | { kind: "kraft" }
  | { kind: "pattern" }
  | { kind: "photo"; src: string };

/**
 * 영수증 글꼴.
 *
 * 종이를 고르듯 글씨체도 고른다 — 같은 내용이라도 타자기 글씨로 뽑으면 정말
 * 영수증 같고, 명조로 뽑으면 편지 같다. 값은 `@/data/common/record` 의
 * `fonts` 에 있다.
 */
export type FontId = "basic" | "gamja" | "dokdo" | "pen" | "yeon";

/**
 * 주간지식에 쌓아 둔 영수증 한 장.
 *
 * 꾸미기를 마치고 「기록 저장하기」를 누른 순간의 영수증을 통째로 베껴 둔다 —
 * 오늘 영수증은 계속 바뀌므로 참조로 두면 지난 기록까지 같이 바뀐다.
 */
export type SavedRecord = {
  /** 발행 시각으로 가른다 — 같은 영수증을 두 번 저장하면 덮어쓴다. */
  id: string;
  issued: string;
  stickers: Sticker[];
  paper: Paper;
  /** 글꼴이 생기기 전에 쌓아 둔 기록에는 없다 — 그때는 기본으로 본다. */
  font?: FontId;
  lines: ReceiptLine[];
};

/** 영수증에 붙인 스티커 하나 — Figma 855:3309 */
export type Sticker = {
  /** 붙일 때 매기는 번호. 같은 그림을 여러 장 붙일 수 있다. */
  id: string;
  /** 스티커 그림 */
  art: string;
  /** 영수증 안에서 스티커 가운데가 놓이는 자리 — % */
  left: number;
  top: number;
  /** 살짝 기울여 붙여야 손으로 붙인 것처럼 보인다 */
  tilt: number;
  /** 1 이 붙일 때의 크기. 손잡이를 끌어 키우고 줄인다. */
  scale: number;
  /** 좌우로 뒤집었는지 */
  flipped: boolean;
};
