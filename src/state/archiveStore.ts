"use client";

/**
 * 저장해 둔 영수증 보관함 — 월간지식(556:3016) · 주간지식(556:3186)이 읽는다.
 *
 * 꾸미기를 마치고 「기록 저장하기」를 누른 순간의 영수증을 통째로 베껴 쌓는다.
 * 오늘 영수증(`receiptStore`)은 계속 바뀌므로 참조로 두면 지난 기록까지 같이
 * 바뀐다.
 *
 * 서버가 없어 localStorage 에 둔다 — `receiptStore` 와 같은 방식이다.
 *
 * 사람마다 따로다(열쇠에 퍼소나 id). 예시 기록은 쓰던 사람(한상현)에게만 깔고,
 * 오늘 막 가입한 사람(fresh)은 빈 보관함에서 시작한다 — 새 계정인데 지난달
 * 영수증이 쌓여 있으면 새 계정이 아니다(감수 지적). 퍼소나가 바뀌면 그 사람
 * 것으로 갈아 끼운다.
 *
 * 오늘 막 가입한 사람이 저장한 기록은 브라우저에 남기지 않는다(personaScope) —
 * 새로고침하면 없어진다. 새 계정 시연은 새로고침이 곧 초기화다(기획).
 */

import { seedArchive } from "@/data/common/record";
import { getPersonaSnapshot, subscribePersona } from "@/state/personaStore";
import { isVolatile, keyFor as scopedKey } from "@/state/personaScope";
import type { SavedRecord } from "@/types/record";

const STORAGE_KEY = "rmb.record.archive";

/** 사람마다 다른 열쇠 — personaScope 규칙 */
const keyFor = (id: string | null) => scopedKey(STORAGE_KEY, id);

export type Archive = {
  records: SavedRecord[];
  /**
   * 지금 — ISO 문자열. 서버에서는 비어 있다.
   *
   * 달력과 주간 막대는 「이번 달 · 이번 주」에서 시작해야 하는데, 그리는 중에
   * `new Date()` 를 부르면 서버가 그린 것과 어긋난다. 시각을 만드는 일을 여기서
   * 한 번만 하고 화면은 받아 쓴다.
   */
  now: string;
};

/** 값이 매번 새로 만들어지면 useSyncExternalStore 가 계속 다시 그린다. */
const EMPTY: Archive = { records: [], now: "" };

let archive: Archive = EMPTY;
const listeners = new Set<() => void>();

/** 지금 보관함이 누구 것인지 */
let owner: string | null = null;

function read(id: string | null): Archive {
  const now = new Date();
  // 오늘 막 가입한 사람은 빈 보관함 — 브라우저에 남긴 것도 없고 예시도 안 깐다
  if (isVolatile(id)) return { records: [], now: now.toISOString() };
  const seed = () => seedArchive(now);
  try {
    const raw = window.localStorage.getItem(keyFor(id));
    const parsed: unknown = raw ? JSON.parse(raw) : null;
    if (Array.isArray(parsed)) {
      return { records: parsed as SavedRecord[], now: now.toISOString() };
    }
    return { records: seed(), now: now.toISOString() };
  } catch {
    // 시크릿 모드 · 깨진 JSON — 멈추는 대신 예시만 보여 준다.
    return { records: seed(), now: now.toISOString() };
  }
}

function write(records: SavedRecord[]) {
  archive = { records, now: archive.now || new Date().toISOString() };
  try {
    if (!isVolatile(owner)) window.localStorage.setItem(keyFor(owner), JSON.stringify(records));
  } catch {
    // 저장은 못 해도 이번 세션에서는 보이게 둔다.
  }
  listeners.forEach((notify) => notify());
}

/** 퍼소나가 바뀌면 그 사람 보관함으로 — 바뀌었을 때만(coinStore 와 같다). */
function follow(): void {
  const id = getPersonaSnapshot();
  if (id === owner && archive !== EMPTY) return;
  owner = id;
  archive = read(id);
  listeners.forEach((notify) => notify());
}

if (typeof window !== "undefined") {
  follow();
  subscribePersona(follow);
}

export function subscribeArchive(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getArchiveSnapshot(): Archive {
  return archive;
}

/** 서버에는 localStorage 가 없다 — 빈 보관함으로 그리고 브라우저에서 갈아 끼운다. */
export function getArchiveServerSnapshot(): Archive {
  return EMPTY;
}

/**
 * 기록 저장 — 발행 시각이 곧 번호다.
 *
 * 같은 영수증을 더 꾸며서 다시 저장하면 새로 쌓지 않고 덮어쓴다. 그러지 않으면
 * 스티커 하나 더 붙일 때마다 같은 날 영수증이 늘어난다.
 */
export function saveRecord(one: SavedRecord): void {
  const rest = archive.records.filter((kept) => kept.id !== one.id);
  write([...rest, one].sort((a, b) => a.issued.localeCompare(b.issued)));
}

/** 그 날짜(로컬 기준)에 저장된 기록 — 오래된 것부터. */
export function recordsOn(records: SavedRecord[], day: Date): SavedRecord[] {
  const key = dayKey(day);
  return records.filter((one) => dayKey(new Date(one.issued)) === key);
}

/**
 * 꾸민 영수증인지 — 스티커를 붙였거나 용지를 바꿨거나.
 *
 * 달력과 주간 막대의 손톱만 한 영수증은 이 값으로 흰 종이와 누런 종이를 가른다.
 * 용지만 보면, 기본 용지에 스티커만 붙인 영수증이 안 꾸민 것으로 보인다.
 */
export function isDecorated(one: SavedRecord): boolean {
  return one.paper.kind !== "plain" || one.stickers.length > 0;
}

/** 로컬 시간대 기준 「YYYY-MM-DD」. ISO 문자열을 그냥 자르면 UTC 라 날짜가 밀린다. */
export function dayKey(at: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${at.getFullYear()}-${pad(at.getMonth() + 1)}-${pad(at.getDate())}`;
}
