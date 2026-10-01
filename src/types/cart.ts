/** 장바구니에 담긴 지식 한 칸 — Figma 1021:15139 */
export type CartItem = {
  id: string;
  /** 카드 위 파란 알약에 들어가는 분류 */
  tag: string;
  /** 카드 아래 제목. 디자인에서 줄을 나눠 놓은 그대로 쓴다. */
  title: string[];
  /**
   * 그림 — 홈에서 쓰던 것을 그대로 가져다 쓴다.
   *
   * 원본 크기가 제각각(32x26 ~ 76x60)이라 그냥 놓으면 어떤 건 크고 어떤 건
   * 작아 보인다. 모두 같은 정사각 칸 안에 비율대로 넣어 눈에 보이는 크기를
   * 맞춘다. 조각이 여럿인 그림만 비율이 달라 칸을 따로 준다.
   */
  art: {
    box?: string;
    /** width · height 는 갈래 그림처럼 제 크기로 놓을 때 — 없으면 className 이 정한다 */
    parts: { src: string; className: string; width?: number; height?: number }[];
  };
  /** 어느 탭에 들어가는지 — 담으면 곧 먹는 중이다(따로 「담아둠」이 없다). */
  state: "먹는 중" | "다 먹음";
  /** 먹는 중 — 어디까지 읽었는지(%). 홈의 「남겨둔 지식 상품」과 같은 값. 갓 담은 것은 0. */
  progress?: number;
};
