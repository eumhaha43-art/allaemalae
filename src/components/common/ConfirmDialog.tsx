"use client";

import { useEffect } from "react";

/**
 * Yes / no sheet used by 글쓰기 and the post menu.
 *
 * Clamped to the 402px frame like the rest of the shell, so on a wide browser
 * it dims the phone rather than the whole window.
 */
export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel: string;
  /** Leave it out for an acknowledgement with nothing to decline. */
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 mx-auto flex w-full max-w-screen items-center justify-center bg-black/40 px-10"
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

        <div className="mt-5 flex gap-2">
          {cancelLabel ? (
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 rounded-[10px] bg-[#f1f1f1] py-3 text-sm leading-[1.4] font-bold text-[#6a6a6e]"
            >
              {cancelLabel}
            </button>
          ) : null}
          <button
            type="button"
            autoFocus
            onClick={onConfirm}
            className="flex-1 rounded-[10px] bg-primary-600 py-3 text-sm leading-[1.4] font-bold text-white"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
