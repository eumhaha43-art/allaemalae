"use client";

import { useState } from "react";
import Img from "@/components/common/Img";

/**
 * Pinned room rule — Figma node 564:6229.
 *
 * The design draws a chevron on it, and a room whose host set rules has
 * something to put behind it: tapping unfolds the full intro and the rules.
 * Rooms from the design carry only the house line, so theirs stays shut.
 *
 * 회색 띠였을 때는 대화 사이의 회색 말풍선과 구별이 안 돼, 방의 약속이 아니라
 * 누가 한 말처럼 보였다. 메인 초록으로 깔면 말과 섞이지 않는다. 깃발과 꺾쇠도
 * 초록 판(flag-on · down-on)을 쓴다 — <img> 로 부르는 그림이라 바깥 CSS 로
 * 색을 바꿀 수 없어, 선 색만 다른 같은 그림을 따로 둔다.
 */
export default function ChatNotice({ text, rules = [] }: { text: string; rules?: string[] }) {
  const [open, setOpen] = useState(false);
  const expandable = rules.length > 0 || text.length > 30;

  return (
    <div className="flex w-full shrink-0 bg-white px-5 pt-3 pb-1">
      <div className="flex min-w-px flex-1 flex-col rounded-[10px] bg-primary-100 py-[11px] pr-3 pl-[14px]">
        <button
          type="button"
          disabled={!expandable}
          aria-expanded={expandable ? open : undefined}
          onClick={() => setOpen((on) => !on)}
          className="tap [--tap-w:0px] flex w-full items-center gap-[9px] text-left"
        >
          <Img src="/assets/chat/flag-on.svg" className="size-[15px] shrink-0" />
          <p
            className={`min-w-px flex-1 text-xs leading-[1.4] font-medium text-primary-800 ${
              open ? "" : "truncate"
            }`}
          >
            {text}
          </p>
          <Img
            src="/assets/chat/down-on.svg"
            className={`size-[13px] shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
          />
        </button>

        {open && rules.length > 0 ? (
          <ul className="mt-[10px] flex flex-col gap-2 border-t border-primary-200 pt-[10px]">
            {rules.map((rule) => (
              <li key={rule} className="flex items-start gap-2">
                <span className="text-[11px] leading-[1.4] text-primary-700" aria-hidden>
                  ✓
                </span>
                <span className="text-[11.5px] leading-[1.4] text-primary-800">{rule}</span>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </div>
  );
}
