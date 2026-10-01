"use client";

import { useState } from "react";
import Img from "@/components/common/Img";
import { coinLedger } from "@/data/common/my";
import { useCoinHistory, useCoins } from "@/state/coinStore";

/** 접혀 있을 때 보이는 줄 수 */
const FOLDED = 4;

/**
 * 코인 — 잔액과 오간 내역. MY 회원증 아래.
 *
 * 온보딩이 「코인을 누르면 회원증에서 자세히 볼 수 있어요」라고 했는데, 헤더의
 * 코인을 누르면 MY 로 오기만 하고 잔액도 내역도 없었다(감수 지적). 이 판에서
 * 오간 것을 새것부터 적는다 — 새 계정은 5코인으로 시작하니 지식을 하나 열고
 * 퀴즈를 맞히면 흐름이 그대로 보인다.
 */
export default function CoinLedger() {
  const coins = useCoins();
  const history = useCoinHistory();
  const [all, setAll] = useState(false);
  const shown = all ? history : history.slice(0, FOLDED);

  return (
    <section className="mx-6 flex flex-col rounded-[12px] border border-gray-300 bg-white p-[17px]">
      <div className="flex items-center justify-between">
        <span className="text-sm leading-[1.3] font-semibold text-gray-black">{coinLedger.title}</span>
        <span className="flex items-center gap-1 text-base leading-none font-bold text-gray-black">
          <Img src="/assets/gacha/coin.svg" className="size-[18px]" />
          {coins}
          {coinLedger.unit}
        </span>
      </div>

      {history.length === 0 ? (
        <p className="mt-3 text-xs leading-[1.5] text-gray-500">{coinLedger.empty}</p>
      ) : (
        <ul className="mt-3 flex flex-col divide-y divide-gray-100">
          {shown.map((entry) => (
            <li key={entry.at + entry.reason} className="flex items-center justify-between py-2">
              <span className="flex min-w-px flex-col gap-[2px]">
                <span className="text-[13px] leading-[1.3] text-gray-black">{entry.reason}</span>
                <span className="text-[11px] leading-none text-gray-500">{clock(entry.at)}</span>
              </span>
              <span
                className={`shrink-0 text-sm leading-none font-bold tabular-nums ${
                  entry.delta > 0 ? "text-primary-600" : "text-[#dc5f9a]"
                }`}
              >
                {entry.delta > 0 ? `+${entry.delta}` : entry.delta}
                {coinLedger.unit}
              </span>
            </li>
          ))}
        </ul>
      )}

      {history.length > FOLDED ? (
        <button
          type="button"
          onClick={() => setAll((now) => !now)}
          className="tap [--tap-w:0px] mt-2 self-center text-xs leading-none text-gray-500 underline underline-offset-4 transition-opacity active:opacity-55"
        >
          {all ? coinLedger.less : coinLedger.more(history.length - FOLDED)}
        </button>
      ) : null}
    </section>
  );
}

/** 「오후 2:07」 — 이 판에서 오간 것이라 날짜까지는 필요 없다 */
function clock(at: number): string {
  return new Date(at).toLocaleTimeString("ko-KR", { hour: "numeric", minute: "2-digit" });
}
