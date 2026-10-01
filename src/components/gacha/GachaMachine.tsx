"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Img from "@/components/common/Img";
import AppHeader from "@/components/common/AppHeader";
import GachaResult from "@/components/gacha/GachaResult";
import { BALL, BIN, CLAW, GLASS, LEVER, binBalls, gacha, pile, type GachaBall } from "@/data/common/gacha";
import { pickSticker } from "@/state/stickerPackStore";
import { spendCoins, useCoins } from "@/state/coinStore";
import { spendCoupon, useCoupons } from "@/state/couponStore";
import { usePersona } from "@/hooks/usePersona";
import { takeCouponNotice } from "@/state/notificationStore";
import { showToast } from "@/state/toastStore";
import {
  closeGachaGuide,
  getGachaGuide,
  getGachaGuideServerSnapshot,
  openGachaGuide,
  subscribeGachaGuide,
} from "@/state/gachaGuideStore";

/**
 * 뽑기 기계 — Figma 1442:8974.
 *
 * 한 판은 단계(Phase)로 흐른다. 단계마다 집게 · 공 · 문의 자리를 정해 두고
 * CSS transition 이 그 사이를 잇는다 — 시계(setTimeout)는 단계만 넘긴다.
 *
 *   idle    레버로 집게를 좌우로 옮길 수 있다
 *   down    집게가 벌어진 채 겨눈 공까지 내려간다
 *   grab    집게가 오므라들며 공을 문다 — 공은 아직 더미 자리에
 *   up      공을 문 채 올라온다 — 이때부터 공은 집게에 달려 움직인다
 *   carry   왼쪽 파란 통 위로 옮겨 간다
 *   drop    집게가 벌어지고 공이 통으로 떨어진다
 *   door    아래 초록 상자의 문이 위로 열리고 공이 굴러 나온다
 *   open    공이 상자 앞에 멈춘다
 *   reveal  공이 열리며 카드가 나온다(GachaResult)
 *
 * 「바로 아래 공」은 집게 가운데와 가로로 가장 가까운 공이다. 집게는 겨눈
 * 자리에서 곧장 수직으로 내려간다 — 기계가 알아서 옆으로 옮겨 가면 겨누는
 * 재미가 없다. 대신 오므리는 동안 공이 집게 가운데로 살짝 끌려 들어온다.
 * 집은 공은 올라오는 순간 더미에서 빠지고, 다 뽑아 통이 비면 다시 채운다.
 *
 * 막대는 천장에서 끊기지 않는다 — 내려간 만큼 그림 위로 같은 색 막대를 이어
 * 붙이고(transition 도 같이 걸어 내려가는 내내 이어져 있다), 다 올라오면 0 이다.
 *
 * 집게와 놓은 공은 유리 통(overflow hidden) 바깥 층에 그린다 — 안에 두면
 * 막대 윗부분이 잘려 천장에 안 닿고, 통 위로 떨어지는 공도 통 밖에서는
 * 안 보인다. 층 순서: 더미 < 파란 통 < 놓은 공 < 집게 < 레버 · 단추.
 *
 * 레버는 받침째로 손잡이다 — 폰에서는 44px 검은 공만 노리기 어렵다. 어디를
 * 잡든 끄는 만큼 기울고(±30°), 집게는 그 각도에 비례해 ±90px 옮겨 간다.
 * 놓으면 그 자리에 머문다 — 스프링처럼 돌아가면 겨눈 공을 놓친다.
 */
type Phase = "idle" | "down" | "grab" | "up" | "carry" | "drop" | "door" | "open" | "reveal";

/** 단계마다 머무는 시간 — 다음 단계로 넘기기까지 */
const STEP: Record<Exclude<Phase, "idle" | "reveal">, number> = {
  down: 700,
  grab: 400,
  up: 700,
  carry: 700,
  drop: 650,
  door: 900,
  open: 700,
};

