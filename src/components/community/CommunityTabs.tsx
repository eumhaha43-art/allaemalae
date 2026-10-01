"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Img from "@/components/common/Img";
import { skyBackground, useChatSky } from "@/hooks/useNightChrome";
import { tabs } from "@/data/common/community";

import {
  PILL_OFF,
  PILL_ON,
  PILL_ROW,
  PILL_TAB,
} from "@/components/common/pillTabs";

/**
 * 커뮤니티 탭 — Figma 856:5247 의 알약 줄에, 고른 칸만 점원이 든 상자(1943:4518).
 *
 * 줄은 전과 같다 — 회색 판 위에 넷이 나란히, 고른 칸만 초록 알약(80 고정). 그
 * 초록 칸이 곧 상자다: 뚜껑이 젖혀져 있고 점원이 그 뒤에서 두 팔로 안고 있으며
 * 손가락만 상자 아래 모서리를 잡는다. 안 고른 칸은 전처럼 글자만이다(사용자
 * 결정 — 칸마다 상자를 두니 서로 떨어져 보였다).
 *
 * 다른 탭을 누르면 점원이 그 칸으로 **덜컥** 옮겨 앉고(미끄러지지 않는다) 한 박자
 * (JOLT_MS) 뒤 그 화면으로 간다 — 탭은 화면마다 새로 그려지므로 도착한 화면은
 * 처음부터 그 칸에 점원을 그려 이어져 보인다.
 *
 * 점원은 상자 앞뒤에 걸쳐 있어 두 겹으로 그린다 — 머리 · 몸 · 팔은 초록 알약
 * 뒤에, 판 양옆을 잡은 손(과 그 위의 흰 줄)은 앞에. 그림 좌표는 시안 프레임
 * (108 × 108)의 것이고 그 판(75 × 38, (16, 68))을 알약(80 × 38)에 맞춰 놓는다 —
 * 판 끝에 붙는 손 · 흰 줄만 알약 끝(14 · 94)으로 옮긴다.
 */

/** 덜컥 앉는 시간 — 그 뒤에 화면이 바뀐다. */
const JOLT_MS = 220;

// 생김새는 공용, 폭은 이 화면 것 — 고른 칸만 80 으로 고정한다.
const TAB = PILL_TAB;
const OFF = `min-w-px flex-1 ${PILL_OFF}`;

