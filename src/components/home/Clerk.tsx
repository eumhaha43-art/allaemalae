"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Img from "@/components/common/Img";

/**
 * 점원 캐릭터 — Figma 846:3507(배너 154px), 846:3791(알래봇 47.6px).
 *
 * 얼굴은 전부 도형이라 그대로 그리고 모자만 내보낸 SVG 를 얹는다. 두 곳의
 * 비율이 같아서 154 기준으로 그린 뒤 요청한 크기로 환산한다.
 *
 * `greet` 를 받으면 처음 온 사람에게 한 번 인사한다 — 배너 문구를 소리 내어
 * 말하듯 입이 움직이고 그동안 눈을 깜빡인다. 알래봇은 화면마다 따라다니는
 * 단추라 인사하지 않는다.
 *
 * 인사는 3초 남짓이라 한눈팔면 지나간다. 그래서 점원을 눌러 다시 볼 수 있게
 * 했다 — 저절로 하는 인사만 처음 한 번이고, 눌러서 보는 것은 언제나 된다.
 */

/** 인사를 이미 했는지 — 다음에 와도 저절로 하지는 않는다. */
const SEEN_KEY = "rmb.home.greeted";

/**
 * 이번에 저절로 인사할지 한 번만 정하고 그 답을 들고 있는다.
 *
 * 붙었다 떨어졌다 하는 사이(개발 모드의 두 번 붙이기)에 답이 달라지면, 처음
 * 켰는데도 인사가 안 나오거나 반쯤 하다 만다. 인사가 끝나면 false 로 바꿔,
 * 같은 판에서 홈에 다시 들어와도 조용하다.
 */
let decision: boolean | null = null;

function shouldGreet(): boolean {
  if (decision !== null) return decision;
  try {
    decision = !window.localStorage.getItem(SEEN_KEY);
    window.localStorage.setItem(SEEN_KEY, "1");
  } catch {
    // 기억을 못 하는 브라우저 — 이번 한 번은 인사하고 만다
    decision = true;
  }
  return decision;
}

/** 화면이 뜨고 한 박자 뒤에 입을 뗀다 — 뜨자마자 말하면 못 보고 지나간다. */
const OPENING_MS = 600;
/**
 * 한 음절. 입이 한 번 열렸다 닫히는 시간이기도 하다(clerk-talk).
 *
 * 200 일 때는 입이 떠는 것처럼 보이고 무슨 일이 있었는지 모르게 끝났다.
 */
const BEAT_MS = 240;
/** 두 줄 사이 — 숨 고르는 자리. 없으면 열세 음절이 한 덩어리로 들린다. */
const GAP_MS = 360;

type Say = "idle" | "line1" | "gap" | "line2" | "done";

export default function Clerk({
  size,
  shadow = false,
  greet = false,
  onTap,
}: {
  size: number;
  shadow?: boolean;
  /** 눌러서 다시 인사를 보게 했을 때 — 옆의 안내를 거두는 데 쓴다. */
  onTap?: () => void;
  /** 처음 온 사람에게 배너 문구를 말해 보일지 */
  greet?: boolean;
}) {
  const u = (px: number) => `${(px / 154) * size}px`;
  const [say, setSay] = useState<Say>("idle");
  const timers = useRef<number[]>([]);

  /*
    「어서오세요!」 다섯 음절 → 숨 고르기 → 「알래말래븐 입니다.」 여덟 음절.
    입이 움직이는 길이를 문구의 음절 수에서 뽑으므로, 문구가 바뀌면 여기 숫자만
    맞추면 된다.

    다시 누르면 하던 것을 걷고 처음부터 한다 — 안 그러면 앞서 걸어 둔 시계가
    남아 있다가 한창 말하는 중에 입을 닫아 버린다.
  */
  const play = useCallback((delay: number) => {
    timers.current.forEach(window.clearTimeout);

    const line1 = 5 * BEAT_MS;
    const line2 = 8 * BEAT_MS;
    const at = (ms: number, next: Say) => window.setTimeout(() => setSay(next), delay + ms);

    timers.current = [
      at(0, "line1"),
      at(line1, "gap"),
      at(line1 + GAP_MS, "line2"),
      window.setTimeout(() => {
        setSay("done");
        // 인사를 마쳤다 — 같은 판에서 홈에 다시 들어와도 저절로 하지는 않는다
        decision = false;
      }, delay + line1 + GAP_MS + line2),
    ];
  }, []);

  useEffect(() => {
    if (greet && shouldGreet()) play(OPENING_MS);
    const running = timers;
    return () => running.current.forEach(window.clearTimeout);
  }, [greet, play]);

  const talking = say === "line1" || say === "line2";
  // 눈은 인사하는 내내 깜빡인다 — 말하다 쉬는 사이에도 살아 있어야 한다
  const awake = say !== "idle" && say !== "done";

  const face = (
    <>
      {shadow ? (
        <div
          className="absolute right-0 rounded-full bg-black/10"
          style={{ width: u(136), height: u(144), bottom: u(-11) }}
        />
      ) : null}

      <div
        className="absolute rounded-t-full bg-gray-black"
        style={{ width: u(96), height: u(112), right: u(40), bottom: u(24) }}
      >
        <div
          className={`absolute rounded-full bg-white ${awake ? "clerk-blink" : ""}`}
          style={{ width: u(10), height: u(10), left: u(24), top: u(32) }}
        />
        <div
          className={`absolute rounded-full bg-white ${awake ? "clerk-blink" : ""}`}
          style={{ width: u(10), height: u(10), right: u(24), top: u(32) }}
        />
        <div
          className={`absolute rounded-b-full bg-white ${talking ? "clerk-talk" : ""}`}
          style={{ width: u(24), height: u(12), left: u(36), top: u(56) }}
        />
      </div>

      {/* 모자는 가끔 띠용 하고 튄다(clerk-hat) — 홈의 인사하는 점원만(사용자 결정), 인사할 때는 더 자주 */}
      <Img
        src="/assets/home/banner-hat.svg"
        className={`absolute top-0 left-0 ${greet ? "clerk-hat" : ""} ${awake ? "clerk-hat-awake" : ""}`}
        style={{ width: u(104), height: u(37) }}
      />
    </>
  );

  // 인사하는 점원만 누를 수 있다 — 알래봇은 그 자체가 이미 단추다
  if (!greet) {
    return (
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        {face}
      </div>
    );
  }

  return (
    <button
      type="button"
      aria-label="점원 인사 다시 보기"
      onClick={() => {
        play(0);
        onTap?.();
      }}
      className="relative block shrink-0"
      style={{ width: size, height: size }}
    >
      {face}
    </button>
  );
}
