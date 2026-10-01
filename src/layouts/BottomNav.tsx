"use client";

import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Img from "@/components/common/Img";
import NavBag from "@/layouts/NavBag";
import { fridge } from "@/data/common/cart";
import { navItems } from "@/data/common/home";
import { hidesTabBar } from "@/routes/paths";
import {
  getCartBadge,
  getCartBadgeServerSnapshot,
  subscribeCartBadge,
} from "@/state/cartFlightStore";
import {
  getKeyboardOpen,
  getKeyboardServerSnapshot,
  subscribeKeyboard,
} from "@/state/keyboardStore";
import {
  getOverlayOpen,
  getOverlayServerSnapshot,
  subscribeOverlay,
} from "@/state/overlayStore";

/**
 * 하단 탭 — Figma 807:3348(디자이너가 차례 · 여백을 고친 것). 내 봉투 · 기록 ·
 * 홈 · 커뮤니티 · 메뉴가 사이 40 으로 가운데 모이고, 탭은 30 자리 아이콘 · 4 · 12
 * 글자를 바 높이 한가운데 둔다. 바는 프레임(60)보다 높은 70 — 켜진 탭의 판(54)이
 * 60 에서는 위아래 3 씩만 남아 바 끝에 닿아 보였다(사용자 지적).
 *
 * 켜진 탭 뒤에는 진한 초록(primary-600) 판이 깔리고 아이콘 · 글자는 흰색이다
 * (사용자 요청). 판은 켜진 탭 자리로 옮겨 다닌다 — 비눗방울처럼(사용자 요청):
 * 다른 탭을 누르면 헌 판에서 방울 하나가 떨어져 나와 새 탭으로 흘러가고, 헌 판은
 * 아이콘 가운데로 오그라들어 사라지며, 새 자리에서 부풀던 판이 도착한 방울을
 * 삼켜 하나가 된다. 떨어지고 합쳐질 때 목이 늘어났다 끊기는 것은 SVG 의
 * 「끈끈이」 필터(흐림 → 알파 문턱)다 — 가까운 두 덩이가 한 덩이로 이어져 보인다.
 * 탭마다 판을 두고 켜고 끄면 옮겨 가는 것이 안 보이고 그냥 바뀌는 것으로
 * 보인다(사용자 지적).
 *
 * 아이콘 SVG 는 색을 CSS 로 바꿀 수 없어 켜짐(흰) · 꺼짐(회색) 사본을 겹쳐 두고
 * 판과 같은 박자로 갈아탄다(globals.css .nav-icon-on / -off, 박자는 --pill-* 변수)
 * — 흰 아이콘이 판보다 먼저 오면 흰 바탕에 묻혀 사라진다. 봉투 탭만 NavBag 이
 * 그린다 — 담으면 봉투가 받는 움직임이 있어서.
 *
 * 꺼진 탭은 프레임의 #d1d1d1 대신 gray-500(#8b8c8c)이다 — 프레임 색은 너무
 * 옅어서 못 누르는 탭으로 보였다(사용자 지적). 아이콘 사본도 같은 색으로.
 *
 * 켜짐은 그 탭 아래 어디에 있어도다 — 채팅방(/community/chat)에서 커뮤니티가,
 * 카테고리(/menu/category/…)에서 메뉴가 켜진다. 주소가 딱 맞을 때만 켜면 한
 * 단계만 들어가도 다 꺼져 어디에 있는지 모른다(사용자 지적). 홈(/)만 딱 맞을
 * 때다 — 아니면 어디서나 홈이 켜진다.
 *
 * 아이콘마다 크기가 다르다 — 홈 30, 냉장고 22, 메뉴 22x18, 나머지 24. 30x30
 * 자리만 공통이다.
 *
 * 봉투에는 이 탭에서 담은 개수가 배지로 붙는다(cartFlightStore). 처음엔
 * 없다가 담으면 생기고, 빼면 내려간다. 담기 단추(CartToggle)가 켜진 그림을
 * 이리로 던지고 닿는 순간 세므로, 그때 배지가 튀어나오고 봉투가 납작해졌다
 * 튀어 오른다(.bag-catch).
 *
 * 지식 상세(/menu/knowledge/…)는 주소만 보면 메뉴 밑이지만 홈 · 검색 · 장바구니
 * 어디서나 열린다. 홈에서 열었는데 메뉴가 켜지면 어디서 왔는지가 틀린다(감수
 * 지적) — 그 화면에서는 마지막으로 서 있던 탭을 그대로 켜 둔다.
 */

/** 지식 상세처럼 탭이 정해지지 않는 화면 */
const FLOATING = /^\/menu\/knowledge\//;

