"use client";

import { useEffect, useRef, useState } from "react";

/**
 * 「⋯」 뒤에 붙는 작은 차림표 — 게시글 · 댓글 · 근거가 같이 쓴다.
 *
 * 내가 쓴 것에만 붙는다. 남의 것에는 아무것도 안 뜨므로, 부르는 쪽에서
 * 아예 이 컴포넌트를 안 그리면 된다.
 *
 * 바깥을 누르거나 Esc 를 누르면 닫힌다 — 기기 차림표가 그렇게 움직인다.
 * 지우기 같은 되돌릴 수 없는 것은 여기서 바로 하지 않고, 고른 것을 부르는
 * 쪽에 알려 주기만 한다. 확인 창을 띄울지는 그쪽이 정한다.
 */
export type MenuItem = {
  label: string;
  onSelect: () => void;
  /** 되돌릴 수 없는 것 — 브랜드 초록으로 눈에 걸리게 한다. */
  danger?: boolean;
};

export default function MoreMenu({
  label = "더보기",
  items,
  children,
}: {
  /** 단추를 읽어 주는 말 — 「댓글 더보기」처럼 무엇의 것인지 밝힌다. */
  label?: string;
  items: MenuItem[];
  /** 「⋯」 자리에 그릴 것. 화면마다 점 세 개의 생김새가 다르다. */
  children: React.ReactNode;
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

  return (
    <div ref={root} className="relative flex">
      <button
        type="button"
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((on) => !on)}
        className="tap flex"
      >
        {children}
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute top-[21px] right-0 z-20 w-[118px] overflow-hidden rounded-[10px] border border-[#e5e5e5] bg-white shadow-[0px_3px_8px_0px_rgba(0,0,0,0.12)]"
        >
          {items.map((item, index) => (
            <div key={item.label}>
              {index ? <div className="h-px w-full bg-[#f0f0f0]" /> : null}
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setOpen(false);
                  item.onSelect();
                }}
                className={`flex w-full px-[14px] py-[11px] text-left text-[13px] leading-[1.4] ${
                  item.danger ? "font-medium text-primary-600" : "text-[#17171a]"
                }`}
              >
                {item.label}
              </button>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
