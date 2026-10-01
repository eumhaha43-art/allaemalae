"use client";

import { useState } from "react";
import ReceiptThumbImage from "@/components/record/ReceiptThumbImage";
import { Arrow } from "@/components/record/MonthlyGrid";
import { dayKey } from "@/state/archiveStore";
import { monthly, weekly } from "@/data/common/record";
import type { SavedRecord } from "@/types/record";

/**
 * 주간지식 — Figma 556:3186.
 *
 * 요일마다 그 날 저장한 영수증이 아래에서 위로 층층이 쌓인다. 막대그래프인데
 * 막대 대신 영수증이 쌓이는 셈이라, 많이 읽은 날이 그대로 높아 보인다.
 *
 * 칸 높이는 위를 막아 두고 넘치면 그 칸만 세로로 넘겨본다 — 프레임의 「카드가
 * 많은 날은 그 칸만 위아래로 넘겨볼 수 있어요」가 이것이다. 가장 많은 날에
 * 맞춰 전체를 늘리면 한 날 때문에 화면이 통째로 길어진다.
 *
 * 다만 그 높이를 쌓인 만큼으로 좁히면 안 된다. 프레임은 요약줄 밑(262)부터
 * 바닥선(700)까지 438 을 통째로 비워 두고 그 아래쪽에만 영수증이 깔린다 —
 * 위가 넉넉해야 「이만큼 쌓았다」가 읽힌다. 좁히면 죄다 붙어 답답해진다.
 *
 * 그렇다고 못 박아 두면 낮은 화면에서 탈이 난다. 402 × 874 에서는 400 이 딱
 * 들어가지만, 그보다 낮은 폰(667 따위)에서는 요일 줄과 아래 영수증이 탭 바
 * 밑으로 밀려 스크롤해야 보였다(사용자 지적). 그래서 남는 세로를 다 채우고,
 * 화면이 낮으면 STACK_MIN 까지 줄어든다 — 화면 → 페이지 → 이 상자 → 요일
 * 줄까지 flex 로 이어져 있어 남는 만큼이 여기로 온다. 위를 320 으로 막아 두었던
 * 적이 있는데, 그러면 요일 줄 밑에 빈 자리가 남아 영수증이 떠 있는 것처럼 보였다
 * (사용자 지적 — 「영수증이 더 내려와야 한다」). 영수증은 바닥에서 쌓이는 것이라
 * 바닥이 곧 탭 바 위여야 한다.
 *
 * 개수는 쌓인 것 바로 위에 붙는다. 그래서 칸 맨 위가 아니라 스크롤 상자 안에
 * 같이 넣고 아래로 몰아 둔다.
 *
 * 쌓이는 것은 흉내 낸 그림이 아니라 진짜 영수증을 줄인 것이다(`ReceiptThumb`) —
 * 고른 용지와 붙인 스티커가 보여야 「내가 꾸민 그것」으로 읽힌다. 담은 지식 수에
 * 따라 길이가 조금씩 다른 것도 그래서 그대로 둔다.
 *
 * 한 장을 누르면 그날 영수증을 통째로 펼친다.
 *
 * 처음 그릴 때와 주를 넘길 때 영수증이 바닥에서 주르륵 올라와 쌓인다(사용자
 * 요청, .receipt-rise). 한 날 안에서는 맨 아래 장부터 위로 차례로, 날은 일요일부터
 * 차례로 — 늦게 오는 만큼 animation-delay 를 준다(RISE). 개수는 그날 마지막 장
 * 다음에 뜬다. 주를 넘기면 칸을 새로 붙여(key) 다시 올라온다. 쌓이는 상자가
 * overflow 라 아래에서 올라오는 동안 상자 밖은 잘린다 — 바닥에서 솟는 것처럼 보인다.
 */

/** 쌓이는 자리가 낮은 화면에서 줄어드는 한계 — 이보다 낮으면 차라리 스크롤한다. */
const STACK_MIN = 200;
/** 요일 글자 한 줄 — 위 여백 8 + 글줄 15. 줄 전체의 높이는 쌓이는 자리 + 이것이다. */
const LABEL_H = 23;
/** 줄인 영수증 한 장의 폭. 한 칸(약 47)에서 좌우 숨 쉴 자리를 뺀 값이다. */
const CARD_W = 42;
/** 올라오는 박자(ms) — 날마다 · 한 날 안의 장마다 늦어지는 만큼 */
const RISE = { day: 45, step: 60 };
/** 몇째 날의 아래에서 몇째 장이 올라오기 시작하는 시각 */
const riseAt = (day: number, fromBottom: number) => ({
  animationDelay: `${day * RISE.day + fromBottom * RISE.step}ms`,
});

