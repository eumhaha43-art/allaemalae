"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import Img from "@/components/common/Img";
import { useChatSky } from "@/hooks/useNightChrome";
import { isDarkStatusRoute } from "@/routes/paths";
import {
  getSplashVisible,
  getSplashVisibleServerSnapshot,
  subscribeSplash,
} from "@/state/splashStore";

/**
 * iOS status bar mock — Figma node 559:8009 (dark variant: 805:3716).
 *
 * 어두운 화면이 셋이다. 토론방 상세는 사진 위라 검정, 채팅방 홈의 테이블
 * 화면은 밤 배경과 이어지도록 같은 남색이다.
 *
 * 알래봇은 아예 깔지 않는다. 기기 화면이 모니터 알갱이를 깔고 있는데 여기에
 * 같은 검정을 한 겹 더 얹으면 알갱이가 그 자리만 지워져, 화면 위에 매끈한
 * 띠가 하나 얹힌 것으로 보였다. 비워 두면 알갱이가 그대로 비쳐 이어진다 —
 * 상태바는 스크롤 상자 밖이라 뒤로 지나갈 것도 없다.
 *
 * 여는 화면(로고가 봉투로 모이는 초록 화면)이 떠 있는 동안은 같은 초록이다.
 * 온보딩 · 로그인의 여는 화면은 스크롤 상자 안이라 여기까지 못 덮어, 그대로
 * 두면 초록 화면 위에 흰 띠가 남았다. 뜰 때는 바로 초록이 되고(색이 번지는
 * 300ms 동안 흰 띠가 비쳤다), 걷힐 때만 흐려지는 길이(300ms)만큼 색도 함께
 * 돌아온다.
 */
export default function StatusBar() {
  const pathname = usePathname();
  const splash = useSyncExternalStore(
    subscribeSplash,
    getSplashVisible,
    getSplashVisibleServerSnapshot,
  );
  const onBot = pathname === "/ai";
  const onPhoto = isDarkStatusRoute(pathname) && !onBot;
  const sky = useChatSky();
  const onNight = sky === "night";
  const dark = splash || onPhoto || onNight || onBot;
  /** 여는 화면이 없을 때의 바탕 — 화면마다 다르다. */
  const ground = onBot
    ? "bg-transparent"
    : onPhoto
      ? "bg-black"
      : onNight
        ? "bg-night"
        : sky === "day"
          ? "bg-day"
          : "bg-white";

  return (
    <div
      className={`flex h-[62px] w-full shrink-0 items-center justify-center px-[9px] pt-[2.333px] ${
        splash ? "bg-primary-600" : `transition-colors duration-300 ${ground}`
      }`}
    >
      <div className="flex h-[13px] min-w-px flex-1 items-center justify-center pr-[6px]">
        <p
          className={`text-center text-[17px] leading-[22px] font-semibold ${
            dark ? "text-white" : "text-black"
          }`}
        >
          <Clock />
        </p>
      </div>
      {/* 다이내믹 아일랜드. 토론방은 사진 위라 Figma 가 흰색으로 두었고,
          나머지는 실제 기기처럼 검정이다. */}
      <div
        className={`h-[37px] w-[125px] shrink-0 rounded-full ${onPhoto ? "bg-white" : "bg-black"}`}
      />
      <div className="flex h-[13px] min-w-px flex-1 items-center justify-center pr-px">
        <Img
          src={dark ? "/assets/status-signals-light.svg" : "/assets/status-signals.svg"}
          className="h-[13px] w-[85.329px]"
        />
      </div>
    </div>
  );
}

/**
 * 상태바 시계 — 진짜 시각이다. 프레임의 「9:41」을 그대로 두었더니 홈의 「오늘 밤
 * 12시까지 남은 시간」과 안 맞아 셈이 틀린 것으로 보였다(감수 지적). 서버는
 * 시각을 모르니 9:41 로 그리고, 브라우저에서 분마다 맞춘다.
 */
function Clock() {
  const [now, setNow] = useState<string | null>(null);
  useEffect(() => {
    const tick = () => {
      const at = new Date();
      setNow(`${at.getHours()}:${String(at.getMinutes()).padStart(2, "0")}`);
    };
    tick();
    const id = window.setInterval(tick, 15_000);
    return () => window.clearInterval(id);
  }, []);
  return <>{now ?? "9:41"}</>;
}