/** 마지막으로 서 있던 탭의 href — 이 판(page load)에서만 기억한다 */
let lastTab = "/";

/**
 * 판이 옮겨 가는 박자(ms, 처음부터 잰 시각).
 *
 *  - go    헌 판이 아이콘 가운데로 오그라들어 없어지는 데까지
 *  - drop  방울이 헌 판 속에서 맺혀 제 크기가 되는 시각 — 그 뒤 헌 판을 떠난다
 *  - land  방울이 새 탭 아이콘 가운데에 닿는 시각
 *  - gone  닿은 방울이 새 판에 다 스며드는 시각
 *  - wait  새 판이 부풀기 시작하는 시각 — 방울이 닿기 조금 전이라 둘이 합쳐진다
 *  - total 새 판이 다 부푸는 시각
 *
 * 아이콘 · 글자 색의 CSS 전환도 이 값을 변수(--pill-go · --pill-wait · --pill-come)로
 * 받아 같은 박자로 돈다.
 */
const PILL = { go: 260, drop: 110, land: 430, gone: 540, wait: 300, total: 660 };
/** 흘러가는 방울의 반지름 */
const PILL_DROP = 9;
/** 판이 탭보다 넓은 만큼 — 위아래 4 · 양옆 8. 아이콘 가운데는 판 위에서 4 + 15 = 19(CSS transform-origin) */
const PILL_PAD = { x: 8, y: 4 };
/** 아이콘 가운데 — 판 위에서 */
const PILL_EYE = PILL_PAD.y + 15;
/** 끈끈이 필터 — 옮겨 가는 동안만 판에 건다(사파리) */
const GOO_ID = "tab-goo";

type PillBox = { left: number; top: number; width: number; height: number };

/** 서버에는 layout effect 가 없어 경고가 난다 — 거기서는 아무것도 안 하는 useEffect 로 */
const useBeforePaint = typeof window === "undefined" ? useEffect : useLayoutEffect;

/**
 * 켜진 탭 링크를 덮는 판의 자리 — 탭 바(offsetParent) 기준. 화면이 줄여 그려져도
 * (PC 목업) 안 어긋난다.
 *
 * 폭은 탭마다 다르지 않다 — 가장 넓은 탭(「커뮤니티」)에 맞춘 한 폭으로, 그 탭
 * 가운데에 놓는다. 탭 폭(글자 폭)대로 두면 옮겨 갈 때마다 판이 늘었다 줄었다
 * 한다(사용자 지적).
 */
function pillBoxOf(link: HTMLElement, all: Iterable<HTMLElement>): PillBox {
  const widest = Math.max(...Array.from(all, (one) => one.offsetWidth));
  const width = widest + PILL_PAD.x * 2;
  return {
    left: link.offsetLeft + link.offsetWidth / 2 - width / 2,
    top: link.offsetTop - PILL_PAD.y,
    width,
    height: link.offsetHeight + PILL_PAD.y * 2,
  };
}

/** SVG 네모에 자리를 박는다 */
function fit(rect: SVGRectElement, box: PillBox) {
  rect.setAttribute("x", String(box.left));
  rect.setAttribute("y", String(box.top));
  rect.setAttribute("width", String(box.width));
  rect.setAttribute("height", String(box.height));
}

/** 시각(ms)을 전체에 대한 비로 — 키프레임 offset */
const at = (ms: number) => ms / PILL.total;

function tabFor(pathname: string): string | null {
  const hit = navItems.find(
    (item) => pathname === item.href || (item.href !== "/" && pathname.startsWith(`${item.href}/`)),
  );
  return hit ? hit.href : null;
}

