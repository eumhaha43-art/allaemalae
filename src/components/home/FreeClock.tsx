/**
 * 무료 지식 옆 시계 — Figma 856:8037.
 *
 * 내보낸 clock.svg 는 <img> 안에 들어가 바늘을 돌릴 수 없어서, 같은 path 를
 * 그대로 옮겨 인라인으로 그린다. 원과 바늘 모양·굵기는 파일과 같고 바늘만
 * 초에 맞춰 돈다. 색은 옆의 남은 시간과 맞춰야 해서 밖에서 받는다.
 */
export default function FreeClock({ seconds, color }: { seconds: number; color: string }) {
  return (
    <svg
      width="50"
      height="50"
      viewBox="0 0 50 50"
      fill="none"
      aria-hidden
      className="shrink-0"
    >
      <path
        d="M25 47.7273C37.803 47.7273 48.1818 37.5519 48.1818 25C48.1818 12.4481 37.803 2.27273 25 2.27273C12.197 2.27273 1.81818 12.4481 1.81818 25C1.81818 37.5519 12.197 47.7273 25 47.7273Z"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* 1초에 6도씩. 12시 방향에서 시작하도록 원 중심을 축으로 돌린다. */}
      <g transform={`rotate(${seconds * 6} 25 25)`}>
        <path
          d="M24.5455 10.4545L24.5455 25L24.5455 16.5152"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
}
