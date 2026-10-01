"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Img from "@/components/common/Img";
import { BALL_COLORS, gacha } from "@/data/common/gacha";
import { recordCopy } from "@/data/common/record";
import { winSticker } from "@/state/stickerPackStore";

/**
 * 뽑은 공이 열린다 — Figma 1451:9374 가운데.
 *
 * 어두운 덮개 위에 노란 빛무리가 번지고, 공이 위아래 반쪽으로 갈라진다 —
 * 위는 흰 돔(반짝이 한 줄), 아래는 공 색 그릇. 그 사이에서 캐릭터 스티커 한 장이
 * 나온다 — 꾸미기의 콜라보 스티커(decorate.packStickers) 가운데 하나. 전에는 첫
 * 뽑기에 스티커팩이 통째로 나왔고 그 뒤 한동안 지식 카드도 섞여 나왔다.
 *
 *   shut   공이 닫힌 채 한가운데
 *   split  반쪽이 위아래로 벌어지고 카드가 작게 보인다(프레임의 그 모습)
 *   grow   반쪽은 더 밀려나며 흐려지고 카드가 제 크기가 된다 — 읽을 수 있게
 *   done   단추가 뜬다
 *
 * 카드가 다 선 뒤에야 단추가 뜬다 — 같이 뜨면 눈이 단추로 가서 카드를 못
 * 본다. 덮개를 눌러도 닫힌다.
 *
 * 단추는 한 줄에 둘 — 다시 뽑기 · 영수증 꾸미러 가기 — 그리고 밑에 닫기.
 * 세로로 셋을 쌓았을 때는 흰 단추가 꺼진 것처럼 보였다(사용자 지적) — 가로로
 * 나누고 꾸미러 가기는 초록 테두리 · 초록 글씨로 켜져 있음을 보인다. 꾸미러
 * 가기는 뽑은 것을 바로 영수증에 붙이러 가는 길이다 — 받은 스티커가 꾸미기의
 * 콜라보 서랍에 들어가는데, 기록 탭까지 돌아가서 찾게 하면 받은 줄도 모른 채
 * 지나간다. 글자는 기록 화면의 같은 단추와 같다(recordCopy).
 * 이 덮개에는 X 가 없어 닫기 글자가 닫는 길이다.
 */
const SPLIT_MS = 600;
const GROW_MS = 700;

/** 프레임의 공 — 195 폭, 반쪽 높이 97 */
const W = 195;
const HALF = 97;

