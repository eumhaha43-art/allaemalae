"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Img from "@/components/common/Img";
import { couponTicket } from "@/data/common/gacha";
import { usePersona } from "@/hooks/usePersona";
import { useCoupons } from "@/state/couponStore";

/**
 * 뽑기 쿠폰 티켓 — Figma 1421:8795 (알림 페이지 맨 위).
 *
 * 보라 티켓(양쪽과 절취선 자리에 반원이 파인 모양은 ticket.svg)에 색색의
 * 반쪽 동그라미와 점을 뿌리고, 오른쪽 절취선 너머에 D-30 꼬리표, 한가운데
 * 흰 카드에 「FREE COUPON · 아이템 1회 뽑기 쿠폰이 도착했어요!」.
 *
 * 프레임의 장식은 절대 좌표라 그대로 옮긴다 — 반원 동그라미는 원 하나에
 * 아래 반을 칠하고 돌린 것이고, 점은 색만 다른 작은 원이다. 누르면 뽑기
 * 기계 화면(/gacha)으로 간다.
 *
 * 알림뿐 아니라 MY 출석 체크 아래에도 같은 티켓을 둔다(사용자 결정) — 알림을 안
 * 열어 본 사람은 가챠가 있는 줄도 모르고 지나갔다. 홈에는 두지 않는다 — 맨 위에
 * 놓였던 티켓은 빼고(사용자 결정) 지식깡 밑의 기계 카드가 그 길을 맡는다. 흰 카드의
 * 말은 사람과 쿠폰을 보고 고른다(couponTicket): 블랙카드에 이달 쿠폰이 있으면
 * 프레임 그대로, 다 썼으면 「한 판 1코인」, 체크카드는 쿠폰이 없으니 값과
 * 「블랙카드는 매달 무료」를 같이. 아무도 안 골랐으면 프레임대로 블랙카드로 본다.
 */
const HREF = "/gacha";

/** 프레임의 티켓 — 장식이 전부 이 폭 기준의 절대 좌표다 */
const TICKET_W = 354;
const TICKET_H = 90;

/** 반쪽 동그라미 — [x(가운데, 티켓 중심 기준), y(위), 지름, 색, 각도] */
const HALVES: [number, number, number, string, number][] = [
  [74.12, -18, 57, "#ffe187", -26.07],
  [-134.38, 40, 57, "#ff92c5", 17.1],
  [22.02, 30.53, 65.557, "#44b383", -146.09],
  [-78.93, -29, 57.316, "#97e7ff", 53.66],
];

/** 점 — [x, y, 지름, 색] */
const DOTS: [number, number, number, string][] = [
  [17, 5, 12, "#d2ebff"],
  [94, 74, 10, "#d2ebff"],
  [141, 24, 9, "#fdffc8"],
  [184, 49, 5, "#ffc8c8"],
  [119, 12, 10, "#e4b5ff"],
  [136, 58, 12, "#e4b5ff"],
  [204, 6, 12, "#d2ebff"],
  [213, 44, 9, "#ffdbdb"],
  [256, 69, 5, "#ffdbdb"],
  [259, 72, 10, "#fdffc8"],
  [49, 30, 9, "#ffdbdb"],
  [11, 48, 5, "#fdffc8"],
];

export default function CouponTicket() {
  const persona = usePersona();
  const coupons = useCoupons();
  const black = (persona?.card ?? "black") === "black";
  const copy = black ? (coupons > 0 ? couponTicket.free : couponTicket.spent) : couponTicket.coin;

  /*
    폭이 354 보다 좁은 화면(320 · 344)에서는 티켓을 통째로 줄인다. 장식 · 꼬리표 ·
    흰 카드가 전부 프레임의 절대 좌표라 폭만 줄이면 오른쪽이 잘렸다(감수 지적).
    자리(wrap)의 폭을 재서 그만큼 배율을 준다 — 넓은 화면에서는 1 그대로.
  */
  const wrap = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const box = wrap.current;
    if (!box) return;
    const measure = () => setScale(Math.min(1, box.clientWidth / TICKET_W));
    measure();
    const watch = new ResizeObserver(measure);
    watch.observe(box);
    return () => watch.disconnect();
  }, []);

  return (
    <div ref={wrap} className="mx-auto w-full max-w-[354px] shrink-0" style={{ height: TICKET_H * scale }}>
    <Link
      href={HREF}
      aria-label={`${copy.text} 뽑기로 가기`}
      style={{ width: TICKET_W, height: TICKET_H, transform: `scale(${scale})`, transformOrigin: "top left" }}
      className="relative block shrink-0 overflow-hidden transition-opacity active:opacity-80"
    >
      <Img src="/assets/notifications/ticket.svg" className="absolute inset-0 size-full" />

      {/* 장식 — 반쪽 동그라미와 점. 절취선 왼쪽 안에서만 논다(overflow-hidden) */}
      {HALVES.map(([x, y, size, color, deg]) => {
        const box = size * 1.35;
        return (
          <span
            key={color}
            aria-hidden
            style={{ left: `calc(50% + ${x}px)`, top: y, width: box, height: box }}
            className="absolute flex -translate-x-1/2 items-center justify-center"
          >
            <span
              style={{ width: size, height: size, borderColor: color, transform: `rotate(${deg}deg)` }}
              className="relative overflow-hidden rounded-full border-[0.5px] bg-[#f8f9f8]"
            >
              <span
                aria-hidden
                style={{ backgroundColor: color }}
                className="absolute inset-x-[-1px] top-1/2 bottom-[-1px] rounded-b-full"
              />
            </span>
          </span>
        );
      })}
      {DOTS.map(([x, y, size, color], i) => (
        <span
          key={i}
          aria-hidden
          style={{ left: x, top: y, width: size, height: size, backgroundColor: color }}
          className="absolute rounded-full"
        />
      ))}

      {/* 절취선 너머 — D-30, 쿠폰이 없으면 값(1coin) */}
      <div className="absolute top-[9px] left-[285px] flex h-[73px] w-[69px] items-center justify-center border-l border-dashed border-[#f8f9f8]">
        <span className="flex h-[64px] w-[30px] items-center justify-center rounded-[3px] bg-[#f8f9f8]">
          <span className="rotate-90 text-lg leading-none font-medium whitespace-nowrap text-[#ff77b7]">
            {copy.tag}
          </span>
        </span>
      </div>

      {/* 흰 카드 — 1421:8828. 말이 길면 두 줄로 — 64 안에 눈썹 줄과 두 줄이 들어간다 */}
      <div className="absolute top-[13px] left-5 flex h-[64px] w-[245px] flex-col items-center justify-center gap-[3px] rounded-[10px] border border-[#cbc7f5] bg-white px-3 text-center">
        <span className="font-serif text-[11px] leading-none tracking-[0.22em] text-[#655dc0] italic">
          {copy.eyebrow}
        </span>
        <span className="text-sm leading-[1.3] font-medium text-[#211d50]">{copy.text}</span>
      </div>
    </Link>
    </div>
  );
}
