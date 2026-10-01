"use client";

import { useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { isChatLobbyRoute } from "@/routes/paths";
import {
  getChatView,
  getChatViewServerSnapshot,
  getDaylight,
  getDaylightServerSnapshot,
  subscribeChatView,
} from "@/state/chatViewStore";

/**
 * 채팅방 홈 테이블 장면의 하늘 — 밤 · 낮, 그 밖의 화면에서는 없음.
 *
 * 테이블 화면은 장면이 화면 위까지 이어져야 해서 상단 크롬(상태바 · 헤더 ·
 * 탭 · 보기 줄)도 같은 색으로 칠한다. 밤이면 어둡게, 가로등을 눌러 낮이 되면
 * 하늘색으로. 목록 화면과 다른 경로는 그대로 흰색이다.
 */
export type Sky = "night" | "day" | null;

export function useChatSky(): Sky {
  const pathname = usePathname();
  const view = useSyncExternalStore(
    subscribeChatView,
    getChatView,
    getChatViewServerSnapshot,
  );
  const daylight = useSyncExternalStore(
    subscribeChatView,
    getDaylight,
    getDaylightServerSnapshot,
  );

  if (!isChatLobbyRoute(pathname) || view !== "table") return null;
  return daylight ? "day" : "night";
}

/** 상단 크롬을 어둡게(흰 글씨로) 그려야 하는지 — 밤 하늘일 때만. */
export function useNightChrome(): boolean {
  return useChatSky() === "night";
}

/** 하늘에 맞춘 바탕색 클래스 — 밤 · 낮 · 그 밖은 흰색. */
export function skyBackground(sky: Sky): string {
  return sky === "night" ? "bg-night" : sky === "day" ? "bg-day" : "bg-white";
}
