import type { ReactNode } from "react";
import styles from "@/components/home/RiseIn.module.css";

/**
 * 홈에 들어서면 섹션이 위에서부터 차례로 떠오른다(사용자 요청 — 참고 영상: 헤더는
 * 그대로, 판들이 아래에서 살짝 올라오며 나타남).
 *
 * 섹션 하나를 감싸고 순번(`order`)만큼 늦게 시작한다 — 80ms 씩 뒤로, 한 장은
 * 400ms. 키프레임은 CSS 모듈(RiseIn.module.css)에 있어 첫 칠부터 걸리므로 서버가
 * 그린 HTML 도 잠깐 보였다 사라지지 않는다. 화면(page.tsx)이 새로 붙을 때마다
 * 돈다 — 탭으로 홈에 돌아와도 다시 떠오른다.
 *
 * 감싸는 상자는 세로 흐름(main 의 flex-col)을 그대로 잇는다 — shrink-0 · flex-col
 * 이라 안의 섹션은 감싸기 전과 같은 자리 · 같은 폭이다.
 *
 * 순번은 여섯째(MAX_ORDER)까지만 늦어진다 — 봉투의 카드처럼 열 장 넘게 쌓이는
 * 곳에서 마지막 장이 1초 뒤에 뜨면 답답하다. 그 뒤 것들은 여섯째와 같이 뜬다.
 * 메뉴의 분야 카드 · 봉투의 카드도 같은 것을 쓴다.
 *
 * 서버 컴포넌트다 — 상태도 효과도 없다. 순번은 CSS 변수로만 넘긴다. `className` 은
 * 감싸는 상자에 덧붙는다 — 토론방 카드처럼 감싸던 상자의 여백(px-5)을 이어받을 때.
 */
/** 이보다 뒤 순번은 이만큼만 늦는다 */
const MAX_ORDER = 5;

export default function RiseIn({
  order,
  className = "",
  children,
}: {
  order: number;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      style={{ ["--rise-order" as string]: Math.min(order, MAX_ORDER) } as React.CSSProperties}
      className={`flex shrink-0 flex-col ${styles.rise} ${className}`}
    >
      {children}
    </div>
  );
}
