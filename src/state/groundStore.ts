"use client";

import type { Ground, Side } from "@/data/common/debate";
import { getPersonaSnapshot, subscribePersona } from "@/state/personaStore";
import { isVolatile, keyFor as scopedKey } from "@/state/personaScope";

/**
 * 이 기기에서 단 근거, 토론방마다.
 *
 * 여기 다른 저장소들과 같은 틀이다 — 서버가 없어서 localStorage 에 두고,
 * 근거 팝업이 씨앗 근거 뒤에 이어 붙인다.
 *
 * 사람마다 따로다(열쇠에 퍼소나 id) — 여기 근거는 전부 「내 것」으로 고치고
 * 지울 수 있다(isMine). 퍼소나를 고르면 그 사람 것은 비운다(resetGrounds).
 *
 * 순위(`rank`)는 저장하지 않는다. 공감 수로 매겨지는 값이라 목록을 그릴 때
 * 자리에 맞춰 새로 매기는 것이 맞다 — 저장해 두면 씨앗 근거와 번호가 겹친다.
 */

const STORAGE_KEY = "rmb.debate.grounds";

/** 사람마다 다른 열쇠 — personaScope 규칙. 오늘 막 가입한 사람 것은 남기지 않는다. */
const keyFor = (id: string | null) => scopedKey(STORAGE_KEY, id);

/** Stable empty values: new ones each render would loop useSyncExternalStore. */
const EMPTY: Record<string, Ground[]> = {};
const NONE: Ground[] = [];

let grounds: Record<string, Ground[]> = EMPTY;
const listeners = new Set<() => void>();

/** 지금 들고 있는 근거가 누구 것인지 — 아직 아무것도 안 읽었으면 undefined */
let owner: string | null | undefined;

function read(id: string | null): Record<string, Ground[]> {
  // 오늘 막 가입한 사람은 브라우저에 남긴 것이 없다 — 새로고침이 곧 초기화
  if (isVolatile(id)) return EMPTY;
  try {
    const raw = window.localStorage.getItem(keyFor(id));
    const parsed: unknown = raw ? JSON.parse(raw) : null;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return EMPTY;
    return parsed as Record<string, Ground[]>;
  } catch {
    // Private mode, quota, or corrupt JSON — start clean rather than crash.
    return EMPTY;
  }
}

function write(next: Record<string, Ground[]>) {
  grounds = next;
  try {
    if (!isVolatile(owner ?? null)) {
      window.localStorage.setItem(keyFor(owner ?? null), JSON.stringify(next));
    }
  } catch {
    // Keep the in-memory copy even when we cannot persist it.
  }
  listeners.forEach((notify) => notify());
}

/** 퍼소나가 바뀌면 그 사람 근거로 — 바뀌었을 때만(coinStore 와 같다). */
function follow(): void {
  const id = getPersonaSnapshot();
  if (id === owner) return;
  owner = id;
  grounds = read(id);
  listeners.forEach((notify) => notify());
}

if (typeof window !== "undefined") {
  follow();
  subscribePersona(follow);
}

/** 이 사람이 단 근거를 전부 지운다 — 퍼소나를 고르거나 「처음부터 체험」할 때. */
export function resetGrounds(id: string | null): void {
  try {
    window.localStorage.removeItem(keyFor(id));
  } catch {
    // 못 지워도 아래에서 이번 판의 것은 비운다
  }
  // 지운 열쇠에 빈 값을 다시 적지 않는다 — 이번 판의 것만 비우고 알린다
  if (id === owner) {
    grounds = EMPTY;
    listeners.forEach((notify) => notify());
  }
}

/**
 * 방금 단 근거 — 방으로 돌아갔을 때 한 번 꺼내 쓴다(takeFreshGround).
 *
 * 등록하고 돌아왔는데 아무 일도 안 일어난 것처럼 보이면 등록이 된 건지
 * 모른다. 방이 이 값을 보고 근거 팝업을 열어 방금 단 것을 맨 위에 보여 준다.
 * 한 번 꺼내면 비운다 — 다음에 들어올 때마다 열리면 성가시다.
 */
let fresh: { debateId: string; id: string } | null = null;

export function takeFreshGround(debateId: string): string | null {
  if (!fresh || fresh.debateId !== debateId) return null;
  const { id } = fresh;
  fresh = null;
  return id;
}

export function subscribeGrounds(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getGroundsSnapshot(): Record<string, Ground[]> {
  return grounds;
}

/** The server has no localStorage, so it renders the seeded grounds alone. */
export function getGroundsServerSnapshot(): Record<string, Ground[]> {
  return EMPTY;
}

/** Reads one debate's grounds out of a snapshot, without making a new array. */
export function groundsFor(
  snapshot: Record<string, Ground[]>,
  debateId: string,
): Ground[] {
  return snapshot[debateId] ?? NONE;
}

/** 이 기기에서 단 것인지 — 고치고 지울 수 있는 것은 이것뿐이다. */
export const isMine = (ground: Ground) => ground.id.startsWith("me-");

export function addGround(
  debateId: string,
  written: { text: string; side: Side; sourced: boolean },
): Ground {
  const ground: Ground = {
    id: `me-${Date.now()}`,
    // 목록에서 자리에 맞춰 다시 매긴다. 여기 값은 자리표시일 뿐이다.
    rank: 0,
    likes: 0,
    // 방금 단 것은 공감 수 대신 NEW 가 뜬다 — 0 은 외면당한 것처럼 보인다.
    fresh: true,
    ...written,
  };
  write({ ...grounds, [debateId]: [...groundsFor(grounds, debateId), ground] });
  fresh = { debateId, id: ground.id };
  return ground;
}

export function updateGround(
  debateId: string,
  id: string,
  patch: Partial<Pick<Ground, "text" | "side" | "sourced">>,
): void {
  const mine = groundsFor(grounds, debateId);
  if (!mine.some((ground) => ground.id === id)) return;
  write({
    ...grounds,
    [debateId]: mine.map((ground) => (ground.id === id ? { ...ground, ...patch } : ground)),
  });
}

export function removeGround(debateId: string, id: string): void {
  const mine = groundsFor(grounds, debateId);
  const left = mine.filter((ground) => ground.id !== id);
  if (left.length === mine.length) return;
  write({ ...grounds, [debateId]: left });
}

/**
 * 내 근거를 맨 위에(최근 것부터), 그 아래 씨앗 근거를 놓고 순위를 자리에
 * 맞춰 다시 매긴다.
 *
 * 공감순이라면 방금 단 0 공감이 맨 아래여야 맞지만, 그러면 등록한 것이
 * 목록 끝에 숨어 등록이 된 줄 모른다. 내 것은 NEW 로 위에 띄운다 — 내가 방금
 * 한 일이 먼저 보이는 것이 맞다.
 */
export function buildGrounds(seeded: Ground[], written: Ground[]): Ground[] {
  return [...[...written].reverse(), ...seeded].map((ground, index) => ({
    ...ground,
    rank: index + 1,
  }));
}
