"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { closeOverlay, openOverlay } from "@/state/overlayStore";

/**
 * 아래에서 올라오는 판 — 알림 시간 · 관심 카테고리처럼 화면을 갈아 끼울 것까지는
 * 없는 짧은 고르기에 쓴다.
 *
 * 어두운 덮개 위에 흰 판이 바닥에 붙는다. 덮개를 누르거나 Esc 로 닫힌다. 떠
 * 있는 동안 탭 바는 내린다(overlayStore) — 덮개 밑으로 비쳐 보이고 눌리기까지
 * 한다. `fixed` 는 PC 목업에서 기기 화면을 기준으로 잡힌다(ShowcaseLayout).
 *
 * 열릴 때 판이 바닥에서 미끄러져 올라오고 덮개는 서서히 어두워진다(사용자 요청,
 * 2026-09-20) — 토론방 근거 팝업의 `sheet-enter` · `fade-in`(globals.css)과 같은
 * 짝이라 앱 안의 올라오는 판이 한 박자다.
 *
 * 손잡이 · 제목 줄을 잡고 끌면 판이 손가락을 따라 내려간다(사용자 요청) — 토론방
 * 근거 팝업(DebateRoom)의 규칙 그대로: 놓을 때 DISMISS_AT 보다 많이 내렸으면
 * 바닥으로 미끄러져 나가며 닫히고, 그보다 적으면 제자리로 튀어 오른다(SHEET_MOTION).
 * 덮개 · Esc 로 닫을 때도 같은 길로 나간다 — 어떤 때는 미끄러지고 어떤 때는 뚝
 * 사라지면 두 물건으로 보인다. `onClose` 는 다 나간 뒤(transitionend)에 부른다.
 *
 * 올라오는 것은 키프레임, 끌기 · 튀어 오름 · 나감은 transition 이라 한 요소가
 * 둘을 번갈아 쓴다 — 키프레임이 도는 동안은 transform 을 그쪽이 쥐고 있어서, 다
 * 올라온 뒤(animationend)나 그 사이에 잡았을 때 transition 으로 넘긴다(entered).
 *
 * 판의 상태(끌린 만큼 · 나가는 중)는 안쪽 `Sheet` 가 든다 — 열릴 때마다 새로
 * 붙어 지난번 상태가 남지 않는다. 효과 안에서 되돌려 놓는 대신 이렇게 한다
 * (react-hooks/set-state-in-effect).
 */
export default function BottomSheet({
  open,
  title,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  if (!open) return null;
  return (
    <Sheet title={title} onClose={onClose}>
      {children}
    </Sheet>
  );
}

/** 이보다 많이(px) 끌어내리고 놓으면 닫힌다 — DebateRoom 과 같다. */
const DISMISS_AT = 90;
/** 튀어 오름 · 나감 — 올라올 때(sheet-enter)와 같은 240ms. */
const SHEET_MOTION = "transition-transform duration-[240ms] ease-out motion-reduce:transition-none";

function Sheet({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  /** 올라오는 키프레임이 끝났는지(또는 그 사이에 잡았는지) — 그 뒤는 transition 이 맡는다 */
  const [entered, setEntered] = useState(false);
  /** 끌어내린 만큼(px). 아무도 안 잡고 있으면 null. */
  const [drag, setDrag] = useState<number | null>(null);
  /** 바닥으로 나가는 중 — 다 나가면 onClose */
  const [closing, setClosing] = useState(false);
  const from = useRef(0);

  /**
   * 닫기 — 미끄러져 나간 뒤 onClose. 움직임 줄이기면 transition 이 없어
   * transitionend 도 안 오므로 바로 부른다.
   */
  const dismiss = () => {
    if (closing) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      onClose();
      return;
    }
    setEntered(true);
    setClosing(true);
  };

  useEffect(() => {
    openOverlay();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") dismiss();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      closeOverlay();
    };
    // dismiss 는 매번 새로 만들어지지만 하는 일은 같다 — 붙였다 뗐다 할 까닭이 없다
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const dragging = drag !== null;

  const grab = {
    onPointerDown: (event: React.PointerEvent<HTMLDivElement>) => {
      if (closing) return;
      // 올라오는 도중에 잡으면 키프레임에서 넘겨받는다
      setEntered(true);
      from.current = event.clientY;
      setDrag(0);
      event.currentTarget.setPointerCapture(event.pointerId);
    },
    onPointerMove: (event: React.PointerEvent<HTMLDivElement>) => {
      if (drag === null) return;
      setDrag(Math.max(0, event.clientY - from.current));
    },
    onPointerUp: () => {
      if (drag !== null && drag > DISMISS_AT) dismiss();
      setDrag(null);
    },
    onPointerCancel: () => setDrag(null),
  };

  return (
    <div
      className={`fixed inset-0 z-50 mx-auto flex w-full max-w-screen flex-col justify-end bg-black/50 ${
        closing
          ? "pointer-events-none transition-opacity duration-[240ms] ease-out motion-reduce:transition-none opacity-0"
          : "animate-[fade-in_240ms_ease-out]"
      }`}
      onClick={dismiss}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(event) => event.stopPropagation()}
        onAnimationEnd={() => setEntered(true)}
        onTransitionEnd={(event) => {
          // 나가는 것만 끝으로 친다 — 안쪽에서 올라오는 transitionend 는 아니다
          if (closing && event.target === event.currentTarget) onClose();
        }}
        className={`no-scrollbar flex max-h-[80dvh] w-full flex-col overflow-y-auto rounded-t-2xl bg-white px-6 pb-8 ${
          !entered ? "sheet-enter" : dragging ? "" : SHEET_MOTION
        }`}
        style={{
          transform: closing ? "translateY(100%)" : dragging ? `translateY(${drag}px)` : undefined,
        }}
      >
        {/*
          잡는 구역 — 손잡이와 제목 줄. 막대만으로는 너무 가늘어 잡기 어렵다.
          touch-none — 끄는 동안 브라우저가 페이지 스크롤로 가로채지 않게.
        */}
        <div
          {...grab}
          className="-mx-6 shrink-0 cursor-grab touch-none px-6 pt-3 select-none active:cursor-grabbing"
        >
          <span aria-hidden className="mx-auto mb-4 block h-1 w-9 rounded-full bg-gray-300" />
          <h2 className="mb-4 text-base leading-[1.3] font-bold text-gray-black">{title}</h2>
        </div>
        {children}
      </div>
    </div>
  );
}
