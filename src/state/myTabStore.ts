"use client";

/**
 * MY 화면을 열 때 고를 탭.
 *
 * 홈의 관심 태그 줄 끝에 있는 「+」는 관심사를 고치러 가는 단추다. 그런데
 * 관심 카테고리는 MY 화면 **안쪽 탭**이라 주소만으로는 가리킬 수가 없다 —
 * `/my` 로 보내면 늘 「MY 출석」부터 열려서, 누른 사람이 탭을 한 번 더 찾아
 * 눌러야 한다.
 *
 * 그래서 넘어가기 직전에 여기 적어 두고, MY 화면이 열리며 집어 간다.
 * 기록 화면이 쓰는 `recordTabStore` 와 같은 방식이다.
 *
 * 주소에 붙이지 않은 이유도 같다 — 링크로 주고받을 값이 아니고, 새로고침하면
 * 첫 탭부터 보는 편이 맞다.
 */

import { myTabs } from "@/data/common/my";

export type MyTab = (typeof myTabs)[number];

let wanted: MyTab | null = null;
const listeners = new Set<() => void>();

export function subscribeMyTab(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getMyTabSnapshot(): MyTab | null {
  return wanted;
}

/** 서버는 늘 첫 탭으로 그린다. */
export function getMyTabServerSnapshot(): MyTab | null {
  return null;
}

export function openMyTab(tab: MyTab): void {
  wanted = tab;
  listeners.forEach((listener) => listener());
}

/** 사용자가 직접 탭을 누르면 적어 둔 것을 버린다 — 안 그러면 다시 끌려간다. */
export function clearMyTab(): void {
  if (wanted === null) return;
  wanted = null;
  listeners.forEach((listener) => listener());
}
