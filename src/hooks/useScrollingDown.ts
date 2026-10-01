"use client";

import { useEffect, useState } from "react";

/**
 * 화면(스크롤 상자)이 아래로 넘어가는 중인지 — 떠 있는 것들이 비켜 서는 신호.
 *
 * 알래봇 · 글쓰기(ActionFab) · 데모 계정 칩(PersonaSwitch)이 같이 쓴다. 떠 있는
 * 단추는 어느 높이에 두어도 그 밑을 지나가는 글을 덮는다(감수 지적) — 읽으러
 * 내려가는 동안은 비켜 주고, 위로 올리거나 멈추면 돌아온다. 전에는 알래봇만
 * 그랬고 글쓰기 · 데모 계정 칩은 늘 떠 있어 거슬렸다(사용자 지적).
 *
 * 상자는 ShowcaseLayout 의 `[data-scroll-area]` 다 — 화면이 바뀌어도 같은
 * 요소라 한 번 붙잡아 두면 된다.
 */

/** 이만큼은 움직여야 방향으로 친다 — 손가락이 조금 떨리는 것에 깜빡이지 않게 */
const SCROLL_SLOP = 6;
/** 멈춘 뒤 이만큼 지나면 다시 나온다 */
const IDLE_MS = 900;

export function useScrollingDown(): boolean {
  const [down, setDown] = useState(false);

  useEffect(() => {
    const area = document.querySelector<HTMLElement>("[data-scroll-area]");
    if (!area) return;
    let last = area.scrollTop;
    let idle: number | null = null;

    const onScroll = () => {
      const now = area.scrollTop;
      const delta = now - last;
      if (Math.abs(delta) >= SCROLL_SLOP) {
        setDown(delta > 0 && now > 40);
        last = now;
      }
      if (idle !== null) window.clearTimeout(idle);
      idle = window.setTimeout(() => setDown(false), IDLE_MS);
    };

    area.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      area.removeEventListener("scroll", onScroll);
      if (idle !== null) window.clearTimeout(idle);
    };
  }, []);

  return down;
}

/**
 * 비켜 서는 모양 — 아래로 미끄러지며 흐려진다. 셋이 같은 값을 써야 한 몸처럼
 * 움직인다. 숨은 동안은 눌리지 않는다.
 */
export const HIDE_WHEN_SCROLLING = "transition-all duration-300";
export const HIDDEN = "pointer-events-none translate-y-[120px] opacity-0";
