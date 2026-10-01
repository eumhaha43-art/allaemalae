/**
 * 팡파레 — 퀴즈를 다 맞혔을 때 동그란 그림 한가운데에서 터진다.
 *
 * 조각이 원 중심에서 사방으로 튀어 나가며 돌다가 잦아든다. 한 번에 다 뿌리면
 * 순식간에 지나가서 두 겹으로 나눠 터뜨린다 — 앞 겹이 퍼지는 동안 뒤 겹이
 * 뒤따라 터져 한동안 이어진다.
 *
 * 끝없이 돌리지는 않는다 — 작은 팝업이라 계속 움직이면 산만하고, 정작 눌러야
 * 할 「나가기」에서 눈이 떠난다. 한 번 축하하고 가라앉는 게 맞다.
 *
 * 방향과 거리는 자리 번호로 계산한다. 난수를 쓰면 서버와 브라우저가 다른
 * 그림을 그려 경고가 나고 다시 그릴 때마다 튄다.
 *
 * 색은 앱 팔레트에서 골랐다 — 초록 · 노랑 · 분홍 · 보라 · 파랑.
 */
const COLORS = ["#008154", "#f9b208", "#ff77b7", "#7c73e6", "#008ede"];

/**
 * 터지는 자리 — 결과 그림(156)이 위에서 53 에 놓이므로 그 한가운데는 131 이다.
 * 그림 위치를 바꾸면 여기도 같이 바꿔야 한다.
 */
const ORIGIN_TOP = 131;

type Piece = { dx: number; dy: number; spin: number; delay: number; wide: boolean };

/** 한 겹 — 개수 · 퍼지는 거리 · 언제 터질지를 받아 사방으로 고르게 흩는다. */
function ring(count: number, from: number, startDelay: number, seed: number): Piece[] {
  return Array.from({ length: count }, (_, i) => {
    // 정확히 등분하면 바퀴살처럼 보여서 자리마다 조금씩 어긋나게 둔다
    const angle = ((i + seed * 0.37) / count) * Math.PI * 2 + (i % 3) * 0.14;
    const distance = from + (i % 5) * 16;
    return {
      dx: Math.round(Math.cos(angle) * distance),
      dy: Math.round(Math.sin(angle) * distance),
      spin: ((i % 7) - 3) * 140,
      delay: startDelay + (i % 4) * 55,
      wide: i % 3 === 0,
    };
  });
}

const PIECES: Piece[] = [...ring(16, 92, 0, 0), ...ring(12, 74, 460, 1)];

export default function Confetti() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {PIECES.map((piece, index) => {
        const w = piece.wide ? 8 : 5;
        const h = piece.wide ? 8 : 11;
        return (
          <span
            key={index}
            className="confetti-piece absolute left-1/2 block rounded-[1px]"
            style={
              {
                top: ORIGIN_TOP,
                width: w,
                height: h,
                // 가운데 맞추기를 여백으로 한다 — transform 은 날아가는 데 쓰고 있다
                marginLeft: -w / 2,
                marginTop: -h / 2,
                backgroundColor: COLORS[index % COLORS.length],
                "--dx": `${piece.dx}px`,
                "--dy": `${piece.dy}px`,
                "--spin": `${piece.spin}deg`,
                "--delay": `${piece.delay}ms`,
              } as React.CSSProperties
            }
          />
        );
      })}
    </div>
  );
}
