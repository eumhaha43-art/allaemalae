/**
 * 손톱만 한 영수증 — Figma 556:3061(월간 32x44) · 556:3225(주간 42x26).
 *
 * 달력 칸과 주간 막대가 같은 그림을 크기만 달리해 쓴다. 글자를 넣기에는 너무
 * 작아서 줄 다섯 개로 「영수증처럼 생긴 것」만 그린다 — 위아래 줄이 진하고
 * 가운데 셋이 흐린 것이 프레임의 짜임이다.
 *
 * 줄 자리와 길이는 32x44 에서 잰 값을 비율로 바꿔 두었다. 그래서 42x26 처럼
 * 가로로 눕혀도 같은 얼굴이 나온다.
 */

/** 꾸민 종이는 누렇다 — 기본 용지가 아니면 전부 그쪽으로 본다. */
const SKIN = {
  plain: { bg: "#ffffff", border: "#cfc4c5", ink: "#1a1c1c", faint: "#9a9a9e" },
  kraft: { bg: "#f3ecdf", border: "#e2d7c2", ink: "#8a7c66", faint: "#b6a88f" },
};

/** 줄 다섯 개 — [세로 자리, 길이, 굵은 줄인지] 를 폭·높이에 대한 비율로. */
const LINES = [
  { top: 0.159, width: 1, bold: true },
  { top: 0.341, width: 0.727, bold: false },
  { top: 0.477, width: 0.909, bold: false },
  { top: 0.614, width: 0.545, bold: false },
  { top: 0.75, width: 0.818, bold: true },
];

export default function MiniReceipt({
  decorated,
  width,
  height,
}: {
  /** 꾸민 영수증인지 — `isDecorated`. 꾸민 것만 누런 종이로 그린다. */
  decorated: boolean;
  width: number;
  height: number;
}) {
  const skin = decorated ? SKIN.kraft : SKIN.plain;
  const pad = Math.max(3, Math.round(width * 0.155));
  const inner = width - pad * 2;

  return (
    <span
      aria-hidden
      style={{ width, height, backgroundColor: skin.bg, borderColor: skin.border }}
      className="relative block shrink-0 border"
    >
      {LINES.map((line) => (
        <span
          key={line.top}
          style={{
            position: "absolute",
            left: pad,
            top: Math.round(height * line.top),
            width: Math.round(inner * line.width),
            height: line.bold ? 1.6 : 1.2,
            backgroundColor: line.bold ? skin.ink : skin.faint,
          }}
        />
      ))}
    </span>
  );
}
