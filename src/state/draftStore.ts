"use client";

/**
 * The one post the writer backed out of but chose to keep.
 *
 * Only ever holds a single draft — 글쓰기 is a single-post screen, so a second
 * 임시저장 replaces the first. Photos are left out on purpose: they are
 * `URL.createObjectURL` blobs that die with the page, so storing them would
 * restore broken thumbnails.
 *
 * Shaped like `@/state/postStore` so components can read it through
 * `useSyncExternalStore` without tripping over hydration.
 */

const STORAGE_KEY = "rmb.community.draft";

export type Draft = {
  category: string;
  title: string;
  body: string;
  source: string;
};

let draft: Draft | null = null;
const listeners = new Set<() => void>();

function read(): Draft | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : null;
    if (!parsed || typeof parsed !== "object") return null;
    const stored = parsed as Partial<Draft>;
    return {
      category: stored.category ?? "",
      title: stored.title ?? "",
      body: stored.body ?? "",
      source: stored.source ?? "",
    };
  } catch {
    // Private mode, quota, or corrupt JSON — behave as if there is no draft.
    return null;
  }
}

if (typeof window !== "undefined") draft = read();

export function subscribeDraft(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getDraftSnapshot(): Draft | null {
  return draft;
}

/** The server has no localStorage, so it always renders as if there is none. */
export function getDraftServerSnapshot(): Draft | null {
  return null;
}

export function saveDraft(next: Draft): void {
  draft = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Keep the in-memory copy even when we cannot persist it.
  }
  listeners.forEach((notify) => notify());
}

export function clearDraft(): void {
  draft = null;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Already unreachable — treat it as gone.
  }
  listeners.forEach((notify) => notify());
}
