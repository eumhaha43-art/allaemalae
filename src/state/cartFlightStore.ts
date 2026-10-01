"use client";

/**
 * 탭 바 장바구니 배지 — 이 탭에서 담은 개수.
 *
 * 담은 목록(`reactionStore.saved`)을 세지 않고 담기 동작을 센다 — 담으면
 * 하나 오르고 도로 빼면 하나 내려간다. 배지는 「넣었다」를 알리는 자리라
 * 무엇이 들어 있는지가 아니라 몇 번 넣었는지가 맞다.
 *
 * 이 판(page load)에만 산다. 담은 목록이 새로고침에 비워지므로(시연을 매번
 * 처음부터 할 수 있게 — reactionStore 참고) 배지도 같이 0 으로 돌아가야
 * 한다. 담긴 게 없는데 숫자만 남아 있으면 거짓말이 된다.
 *
 * 닿기 전에는 세지 않는다. 담기를 누르면 저장소에는 바로 들어가지만, 그림이
 * 아직 날아가고 있는데 배지가 먼저 오르면 바구니가 먼저 「받았다」고 하는
 * 셈이다. 그림이 닿는 순간 오른다. 다른 저장소들과 같은 모양
 * (`useSyncExternalStore`)이다.
 *
 * 날리는 것 자체도 여기서 한다 — 누른 단추의 그림을 복사해 기기 화면 위에
 * 띄우고, 탭 바의 장바구니 자리로 던진다. React 바깥의 DOM 요소 하나로
 * 끝나는 일이라 상태로 들 것이 없다.
 */

let added = 0;
const listeners = new Set<() => void>();

function set(next: number) {
  added = Math.max(0, next);
  listeners.forEach((notify) => notify());
}

