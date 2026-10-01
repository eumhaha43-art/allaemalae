"use client";

import { useState } from "react";
import Img from "@/components/common/Img";
import { ACTION_BTN, ACTION_DISABLED, ACTION_ON } from "@/components/common/actionButton";
import DrawModal from "@/components/home/DrawModal";
import { lucky } from "@/data/common/home";
import { spendCoins, useCoins } from "@/state/coinStore";

/**
 * 랜덤 지식깡 뽑기 — Figma 846:3770.
 *
 * 카드 세 장이 놓인 줄(474)이 화면(402)보다 넓어 좌우로 조금씩 삐져나간다.
 * 넘치는 만큼 잘라 가로 스크롤이 생기지 않게 한다.
 *
 * 「카드 뽑기」를 누르면 코인 한 개를 치르고 뽑기 연출이 화면을 덮는다 —
 * 856:8268 · 856:8474. 남은 코인은 여기서 세고 팝업에 넘긴다.
 */
export default function LuckyDraw() {
  const coins = useCoins();
  const [drawing, setDrawing] = useState(false);

  /**
   * 코인을 먼저 치르고 연다 — 팝업이 열린 뒤에 세면 보유 수가 한 박자 늦는다.
   *
   * 모자라면 `spendCoins` 가 아무것도 하지 않고 false 를 준다. 단추는 이미
   * 잠겨 있지만(`disabled`), 팝업의 「다시 뽑기」도 같은 길로 들어오므로
   * 치르는 쪽에서 한 번 더 막는다.
   */
  const draw = () => {
    if (!spendCoins(1, "랜덤 지식깡")) return;
    setDrawing(true);
  };

  return (
    <section className="flex w-full shrink-0 flex-col items-center gap-10">
      {/* 폭은 좌우 여백이 정한다 — 354 를 못 박으면 좁은 화면에서 오른쪽으로 넘친다 */}
      <div className="flex w-full flex-col gap-1 px-6 leading-[1.3]">
        <h2 className="text-[22px] font-semibold text-[#1a1a1a]">{lucky.title}</h2>
        <p className="text-sm text-[#879299]">{lucky.sub}</p>
      </div>

      <div className="flex w-full flex-col items-center gap-[30px]">
        {/*
          뽑기 전 카드 더미 — 846:3775. 봉지 셋이 살짝 떠올랐다 내려앉는다(bag-float,
          globals.css) — 시작을 조금씩 늦춰 같은 박자가 되지 않게.

          가로만 자른다(overflow-x-clip). 세로까지 자르면 떠오르는 6px 이 위에서 잘린다.
        */}
        <div className="flex w-full justify-center overflow-x-clip">
          {/*
            봉지 더미도 「카드 뽑기」와 같은 일을 한다(사용자 지시) — 단추까지
            손을 뻗지 않아도 봉지를 바로 눌러 뽑을 수 있어야 자연스럽다.
          */}
          <button
            type="button"
            onClick={draw}
            disabled={coins <= 0}
            aria-label={lucky.cta}
            className="tap flex w-[474.259px] shrink-0 items-end gap-[15px]"
          >
            {/*
              기울인 카드는 회전 뒤 차지하는 자리가 원래 크기보다 넓다. 자리를
              잡아 주는 상자를 씌우지 않으면 줄 전체가 좁아지고 카드가 서로
              겹치거나 잘린다 — 846:3776 / 846:3778 의 바깥 상자가 그 자리다.
            */}
            <div
              style={{ animationDelay: "-0.4s" }}
              className="bag-float flex h-[150.82px] w-[134.981px] shrink-0 items-center justify-center"
            >
              <Img
                src="/assets/home/lucky-card.png"
                className="h-[132.56px] w-[112.813px] rotate-[-10.45deg] object-cover"
              />
            </div>
            {/*
              가운데 봉지는 166 자리에 그림을 94.33% 폭으로 넣는다 — 856:8183.
              object-cover 로 166x184 를 꽉 채우면 그림 비율이 안 맞아 위아래가
              잘린다.
            */}
            <div
              style={{ animationDelay: "-1.4s" }}
              className="bag-float relative h-[184px] w-[166px] shrink-0 overflow-hidden"
            >
              <Img
                src="/assets/home/lucky-card.png"
                className="absolute top-0 left-[2.22%] h-full w-[94.33%] max-w-none"
              />
            </div>
            <div
              style={{ animationDelay: "-2.3s" }}
              className="bag-float flex h-[157.241px] w-[143.278px] shrink-0 items-center justify-center"
            >
              <Img
                src="/assets/home/lucky-card.png"
                className="h-[132.56px] w-[112.813px] rotate-[15deg] object-cover"
              />
            </div>
          </button>
        </div>

        <div className="flex w-full flex-col gap-[10px] px-6">
          <div className="flex w-full items-center gap-[6px]">
            <Img src="/assets/home/stamp.svg" className="size-[14px] shrink-0" />
            <span className="text-xs leading-[17px] tracking-[-0.24px] text-[#9a9a9e]">
              {lucky.costLabel}
            </span>
            <span className="text-[12.5px] leading-[18px] font-semibold tracking-[-0.25px] text-yellow-400">
              {lucky.cost}
            </span>
            <span className="flex-1" />
            <span className="text-xs leading-[17px] tracking-[-0.24px] text-[#9a9a9e]">
              {lucky.ownedLabel} {coins}
            </span>
          </div>

          <button
            type="button"
            onClick={draw}
            disabled={coins <= 0}
            className={`${ACTION_BTN} ${ACTION_ON} ${ACTION_DISABLED} w-full`}
          >
            {coins > 0 ? lucky.cta : lucky.broke}
          </button>
        </div>
      </div>

      {/* 기계로 가는 카드(MachineCard)는 여기 있다가 점장님 Pick 위로 갔다 — page.tsx(사용자 지시) */}
      {drawing ? (
        <DrawModal coins={coins} onDraw={draw} onClose={() => setDrawing(false)} />
      ) : null}
    </section>
  );
}
