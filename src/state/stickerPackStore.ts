"use client";

import { decorate } from "@/data/common/record";

/**
 * 뽑기에서 받은 캐릭터 스티커 — 한 장씩.
 *
 * 전에는 첫 뽑기에 스티커팩(스물한 장)이 통째로 나왔는데 너무 다 나와 버렸다
 * (사용자 지적) — 이제 한 판에 한 장이다. 받은 스티커는 영수증 꾸미기의 「콜라보」
 * 서랍 맨 위에 NEW 표를 달고 들어온다. 이 판(page load)에만 산다 — 지갑
 * (coinStore)이 그렇듯 새로고침하면 처음부터다(사용자 지시: 새로고침했는데 남아
 * 있으면 안 된다). 다른 저장소들과 같은 모양(useSyncExternalStore).
 */

/** 값이 매번 새로 만들어지면 useSyncExternalStore 가 계속 다시 그린다. */
const NONE: string[] = [];

let won: string[] = NONE;
const listeners = new Set<() => void>();

export function subscribeStickers(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** 받은 스티커 — 최근 것이 앞에 */
export function getStickers(): string[] {
  return won;
}

/** 서버는 아직 아무것도 못 받았다고 그린다. */
export function getStickersServerSnapshot(): string[] {
  return NONE;
}

/**
 * 뽑을 스티커를 고른다 — 아직 안 받은 것 중에서 아무거나(그래야 서른세 장이
 * 골고루 나온다). 다 받았으면 아무거나. 결과 화면이 받는 순간(winSticker)과 따로
 * 둔다 — 공이 열리기 전에 무엇이 나올지 정해져 있어야 해서.
 */
export function pickSticker(): string {
  const all = decorate.packStickers;
  const left = all.filter((one) => !won.includes(one));
  const pool = left.length ? left : all;
  return pool[Math.floor(Math.random() * pool.length)];
}

/** 스티커를 받았다 — 결과 화면이 뜰 때 한 번. 같은 것을 또 받으면 앞으로 옮긴다. */
export function winSticker(src: string): void {
  won = [src, ...won.filter((one) => one !== src)];
  listeners.forEach((notify) => notify());
}
