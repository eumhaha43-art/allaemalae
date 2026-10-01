"use client";

import { useState } from "react";
import MiniReceipt from "@/components/record/MiniReceipt";
import { dayKey, isDecorated } from "@/state/archiveStore";
import { monthly } from "@/data/common/record";
import type { SavedRecord } from "@/types/record";

/**
 * 월간지식 — Figma 556:3016.
 *
 * 한 달 달력 위에 그날 저장한 영수증을 손톱만 하게 얹는다. 여러 장 저장한
 * 날에는 맨 나중 것 하나만 보여 준다 — 32px 칸에 여러 장을 겹치면 무엇인지
 * 알아볼 수 없다.
 *
 * 줄은 여섯 칸으로 고정하지 않고 그 달에 필요한 만큼만 그린다. 2월처럼 넉 줄로
 * 끝나는 달에 빈 줄이 남으면 아래 문구가 멀리 밀린다.
 *
 * 프레임에 「음식 아이콘으로 저장(1~5개 사탕 · 6~10개 콘 아이스크림 · 11~15개
 * 삼각김밥 · 15개 이상 과자 봉지)」 주석이 붙어 있는데, 그 그림이 아직 없어
 * 와이어프레임대로 미니 영수증으로 둔다.
 */
export default function MonthlyGrid({
  records,
  now,
  onPick,
}: {
  records: SavedRecord[];
  /** 이번 달의 기준이 되는 날 — 저장소가 준다. */
  now: Date;
  /** 날짜를 눌렀을 때. 기록이 있는 날만 부른다. */
  onPick: (day: Date, of: SavedRecord[]) => void;
}) {
  /** 이번 달의 1일 — 아직 안 온 달로는 못 간다. */
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  /** 보고 있는 달의 1일 */
  const [month, setMonth] = useState(thisMonth);
  const current = month.getTime() === thisMonth.getTime();
  const todayKey = dayKey(now);

  const step = (by: number) =>
    setMonth((at) => new Date(at.getFullYear(), at.getMonth() + by, 1));

  /** 첫 줄 왼쪽 끝 — 그 달 1일이 낀 주의 일요일. */
  const start = new Date(month);
  start.setDate(1 - month.getDay());

  const last = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const rows = Math.ceil((month.getDay() + last) / 7);

  /** 날짜별로 한 번만 훑어 둔다 — 칸마다 전체를 걸러 내면 30번을 다시 돈다. */
  const byDay = new Map<string, SavedRecord[]>();
  for (const one of records) {
    const key = dayKey(new Date(one.issued));
    byDay.set(key, [...(byDay.get(key) ?? []), one]);
  }

  return (
    <div className="-mx-6 flex w-[calc(100%+48px)] flex-col">
      {/* 달 넘기기 — 556:3044 */}
      <div className="flex w-full items-center justify-between px-6 pb-3">
        <Arrow label={monthly.prev} onClick={() => step(-1)} />
        <div className="flex flex-col items-center">
          <span className="text-[11px] leading-[15px] tracking-[-0.22px] text-[#9a9a9e]">
            {month.getFullYear()}
          </span>
          <span className="text-[22px] leading-[30px] font-bold tracking-[-0.44px] text-[#1a1c1c]">
            {month.getMonth() + 1}월
          </span>
        </div>
        <Arrow label={monthly.next} next disabled={current} onClick={() => step(1)} />
      </div>

      <div className="grid w-full grid-cols-7">
        {monthly.weekdays.map((name) => (
          <span
            key={name}
            className="pb-[10px] text-center text-[11px] leading-[15px] tracking-[-0.22px] text-[#9a9a9e]"
          >
            {name}
          </span>
        ))}
      </div>

      {Array.from({ length: rows }, (_, row) => (
        <div key={row} className="grid w-full grid-cols-7 border-t border-[#ededed]">
          {Array.from({ length: 7 }, (_, column) => {
            const day = new Date(start);
            day.setDate(start.getDate() + row * 7 + column);
            const inMonth = day.getMonth() === month.getMonth();
            // 앞뒤 달의 날(회색 칸)에는 영수증을 얹지 않는다 — 그 달 것이 아니다(감수 지적)
            const of = inMonth ? (byDay.get(dayKey(day)) ?? []) : [];
            const top = of[of.length - 1];
            const isToday = dayKey(day) === todayKey;

            return (
              <button
                key={column}
                type="button"
                disabled={!top}
                aria-current={isToday ? "date" : undefined}
                onClick={() => onPick(day, of)}
                className="tap [--tap-w:0px] [--tap-h:0px] flex h-[78px] flex-col items-center gap-[4px] pt-[6px] disabled:cursor-default"
              >
                {/* 오늘은 초록 동그라미로 — 어느 칸이 오늘인지 보여야 한다 */}
                <span
                  className={`flex size-[18px] items-center justify-center rounded-full text-[10px] leading-[14px] tracking-[-0.2px] ${
                    isToday
                      ? "bg-primary-600 font-bold text-white"
                      : inMonth
                        ? "text-[#5e5e5e]"
                        : "text-[#d2d2d2]"
                  }`}
                >
                  {day.getDate()}
                </span>
                {top ? (
                  <MiniReceipt decorated={isDecorated(top)} width={32} height={44} />
                ) : null}
              </button>
            );
          })}
        </div>
      ))}

      {/* 안내 두 줄 — 둘 다 같은 회색으로. 두 번째 줄이 더 옅어 안 읽혔다(감수 지적) */}
      <div className="flex w-full flex-col gap-[5px] border-t border-[#ededed] px-6 pt-[10px]">
        <p className="text-center text-[11px] leading-[15px] tracking-[-0.22px] text-[#767676]">
          {monthly.notes[0]}
        </p>
        <p className="text-center text-[11px] leading-[15px] tracking-[-0.22px] text-[#767676]">
          {monthly.notes[1]}
        </p>
      </div>
    </div>
  );
}

/**
 * 달·주를 넘기는 홑화살표 — 그림 없이 선 두 개로 그린다.
 *
 * 그림은 7 × 14 지만 누르는 자리는 44 로 — 손가락 크기다. 아직 안 온 달·주로는
 * 못 가게 꺼 둘 수 있다(disabled) — 흐리게 그리고 안 눌린다.
 */
export function Arrow({
  label,
  next,
  disabled = false,
  onClick,
}: {
  label: string;
  next?: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="tap -m-[15px] flex size-11 items-center justify-center text-[#1a1c1c] transition-opacity active:opacity-45 disabled:opacity-25"
    >
      <svg width="7" height="14" viewBox="0 0 7 14" aria-hidden fill="none">
        <path
          d={next ? "M1 1l5 6-5 6" : "M6 1L1 7l5 6"}
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
