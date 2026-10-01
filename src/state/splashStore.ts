"use client";

/**
 * 여는 화면이 방금 지나갔는지.
 *
 * 여는 화면은 온보딩 앞과 로그인 앞에만 뜬다. 앱을 여는 판마다 띄우던 것은
 * 뺐다(사용자 결정) — 그때는 처음 온 사람이 홈 → 온보딩으로 넘어가는 사이 로고를
 * 두 번 보게 되어, 방금 봤으면 온보딩이 제 것을 건너뛰게 했다. 그 규칙은 남겨
 * 둔다 — 여는 화면 둘이 5초 안에 겹칠 일이 다시 생기면 그때도 한 번만 보인다.
 */

let lastShown = 0;

/** 이 안에 또 열면 「방금」으로 친다. */
const RECENT_MS = 5_000;

export function markSplash(): void {
  lastShown = Date.now();
}

export function recentlySplashed(): boolean {
  return Date.now() - lastShown < RECENT_MS;
}

/**
 * 「방금 봤다」를 잊는다 — 퍼소나를 고르거나 「처음부터 체험」할 때. 앱을 연 지
 * 5초 안에 김민정을 고르면 온보딩이 여는 화면을 방금 본 것으로 치고 건너뛰어,
 * 처음 온 사람의 첫 화면이 없이 시작됐다(사용자 지적).
 */
export function forgetSplash(): void {
  lastShown = 0;
}

/**
 * 「다음 화면에서 여는 화면부터 보여 달라」 — 쓰던 사람으로 퍼소나를 고를 때.
 * 앱을 다시 연 것처럼 여는 화면 → 로그인 → 홈으로 가야 하는데, 퍼소나 고르기는
 * 새로고침이 아니라 저절로는 안 뜬다. 부탁해 두면 로그인 화면이 한 번 꺼내 쓴다.
 */
let requested = false;

export function requestSplash(): void {
  requested = true;
}

export function takeSplashRequest(): boolean {
  const was = requested;
  requested = false;
  return was;
}

/**
 * 여는 화면이 지금 떠 있는지 — 목업 상태바가 본다.
 *
 * 온보딩과 로그인의 여는 화면은 스크롤 상자 안에 그려져 상태바까지 덮지
 * 못한다. 그대로 두면 초록 화면 위에 흰 띠가 남아 두 장으로 보인다(사용자
 * 지적) — 떠 있는 동안 상태바도 같은 초록으로 칠한다. 걷히기 시작하는 순간
 * 내려서 화면과 함께 흰색으로 돌아온다.
 */
let visible = false;
const listeners = new Set<() => void>();

export function subscribeSplash(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getSplashVisible(): boolean {
  return visible;
}

/** 서버에서는 안 떠 있다 — 브라우저에서 붙은 뒤에 켠다. */
export function getSplashVisibleServerSnapshot(): boolean {
  return false;
}

export function setSplashVisible(on: boolean): void {
  if (visible === on) return;
  visible = on;
  listeners.forEach((notify) => notify());
}
