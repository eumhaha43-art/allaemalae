"use client";

import { useSyncExternalStore } from "react";
import { knowledgeIdFor } from "@/data/common/knowledge";
import { useShelf } from "@/hooks/useShelf";
import { getCartServerSnapshot, getCartSnapshot, subscribeCart } from "@/state/cartStore";
import {
  getReactionsServerSnapshot,
  getReactionsSnapshot,
  subscribeReactions,
} from "@/state/reactionStore";

/**
 * 이 지식이 장바구니에 있는가 — 어느 이름으로든.
 *
 * 같은 지식이 세 길로 담긴다. 처음부터 놓여 있는 것(useShelf — 다 먹음 ·
 * 먹는 중, 쓰던 사람에게만), 홈의 세 자리(`home-card-` · `home-pick-` · `lucky-`),
 * 목록과 상세(`post-`). 담기 단추마다 제 이름만 보면 「아인슈타인」이 다 먹음에 놓여
 * 있는데 홈에서 또 담기고, 청바지가 점장님 Pick 과 뽑기에서 따로 담긴다.
 * 지식은 하나니까 장바구니에도 하나여야 한다(사용자 요청) — 담기 단추와 장바구니
 * 가 모두 이것으로 묻는다.
 *
 * - `shelved` — 처음부터 놓였거나 읽기 시작한 것(useShelf)이고 아직 안 뺐다.
 *   빼려면 지식 id 로 뺀다(cartStore.removeFromCart).
 * - `savedAs` — 담기 단추로 담았다면 그 이름. 빼려면 이 이름으로 뺀다.
 */
export function useCartEntry(knowledgeId: string): {
  shelved: boolean;
  savedAs: string | undefined;
  inCart: boolean;
} {
  const saved = useSyncExternalStore(
    subscribeReactions,
    getReactionsSnapshot,
    getReactionsServerSnapshot,
  ).saved;
  const removed = useSyncExternalStore(
    subscribeCart,
    getCartSnapshot,
    getCartServerSnapshot,
  ).removed;

  const shelf = useShelf();
  const shelved = shelf.some((item) => item.id === knowledgeId) && !removed.includes(knowledgeId);
  const savedAs = saved.find((id) => knowledgeIdFor(id) === knowledgeId);
  return { shelved, savedAs, inCart: shelved || savedAs !== undefined };
}
