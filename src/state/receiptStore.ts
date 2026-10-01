"use client";

/**
 * 오늘 영수증에 붙인 스티커.
 *
 * `@/state/reactionStore` 와 같은 모양이다 — 서버가 없어 localStorage 에 두고
 * 화면들은 `useSyncExternalStore` 로 읽는다. 꾸미기 화면과 기록 홈이 서로 다른
 * 라우트라, 이렇게 두지 않으면 꾸미고 돌아왔을 때 그대로 보여줄 수 없다.
 *
 * 사람마다 따로다(열쇠에 퍼소나 id) — 한상현이 꾸민 영수증이 김민정에게 보이면
 * 안 된다. 오늘 막 가입한 사람 것은 브라우저에 남기지 않는다(personaScope) —
 * 새로고침하면 꾸미기 전으로 돌아간다.
 */

import { fonts, stickerSpots } from "@/data/common/record";
import { getPersonaSnapshot, subscribePersona } from "@/state/personaStore";
import { isVolatile, keyFor as scopedKey } from "@/state/personaScope";
import type { FontId, Paper, ReceiptLine, Sticker } from "@/types/record";

const STORAGE_KEY = "rmb.record.receipt";

/** 사람마다 다른 열쇠 — personaScope 규칙 */
const keyFor = (id: string | null) => scopedKey(STORAGE_KEY, id);

export type Receipt = {
  stickers: Sticker[];
  paper: Paper;
  /** 고른 글씨체 — 종이와 같이 영수증의 생김새를 정한다. */
  font: FontId;
  /** 장바구니에서 뽑아 온 줄. 비어 있으면 디자인의 기본 영수증을 보여준다. */
  lines: ReceiptLine[];
  /**
   * 발행 시각 — ISO 문자열.
   *
   * 서버에는 빈 값이고 브라우저에서 채워진다. 그리는 중에 `new Date()` 를
   * 부르면 서버가 그린 것과 달라져 hydration 이 어긋나므로, 시각을 만드는 일은
   * 전부 이 모듈이 맡는다.
   */
  issued: string;
};

/** 값이 매번 새로 만들어지면 useSyncExternalStore 가 계속 다시 그린다. */
const EMPTY: Receipt = {
  stickers: [],
  paper: { kind: "plain" },
  font: "basic",
  lines: [],
  issued: "",
};

let receipt: Receipt = EMPTY;
const listeners = new Set<() => void>();

/** 지금 들고 있는 영수증이 누구 것인지 — 아직 아무것도 안 읽었으면 undefined */
let owner: string | null | undefined;

function read(id: string | null): Receipt {
  // 오늘 막 가입한 사람은 브라우저에 남긴 것이 없다 — 지금이 발행 시각
  if (isVolatile(id)) return { ...EMPTY, issued: new Date().toISOString() };
  try {
    const raw = window.localStorage.getItem(keyFor(id));
    const parsed: unknown = raw ? JSON.parse(raw) : null;
    // 처음 온 사람은 저장된 것이 없다 — 그래도 발행 시각은 지금으로 찍어 준다.
    if (!parsed || typeof parsed !== "object") {
      return { ...EMPTY, issued: new Date().toISOString() };
    }
    const stored = parsed as Partial<Receipt>;
    return {
      // 크기·뒤집기는 나중에 생긴 값이라, 그전에 붙여 둔 것에는 기본값을 채워 준다.
      stickers: Array.isArray(stored.stickers)
        ? (stored.stickers as Partial<Sticker>[]).map(
            (one) => ({ scale: 1, flipped: false, ...one }) as Sticker,
          )
        : [],
      paper: stored.paper ?? { kind: "plain" },
      // 글꼴은 나중에 생긴 값이라, 그전에 저장해 둔 영수증에는 없다. 목록에서
      // 빠진 이름이 적혀 있을 수도 있어(고를 수 있는 글꼴이 바뀌었다) 확인한다.
      font: stored.font && stored.font in fonts ? stored.font : "basic",
      lines: Array.isArray(stored.lines) ? stored.lines : [],
      // 아직 한 장도 안 뽑았으면 지금이 그 영수증의 발행 시각이다.
      issued: stored.issued || new Date().toISOString(),
    };
  } catch {
    // 시크릿 모드 · 용량 초과 · 깨진 JSON — 멈추는 대신 빈 채로 시작한다.
    return { ...EMPTY, issued: new Date().toISOString() };
  }
}

function write(next: Receipt) {
  receipt = next;
  try {
    if (!isVolatile(owner ?? null)) {
      window.localStorage.setItem(keyFor(owner ?? null), JSON.stringify(next));
    }
  } catch {
    // 저장은 못 해도 이번 세션에서는 보이게 둔다.
  }
  listeners.forEach((notify) => notify());
}

