"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import Img from "@/components/common/Img";
import CartToggle from "@/components/home/CartToggle";
import CoffeeSteam from "@/components/home/CoffeeSteam";
import CupLid from "@/components/home/CupLid";
import MilkSpout from "@/components/home/MilkSpout";
import SnackTear from "@/components/home/SnackTear";
import InterestSheet from "@/components/my/InterestSheet";
import { categoryChip, CATEGORY_CHIP_FALLBACK } from "@/data/common/community";
import { today } from "@/data/common/home";
import { getKnowledge } from "@/data/common/knowledge";
import { topicIconOf } from "@/data/common/menu";
import { useNameFill } from "@/hooks/usePersona";
import { getSurvey, getSurveyServerSnapshot, subscribeSurvey } from "@/state/surveyStore";
import type { ProductPick, ProductSet } from "@/types/home";

/**
 * ○○ 님을 위한 오늘의 상품 — Figma 856:7939.
 *
 * 이름은 고른 퍼소나의 것이 들어간다(`useNameFill`). 아무도 안 골랐으면
 * 프레임에 적혀 있던 「길동」 그대로다.
 *
 * 관심 태그는 설문에서 고른 분야(surveyStore)다 — 김민정은 문화 · 생활, 한상현은
 * 역사 · 사회로 시작하고, MY 의 관심 카테고리에서 고치면 여기도 바뀐다. 상품을
 * 누르면 그 상품만 컬러로 켜지고 나머지는 회색으로 내려가며, 진열대 아래 추천
 * 지식 줄도 그 상품 것으로 바뀐다 — 856:8320 / 856:8341 이 그 바뀐 상태다.
 */
/**
 * 눌린 상품이 한 번 들썩인다.
 *
 * 10px 뛰었다 내려앉고 3px 더 작게 한 번 더 튄다 — 한 번만 오르내리면 「밀렸다」
 * 로 보이고, 두 마디가 있어야 가벼운 것이 통 하고 놓인 느낌이 난다.
 *
 * CSS 클래스가 아니라 여기서 직접 거는 것은 **같은 것을 다시 눌렀을 때도 뛰어야**
 * 하기 때문이다. 클래스는 이미 붙어 있으면 다시 붙여도 처음부터 돌지 않아서,
 * 두 번째 누름부터는 아무 일도 일어나지 않는다. `animate` 는 부를 때마다 새로
 * 시작하므로 그 문제가 없다.
 *
 * 앞서 걸어 둔 것은 걷어낸다. 안 그러면 연달아 누를 때 여러 개가 겹쳐 돌아
 * 상품이 부들부들 떤다.
 */
function hop(el: HTMLElement) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  for (const running of el.getAnimations()) running.cancel();

  el.animate(
    [
      { transform: "translateY(0)" },
      { transform: "translateY(-10px)", offset: 0.32 },
      { transform: "translateY(0)", offset: 0.58 },
      { transform: "translateY(-3px)", offset: 0.78 },
      { transform: "translateY(0)" },
    ],
    { duration: 420, easing: "cubic-bezier(0.33, 1, 0.68, 1)" },
  );
}

/** 상품 사이 간격 — 856:7957 */
const GAP = 13;

/** 추천 카드를 이만큼(px) 넘게 옆으로 밀어야 넘긴다 — 살짝 스친 것은 누른 것이다 */
const SWIPE_AT = 40;

/**
 * 진열대의 기준 폭과 높이 — 다섯 세트 중 가장 넓은 줄(초콜릿 103 × 3 + 간격 둘 =
 * 335)과 가장 큰 그림(123).
 *
 * 폭이 모자라면(375 · 320) 이 줄이 들어갈 만큼 다섯 세트를 **같은 배율**로
 * 줄인다 — 상품 폭 · 간격을 이 폭에 대한 비율로 적어, 세트마다 크기가 달라도
 * 서로의 비는 프레임 그대로다. 높이는 가장 큰 그림에 맞춰 고정이라 태그를
 * 넘겨도 아래 추천 줄이 오르내리지 않고, 상품은 바닥에 맞춰 놓인다.
 */
const SHELF = {
  w: Math.max(
    ...today.sets.map((one) => one.size.w * one.products.length + GAP * (one.products.length - 1)),
  ),
  h: Math.max(...today.sets.map((one) => one.size.h)),
};

/** 기준 폭에 대한 비율 — 진열대가 줄면 같이 준다. */
const pct = (px: number) => `${(px / SHELF.w) * 100}%`;

