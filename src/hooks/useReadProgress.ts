"use client";

import { useEffect } from "react";
import { markOpened } from "@/state/cartStore";

/**
 * 어디까지 읽었는지를 장바구니에 적어 두는 일 — 지식 상세 둘(글 카드 · 카드뉴스)이
 * 같이 쓴다.
 *
 * 장을 넘길 때마다 적는다(markOpened) — 들어오자마자 첫 장이 적히니 상세에
 * 한 번이라도 들어간 지식은 장바구니에서 먹는 중이 되고, 마지막 장까지 넘기면
 * 100 이 적혀 다 먹음이 된다. 더 많이 본 값만 남는 것은 저장소가 한다.
 *
 * 퍼센트는 「본 장 수 / 카드 수」다 — 카드가 셋이면 33 · 67 · 100, 여섯이면 17
 * 씩 오른다. `total` 은 내용 카드 수만이다: 카드뉴스 끝의 「영수증에 기록하세요」
 * 카드는 읽을 것이 아니라 다음 할 일이라, 마지막 내용 카드에서 이미 100 이다.
 *
 * 장바구니에 담겨 있는지는 보지 않는다 — 열쇠가 지식 id 라, 상세에서 담든
 * 나중에 홈에서 담든 장바구니가 「들어가 봤나」를 찾아 보면 된다. 나갈 때 한 번만
 * 적던 때는 상세 → 장바구니로 곧장 가면 첫 그림에 안 실릴 수 있었다.
 *
 * 코인이 없어 잠긴 채 들어왔으면(`enabled` 아님) 적지 않는다 — 본 것이 없다.
 */
export function useReadProgress({
  knowledgeId,
  page,
  total,
  enabled = true,
}: {
  knowledgeId: string;
  page: number;
  total: number;
  enabled?: boolean;
}): void {
  useEffect(() => {
    if (!enabled || total <= 0) return;
    markOpened(knowledgeId, Math.min(100, ((page + 1) / total) * 100));
  }, [knowledgeId, page, total, enabled]);
}
