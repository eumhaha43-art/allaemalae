"use client";

import { useSyncExternalStore } from "react";
import { getToast, getToastServerSnapshot, runToastAction, subscribeToast } from "@/state/toastStore";

/**
 * 한 줄 알림 — 기기 화면 한가운데에 어두운 알약으로 뜬다.
 *
 * 손가락을 막지 않는다(`pointer-events-none`) — 알림이 떠 있는 동안에도
 * 다음 일을 바로 할 수 있어야 한다. 알림마다 요소를 새로 붙여(key) 뜨는
 * 움직임이 매번 처음부터 돈다. 되돌리기 같은 단추가 달린 알림만 그 단추가
 * 눌린다.
 *
 * `fixed` 는 기기 목업 안에서 기기 화면 기준으로 잡힌다(ShowcaseLayout 의
 * transform). 탭 바 · 팝업(z 50) 위에 온다.
 */
export default function Toast() {
  const toast = useSyncExternalStore(subscribeToast, getToast, getToastServerSnapshot);
  if (!toast) return null;

  return (
    <div
      key={toast.id}
      role="status"
      aria-live="polite"
      className="toast-in pointer-events-none fixed inset-x-0 top-1/2 z-[70] flex -translate-y-1/2 justify-center px-10"
    >
      <span className="flex items-center gap-2 rounded-[14px] bg-[#17171a]/88 px-5 py-3 text-sm leading-[1.4] font-semibold text-white shadow-[0_12px_32px_-8px_rgba(0,0,0,0.45)]">
        <span aria-hidden className="flex size-[18px] items-center justify-center rounded-full bg-primary-500 text-[11px] leading-none font-bold text-white">
          ✓
        </span>
        {toast.text}
        {toast.action ? (
          <button
            type="button"
            onClick={runToastAction}
            className="tap [--tap-w:0px] pointer-events-auto ml-1 rounded-full bg-white/15 px-3 py-1 text-xs leading-none font-bold text-primary-300 transition-opacity active:opacity-60"
          >
            {toast.action.label}
          </button>
        ) : null}
      </span>
    </div>
  );
}