/** 퍼소나가 바뀌면 그 사람 영수증으로 — 바뀌었을 때만(coinStore 와 같다). */
function follow(): void {
  const id = getPersonaSnapshot();
  if (id === owner) return;
  owner = id;
  receipt = read(id);
  listeners.forEach((notify) => notify());
}

if (typeof window !== "undefined") {
  follow();
  subscribePersona(follow);
}

export function subscribeReceipt(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getReceiptSnapshot(): Receipt {
  return receipt;
}

/** 서버에는 localStorage 가 없어 꾸미기 전 영수증을 그린다. */
export function getReceiptServerSnapshot(): Receipt {
  return EMPTY;
}

/**
 * 번호는 여기서 매긴다.
 *
 * 화면에서 시각이나 난수로 만들면 「그리는 중에 순수하지 않은 함수를 부른다」로
 * 걸린다. 지금 붙어 있는 것 중 가장 큰 번호 다음을 쓰므로, 새로고침해서
 * 저장된 것을 불러온 뒤에 붙여도 번호가 겹치지 않는다.
 */
function nextId(): string {
  const max = receipt.stickers.reduce((biggest, one) => {
    const n = Number(one.id.replace(/^s/, ""));
    return Number.isFinite(n) ? Math.max(biggest, n) : biggest;
  }, 0);
  return `s${max + 1}`;
}

/**
 * 자리도 여기서 고른다 — 화면이 들고 있는 값으로 고르면, 연달아 빠르게 누를 때
 * 다시 그리기 전이라 같은 자리에 겹쳐 붙는다.
 */
export function addSticker(art: string): void {
  const spot = stickerSpots[receipt.stickers.length % stickerSpots.length];
  const one: Sticker = { art, ...spot, scale: 1, flipped: false, id: nextId() };
  write({ ...receipt, stickers: [...receipt.stickers, one] });
}

/**
 * 옮기기 · 크기 조절 · 좌우 뒤집기 — 바뀐 값만 준다.
 *
 * 끄는 동안에는 화면이 제 값을 들고 있다가 손을 뗄 때 한 번만 부른다. 움직일
 * 때마다 부르면 그 횟수만큼 localStorage 에 쓰게 된다.
 */
export function updateSticker(id: string, patch: Partial<Omit<Sticker, "id">>): void {
  write({
    ...receipt,
    stickers: receipt.stickers.map((one) => (one.id === id ? { ...one, ...patch } : one)),
  });
}

export function removeSticker(id: string): void {
  write({ ...receipt, stickers: receipt.stickers.filter((one) => one.id !== id) });
}

export function setPaper(paper: Paper): void {
  write({ ...receipt, paper });
}

export function setFont(font: FontId): void {
  write({ ...receipt, font });
}

/**
 * 장바구니에서 고른 지식으로 영수증을 새로 뽑는다.
 *
 * 새 영수증이므로 지난번에 붙인 스티커와 고른 용지는 따라오지 않는다.
 */
export function printReceipt(lines: ReceiptLine[]): void {
  write({
    stickers: [],
    paper: { kind: "plain" },
    font: "basic",
    lines,
    issued: new Date().toISOString(),
  });
}

/**
 * 오늘 영수증에 지식 한 줄을 얹는다 — 카드뉴스 끝의 「기록하러 가기」.
 *
 * 다 읽은 지식을 들고 기록으로 가는 길이라, 빈 영수증이면 그 한 줄로 새로
 * 뽑고 이미 줄이 있으면 뒤에 붙인다(같은 지식은 두 번 안 붙는다). 스티커와
 * 용지는 그대로다 — 꾸미다가 한 편 더 읽고 온 사람의 꾸밈이 날아가면 안 된다.
 * 이미 기록에 넣은 영수증(`recorded`)이면 새 영수증으로 시작한다 — 보관함에
 * 들어간 장에 줄을 더 적으면 보관함의 장과 여기 장이 어긋난다.
 */
export function addReceiptLine(line: ReceiptLine, recorded: boolean): void {
  if (recorded || receipt.lines.length === 0) {
    printReceipt([line]);
    return;
  }
  if (receipt.lines.some((one) => one.title === line.title)) return;
  write({ ...receipt, lines: [...receipt.lines, line] });
}

/** 초기화 — 꾸민 것만 되돌린다. 영수증에 적힌 지식은 그대로 둔다. */
export function clearStickers(): void {
  write({ ...receipt, stickers: [], paper: { kind: "plain" }, font: "basic" });
}

/**
 * 통째로 되돌리기 — 꾸미기 화면이 저장하지 않고 나갈 때 들어올 때 모습으로.
 *
 * 붙이는 것은 그 자리에서 곧바로 적히므로(꾸미다 돌아와도 보여야 해서), 「저장
 * 안 하고 나가기」는 들어올 때 베껴 둔 것을 도로 적는 것으로 한다.
 */
export function restoreReceipt(snapshot: Receipt): void {
  write(snapshot);
}
