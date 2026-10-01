"use client";

/**
 * 분야 목록 위 칩 — 마지막에 고른 것.
 *
 * 칩을 화면 상태로 두었을 때는 목록에서 지식을 열고 돌아오면 주소의 분야
 * (/menu/category/society 의 「사회」)로 되돌아갔다 — 과학을 보다가 지식 하나
 * 열고 나오면 다시 사회였다(사용자 지적). 화면 밖에 두어 돌아와도 마지막에 고른
 * 칩 그대로다. 메뉴의 분야 카드는 누르는 순간 그 분야를 박고 들어온다(FieldList)
 * — 어느 분야를 눌러도 「전체」로 열리면 카드가 다 같은 문이다(사용자 지적).
 *
 * 이 판(page load)에만 산다 — 다른 저장소들과 같은 이유(시연을 처음부터).
 */
let chip = "all";
const listeners = new Set<() => void>();

export function subscribeCategoryChip(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getCategoryChip(): string {
  return chip;
}

/** 서버는 처음 온 사람으로 그린다 — 전체. */
export function getCategoryChipServerSnapshot(): string {
  return "all";
}

export function setCategoryChip(next: string): void {
  if (chip === next) return;
  chip = next;
  listeners.forEach((notify) => notify());
}
