"use client";

/**
 * 채팅방 홈에서 지금 보고 있는 화면.
 *
 * 테이블 화면은 배경이 어두워서 상단 크롬(상태바 · 헤더 · 탭)까지 같이
 * 어두워져야 하는데, 그 컴포넌트들은 로비 바깥에 있다. 경로만으로는 알 수
 * 없는 값이라 여기에 두고 함께 구독한다.
 *
 * 낮·밤도 여기 있다 — 테이블 장면의 가로등을 누르면 낮이 된다. 밤이 기본이고,
 * 낮으로 바꾸면 장면이 밝아지며 크롬도 흰색으로 돌아온다. 화면을 옮겨 다녀도
 * 남고, 새로고침하면 밤으로 돌아온다.
 */

export type ChatView = "table" | "list";

let view: ChatView = "table";
let daylight = false;
/**
 * 가로등을 한 번이라도 눌렀는지. 안 눌렀으면 로비가 등 옆에 「누르면 낮·밤이
 * 바뀌어요」를 띄운다 — 그림 위에 얹힌 투명 단추라 안내가 없으면 눌러 볼 줄
 * 모른다. 한 번 눌러 본 뒤로는 이 판에서 다시 안 띄운다.
 */
let lampTried = false;
const listeners = new Set<() => void>();

export function subscribeChatView(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getChatView(): ChatView {
  return view;
}

/** 서버는 로비를 열기 전이라 기본값인 테이블로 그린다. */
export function getChatViewServerSnapshot(): ChatView {
  return "table";
}

export function setChatView(next: ChatView): void {
  if (view === next) return;
  view = next;
  listeners.forEach((notify) => notify());
}

export function getDaylight(): boolean {
  return daylight;
}

/** 서버는 밤으로 그린다 — 기본값. */
export function getDaylightServerSnapshot(): boolean {
  return false;
}

/** 가로등 — 누를 때마다 낮과 밤을 오간다. 처음 누르면 안내를 거둔다. */
export function toggleDaylight(): void {
  daylight = !daylight;
  lampTried = true;
  listeners.forEach((notify) => notify());
}

export function getLampTried(): boolean {
  return lampTried;
}

/** 서버는 아직 아무도 안 눌렀다고 그린다 — 안내가 보인다. */
export function getLampTriedServerSnapshot(): boolean {
  return false;
}