export default function GachaResult({
  sticker,
  skin,
  coins,
  coupons,
  onAgain,
  onClose,
}: {
  /** 나온 스티커 — 그림 주소 */
  sticker: string;
  skin: number;
  coins: number;
  coupons: number;
  onAgain: () => void;
  onClose: () => void;
}) {
  const [step, setStep] = useState<"shut" | "split" | "grow" | "done">("shut");
  /**
   * 덮개가 뜨자마자 공이 작게 시작해 제 크기로 커진다 — 상자에서 나온 공이
   * 가운데로 커지며 열리는 것처럼 보이게 한다(사용자 지시). 처음부터 다 큰
   * 채로 나타나면 상자 속 공과 아무 상관 없이 뚝 떨어진 것처럼 보였다.
   */
  const [entered, setEntered] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(id);
  }, []);

  // 스티커가 나왔다 — 꾸미기의 콜라보 서랍에 들어간다
  useEffect(() => {
    winSticker(sticker);
  }, [sticker]);

  useEffect(() => {
    const a = window.setTimeout(() => setStep("split"), 80);
    const b = window.setTimeout(() => setStep("grow"), 80 + SPLIT_MS + 500);
    const c = window.setTimeout(() => setStep("done"), 80 + SPLIT_MS + 500 + GROW_MS);
    return () => {
      window.clearTimeout(a);
      window.clearTimeout(b);
      window.clearTimeout(c);
    };
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const color = BALL_COLORS[skin] ?? "#ffe187";
  const split = step !== "shut";
  const grown = step === "grow" || step === "done";
  const done = step === "done";
  const canPay = coins > 0 || coupons > 0;

  // 반쪽이 물러나는 거리 — 프레임(373 높이)에서 138, 카드가 다 서면 더
  const apart = grown ? 190 : split ? 138 : 0;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={gacha.stickerPrize}
      onClick={onClose}
      className="fixed inset-0 z-50 mx-auto flex w-full max-w-screen flex-col items-center justify-center bg-black/60 px-6"
    >
      {/* 빛무리 — 1451:9499 */}
      <span
        aria-hidden
        className={`pointer-events-none absolute top-1/2 left-1/2 size-[311px] -translate-x-1/2 -translate-y-[60%] rounded-full bg-[radial-gradient(circle,rgba(255,231,160,0.9)_0%,rgba(204,185,128,0.45)_50%,rgba(153,139,96,0)_100%)] blur-[38px] transition-opacity duration-700 ${
          split ? "opacity-100" : "opacity-0"
        }`}
      />

      <div
        onClick={(e) => e.stopPropagation()}
        className="relative flex w-full flex-col items-center"
      >
        {/* 공 — 1346:7817. 반쪽 둘이 위아래로 갈라진다. 작게 시작해 제 크기로 커진다 */}
        <div
          style={{ width: W, height: HALF * 2 + 180 }}
          className={`relative flex items-center justify-center transition-transform duration-500 ease-out ${
            entered ? "scale-100" : "scale-[0.3]"
          }`}
        >
          {/* 위 돔 — 흰색, 반짝이 한 줄 */}
          <span
            aria-hidden
            style={{ width: W, height: HALF, transform: `translateY(${-apart}px)` }}
            className={`absolute top-[calc(50%-97px)] left-0 overflow-hidden rounded-t-[100px] bg-white transition-all duration-700 ease-out ${
              grown ? "opacity-0" : ""
            }`}
          >
            <span
              aria-hidden
              className="absolute top-[22px] left-[102px] h-[10px] w-[44px] rotate-[18deg] rounded-full bg-[#ffe187]"
            />
            <span aria-hidden className="absolute top-[41px] left-[153px] size-[9px] rounded-full bg-[#ffe187]" />
          </span>
          {/* 아래 그릇 — 공 색 */}
          <span
            aria-hidden
            style={{ width: W, height: HALF, backgroundColor: color, transform: `translateY(${apart}px)` }}
            className={`absolute top-1/2 left-0 rounded-b-[100px] transition-all duration-700 ease-out ${
              grown ? "opacity-0" : ""
            }`}
          />

          {/* 스티커 — 갈라진 사이에서 작게, 그다음 제 크기로 */}
          <div
            style={{ transform: `scale(${grown ? 1 : 0.62})` }}
            className={`relative z-10 transition-all duration-700 ease-out ${split ? "opacity-100" : "scale-50 opacity-0"}`}
          >
            {/* 오려낸 그림이라 빛무리 위에 그대로 떠 있다 */}
            <Img
              src={sticker}
              className="size-[170px] object-contain drop-shadow-[0_18px_42px_rgba(0,0,0,0.45)]"
            />
          </div>
        </div>

        <p aria-live="polite" className="mt-3 h-[23px] text-center text-lg leading-[1.3] font-semibold text-white">
          {done ? gacha.stickerPrize : ""}
        </p>

        {/* 다시 뽑기 · 꾸미러 가기 — 한 줄에 둘(1451:9835 의 줄을 반으로). 밑에 닫기 */}
        <div
          className={`mt-4 flex w-full flex-col items-center gap-3 transition-opacity duration-300 ${
            done ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
        >
          <div className="flex w-full gap-[10px]">
            <button
              type="button"
              onClick={onAgain}
              disabled={!canPay}
              className="tap [--tap-w:0px] flex h-[42px] min-w-0 flex-1 items-center justify-center gap-[6px] rounded-[10px] bg-primary-600 px-2 text-base leading-[1.3] font-medium whitespace-nowrap text-white transition-opacity active:opacity-80 disabled:bg-primary-800 disabled:text-white/60"
            >
              {canPay ? gacha.again : gacha.broke}
              {canPay ? (
                <span className="rounded-full bg-white/20 px-[7px] py-[2px] text-[12px] leading-[1.3] font-semibold">
                  {coupons > 0 ? `${gacha.couponsLabel} ${coupons}` : `${gacha.coinsLabel} ${coins}`}
                </span>
              ) : null}
            </button>
            <Link
              href="/record/decorate"
              className="tap [--tap-w:0px] flex h-[42px] min-w-0 flex-1 items-center justify-center rounded-[10px] border-2 border-primary-400 bg-white px-2 text-base leading-[1.3] font-medium whitespace-nowrap text-primary-700 transition-opacity active:opacity-80"
            >
              <span className="hidden min-[360px]:inline">{recordCopy.decorate}</span>
              <span className="min-[360px]:hidden">{recordCopy.decorateShort}</span>
            </Link>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="tap [--tap-w:0px] text-sm leading-[1.4] text-white/70 underline underline-offset-4"
          >
            {gacha.close}
          </button>
        </div>
      </div>
    </div>
  );
}
