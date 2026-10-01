"use client";

import { useSyncExternalStore } from "react";
import { user } from "@/data/common/home";
import { findPersona } from "@/data/common/personas";
import { getPersonaSnapshot, subscribePersona } from "@/state/personaStore";

/**
 * 보유 코인 — 앱 전체가 같은 수를 본다.
 *
 * 전에는 코인을 세는 곳이 셋이었다. 홈의 랜덤 지식깡, 뽑기 화면, 회원증 뒷면이
 * 저마다 제 수를 들고 있어서 한쪽에서 뽑아도 다른 쪽은 그대로였다. 헤더에 보유
 * 코인을 띄우기로 한 이상 그 수는 한 곳에서 나와야 한다 — 머리에 적힌 수와
 * 회원증에 적힌 수가 다르면 둘 중 어느 것도 못 믿는다.
 *
 * 시작값은 **고른 퍼소나**의 것이다(`personas.ts` 의 `coins`). 블랙카드로 다
 * 열려 있는 한상현은 80, 오늘 막 가입한 김민정은 5 — 「코인이 모자라 못 여는」
 * 경험은 신규 쪽에만 있어야 한다.
 *
 * 이 판(page load)에만 산다. 새로고침하면 시작값으로 돌아간다 — 시연을 처음부터
 * 다시 할 수 있어야 한다. 나중에 서버가 붙으면 이 파일만 갈아 끼우면 되고,
 * 읽는 쪽(`useCoins`)과 쓰는 쪽(`spendCoins` · `earnCoins`)은 그대로 둔다.
 */

/** 그 사람이 들고 시작하는 코인. 아무도 안 골랐으면 프레임에 적혀 있던 수. */
function startFor(id: string | null): number {
  return findPersona(id)?.coins ?? user.coins;
}

let coins = startFor(null);
/** 지금 들고 있는 지갑이 누구 것인지. */
let wallet: string | null = null;

/**
 * 코인이 오간 내역 — 새것이 앞. MY 의 「코인 내역」이 보인다(감수 요청 — 온보딩이
 * 「코인을 누르면 자세히 볼 수 있어요」라고 했는데 잔액도 내역도 없었다).
 * 지갑처럼 이 판에만 산다.
 */
export type CoinEntry = { at: number; reason: string; delta: number };
let history: CoinEntry[] = [];

function record(delta: number, reason: string): void {
  history = [{ at: Date.now(), reason, delta }, ...history].slice(0, 30);
}

const listeners = new Set<() => void>();

function notify(): void {
  listeners.forEach((listener) => listener());
}

/**
 * 퍼소나가 바뀌면 그 사람 지갑으로 갈아 끼운다.
 *
 * **바뀌었을 때만** 갈아 끼우는 것이 중요하다. 알림 하나에도 다시 세우면,
 * 퀴즈로 번 코인이 도로 시작값으로 돌아간다.
 */
function follow(): void {
  const id = getPersonaSnapshot();
  if (id === wallet) return;
  wallet = id;
  coins = startFor(id);
  history = [];
  notify();
}

if (typeof window !== "undefined") {
  follow();
  subscribePersona(follow);
}

export function subscribeCoins(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getCoinsSnapshot(): number {
  return coins;
}

/** 서버는 아무도 안 고른 상태로 그린다 — 누가 볼지는 그릴 때 알 수 없다. */
export function getCoinsServerSnapshot(): number {
  return startFor(null);
}

/**
 * 코인을 치른다. 모자라면 아무것도 하지 않고 `false` 를 돌려준다 —
 * 부르는 쪽이 「부족해요」를 띄울지 정한다.
 */
export function spendCoins(count = 1, reason = "코인 사용"): boolean {
  if (coins < count) return false;
  coins -= count;
  record(-count, reason);
  notify();
  return true;
}

/** 출석·퀴즈·이벤트로 받는 코인. */
export function earnCoins(count = 1, reason = "코인 획득"): void {
  if (count <= 0) return;
  coins += count;
  record(count, reason);
  notify();
}

export function getCoinHistorySnapshot(): CoinEntry[] {
  return history;
}

const NO_HISTORY: CoinEntry[] = [];
export function getCoinHistoryServerSnapshot(): CoinEntry[] {
  return NO_HISTORY;
}

/** 오간 내역 — 새것이 앞. */
export function useCoinHistory(): CoinEntry[] {
  return useSyncExternalStore(subscribeCoins, getCoinHistorySnapshot, getCoinHistoryServerSnapshot);
}

/** 아직 떨어질 코인과, 떨어뜨리는 시계. */
let pending = 0;
let dropping: number | null = null;

/**
 * 코인이 한 개씩 주루룩 들어온다 — 퀴즈를 다 풀었을 때처럼 여러 개를 한꺼번에
 * 받는 자리에서 쓴다.
 *
 * 3 을 한 번에 더하면 헤더의 수가 80 에서 83 으로 툭 바뀌고 만다. 눈이 따라갈
 * 것이 없어서 「받았다」가 아니라 「원래 그랬나?」가 된다. 한 개씩 떨어뜨리면
 * 세 번 오르는 것이 보이고, 헤더의 알약도 그때마다 한 번씩 튄다.
 *
 * 첫 개는 기다리지 않고 바로 넣는다 — 누른 직후 아무 일도 안 일어나면 안 먹힌
 * 것으로 보인다. 겹쳐 불러도 앞의 것에 이어 붙는다.
 */
export function earnCoinsSlowly(count: number, reason = "코인 획득", stepMs = 320): void {
  if (count <= 0) return;
  pending += count;
  // 내역에는 한 줄로 — 세 개가 한 개씩 떨어지는 것은 눈을 위한 것이다
  record(count, reason);
  if (dropping !== null) return;

  const drop = () => {
    coins += 1;
    notify();
    pending -= 1;
    if (pending > 0) return;
    if (dropping !== null) window.clearInterval(dropping);
    dropping = null;
  };

  drop();
  if (pending > 0) dropping = window.setInterval(drop, stepMs);
}

/** 읽기 전용 — 화면은 이것만 쓴다. */
export function useCoins(): number {
  return useSyncExternalStore(subscribeCoins, getCoinsSnapshot, getCoinsServerSnapshot);
}
