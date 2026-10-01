/**
 * 고른 우유의 열리는 입구 — 홈 진열대 역사 매대(사용자 요청, 시안 1970:3247 milkOpen).
 *
 * <img> 안의 조각은 CSS 로 움직일 수 없어서, 그림 파일(milk*.svg)의 지붕(y < 36.87)은
 * 마스크로 가리고(globals.css .milk-body) 그 자리에 지붕을 여기서 다시 그린다. 닫힌
 * 지붕은 milk1-on.svg 의 Vector · Vector_2 · Vector_3 그대로(세 우유의 지붕은 같은
 * 좌표 — 96 짝은 preserveAspectRatio=none 으로 95 에 눌린다). 열린 입구는 시안
 * milkOpen 의 조각(Vector_4 · 8 ~ 12) 그대로다 — 시안은 이 우유를 1.023 × 1.011 로
 * 키우고 (2.83, 3.71) 옮겨 그린 100 × 120 상자라, 그 반대 변환을 g 에 걸어 닫힌
 * 그림의 좌표로 맞춘다. 윗날(Vector_3)은 시안에서 x 40 에서 잘려 있고, 그 왼쪽이
 * 접혀 주둥이가 된다 — 그래서 윗날을 x 36.37(닫힌 좌표)에서 둘로 나눠 오른쪽은 늘
 * 두고 왼쪽만 닫힘 전용으로 둔다.
 *
 * 고르면 윗날 왼쪽이 자른 자리로 오그라들며 사라지고, 같은 자리에서 주둥이 조각이
 * 튀어나와 넘쳤다 자리 잡는다(globals.css .milk-seal · .milk-open). 다른 우유로 옮기면
 * 반대로 닫힌다.
 *
 * 색은 고르면 파랑, 아니면 회색 — 그림 파일의 on / off 짝과 같은 값.
 */

const PAINT = {
  on: { side: "#0079BC", roof: "#30ACF2", seal: "#139AE6", inside: "#EAF1F5" },
  off: { side: "#7F7F7F", roof: "#DADADA", seal: "#BBBBBB", inside: "#F3F3F3" },
};

/** 윗날을 나누는 자리(닫힌 좌표) — 시안의 x 40.03 */
const CUT = 36.37;

export default function MilkSpout({ on }: { on: boolean }) {
  const paint = on ? PAINT.on : PAINT.off;

  return (
    <svg
      viewBox="0 0 95 115"
      aria-hidden
      data-open={on || undefined}
      className="milk pointer-events-none absolute inset-0 h-full w-full overflow-visible"
    >
      {/* 오른쪽 마구리 — Vector */}
      <path d="M70.0166 36.8619L82.2421 10.597L95 33.2748Z" fill={paint.side} />
      {/* 앞지붕 — Vector_2. 열린 조각이 왼쪽 위를 덮는다 */}
      <path d="M0 36.8712H70.0165L82.242 10.597H11.1944Z" fill={paint.roof} />
      {/* 윗날 오른쪽 — Vector_3 의 x ≥ CUT */}
      <path
        d={`M${CUT} 0H79.1395C80.8385 0 82.2174 1.38774 82.2174 3.09764V10.597H${CUT}Z`}
        fill={paint.seal}
      />
      {/* 윗날 왼쪽 — 닫혀 있을 때만. 열리면 자른 자리로 오그라든다 */}
      <path
        className="milk-seal"
        d={`M14.2724 0H${CUT}V10.597H11.1944V3.09764C11.1944 1.38774 12.5733 0 14.2724 0Z`}
        fill={paint.seal}
      />

      {/* 열린 주둥이 — 시안 milkOpen 좌표 그대로, 바깥 g 가 닫힌 그림의 좌표로 되돌린다 */}
      <g transform="translate(-2.767 -3.668) scale(0.97771 0.98873)">
        <g className="milk-open">
          {/* 접힌 윗날 왼쪽 — Vector_4 */}
          <path d="M18.2868 16.0587L40.0271 14.4299V3.71476L18.6142 0L18.2868 16.0587Z" fill={paint.side} />
          {/* 앞지붕 왼쪽이 그늘로 — Vector_8 */}
          <path d="M2.86785 40.9376L18.2868 16.0587L40.0271 14.4299L2.86785 40.9376Z" fill={paint.seal} />
          {/* 주둥이 왼쪽 면 — Vector_9 */}
          <path d="M2.87099 40.9282L0.758673 13.7377L17.6761 14.6617L2.87099 40.9282Z" fill={paint.roof} />
          {/* 뽑혀 나온 윗날 끝 — Vector_10 */}
          <path
            d="M0.764821 13.838L0.0313324 6.12341C-0.189029 4.75151 0.755377 3.46419 2.13421 3.2512L18.6141 0L18.2773 16.0587L0.764821 13.838Z"
            fill={paint.seal}
          />
          {/* 입구 테 — Vector_11 */}
          <path
            d="M18.4726 6.91898C12.6299 5.88536 6.78713 4.85174 0.944406 3.82126L18.6142 0C25.7477 1.24034 32.9094 2.47755 40.0428 3.71476C40.0586 4.147 40.0271 4.58238 40.0428 5.01462C33.2431 5.56275 25.2692 6.37085 18.4726 6.91898Z"
            fill={paint.seal}
          />
          {/* 입구 속 — Vector_12 */}
          <path d="M3.80281 4.10315L18.1641 5.50324L37.2851 4.21591L18.6205 1.5473L3.80281 4.10315Z" fill={paint.inside} />
        </g>
      </g>
    </svg>
  );
}
