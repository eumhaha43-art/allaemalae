"use client";

/**
 * 두 갈래 보기 전환 — Figma 939:6691 (바구니 / 목록).
 *
 * 알약 트랙 위에 고른 쪽만 흰 알약으로 떠오른다. 프레임이 고른 쪽에 좌우
 * 여백을 조금 더 주고 있어(12 vs 10) 그대로 따랐다.
 *
 * 어두운 줄에 놓일 때는 트랙만 바꾼다 — 프레임의 밝은 회색 트랙을 그대로
 * 쓰면 어두운 상단에서 혼자 밝게 뜬다.
 */
export default function ViewToggle<T extends string>({
  options,
  value,
  onChange,
  night = false,
  label,
}: {
  options: readonly (readonly [T, string])[];
  value: T;
  onChange: (next: T) => void;
  night?: boolean;
  /** 스크린 리더에 읽히는 이 전환의 이름. */
  label: string;
}) {
  return (
    <div
      role="tablist"
      aria-label={label}
      className={`flex items-center rounded-full p-[2px] ${
        night ? "bg-white/15" : "bg-[rgba(229,229,229,0.75)]"
      }`}
    >
      {options.map(([id, text]) => {
        const on = id === value;
        return (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={on}
            onClick={() => onChange(id)}
            className={`tap [--tap-w:0px] flex flex-col items-center justify-center rounded-full py-1 text-center text-[11px] leading-[16.5px] font-semibold ${
              on
                ? "bg-white px-3 text-[#171717]"
                : `px-[10px] ${night ? "text-white/60" : "text-[#737373]"}`
            }`}
          >
            {text}
          </button>
        );
      })}
    </div>
  );
}
