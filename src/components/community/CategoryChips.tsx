"use client";

import { useEffect, useLayoutEffect, useRef, useSyncExternalStore } from "react";
import { categories, categoryColors } from "@/data/common/community";
import {
  getFilter,
  getFilterServerSnapshot,
  setCategory,
  subscribeFilter,
} from "@/state/communityFilterStore";

/**
 * 카테고리 필터 — Figma 856:5271.
 *
 * 고른 칩은 그 카테고리 색으로 칠한다 — 856:8687~8692. 프레임에는 역사만
 * 골라진 상태로 그려져 있어 전부 파랑처럼 보이지만, 색은 카테고리마다 다르다.
 *
 * 고른 갈래는 저장소(communityFilterStore)에 둔다 — 바로 아래 최신 글 목록이
 * 그 값으로 거른다. 처음은 「전체」다.
 *
 * 칠은 칩 자체가 아니라 뒤에 깐 판(SVG 네모)이다 — 탭 바(BottomNav)의 판과
 * 같은 놀이(사용자 요청: 칩이 너무 가만히 있다, 홈 탭처럼). 다른 칩을 누르면 헌
 * 판에서 방울이 떨어져 나와 새 칩으로 흘러가고, 헌 판은 가운데로 오그라들어
 * 사라지며, 새 자리에서 부풀던 판이 도착한 방울을 삼킨다. 끈끈이 필터가 떨어지고
 * 합쳐지는 목을 잇는다. 색이 갈래마다 달라 방울은 흘러가며 헌 색에서 새 색으로
 * 물든다. 판은 칩의 흰 바탕 위 · 글자 밑에 그린다(z 순서) — 칩 바탕을 바꿀 것 없이
 * 판이 덮으면 칠해진 것이다. 글자는 판과 같은 박자로 회색 ↔ 흰색이 된다(.cat-chip).
 *
 * 처음 그릴 때는 그냥 놓는다 — 옮겨 올 헌 자리가 없다. 움직임 줄이기면 바로 놓는다.
 */

/** 판이 옮겨 가는 박자(ms) — 탭 바(BottomNav.PILL)와 같은 뜻 · 같은 값 */
const PILL = { go: 260, drop: 110, land: 430, gone: 540, wait: 300, total: 660 };
/** 흘러가는 방울의 반지름 — 칩(높이 34)에 맞춰 탭 바보다 조금 작다 */
const PILL_DROP = 7;
/** 칩의 둥근 정도 — 칩과 같다(rounded-[17px]) */
const PILL_RX = 17;
/** 끈끈이 필터 — 옮겨 가는 동안만 판에 건다(사파리) */
const GOO_ID = "chip-goo";

type PillBox = { left: number; top: number; width: number; height: number };

/** 서버에는 layout effect 가 없어 경고가 난다 — 거기서는 아무것도 안 하는 useEffect 로 */
const useBeforePaint = typeof window === "undefined" ? useEffect : useLayoutEffect;

/** 칩을 덮는 판의 자리 — 줄(offsetParent) 기준. 테두리까지 덮는다 */
function pillBoxOf(chip: HTMLElement): PillBox {
  return {
    left: chip.offsetLeft,
    top: chip.offsetTop,
    width: chip.offsetWidth,
    height: chip.offsetHeight,
  };
}

/** SVG 네모에 자리와 색을 박는다 */
function fit(rect: SVGRectElement, box: PillBox, color: string) {
  rect.setAttribute("x", String(box.left));
  rect.setAttribute("y", String(box.top));
  rect.setAttribute("width", String(box.width));
  rect.setAttribute("height", String(box.height));
  rect.setAttribute("fill", color);
}

/** 시각(ms)을 전체에 대한 비로 — 키프레임 offset */
const at = (ms: number) => ms / PILL.total;

