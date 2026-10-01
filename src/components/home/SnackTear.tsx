/**
 * 과자 봉지의 윗입구 — 홈 진열대 과학 매대. 고르면 위 봉한 띠가 뜯겨 날아가고
 * 팝콘 두 알이 튀어 올라 봉지 위에 떠 있다(사용자 요청 — 뜯긴 띠가 매달려 있지
 * 말고, 과자는 봉지에 붙어 있지 말고 튀어 오른 느낌으로. 감자칩 · 고깔 · 오레오를
 * 거쳐 팝콘으로 — 터져 부푼 구름 모양이라 이 크기에서도 한눈에 읽힌다).
 *
 * <img> 안의 조각은 CSS 로 움직일 수 없어서, 그림 파일(snack*.svg)의 윗띠(y 0 ~
 * 11.56 — 톱니 · 봉한 띠)는 마스크로 가리고(globals.css .snack-body) 같은 조각을
 * 여기서 다시 그린다. 좌표 · 색은 snack1-on.svg 의 Vector_2 ~ 7 그대로(세 봉지가
 * 같다). 닫혀 있으면 그림 파일과 다르지 않다.
 *
 * 고르면 (1) 띠가 왼쪽 아래 모서리를 축으로 젖혀지며 오른쪽 위로 날아가 사라지고,
 * (2) 그 밑에 감춰 두었던 찢긴 자국 — 봉지 앞면의 들쭉날쭉한 윗선(edge)과 그 위로
 * 비치는 봉지 속(mouth) — 이 드러나며, (3) 한 박자 뒤 속에서 팝콘 두 알이 튀어
 * 올라 봉지 위 공중에 선다 — 왼쪽은 크게 왼쪽으로, 오른쪽은 작게 오른쪽으로 기울여
 * 서로 떨어져 있고, 뜬 채로 천천히 오르내린다(.snack-bob). 튀어 오르기 전에는 봉지
 * 속(앞면 윗선 뒤)에 숨어 있어 「안에서 나온」 것으로 보인다. 움직임은 globals.css
 * 의 .snack-strip · .snack-chip · .snack-bob. 다른 봉지로 옮기면 띠가 돌아와 붙고
 * 팝콘은 도로 들어간다.
 *
 * 색은 고르면 초록, 아니면 회색 — 그림 파일의 on / off 짝과 같은 값. 속은 띠보다
 * 조금 더 어둡다. 팝콘은 봉지와 같은 연한 초록 계열 — 회색일 때는 어차피 안 나온다.
 */

const PAINT = {
  on: { body: "#BEC995", seal: "#8B9C4C", inside: "#6C7A38" },
  off: { body: "#D1D1D1", seal: "#8B8C8C", inside: "#707070" },
};

/** 봉지 앞면의 찢긴 윗선 — 3px 남짓한 톱니. 밑은 몸통(y 11.56)과 겹쳐 이음새가 없다 */
const EDGE =
  "M0 13V11.2L4 9.5L8.5 11.3L13 9.2L18 11.4L23.5 9.6L28 11.2L33 9.3L38.5 11.4L43 9.7L48 11.3L53.5 9.2L58 11.4L63 9.6L68 11.2L73 9.4L78 11.4L83 9.7L87.5 11.2L91 9.9V13Z";

/**
 * 팝콘 한 알 — 터져서 여섯 갈래로 부푼 구름 모양. 원점은 알 가운데, 폭 24. 봉지와
 * 같은 연한 초록 계열이다(사용자 요청 — 크림색은 팝콘만 튀었다): 몸은 봉지 몸통보다
 * 옅은 초록빛 크림, 겉선 · 주름은 봉지 몸통 톤, 터지고 남은 껍질은 봉한 띠의 진한
 * 초록, 위쪽 갈래 하나에 더 옅은 볕. 놓을 자리 · 기울기 · 크기는 바깥 g 가 정한다.
 */
