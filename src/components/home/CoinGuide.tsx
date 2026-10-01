"use client";

import { useSyncExternalStore } from "react";
import Img from "@/components/common/Img";
import { coinGuide } from "@/data/common/home";
import { usePersona } from "@/hooks/usePersona";
import { needsOnboarding } from "@/app/onboarding/_lib/seen";
import { closeCoinGuide, getCoinGuide, getCoinGuideServerSnapshot, subscribeCoinGuide } from "@/state/coinGuideStore";
import { useCoins } from "@/state/coinStore";

/**
 * 코인 안내 팝업 — 처음 온 사람(김민정)이 홈에 들어서면 한 번 뜬다.
 *
 * 이 앱의 지식은 전부 코인을 내고 연다. 규칙을 모른 채 들어오면 첫 지식을
 * 여는 자리에서 왜 막히는지 모르므로, 설문을 마치고 홈에 닿는 순간 한 번
 * 일러 준다. 뽑기 사용법과 같은 틀(번호 세 줄 + 메모 + 단추)이라 두 안내가
 * 한 앱의 것으로 읽힌다.
 *
 * 뜨는 조건 셋 — 고른 사람이 처음 온 사람이고(fresh), 온보딩을 이미 지났고
 * (아니면 홈이 곧 온보딩으로 보내는 중이라 한 틀 비쳤다 사라진다), 이 판에서
 * 아직 안 닫았다(coinGuideStore). 쓰던 사람(한상현)에게는 안 뜬다 — 그 사람은
 * 이미 아는 규칙이다.
 *
 * 홈 위에 덮는다. `fixed` 는 PC 목업에서 기기 화면을 기준으로 잡힌다
 * (ShowcaseLayout 의 transform).
 */
export default function CoinGuide() {
  const persona = usePersona();
  const coins = useCoins();
  const open = useSyncExternalStore(subscribeCoinGuide, getCoinGuide, getCoinGuideServerSnapshot);

  if (!open || !persona?.fresh || needsOnboarding()) return null;

  return (
    <div className="fixed inset-0 z-[60] mx-auto flex w-full max-w-screen items-center justify-center bg-black/60 px-8">
      <div
        role="dialog"
        aria-labelledby="coin-guide-title"
        className="flex w-full max-w-[300px] flex-col gap-[14px] rounded-2xl bg-white px-5 pt-5 pb-4"
      >
        <div className="flex items-center gap-2">
          <Img src="/assets/gacha/coin.svg" className="size-6 shrink-0" />
          <h2 id="coin-guide-title" className="text-base leading-[1.3] font-bold text-gray-black">
            {coinGuide.title}
          </h2>
        </div>

        <ol className="flex w-full flex-col gap-[10px]">
          {coinGuide.steps.map((step, i) => (
            <li key={step} className="flex items-start gap-[10px]">
              <span className="flex size-[18px] shrink-0 items-center justify-center rounded-full bg-primary-600 text-[10px] leading-none font-bold text-white">
                {i + 1}
              </span>
              <span className="min-w-px flex-1 text-[13px] leading-[1.45] text-gray-700">
                {step.replace("{coins}", String(coins))}
              </span>
            </li>
          ))}
        </ol>

        <p className="w-full rounded-[10px] bg-gray-100 px-3 py-2 text-[11.5px] leading-[1.45] text-gray-600">
          {coinGuide.note}
        </p>

        <button
          type="button"
          onClick={closeCoinGuide}
          className="tap [--tap-w:0px] flex h-[46px] w-full items-center justify-center rounded-[10px] bg-primary-700 text-sm leading-[1.3] font-bold text-white transition-opacity active:opacity-80"
        >
          {coinGuide.close}
        </button>
      </div>
    </div>
  );
}
