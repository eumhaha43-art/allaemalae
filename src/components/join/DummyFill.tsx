/**
 * 더미 단추 — 시연용 글이 칸에 들어 있는지 켜고 끈다.
 *
 * 화면은 더미가 들어찬 채로 열리고, 그때 이 단추는 켜진 채 「직접 입력하기」로
 * 보인다. 들어찬 글은 그대로 고쳐 써도 된다. 한 번 누르면 칸을 죄다 비워
 * 처음부터 손으로 넣을 수 있고, 단추는 「더미 텍스트 입력」이 되어 다시 누르면
 * 더미가 도로 들어온다 — 글자는 늘 누르면 일어날 일을 적는다.
 *
 * 글쓰기 화면에 있는 같은 이름의 단추와 생김새를 맞춘다. 진짜 입력칸이 아니라
 * 시연용 장치라 점선 테두리로 둘러 본문과 갈라 두고, 켜져 있을 때는 메인 색으로
 * 채워 지금 더미가 들어 있음을 보인다.
 */
export default function DummyFill({
  label,
  on,
  onToggle,
}: {
  /** 지금 상태에 맞는 글자 — 켜져 있으면 「직접 입력하기」, 꺼져 있으면 「더미 텍스트 입력」. */
  label: string;
  /** 더미가 들어 있는지. */
  on: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onToggle}
      className={`tap [--tap-w:0px] flex h-[28px] shrink-0 items-center justify-center rounded-full border px-3 text-[11px] leading-none font-medium transition-colors active:opacity-55 ${
        on
          ? "border-primary-600 bg-primary-600 text-white"
          : "border-dashed border-primary-600 text-primary-700"
      }`}
    >
      {label}
    </button>
  );
}