/** 유리 통 폭의 가운데 — 공의 x 는 여기서 잰다 */
const CENTER = 201;
/** 집게에 달린 공의 가운데 — 집게 상자 위에서부터 */
const ATTACH_Y = CLAW.tipY - 4;
/**
 * 집게 그림 맨 위(마운트)가 유리 통 테두리 위로 삐져나와 보이던 부분 — CLAW.top
 * 이 프레임값 그대로 -11 이라 테두리(GLASS.border) 안쪽 시작보다 위에 걸친다.
 * 그림만 이만큼 가려 테두리 아래에서 시작하는 것처럼 보이게 한다(사용자 지적) —
 * 막대 이음(rod 확장 span)은 그대로 둬야 내려갈 때 천장까지 끊기지 않는다.
 */
const CAP_HIDE = -CLAW.top;
/**
 * 마운트를 가리는 통(overflow-hidden)의 좌우 여유 — 집게가 벌어질 때(scaleX 1.14)
 * 그림이 제 폭(CLAW.w)보다 넓어지는데, 통 폭을 그대로 두면 벌어진 모서리까지
 * 잘려 보였다(사용자 지적). 가장 많이 벌어졌을 때 튀어나오는 만큼(폭의 7% 남짓)
 * 보다 넉넉하게 잡는다.
 */
const JAW_MARGIN = 20;

const ballSrc = (skin: number) => `/assets/gacha/ball-${String(skin).padStart(2, "0")}.svg`;

/** 기울인 공 한 알 — 상자 한가운데에 공을 놓고 돌린다(프레임과 같은 짜임). */
function Ball({
  ball,
  originX,
  className = "",
  style,
}: {
  ball: GachaBall;
  originX: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <span
      style={{ left: originX + ball.x - ball.box / 2, top: ball.y, width: ball.box, height: ball.box, ...style }}
      className={`absolute flex items-center justify-center ${className}`}
    >
      <Img
        src={ballSrc(ball.skin)}
        style={{ width: BALL, height: BALL, transform: `rotate(${ball.deg}deg)` }}
        className="max-w-none"
      />
    </span>
  );
}

