"use client";

import Link from "next/link";
import Img from "@/components/common/Img";
import RankMove from "@/components/search/RankMove";
import { rankHref, searchCopy } from "@/data/common/search";
import { showToast } from "@/state/toastStore";
import type { RankItem } from "@/types/search";

/**
 * 인기 지식 순위 — Figma 556:5270.
 *
 * 1위만 제목이 한 단계 크다. 2위 아래는 같은 모양으로 이어지고 줄 사이는
 * 얇은 선으로 나눈다.
 *
 * 줄을 누르면 그 지식 상세로 간다 — 상세가 있는 것(rankHref)만. 아직 없는
 * 것은 「준비 중」이라고 알린다. 눌러도 아무 일 없던 줄이었다(감수 지적).
 *
 * 줄이 아래에서 톡 올라온다(`rank-pop`, 커뮤니티 「뜨는 지식」과 같은 결).
 * 1·2·3 차례로 늦춰서 순위가 매겨지는 것으로 보이게 한다. 「더보기」로 이어
 * 붙는 줄(more)은 6위부터 다시 차례를 센다 — 이미 있던 다섯 줄 뒤에 줄을
 * 세우면 6위가 한참 있다 나타난다. 앞 줄들은 key 가 그대로라 다시 안 올라온다.
 */

/** 줄 사이를 늦추는 폭 — 뜨는 지식(TrendingList)과 같다. */
const STEP_MS = 70;

export default function RankList({ items, more = [] }: { items: RankItem[]; more?: RankItem[] }) {
  return (
    <ol className="w-full divide-y divide-[#f0f0f0] rounded-xl border border-[#e5e5e5] bg-white px-4 py-[6px]">
      {[...items, ...more].map((item, index) => {
        const first = index === 0;
        const href = rankHref(item);
        const className = `tap [--tap-w:0px] flex w-full items-center gap-3 text-left transition-opacity active:opacity-55 ${
          first ? "py-[14px]" : "py-3"
        }`;
        const inside = <RowBody item={item} index={index} first={first} />;
        const order = index < items.length ? index : index - items.length;
        return (
          <li key={item.id} className="rank-pop" style={{ animationDelay: `${order * STEP_MS}ms` }}>
            {href ? (
              <Link href={href} className={className}>
                {inside}
              </Link>
            ) : (
              <button type="button" onClick={() => showToast(searchCopy.soon)} className={className}>
                {inside}
              </button>
            )}
          </li>
        );
      })}
    </ol>
  );
}

/** 한 줄의 속 — 순위 · 제목 · 조회수 · 움직임 */
function RowBody({ item, index, first }: { item: RankItem; index: number; first: boolean }) {
  return (
    <>
      <span
        className={`shrink-0 text-center font-bold tabular-nums ${
          first
            ? "w-[18px] text-lg leading-[26px] tracking-[-0.36px] text-[#17171a]"
            : "w-[18px] text-base leading-[23px] tracking-[-0.32px] text-[#6a6a6e]"
        }`}
      >
        {index + 1}
      </span>

      <span className="flex min-w-px flex-1 flex-col items-start gap-[6px]">
        <span
          className={`w-full text-[#17171a] ${
            first
              ? "text-[15px] leading-[21px] font-bold tracking-[-0.3px]"
              : "text-sm leading-5 font-medium tracking-[-0.28px]"
          }`}
        >
          {item.title}
        </span>

        <span className="flex items-center gap-1">
          <Img src="/assets/search/eye.svg" className="size-[13px]" />
          <span className="text-[11.5px] leading-[17px] tracking-[-0.23px] text-[#9a9a9e] tabular-nums">
            {item.views}
          </span>
        </span>
      </span>

      <RankMove move={item.move} />
    </>
  );
}
