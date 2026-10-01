/**
 * 가입 흐름의 아래 단추 — Figma 1254:4034 · 1399:3136.
 *
 * 칸이 다 차기 전에는 회색으로 죽어 있다가, 다 차면 메인 색으로 살아난다 —
 * 「지금 누를 수 있는지」를 색 하나로 말해 주는 단추라 두 화면이 같이 쓴다.
 */
export default function JoinButton({
  label,
  on,
  onClick,
}: {
  label: string;
  /** 칸이 다 찼는지 — 색과 눌림이 함께 간다 */
  on: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={!on}
      onClick={onClick}
      className={`tap [--tap-w:0px] flex h-[42px] w-full items-center justify-center rounded-[10px] text-base leading-[1.3] font-medium transition-colors ${
        on
          ? "bg-primary-600 text-white active:opacity-80"
          : "bg-[#e8e8e8] text-[#6f7070]"
      }`}
    >
      {label}
    </button>
  );
}
