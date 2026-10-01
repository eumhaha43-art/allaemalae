"use client";

import Img from "@/components/common/Img";
import { coinCopy } from "@/data/common/menu";
import { useCoins } from "@/state/coinStore";

/**
 * 코인 안내 한 줄 — 「지식 하나를 여는 데 1코인이 들어요 · 보유 5개」.
 *
 * 지식을 고르는 자리마다 같은 모습으로 놓인다(목록 · 상세). 값과 지갑을 한
 * 줄에 붙여 두는 이유는 `coinCopy` 에 적어 두었다.
 *
 * 코인이 바닥나면 문장이 바뀌고 색이 회색으로 내려간다 — 같은 자리에서 「살
 * 수 있다」와 「못 산다」를 둘 다 말해야 해서, 줄을 새로 만들지 않고 이 줄이
 * 두 얼굴을 갖는다.
 *
 * 띠가 아니라 얇은 줄인 것은 이것이 경고가 아니기 때문이다. 규칙을 한 번
 * 일러 주는 자리라, 지식 카드보다 눈에 먼저 들면 안 된다.
 */
export default function CoinNote({ className = "" }: { className?: string }) {
  const coins = useCoins();
  const broke = coins <= 0;

  return (
    <div
      /*
        `w-full` 은 두지 않는다 — 쓰는 쪽이 좌우 여백(mx-6)을 주므로, 폭까지
        100% 로 못 박으면 여백만큼 넘쳐 오른쪽 글자가 화면 밖으로 잘린다.
        세로 flex 안에서는 그냥 두어도 여백을 뺀 만큼 늘어난다.
      */
      className={`flex items-center gap-2 rounded-[10px] border px-3 py-[9px] ${
        broke ? "border-[#e7e7e7] bg-[#f4f4f4]" : "border-[#f2e2bb] bg-[#fffaee]"
      } ${className}`}
    >
      <Img
        src="/assets/gacha/coin.svg"
        className={`size-[15px] shrink-0 ${broke ? "opacity-40 grayscale" : ""}`}
      />
      <span
        className={`min-w-px flex-1 text-[11px] leading-[1.4] tracking-[-0.22px] ${
          broke ? "text-gray-500" : "text-[#6b5a2a]"
        }`}
      >
        {broke ? coinCopy.broke : coinCopy.note}
      </span>
      <span
        className={`shrink-0 text-[11px] leading-[1.4] font-semibold tracking-[-0.22px] whitespace-nowrap ${
          broke ? "text-gray-400" : "text-[#b8860b]"
        }`}
      >
        {coinCopy.owned} {coins}
        {coinCopy.unit}
      </span>
    </div>
  );
}