export function subscribeCartBadge(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getCartBadge(): number {
  return added;
}

/** 서버는 누가 뭘 담았는지 모른다 — 배지 없이 그린다. */
export function getCartBadgeServerSnapshot(): number {
  return 0;
}

/** 장바구니에서 뺐다 — 바로 하나 내린다. 빼는 데는 연출이 없다. */
export function takeOutOfCart(): void {
  set(added - 1);
}

/**
 * 탭 바 봉투의 입구 — 그림이 날아가는 동안 벌어져 있다가(봉투가 기울어 받을
 * 채비) 들어가면 닫힌다(NavBag 이 그린다). 개수는 닫히면서 뜬다(사용자 요청).
 * 이름은 냉장고 문이던 때의 것 그대로다.
 */
export type FridgeDoor = "closed" | "open";

let door: FridgeDoor = "closed";
const doorListeners = new Set<() => void>();

function setDoor(next: FridgeDoor): void {
  if (door === next) return;
  door = next;
  doorListeners.forEach((notify) => notify());
}

export function subscribeFridgeDoor(listener: () => void): () => void {
  doorListeners.add(listener);
  return () => doorListeners.delete(listener);
}

export function getFridgeDoor(): FridgeDoor {
  return door;
}

export function getFridgeDoorServerSnapshot(): FridgeDoor {
  return "closed";
}

/** 입구가 닫히는 시간 — 그 끝에 개수가 뜬다. NavBag(.nav-bag) 의 transition 과 같은 값. */
const DOOR_CLOSE_MS = 200;

/** 날아가는 시간. 이보다 짧으면 어디로 갔는지 안 보이고, 길면 기다리게 된다. */
const FLIGHT_MS = 620;
/**
 * 곡선의 조절점을 출발점보다 이만큼 위에 둔다 — 직선으로 가면 미끄러지는
 * 것이지 던진 것이 아니다. 실제로 솟는 높이는 이보다 훨씬 낮다(2차 베지어는
 * 조절점까지 가지 않는다): 탭 바까지 400 을 내려가는 길에서 20 남짓 뜬다.
 */
const TOSS_PX = 110;

/**
 * 장바구니에 담았다 — 단추 자리에서 탭 바의 장바구니까지 그림 한 장을 던지고,
 * 닿는 순간 배지를 하나 올린다.
 *
 * 던질 수 없으면 바로 올린다 — 탭 바가 없는 화면(전체화면 · 키보드), 탭 바가
 * 팝업 밑에 깔린 때, 움직임을 줄인 설정.
 *
 * 좌표는 기기 화면(`data-app-screen`) 기준으로 잡는다. PC 목업은 화면을
 * transform 으로 줄여 그리므로, 브라우저 좌표(getBoundingClientRect)를 그대로
 * 쓰면 줄어든 만큼 어긋난다 — 화면 상자의 실제 폭과 그린 폭의 비로 되돌린다.
 */
export function putIntoCart(from: HTMLElement): void {
  if (!fly(from)) set(added + 1);
}

/**
 * 날아가는 그림 — 속이 찬 봉투(bag-fill.svg, 시안 봉투의 바깥 윤곽만 채운 것).
 * 단추의 선 아이콘을 그대로 던졌더니 가늘어서 날아가는 게 잘 안 보였다(사용자
 * 지적) — 면으로 채운 것을 던진다.
 */
const FLIGHT_ICON = "/assets/home/bag-fill.svg";

/** 그림을 던진다. 던질 수 없는 자리면 false — 세는 건 부른 쪽이 한다. */
function fly(from: HTMLElement): boolean {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;

  const screen = document.querySelector<HTMLElement>("[data-app-screen]");
  const target = document.querySelector<HTMLElement>("[data-nav-cart]");
  if (!screen || !target) return false;

  /*
    가운데를 찔러 봐서 탭 링크가 안 잡히면 뭔가가 덮고 있는 것이다. 자리
    상자가 아니라 링크로 재는 이유: 링크의 `tap` 손가락 판(::after)이 상자
    위에 깔려 있어, 찌르면 상자가 아니라 링크가 잡힌다.
  */
  const targetRect = target.getBoundingClientRect();
  const hit = document.elementFromPoint(
    targetRect.left + targetRect.width / 2,
    targetRect.top + targetRect.height / 2,
  );
  const link = target.closest("a") ?? target;
  if (!hit || !link.contains(hit)) return false;

  const screenRect = screen.getBoundingClientRect();
  const scale = screenRect.width / screen.offsetWidth || 1;
  const local = (rect: DOMRect) => ({
    x: (rect.left - screenRect.left) / scale,
    y: (rect.top - screenRect.top) / scale,
    w: rect.width / scale,
    h: rect.height / scale,
  });
  const pressed = local(from.getBoundingClientRect());
  const end = local(targetRect);

  /*
    작은 단추(추천 카드의 15px)에서 뜬 그림은 날아가는 동안 안 보인다 — 최소
    22 로 키우되, 단추 한가운데에서 뜨도록 자리를 되잡는다.
  */
  const size = Math.max(pressed.w, pressed.h, 22);
  const start = {
    x: pressed.x + (pressed.w - size) / 2,
    y: pressed.y + (pressed.h - size) / 2,
    w: size,
    h: size,
  };

  const ghost = document.createElement("img");
  ghost.src = FLIGHT_ICON;
  ghost.alt = "";
  ghost.setAttribute("aria-hidden", "true");
  ghost.style.cssText = `position:absolute;left:${start.x}px;top:${start.y}px;width:${start.w}px;height:${start.h}px;pointer-events:none;z-index:60;will-change:transform,offset-distance`;
  screen.appendChild(ghost);

  const head = { x: start.x + start.w / 2, y: start.y + start.h / 2 };
  const tail = { x: end.x + end.w / 2, y: end.y + end.h / 2 };

  /*
    길은 곡선 하나(2차 베지어)로 긋고 그 위를 한 번의 easing 으로 지난다.
    「위로 갔다가 내려온다」를 키프레임 두 토막으로 이었더니 꼭짓점에서 속도가
    0 이 되어 공중에 멈췄다 보였다 — 곡선 위를 한 호흡으로 가면 그 자리가 없다.
    조절점은 출발점보다 TOSS_PX 위, 가로로는 3분의 1 지점이다.
  */
  const arc = `path("M ${head.x.toFixed(1)} ${head.y.toFixed(1)} Q ${(head.x + (tail.x - head.x) / 3).toFixed(1)} ${(head.y - TOSS_PX).toFixed(1)} ${tail.x.toFixed(1)} ${tail.y.toFixed(1)}")`;
  const canArc = CSS.supports("offset-path", arc);
  if (canArc) {
    /*
      길 위의 점에 그림의 한가운데(offset-anchor 기본값)를 맞춘다. 길 좌표를
      기기 화면 기준으로 적었으므로 그림 자체는 화면 왼쪽 위(0, 0)에 두어야
      좌표가 두 번 더해지지 않는다.
    */
    ghost.style.left = "0px";
    ghost.style.top = "0px";
    ghost.style.offsetPath = arc;
    ghost.style.offsetRotate = "0deg";
  }

  const flight = { duration: FLIGHT_MS, fill: "forwards" as const };
  /*
    크기는 길과 따로 간다 — 손을 떠나며 1.5 배로 부풀었다가 바구니에 들어가며
    0.25 배로 줄어든다. 커지는 쪽을 앞(30%)에 두어야 「뜬다」가 먼저 읽힌다.
  */
  ghost.animate(
    [
      { transform: "scale(1)", opacity: 1 },
      { transform: "scale(1.5)", opacity: 1, offset: 0.3 },
      { transform: "scale(0.25)", opacity: 0.9 },
    ],
    { ...flight, easing: "cubic-bezier(0.4, 0, 0.6, 1)" },
  );
  const animation = ghost.animate(
    canArc
      ? [{ offsetDistance: "0%" }, { offsetDistance: "100%" }]
      : // offset-path 가 없는 브라우저 — 곧장 간다
        [
          { translate: "0 0" },
          { translate: `${(tail.x - head.x).toFixed(1)}px ${(tail.y - head.y).toFixed(1)}px` },
        ],
    { ...flight, easing: "cubic-bezier(0.45, 0.05, 0.55, 0.95)" },
  );

  // 던지자마자 입구를 벌린다 — 봉투가 기울어 받을 채비를 한다
  setDoor("open");

  const land = () => {
    // 끝나는 신호와 안전 시계가 둘 다 오므로 한 번만 센다
    if (!ghost.isConnected) return;
    ghost.remove();
    // 들어갔다 — 입구를 닫고(봉투가 납작해졌다 튀어 오른다), 그 박자에 개수가 뜬다
    setDoor("closed");
    window.setTimeout(() => set(added + 1), DOOR_CLOSE_MS);
  };
  animation.addEventListener("finish", land);
  // 숨은 탭에서는 애니메이션이 멈춰 finish 가 안 온다 — 숫자는 그래도 올라야 한다
  window.setTimeout(land, FLIGHT_MS + 400);
  return true;
}
