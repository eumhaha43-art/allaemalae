"use client";

import { makeGuide } from "@/state/guideStore";

/**
 * 코인 안내가 떠 있는지 — 틀은 `guideStore` 에 있다.
 *
 * 처음 온 사람(김민정)이 설문을 마치고 홈에 들어서면 한 번 뜬다(CoinGuide).
 * 닫으면 이 판에서는 다시 안 뜨고, 퍼소나를 고르면 되돌린다(PersonaPicker).
 */
const guide = makeGuide("rmb-coin-guide");

export const subscribeCoinGuide = guide.subscribe;
export const getCoinGuide = guide.get;
export const getCoinGuideServerSnapshot = guide.getServerSnapshot;
/** 닫으면 이 판에서는 저절로 뜨지 않는다. */
export const closeCoinGuide = guide.close;
/** 시연을 처음부터 다시 — 퍼소나를 새로 고르면 홈에서 또 뜬다. */
export const resetCoinGuide = guide.reset;