export default function GachaMachine() {
  const coins = useCoins();
  // 쿠폰도 코인처럼 지갑이 든다 — 화면을 나갔다 들어와도 도로 생기지 않는다
  const coupons = useCoupons();
  /** 회원증 종류 — 값 치르는 법의 안내가 다르다. 아무도 안 골랐으면 프레임대로 블랙 */
  const tier = usePersona()?.card ?? "black";
  const [phase, setPhase] = useState<Phase>("idle");
  /** 레버 기울기(도) — 집게 자리는 여기서 나온다 */
  const [tilt, setTilt] = useState(0);
  /** 더미에서 빠진 공 */
  const [taken, setTaken] = useState<string[]>([]);
  /** 지금 집은 공 */
  const [held, setHeld] = useState<GachaBall | null>(null);
  /** 이번에 집은 공에서 나올 스티커 — 아직 안 받은 것 중에서 아무거나(stickerPackStore) */
  const [prize, setPrize] = useState<string | null>(null);
  const drag = useRef<{ startX: number; startTilt: number } | null>(null);
  /** 사용법 — 이 탭에서 처음 들어왔을 때 저절로 뜬다(gachaGuideStore). */
  const guide = useSyncExternalStore(
    subscribeGachaGuide,
    getGachaGuide,
    getGachaGuideServerSnapshot,
  );

  const busy = phase !== "idle";
  const restX = (tilt / LEVER.tilt) * LEVER.reach;
  const clawCenterAtRest = CLAW.left + CLAW.w / 2;
  const remaining = pile.filter((ball) => !taken.includes(ball.id));
  const canPay = coins > 0 || coupons > 0;

  // 단계를 시계로 넘긴다 — 나가면 시계도 같이 멈춘다
  useEffect(() => {
    if (phase === "idle" || phase === "reveal") return;
    const next: Record<Exclude<Phase, "idle" | "reveal">, Phase> = {
      down: "grab",
      grab: "up",
      up: "carry",
      carry: "drop",
      drop: "door",
      door: "open",
      open: "reveal",
    };
    const id = window.setTimeout(() => setPhase(next[phase]), STEP[phase]);
    return () => window.clearTimeout(id);
  }, [phase]);

  /** 뽑기 — 값을 치르고, 집게 아래 공을 고르고, 첫 단계로. */
  const draw = () => {
    if (busy) return;
    if (!canPay) {
      showToast(gacha.broke);
      return;
    }
    if (!remaining.length) {
      showToast(gacha.refilled);
      setTaken([]);
      return;
    }
    if (spendCoupon()) {
      // 쓴 쿠폰은 알림에서도 걷어 간다 — 남아 있으면 아직 있는 줄 알고 또 온다
      takeCouponNotice();
    } else {
      spendCoins(1, "가챠 뽑기");
    }

    const aim = clawCenterAtRest + restX;
    const target = remaining.reduce((best, ball) =>
      Math.abs(CENTER + ball.x - aim) < Math.abs(CENTER + best.x - aim) ? ball : best,
    );
    setHeld(target);
    setTaken((now) => [...now, target.id]);
    setPrize(pickSticker());
    setPhase("down");
  };

  /*
    다시 뽑기 — 팝업만 닫는다. 저절로 한 판 더 돌리지 않는다: 어느 공을
    집을지는 레버로 겨눈 뒤 「뽑기」를 눌러야 정해지는 것이라, 기계가 대신
    뽑으면 겨누는 재미가 없다.
  */
  const again = () => {
    setPhase("idle");
    setHeld(null);
  };

  const close = () => {
    setPhase("idle");
    setHeld(null);
  };

  /* 레버 — 받침 어디를 잡든 손가락이 움직인 만큼 기운다 */
  const grabLever = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (busy) return;
    drag.current = { startX: event.clientX, startTilt: tilt };
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const moveLever = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (!drag.current) return;
    const dx = event.clientX - drag.current.startX;
    setTilt(Math.max(-LEVER.tilt, Math.min(LEVER.tilt, drag.current.startTilt + dx / 2)));
  };
  const releaseLever = () => {
    drag.current = null;
  };

  /*
    집게의 자리 — 단계마다 다르다. 내려갈 때부터 올라올 때까지는 레버로 겨눈
    그 자리(수직), 옮겨 갈 때부터는 파란 통 위. 내려가는 깊이는 집게에 달릴
    자리(ATTACH_Y)가 공의 가운데에 오도록.
  */
  const target = held ?? pile[0];
  const targetCenterX = CENTER + target.x;
  const targetCenterY = target.y + target.box / 2;
  const depth = targetCenterY - CLAW.top - ATTACH_Y;
  const toBin = BIN.left + BIN.w / 2 - clawCenterAtRest;
  /** 오므릴 때 공이 집게 가운데로 끌려오는 거리 */
  const pull = clawCenterAtRest + restX - targetCenterX;
  const claw = (() => {
    switch (phase) {
      case "down":
        return { x: restX, y: depth, jaw: "open" as const };
      case "grab":
        return { x: restX, y: depth, jaw: "shut" as const };
      case "up":
        return { x: restX, y: 0, jaw: "shut" as const };
      case "carry":
        return { x: toBin, y: 0, jaw: "shut" as const };
      case "drop":
        return { x: toBin, y: 0, jaw: "open" as const };
      case "door":
      case "open":
      case "reveal":
        return { x: toBin, y: 0, jaw: "rest" as const };
      default:
        return { x: restX, y: 0, jaw: "rest" as const };
    }
  })();
  const jawScale = { open: 1.14, shut: 0.86, rest: 1 }[claw.jaw];
  const clawMs = phase === "down" || phase === "up" ? STEP.down : phase === "carry" ? STEP.carry : 350;

  // 공이 더미에 남아 보이는 때 — 집는 순간까지는 제자리에 있어야 한다
  const stillInPile = (ball: GachaBall) =>
    !taken.includes(ball.id) || (held?.id === ball.id && (phase === "down" || phase === "grab"));
  const onClaw = held && (phase === "up" || phase === "carry");
  const falling = held && (phase === "drop" || phase === "door" || phase === "open" || phase === "reveal");
  const doorOpen = phase === "door" || phase === "open" || phase === "reveal";
  const rolled = phase === "open" || phase === "reveal";

  /** 유리 통 안 좌표를 기계 좌표로 — 통 위(20) + 테두리(10) */
  const inGlass = (y: number) => GLASS.top + GLASS.border + y;
  const fallFrom = inGlass(CLAW.top + ATTACH_Y) - BALL / 2;
  const fallTo = inGlass(BIN.top + 40);

  return (
    <main className="flex min-h-full w-full shrink-0 flex-col bg-white">
      <AppHeader title={gacha.title} />

      {/* 코인 · 쿠폰 · 도움말 — 1442:8977 */}
      <div className="flex h-[60px] w-full shrink-0 items-center justify-between bg-white px-6">
        <div className="flex items-center gap-[10px] text-xs leading-[1.3] text-black">
          <span className="flex items-center gap-1">
            <Img src="/assets/gacha/coin.svg" className="size-5" />
            {gacha.coinsLabel}: {coins}
            {gacha.unit}
          </span>
          {/* 쿠폰 티켓은 프레임(30 × 20)보다 줄인다 — 12px 글자 옆에서 코인(20)보다 무거워 보였다(사용자 지적). 비율 3:2 는 그대로 */}
          <span className="flex items-center gap-1">
            <Img src="/assets/gacha/coupon.svg" className="h-[14px] w-[21px]" />
            {gacha.couponsLabel}: {coupons}
            {gacha.unit}
          </span>
        </div>
        <button
          type="button"
          aria-label="뽑기 안내"
          onClick={openGachaGuide}
          className="tap relative flex size-6 items-center justify-center"
        >
          <Img src="/assets/gacha/help.svg" className="size-[21px]" />
          <span aria-hidden className="absolute text-base leading-none text-gray-500">?</span>
        </button>
      </div>

      {/*
        기계 — 1442:8991.

        `isolate` 로 겹침 순서를 이 안에 가둔다. 레버와 뽑기 단추의 z-50 은 기계
        부품끼리의 앞뒤인데, 가두지 않으면 main 까지 올라와 사용법 덮개(z-40)
        위로 레버가 튀어나왔다 — 사용자 지적.
      */}
      <div className="relative isolate h-[651px] w-full shrink-0 overflow-hidden bg-[linear-gradient(180deg,#008154_50%,#d1ffef_100%)]">
        <div className="absolute inset-x-0 top-0 h-[325.5px] bg-primary-100" />

        {/* 유리 통 — 1442:8992. 위아래 초록 테두리 10. 더미와 파란 통만 이 안에 */}
        <div
          style={{ top: GLASS.top, height: GLASS.h, borderTopWidth: GLASS.border, borderBottomWidth: GLASS.border }}
          className="absolute left-0 w-full overflow-hidden border-primary-600 bg-[#dcf6ff]"
        >
          {pile.map((ball) =>
            stillInPile(ball) ? (
              <Ball
                key={ball.id}
                ball={ball}
                originX={CENTER}
                // 오므리는 동안 집게 가운데로 끌려온다 — 올라올 때 자리가 튀지 않게
                style={held?.id === ball.id && phase === "grab" ? { transform: `translateX(${pull}px)` } : undefined}
                className={held?.id === ball.id ? "transition-transform duration-[400ms] ease-out" : ""}
              />
            ) : null,
          )}

          {/* 파란 통 — 1451:9564. 더미보다 앞에 — 유리 통 앞쪽에 붙은 통이다. 안의 공은 통 밖으로 삐져나와도 둥글게 다 보인다 */}
          <div
            style={{ left: BIN.left, top: BIN.top, width: BIN.w, height: BIN.h }}
            className="absolute z-30 bg-[#94d5f3]"
          >
            <span aria-hidden className="absolute top-0 right-0 h-full w-[7px] bg-[#39b7f2]" />
            {binBalls.map((ball) => (
              <Ball key={ball.id} ball={ball} originX={BIN.w / 2} />
            ))}
          </div>
        </div>

        {/*
          놓은 공 — 집게 끝에서 떨어지다가 통 위 테두리를 지나는 순간부터 안
          보인다. 통 안으로 들어간 공은 뽑힌 것이라 더미에 남지 않는다 — 통 위쪽
          까지만 보이는 창(overflow hidden) 안에서 떨어뜨린다.
        */}
        {falling && held ? (
          <span
            style={{ left: BIN.left, top: fallFrom, width: BIN.w + 20, height: inGlass(BIN.top) - fallFrom }}
            className="pointer-events-none absolute z-[35] overflow-hidden"
          >
            <span
              style={{
                left: BIN.w / 2 - BALL / 2,
                width: BALL,
                height: BALL,
                ["--fall" as string]: `${fallTo - fallFrom}px`,
              }}
              className="gacha-fall absolute top-0"
            >
              {/* 집게에 달려 있던 그 기울기 그대로 — 놓는 순간 튀지 않게 */}
              <Img
                src={ballSrc(held.skin)}
                style={{ transform: `rotate(${held.deg}deg)` }}
                className="size-full max-w-none"
              />
            </span>
          </span>
        ) : null}

        {/*
          집게 — 1442:9101. 유리 통 밖 층에 — 막대가 천장(테두리)에 이어져야 한다.
          카드가 열리는 화면(reveal)에서는 집게가 파란 통 자리(toBin, 왼쪽 끝)에
          그대로 서 있어 화면 가장자리에 잘려 보였다(사용자 지적) — 그 화면이
          뜨는 동안은 집게를 그리지 않는다.
        */}
        {phase !== "reveal" ? (
          <div
            style={{
              left: CLAW.left,
              top: inGlass(CLAW.top),
              width: CLAW.w,
              height: CLAW.h,
              transform: `translate(${claw.x}px, ${claw.y}px)`,
              transitionDuration: `${clawMs}ms`,
            }}
            className="absolute z-40 transition-transform ease-in-out"
          >
            {/*
              막대 이음 — 내려간 만큼 위로 늘어나 천장(테두리 아래, CAP_HIDE 자리)에
              붙어 있다. 그림의 마운트를 가린 뒤로는 그림 쪽 막대가 CAP_HIDE 만큼
              내려와서 시작하므로, 이음도 거기서 끝나야 한다 — 전처럼 0 에서 끝내면
              그 사이가 비어 집게가 내려오는 중간에 막대가 끊겨 보였다(사용자 지적).
            */}
            <span
              aria-hidden
              style={{
                left: CLAW.rodX,
                width: CLAW.rodW,
                top: CAP_HIDE - claw.y,
                height: claw.y,
                backgroundColor: CLAW.rodColor,
                transitionDuration: `${clawMs}ms`,
              }}
              className="absolute transition-[top,height] ease-in-out"
            />
            {/*
              그림의 맨 위 마운트 부분만 가린다 — 아래는 그대로 잘리지 않는다.
              좌우는 JAW_MARGIN 만큼 넉넉히 열어 둔다 — 폭까지 딱 맞추면 집게가
              벌어질 때(scaleX) 넓어진 모서리가 같이 잘려 보였다(사용자 지적).
            */}
            <span
              className="absolute bottom-0 overflow-hidden"
              style={{ top: CAP_HIDE, left: -JAW_MARGIN, right: -JAW_MARGIN }}
            >
              <Img
                src="/assets/gacha/claw.svg"
                style={{ top: -CAP_HIDE, left: JAW_MARGIN, width: CLAW.w, height: CLAW.h, transform: `scaleX(${jawScale})` }}
                className="absolute max-w-none origin-top transition-transform duration-300 ease-out"
              />
            </span>
            {/* 문 공 — 집게 끝에 달려 같이 움직인다 */}
            {onClaw && held ? (
              <span
                style={{ left: CLAW.w / 2 - BALL / 2, top: ATTACH_Y - BALL / 2, width: BALL, height: BALL }}
                className="absolute"
              >
                <Img
                  src={ballSrc(held.skin)}
                  style={{ transform: `rotate(${held.deg}deg)` }}
                  className="size-full max-w-none"
                />
              </span>
            ) : null}
          </div>
        ) : null}

        {/* 레버 — 1451:9371. 받침째로 손잡이라 어디를 잡아도 끌린다 */}
        <button
          type="button"
          aria-label="레버 — 좌우로 밀어 집게를 옮겨요"
          disabled={busy}
          onPointerDown={grabLever}
          onPointerMove={moveLever}
          onPointerUp={releaseLever}
          onPointerCancel={releaseLever}
          className="absolute top-[375px] left-1/2 z-50 h-[113px] w-[126px] -translate-x-1/2 cursor-grab touch-none select-none active:cursor-grabbing disabled:cursor-default"
        >
          <Img src="/assets/gacha/lever-base.svg" className="absolute inset-0 size-full" />
          <span
            style={{ transform: `rotate(${tilt}deg)` }}
            className="absolute bottom-[22px] left-1/2 block h-[92px] w-[44px] origin-bottom -translate-x-1/2 transition-transform duration-75"
          >
            <span aria-hidden className="absolute bottom-0 left-1/2 h-[66px] w-[21px] -translate-x-1/2 rounded-t-[4px] bg-[#b7b7b7]" />
            <span aria-hidden className="absolute top-0 left-1/2 size-[44px] -translate-x-1/2 rounded-full bg-black" />
          </span>
        </button>

        {/* 좌우 화살표 — 1442:9113 · 1451:9368 */}
        <div className="pointer-events-none absolute top-[499px] left-1/2 z-30 flex w-[100px] -translate-x-1/2 items-center justify-between">
          <Img src="/assets/gacha/arrow.svg" className="h-6 w-[15px] -scale-x-100" />
          <span aria-hidden className="h-[5px] w-[54px] bg-white" />
          <Img src="/assets/gacha/arrow.svg" className="h-6 w-[15px]" />
        </div>

        {/*
          넣는 곳 · 값 — 1442:9111 · 1451:9350. 한 기둥으로 묶어 값 배지 폭(60)에
          맞춘다. 프레임의 흰 네모(67 × 32)에 흰 막대 하나는 「깨진 아이콘」으로
          보였다(기획 피드백) — 홈에 무엇을 넣는 곳인지 보이게 쿠폰이 있으면
          쿠폰 티켓이, 없으면 코인이 반쯤 꽂혀 있다.
        */}
        <div className="absolute top-[452px] left-[315px] z-30 flex w-[60px] flex-col items-center gap-[6px]">
          <div className="relative flex h-[26px] w-full items-end justify-center rounded-[4px] border border-white/90 pb-[6px]">
            <Img
              src={coupons > 0 ? "/assets/gacha/coupon.svg" : "/assets/gacha/coin.svg"}
              className={`absolute left-1/2 -translate-x-1/2 ${coupons > 0 ? "-top-[9px] h-[14px] w-[21px]" : "-top-[10px] size-[16px]"}`}
            />
            <span aria-hidden className="h-[5px] w-[38px] rounded-full bg-white" />
          </div>
          <div className="w-full rounded-[5px] bg-white py-[5px] text-center text-[20px] leading-normal font-bold text-[#66cd9f]">
            {gacha.price}
          </div>
        </div>

        {/* 초록 상자 — 1442:9107. 문이 위로 열리고 공이 굴러 나온다 */}
        <div className="absolute top-[554px] left-6 z-20 h-[97px] w-[196px] overflow-hidden rounded-t-[20px] bg-primary-600">
          {/*
            문틀 — 문이 이 위(상자 챙 14) 로는 못 올라가게 여기서 자른다. 전에는
            바깥 상자(top-0)에서만 잘랐는데, 문이 제자리(top-14)보다 위 14px 를
            더 올라간 뒤에야 잘려 그 사이는 문이 챙 위로 삐져나와 「밖에서 열리는
            것처럼」 보였다(사용자 지적) — 문틀을 문의 제자리에 맞추면 조금도
            위로 새지 않고 안에서 접히듯 사라진다.
          */}
          <div className="absolute inset-x-[18px] top-[14px] bottom-0 overflow-hidden rounded-t-[10px]">
            <div className="absolute inset-0 bg-primary-900" />
            <div
              className={`absolute inset-0 bg-primary-700 shadow-[inset_0_-6px_0_rgba(0,0,0,0.15)] transition-transform duration-700 ease-in-out ${
                doorOpen ? "-translate-y-full" : ""
              }`}
            />
          </div>
          {held && doorOpen ? (
            <span
              style={{ width: BALL * 0.8, height: BALL * 0.8 }}
              // 카드가 열리는 화면(reveal)에서는 상자 안에 그대로 있지 않고 가운데로
              // 커지며 옅어진다 — 그 자리에 멈춰 있으면 열리는 카드와 상관없이
              // 밑에 공 하나가 계속 남아 있는 것처럼 보였다(사용자 지적).
              className={`absolute bottom-[8px] left-[40px] transition-all duration-700 ease-out ${
                phase === "reveal"
                  ? "translate-x-[70px] scale-[3] opacity-0"
                  : rolled
                    ? "translate-x-[70px] rotate-[200deg]"
                    : "translate-y-[90px]"
              }`}
            >
              <Img src={ballSrc(held.skin)} className="size-full max-w-none" />
            </span>
          ) : null}
        </div>

        {/* 뽑기 — 1451:9367 */}
        <button
          type="button"
          onClick={draw}
          disabled={busy}
          className="tap [--tap-w:0px] absolute top-[570px] left-[318px] z-50 flex size-[61px] items-center justify-center rounded-full bg-[#f92008] text-lg leading-none font-medium text-[#f8f9f8] transition-transform active:scale-95 disabled:opacity-70"
        >
          {gacha.cta}
        </button>
      </div>

      {/* 홈 인디케이터 — 전체화면이라 공용 인디케이터가 빠진다 */}
      <div className="home-bar relative h-[34px] w-full shrink-0 bg-white">
        <Img
          src="/assets/home-indicator.svg"
          className="absolute bottom-2 left-1/2 h-[5px] w-[134px] -translate-x-1/2"
        />
      </div>

      {guide ? <Guide note={gacha.guide.note[tier]} onClose={closeGachaGuide} /> : null}

      {phase === "reveal" && prize && held ? (
        <GachaResult
          sticker={prize}
          skin={held.skin}
          coins={coins}
          coupons={coupons}
          onAgain={again}
          onClose={close}
        />
      ) : null}
    </main>
  );
}

