"use client";

import { useSyncExternalStore } from "react";
import { gacha } from "@/data/common/gacha";
import { findPersona } from "@/data/common/personas";
import { getPersonaSnapshot, subscribePersona } from "@/state/personaStore";

/**
 * 가챠 무료 쿠폰 — 코인(`coinStore`)과 같은 짜임의 지갑.
 *
 * 전에는 뽑기 화면이 제 안에서 세었다(`useState`). 화면을 나갔다 들어오면
 * 쿠폰이 도로 한 장 생겨서, 입구가 알림 티켓 하나뿐일 때는 티가 안 났지만
 * 홈 · MY 에 입구를 두고 드나들면 「들어갈 때마다 쿠폰이 또 있네」가 보인다.
 * 블랙카드의 쿠폰은 **달마다 한 장**이라(사용자 결정) 쓰면 없어져야 한다.
 *
 * 시작값은 고른 퍼소나의 것이다(`personas.ts` 의 `coupons`) — 블랙카드 한상현은
 * 이달 것 한 장, 체크카드 김민정은 없다(한 판 1코인). 아무도 안 골랐으면
 * 프레임(블랙카드 전용)에 적혀 있던 수.
 *
 * 이 판(page load)에만 산다 — 코인과 같은 이유다(시연을 처음부터 다시).
 */

function startFor(id: string | null): number {
  return findPersona(id)?.coupons ?? gacha.coupons;
}

let coupons = startFor(null);
/** 지금 들고 있는 지갑이 누구 것인지. */
let wallet: string | null = null;

const listeners = new Set<() => void>();

function notify(): void {
  listeners.forEach((listener) => listener());
}

/** 퍼소나가 바뀌면 그 사람 쿠폰으로 갈아 끼운다 — 바뀌었을 때만(coinStore 와 같다). */
function follow(): void {
  const id = getPersonaSnapshot();
  if (id === wallet) return;
  wallet = id;
  coupons = startFor(id);
  notify();
}

if (typeof window !== "undefined") {
  follow();
  subscribePersona(follow);
}

export function subscribeCoupons(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getCouponsSnapshot(): number {
  return coupons;
}

/** 서버는 아무도 안 고른 상태로 그린다. */
export function getCouponsServerSnapshot(): number {
  return startFor(null);
}

/** 쿠폰 한 장을 쓴다. 없으면 아무것도 하지 않고 `false`. */
export function spendCoupon(): boolean {
  if (coupons < 1) return false;
  coupons -= 1;
  notify();
  return true;
}

/** 읽기 전용 — 화면은 이것만 쓴다. */
export function useCoupons(): number {
  return useSyncExternalStore(subscribeCoupons, getCouponsSnapshot, getCouponsServerSnapshot);
}
