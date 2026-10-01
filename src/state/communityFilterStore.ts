"use client";

/**
 * 커뮤니티 게시글 홈에서 고른 갈래와 보고 있는 쪽.
 *
 * 분류 칩(CategoryChips)과 최신 글 목록(RecentPosts)은 서로 다른 컴포넌트라
 * 둘이 같이 보는 값을 밖에 둔다. 다른 저장소들과 같은 모양
 * (`useSyncExternalStore`)이고, 화면을 옮겨 다녀도 남는다 — 글을 읽고 돌아왔을
 * 때 고른 갈래와 쪽이 풀려 있으면 다시 찾아가야 한다. 새로고침하면 「전체」
 * 1쪽으로.
 *
 * 갈래나 정렬을 바꾸면 쪽은 1로 돌아간다 — 「과학 3쪽」에서 「역사」를 누르면
 * 역사의 3쪽이 아니라 처음부터 봐야 한다.
 */

import { defaultCategory, type PostSort } from "@/data/common/community";

export type Filter = { category: string; sort: PostSort; page: number };

const INITIAL: Filter = { category: defaultCategory, sort: "recent", page: 0 };

let filter: Filter = INITIAL;
const listeners = new Set<() => void>();

function set(next: Filter) {
  filter = next;
  listeners.forEach((notify) => notify());
}

export function subscribeFilter(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getFilter(): Filter {
  return filter;
}

/** 서버는 늘 처음 상태(전체 · 1쪽)로 그린다. */
export function getFilterServerSnapshot(): Filter {
  return INITIAL;
}

export function setCategory(category: string): void {
  if (filter.category === category) return;
  set({ ...filter, category, page: 0 });
}

export function setSort(sort: PostSort): void {
  if (filter.sort === sort) return;
  set({ ...filter, sort, page: 0 });
}

export function setPage(page: number): void {
  if (filter.page === page) return;
  set({ ...filter, page });
}

/** 방금 올린 글을 보여 줄 때 — 「전체」 1쪽으로. */
export function resetFilter(): void {
  if (filter === INITIAL) return;
  set(INITIAL);
}
