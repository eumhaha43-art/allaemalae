/**
 * 필수 동의 한 줄 — 초록 네모에 흰 체크, 옆에 글.
 *
 * 켜지면 네모가 메인 색으로 차고, 꺼지면 흰 바탕에 회색 테두리만 남는다.
 * 글은 켜고 끄는 것과 상관없이 같은 색이다 — 「필수」라 꺼져 있어도 읽혀야
 * 한다. 네모만이 아니라 줄 전체가 눌린다.
 */
export default function ConsentRow({
  label,
  on,
  onToggle,
}: {
  label: string;
  on: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={on}
      onClick={onToggle}
      className="tap [--tap-w:0px] flex w-full items-center gap-3 py-[10px] text-left transition-opacity active:opacity-55"
    >
      <span
        className={`flex size-[22px] shrink-0 items-center justify-center rounded-[6px] transition-colors ${
          on ? "bg-primary-600" : "border border-gray-300 bg-white"
        }`}
      >
        {on ? (
          <svg viewBox="0 0 12 9" className="h-[9px] w-3" aria-hidden fill="none">
            <path
              d="M1 4.5 4.5 8 11 1"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : null}
      </span>
      <span className="text-[15px] leading-[1.4] text-gray-700">{label}</span>
    </button>
  );
}
