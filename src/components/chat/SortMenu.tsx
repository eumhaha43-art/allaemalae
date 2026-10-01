"use client";

import { useEffect, useRef, useState } from "react";
import Img from "@/components/common/Img";
import { SORTS } from "@/data/common/chat";

/**
 * 정렬 고르기 — Figma 761:1068, 실제로 펼쳐지는 메뉴.
 *
 * 채팅방(최근 대화순 / 인기순 / 저장순)에서 시작했지만 게시글 목록도 같은
 * 메뉴를 쓴다 — 고를 것(`options`)과 아이콘만 다르다.
 */
export default function SortMenu<Id extends string>({
  sort,
  onSort,
  options = SORTS as { id: Id; label: string }[],
  icons = { sort: "/assets/chat/sort.svg", caret: "/assets/chat/sort-caret.svg" },
  /** 어두운 줄 위에 놓일 때. 펼친 목록은 떠 있는 판이라 흰색 그대로 둔다. */
  night = false,
}: {
  sort: Id;
  onSort: (next: Id) => void;
  options?: { id: Id; label: string }[];
  /** 밝은 줄에서 쓰는 그림 두 장. 어두운 줄은 채팅방 것을 쓴다. */
  icons?: { sort: string; caret: string };
  night?: boolean;
}) {
  const root = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const current = options.find((option) => option.id === sort) ?? options[0];

  return (
    <div ref={root} className="relative flex">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((on) => !on)}
        className="tap -mr-2 flex items-center gap-1 px-2 py-[11px]"
      >
        <Img src={night ? "/assets/chat/sort-light.svg" : icons.sort} className="size-[13px]" />
        <span
          className={`text-[12.5px] leading-none tracking-[-0.25px] ${
            night ? "text-white/70" : "text-[#6a6a6e]"
          }`}
        >
          {current.label}
        </span>
        <Img
          src={night ? "/assets/chat/sort-caret-light.svg" : icons.caret}
          className={`size-[11px] transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute top-[40px] right-0 z-30 w-[126px] overflow-hidden rounded-[10px] border border-[#e5e5e5] bg-white shadow-[0px_3px_8px_0px_rgba(0,0,0,0.12)]"
        >
          {options.map((option, i) => {
            const active = option.id === sort;
            return (
              <button
                key={option.id}
                type="button"
                role="menuitemradio"
                aria-checked={active}
                onClick={() => {
                  onSort(option.id);
                  setOpen(false);
                }}
                className={`flex w-full items-center gap-2 px-[14px] py-3 text-left text-[13px] leading-[1.4] ${
                  i > 0 ? "border-t border-[#f0f0f0]" : ""
                } ${active ? "font-bold text-primary-600" : "text-[#17171a]"}`}
              >
                <span className="flex-1">{option.label}</span>
                {active ? (
                  <span className="text-[11px] leading-none" aria-hidden>
                    ✓
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
