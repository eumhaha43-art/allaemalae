"use client";

/**
 * 기록 화면을 열 때 고를 탭.
 *
 * 「기록 저장하기」로 뽑은 뒤 「주간지식 보러가기」를 누르면, 기록 화면으로
 * 넘어가면서 주간지식 탭이 이미 골라져 있어야 한다. 탭은 화면 안쪽 상태라
 * 다른 화면에서 건드릴 수 없어서, 넘어가기 직전에 여기 적어 두고 기록 화면이
 * 열리며 집어 간다.
 *
 * 주소에 붙이지 않은 이유: 이 탭은 링크로 공유할 값이 아니고, 새로고침하면
 * 영수증부터 보는 편이 맞다. 그래서 세션에만 남는 값으로 둔다.
 */

import { tabs } from "@/data/common/record";

export type RecordTab = (typeof tabs)[number];

let wanted: RecordTab | null = null;
const listeners = new Set<() => void>();

export function subscribeRecordTab(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getRecordTabSnapshot(): RecordTab | null {
  return wanted;
}

/** 서버는 늘 첫 탭으로 그린다. */
export function getRecordTabServerSnapshot(): RecordTab | null {
  return null;
}

export function openRecordTab(tab: RecordTab): void {
  wanted = tab;
  listeners.forEach((notify) => notify());
}

/** 사용자가 직접 탭을 누르면 적어 둔 것을 버린다 — 안 그러면 다시 끌려간다. */
export function clearRecordTab(): void {
  if (wanted === null) return;
  wanted = null;
  listeners.forEach((notify) => notify());
}
