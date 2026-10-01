"use client";

import Link from "next/link";
import Img from "@/components/common/Img";
import { machine } from "@/data/common/home";
import { usePersona } from "@/hooks/usePersona";
import { useCoupons } from "@/state/couponStore";

/**
 * 뽑기 기계로 가는 카드 — 홈 「랜덤 지식깡 뽑기」 바로 밑.
 *
 * 지식깡은 홈 안에서 봉지를 뜯는 것이고, 기계(/gacha)는 레버로 공을 집는 다른
 * 뽑기다. 기계로 가는 길이 맨 위의 쿠폰 티켓뿐이라 쿠폰이 없는 사람에게는
 * 상시 입구가 없었다(기획 피드백) — 지식깡을 해 본 자리에서 「기계에서도」로
 * 잇는다. 공 셋과 한 줄. 바탕은 뽑기 쿠폰 티켓과 같은 보라 계열 — 흰 카드는
 * 홈 바탕과 붙어 보여 눈에 안 들어왔고(사용자 지적), 진초록 띠는 너무 무거웠다.
 * 오른쪽 「기계로」는 보라 알약이라 누르는 곳이 보인다.
 *
 * 아래 줄은 사람마다: 블랙카드에 쿠폰이 있으면 그것부터, 없으면 한 판 1코인.
 */
export default function MachineCard() {
  const persona = usePersona();
  const coupons = useCoupons();
  const black = (persona?.card ?? "black") === "black";
  const line = black && coupons > 0 ? machine.coupon(coupons) : machine.coin;

  return (
    <Link
      href="/gacha"
      className="tap [--tap-w:0px] mx-6 flex w-[calc(100%-48px)] items-center gap-3 rounded-[14px] border border-purple-300 bg-[linear-gradient(120deg,#f2f1fc_0%,#e5e3fa_100%)] px-4 py-3 shadow-[0_2px_8px_rgba(124,115,230,0.15)] transition-opacity active:opacity-70"
    >
      {/* 공 셋 — 기계 안 더미의 그 공이다 */}
      <span aria-hidden className="relative h-10 w-[52px] shrink-0">
        <Img src="/assets/gacha/ball-12.svg" className="absolute top-[10px] left-0 size-7 rotate-[-18deg]" />
        <Img src="/assets/gacha/ball-08.svg" className="absolute top-0 left-[18px] size-8 rotate-[12deg]" />
        <Img src="/assets/gacha/ball-07.svg" className="absolute top-[14px] left-[30px] size-6 rotate-[-6deg]" />
      </span>
      <span className="flex min-w-px flex-1 flex-col gap-[3px] leading-[1.3]">
        <span className="text-sm font-bold text-gray-black">{machine.title}</span>
        <span className="truncate text-xs text-purple-800">{line}</span>
      </span>
      <span className="flex h-8 shrink-0 items-center gap-1 rounded-full bg-purple px-3 text-xs leading-none font-bold text-white">
        {machine.go}
        <span aria-hidden className="text-[10px]">›</span>
      </span>
    </Link>
  );
}
