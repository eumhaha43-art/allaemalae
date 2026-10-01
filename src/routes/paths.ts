/** Routes that take over the whole screen — no tab bar, no home indicator. */
const FULLSCREEN = [
  "/community/write",
  "/community/chat/new",
  "/community/post",
  "/my",
  "/ai",
  "/login",
  "/gacha",
  // 온보딩은 아직 앱에 들어오기 전이라 탭 바가 없다 — 인디케이터는 스스로 그린다
  "/onboarding",
];

/** The 토론방 room and its 근거 달기 sub-page. */
const DEBATE_ROOM = /^\/community\/debate\/[^/]+/;

/**
 * 채팅방 안(대화 화면) — 방 만들기(/community/chat/new)는 아니다.
 *
 * 탭 바 없이 입력바가 바닥에 닿는 전체화면이고, 알래봇과 데모 계정 칩도 뜨지
 * 않는다(사용자 결정 — 폰에 내려받아 보면 탭 바가 대화 밑에 그대로 살아 있었다).
 */
export function isChatRoomRoute(pathname: string): boolean {
  return /^\/community\/chat\/[^/]+$/.test(pathname) && pathname !== "/community/chat/new";
}

/**
 * 토론방 상세 sits on a photo, so the status bar goes black with white glyphs
 * — Figma 805:3716. Its 근거 달기 sub-page (805:4304) is a white screen, and
 * the 토론방 list one level up stays light too.
 *
 * 알래봇은 화면이 통째로 검은 모니터라 상태바까지 이어져야 한다. 여기만
 * 희면 검은 화면 위에 흰 띠가 얹힌 것으로 보인다.
 */
export function isDarkStatusRoute(pathname: string): boolean {
  return /^\/community\/debate\/[^/]+$/.test(pathname) || pathname === "/ai";
}

/**
 * 탭 바만 감추는 화면 — 회원가입 · 설문. 아직 앱에 들어오기 전이라 갈 탭이
 * 없지만, 디자인에는 홈 인디케이터가 그려져 있다. 전체화면(`FULLSCREEN`)으로
 * 넣지 않는 것은 홈 인디케이터까지 사라지기 때문이다.
 *
 * 알림은 전에 여기 있었다 — 종을 눌러 잠깐 들어왔다 나가는 곳이라 탭 바를
 * 뺐는데, 다른 화면과 달리 알림에서만 아래가 사라져 뒤로가기 말고는 갈 길이
 * 없었다(감수 지적). 이제 탭 바를 둔다.
 */
const NO_TAB_BAR = ["/join", "/survey"];

export function hidesTabBar(pathname: string): boolean {
  return (
    isFullscreenRoute(pathname) ||
    NO_TAB_BAR.some((route) => pathname === route || pathname.startsWith(`${route}/`))
  );
}

export function isFullscreenRoute(pathname: string): boolean {
  return (
    FULLSCREEN.some((route) => pathname === route || pathname.startsWith(`${route}/`)) ||
    // Both debate screens draw their own home indicator.
    DEBATE_ROOM.test(pathname) ||
    // 채팅방도 — 입력바가 제 인디케이터를 그린다(ChatComposer indicator)
    isChatRoomRoute(pathname)
  );
}

/**
 * 탭 바 위에 한 겹 더 깔리는 화면들.
 *
 * 떠 있는 알래봇은 탭 바만 피해 뜨는데, 그 위에 입력줄이나 큰 단추가 한 겹 더
 * 있으면 그것을 덮어 아예 누를 수 없게 된다. 겹치는 층의 종류를 여기서 정하고
 * 얼마나 올릴지는 버튼 쪽에서 정한다.
 */
export type BottomLayer = "composer" | "comments" | "bare";

export function bottomLayer(pathname: string): BottomLayer | null {
  // 채팅방 — 메시지 입력줄
  if (/^\/community\/chat\/[^/]+$/.test(pathname) && pathname !== "/community/chat/new") {
    return "composer";
  }
  // 게시글 상세 — 댓글 입력줄(홈 인디케이터까지 제 몸에 지닌 96)
  if (isPostDetailRoute(pathname)) return "comments";
  // 글쓰기 — 바닥에 아무것도 없다(탭 바도 인디케이터도)
  if (pathname === "/community/write") return "bare";
  return null;
}

/**
 * 전체화면인데도 알래봇이 뜨는 화면.
 *
 * 게시글 상세 — 알래봇이 내민 글 카드로 왔다가 봇으로 돌아갈 길이 없으면
 * 대화가 거기서 끊긴다. 글쓰기는 전에 여기 있었는데 뺐다(사용자 결정) —
 * 쓰는 화면에는 떠 있는 것이 없어야 한다.
 */
export function keepsAiButton(pathname: string): boolean {
  return isPostDetailRoute(pathname);
}

export function isPostDetailRoute(pathname: string): boolean {
  return /^\/community\/post\/[^/]+$/.test(pathname);
}

/**
 * 알래봇을 아예 띄우지 않는 화면.
 *
 * 장바구니는 카드마다 오른쪽 위에 고르기 단추가 있어, 떠 있는 버튼을 어느
 * 높이에 두어도 그중 하나를 덮는다 — 올려서 영수증 뽑기를 피하면 카드를
 * 가린다. 디자인에도 이 화면에는 알래봇이 없다.
 *
 * 기록도 같은 이유다 — 꾸미기 화면이 한 장에 딱 맞게 짜여 있어서 떠 있는
 * 버튼이 「기록 저장하기」를 덮는다. 하위 화면까지 함께 빠지도록 앞자리로
 * 견준다.
 *
 * 알림은 종을 눌러 잠깐 들어왔다 나가는 목록이라 알래봇을 부를 자리가 아니다
 * — 탭 바를 뺀 것(`NO_TAB_BAR`)과 같은 까닭이다.
 *
 * 지식 상세는 맨 아래에 제 「AI에게 물어보기」 단추가 있다(1632:7661). 떠 있는
 * 알래봇까지 두면 같은 자리에서 그 단추를 덮는다.
 */
const NO_AI_BUTTON = ["/cart", "/record", "/join", "/survey", "/notifications", "/menu/knowledge"];

/**
 * 커뮤니티 목록(게시글 · 채팅방 · 토론방)에는 글쓰기 · 방 만들기 단추(ActionFab)
 * 와 알래봇이 함께 뜬다(사용자 결정 — 커뮤니티에서 알래봇이 없어졌다). ActionFab
 * 이 알래봇 바로 위 한 칸에 서도록 자리를 잡아 두어 겹치지 않는다. 글쓰기 화면은
 * 전체화면(bare)이라 알래봇이 없다 — 거기서는 없어야 한다(사용자 결정).
 */
export function hidesAiButton(pathname: string): boolean {
  return (
    NO_AI_BUTTON.some((route) => pathname === route || pathname.startsWith(`${route}/`)) ||
    // 채팅방 — 대화 위에 떠 있을 것이 없다(사용자 결정)
    isChatRoomRoute(pathname)
  );
}

/** 채팅방 홈(로비). 목록이 아니라 테이블 화면일 때 상단이 어두워진다. */
export function isChatLobbyRoute(pathname: string): boolean {
  return pathname === "/community/chat";
}