export default function WeeklyBars({
  records,
  now,
  onPick,
}: {
  records: SavedRecord[];
  /** 이번 주의 기준이 되는 날 — 저장소가 준다. */
  now: Date;
  /** 쌓인 영수증을 눌렀을 때 — 그날 것을 통째로 넘긴다. */
  onPick: (day: Date, of: SavedRecord[]) => void;
}) {
  /** 이번 주의 일요일 — 여기서 더 앞으로는 못 간다(아직 안 온 주). */
  const thisSunday = (() => {
    const at = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    at.setDate(at.getDate() - at.getDay());
    return at;
  })();
  /** 보고 있는 주의 일요일 */
  const [sunday, setSunday] = useState(thisSunday);
  const current = sameDay(sunday, thisSunday);

  const step = (by: number) =>
    setSunday((at) => {
      const next = new Date(at);
      next.setDate(at.getDate() + by * 7);
      return next;
    });

  const days = Array.from({ length: 7 }, (_, index) => {
    const day = new Date(sunday);
    day.setDate(sunday.getDate() + index);
    const key = dayKey(day);
    return { day, of: records.filter((one) => dayKey(new Date(one.issued)) === key) };
  });

  const knowledge = days.reduce(
    (sum, { of }) => sum + of.reduce((lines, one) => lines + one.lines.length, 0),
    0,
  );
  const receipts = days.reduce((sum, { of }) => sum + of.length, 0);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  /** 완독 세트 — 지식을 셋 이상 담은 영수증 한 장을 한 세트로 친다. */
  const sets = days.reduce(
    (count, { of }) => count + of.filter((one) => one.lines.length >= 3).length,
    0,
  );

  return (
    <div className="-mx-6 flex w-[calc(100%+48px)] flex-1 flex-col">
      {/* 주 넘기기 — 556:3215 */}
      <div className="flex w-full items-center justify-between px-6">
        <Arrow label={weekly.prev} onClick={() => step(-1)} />
        <span className="text-[19px] leading-[27px] font-bold tracking-[-0.38px] text-[#1a1c1c]">
          {label(sunday)}
        </span>
        {/* 아직 안 온 주로는 못 간다 — 전에는 몇 달 뒤까지 빈 주를 넘길 수 있었다 */}
        <Arrow label={weekly.next} next disabled={current} onClick={() => step(1)} />
      </div>

      <p className="w-full pt-2 text-center text-xs leading-[17px] tracking-[-0.24px] text-[#5e5e5e]">
        {weekly.summary(knowledge, receipts, sets, current)}
      </p>

      <span className="mx-6 mt-[10px] block border-t border-[#ededed]" />

      {/*
        요일 일곱 칸 — 남는 세로를 다 채운다. 칸은 줄 높이만큼 늘어난다. box-content 는 위 여백(pt-5)을 높이 밖에 두려는 것인데, 여기에
        w-full 을 같이 주면 폭도 100% + 좌우 여백 48 이 되어 토요일 칸이 화면 밖으로
        나갔다(감수 지적) — 폭은 flex 아이템으로 늘어나게만 둔다.
      */}
      <div
        key={sunday.getTime()}
        style={{ minHeight: STACK_MIN + LABEL_H }}
        className="box-content flex flex-1 px-6 pt-5"
      >
        {days.map(({ day, of }, index) => (
          <div
            key={index}
            className={`flex min-w-px flex-1 flex-col items-center ${day > today ? "opacity-40" : ""}`}
          >
            {/*
              쌓이는 자리. 아래로 몰아 두어야 바닥에서부터 올라가고, 넘치면
              이 상자 안에서만 넘겨진다. 높이는 칸이 준 만큼(flex-1) 다 쓴다.
            */}
            <div className="no-scrollbar flex min-h-0 w-full flex-1 flex-col items-center justify-end gap-[3px] overflow-y-auto overscroll-contain">
              {of.length ? (
                <>
                  <span
                    style={riseAt(index, of.length)}
                    className="receipt-rise shrink-0 pb-[2px] text-[11px] leading-4 font-bold tracking-[-0.22px] text-[#1a1c1c]"
                  >
                    {of.length}
                  </span>
                  {of.map((one, at) => (
                    /* 위에서부터 그리므로 아래에서 몇째인지는 뒤집어 센다 */
                    <button
                      key={one.id}
                      type="button"
                      aria-label={`${day.getMonth() + 1}월 ${day.getDate()}일 영수증 ${at + 1}/${of.length} 보기`}
                      onClick={() => onPick(day, of)}
                      style={riseAt(index, of.length - 1 - at)}
                      className="receipt-rise tap [--tap-w:0px] [--tap-h:0px] block shrink-0 transition-opacity active:opacity-60"
                    >
                      <ReceiptThumbImage record={one} width={CARD_W} />
                    </button>
                  ))}
                </>
              ) : (
                <>
                  <span
                    style={riseAt(index, 1)}
                    className="receipt-rise shrink-0 pb-[2px] text-[11px] leading-4 tracking-[-0.22px] text-[#9a9a9e]"
                  >
                    0
                  </span>
                  {/* 아무것도 없는 날 — 바닥에 얇은 자국만 남긴다 */}
                  <span
                    style={{ width: CARD_W, ...riseAt(index, 0) }}
                    className="receipt-rise h-[3px] shrink-0 rounded-[2px] bg-[#eaeaea]"
                  />
                </>
              )}
            </div>

            <span
              className={`pt-2 text-[11px] leading-[15px] tracking-[-0.22px] ${
                sameDay(day, now) ? "font-bold text-[#1a1c1c]" : "text-[#9a9a9e]"
              }`}
            >
              {monthly.weekdays[index]}
            </span>
          </div>
        ))}
      </div>

      <span className="mx-6 mt-3 block border-t border-[#dadada]" />

      {/* 한 장도 없는 주에는 없는 기능을 설명하는 대신 빈 상태를 말한다 */}
      <p className="w-full px-6 pt-[10px] text-center text-[11px] leading-[15px] tracking-[-0.22px] text-[#9a9a9e]">
        {receipts === 0 ? (current ? weekly.emptyCurrent : weekly.empty) : weekly.note}
      </p>
    </div>
  );
}

/** 「2026년 9월 1주」 — 그 주 일요일이 그 달의 몇째 주인지로 센다. */
function label(sunday: Date): string {
  const first = new Date(sunday.getFullYear(), sunday.getMonth(), 1);
  const week = Math.floor((sunday.getDate() + first.getDay() - 1) / 7) + 1;
  return `${sunday.getFullYear()}년 ${sunday.getMonth() + 1}월 ${week}주`;
}

function sameDay(a: Date, b: Date): boolean {
  return dayKey(a) === dayKey(b);
}
