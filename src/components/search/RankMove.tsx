import Img from "@/components/common/Img";
import type { RankMove as Move } from "@/types/search";

/**
 * 순위가 어떻게 움직였는지 — Figma 556:5287.
 *
 * 오른쪽 끝에 붙는 작은 표시다. 새로 들어온 것은 검은 뱃지, 제자리는 짧은
 * 막대, 오르내림은 화살표에 칸 수를 붙인다. 내림은 같은 화살표를 뒤집어 쓴다.
 */
export default function RankMove({ move }: { move: Move }) {
  if (move.kind === "new") {
    return (
      // 색은 홈 맨 위 공지의 NEW! 와 같은 값을 쓴다 — 같은 「새로 들어옴」 표시다
      <span className="flex shrink-0 items-start rounded-[4px] bg-yellow-500 px-[6px] py-[2.5px] text-[9px] leading-[13px] font-bold tracking-[-0.18px] text-gray-900">
        NEW
      </span>
    );
  }

  if (move.kind === "same") {
    return <span aria-label="변동 없음" className="h-[2px] w-[9px] shrink-0 rounded-[1px] bg-[#bdbdc0]" />;
  }

  const down = move.kind === "down";
  return (
    <span
      aria-label={`${down ? "하락" : "상승"} ${move.by}`}
      className="flex shrink-0 items-center gap-[3px]"
    >
      <Img src="/assets/search/up.svg" className={`size-3 ${down ? "rotate-180" : ""}`} />
      <span className="text-[11px] leading-4 font-medium tracking-[-0.22px] text-[#6a6a6e] tabular-nums">
        {move.by}
      </span>
    </span>
  );
}
