import Img from "@/components/common/Img";

/**
 * 설문 2·3 장이 함께 쓰는 한 줄 — Figma 1501:4232 · 1501:4282.
 *
 * 그림 하나와 한 줄 글. 고르면 초록 테두리가 두꺼워진다. 높이는 56 으로 두어
 * 손가락이 겨누기 쉽게 했다 — 프레임은 더 얕았는데, 줄 사이가 좁아 어느 줄을
 * 누르는지 눈으로 가늠하기 어려웠다.
 */
export default function PickRow({
  emoji,
  icon,
  label,
  on,
  onPick,
}: {
  /** 글자 그림(이모지) — 그림 파일이 없는 줄. 지금은 다 그림 파일이라 안 쓴다 */
  emoji?: string;
  /**
   * 그림 파일 — 난이도(1968:6552) · 알림 시간(1968:7180). 28 × 24 상자에 비율대로
   * 넣는다 — 높이만 맞추면 밤(41 × 25)처럼 납작한 그림이 옆으로 퍼진다.
   */
  icon?: string;
  label: string;
  on: boolean;
  onPick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onPick}
      className={`flex h-[clamp(44px,7.5vh,60px)] w-full items-center justify-center gap-[10px] rounded-[10px] bg-white transition-colors ${
        on ? "border-2 border-primary-600" : "border border-gray-300"
      }`}
    >
      {icon ? (
        <Img src={icon} className="h-6 w-7 shrink-0 object-contain" />
      ) : (
        <span aria-hidden className="text-[19px] leading-none">
          {emoji}
        </span>
      )}
      <span className="text-body-16 text-gray-black">{label}</span>
    </button>
  );
}
