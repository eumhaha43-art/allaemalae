"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import Img from "@/components/common/Img";
import FreeClock from "@/components/home/FreeClock";
import { free } from "@/data/common/home";

/**
 * 24시간 한정 지식 — Figma 856:8030.
 *
 * 화면 폭을 꽉 채우는 검은 띠라, 좌우 24px 여백을 두는 다른 섹션과 달리
 * 자기 안에서 여백을 잡는다.
 *
 * 옆 시계 바늘도 같은 1초 박자로 돈다.
 *
 * 남은 시간은 진짜 오늘 자정까지다 — 「오늘 밤 12시까지 무료」 문구와 맞춘다.
 * 서버는 지금 몇 시인지 알아도 브라우저와 시각이 다를 수 있어, 서버 몫으로는
 * 프레임에 적힌 값을 내주고 브라우저가 이어받아 진짜 시간으로 바꾼다 —
 * useSyncExternalStore 가 그 교체를 경고 없이 처리해 준다.
 *
 * 분홍은 이 파일의 스타일가이드가 Pink/500 #ff92c5, Pink/200 #ffe4f1 로
 * 잡고 있는데 globals.css 의 토큰(#f8a5c2 / #feedf3)과 달라 값을 직접 쓴다.
 *
 * 남은 시간과 시계 바늘은 같은 것을 가리키므로 색도 같은 빨강이다. 팔레트의
 * 빨강(--color-live #cc1515)은 이 검은 띠 위에서 2.76:1 밖에 안 나와 글씨로
 * 쓰기 어두워, 같은 계열로 밝힌 값을 쓴다. 큰 글씨는 시간과 헷갈리지 않게
 * 흰색으로 뺀다.
 */

/** 남은 시간 · 시계 바늘 — 검은 띠 위에서 4.81:1. */
export const URGENT = "#ff4d4d";

/** "08:41:05" → 초. 서버가 그리는 첫 화면에만 쓴다. */
function toSeconds(clock: string): number {
  const [h, m, s] = clock.split(":").map(Number);
  return h * 3600 + m * 60 + s;
}

/** 오늘 자정까지 남은 초. */
function toMidnight(): number {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  return Math.max(0, Math.round((midnight.getTime() - now.getTime()) / 1000));
}

/**
 * 1초마다 남은 시간을 알려 준다.
 *
 * 값을 캐싱하는 이유: getSnapshot 은 한 번 그릴 때 여러 번 불릴 수 있는데,
 * 그때마다 새로 재면 값이 흔들려 다시 그리기가 멈추지 않는다.
 */
let left = 0;
let ticking = 0;
const listeners = new Set<() => void>();

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  if (listeners.size === 1) {
    left = toMidnight();
    ticking = window.setInterval(() => {
      left = toMidnight();
      listeners.forEach((notify) => notify());
    }, 1000);
  }
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) window.clearInterval(ticking);
  };
}

function getSnapshot(): number {
  if (left === 0) left = toMidnight();
  return left;
}

const getServerSnapshot = () => toSeconds(free.remaining);

/** 초 → "08:41:05". */
/**
 * 「12시간 55분 03초」 — 전에는 12:55:03 뒤에 「초 남음」이 붙어 시:분:초를 초라고
 * 읽었다(감수 지적). 한 시간 아래로 내려가면 시간 자리는 뺀다.
 */
function toClock(total: number): string {
  const pad = (value: number) => String(value).padStart(2, "0");
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor(total / 60) % 60;
  const seconds = total % 60;
  return hours > 0
    ? `${hours}시간 ${pad(minutes)}분 ${pad(seconds)}초`
    : `${minutes}분 ${pad(seconds)}초`;
}

export default function FreeBox() {
  const remaining = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  return (
    <section className="flex h-[180px] w-full shrink-0 flex-col items-center justify-center overflow-hidden bg-gray-900 px-6 py-5">
      <div className="flex w-full flex-col gap-[10px]">
        <p className="text-xs leading-[1.3] font-medium text-blue-100">{free.label}</p>

        {/*
          시계와 「지금 읽기」가 오른쪽 한 칸을 나눠 쓰도록 격자로 놓는다.
          둘을 각자 줄의 오른쪽 끝에 붙이면 폭이 달라(50 대 95) 중심이 23px
          어긋나 시계만 오른쪽으로 튀어나와 보였다. 칸 폭은 둘 중 넓은 쪽
          (단추)이 정하고, 시계는 그 안에서 가운데로 온다.
        */}
        <div className="grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-x-[10px] gap-y-5">
          <h2 className="flex flex-col text-[22px] leading-[1.3] font-semibold text-white">
            {free.title.map((line) => (
              <span key={line}>{line}</span>
            ))}
          </h2>
          {/*
            자정까지 남은 초에서 벽시계 초를 되짚는다 — 남은 시간이 1초씩
            줄어드니 60 에서 빼면 실제 초가 된다. 따로 시각을 읽지 않아
            서버가 그린 화면과도 어긋나지 않는다.
          */}
          <div className="justify-self-center">
            <FreeClock seconds={(60 - (remaining % 60)) % 60} color={URGENT} />
          </div>

          <p className="flex items-center gap-[5px] leading-[1.3] font-semibold whitespace-nowrap">
            <time
              dateTime={`PT${remaining}S`}
              style={{ color: URGENT }}
              className="text-base tabular-nums"
              aria-label="무료 열람 남은 시간"
            >
              {toClock(remaining)}
            </time>
            <span className="text-base text-white">{free.unit}</span>
          </p>

          {/* 지금 읽기 — 그 지식의 카드뉴스 상세로. 홈의 지식은 전부 실제 상세가 있는 것이다(사용자 결정) */}
          <Link
            href={`/menu/knowledge/${free.id}`}
            className="tap flex items-center gap-[10px] rounded-full bg-[#ffe4f1] px-[18px] py-2 transition-opacity active:opacity-70"
          >
            <span className="text-xs leading-[1.3] text-gray-900">{free.cta}</span>
            <Img src="/assets/home/chevron-10.svg" className="h-[10px] w-[5px]" />
          </Link>
        </div>
      </div>
    </section>
  );
}
