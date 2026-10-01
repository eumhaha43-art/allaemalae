"use client";

/**
 * 「한 번 보여 주는 안내」가 떠 있는지 — 뽑기 사용법, 코인 안내가 같은 틀을 쓴다.
 *
 * 처음 들어온 사람에게는 저절로 떠 있다. 닫으면 이 판에서는 다시 안 뜨고,
 * 새 탭을 열면 처음 온 사람으로 돌아가야 시연을 다시 할 수 있어
 * `sessionStorage` 에 둔다.
 *
 * 「판」은 퍼소나를 고른 데서 다음 고르기까지다. 탭 단위로만 기억했더니 같은
 * 탭에서 시연을 두 번째 돌릴 때 안내가 안 떠, 없어진 것으로 보였다(사용자
 * 지적) — 퍼소나를 고르면 되돌린다(`reset`).
 *
 * 화면에서 `useEffect` 로 여는 편이 짧지만, 그리자마자 상태를 바꾸는 꼴이라
 * 다시 그리기가 한 번 더 돈다(react-hooks/set-state-in-effect). 바깥 값을 읽어
 * 오는 일이므로 다른 저장소들과 같은 모양으로 둔다.
 */
export type Guide = {
  subscribe: (listener: () => void) => () => void;
  get: () => boolean;
  /** 서버에는 sessionStorage 가 없다 — 닫힌 채로 그리고 브라우저에서 연다. */
  getServerSnapshot: () => boolean;
  /** 물음표 따위로 다시 부르기 */
  open: () => void;
  /** 닫으면 이 판에서는 저절로 뜨지 않는다. */
  close: () => void;
  /** 시연을 처음부터 다시 — 퍼소나를 새로 고르면 또 뜬다. */
  reset: () => void;
};

export function makeGuide(key: string): Guide {
  /**
   * 처음 값은 한 번만 정한다.
   *
   * `useSyncExternalStore` 는 그릴 때마다 이 값을 읽어 견주므로, 읽을 때마다
   * 새로 셈하면 같은 값이어도 계속 다시 그린다.
   */
  let open: boolean | null = null;
  const listeners = new Set<() => void>();

  const seen = (): boolean => {
    try {
      return window.sessionStorage.getItem(key) === "1";
    } catch {
      // 시크릿 모드 — 기억은 못 해도 이번에는 보여 준다
      return false;
    }
  };

  const tell = (): void => {
    listeners.forEach((notify) => notify());
  };

  return {
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    get() {
      if (open === null) open = !seen();
      return open;
    },
    getServerSnapshot() {
      return false;
    },
    open() {
      open = true;
      tell();
    },
    close() {
      open = false;
      try {
        window.sessionStorage.setItem(key, "1");
      } catch {
        // 못 적으면 다음에 또 뜬다 — 막을 일은 아니다
      }
      tell();
    },
    reset() {
      open = null;
      try {
        window.sessionStorage.removeItem(key);
      } catch {
        // 지울 것이 없으면 그만
      }
      tell();
    },
  };
}