function Popcorn() {
  return (
    <>
      <path
        d="M-10 0C-11 -5 -6 -8 -3 -6C-2 -10 5 -10 6 -6C11 -7 13 -1 10 2C13 6 8 10 4 8C2 12 -5 11 -6 8C-11 8 -13 3 -10 0Z"
        fill="#EAF0D2"
        stroke="#A9B86E"
        strokeWidth="0.9"
        strokeLinejoin="round"
      />
      {/* 갈래 사이 주름 */}
      <path d="M-3 -6C-2 -3 -1 -1 0 0M6 -6C4 -3 2 -1 0 0M4 8C2 5 1 2 0 0" fill="none" stroke="#C5D19A" strokeWidth="0.8" strokeLinecap="round" />
      {/* 볕 */}
      <ellipse cx="2" cy="-5.5" rx="2.6" ry="1.6" fill="#F7FAE9" opacity="0.9" />
      {/* 터지고 남은 껍질 */}
      <ellipse cx="-1" cy="5.5" rx="2.2" ry="1.5" fill="#8B9C4C" />
    </>
  );
}

export default function SnackTear({ on }: { on: boolean }) {
  const paint = on ? PAINT.on : PAINT.off;

  return (
    <svg
      viewBox="0 0 91 107"
      aria-hidden
      data-open={on || undefined}
      className="snack pointer-events-none absolute inset-0 h-full w-full overflow-visible"
    >
      {/* 봉지 속 — 찢긴 선 위로 비친다 */}
      <path d="M3 11.8C20 5 71 5 88 11.8Z" fill={paint.inside} />

      {/*
        팝콘 둘 — 봉지 위 공중에 뜬다(그림 위 y < 0). 튀어 오르기 전엔 봉지 속에
        숨어 있으므로 앞면 윗선보다 먼저 그린다. 오른쪽 것이 작다.
        자리 · 기울기 · 크기는 바깥 g(속성), 튀어 오르는 움직임은 가운데 g(.snack-chip),
        떠서 오르내리는 것은 안쪽 g(.snack-bob) — 한 요소에 두면 서로 지운다.
      */}
      <g transform="translate(63 -11) rotate(16) scale(0.75)">
        <g className="snack-chip">
          <g className="snack-bob">
            <Popcorn />
          </g>
        </g>
      </g>
      <g transform="translate(29 -16) rotate(-12) scale(1.05)">
        <g className="snack-chip">
          <g className="snack-bob">
            <Popcorn />
          </g>
        </g>
      </g>

      {/* 앞면의 찢긴 윗선 */}
      <path d={EDGE} fill={paint.body} />

      {/* 봉한 띠 — Vector_2, 톱니 Vector_3 ~ 7. 뜯기면 날아가 사라진다 */}
      <g className="snack-strip">
        <path d="M91 3.46828H0V11.5631H91V3.46828Z" fill={paint.seal} />
        <path
          d="M0 3.4685V2.01077C0 1.02688 1.0372 0.391799 1.91634 0.836028L7.08257 3.46521L14.3364 0.121971C14.692 -0.0425587 15.1036 -0.0392682 15.4559 0.128552L22.4462 3.4685H0Z"
          fill={paint.seal}
        />
        <path
          d="M91 3.46828V2.01055C91 1.02666 89.9628 0.391577 89.0836 0.839097L83.9174 3.46828L76.6636 0.121749C76.308 -0.04278 75.8964 -0.0394894 75.5441 0.12833L68.5537 3.46828H91.0033H91Z"
          fill={paint.seal}
        />
        <path
          d="M22.4495 3.46828L29.7065 0.121749C30.0622 -0.04278 30.4737 -0.0394894 30.8261 0.12833L37.8164 3.46828H22.4495Z"
          fill={paint.seal}
        />
        <path
          d="M37.8164 3.46828L45.0735 0.121749C45.4291 -0.04278 45.8407 -0.0394894 46.193 0.12833L53.1834 3.46828H37.8164Z"
          fill={paint.seal}
        />
        <path
          d="M53.1836 3.46828L60.4407 0.121749C60.7963 -0.04278 61.2079 -0.0394894 61.5602 0.12833L68.5506 3.46828H53.1836Z"
          fill={paint.seal}
        />
      </g>
    </svg>
  );
}
