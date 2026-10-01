"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import Img from "@/components/common/Img";
import { categoryColors, recent } from "@/data/common/community";
import { shelfKnowledge } from "@/data/common/knowledge";
import { fieldCategory, fields } from "@/data/common/menu";
import { stats, type StatsPeriod } from "@/data/common/my";
import { monthly } from "@/data/common/record";
import {
  dayKey,
  getArchiveServerSnapshot,
  getArchiveSnapshot,
  subscribeArchive,
} from "@/state/archiveStore";
import type { SavedRecord } from "@/types/record";

/** 영수증 줄의 제목 → 그 지식의 갈래(메뉴 이름). 못 찾으면 「기타」. */
function fieldOfTitle(title: string): string {
  const post = [...shelfKnowledge, ...recent.posts].find((one) => one.title === title);
  if (!post) return "기타";
  return fields.find((f) => fieldCategory[f.id] === post.category)?.name ?? post.category;
}

/** 「2026년 9월 3주」 — 주간지식(WeeklyBars)과 같은 셈법: 그 주 일요일이 그 달의 몇째 주인지. */
function weekLabel(sunday: Date): string {
  const first = new Date(sunday.getFullYear(), sunday.getMonth(), 1);
  const week = Math.floor((sunday.getDate() + first.getDay() - 1) / 7) + 1;
  return `${sunday.getFullYear()}년 ${sunday.getMonth() + 1}월 ${week}주`;
}

/** 이 주 안에 든 기록으로 한 기간을 만든다 — 일요일 시작. */
function weekOf(records: SavedRecord[], sunday: Date): StatsPeriod {
  const bars: [string, number][] = monthly.weekdays.map((name) => [name, 0]);
  const byField = new Map<string, number>();
  let receipts = 0;
  const days = new Set<string>();
  for (const one of records) {
    const at = new Date(one.issued);
    const offset = Math.floor((at.getTime() - sunday.getTime()) / 86_400_000);
    if (offset < 0 || offset > 6) continue;
    receipts += 1;
    days.add(dayKey(at));
    bars[at.getDay()][1] += one.lines.length;
    for (const line of one.lines) {
      const field = fieldOfTitle(line.title);
      byField.set(field, (byField.get(field) ?? 0) + 1);
    }
  }
  const collected = bars.reduce((sum, [, n]) => sum + n, 0);
  const sorted = [...byField.entries()].sort((a, b) => b[1] - a[1]);
  return {
    label: weekLabel(sunday),
    summary: [collected, receipts, days.size],
    bars,
    fields: sorted.length ? sorted : [["기타", 0]],
  };
}

/** 이번 주까지 네 주 — 오래된 것부터. 주간지식과 같은 보관함(archiveStore)에서 센다. */
function weeklyPeriods(records: SavedRecord[], now: Date): StatsPeriod[] {
  const thisSunday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  thisSunday.setDate(thisSunday.getDate() - thisSunday.getDay());
  return [3, 2, 1, 0].map((back) => {
    const sunday = new Date(thisSunday);
    sunday.setDate(thisSunday.getDate() - back * 7);
    return weekOf(records, sunday);
  });
}

/**
 * 통계 탭 — Figma 1288:6846.
 *
 * 위에 주간 · 연간 스위치와 기간 화살표, 그 아래 카드 셋 — 숫자 셋(수집한
 * 지식 · 발급한 영수증 · 출석한 날), 요일(달)별 막대, 분야별 막대. 막대는 가장
 * 큰 칸만 초록으로 켠다 — 그림이 그렇고, 다 칠하면 어디를 봐야 할지 모른다.
 * 분야 막대는 분야 색이다 — 앱 어디서나 역사는 파랑, 과학은 올리브다.
 *
 * 막대 높이는 카드 안에서 가장 큰 값을 91px 로 두고 비례한다(그림의 7 → 91).
 * 0 은 3px 로 바닥에 남긴다 — 아예 없으면 그 요일이 빠진 것처럼 보인다.
 *
 * 움직임 — 숫자는 0 에서 올라가고, 막대는 바닥에서 자라고, 분야 막대는
 * 왼쪽에서 차오른다. 기간을 넘기면 다시 그린다(key). 숫자가 「집계되는」
 * 것으로 읽히게 하려는 것이지 장식이 아니라 짧다(0.6초). 요일 막대는 눌러서
 * 하나를 골라 볼 수 있다 — 고른 것만 진해지고 값이 굵어진다. 한 번 더
 * 누르면 풀린다. 움직임을 줄인 설정에서는 다 가만히 있는다.
 */
const BAR_MAX = 91;
const BAR_MIN = 3;

