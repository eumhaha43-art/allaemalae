"use client";

/**
 * 화면을 통째로 덮는 것이 떠 있는지.
 *
 * 덮개는 반투명이라, 그 아래 탭 바가 어둑하게 비쳐 보인다 — 뽑혀 나온 영수증을
 * 보는 자리에 홈·장바구니 글씨가 같이 읽히면 종이에서 눈이 떠난다. 떠 있는
 * 동안에는 탭 바를 아예 내린다.
 *
 * 겹쳐 뜰 수 있으니 켜짐/꺼짐이 아니라 개수로 센다. 하나가 닫히면서 다른 하나가
 * 열려 있는데 탭 바가 먼저 돌아오면, 남은 덮개 밑에서 다시 비친다.
 */

let depth = 0;
const listeners = new Set<() => void>();

function tell(): void {
  listeners.forEach((notify) => notify());
}

export function subscribeOverlay(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getOverlayOpen(): boolean {
  return depth > 0;
}

/** 서버에는 떠 있는 것이 없다. */
export function getOverlayServerSnapshot(): boolean {
  return false;
}

export function openOverlay(): void {
  depth += 1;
  tell();
}

export function closeOverlay(): void {
  // 0 밑으로 내려가면 다음에 열었을 때 탭 바가 안 내려간다
  depth = Math.max(0, depth - 1);
  tell();
}
