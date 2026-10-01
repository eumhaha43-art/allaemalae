/**
 * 큰 동작 단추의 생김새 — Figma 807:3271 (컴포넌트 / button).
 *
 * 화면 아래에 하나 놓여 그 화면의 주 동작을 받는 단추다. 컴포넌트는 354x42
 * 인데, 354 는 화면 폭 402 에서 양옆 여백 24 를 뺀 값이다.
 *
 * 여기 있는 것은 **높이 · 모서리 · 글자와 색뿐**이다 — 폭은 각자 붙인다.
 * 화면마다 잡는 방식이 다르다: 기록은 w-full, 장바구니는 아래 카드 격자와
 * 줄을 맞추려고 320, 꾸미기는 한 줄을 둘로 나눠 쓴다. 폭까지 여기 넣으면
 * 그 셋 중 둘이 어긋난다 — 알약 탭(`pillTabs`)에서 겪은 것과 같다.
 */
export const ACTION_BTN =
  "tap [--tap-w:0px] flex h-[42px] items-center justify-center rounded-[10px] text-base leading-[1.3] font-medium transition-opacity";

/** 켜짐 — 807:3270 */
export const ACTION_ON = "bg-primary-600 text-white active:opacity-80";

/**
 * 꺼짐 — 807:3269.
 *
 * 초록을 흐리게 지우는 대신 회색으로 내려앉는다. 흐린 초록은 「지금은 안
 * 되지만 곧 될 것」처럼 보이는데, 이 단추들은 조건을 채우기 전에는 아예
 * 눌리지 않는다.
 */
export const ACTION_OFF = "bg-gray-200 text-gray-600";

/** 못 누를 때 꺼진 모양으로 — `disabled` 를 쓰는 단추가 붙인다. */
export const ACTION_DISABLED = "disabled:bg-gray-200 disabled:text-gray-600";
