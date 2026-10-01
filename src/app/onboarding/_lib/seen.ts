"use client";

/**
 * 이번에 온보딩을 보여 줄지.
 *
 * 온보딩은 앱에 들어오기 전에 지나가는 화면이라, 홈에 닿는 사람을 한 번만
 * 여기로 보낸다(`FirstRun`). 다 보거나 Skip 한 뒤에는 홈과 앱 안을 오가는
 * 동안 다시 붙잡지 않는다 — 갈 때마다 붙잡으면 소개가 아니라 관문이 된다.
 *
 * 이 탭 안에서 기억한다(`sessionStorage`). 전에는 이 판(page load)에만
 * 두었는데, 다른 화면을 보다가 새로고침이 한 번 끼면(배포가 바뀌어도 그렇다)
 * 홈 단추를 누르는 순간 온보딩이 다시 튀어나왔다 — 앱을 쓰던 사람이 갑자기
 * 소개 화면으로 끌려가는 것은 오류로 보인다. 다시 보려면 「이 계정 처음부터
 * 체험」을 누른다(resetOnboarding). `localStorage` 에는 두지 않는다 — 새 탭을
 * 열면 처음 온 사람으로 돌아가야 시연을 다시 할 수 있다.
 *
 * 온보딩에 들어서는 순간 본 것으로 친다(끝까지 보지 않아도). 보다가 홈으로
 * 나간 사람을 다시 붙잡으면 같은 오류다.
 *
 * 퍼소나를 고른 뒤에는 그 사람이 정한다. 아직 가입하지 않은 사람(`fresh`)은
 * 여는 화면부터 지나가고, 이미 쓰던 사람은 붙잡지 않는다 — 쓰던 사람에게
 * 소개 화면을 다시 보이면 그 사람 이야기가 아니게 된다.
 */

import { findPersona } from "@/data/common/personas";
import { getPersonaSnapshot } from "@/state/personaStore";
import { forgetSplash } from "@/state/splashStore";

const KEY = "rmb-onboarded";

function shown(): boolean {
  try {
    return window.sessionStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}

export function needsOnboarding(): boolean {
  if (shown()) return false;

  const persona = findPersona(getPersonaSnapshot());
  if (persona) return persona.fresh;

  // 아무도 안 골랐으면 예전대로 — 이 판에서 한 번은 보여 준다
  return true;
}

/** 온보딩에 들어섰다(또는 다 봤다 · Skip 했다). 이 탭에서는 다시 붙잡지 않는다. */
export function markOnboarded(): void {
  try {
    window.sessionStorage.setItem(KEY, "1");
  } catch {
    // 못 적어도 이번 화면은 지나간다
  }
}

/**
 * 퍼소나를 고르거나 「처음부터 체험」 — 시작 지점부터 다시 볼 수 있게 되돌린다.
 *
 * 판(run)도 하나 올린다 — 온보딩 화면이 이 수를 key 로 삼아 통째로 다시
 * 그려진다. 이미 온보딩에 서 있는 채로 김민정을 고르면 같은 경로라 화면이
 * 그대로 남아, 여는 화면도 첫 장도 다시 안 나왔다. 앱을 연 여는 화면을 「방금
 * 봤다」는 것도 잊는다 — 그것 때문에 온보딩이 제 여는 화면을 건너뛰었다.
 */
export function resetOnboarding(): void {
  try {
    window.sessionStorage.removeItem(KEY);
  } catch {
    // 지울 것이 없으면 그만
  }
  forgetSplash();
  run += 1;
  runListeners.forEach((notify) => notify());
}

/** 몇 번째 온보딩인지 — 퍼소나를 고를 때마다 오른다. 온보딩 화면의 key. */
let run = 0;
const runListeners = new Set<() => void>();

export function subscribeOnboardingRun(listener: () => void): () => void {
  runListeners.add(listener);
  return () => runListeners.delete(listener);
}

export function getOnboardingRun(): number {
  return run;
}

export function getOnboardingRunServerSnapshot(): number {
  return 0;
}
