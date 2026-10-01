import { recent, type ActivityEntry } from "../_data/activity";

/**
 * 「♥ 34 · 댓글 12 · 저장 87」 — 대표 지식 장과 최근 활동 카드가 같이 쓴다.
 *
 * 없는 값은 건너뛴다(토론방에는 저장이 없다). 첫 값(좋아요)만 굵다 — 프레임이
 * 그렇게 그렸고, 한 줄에서 눈이 먼저 갈 곳 하나만 세운다.
 */
export default function Stats({
  entry,
  className = "",
}: {
  entry: ActivityEntry;
  className?: string;
}) {
  const parts = [
    entry.likes === undefined ? null : `${recent.stat.likes} ${entry.likes}`,
    entry.comments === undefined ? null : `${recent.stat.comments} ${entry.comments}`,
    entry.saves === undefined ? null : `${recent.stat.saves} ${entry.saves}`,
  ].filter((part): part is string => part !== null);

  if (!parts.length) return null;

  return (
    <p className={`flex items-center gap-[6px] text-body-12 ${className}`}>
      {parts.map((part, index) => (
        <span key={part} className="flex items-center gap-[6px]">
          {index === 0 ? null : <span aria-hidden>·</span>}
          <span className={index === 0 ? "font-bold" : ""}>{part}</span>
        </span>
      ))}
    </p>
  );
}