export default function BottomNav() {
  const pathname = usePathname();
  const floating = FLOATING.test(pathname);
  const here = floating ? lastTab : tabFor(pathname);
  useEffect(() => {
    if (!floating && here) lastTab = here;
  }, [floating, here]);

  const keyboard = useSyncExternalStore(
    subscribeKeyboard,
    getKeyboardOpen,
    getKeyboardServerSnapshot,
  );
  const count = useSyncExternalStore(subscribeCartBadge, getCartBadge, getCartBadgeServerSnapshot);
  /** 뽑혀 나온 영수증처럼 화면을 덮는 것이 떠 있는지 */
  const overlay = useSyncExternalStore(
    subscribeOverlay,
    getOverlayOpen,
    getOverlayServerSnapshot,
  );

  /**
   * 배지와 바구니의 움직임을 다시 트는 열쇠. 개수가 바뀔 때마다 하나씩 올려
   * 요소를 새로 붙인다 — 같은 요소에 클래스만 두면 두 번째부터 안 움직인다.
   * 처음 그릴 때(저장돼 있던 개수)는 안 튄다 — 바뀐 게 아니다.
   */
  const [pulse, setPulse] = useState(0);
  const seen = useRef<number | null>(null);
  useEffect(() => {
    if (seen.current !== null && seen.current !== count) setPulse((now) => now + 1);
    seen.current = count;
  }, [count]);

  // 키보드가 이 자리를 덮는다 — 진짜 폰처럼 탭 바는 그 밑으로 사라진다.
  // 화면을 덮는 것이 떠 있을 때도 내린다 — 반투명이라 그냥 두면 비쳐 보인다.
  const shown = !(hidesTabBar(pathname) || keyboard || overlay);

  /*
    판 놓기. 켜진 탭이 바뀌면 헌 자리에서 새 자리로 옮겨 간다 — 세 덩이가 한 필터
    안에서 움직인다: 헌 판(old)은 아이콘 가운데로 오그라들고, 방울(drop)이 그 속에서
    맺혀 새 탭으로 흘러가며, 새 판(pill)은 방울이 닿기 조금 전부터 부풀어 방울을
    삼킨다. 끈끈이 필터가 방울이 떠날 때 목을 늘였다 끊고, 닿을 때 한 덩이로
    이어 준다. WAAPI 로 거는 것은 세 덩이의 박자를 한 시계로 맞추기 위해서다.

    처음 그릴 때와 탭 바가 다시 붙을 때(자판 · 덮개 뒤)는 그냥 놓는다 — 그 사이에
    어디로 갔든 옮겨 가는 것을 보여 줄 헌 자리가 없다. 「다시 붙었는지」는 판
    요소가 바뀌었는지로 안다. 폭이 바뀌면(기기 돌림) 움직임 없이 그 자리로.
  */
  const navRef = useRef<HTMLElement>(null);
  const pillRef = useRef<SVGRectElement>(null);
  const oldRef = useRef<SVGRectElement>(null);
  const dropRef = useRef<SVGCircleElement>(null);
  const gooRef = useRef<SVGGElement>(null);
  const placed = useRef<{ el: SVGRectElement; box: PillBox } | null>(null);
  useBeforePaint(() => {
    const nav = navRef.current;
    const pill = pillRef.current;
    const old = oldRef.current;
    const drop = dropRef.current;
    const goo = gooRef.current;
    if (!nav || !pill || !old || !drop || !goo) {
      placed.current = null;
      return;
    }

    const place = (travel: boolean) => {
      const link = nav.querySelector<HTMLElement>('a[aria-current="page"]');
      if (!link) {
        pill.style.opacity = "0";
        placed.current = null;
        return;
      }
      const box = pillBoxOf(link, nav.querySelectorAll<HTMLElement>("li a"));
      const was = placed.current;
      placed.current = { el: pill, box };
      fit(pill, box);
      pill.style.opacity = "1";

      if (!travel || !was || was.el !== pill || was.box.left === box.left) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      for (const el of [pill, old, drop]) for (const running of el.getAnimations()) running.cancel();
      /*
        끈끈이 필터는 옮겨 가는 동안만 건다. 가만히 있을 때도 걸어 두면 iOS 사파리가
        흐림 → 문턱을 거친 판을 각진 팔각형으로 그리고, 홈 탭 자리에는 세로 줄무늬가
        남았다(사용자 지적 — 실제 폰). 쉬는 판은 필터 없이 그대로가 또렷하다.
      */
      goo.setAttribute("filter", `url(#${GOO_ID})`);

      // 헌 판은 헌 자리에, 방울은 헌 판의 아이콘 가운데에서 출발
      fit(old, was.box);
      drop.setAttribute("cx", String(was.box.left + was.box.width / 2));
      drop.setAttribute("cy", String(was.box.top + PILL_EYE));
      const dx = box.left + box.width / 2 - (was.box.left + was.box.width / 2);
      const dy = box.top - was.box.top;
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
          { transform: "translate(0, 0) scale(0)", easing: "cubic-bezier(0.33, 1, 0.68, 1)" },
          {
            transform: "translate(0, 0) scale(1)",
            offset: at(PILL.drop),
            easing: "cubic-bezier(0.55, 0, 0.3, 1)",
          },
          {
            transform: `translate(${dx}px, ${dy}px) scale(1)`,
            offset: at(PILL.land),
            easing: "cubic-bezier(0.4, 0, 1, 1)",
          },
          { transform: `translate(${dx}px, ${dy}px) scale(0)`, offset: at(PILL.gone) },
          { transform: `translate(${dx}px, ${dy}px) scale(0)` },
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
    watch.observe(nav);
    return () => watch.disconnect();
  }, [here, shown]);

  if (!shown) return null;

  /*
    탭 바 밑을 흰색으로 잇는다(tab-floor) — 홈 인디케이터 자리까지. 바탕이 상태바
    색인 채팅방 로비(남색)에서 흰 탭 바와 인디케이터 사이에 남색이 비쳤다(사용자
    지적): 휴대폰에서는 안전영역 띠로, PC 목업에서는 화면을 줄여 그리느라 두 흰
    블록 사이에 낀 실금으로. 탭 바가 빠지는 자리(자판 · 덮개)에서는 같이 사라진다.
  */
  return (
    <nav
      ref={navRef}
      style={
        {
          "--pill-go": `${PILL.go}ms`,
          "--pill-wait": `${PILL.wait}ms`,
          "--pill-come": `${PILL.total - PILL.wait}ms`,
        } as React.CSSProperties
      }
      className="tab-floor relative h-[70px] w-full shrink-0 overflow-hidden rounded-t-[20px] border-t border-gray-100 bg-white"
    >
      {/*
        켜진 탭 뒤의 판 — 자리는 위의 place 가 잡고, 링크(position: relative)가 뒤에
        와서 위에 그려진다. HTML 이 아니라 SVG 인 것은 끈끈이 필터 때문이다 — HTML
        상자에 SVG 필터를 거는 것(filter: url())은 사파리가 못 한다. 필터 영역은
        탭 바 전체(userSpaceOnUse) — 기본값(덩이 상자의 110%)이면 방울이 흘러가는
        길이 잘린다.
      */}
      <svg aria-hidden className="pointer-events-none absolute inset-0 h-full w-full">
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
            {/* 흐린 뒤 알파를 세게 당겨 문턱을 만든다 — 가까운 두 덩이의 흐림이 겹치는 자리가 한 덩이가 된다 */}
            <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur" />
            <feColorMatrix
              in="blur"
              type="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -9"
              result="goo"
            />
            {/* 원래 모양은 또렷하게 얹는다 — 끈끈이는 사이를 잇는 데만 */}
            <feComposite in="SourceGraphic" in2="goo" operator="atop" />
          </filter>
        </defs>
        <g ref={gooRef}>
          <rect ref={oldRef} className="tab-pill tab-pill-old" rx="12" />
          <circle ref={dropRef} className="tab-pill tab-pill-drop" r={PILL_DROP} />
          <rect ref={pillRef} className="tab-pill" rx="12" style={{ opacity: 0 }} />
        </g>
      </svg>
      {/* 사이 40(사용자 지시 — 프레임의 34 는 좁다). 360 아래에서는 좁혀 — 못 박으면 320 폭에서 「커뮤니티」가 두 줄로 접힌다(감수 지적) */}
      <ul className="flex h-full items-center justify-center gap-10 px-1 max-[359px]:gap-6">
        {navItems.map((item) => {
          const active = here === item.href;
          return (
            <li key={item.id}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className="tap flex flex-col items-center justify-center gap-1"
              >
                <span
                  data-nav-cart={item.id === "cart" ? "" : undefined}
                  className="relative flex size-[30px] items-center justify-center"
                >
                  {item.id === "cart" ? (
                    // 봉투는 받는 움직임이 있는 그림(NavBag) — 담으면 기울여 받았다 튀어 오른다
                    <NavBag key={`icon-${pulse}`} className={pulse ? "bag-catch" : undefined} />
                  ) : (
                    <>
                      <Img
                        src={item.icon}
                        style={{ width: item.w, height: item.h }}
                        className="nav-icon-off"
                      />
                      <Img
                        src={item.iconOn}
                        style={{ width: item.w, height: item.h }}
                        className="nav-icon-on absolute inset-0 m-auto"
                      />
                    </>
                  )}
                  {/*
                    담은 개수 — 봉투(22, 30 자리 안 4~26) 오른쪽 위 모서리에 걸친다.
                    아홉을 넘으면 「9+」— 두 자리는 16px 원에 안 들어간다.
                  */}
                  {item.id === "cart" && count > 0 ? (
                    <span
                      key={`badge-${pulse}`}
                      aria-label={fridge.badge(count)}
                      className={`absolute -top-[2px] -right-[3px] flex h-4 min-w-4 items-center justify-center rounded-full bg-[#ff5e00] px-1 text-[10px] leading-none font-bold text-white ${
                        pulse ? "cart-badge-pop" : ""
                      }`}
                    >
                      {count > 9 ? "9+" : count}
                    </span>
                  ) : null}
                </span>
                {/* 색은 판과 같은 박자로 바뀐다(.tab-label) — 굵기만 바로 */}
                <span
                  className={`tab-label text-center text-xs leading-none whitespace-nowrap ${
                    active ? "font-medium" : "font-normal"
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
