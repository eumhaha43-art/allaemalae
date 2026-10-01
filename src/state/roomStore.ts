"use client";

import type { Room } from "@/data/common/chat";
import { getPersonaSnapshot, subscribePersona } from "@/state/personaStore";
import { isVolatile, keyFor as scopedKey } from "@/state/personaScope";

/**
 * Chat rooms opened on this device, newest first.
 *
 * Mirrors `@/state/postStore`: no backend yet, so a created room lives in
 * localStorage and the lobby merges it in front of the built-in ones.
 *
 * 사람마다 따로다(열쇠에 퍼소나 id) — 내가 연 방은 고치고 닫을 수 있어서 남의
 * 것이 「내 방」으로 보이면 안 된다. 오늘 막 가입한 사람 것은 브라우저에
 * 남기지 않는다(personaScope) — 새로고침하면 없어진다.
 */

const STORAGE_KEY = "rmb.chat.my-rooms";

/** 사람마다 다른 열쇠 — personaScope 규칙 */
const keyFor = (id: string | null) => scopedKey(STORAGE_KEY, id);

/** Stable empty array: a new one each render would loop useSyncExternalStore. */
const EMPTY: Room[] = [];

let rooms: Room[] = EMPTY;
let loaded = false;
const listeners = new Set<() => void>();

/** 지금 들고 있는 방이 누구 것인지 — 아직 아무것도 안 읽었으면 undefined */
let owner: string | null | undefined;

function read(id: string | null): Room[] {
  if (isVolatile(id)) return EMPTY;
  try {
    const raw = window.localStorage.getItem(keyFor(id));
    const parsed: unknown = raw ? JSON.parse(raw) : null;
    return Array.isArray(parsed) ? (parsed as Room[]) : EMPTY;
  } catch {
    // Private mode, quota, or corrupt JSON — start clean rather than crash.
    return EMPTY;
  }
}

function write(next: Room[]) {
  rooms = next;
  try {
    if (!isVolatile(owner ?? null)) {
      window.localStorage.setItem(keyFor(owner ?? null), JSON.stringify(next));
    }
  } catch {
    // Keep the in-memory copy even when we cannot persist it.
  }
  listeners.forEach((notify) => notify());
}

/** 퍼소나가 바뀌면 그 사람 방으로 — 바뀌었을 때만(coinStore 와 같다). */
function follow(): void {
  const id = getPersonaSnapshot();
  if (id === owner) return;
  owner = id;
  rooms = read(id);
  listeners.forEach((notify) => notify());
}

if (typeof window !== "undefined") {
  follow();
  subscribePersona(follow);
  loaded = true;
}

/** 이 사람이 연 방을 전부 지운다 — 퍼소나를 고르거나 「처음부터 체험」할 때. */
export function resetRooms(id: string | null): void {
  try {
    window.localStorage.removeItem(keyFor(id));
  } catch {
    // 못 지워도 아래에서 이번 판의 것은 비운다
  }
  if (id === owner) {
    rooms = EMPTY;
    listeners.forEach((notify) => notify());
  }
}

export function subscribeRooms(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getRoomsSnapshot(): Room[] {
  return rooms;
}

/** The server never has these, so it renders the built-in rooms alone. */
export function getRoomsServerSnapshot(): Room[] {
  return EMPTY;
}

/**
 * Whether localStorage has been read yet. Flips on the render right after
 * hydration, which is the earliest a caller may conclude a room is missing.
 */
export function getLoadedSnapshot(): boolean {
  return loaded;
}

export function getLoadedServerSnapshot(): boolean {
  return false;
}

export function addRoom(room: Omit<Room, "id" | "minutesAgo" | "saves">): Room {
  const created: Room = { ...room, id: `my-${Date.now()}`, minutesAgo: 0, saves: 0 };
  write([created, ...rooms]);
  return created;
}

export function updateRoom(id: string, patch: Partial<Omit<Room, "id">>): void {
  if (!rooms.some((room) => room.id === id)) return;
  // An edit counts as activity, so the room comes back to the top of 최근 대화순.
  write(rooms.map((room) => (room.id === id ? { ...room, ...patch, minutesAgo: 0 } : room)));
}

export function removeRoom(id: string): void {
  write(rooms.filter((room) => room.id !== id));
}
