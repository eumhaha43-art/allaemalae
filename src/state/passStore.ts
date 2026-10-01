"use client";

import { useEffect, useSyncExternalStore } from "react";
import { coinCopy } from "@/data/common/menu";
import { useShelf } from "@/hooks/useShelf";
import { getCoinsSnapshot, spendCoins, useCoins } from "@/state/coinStore";
import { showToast } from "@/state/toastStore";

/**
 * 지식 열람권 — 어느 지식에 코인을 치렀는지.
 *
 * 지식 하나를 여는 데 1코인이 든다(입력정보 · 코인 「사용: 지식 열람 −1」).
 * 상세에 처음 들어갈 때 치르고 여기 적어 둔다 — 같은 지식을 다시 열 때는
 * 안 치른다. 읽다 만 것을 이어 보거나 장바구니에서 돌아올 때마다 또 내면
 * 한 편에 몇 코인이 드는지 알 수 없다.
 *
 * 치르면 「코인 1개를 썼어요 · 남은 n개」를 띄운다 — 헤더의 수가 하나 줄어도
 * 눈이 거기 있지 않아서, 말해 주지 않으면 줄어든 줄 모른다. 보통보다 오래
 * 띄운다(SPENT_TOAST_MS) — 상세가 막 열리며 뜨는 말이라 눈이 새 화면을 훑는
 * 사이 지나가 버렸다(사용자 지적).
 *
 * 모자라면 못 연다 — 상세가 본문 대신 「코인이 없어요」 카드를 놓는다. 이 판
 * (page load)에만 산다 — 지갑(coinStore)이 그렇듯 시연을 처음부터 다시 한다.
 *
 * 냉장고에 처음부터 놓인 지식(useShelf — 다 먹음 여섯 · 먹는 중 셋)은 쓰던 사람이
 * 이미 코인을 내고 먹었거나 먹던 것이다. 그것도 치르면 「다 먹음」이라 해 놓고
 * 냉장고에서 누르면 코인이 빠졌다(사용자 지적) — 열람권을 거저 준다(grantPass).
 */
/** 코인 알림이 떠 있는 시간 — 화면이 바뀌는 순간이라 보통(1.8초)의 두 배. */
const SPENT_TOAST_MS = 3600;

const passes = new Set<string>();
const listeners = new Set<() => void>();

function subscribePasses(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function hasPass(knowledgeId: string): boolean {
  return passes.has(knowledgeId);
}

/**
 * 열람권을 산다 — 이미 있으면 그대로 true, 코인이 모자라면 false.
 * 두 번 불려도 한 번만 치른다(개발 모드의 StrictMode 가 effect 를 두 번 돌린다).
 */
export function buyPass(knowledgeId: string): boolean {
  if (passes.has(knowledgeId)) return true;
  if (!spendCoins(1, "지식 열람")) return false;
  passes.add(knowledgeId);
  listeners.forEach((notify) => notify());
  showToast(coinCopy.spent(getCoinsSnapshot()), SPENT_TOAST_MS);
  return true;
}

/** 이미 치른 셈 치는 지식 — 냉장고에 처음부터 있던 것. 코인도 알림도 없다. */
function grantPass(knowledgeId: string): void {
  if (passes.has(knowledgeId)) return;
  passes.add(knowledgeId);
  listeners.forEach((notify) => notify());
}

/**
 * 상세가 쓴다 — 이 지식을 볼 수 있는가.
 *
 * 들어오면 산다(effect). 첫 그림은 사기 전인데, 코인이 있으면 어차피 살 것이라
 * 미리 연 채로 그린다 — 안 그러면 한 프레임 잠겼다 열리며 깜빡인다. 코인이
 * 없고 열람권도 없을 때만 잠긴다. 서버는 열린 채로 그린다 — 누구 지갑인지
 * 그릴 때는 모른다.
 *
 * 냉장고에 처음부터 놓인 지식(owned)은 사지 않고 거저 연다 — 이미 먹었거나 먹던
 * 것이다. 퍼소나가 늦게 실리면 owned 가 바뀌므로 effect 가 그것도 본다.
 */
export function useKnowledgePass(knowledgeId: string): boolean {
  const paid = useSyncExternalStore(
    subscribePasses,
    () => passes.has(knowledgeId),
    () => true,
  );
  const coins = useCoins();
  const owned = useShelf().some((item) => item.id === knowledgeId);
  useEffect(() => {
    if (owned) grantPass(knowledgeId);
    else buyPass(knowledgeId);
  }, [knowledgeId, owned]);
  return owned || paid || coins > 0;
}
