"use client";

import { useEffect, useRef } from "react";

/**
 * 옆으로 넘기는 상자를 마우스로도 넘길 수 있게 — 끌기와 세로 휠.
 *
 * 손가락으로는 그냥 밀면 되지만 PC 목업에서는 스크롤바를 숨겨 두어 마우스로
 * 넘길 길이 없었다(사용자 지적). 그래서 둘을 붙인다.
 *
 * - 끌기: 누른 채 옆으로 움직인 만큼 넘긴다. 목업은 기기를 transform 으로 줄여
 *   그리므로 화면에서 움직인 px 을 기기 px 로 바꿔 준다(화면 폭 ÷ 제 폭). 끄는
 *   동안은 스크롤 스냅을 잠깐 끈다 — 켜 둔 채 scrollLeft 를 바꾸면 브라우저가
 *   매번 되돌려 놓는다. 놓으면 가장 가까운 칸으로 스르르 맞춘다.
 * - 세로 휠: 한 번에 한 칸씩 넘긴다. 움직인 만큼만 옮기면 스냅이 가장 가까운
 *   칸으로 도로 당겨 놓아 휠 한 칸(100px 남짓)으로는 영영 못 넘어간다. 한
 *   칸 가는 동안(400ms)은 다음 휠을 무시한다 — 트랙패드는 한 번 쓸어도 수십
 *   번 온다. 끝에 닿아 더 갈 데가 없으면 그냥 두어 페이지가 내려가게 한다 —
 *   안 그러면 카드 위에서 화면이 멈춘다.
 *
 * 끌고 난 뒤의 클릭은 삼킨다 — 안 그러면 카드를 끌었을 뿐인데 안의 링크가 눌린다.
 * `step` 은 한 칸의 폭(카드 + 사이) — 놓을 때 어디에 맞출지 이것으로 센다.
 *
 * 그림 위에서는 브라우저가 제 끌기(그림을 집어 옮기는 것)를 먼저 시작해 버려서
 * 포인터가 끊기고(pointercancel) 카드가 도로 튕겨 돌아갔다 — 카드뉴스는 카드가
 * 전부 그림이라 끌기가 아예 안 됐다(사용자 지적). 누르는 순간 기본 동작을 막고
 * dragstart 도 막아서 우리 끌기만 남긴다.
 */
export function useDragScroll<T extends HTMLElement>(step: (el: T) => number) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let dragging = false;
    let moved = false;
    let startX = 0;
    let startLeft = 0;
    let settle: number | null = null;
    let turning = false;

    const scale = () => el.getBoundingClientRect().width / el.offsetWidth || 1;

    const down = (event: PointerEvent) => {
      if (event.pointerType !== "mouse" || event.button !== 0) return;
      // 그림 끌기 · 글자 선택이 시작되지 않게 — 이 뒤로는 우리 끌기만 있다
      event.preventDefault();
      dragging = true;
      moved = false;
      startX = event.clientX;
      startLeft = el.scrollLeft;
      if (settle !== null) window.clearTimeout(settle);
      el.style.scrollSnapType = "none";
      el.style.cursor = "grabbing";
    };
    const move = (event: PointerEvent) => {
      if (!dragging) return;
      const dx = (event.clientX - startX) / scale();
      if (Math.abs(dx) > 3) moved = true;
      el.scrollLeft = startLeft - dx;
    };
    const up = () => {
      if (!dragging) return;
      dragging = false;
      el.style.cursor = "";
      const unit = step(el);
      const target = Math.round(el.scrollLeft / unit) * unit;
      el.scrollTo({ left: target, behavior: "smooth" });
      // 스르르 가는 동안 스냅을 켜면 도중에 낚아챈다 — 도착할 즈음 다시 켠다
      settle = window.setTimeout(() => {
        el.style.scrollSnapType = "";
        settle = null;
      }, 350);
    };
    const wheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
      const unit = step(el);
      const max = el.scrollWidth - el.clientWidth;
      const dir = event.deltaY > 0 ? 1 : -1;
      const at = Math.round(el.scrollLeft / unit);
      if ((dir < 0 && el.scrollLeft <= 0) || (dir > 0 && el.scrollLeft >= max - 1)) return;
      event.preventDefault();
      if (turning) return;
      turning = true;
      el.scrollTo({ left: Math.max(0, Math.min(max, (at + dir) * unit)), behavior: "smooth" });
      window.setTimeout(() => {
        turning = false;
      }, 400);
    };
    // 브라우저의 그림 끌기 — 어떤 경로로든 시작되면 막는다
    const dragstart = (event: DragEvent) => event.preventDefault();
    // 끌고 난 뒤의 클릭 — 잡아 두었다가 여기서 삼킨다(capture 라 링크보다 먼저 온다)
    const click = (event: MouseEvent) => {
      if (!moved) return;
      moved = false;
      event.preventDefault();
      event.stopPropagation();
    };

    el.addEventListener("pointerdown", down);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    el.addEventListener("wheel", wheel, { passive: false });
    el.addEventListener("dragstart", dragstart);
    el.addEventListener("click", click, true);
    return () => {
      el.removeEventListener("pointerdown", down);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
      el.removeEventListener("wheel", wheel);
      el.removeEventListener("dragstart", dragstart);
      el.removeEventListener("click", click, true);
      if (settle !== null) window.clearTimeout(settle);
    };
  }, [step]);

  return ref;
}