/**
 * 사용법 한 장 — 처음 들어오면 저절로 뜨고, 물음표로 다시 부른다.
 *
 * 레버 · 뽑기 단추 · 아래 문으로 이어지는 차례를 그대로 세 줄로 적는다. 기계
 * 위에 덮어 두는 것은, 글을 읽는 동안 무엇을 말하는지 뒤에 보이게 하려는
 * 것이다 — 화면을 갈아 끼우면 읽고 돌아왔을 때 다시 찾아야 한다. 덮개는
 * 기계의 윤곽만 비칠 만큼 어둡게(70%) — 45% 로는 알록달록한 기계가 글을
 * 이겼다.
 */
function Guide({ note, onClose }: { note: string; onClose: () => void }) {
  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/70 px-8">
      <div className="flex w-full max-w-[300px] flex-col gap-[14px] rounded-2xl bg-white px-5 pt-5 pb-4">
        <h2 className="text-base leading-[1.3] font-bold text-gray-black">{gacha.guide.title}</h2>

        <ol className="flex w-full flex-col gap-[10px]">
          {gacha.guide.steps.map((step, i) => (
            <li key={step} className="flex items-start gap-[10px]">
              <span className="flex size-[18px] shrink-0 items-center justify-center rounded-full bg-primary-600 text-[10px] leading-none font-bold text-white">
                {i + 1}
              </span>
              <span className="min-w-px flex-1 text-[13px] leading-[1.45] text-gray-700">
                {step}
              </span>
            </li>
          ))}
        </ol>

        <p className="w-full rounded-[10px] bg-gray-100 px-3 py-2 text-[11.5px] leading-[1.45] text-gray-600">
          {note}
        </p>

        <button
          type="button"
          onClick={onClose}
          className="tap [--tap-w:0px] flex h-[46px] w-full items-center justify-center rounded-[10px] bg-primary-700 text-sm leading-[1.3] font-bold text-white transition-opacity active:opacity-80"
        >
          {gacha.guide.close}
        </button>
      </div>
    </div>
  );
}
