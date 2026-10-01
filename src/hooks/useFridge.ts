"use client";

import { useSyncExternalStore } from "react";
import { savedItem } from "@/data/common/cart";
import { knowledgeIdFor } from "@/data/common/knowledge";
import { useShelf } from "@/hooks/useShelf";
import { getCartServerSnapshot, getCartSnapshot, subscribeCart } from "@/state/cartStore";
import {
  getReactionsServerSnapshot,
  getReactionsSnapshot,
  subscribeReactions,
} from "@/state/reactionStore";
import type { CartItem } from "@/types/cart";

/** 단계의 차례 — 같은 지식이 둘이면 더 나아간 쪽을 남긴다. */
const RANK: Record<CartItem["state"], number> = { "먹는 중": 0, "다 먹음": 1 };

/** 같은 지식(knowledgeIdFor)은 한 칸 — 단계가 같으면 앞의 것(최근 담은 것)을 남긴다. */
function dedupe(list: CartItem[]): CartItem[] {
  const kept = new Map<string, CartItem>();
  for (const item of list) {
    const key = knowledgeIdFor(item.id);
    const before = kept.get(key);
    if (!before || RANK[item.state] > RANK[before.state]) kept.set(key, item);
  }
  return list.filter((item) => kept.get(knowledgeIdFor(item.id)) === item);
}

/**
 * 내 봉투에 든 지식 — 담은 것 · 처음부터 놓인 것 · 읽기 시작한 것을 한 줄로.
 *
 * 봉투 화면(`/cart`)이 그리던 셈을 그대로 옮겨 온 것이다. 홈의 「남겨둔 지식
 * 상품」도 같은 줄을 봐야 하기 때문이다(사용자 지시 — 먹는 중에 들어가면 홈
 * 이어보기에도 같이 떠야 한다). 두 화면이 각자 셈하면 한쪽에만 있는 지식이
 * 생긴다.
 *
 * 나오는 차례는 최근순 — 방금 담은 것, 방금 읽기 시작한 것이 앞이다.
 */
export function useFridge(): CartItem[] {
  const reactions = useSyncExternalStore(
    subscribeReactions,
    getReactionsSnapshot,
    getReactionsServerSnapshot,
  );
  const { removed, opened } = useSyncExternalStore(
    subscribeCart,
    getCartSnapshot,
    getCartServerSnapshot,
  );
  const shelf = useShelf();
  // 방금 담은 것이 앞에 온다 — 「최근순」
  const saved = [...reactions.saved].reverse().flatMap((id) => savedItem(id) ?? []);
  return dedupe(
    [...saved, ...shelf]
      .filter((item) => !removed.includes(item.id))
      .map((item) => {
        const seen = opened[knowledgeIdFor(item.id)];
        if (seen === undefined || item.state === "다 먹음") return item;
        // 마지막 장까지 봤으면 다 먹음 — 진행률은 뗀다(다 먹은 것은 알약이 없다)
        if (seen >= 100) return { ...item, state: "다 먹음" as const, progress: undefined };
        // 먹는 중인 것은 더 본 만큼 오른다 — 갓 담은 0% 도 들어가 보면 여기서 오른다
        return { ...item, progress: Math.max(item.progress ?? 0, seen) };
      }),
  );
}