/** 분야 이름(역사 · 생활 …)의 색 — 커뮤니티 갈래 색 표를 메뉴 분야 이름으로 찾는다. */
function fieldColor(name: string): string {
  const field = fields.find((f) => f.name === name);
  return (field && categoryColors[fieldCategory[field.id]]) ?? "#b9baba";
}

export default function Stats() {
  const [mode, setMode] = useState<(typeof stats.modes)[number]>("주간");
  /** 기간 목록에서 몇 번째를 보는지 — 주간·연간 따로 기억한다. 처음은 이번 주 · 올해. */
  const [at, setAt] = useState<Record<string, number>>({ 주간: 3, 연간: stats.yearly.length - 1 });
  /** 눌러서 고른 요일(달) 막대 — 없으면 가장 큰 것이 켜진다 */
  const [picked, setPicked] = useState<string | null>(null);

  /*
    주간은 주간지식과 같은 보관함에서 센다 — 전에는 여기 따로 적힌 수라 같은 주가
    기록에서는 28개, 여기서는 24개였고 기본 주와 주 시작 요일도 달랐다(감수 지적).
    연간은 아직 예시다.
  */
  const archive = useSyncExternalStore(subscribeArchive, getArchiveSnapshot, getArchiveServerSnapshot);
  const now = archive.now ? new Date(archive.now) : new Date();
  const periods: StatsPeriod[] = mode === "주간" ? weeklyPeriods(archive.records, now) : stats.yearly;
  const index = at[mode];
  const period = periods[index];
  /** 그림을 다시 그리는 열쇠 — 기간이 바뀌면 막대와 숫자가 처음부터 다시 움직인다 */
  const scene = `${mode}-${index}`;
  const step = (by: number) => {
    setAt((now) => ({ ...now, [mode]: Math.min(periods.length - 1, Math.max(0, now[mode] + by)) }));
    setPicked(null);
  };
  const switchMode = (next: typeof mode) => {
    setMode(next);
    setPicked(null);
  };

  const collected = period.summary[0];
  const top = Math.max(1, ...period.bars.map(([, n]) => n));
  const widest = Math.max(1, period.fields[0][1]);

  return (
    <div className="flex w-full flex-col gap-6 px-6">
      {/* 주간 · 연간 스위치와 기간 — 1288:6983. 스위치는 초록 판이 미끄러져 옮겨 간다 */}
      <div className="flex flex-col gap-2">
        <div role="tablist" className="relative isolate flex w-[132px] rounded-lg bg-gray-100 p-[3px]">
          <span
            aria-hidden
            className="absolute top-[3px] left-[3px] h-7 w-[calc(50%-3px)] rounded-md bg-primary-800 transition-transform duration-300 ease-out"
            style={{ transform: mode === "주간" ? "translateX(0)" : "translateX(100%)" }}
          />
          {stats.modes.map((option) => {
            const on = option === mode;
            return (
              <button
                key={option}
                type="button"
                role="tab"
                aria-selected={on}
                onClick={() => switchMode(option)}
                className={`relative z-10 flex h-7 flex-1 items-center justify-center rounded-md text-xs leading-[18px] transition-colors duration-300 ${
                  on ? "font-bold text-white" : "font-normal text-gray-500"
                }`}
              >
                {option}
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-[14px]">
          <button
            type="button"
            aria-label="이전 기간"
            disabled={index === 0}
            onClick={() => step(-1)}
            className="tap [--tap:32px] flex transition-opacity disabled:opacity-30"
          >
            <Img src="/assets/community/back.svg" className="h-3 w-[6px]" />
          </button>
          <span key={scene} className="stat-in text-sm leading-[1.5] font-semibold text-primary-700">
            {period.label}
          </span>
          <button
            type="button"
            aria-label="다음 기간"
            disabled={index === periods.length - 1}
            onClick={() => step(1)}
            className="tap [--tap:32px] flex transition-opacity disabled:opacity-30"
          >
            <Img src="/assets/community/back.svg" className="h-3 w-[6px] rotate-180" />
          </button>
        </div>
      </div>

      {/* 나의 지식 통계 — 1288:6991. 숫자는 0 에서 올라온다 */}
      <section className="flex flex-col gap-5 rounded-xl border border-[#e0e0e0] bg-white p-[18px]">
        <h3 className="text-base leading-[1.5] font-bold text-[#1f1f1f]">{stats.title}</h3>
        <div key={scene} className="flex w-full items-center justify-center">
          {period.summary.map((value, i) => (
            <div key={stats.summaryLabels[i]} className="flex flex-1 flex-col items-center gap-[6px]">
              <span className="text-[22px] leading-[1.5] font-bold text-primary-700 tabular-nums">
                <CountUp to={value} />
                {stats.summaryUnits[i]}
              </span>
              <span className="text-[11px] leading-[1.5] text-[#808080]">{stats.summaryLabels[i]}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 요일(달)별 지식 수집 — 1288:7005. 막대는 바닥에서 자라고, 눌러서 하나를 볼 수 있다 */}
      <section className="flex flex-col gap-2 rounded-xl border border-[#e0e0e0] bg-white p-[18px]">
        <div className="flex flex-col gap-[6px]">
          <h3 className="text-base leading-normal font-bold text-[#1a1a1a]">{stats.barsTitle[mode]}</h3>
          <p className="text-xs leading-normal text-[#737373]">
            {stats.barsSub[mode].replace("{n}", String(collected))}
          </p>
        </div>
        <div key={scene} className={`flex h-[165px] w-full items-end ${mode === "주간" ? "gap-[10px]" : "gap-1"}`}>
          {period.bars.map(([name, n], i) => {
            const lit = picked ? picked === name : n === top && n > 0;
            const height = n === 0 ? BAR_MIN : Math.max(BAR_MIN, Math.round((n / top) * BAR_MAX));
            return (
              <button
                key={name}
                type="button"
                aria-pressed={picked === name}
                aria-label={`${name} ${n}개`}
                onClick={() => setPicked((now) => (now === name ? null : name))}
                className="flex min-w-px flex-1 flex-col items-center gap-2 transition-opacity active:opacity-70"
              >
                <span
                  className={`text-[11px] leading-normal transition-colors duration-300 ${
                    lit ? "font-bold text-primary-700" : "text-gray-600"
                  }`}
                >
                  {n}
                </span>
                <span
                  style={{ height, animationDelay: `${i * 40}ms` }}
                  className={`stat-bar-up w-full max-w-[22px] rounded-[5px] transition-colors duration-300 ${
                    lit ? "bg-primary-800" : "bg-gray-300"
                  }`}
                />
                <span
                  className={`text-[11px] leading-normal transition-colors duration-300 ${
                    lit ? "font-semibold text-primary-800" : "text-gray-700"
                  }`}
                >
                  {name}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* 분야별 — 1288:7038. 막대는 분야 색, 왼쪽에서 차오른다 */}
      <section className="flex flex-col gap-[18px] rounded-xl border border-[#e0e0e0] bg-white p-[18px]">
        <h3 className="text-base leading-normal font-bold text-[#1a1a1a]">{stats.fieldsTitle}</h3>
        <div key={scene} className="flex w-full flex-col gap-[10px]">
          {period.fields.map(([name, n], i) => {
            const first = i === 0;
            const color = fieldColor(name);
            return (
              <div key={name} className="flex w-full items-center gap-3">
                <span className="w-7 shrink-0 text-xs leading-normal text-[#404040]">{name}</span>
                <span className="flex h-2 min-w-px flex-1 overflow-hidden rounded-[4px] bg-gray-200">
                  <span
                    style={{
                      width: `${Math.round((n / widest) * 100)}%`,
                      backgroundColor: color,
                      animationDelay: `${i * 70}ms`,
                    }}
                    className="stat-bar-across h-full rounded-[4px]"
                  />
                </span>
                <span
                  style={first ? { color } : undefined}
                  className={`w-8 shrink-0 text-right text-sm leading-normal font-bold ${first ? "" : "text-gray-700"}`}
                >
                  {n}개
                </span>
              </div>
            );
          })}
        </div>
        <p className="text-xs leading-normal text-[#595959]">
          {stats.fieldsNote[0]}
          <b style={{ color: fieldColor(period.fields[0][0]) }} className="text-[13px] font-bold">
            {period.fields[0][0]}{" "}
          </b>
          {stats.fieldsNote[1]}
        </p>
      </section>

      <p className="text-center text-[11px] leading-[1.4] text-[#8c8c8c]">{stats.footnote}</p>
    </div>
  );
}

/** 숫자가 집계되는 시간 — 눈으로 「올라간다」가 보이되 기다리지는 않을 만큼. */
const COUNT_MS = 600;

/**
 * 0 에서 목표까지 올라가는 숫자.
 *
 * 처음 그릴 때는 목표를 바로 적는다 — 서버가 그린 것과 같아야 하고, 움직임을
 * 줄인 설정에서는 그대로 둔다. 브라우저에서 첫 틀이 지난 뒤 0 으로 내렸다가
 * 끝으로 갈수록 느려지며(ease-out) 올라간다.
 */
function CountUp({ to }: { to: number }) {
  const [shown, setShown] = useState(to);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / COUNT_MS);
      const eased = 1 - (1 - t) * (1 - t) * (1 - t);
      setShown(Math.round(to * eased));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [to]);

  return <>{shown}</>;
}
