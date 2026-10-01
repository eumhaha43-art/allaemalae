"use client";

import { useState, useSyncExternalStore } from "react";
import MemberCard from "@/components/my/MemberCard";
import MachineCard from "@/components/home/MachineCard";
import Attendance from "@/components/my/Attendance";
import Interests from "@/components/my/Interests";
import UnderlineTabs from "@/components/menu/UnderlineTabs";
import MyLinks from "@/components/menu/MyLinks";
import RiseIn from "@/components/home/RiseIn";
import { myTabs } from "@/data/common/my";
import {
  clearMyTab,
  getMyTabServerSnapshot,
  getMyTabSnapshot,
  subscribeMyTab,
  type MyTab,
} from "@/state/myTabStore";

/**
 * MY 화면 알맹이 — Figma 1021:10345(MY 출석) · 1021:10504(관심 카테고리).
 *
 * 회원증 · 안쪽 탭 · 출석/관심 카드 · 설정 줄까지가 한 덩어리다. 햄버거 메뉴의
 * MY 탭과 `/my` 가 같은 것을 보여 주므로 헤더만 빼고 여기에 모아 둔다.
 *
 * 메뉴 안에서는 「카테고리 | MY」 줄 밑에 「MY 출석 | 관심 카테고리 | 통계」
 * 줄이 한 겹 더 깔린다. 프레임은 MY 를 독립 화면으로 그려 이 두 줄이 겹치지
 * 않지만, 메뉴 안에서 보여 달라는 요청이라 그대로 쌓았다.
 *
 * 회원증과 탭 사이는 프레임에서 70 인데(회원증 20~267, 탭 337) 화면에서는 너무
 * 벌어져 20 으로 좁혔다 — 사용자 요청. 회색 8px 줄이 이미 끊어 주고 있어서
 * 여백까지 넓을 필요가 없다.
 */
export default function MyPanel() {
  /**
   * 탭은 보통 여기서 고르지만, 홈의 관심 태그 「+」로 들어오면 그쪽이 적어 둔
   * 것이 이긴다. 직접 다른 탭을 누르면 적어 둔 것을 버린다 — 안 그러면 눌러도
   * 계속 관심 카테고리로 끌려온다.
   */
  const [chosen, setChosen] = useState<MyTab>("MY 출석");
  const wanted = useSyncExternalStore(
    subscribeMyTab,
    getMyTabSnapshot,
    getMyTabServerSnapshot,
  );
  const tab = wanted ?? chosen;

  return (
    <div className="flex w-full flex-1 flex-col bg-[#f9f9f9] pb-[100px]">
      <div className="h-5 shrink-0" />
      {/* 판들은 위에서부터 차례로 떠오른다(RiseIn — 홈 섹션과 같은 것, 사용자 요청). 탭 내용은 탭이 바뀌면 새로 붙어 다시 떠오른다 */}
      <RiseIn order={0}>
        <MemberCard />
      </RiseIn>
      {/* 회원증 밑에 있던 「내 코인」 판(CoinLedger)은 뺐다(사용자 지시) — 코인은 헤더 배지가 보여 준다 */}
      {/* 뽑기 기계로 가는 카드 — 홈의 것 그대로, 회원증 바로 밑(사용자 지시). 출석 밑의 쿠폰 티켓 대신 기계로 가는 상시 입구 */}
      <div className="h-3 shrink-0" />
      <RiseIn order={1}>
        <MachineCard />
      </RiseIn>
      <div className="h-[15px] shrink-0" />
      <div className="h-2 w-full shrink-0 bg-[#eee]" />
      <div className="h-5 shrink-0" />

      <RiseIn order={2}>
        <UnderlineTabs
          dense
          tabs={myTabs}
          value={tab}
          onChange={(next) => {
            clearMyTab();
            setChosen(next);
          }}
        />
      </RiseIn>
      <div className="h-5 shrink-0" />

      <RiseIn key={tab} order={3}>
        {/* 「통계」 탭은 뺐다(사용자 지시) — Stats 는 남겨 두었다 */}
        {tab === "MY 출석" ? (
          /* 출석 밑에 있던 뽑기 쿠폰 티켓(CouponTicket)은 뺐다(사용자 지시) — 알림에는 그대로 있다 */
          <Attendance />
        ) : (
          <Interests />
        )}
      </RiseIn>

      {/*
        출석 현황과 설정 줄 사이는 프레임에서 135 나 비어 있는데(출석 592,
        설정 727), 화면을 늘려 놓느라 생긴 자리라 붙였다 — 사용자 요청.
      */}
      <div className="h-5 shrink-0" />
      <div className="h-2 w-full shrink-0 bg-[#eee]" />
      <div className="h-5 shrink-0" />
      <RiseIn order={4}>
        <MyLinks />
      </RiseIn>
    </div>
  );
}
