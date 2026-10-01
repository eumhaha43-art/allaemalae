"use client";

import { useEffect, useState } from "react";
import TypingInput from "@/components/keyboard/TypingInput";

/**
 * Sheet that will not act until the person types a reason — 신고 and 방 삭제.
 *
 * Mount it conditionally rather than passing an `open` flag: unmounting is what
 * clears the box between openings.
 */
export default function PromptDialog({
  title,
  description,
  placeholder,
  confirmLabel,
  cancelLabel = "취소",
  onConfirm,
  onCancel,
}: {
  title: string;
  description?: string;
  placeholder: string;
  confirmLabel: string;
  cancelLabel?: string;
  onConfirm: (reason: string) => void;
  onCancel: () => void;
}) {
  const [reason, setReason] = useState("");
  const ready = reason.trim().length > 0;

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onCancel]);

  return (
    <div
      className="fixed inset-0 z-50 mx-auto flex w-full max-w-screen items-center justify-center bg-black/40 px-8"
      onClick={onCancel}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
        className="flex w-full flex-col rounded-2xl bg-white px-5 pt-6 pb-4"
      >
        <h2 className="text-center text-base leading-[1.4] font-bold tracking-[-0.32px] text-[#17171a]">
          {title}
        </h2>
        {description ? (
          <p className="mt-2 text-center text-[13px] leading-[1.5] whitespace-pre-line text-[#6a6a6e]">
            {description}
          </p>
        ) : null}

        <TypingInput
          multiline
          autoFocus
          value={reason}
          onChange={setReason}
          maxLength={200}
          placeholder={placeholder}
          className="mt-4 h-[86px] w-full resize-none rounded-[10px] border border-[#e5e5e5] bg-[#f7f7f7] px-[14px] py-[11px] text-[13.5px] leading-[1.5] text-[#333336] outline-none placeholder:text-[#bdbdc0] focus:border-primary-600"
        />

        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-[10px] bg-[#f1f1f1] py-3 text-sm leading-[1.4] font-bold text-[#6a6a6e]"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            disabled={!ready}
            onClick={() => onConfirm(reason.trim())}
            className={`flex-1 rounded-[10px] py-3 text-sm leading-[1.4] font-bold ${
              ready ? "bg-primary-600 text-white" : "bg-[#ededed] text-[#bdbdc0]"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