export default function CategoryChips() {
  const active = useSyncExternalStore(subscribeFilter, getFilter, getFilterServerSnapshot).category;

  const rowRef = useRef<HTMLDivElement>(null);
  const pillRef = useRef<SVGRectElement>(null);
  const oldRef = useRef<SVGRectElement>(null);
  const dropRef = useRef<SVGCircleElement>(null);
  const gooRef = useRef<SVGGElement>(null);
  const placed = useRef<{ box: PillBox; color: string } | null>(null);

  useBeforePaint(() => {
    const row = rowRef.current;
    const pill = pillRef.current;
    const old = oldRef.current;
    const drop = dropRef.current;
    const goo = gooRef.current;
    if (!row || !pill || !old || !drop || !goo) return;

    const place = (travel: boolean) => {
      const chip = row.querySelector<HTMLElement>('button[aria-pressed="true"]');
      if (!chip) {
        pill.style.opacity = "0";
        placed.current = null;
        return;
      }
      const box = pillBoxOf(chip);
      const color = categoryColors[chip.dataset.category ?? ""] ?? categoryColors.전체;
      const was = placed.current;
      placed.current = { box, color };
      fit(pill, box, color);
      pill.style.opacity = "1";

      if (!travel || !was || was.box.left === box.left) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      for (const el of [pill, old, drop]) for (const running of el.getAnimations()) running.cancel();
      /*
        끈끈이 필터는 옮겨 가는 동안만 건다. 가만히 있을 때도 걸어 두면 iOS 사파리가
        흐림 → 문턱을 거친 판을 각진 팔각형으로 그리고, 홈 탭 자리에는 세로 줄무늬가
        남았다(사용자 지적 — 실제 폰). 쉬는 판은 필터 없이 그대로가 또렷하다.
      */
      goo.setAttribute("filter", `url(#${GOO_ID})`);

      // 헌 판은 헌 자리 · 헌 색에, 방울은 헌 판 가운데에서 헌 색으로 출발
      fit(old, was.box, was.color);
      drop.setAttribute("cx", String(was.box.left + was.box.width / 2));
      drop.setAttribute("cy", String(was.box.top + was.box.height / 2));
      const dx = box.left + box.width / 2 - (was.box.left + was.box.width / 2);
      const dy = box.top + box.height / 2 - (was.box.top + was.box.height / 2);
      const timing = { duration: PILL.total };

      old.animate(
        [
          { transform: "scale(1)", easing: "cubic-bezier(0.5, 0, 0.9, 0.4)" },
          { transform: "scale(0)", offset: at(PILL.go) },
          { transform: "scale(0)" },
        ],
        timing,
      );
      drop.animate(
        [
          { transform: "translate(0, 0) scale(0)", fill: was.color, easing: "cubic-bezier(0.33, 1, 0.68, 1)" },
          {
            transform: "translate(0, 0) scale(1)",
            fill: was.color,
            offset: at(PILL.drop),
            easing: "cubic-bezier(0.55, 0, 0.3, 1)",
          },
          {
            transform: `translate(${dx}px, ${dy}px) scale(1)`,
            fill: color,
            offset: at(PILL.land),
            easing: "cubic-bezier(0.4, 0, 1, 1)",
          },
          { transform: `translate(${dx}px, ${dy}px) scale(0)`, fill: color, offset: at(PILL.gone) },
          { transform: `translate(${dx}px, ${dy}px) scale(0)`, fill: color },
        ],
        timing,
      );
      const come = pill.animate(
        [
          { transform: "scale(0)" },
          { transform: "scale(0)", offset: at(PILL.wait), easing: "cubic-bezier(0.34, 1.35, 0.64, 1)" },
          { transform: "scale(1)" },
        ],
        timing,
      );
      come.onfinish = () => goo.removeAttribute("filter");
      come.oncancel = () => goo.removeAttribute("filter");
    };

    place(true);
    const watch = new ResizeObserver(() => place(false));
    watch.observe(row);
    return () => watch.disconnect();
  }, [active]);

  return (
    /*
      위아래 10 + 바깥 상자의 gap 10 = 뜨는 지식·최신 글과 각각 20 씩 뜬다.

      헤더(60) + 탭 줄(86) 아래에 붙어 따라온다 — 글을 내려 읽다가도 갈래를
      바꿀 수 있어야 한다. 바깥 상자(뜨는 지식 ~ 최신 글)가 끝나면 같이 올라간다.

      줄(안쪽 상자)은 넓으면 꽉 차게 벌리고(min-w-full · justify-between), 좁아
      칩이 넘치면 제 폭(w-max)으로 옆으로 넘긴다 — 판 SVG 가 줄에 붙어 있어 넘겨도
      같이 간다.
    */
    <div
      style={
        {
          "--pill-go": `${PILL.go}ms`,
          "--pill-wait": `${PILL.wait}ms`,
          "--pill-come": `${PILL.total - PILL.wait}ms`,
        } as React.CSSProperties
      }
      // top 169 — 헤더(60) + 탭 줄(44 + 알약 + 20 = 110) 바닥(170)보다 1 위로 겹친다. 탭 줄 위 여백을 줄이며(CommunityTabs) 202 → 170 → 169: 사이가 비면 글이 그 틈으로 비치고, 딱 맞춰도 실금이 남는다(사용자 지시)
      className="no-scrollbar sticky top-[169px] z-10 w-full shrink-0 overflow-x-auto bg-[#f5f8fa] py-[10px]"
    >
      <div ref={rowRef} className="relative flex w-max min-w-full justify-between gap-[6px] px-6">
        {/*
          판 — 칩 바탕 위 · 글자 밑(z-[1] · 글자 z-[2]). HTML 이 아니라 SVG 인 것은
          끈끈이 필터 때문(탭 바와 같다). 필터 영역은 줄 전체(userSpaceOnUse).
        */}
        <svg aria-hidden className="pointer-events-none absolute inset-0 z-[1] h-full w-full">
          <defs>
            <filter
              id={GOO_ID}
              x="0"
              y="0"
              width="100%"
              height="100%"
              filterUnits="userSpaceOnUse"
              colorInterpolationFilters="sRGB"
            >
              <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
              <feColorMatrix
                in="blur"
                type="matrix"
                values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -9"
                result="goo"
              />
              <feComposite in="SourceGraphic" in2="goo" operator="atop" />
            </filter>
          </defs>
          <g ref={gooRef}>
            <rect ref={oldRef} className="cat-pill cat-pill-old" rx={PILL_RX} />
            <circle ref={dropRef} className="cat-pill cat-pill-drop" r={PILL_DROP} />
            <rect ref={pillRef} className="cat-pill" rx={PILL_RX} style={{ opacity: 0 }} />
          </g>
        </svg>

        {categories.map((category) => {
          const isActive = category === active;
          return (
            <button
              key={category}
              type="button"
              aria-pressed={isActive}
              data-category={category}
              onClick={() => setCategory(category)}
              className={`cat-chip tap [--tap-w:0px] shrink-0 rounded-[17px] border border-gray-200 bg-white px-[14px] py-2 text-xs whitespace-nowrap ${
                isActive
                  ? "leading-[1.4] font-semibold tracking-[-0.24px]"
                  : "leading-[1.3] font-medium"
              }`}
            >
              <span className="relative z-[2]">{category}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
