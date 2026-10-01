/**
 * 알약 탭의 생김새 — Figma 856:5247.
 *
 * 커뮤니티(게시글·채팅방·토론방·나의 활동)와 검색(인기·최신·최근 검색)이
 * 같은 모양을 쓴다. 한쪽만 손대면 둘이 갈라지므로 값을 여기 한 곳에 둔다.
 *
 * 여기 있는 것은 **모양과 색뿐**이다 — 모서리 · 여백 · 글자 · 고른 칸 색.
 *
 * 폭과 바탕색은 각자 붙인다. 칸을 나누는 방식이 화면마다 다르고(커뮤니티는
 * 고른 칸이 80 고정, 검색은 똑같이 나눔), 바탕도 채팅방 홈에서는 밤 배경에
 * 맞춰 어두워진다. 폭까지 여기 넣었다가 검색 탭이 3등분되지 않았다.
 */
export const PILL_ROW = "flex rounded-lg p-1";

export const PILL_TAB =
  "tap [--tap-w:0px] flex items-center justify-center rounded-[4px] py-[9px] text-sm";

export const PILL_ON = "bg-primary-600 font-bold text-[#f1f1f1]";

/** 안 고른 칸 — 글자색은 바탕에 따라 달라서 각자 붙인다. */
export const PILL_OFF = "leading-[1.3] font-medium";
