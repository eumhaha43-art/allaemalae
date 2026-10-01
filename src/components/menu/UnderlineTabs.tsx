"use client";

/**
 * 밑줄 탭 — Figma 965:5570.
 *
 * MY 화면 안쪽 탭과 햄버거 메뉴 · 장바구니가 같은 모양을 쓴다. 고른 칸만 글자가
 * 진해지고 아래에 2px 밑줄이 깔린다. 칸은 폭을 똑같이 나눠 가진다.
 */
export default function UnderlineTabs<T extends string>({
  tabs,
  value,
  onChange,
  dense,
}: {
  tabs: readonly T[];
  value: T;
  onChange: (tab: T) => void;
  /**
   * 한 칸 작은 탭 — MY 화면(1021:10369)만 14px · 높이 45 다. 칸이 셋이라
   * 「관심 카테고리」가 16px 로는 한 칸에 빠듯하다.
   */
  dense?: boolean;
}) {
  return (
    <div role="tablist" className="flex w-full shrink-0 border-b border-border px-6">
      {tabs.map((tab) => {
        const on = tab === value;
        return (
          <button
            key={tab}
            type="button"
            role="tab"
            aria-selected={on}
            onClick={() => onChange(tab)}
            className={`tap [--tap-w:0px] flex min-w-px flex-1 items-center justify-center leading-[1.3] font-medium transition-colors ${
              dense ? "h-[45px] text-sm" : "h-12 text-base"
            } ${on ? "border-b-2 border-primary-600 text-gray-black" : "text-gray-500"}`}
          >
            {tab}
          </button>
        );
      })}
    </div>
  );
}