export default function CommunityTabs() {
  const pathname = usePathname();
  const router = useRouter();
  // 채팅방 홈의 테이블 화면에서는 아래 장면(밤 · 낮)과 이어지도록 같은 색으로 그린다.
  const sky = useChatSky();
  const night = sky === "night";

  // Longest matching route wins, so /community/chat/<room> keeps 채팅방 lit
  // rather than falling back to 게시글 at /community.
  const current = tabs
    .map((tab) => tab.href)
    .filter((href): href is string => Boolean(href))
    .filter((href) => pathname === href || pathname.startsWith(`${href}/`))
    .sort((a, b) => b.length - a.length)[0];
  const activeIndex = Math.max(
    0,
    tabs.findIndex((tab) => tab.href === current),
  );

  /** 옮겨 가는 중이면 그 목적지 — 점원과 초록 칸이 이쪽을 본다. */
  const [going, setGoing] = useState<number | null>(null);
  const timer = useRef<number | null>(null);
  useEffect(
    () => () => {
      if (timer.current !== null) window.clearTimeout(timer.current);
    },
    [],
  );

  const shownIndex = going ?? activeIndex;

  const go = (index: number, href: string) => {
    if (index === activeIndex || going !== null) return;
    setGoing(index);
    timer.current = window.setTimeout(() => router.push(href), JOLT_MS);
  };

  /** 점원 겹 — 알약 가운데에 시안 프레임(108)을 맞추고, 판 바닥을 알약 바닥에. */
  const clerkLayer = `tab-clerk pointer-events-none absolute -bottom-[2.2px] left-1/2 h-[108px] w-[108px] ${
    going !== null ? "tab-clerk-jolt" : ""
  }`;

  return (
    // 헤더(60px) 바로 아래에 붙어 같이 떠 있는다 — 스크롤해도 탭은 남는다.
    // 위 여백은 점원 머리가 헤더 바로 밑에 닿을 만큼(사이 0) — 점원을 0.7 배로 줄이며 76 → 64 → 44(사용자 지시). 맨 처음엔 20.
    <div
      className={`sticky top-[60px] z-10 flex w-full shrink-0 px-6 pt-[44px] pb-5 ${skyBackground(sky)}`}
    >
      <div
        role="tablist"
        className={`${PILL_ROW} min-w-px flex-1 ${
          night ? "bg-white/10" : sky === "day" ? "bg-white/55" : "bg-gray-100"
        }`}
      >
        {tabs.map((tab, index) => {
          const active = index === activeIndex;
          const held = index === shownIndex;
          const off = `${OFF} ${night ? "text-white/55" : "text-tab-off"}`;
          const className = held
            ? "relative w-[80px] shrink-0"
            : `${TAB} ${off}`;

          /*
            고른 칸 — 상자. 알약 바탕(z-10)이 판이고, 그 뒤에 점원(z-0), 앞에
            손가락(z-20). 뚜껑 두 조각은 판 끝에서 8 바깥 · 23 위, 20.5° 기울어져
            위로 젖혀진다(시안 208 · 209).
          */
          const box = (
            <>
              {/*
                점원을 0.7 배로(사용자 지시 — 반은 너무 작았다) — 알약 윗선(68/108)을 축으로 줄여 상자 위에
                그대로 앉는다. 축소는 판이 아니라 안쪽 상자에 건다 — 판의 translateX(-50%)
                와 겹치면 이동량까지 반이 되어 오른쪽으로 밀린다. 손은 줄이지 않는다 — 디자이너가
                새로 그린 손(2070:3829 · 3830)이 알약 양끝을 그대로 잡는다(아래).
              */}
              <span aria-hidden className={`${clerkLayer} z-0`}>
                <span className="absolute inset-0 scale-[0.7] [transform-origin:50%_63%]">
                  <Img
                    src="/assets/community/tab/clerk.svg"
                    className="absolute h-[55.54px] w-[72px] max-w-none"
                    style={{ left: 17, top: 13.74 }}
                  />
                  <Img
                    src="/assets/community/tab/clerk-eye.svg"
                    className="clerk-blink absolute size-[5.26px] max-w-none"
                    style={{ left: 40.23, top: 25.59 }}
                  />
                  <Img
                    src="/assets/community/tab/clerk-eye.svg"
                    className="clerk-blink absolute size-[5.26px] max-w-none"
                    style={{ left: 59.14, top: 25.59 }}
                  />
                  <Img
                    src="/assets/community/tab/clerk-mouth.svg"
                    className="absolute h-[6.15px] w-[12.27px] max-w-none"
                    style={{ left: 46.15, top: 37.14 }}
                  />
                  <Img
                    src="/assets/community/tab/clerk-hat.svg"
                    className="absolute h-[19.43px] w-[55.64px] max-w-none"
                    style={{ left: 17.51, top: -0.5 }}
                  />
                </span>
              </span>

              <span
                aria-hidden
                className="absolute -top-[23.2px] -left-[8px] z-10 flex h-[28.2px] w-[13.4px] items-center justify-center"
              >
                <span className="block h-[27.8px] w-[5.05px] -rotate-[20.53deg] -skew-x-[2.37deg] rounded-t-[2px] bg-primary-600" />
              </span>
              <span
                aria-hidden
                className="absolute -top-[23.2px] -right-[8px] z-10 flex h-[28.2px] w-[13.4px] items-center justify-center"
              >
                <span className="block h-[27.8px] w-[5.05px] rotate-[20.53deg] skew-x-[2.37deg] rounded-t-[2px] bg-primary-600" />
              </span>

              <span className={`${TAB} relative z-10 w-full ${PILL_ON}`}>
                {tab.label}
              </span>

              {/*
                손 — 디자이너가 새로 그린 왼손 · 오른손(2070:3829 · 2070:3830, 11 × 16, 흰 줄
                하이라이트 포함). 예시대로 흰 줄이 알약 끝(14 · 94)에 서고 손은 안쪽을 잡는다.
                세로는 알약 가운데(68 + 38/2 = 87). 몸은 0.7 배지만 손은 원래 크기 — 상자를
                잡는 자리가 우선이다(사용자 지시). 전의 손가락 그림(finger-*.svg)은 안 쓴다.
              */}
              <span aria-hidden className={`${clerkLayer} z-20`}>
                <Img
                  src="/assets/community/tab/hand-left.svg"
                  className="absolute h-[15.9px] w-[10.86px] max-w-none"
                  style={{ left: 14, top: 79.05 }}
                />
                <Img
                  src="/assets/community/tab/hand-right.svg"
                  className="absolute h-[15.9px] w-[10.86px] max-w-none"
                  style={{ left: 83.14, top: 79.05 }}
                />
              </span>
            </>
          );

          // 나의 활동은 아직 화면이 없어 눌러도 넘어가지 않는다.
          return tab.href ? (
            <Link
              key={tab.id}
              href={tab.href}
              role="tab"
              aria-selected={active}
              onClick={(event) => {
                // 점원이 먼저 옮겨 앉고, 한 박자 뒤 화면이 바뀐다
                event.preventDefault();
                go(index, tab.href!);
              }}
              className={className}
            >
              {held ? box : tab.label}
            </Link>
          ) : (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={false}
              className={className}
            >
              {held ? box : tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
