"use client";

import { DEVICE, SHOWCASE } from "@/config/showcase";

/**
 * 발표 모니터의 대각선 인치 — 「실제 크기로 보기」의 눈금.
 *
 * 브라우저는 모니터의 진짜 크기를 모른다. 픽셀이 몇 개인지(screen)는 알아도
 * 그 픽셀이 몇 인치에 펼쳐져 있는지는 모르므로, 4K 27인치와 4K 32인치에서
 * 같은 402px 가 다른 크기로 보인다. CSS 가 정한 「1인치 = 96px」로 셈했더니
 * 4K 를 150% 로 쓰는 27인치 모니터에서 12% 작게 나왔다(사용자 지적).
 *
 * 그래서 인치를 적어 받는다. 한 번 맞추면 이 브라우저에 남는다(localStorage)
 * — 발표 기계마다 한 번이면 된다. 안 적었으면 설정의 기본값이다.
 */
const KEY = "rmb-monitor-inches";
const MIN_INCHES = 10;
const MAX_INCHES = 80;

let inches: number | null = null;
const listeners = new Set<() => void>();

function read(): number {
  try {
    const saved = Number(window.localStorage.getItem(KEY));
    if (saved >= MIN_INCHES && saved <= MAX_INCHES) return saved;
  } catch {
    // 못 읽으면 기본값
  }
  return SHOWCASE.monitorInches;
}

function notify(): void {
  listeners.forEach((listener) => listener());
}

export function subscribeMonitor(listener: () => void): () => void {
  listeners.add(listener);
  // 창을 다른 모니터로 옮기면 screen 이 바뀐다 — 그때도 다시 잰다
  window.addEventListener("resize", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("resize", listener);
  };
}

/**
 * useSyncExternalStore 는 원시값이어야 해서 「인치|화면 픽셀」 한 문자열로 준다.
 * 화면 픽셀까지 넣는 것은 창을 옮겼을 때 다시 그리게 하려는 것이다.
 */
export function getMonitor(): string {
  if (inches === null) inches = read();
  return `${inches}|${window.screen.width}x${window.screen.height}`;
}

/** 서버는 모니터를 모른다 — 0x0 이면 CSS 인치(96px)로 셈한다. */
export function getMonitorServerSnapshot(): string {
  return `${SHOWCASE.monitorInches}|0x0`;
}

export function setMonitorInches(next: number): void {
  const clamped = Math.min(MAX_INCHES, Math.max(MIN_INCHES, Math.round(next)));
  if (clamped === inches) return;
  inches = clamped;
  try {
    window.localStorage.setItem(KEY, String(clamped));
  } catch {
    // 못 적어도 이번 판은 위의 값이 들고 있다
  }
  notify();
}

/** 스냅샷에서 인치만 — 눈금 표시용. */
export function monitorInchesOf(snapshot: string): number {
  return Number(snapshot.split("|")[0]);
}

/**
 * 「실제 크기」 배율 — 이 모니터에서 아이폰의 1pt 가 몇 CSS px 인지.
 *
 * 화면 대각선(CSS px)을 인치로 나누면 1인치가 몇 CSS px 인지 나온다. 기기
 * 배율(devicePixelRatio)은 분자와 분모에 같이 들어 사라지므로 안 본다 —
 * 다만 브라우저 확대/축소는 여기 안 잡히니 100% 로 두고 본다.
 *
 * 아이폰 17 은 402pt 를 460ppi(3배)로 찍으므로 1pt = 3/460 인치다
 * (DEVICE.ppi · pixelRatio). 화면 픽셀을 모르면(서버 · 0x0) CSS 인치 96px 로.
 */
export function actualScale(snapshot: string): number {
  const [inchesPart, screenPart] = snapshot.split("|");
  const [width, height] = screenPart.split("x").map(Number);
  const monitor = Number(inchesPart);
  const diagonal = Math.hypot(width, height);
  const cssPxPerInch = diagonal > 0 && monitor > 0 ? diagonal / monitor : 96;
  return (cssPxPerInch * DEVICE.pixelRatio) / DEVICE.ppi;
}
