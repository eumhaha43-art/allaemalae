"use client";

import { takeOutOfCart } from "@/state/cartFlightStore";
import { getReactionsSnapshot, toggleSave } from "@/state/reactionStore";

/**
 * 장바구니에서 벌어진 일 — 뺀 것과 열어 본 것.
 *
 * 담긴 지식은 두 곳에서 온다. 홈에서 담은 것(`reactionStore.saved`)과
 * 처음부터 놓여 있는 것(`cart.ts` 의 items). 빼기는 앞의 것은 저장소에서
 * 지우면 되지만 뒤의 것은 고정 목록이라 「뺐다」를 따로 적어 둔다.
 *
 * 열어 본 것도 여기 적는다 — 담은 지식은 먹는 중 0% 로 시작하고, 지식 상세에
 * 들어가 본 만큼 오른다. 어디까지 봤는지(%)는 상세에서 넘긴 장 수로 센다 —
 * 마지막 장까지 봤으면 100, 곧 다 먹음이다.
 *
 * 열쇠는 장바구니 칸 id 가 아니라 지식 id(`knowledgeIdFor`)다 — 같은 지식이
 * 홈 · 뽑기 · 상세에서 서로 다른 이름으로 담기는데, 「들어가 봤다」는 이름과
 * 상관없이 지식 하나에 한 번이면 된다.
 *
 * 이 판(page load)에만 산다 — 담은 목록이 새로고침에 비워지는 것과 같은
 * 이유다(시연을 매번 처음부터). 다른 저장소들과 같은 모양(useSyncExternalStore).
 */

type State = {
  /** 고정 목록에서 뺀 지식의 id. */
  removed: string[];
  /** 열어 본 지식 — 지식 id → 어디까지 봤는지(%). 100 이면 다 봤다. */
  opened: Record<string, number>;
};

/** 값이 매번 새로 만들어지면 useSyncExternalStore 가 계속 다시 그린다. */
const EMPTY: State = { removed: [], opened: {} };

let state: State = EMPTY;
const listeners = new Set<() => void>();

function set(next: State) {
  state = next;
  listeners.forEach((notify) => notify());
}

export function subscribeCart(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getCartSnapshot(): State {
  return state;
}

/** 서버는 아무것도 안 뺐고 아무것도 안 열어 봤다. */
export function getCartServerSnapshot(): State {
  return EMPTY;
}

/**
 * 장바구니에서 뺀다.
 *
 * 홈에서 담은 것은 담은 목록에서 지우고 탭 바 배지도 하나 내린다. 고정
 * 목록의 것은 뺐다고 적어 둔다 — 둘 다 화면에서는 같이 사라진다.
 */
export function removeFromCart(ids: string[]): () => void {
  const saved = getReactionsSnapshot().saved;
  const removed = [...state.removed];
  /** 담은 목록에서 지운 것 — 되돌릴 때 도로 담는다 */
  const unsaved: string[] = [];
  /** 고정 목록에서 뺐다고 적은 것 — 되돌릴 때 적은 것을 지운다 */
  const struck: string[] = [];
  for (const id of ids) {
    if (saved.includes(id)) {
      toggleSave(id);
      takeOutOfCart();
      unsaved.push(id);
    } else if (!removed.includes(id)) {
      removed.push(id);
      struck.push(id);
    }
  }
  set({ ...state, removed });

  // 되돌리기 — 빼기 알림의 단추가 부른다(감수 요청). 한 번만 듣는다.
  let undone = false;
  return () => {
    if (undone) return;
    undone = true;
    for (const id of unsaved) if (!getReactionsSnapshot().saved.includes(id)) toggleSave(id);
    set({ ...state, removed: state.removed.filter((id) => !struck.includes(id)) });
  };
}

/**
 * 열어 봤다 — 어디까지(%). 더 많이 본 값만 남긴다. 값은 상세가 「본 장 수 /
 * 카드 수」로 셈해 넘긴다(useReadProgress). 마지막 장까지 봤으면 100 — 장바구니가
 * 이 값을 보고 다 먹음으로 옮긴다.
 */
export function markOpened(knowledgeId: string, progress: number): void {
  const seen = Math.min(100, Math.max(1, Math.round(progress)));
  if ((state.opened[knowledgeId] ?? 0) >= seen) return;
  set({ ...state, opened: { ...state.opened, [knowledgeId]: seen } });
}

/**
 * 뽑기로 나왔다 — 아직 안 읽었어도 먹는 중 0% 로 장바구니에 세운다.
 *
 * 뽑을 때 이미 코인을 냈으므로(랜덤 지식깡) 상세에 들어가도 또 치르면 안 된다.
 * 여기 적어 두면 `useShelf` 가 이미 가진 지식으로 보므로 `useKnowledgePass` 가
 * 거저 열어 준다(grantPass) — 안 보고 나가도 0% 로 장바구니에 남는다.
 *
 * 이미 읽은(또는 읽는 중인) 기록이 있으면 손대지 않는다 — 0 으로 되돌리면 안 된다.
 */
export function markDrawn(knowledgeId: string): void {
  if (knowledgeId in state.opened) return;
  set({ ...state, opened: { ...state.opened, [knowledgeId]: 0 } });
}
