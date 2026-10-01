"use client";

import { useEffect, useRef, useState } from "react";
import type { RefObject } from "react";

/**
 * 요소가 화면에 들어왔는지 — 한 번 들어오면 계속 true 다.
 *
 * 진행 막대처럼 「보이는 순간 차오르는」 움직임에 쓴다. 처음부터 차 있으면
 * 움직임이 없고, 보이지 않는데 움직이면 헛일이다. 움직임을 줄여 달라고 한
 * 사람(prefers-reduced-motion)에게는 처음부터 true 를 주어 최종 모습으로
 * 바로 그린다 — 그 판단도 관찰자 안에서 한다(effect 본문에서 상태를 바꾸면
 * 그리기가 한 번 더 돈다).
 */
export function useInView<T extends HTMLElement>(threshold = 0.3): [RefObject<T | null>, boolean] {
  const box = useRef<T>(null);
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    const element = box.current;
    if (!element || seen) return;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const watch = new IntersectionObserver(
      (entries) => {
        if (still || entries.some((entry) => entry.isIntersecting)) {
          setSeen(true);
          watch.disconnect();
        }
      },
      { threshold },
    );
    watch.observe(element);
    /*
      관찰자가 기별을 안 줄 때의 뒷받침 — 그리기가 멈춘 창(가려진 미리보기 창)이나
      관찰자를 못 쓰는 브라우저에서도, 자리를 재서 화면 안에 있으면 켠다.
      창만이 아니라 가리는 조상(overflow 가 visible 이 아닌 것)의 안에도 있어야
      한다 — 폰 틀 안에서 굴리는 화면은 창보다 작아서, 창 기준으로만 재면 틀
      아래에 가려진 것까지 켜서 굴려 내려왔을 때 이미 올라와 있다.
    */
    const fallback = window.setTimeout(() => {
      if (insideClip(element)) {
        setSeen(true);
        watch.disconnect();
      }
    }, 1200);
    return () => {
      watch.disconnect();
      window.clearTimeout(fallback);
    };
  }, [seen, threshold]);

  return [box, seen];
}

/** 창 안에 있고, 가리는 조상마다 그 안에도 걸쳐 있는지. */
function insideClip(element: HTMLElement): boolean {
  let top = 0;
  let bottom = window.innerHeight;
  for (let node = element.parentElement; node; node = node.parentElement) {
    if (getComputedStyle(node).overflowY === "visible") continue;
    const box = node.getBoundingClientRect();
    top = Math.max(top, box.top);
    bottom = Math.min(bottom, box.bottom);
  }
  const box = element.getBoundingClientRect();
  return box.top < bottom && box.bottom > top;
}