export default function RecommendSection() {
  const survey = useSyncExternalStore(subscribeSurvey, getSurvey, getSurveyServerSnapshot);
  /**
   * 놓이는 진열대 — 설문에서 고른 분야 것만, 고른 차례대로. 하나도 없으면(MY 에서
   * 다 껐을 때) 진열대를 비울 수는 없어 첫 세트(역사)를 보인다.
   */
  const shown = survey.interests
    .map((id) => today.sets.find((one) => one.id === id))
    .filter((one): one is ProductSet => Boolean(one));
  const sets = shown.length ? shown : [today.sets[0]];
  /**
   * 켜진 관심 태그와 그 진열대에서 고른 상품 — 관심사를 고쳐 그 태그가 사라지면
   * 첫 태그 · 첫 상품으로 돌아간다.
   */
  const [tabId, setTabId] = useState<string | null>(null);
  /** `from` 은 카드를 밀어서 고른 때만 — 카드가 어느 쪽에서 들어올지(아래 swipe) */
  const [picked, setPicked] = useState<{ set: string; index: number; from?: "left" | "right" }>({
    set: "",
    index: 0,
  });
  /** 관심 카테고리 수정 판이 열려 있는지 — 태그 옆 「+」 */
  const [editing, setEditing] = useState(false);
  const fill = useNameFill();
  const set = sets.find((one) => one.id === tabId) ?? sets[0];
  const index = picked.set === set.id ? picked.index : 0;
  const pick = set.products[index].pick;

  /*
    추천 카드 갈아 끼우기 — 새 카드가 옆에서 미끄러져 들어오고 헌 카드는 반대쪽으로
    나간다(사용자 요청 — 「띡 하고 바뀌지 말고」). 오른쪽 상품으로 옮기면 오른쪽에서
    들어오고, 왼쪽이면 왼쪽에서. 태그를 바꾸면 오른쪽에서.

    지금 보이는 카드와 나가는 카드를 상태로 들고 있다 — 그려지는 도중에 고른 것이
    달라졌으면 그 자리에서 바꿔 끼운다(React 의 「그리면서 상태 맞추기」). 처음
    그릴 때는 미끄러지지 않는다(from 없음).
  */
  const [slide, setSlide] = useState<{
    set: string;
    index: number;
    pick: ProductPick;
    from: "left" | "right" | null;
    prev: ProductPick | null;
  }>({ set: set.id, index, pick, from: null, prev: null });
  /*
    카드를 옆으로 밀어서 넘기기(사용자 지시) — 왼쪽으로 밀면 다음 상품, 오른쪽이면
    이전 상품. 상품을 누른 것과 같은 상태(picked)를 바꾸므로 위의 진열대도 같이
    켜지고, 새로 켜진 상품은 누른 것처럼 한 번 들썩인다(hop). 끝에서는 처음으로
    돈다 — 그때 카드는 순번이 아니라 민 방향에서 들어와야 하므로(2 → 0 은 순번으로는
    「왼쪽」) 민 방향을 picked.from 에 같이 적어 그것을 앞세운다. 그리는 중에 읽는
    값이라 ref 가 아니라 상태에 둔다(react-hooks/refs).

    40 넘게, 세로보다 가로로 더 움직였을 때만 넘긴다 — 세로는 페이지 스크롤이다
    (touch-action: pan-y). 민 뒤에 오는 클릭은 삼킨다(swiped) — 안 그러면 밀었을
    뿐인데 카드를 덮은 링크가 눌려 상세로 간다.
  */
  const swipeStart = useRef<{ x: number; y: number } | null>(null);
  const swiped = useRef(false);
  const shelf = useRef<HTMLDivElement>(null);
  const swipe = {
    onPointerDown: (event: React.PointerEvent<HTMLDivElement>) => {
      swipeStart.current = { x: event.clientX, y: event.clientY };
      swiped.current = false;
    },
    onPointerUp: (event: React.PointerEvent<HTMLDivElement>) => {
      const start = swipeStart.current;
      swipeStart.current = null;
      if (!start) return;
      const dx = event.clientX - start.x;
      const dy = event.clientY - start.y;
      if (Math.abs(dx) < SWIPE_AT || Math.abs(dx) < Math.abs(dy)) return;
      swiped.current = true;
      const count = set.products.length;
      const next = (index + (dx < 0 ? 1 : count - 1)) % count;
      setPicked({ set: set.id, index: next, from: dx < 0 ? "right" : "left" });
      const target = shelf.current?.querySelectorAll<HTMLElement>("button")[next];
      if (target) hop(target);
    },
    onPointerCancel: () => {
      swipeStart.current = null;
    },
    // 카드를 덮은 링크 · 안의 그림은 브라우저가 제 끌기(집어 옮기기)를 먼저 시작해
    // 포인터를 끊어 버린다(pointercancel) — useDragScroll 과 같은 까닭으로 막는다
    onDragStart: (event: React.DragEvent<HTMLDivElement>) => event.preventDefault(),
    onClickCapture: (event: React.MouseEvent<HTMLDivElement>) => {
      if (!swiped.current) return;
      swiped.current = false;
      event.preventDefault();
      event.stopPropagation();
    },
  };

  if (slide.pick.id !== pick.id) {
    const from =
      (picked.set === set.id && picked.index === index ? picked.from : undefined) ??
      (slide.set === set.id && index < slide.index ? "left" : "right");
    setSlide({ set: set.id, index, pick, from, prev: slide.pick });
  }
  // 헌 카드는 다 나간 뒤(pick-out 320ms) 치운다 — 시계로 센다. animationend 는 화면이 가려져 있으면 안 온다
  useEffect(() => {
    if (!slide.prev) return;
    const timer = window.setTimeout(() => setSlide((was) => ({ ...was, prev: null })), 360);
    return () => window.clearTimeout(timer);
  }, [slide.prev]);

  return (
    <section className="mx-6 flex shrink-0 flex-col gap-[30px]">
      <div className="flex flex-col gap-1 whitespace-nowrap">
        <h2 className="text-[22px] leading-[1.3] font-semibold text-ink">{fill(today.title)}</h2>
        <p className="text-sm leading-[1.3] text-gray-500">{today.sub}</p>
      </div>

      <div className="flex w-full flex-col gap-[30px]">
        {/* 관심 태그 — 1727:3992 · 1727:4053. 설문에서 고른 분야만. 누르면 그 진열대로 바뀌고 첫 상품이 켜진다 */}
        <div className="flex w-full items-center gap-[10px]">
          <div className="flex items-center gap-[10px]">
            {sets.map((one) => {
              const on = one.id === set.id;
              return (
                <button
                  key={one.id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => {
                    setTabId(one.id);
                    setPicked({ set: one.id, index: 0 });
                  }}
                  style={on ? { backgroundColor: one.color } : undefined}
                  className={`tap [--tap-w:0px] flex items-start rounded-[20px] px-[14px] py-1 text-[13px] leading-[1.4] tracking-[-0.26px] whitespace-nowrap transition-colors ${
                    on
                      ? "font-semibold text-white"
                      : "border border-[#ebebeb] bg-white font-normal text-text-off"
                  }`}
                >
                  {one.label}
                </button>
              );
            })}
          </div>

          <div className="flex w-[212px] items-center gap-[10px]">
            <Img src="/assets/home/rule-line.svg" className="h-px w-[173px]" />
            {/*
              관심사를 고치는 자리 — 그 자리에서 아래로 판이 올라온다(InterestSheet).

              전에는 MY 의 「관심 카테고리」 탭으로 보냈는데(openMyTab), 태그 하나
              바꾸려고 화면을 옮겼다가 돌아오는 것이 번거로웠다(사용자 지시). MY 의
              수정 판과 같은 것을 여기서 띄우고, 고르는 대로 위의 태그 · 진열대가
              바로 바뀐다(surveyStore). 링크가 아니라 단추다 — 이제 어디로도 안 간다.
            */}
            <button
              type="button"
              aria-label="관심 카테고리 수정"
              aria-haspopup="dialog"
              aria-expanded={editing}
              onClick={() => setEditing(true)}
              className="tap flex size-[30px] items-center justify-center rounded-[50px] border border-[#ebebeb] bg-white transition-opacity active:opacity-55"
            >
              <Img src="/assets/home/plus.svg" className="size-3" />
            </button>
          </div>
        </div>

        <InterestSheet open={editing} onClose={() => setEditing(false)} />

        <div className="flex w-full flex-col items-center gap-5">
          {/* 진열된 상품 — 856:7957. 그림 크기는 세트마다 다르고(size), 폭이 모자라면 다 같은 배율로 준다(SHELF) */}
          <div
            ref={shelf}
            className="flex w-full items-end justify-center"
            style={{ maxWidth: SHELF.w, aspectRatio: `${SHELF.w} / ${SHELF.h}`, gap: pct(GAP) }}
          >
            {set.products.map((product, i) => {
              const on = i === index;
              return (
                <button
                  key={product.id}
                  type="button"
                  aria-pressed={on}
                  aria-label={product.label}
                  onClick={(event) => {
                    setPicked({ set: set.id, index: i });
                    hop(event.currentTarget);
                  }}
                  style={{ width: pct(set.size.w) }}
                  className="relative flex"
                >
                  <Img
                    src={on ? product.artOn : product.art}
                    style={{ aspectRatio: `${set.size.w} / ${set.size.h}` }}
                    // 고른 초콜릿은 오른쪽 위를 한 입 베어 문다(globals.css .bite) — 그림 파일은 그대로, 마스크로 오려 낸다.
                    // 우유는 지붕을(.milk-body) MilkSpout 가, 컵라면은 입구를(.cup-body) CupLid 가, 과자 봉지는 윗띠를(.snack-body) SnackTear 가 가리고 그 자리에 여닫히는 것을 덧그린다
                    className={`h-auto w-full object-contain ${on && set.bite ? "bite" : ""} ${set.spout ? "milk-body" : ""} ${set.lid ? "cup-body" : ""} ${set.tear ? "snack-body" : ""}`}
                  />
                  {set.spout ? <MilkSpout on={on} /> : null}
                  {set.lid ? <CupLid on={on} /> : null}
                  {set.tear ? <SnackTear on={on} /> : null}
                  {/* 고른 커피는 김이 오른다 — 테 위 빈자리라 그림은 안 가린다 */}
                  {on && set.steam ? <CoffeeSteam /> : null}
                </button>
              );
            })}
          </div>

          {/* 헌 카드는 위에 겹쳐 반대쪽으로 나가고, 다 나가면 치운다. 옆으로 밀면 넘어간다(swipe) */}
          <div {...swipe} className="relative w-full touch-pan-y overflow-hidden">
            {slide.prev ? (
              <div
                key={slide.prev.id}
                data-from={slide.from}
                className="pick-out pointer-events-none absolute inset-0"
                aria-hidden
              >
                <PickRow pick={slide.prev} />
              </div>
            ) : null}
            <div key={slide.pick.id} data-from={slide.from} className={slide.from ? "pick-in" : ""}>
              <PickRow pick={slide.pick} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * 추천 지식 한 줄 — 856:7961 / 856:8320 / 856:8341.
 *
 * 장바구니가 그 안의 단추라서 줄 전체는 button 이 아니다 — 단추 안에 단추는
 * 넣을 수 없다. 대신 줄 전체를 덮는 투명한 링크가 그 지식의 카드뉴스 상세로
 * 간다(분야 목록의 지식 한 장과 같은 방식). 담기 단추만 그 위에 올려 따로 눌린다.
 * 담기는 `home-pick-<지식 id>` 로 담겨 같은 지식으로 읽힌다.
 *
 * 갈래 칩은 그 갈래의 색 계열(연한 바탕 · 진한 글씨) — 커뮤니티 카드 · 알래봇과
 * 같은 표(categoryChip)를 본다. 「역사 · 세계사」처럼 두 마디면 앞마디(큰 갈래)가
 * 색을 정한다(냉장고의 tagColor 와 같은 규칙). 전에는 갈래와 상관없이 파랑이었다
 * (감수 지적).
 *
 * 검은 상자 안 그림은 지식 목록과 같은 표(topicIconOf) — 지식의 분야 · 소분류가
 * 정한다. 전에는 카드마다 그림 이름을 따로 적어 목록과 어긋났다(감수 지적).
 */
function PickRow({ pick }: { pick: ProductPick }) {
  const post = getKnowledge(pick.id);
  const icon = topicIconOf(post?.category ?? pick.tag.split(" · ")[0], post?.topic);
  const chip = categoryChip[pick.tag.split(" · ")[0]] ?? CATEGORY_CHIP_FALLBACK;

  return (
    <div className="relative flex h-[90px] w-full flex-col justify-center rounded-lg border border-[#ebebeb] bg-white px-5 py-[10px] text-left">
      <Link
        href={`/menu/knowledge/${pick.id}`}
        aria-label={pick.title}
        className="absolute inset-0 rounded-lg transition-opacity active:opacity-60"
      />

      <div className="pointer-events-none relative flex w-full items-end gap-[10px]">
        <div className="flex size-[60px] shrink-0 items-center justify-center overflow-hidden rounded-[4.286px] bg-[#101010]">
          <Img
            src={icon.src}
            style={{ width: icon.width, height: icon.height }}
            className="object-contain"
          />
        </div>

        <div className="flex w-[243px] flex-col gap-5">
          <div className="flex w-full items-center justify-between">
            <span className="text-sm leading-[1.2] font-medium text-black">{pick.title}</span>
            <Img src="/assets/home/chevron-12.svg" className="h-3 w-[6px]" />
          </div>
          <div className="flex items-center gap-[10px]">
            <span
              className={`flex items-center justify-center rounded-[50px] px-2 py-1 text-xs leading-[1.2] font-medium ${chip}`}
            >
              {pick.tag}
            </span>
            <span className="pointer-events-auto flex">
              <CartToggle
                id={`home-pick-${pick.id}`}
                off="/assets/home/bag-15.svg"
                on="/assets/home/bag-15-on.svg"
                className="h-[15px] w-[15.035px]"
              />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
