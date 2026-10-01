"use client";

/**
 * 냉장고를 열 때 고를 탭.
 *
 * 기록 화면의 「더 담으러 가기」는 냉장고의 **다 먹음** 탭으로 간다 — 거기서
 * 다 먹은 지식을 여럿 골라 영수증에 얹는 자리다(사용자 결정). 탭은 화면 안쪽
 * 상태라 다른 화면에서 건드릴 수 없어서, 넘어가기 직전에 여기 적어 두고 냉장고가
 * 열리며 집어 간다 — 기록 탭(recordTabStore)과 같은 틀.
 *
 * 주소에 붙이지 않은 이유도 같다: 링크로 공유할 값이 아니고, 새로고침하면
 * 전체부터 보는 편이 맞다.
 */

import { tabs } from "@/data/common/cart";

export type CartTab = (typeof tabs)[number];

let wanted: CartTab | null = null;

export function openCartTab(tab: CartTab): void {
  wanted = tab;
}

/** 냉장고가 열리며 한 번 집어 간다 — 다음에 그냥 들어오면 없다. */
export function takeCartTab(): CartTab | null {
  const tab = wanted;
  wanted = null;
  return tab;
}
