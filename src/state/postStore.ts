"use client";

import type { Comment, Post } from "@/data/common/community";
import { getPersonaSnapshot, subscribePersona } from "@/state/personaStore";
import { isVolatile, keyFor as scopedKey } from "@/state/personaScope";

/**
 * Posts written on this device, newest first.
 *
 * There is no backend yet, so a submitted post lives in localStorage and is
 * merged in front of the mock feed. Swap this whole module for API calls when
 * the server exists — the components only use `useWrittenPosts` and `addPost`.
 *
 * 사람마다 따로다(열쇠에 퍼소나 id) — 보관함(archiveStore)과 같은 규칙. 여기
 * 글은 전부 「나」가 쓴 것으로 그려지고 고치고 지울 수 있어서, 한상현이 쓴
 * 글이 김민정에게도 「나의 글」로 보이면 안 된다. 퍼소나를 고르거나 「처음부터
 * 체험」을 누르면 그 사람 것은 비운다(resetWrittenPosts) — 신규 가입인데 지난
 * 시연의 글이 대표 지식에 걸려 있으면 신규가 아니다(기획 지적).
 */

const STORAGE_KEY = "rmb.community.written-posts";

/** 사람마다 다른 열쇠 — personaScope 규칙. 오늘 막 가입한 사람 것은 남기지 않는다. */
const keyFor = (id: string | null) => scopedKey(STORAGE_KEY, id);

/** Stable empty array: a new one each render would loop useSyncExternalStore. */
const EMPTY: Post[] = [];

let posts: Post[] = EMPTY;
const listeners = new Set<() => void>();

/** 지금 들고 있는 글이 누구 것인지 — 아직 아무것도 안 읽었으면 undefined */
let owner: string | null | undefined;

function read(id: string | null): Post[] {
  // 오늘 막 가입한 사람은 브라우저에 남긴 것이 없다 — 새로고침이 곧 초기화
  if (isVolatile(id)) return EMPTY;
  try {
    const raw = window.localStorage.getItem(keyFor(id));
    const parsed: unknown = raw ? JSON.parse(raw) : null;
    return Array.isArray(parsed) ? (parsed as Post[]) : EMPTY;
  } catch {
    // Private mode, quota, or corrupt JSON — start clean rather than crash.
    return EMPTY;
  }
}

function write(next: Post[]) {
  posts = next;
  try {
    if (!isVolatile(owner ?? null)) {
      window.localStorage.setItem(keyFor(owner ?? null), JSON.stringify(next));
    }
  } catch {
    // Keep the in-memory copy even when we cannot persist it.
  }
  listeners.forEach((notify) => notify());
}

/** 퍼소나가 바뀌면 그 사람 글로 — 바뀌었을 때만(coinStore 와 같다). */
function follow(): void {
  const id = getPersonaSnapshot();
  if (id === owner) return;
  owner = id;
  posts = read(id);
  listeners.forEach((notify) => notify());
}

if (typeof window !== "undefined") {
  follow();
  subscribePersona(follow);
}

/** 이 사람이 쓴 글을 전부 지운다 — 퍼소나를 고르거나 「처음부터 체험」할 때. */
export function resetWrittenPosts(id: string | null): void {
  try {
    window.localStorage.removeItem(keyFor(id));
  } catch {
    // 못 지워도 아래에서 이번 판의 것은 비운다
  }
  // 지운 열쇠에 빈 값을 다시 적지 않는다 — 이번 판의 것만 비우고 알린다
  if (id === owner) {
    posts = EMPTY;
    listeners.forEach((notify) => notify());
  }
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getSnapshot(): Post[] {
  return posts;
}

/** The server never has these, so it renders the mock feed alone. */
export function getServerSnapshot(): Post[] {
  return EMPTY;
}

export function addPost(post: Omit<Post, "id" | "when">): Post {
  const created: Post = { ...post, id: `me-${Date.now()}`, when: "방금 전" };
  write([created, ...posts]);
  reveal = created.id;
  return created;
}

/**
 * 방금 올린 글 — 목록으로 돌아갔을 때 그 글이 화면에 보이도록 굴려 올린다.
 *
 * 목록은 맨 위에 투표와 뜨는 지식이 있어, 그냥 돌아가면 방금 쓴 글이 화면
 * 아래 어딘가에 있어 올라간 것인지 알 수 없다. 한 번 읽으면 지운다 — 다음에
 * 목록을 열 때까지 남아 있으면 그때도 굴러가 버린다.
 */
let reveal: string | null = null;

export function takeReveal(): string | null {
  const id = reveal;
  reveal = null;
  return id;
}

/** Editing keeps the post where it is in the feed, and marks it as edited. */
export function updatePost(id: string, patch: Partial<Omit<Post, "id">>): void {
  if (!posts.some((post) => post.id === id)) return;
  write(posts.map((post) => (post.id === id ? { ...post, ...patch, when: "방금 수정" } : post)));
}

/**
 * 남이 내 글에 반응했다 — 좋아요 · 북마크 숫자가 오르고, 댓글이면 글의 실(thread)에
 * 붙는다. 글을 고친 것이 아니므로 「방금 수정」이 되지 않는다.
 *
 * 댓글을 commentStore 에 넣지 않는 이유: 그 저장소는 이 기기에서 쓴 댓글이라
 * 전부 고치고 지울 수 있고 「나의 활동 · 댓글 남긴 글」에도 오른다. 남의
 * 댓글은 씨앗 글의 실과 같은 자리(post.thread)에 둔다.
 */
export function reactToPost(
  id: string,
  reaction: { likes?: number; saves?: number; comment?: Comment },
): void {
  write(
    posts.map((post) =>
      post.id === id
        ? {
            ...post,
            likes: post.likes + (reaction.likes ?? 0),
            saves: post.saves + (reaction.saves ?? 0),
            comments: post.comments + (reaction.comment ? 1 : 0),
            thread: reaction.comment ? [...(post.thread ?? []), reaction.comment] : post.thread,
          }
        : post,
    ),
  );
}

export function removePost(id: string): void {
  write(posts.filter((post) => post.id !== id));
}
