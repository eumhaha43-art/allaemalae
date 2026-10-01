"use client";

/**
 * 화면 한가운데 잠깐 떴다 사라지는 알림 — 「등록되었습니다」 같은 한 줄.
 *
 * 어느 화면에서든 띄울 수 있어야 하므로(글쓰기에서 띄우고 목록으로 넘어가도
 * 남아 있어야 한다) 화면 밖 저장소에 둔다. 그리는 쪽은 ShowcaseLayout 의
 * `Toast` 하나뿐이다. 다른 저장소들과 같은 모양(`useSyncExternalStore`)이다.
 *
 * 새 알림이 오면 앞 것을 덮는다 — 둘을 쌓아 두면 나중 것이 늦게 보여, 방금
 * 한 일과 안 맞는 말이 뜬다.
 */

/**
 * 떠 있는 시간. 한 줄을 읽고 남을 만큼 — 더 길면 다음 동작을 가린다.
 * 화면이 바뀌는 순간에 뜨는 말(상세에 들어가며 「코인 1개를 썼어요」)은 눈이
 * 새 화면을 훑는 사이 지나가 버려서, 부르는 쪽이 더 길게 달라고 할 수 있다.
 */
export const TOAST_MS = 1800;

/** 알림 한 줄. 되돌리기 같은 단추 하나를 달 수 있다 — 누르면 알림도 내린다. */
type Toast = { id: number; text: string; action?: { label: string; run: () => void } } | null;

let current: Toast = null;
let timer: number | null = null;
let serial = 0;
const listeners = new Set<() => void>();

function set(next: Toast) {
  current = next;
  listeners.forEach((notify) => notify());
}

export function subscribeToast(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getToast(): Toast {
  return current;
}

/** 서버에는 알릴 일이 없다. */
export function getToastServerSnapshot(): Toast {
  return null;
}

export function showToast(text: string, ms = TOAST_MS, action?: { label: string; run: () => void }): void {
  if (timer !== null) window.clearTimeout(timer);
  serial += 1;
  set({ id: serial, text, action });
  timer = window.setTimeout(() => {
    timer = null;
    set(null);
  }, ms);
}

/** 단추를 눌렀다 — 하는 일을 하고 알림을 바로 내린다. */
export function runToastAction(): void {
  const action = current?.action;
  if (timer !== null) window.clearTimeout(timer);
  timer = null;
  set(null);
  action?.run();
}
