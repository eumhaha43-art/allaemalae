"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { ACTION_BTN, ACTION_ON } from "@/components/common/actionButton";
import Receipt from "@/components/record/Receipt";
import { openRecordTab } from "@/state/recordTabStore";
import { closeOverlay, openOverlay } from "@/state/overlayStore";
import { useReceiptExport } from "@/hooks/useReceiptExport";
import { printed } from "@/data/common/record";
import type { Receipt as ReceiptState } from "@/state/receiptStore";

/**
 * 뽑혀 나온 영수증 — 「기록 저장하기」를 누르면 화면을 덮는다.
 *
 * 프린터 아가리에서 영수증이 밀려 나오고, 다 나오면 공유·저장·닫기가 뜬다.
 * 종이는 아가리 바로 아래 상자에서 잘리므로, 위로 올려 두면 안 보이다가
 * 내려오면서 아가리에서 나오는 것처럼 보인다(globals.css `print-out`).
 *
 * 저장 자체는 누르는 순간 이미 끝나 있다 — 여기서는 그것을 보여 주기만 한다.
 * 그래서 뽑히는 도중에 닫아도 기록은 남는다.
 */

/** 종이가 다 나오는 데 걸리는 시간. globals.css 의 `print-out` 과 같아야 한다. */
const PRINT_MS = 1900;

export default function PrintSheet({
  receipt,
  onClose,
  onGo,
}: {
  receipt: ReceiptState;
  onClose: () => void;
  /**
   * 「주간지식 보러가기」를 직접 맡을 때 — 기록 화면 자신이 띄운 경우다. 그때는
   * 갈 데가 여기라 덮개만 걷으면 되고, 탭은 이미 적어 둔 뒤라 화면이 집어 간다.
   */
  onGo?: () => void;
}) {
  const router = useRouter();
  const [done, setDone] = useState(false);
  const { busy, note, run } = useReceiptExport(receipt);

  useEffect(() => {
    const id = window.setTimeout(() => setDone(true), PRINT_MS);
    return () => window.clearTimeout(id);
  }, []);

  // 떠 있는 동안에는 탭 바를 내린다 — 반투명 덮개 밑으로 비쳐 보인다.
  useEffect(() => {
    openOverlay();
    return closeOverlay;
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div
      className="no-scrollbar fixed inset-0 z-50 mx-auto flex w-full max-w-screen flex-col items-center overflow-y-auto bg-black/75 px-6 py-8"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={printed.title}
        onClick={(event) => event.stopPropagation()}
        className="flex w-full flex-col items-center"
      >
        <div className="flex w-full items-start justify-end">
          <button
            type="button"
            aria-label={printed.close}
            onClick={onClose}
            className="tap flex size-6 items-center justify-center text-white/80 transition-opacity active:opacity-55"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden fill="none">
              <path
                d="M2 2l12 12M14 2L2 14"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        {/* 프린터 아가리 — 회색 판에 검은 틈 하나 */}
        <div className="relative z-10 w-[312px] shrink-0">
          <div className="h-[52px] w-full rounded-[12px] bg-[linear-gradient(180deg,#f4f5f7_0%,#d9dade_100%)] shadow-[0_8px_18px_-8px_rgba(0,0,0,0.7)]" />
          <span
            aria-hidden
            className="absolute inset-x-[12px] bottom-[7px] block h-[9px] rounded-[3px] bg-[#14161a] shadow-[inset_0_1px_2px_rgba(0,0,0,0.9)]"
          />
        </div>

        {/*
          나오는 자리. 종이 높이만큼만 잡히고 넘치는 위쪽은 잘리므로, 종이가
          아가리 바로 밑에서 솟아나는 것처럼 보인다.
        */}
        <div className="w-[280px] shrink-0 overflow-hidden">
          <div className="print-out">
            <Receipt
              stickers={receipt.stickers}
              paper={receipt.paper}
              font={receipt.font}
              lines={receipt.lines}
              issued={receipt.issued}
            />
          </div>
        </div>

        {/*
          다 나온 뒤에 뜬다 — 나오는 중에 뜨면 눈이 종이에서 떠난다.

          글과 단추는 불투명한 판 위에 놓는다. 덮개(75%)만으로는 뒤의 스티커
          서랍이 비쳐 「주간지식에 기록했어요」가 안 읽혔다(감수 지적).
        */}
        <div
          className={`mt-7 flex w-full max-w-[312px] flex-col items-center gap-[10px] rounded-2xl bg-[#1a1c1c] px-4 pt-5 pb-4 transition-opacity duration-300 ${
            done ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
        >
          <p className="text-center text-base leading-[1.4] font-semibold text-white">
            {printed.title}
          </p>
          <p className="text-center text-xs leading-[1.4] text-white/60">{printed.sub}</p>

          <p
            aria-live="polite"
            className={`h-4 text-center text-xs leading-4 transition-opacity ${
              note ? "text-white/85 opacity-100" : "opacity-0"
            }`}
          >
            {note}
          </p>

          <div className="flex w-full max-w-[312px] flex-col gap-[10px]">
            <div className="flex w-full gap-[10px]">
              <Action label={printed.share} busy={busy} onClick={() => void run("share")}>
                <IconShare />
              </Action>
              <Action label={printed.save} busy={busy} onClick={() => void run("save")}>
                <IconSave />
              </Action>
            </div>

            {/*
              쌓인 것을 보러 가는 길. 저장하고 나서 여기까지 오는 길이 없으면
              어디에 쌓였는지 확인할 수가 없다 — 탭은 기록 화면 안쪽 상태라
              넘어가기 전에 적어 두고 그 화면이 열리며 집어 간다.
            */}
            <button
              type="button"
              onClick={() => {
                openRecordTab("주간지식");
                if (onGo) onGo();
                else router.push("/record");
              }}
              className={`${ACTION_BTN} ${ACTION_ON} w-full`}
            >
              {printed.go}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Action({
  label,
  busy,
  onClick,
  children,
}: {
  label: string;
  busy: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      className="tap [--tap-w:0px] flex h-[42px] min-w-px flex-1 items-center justify-center gap-[6px] rounded-[10px] bg-white/12 text-[13px] leading-[1.3] font-medium text-white transition-opacity active:opacity-55 disabled:opacity-45"
    >
      <span aria-hidden className="flex shrink-0">
        {children}
      </span>
      <span className="truncate">{label}</span>
    </button>
  );
}

/** 공유 — 점 셋을 선으로 이은 표시. 기록 홈의 것과 같은 그림이다. */
function IconShare() {
  return (
    <svg width="16" height="16" viewBox="0 0 18 18" aria-hidden fill="none">
      <circle cx="13.7" cy="3.8" r="2.3" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="4.3" cy="9" r="2.3" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="13.7" cy="14.2" r="2.3" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M6.35 7.85 11.65 4.95M6.35 10.15l5.3 2.9"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** 저장 — 기기 안으로 내려가는 화살표 */
function IconSave() {
  return (
    <svg width="16" height="16" viewBox="0 0 18 18" aria-hidden fill="none">
      <rect x="4" y="1.4" width="10" height="15.2" rx="2.4" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M9 5.4v5.4M6.8 8.7 9 10.9l2.2-2.2"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M7.5 13.6h3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}
