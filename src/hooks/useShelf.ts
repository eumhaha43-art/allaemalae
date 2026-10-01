"use client";

import { useMemo, useSyncExternalStore } from "react";
import { items, readItem } from "@/data/common/cart";
import { usePersona } from "@/hooks/usePersona";
import { getCartServerSnapshot, getCartSnapshot, subscribeCart } from "@/state/cartStore";
import type { CartItem } from "@/types/cart";

/**
 * 넣기 단추 없이도 냉장고에 놓이는 지식 — 처음부터 있던 것과, 읽기 시작한 것.
 *
 * 처음부터 놓인 것은 누가 보느냐에 따라 다르다. `cart.ts` 의 items(다 먹음
 * 여섯 · 먹는 중 셋)는 디자인 프레임(1021:15139)의 것이고, 쓰던 사람(한상현)의
 * 냉장고다. 오늘 막 가입한 사람(김민정 · fresh)이 다 먹은 지식 여섯을 들고
 * 시작하면 앞뒤가 안 맞고, 무엇보다 홈의 상품이 거의 다 「이미 담김」이라 담는
 * 것부터 해 볼 수가 없다(사용자 지적) — 그 사람은 빈 냉장고에서 시작한다.
 * 아무도 안 골랐으면 프레임대로 채워 둔다.
 *
 * 읽기 시작한 것은 코인을 치르고 상세에 들어간 지식(cartStore.opened)이다 —
 * 넣기를 안 눌렀어도 먹기 시작했으면 냉장고에 있다. 전에는 넣은 것만 놓여서,
 * 김민정이 코인을 쓰고 카드뉴스를 끝까지 봐도 냉장고가 비어 있었다(사용자 지적).
 * 처음부터 놓인 것과 같은 지식이면 그쪽이 이미 있으니 더 만들지 않는다 — 본
 * 만큼은 냉장고 화면이 opened 를 보고 올린다.
 *
 * 냉장고 화면과 넣기 단추(useCartEntry)가 둘 다 이것을 봐야 한다 — 한쪽만
 * 보면 단추는 켜져 있는데 냉장고엔 없는 지식이 생긴다.
 */
export function useShelf(): CartItem[] {
  const persona = usePersona();
  const opened = useSyncExternalStore(subscribeCart, getCartSnapshot, getCartServerSnapshot).opened;
  const fresh = persona?.fresh ?? false;
  return useMemo(() => {
    const base = fresh ? [] : items;
    const read = Object.keys(opened)
      .filter((id) => !base.some((item) => item.id === id))
      .flatMap((id) => readItem(id) ?? []);
    // 방금 읽기 시작한 것이 앞에 — 냉장고는 최근순이다
    return [...read.reverse(), ...base];
  }, [fresh, opened]);
}
