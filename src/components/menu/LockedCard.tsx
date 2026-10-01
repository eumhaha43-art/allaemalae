import Img from "@/components/common/Img";
import { coinCopy } from "@/data/common/menu";

/**
 * 코인 없이 지식 상세에 들어왔을 때 본문 자리에 놓는 카드.
 *
 * 본문 카드(354 × 218)와 같은 크기 · 같은 회색 판이라, 상세의 짜임은 그대로인
 * 채 카드 한 장만 잠긴 것으로 읽힌다. 문장은 코인 안내 줄(CoinNote)이 바닥났을
 * 때 하는 말과 같다 — 같은 사정을 두 말로 하지 않는다.
 */
export default function LockedCard() {
  return (
    <div className="mx-6 mt-4 flex h-[218px] shrink-0 flex-col items-center justify-center gap-3 rounded-lg bg-[#f0f0f0] px-6 text-center">
      <Img src="/assets/gacha/coin.svg" className="size-7 opacity-40 grayscale" />
      <p className="text-[13px] leading-[1.6] font-medium tracking-[-0.13px] text-black">
        {coinCopy.locked}
      </p>
      <p className="text-xs leading-[1.5] text-gray-500">{coinCopy.broke}</p>
    </div>
  );
}
