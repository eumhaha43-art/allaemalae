"use client";

import { continueSection } from "@/data/common/home";
import { getKnowledge, knowledgeIdFor, tagOf } from "@/data/common/knowledge";
import { fieldCategory, fields } from "@/data/common/menu";
import { useFridge } from "@/hooks/useFridge";
import type { ContinueItem } from "@/types/home";

/**
 * 디자이너가 색과 그림을 손으로 고른 셋(1727:4318) — 쓰던 사람(한상현)의 먹는 중
 * 셋이다. 그 셋은 여기 값을 그대로 쓰고, 나머지는 분야에서 끌어낸다.
 */
const DESIGNED = new Map(continueSection.items.map((one) => [one.id, one]));

/** 분야 id → 줄 안 검은 상자에 넣을 그림(ContinueSection 의 ART). 과학은 잎사귀다. */
const FIELD_ART: Record<string, ContinueItem["art"]> = {
  society: "society",
  history: "history",
  science: "nature",
  culture: "culture",
  life: "life",
};

/** 담은 날 — 「07/31」처럼 두 자리씩. */
function mmdd(when: Date): string {
  const two = (n: number) => String(n).padStart(2, "0");
  return `${two(when.getMonth() + 1)}/${two(when.getDate())}`;
}

/**
 * 홈의 「남겨둔 지식 상품」 줄 — 봉투의 「먹는 중」과 같은 줄이다.
 *
 * 전에는 데이터에 적어 둔 셋(continueSection.items)을 그대로 그려서, 오늘 막
 * 가입한 사람이 지식을 읽기 시작해 봉투의 먹는 중에 들어가도 홈은 계속 비어
 * 있었다(사용자 지적). 이제 봉투와 같은 줄(useFridge)에서 먹는 중만 골라
 * 그린다 — 한쪽에 뜨면 다른 쪽에도 뜬다.
 *
 * 디자이너가 색 · 그림 · 날짜를 정해 둔 셋은 그 값을 그대로 쓰고, 그 밖의
 * 지식은 분야에서 끌어낸다 — 바탕색은 분야 색(fields.bg), 그림은 분야 그림,
 * 날짜는 읽기 시작한 오늘. 진행률은 어느 쪽이든 실제로 본 만큼이다.
 */
export function useContinue(): ContinueItem[] {
  const today = mmdd(new Date());
  return useFridge()
    .filter((item) => item.state === "먹는 중")
    .flatMap((item) => {
      const id = knowledgeIdFor(item.id);
      const progress = item.progress ?? 0;
      const designed = DESIGNED.get(id);
      if (designed) return { ...designed, progress };

      const post = getKnowledge(id);
      if (!post) return [];
      const field = fields.find((one) => fieldCategory[one.id] === post.category);
      return {
        id,
        type: tagOf(post),
        title: post.title,
        date: today,
        color: field?.bg ?? "#968feb",
        art: (field && FIELD_ART[field.id]) ?? "culture",
        progress,
      } satisfies ContinueItem;
    });
}
