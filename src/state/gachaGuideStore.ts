"use client";

import { makeGuide } from "@/state/guideStore";

/**
 * 뽑기 사용법이 떠 있는지 — 틀은 `guideStore` 에 있다.
 *
 * 처음 들어온 사람에게는 저절로 떠 있고, 닫으면 이 판에서는 다시 안 뜨며,
 * 물음표를 누르면 다시 연다. 퍼소나를 고르면 되돌린다(PersonaPicker).
 */
const guide = makeGuide("rmb-gacha-guide");

export const subscribeGachaGuide = guide.subscribe;
export const getGachaGuide = guide.get;
export const getGachaGuideServerSnapshot = guide.getServerSnapshot;
/** 물음표로 다시 부르기 */
export const openGachaGuide = guide.open;
/** 닫으면 이 판에서는 저절로 뜨지 않는다. */
export const closeGachaGuide = guide.close;
/** 시연을 처음부터 다시 — 퍼소나를 새로 고르면 다음 뽑기에서 또 뜬다. */
export const resetGachaGuide = guide.reset;
