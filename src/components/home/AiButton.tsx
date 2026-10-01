"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Img from "@/components/common/Img";
import { HIDDEN, HIDE_WHEN_SCROLLING, useScrollingDown } from "@/hooks/useScrollingDown";
import { bottomLayer, hidesAiButton, isFullscreenRoute, keepsAiButton } from "@/routes/paths";
import {
  getKeyboardOpen,
  getKeyboardServerSnapshot,
  subscribeKeyboard,
} from "@/state/keyboardStore";

/**
 * 알래봇 — Figma 950:2832.
 *
 * 하단 탭 바로 위에 떠 있는 초록 원. 점원 얼굴이 마스크로 겹쳐 그려져 있어
 * 통째로 내보낸 그림 한 장을 쓴다. 누르면 알래봇 화면으로 간다(1191:2865).
 *
 * 그림자는 글쓰기 버튼과 같은 값인데, 그림이라 네모 그림자가 생기지 않도록
 * box-shadow 가 아니라 그림 모양을 따라가는 drop-shadow 로 준다.
 *
 * ShowcaseLayout 이 그리므로 탭 바가 있는 화면이면 어디서나 뜬다. 전체화면
 * (글쓰기 · 토론방 · 방 만들기)은 자기 바닥 바가 있어 겹치므로 탭 바와 같은
 * 조건으로 빠진다. 게시글 상세와 글쓰기는 예외다(`keepsAiButton`) — 봇이
 * 보낸 글에서 봇으로 돌아갈 길, 쓰다가 물어볼 길이 있어야 한다.
 *
 * 아래로 넘기는 동안은 숨는다(useScrollingDown — 글쓰기 단추 · 데모 계정 칩과
 * 같은 훅). 떠 있는 단추는 어느 높이에 두어도 그 밑을 지나가는 글 — 점장님 Pick
 * 제목, 남겨둔 지식의 진행률, 출석 도장 — 을 덮는다(감수 지적). 읽으러 내려가는
 * 동안은 비켜 주고, 위로 올리거나 멈추면 돌아온다.
 */

/**
 * 층마다 바닥에서 얼마나 띄울지 — PC 는 홈 인디케이터(34) 만큼 더 올린다.
 *
 * 폰에서는 `env(safe-area-inset-bottom)` 을 더한다 — 탭 바와 입력줄은 기기 화면
 * 안에 있어 홈 인디케이터(34)만큼 올라가는데, 이 단추는 뷰포트 바닥 기준이라
 * 그대로 남아 탭 바를 14px 파고들었다(감수 T2-a). 브라우저에서는 그 값이 0 이라
 * 전과 같다.
 */
const SPOT = {
  none: "bottom-[calc(80px_+_env(safe-area-inset-bottom))] lg:bottom-[114px]",
  composer: "bottom-[calc(141px_+_env(safe-area-inset-bottom))] lg:bottom-[175px]",
  // 댓글 입력줄(96, 인디케이터를 제 몸에 지녀 PC 도 같다) + 12
  comments: "bottom-[calc(108px_+_env(safe-area-inset-bottom))]",
  // 바닥에 아무것도 없는 전체화면(글쓰기) — 가장자리에서 24
  bare: "bottom-[calc(24px_+_env(safe-area-inset-bottom))]",
} as const;

export default function AiButton() {
  const keyboard = useSyncExternalStore(
    subscribeKeyboard,
    getKeyboardOpen,
    getKeyboardServerSnapshot,
  );

  const pathname = usePathname();
  const layer = bottomLayer(pathname);
  const hiding = useScrollingDown();
  if (hidesAiButton(pathname) || keyboard) return null;
  if (isFullscreenRoute(pathname) && !keepsAiButton(pathname)) return null;

  // 디자인에서 탭 바 20px 위에 뜬다. 탭 바는 60, 홈 인디케이터는 34 인데
  // 인디케이터가 목업에만 있어서 PC 에서만 그만큼 더 올린다.
  //
  // 탭 바 위에 한 겹 더 있는 화면에서는 그 층 위로 올라간다 — 안 그러면
  // 채팅방의 보내기 화살표나 장바구니의 영수증 뽑기 단추를 덮어 버린다.
  const spot = SPOT[layer ?? "none"];

  return (
    <div
      className={`pointer-events-none fixed inset-x-0 z-30 mx-auto flex w-full max-w-screen justify-end pr-6 ${spot}`}
    >
      <Link
        href="/ai"
        aria-label="알래봇에게 물어보기"
        tabIndex={hiding ? -1 : undefined}
        className={`pointer-events-auto flex drop-shadow-[0_4px_12px_rgba(0,0,0,0.2)] ${HIDE_WHEN_SCROLLING} ${
          hiding ? HIDDEN : ""
        }`}
      >
        {/* 그림은 50 × 51 — 1.2배로 키워 단다(사용자 요청). 눌리는 자리도 같이 커진다 */}
        <Img src="/assets/home/ai.svg" className="h-[61px] w-[60px]" />
      </Link>
    </div>
  );
}
