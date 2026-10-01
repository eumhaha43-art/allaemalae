"use client";

import { getPersonaSnapshot, subscribePersona } from "@/state/personaStore";
import { isVolatile, keyFor as scopedKey } from "@/state/personaScope";

/**
 * Which posts this device has liked or put in its 장바구니, and which comments
 * it has liked.
 *
 * 사람마다 따로다(열쇠에 퍼소나 id) — 좋아요는 누른 사람의 것이다. 퍼소나를
 * 고르면 그 사람 것은 비운다(resetReactions).
 *
 * Shaped like `@/state/postStore`: no backend yet, so every screen reads the
 * two sets through `useSyncExternalStore`, which is what keeps 게시글 상세 and
 * 게시글 홈 showing the same thing.
 *
 * Only the likes are written to localStorage. `saved` (장바구니) lives in memory
 * and is empty again after a reload: 담기 is the thing we demo — the icon
 * turning green, the picture flying into the tab bar — and it has to be
 * demoable every time. When it persisted, whoever showed the app last left
 * every card already green, and the next person had nothing left to 담다.
 * Reloading is how the demo resets. (The same reasoning as 온보딩's `seen`.)
 */

const STORAGE_KEY = "rmb.community.reactions";

/** 사람마다 다른 열쇠 — personaScope 규칙. 오늘 막 가입한 사람 것은 남기지 않는다. */
const keyFor = (id: string | null) => scopedKey(STORAGE_KEY, id);

export type Reactions = { liked: string[]; saved: string[]; likedComments: string[] };

/** Stable empty value: a new one each render would loop useSyncExternalStore. */
const EMPTY: Reactions = { liked: [], saved: [], likedComments: [] };

let reactions: Reactions = EMPTY;
const listeners = new Set<() => void>();

/** 지금 들고 있는 반응이 누구 것인지 — 아직 아무것도 안 읽었으면 undefined */
let owner: string | null | undefined;

function read(id: string | null): Reactions {
  // 오늘 막 가입한 사람은 브라우저에 남긴 것이 없다 — 새로고침이 곧 초기화
  if (isVolatile(id)) return EMPTY;
  try {
    const raw = window.localStorage.getItem(keyFor(id));
    const parsed: unknown = raw ? JSON.parse(raw) : null;
    if (!parsed || typeof parsed !== "object") return EMPTY;
    const stored = parsed as Partial<Reactions>;
    // `saved` is deliberately not read back — see the header.
    return {
      liked: Array.isArray(stored.liked) ? stored.liked : [],
      saved: [],
      likedComments: Array.isArray(stored.likedComments) ? stored.likedComments : [],
    };
  } catch {
    // Private mode, quota, or corrupt JSON — start clean rather than crash.
    return EMPTY;
  }
}

function write(next: Reactions) {
  reactions = next;
  try {
    if (!isVolatile(owner ?? null)) {
      window.localStorage.setItem(
        keyFor(owner ?? null),
        JSON.stringify({ liked: next.liked, likedComments: next.likedComments }),
      );
    }
  } catch {
    // Keep the in-memory copy even when we cannot persist it.
  }
  listeners.forEach((notify) => notify());
}

/** 퍼소나가 바뀌면 그 사람 반응으로 — 바뀌었을 때만(coinStore 와 같다). */
function follow(): void {
  const id = getPersonaSnapshot();
  if (id === owner) return;
  owner = id;
  reactions = read(id);
  listeners.forEach((notify) => notify());
}

if (typeof window !== "undefined") {
  follow();
  subscribePersona(follow);
}

/** 이 사람의 좋아요 · 담기를 전부 지운다 — 퍼소나를 고르거나 「처음부터 체험」할 때. */
export function resetReactions(id: string | null): void {
  try {
    window.localStorage.removeItem(keyFor(id));
  } catch {
    // 못 지워도 아래에서 이번 판의 것은 비운다
  }
  // 지운 열쇠에 빈 값을 다시 적지 않는다 — 이번 판의 것만 비우고 알린다
  if (id === owner) {
    reactions = EMPTY;
    listeners.forEach((notify) => notify());
  }
}

export function subscribeReactions(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getReactionsSnapshot(): Reactions {
  return reactions;
}

/** The server has no localStorage, so it renders every post unreacted. */
export function getReactionsServerSnapshot(): Reactions {
  return EMPTY;
}

const flip = (list: string[], id: string) =>
  list.includes(id) ? list.filter((entry) => entry !== id) : [...list, id];

export function toggleLike(id: string): void {
  write({ ...reactions, liked: flip(reactions.liked, id) });
}

/** 댓글 공감 — 글의 좋아요와 같은 규칙으로 켜고 끈다. */
export function toggleCommentLike(id: string): void {
  write({ ...reactions, likedComments: flip(reactions.likedComments, id) });
}

export function toggleSave(id: string): void {
  write({ ...reactions, saved: flip(reactions.saved, id) });
}
