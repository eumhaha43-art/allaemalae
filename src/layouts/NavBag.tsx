"use client";

import { useSyncExternalStore } from "react";
import Img from "@/components/common/Img";
import { getFridgeDoor, getFridgeDoorServerSnapshot, subscribeFridgeDoor } from "@/state/cartFlightStore";

/**
 * 탭 바의 내 봉투 — Figma 807:3348(2015:7533 「bag」). 전에는 문이 열리는 냉장고
 * (NavFridge)였다 — 디자이너가 탭을 「내 봉투」로 바꿨다(사용자 지시 · 아이콘만 가져다).
 *
 * 다른 탭처럼 회색 · 흰 사본을 겹쳐 두고 판과 같은 박자로 갈아탄다(.nav-icon-off /
 * -on). 지식을 담으면(cartFlightStore.putIntoCart) 그림이 날아오는 동안 봉투가
 * 입구를 벌리듯 살짝 기울어 받을 채비를 하고(data-door="open"), 들어가는 순간
 * 납작해졌다 튀어 오른다(.bag-catch — BottomNav 가 개수가 바뀔 때 붙인다). 개수는
 * 그 박자에 위에 뜬다(사용자 요청 — 봉투에 들어가는 느낌, 숫자는 기존대로 위에).
 *
 * 크기 22 — 그림(15 × 20)을 20 × 20 판에 가운데 두어 다른 탭 아이콘과 같은 자리를 쓴다.
 */
export default function NavBag({ className }: { className?: string }) {
  const door = useSyncExternalStore(subscribeFridgeDoor, getFridgeDoor, getFridgeDoorServerSnapshot);

  return (
    <span aria-hidden data-door={door} className={`nav-bag relative block size-[22px] ${className ?? ""}`}>
      <Img src="/assets/home/nav-bag.svg" className="nav-icon-off absolute inset-0 size-full" />
      <Img src="/assets/home/nav-bag-on.svg" className="nav-icon-on absolute inset-0 size-full" />
    </span>
  );
}
