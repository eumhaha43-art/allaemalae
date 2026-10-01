import { SHOWCASE_BREAKPOINT } from "@/config/showcase";

/**
 * 지금 모바일 화면인지 — PC 목업 없이 앱만 실제 크기로 뜨는 폭.
 *
 * 셸(ShowcaseLayout)은 Tailwind `lg:`(1024px)에서 목업을 켜고 끄는데, 그 경계를
 * 스크립트에서도 알아야 할 때가 있다 — 퍼소나를 바꿀 때 모바일에서만 여는
 * 화면을 건너뛰는 것(usePersonaStart)이 그렇다. 기준값은 셸과 같은
 * `SHOWCASE_BREAKPOINT` 하나다 — 두 곳이 어긋나면 어떤 폭에서는 목업 없이
 * PC 규칙을, 어떤 폭에서는 목업 안에서 모바일 규칙을 따르게 된다.
 *
 * 그리는 동안(useSyncExternalStore) 쓰는 것이 아니라 누르는 순간 한 번 읽는
 * 값이라 함수로만 둔다. 서버나 `matchMedia` 가 없는 곳에서는 PC 로 친다 —
 * 그쪽은 지금까지의 규칙 그대로가 안전하다.
 */
export function isMobileShell(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return false;
  return window.matchMedia(`(max-width: ${SHOWCASE_BREAKPOINT - 1}px)`).matches;
}
