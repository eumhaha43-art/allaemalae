"use client";

/**
 * 목업 키보드가 올라와 있는지.
 *
 * 진짜 폰이 그렇듯 키보드는 화면 바닥을 통째로 덮는다 — 하단 탭 바 · 알래봇 ·
 * 홈 인디케이터가 이걸 보고 비켜난다. 그래야 스크롤 영역이 기기 바닥까지
 * 내려와서, 입력바를 키보드 높이만큼만 올리면 정확히 그 위에 선다.
 */

let open = false;
const listeners = new Set<() => void>();

export function setKeyboardOpen(next: boolean): void {
  if (open === next) return;
  open = next;
  listeners.forEach((notify) => notify());
}

export function subscribeKeyboard(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getKeyboardOpen(): boolean {
  return open;
}

/** 서버에는 키보드가 없다. */
export function getKeyboardServerSnapshot(): boolean {
  return false;
}
