"use client";

import type { Comment } from "@/data/common/community";
import { MY_AVATAR } from "@/data/common/personas";
import { getPersonaSnapshot, subscribePersona } from "@/state/personaStore";
import { isVolatile, keyFor as scopedKey } from "@/state/personaScope";

/**
 * Comments written on this device, per post, oldest first.
 *
 * Same shape as the other stores here: no backend yet, so they live in
 * localStorage and the detail screen appends them after the seeded thread.
 *
 * 사람마다 따로다(열쇠에 퍼소나 id) — 여기 댓글은 전부 「나」가 쓴 것으로
 * 그려지고 고치고 지울 수 있다(postStore 와 같은 이유). 퍼소나를 고르면 그
 * 사람 것은 비운다(resetComments).
 */

const STORAGE_KEY = "rmb.community.comments";

/** 사람마다 다른 열쇠 — personaScope 규칙. 오늘 막 가입한 사람 것은 남기지 않는다. */
const keyFor = (id: string | null) => scopedKey(STORAGE_KEY, id);

/** Stable empty values: new ones each render would loop useSyncExternalStore. */
const EMPTY: Record<string, Comment[]> = {};
const NONE: Comment[] = [];

let comments: Record<string, Comment[]> = EMPTY;
const listeners = new Set<() => void>();

/** 지금 들고 있는 댓글이 누구 것인지 — 아직 아무것도 안 읽었으면 undefined */
let owner: string | null | undefined;

function read(id: string | null): Record<string, Comment[]> {
  // 오늘 막 가입한 사람은 브라우저에 남긴 것이 없다 — 새로고침이 곧 초기화
  if (isVolatile(id)) return EMPTY;
  try {
    const raw = window.localStorage.getItem(keyFor(id));
    const parsed: unknown = raw ? JSON.parse(raw) : null;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return EMPTY;
    return parsed as Record<string, Comment[]>;
  } catch {
    // Private mode, quota, or corrupt JSON — start clean rather than crash.
    return EMPTY;
  }
}

function write(next: Record<string, Comment[]>) {
  comments = next;
  try {
    if (!isVolatile(owner ?? null)) {
      window.localStorage.setItem(keyFor(owner ?? null), JSON.stringify(next));
    }
  } catch {
    // Keep the in-memory copy even when we cannot persist it.
  }
  listeners.forEach((notify) => notify());
}

/** 퍼소나가 바뀌면 그 사람 댓글로 — 바뀌었을 때만(coinStore 와 같다). */
function follow(): void {
  const id = getPersonaSnapshot();
  if (id === owner) return;
  owner = id;
  comments = read(id);
  listeners.forEach((notify) => notify());
}

if (typeof window !== "undefined") {
  follow();
  subscribePersona(follow);
}

/** 이 사람이 쓴 댓글을 전부 지운다 — 퍼소나를 고르거나 「처음부터 체험」할 때. */
export function resetComments(id: string | null): void {
  try {
    window.localStorage.removeItem(keyFor(id));
  } catch {
    // 못 지워도 아래에서 이번 판의 것은 비운다
  }
  // 지운 열쇠에 빈 값을 다시 적지 않는다 — 이번 판의 것만 비우고 알린다
  if (id === owner) {
    comments = EMPTY;
    listeners.forEach((notify) => notify());
  }
}

export function subscribeComments(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getCommentsSnapshot(): Record<string, Comment[]> {
  return comments;
}

/** The server has no localStorage, so it renders the seeded thread alone. */
export function getCommentsServerSnapshot(): Record<string, Comment[]> {
  return EMPTY;
}

/** Reads one post's comments out of a snapshot, without making a new array. */
export function commentsFor(
  snapshot: Record<string, Comment[]>,
  postId: string,
): Comment[] {
  return snapshot[postId] ?? NONE;
}

export function addComment(postId: string, text: string, parentId?: string): Comment {
  const written: Comment = {
    id: `me-${Date.now()}`,
    author: "나",
    avatar: MY_AVATAR,
    when: "방금",
    at: Date.now(),
    text,
    likes: 0,
    ...(parentId ? { reply: true, parentId } : null),
  };
  write({ ...comments, [postId]: [...commentsFor(comments, postId), written] });
  return written;
}

/**
 * 고쳐 쓴다 — 쓴 시각은 그대로 두고 「수정됨」만 붙인다.
 *
 * 시각까지 지금으로 밀면 댓글이 순서는 그대로인 채 남들 것보다 새것으로
 * 보인다. 게시글(`updatePost`)이 「방금 수정」으로 갈아 끼우는 것과 다른데,
 * 게시글은 목록에서 시각으로 줄을 세우지만 댓글은 등록순으로 고정이라
 * 그렇다.
 */
export function updateComment(postId: string, id: string, text: string): void {
  const mine = commentsFor(comments, postId);
  if (!mine.some((comment) => comment.id === id)) return;
  write({
    ...comments,
    [postId]: mine.map((comment) =>
      comment.id === id ? { ...comment, text, edited: true } : comment,
    ),
  });
}

/**
 * 지운다 — 달려 있던 답글도 함께 간다.
 *
 * 답글만 남으면 누구에게 하는 말인지 알 수 없는 줄이 된다. 씨앗 댓글에 달린
 * 내 답글은 씨앗이 그대로 있으므로 그 답글 하나만 지워진다.
 */
export function removeComment(postId: string, id: string): void {
  const mine = commentsFor(comments, postId);
  const left = mine.filter((comment) => comment.id !== id && comment.parentId !== id);
  if (left.length === mine.length) return;
  write({ ...comments, [postId]: left });
}
