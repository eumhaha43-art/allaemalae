"use client";

import Link from "next/link";
import Img from "@/components/common/Img";
import { useUserName } from "@/hooks/usePersona";
import Stats from "./Stats";
import { top, type ActivityEntry } from "../_data/activity";
import type { MyActivity } from "../_lib/useMyActivity";

/**
 * 대표 지식 — 1731:5274 셋째 묶음. 내 글 중 반응이 좋았던 것을 가로로 넘긴다.
 *
 * 첫 장이 한 단 크고(240 × 306) 나머지는 212 × 272 다. 장 색은 차례 색이다
 * (`top.tones`). 장 안은 갈래 칩 · 제목 두 줄 · 그림 자리 · 숫자 줄.
 *
 * 그림 자리에는 글에 사진이 있으면 그것을, 없으면 본문 첫 줄을 넣는다 —
 * 프레임의 빈 상자를 그대로 두면 아직 안 만든 화면처럼 보인다. 씨앗 글에는
 * 사진이 없어 대체로 글이 보인다.
 *
 * 열 화면이 있는 장만 눌린다(`href`) — 최근 활동 카드와 같은 규칙.
 */
export default function TopPosts({ top: best, counts }: Pick<MyActivity, "top" | "counts">) {
  const name = useUserName();

  return (
    <section aria-labelledby="top-title" className="flex w-full flex-col gap-[14px]">
      <div className="flex items-end justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-1">
          <h2 id="top-title" className="truncate text-heading-18 font-bold text-gray-black">
            {top.title(name.full)}
          </h2>
          <p className="text-body-12 text-gray-500">{top.sub}</p>
        </div>
        <span className="shrink-0 text-body-12 font-medium text-gray-600">
          {top.total(counts.posts)}
        </span>
      </div>

      {best.length ? (
        /*
          판의 좌우 여백(24)을 무르고 화면 끝까지 넘긴다 — 지식 상세의 관련 지식과
          같은 짜임. 첫 장은 여백 안쪽에서 시작하고(scroll-pl-6) 마지막 장 뒤에도
          여백이 남는다(pr-6).
        */
        <ul className="no-scrollbar -mx-6 flex snap-x snap-mandatory items-start gap-3 overflow-x-auto scroll-pl-6 px-6">
          {best.map((entry, index) => (
            <li key={entry.id} className="shrink-0 snap-start">
              <TopCard entry={entry} rank={index} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex w-full flex-col items-center gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-8 text-center">
          <div className="flex flex-col gap-1">
            <p className="text-body-14 font-bold text-gray-black">{top.empty.title}</p>
            <p className="text-body-12 text-gray-500">{top.empty.body}</p>
          </div>
          <Link
            href={top.empty.href}
            className="tap flex h-9 items-center rounded-full bg-primary-600 px-5 text-body-12 font-bold text-white transition-opacity active:opacity-55"
          >
            {top.empty.cta}
          </Link>
        </div>
      )}
    </section>
  );
}

function TopCard({ entry, rank }: { entry: ActivityEntry; rank: number }) {
  const tone = top.tones[rank % top.tones.length];
  const first = rank === 0;
  const size = first ? "h-[306px] w-[240px]" : "h-[272px] w-[212px]";

  const inside = (
    <>
      <div className="flex items-center justify-between gap-2">
        {entry.category ? (
          <span
            className={`inline-flex h-6 items-center rounded-full px-[10px] text-body-12 leading-none font-bold ${tone.chip}`}
          >
            {entry.category}
          </span>
        ) : (
          <span />
        )}
        <span className="text-body-12 opacity-70">{entry.when}</span>
      </div>

      <p className={`line-clamp-2 font-bold ${first ? "text-heading-18" : "text-body-16"}`}>
        {entry.title}
      </p>

      {entry.image ? (
        <Img src={entry.image} alt="" className="min-h-0 w-full flex-1 rounded-[10px] object-cover" />
      ) : (
        /* 사진이 없으면 본문 첫 줄 — 오른쪽 아래 큰 따옴표로 「인용」임을 보인다 */
        <div className={`relative min-h-0 flex-1 overflow-hidden rounded-[10px] ${tone.panel}`}>
          <p
            className={`px-3 py-[10px] text-body-12 leading-[1.5] ${first ? "line-clamp-6" : "line-clamp-5"}`}
          >
            {entry.excerpt}
          </p>
          <span
            aria-hidden
            className="absolute right-3 bottom-1 text-[44px] leading-none font-extrabold opacity-25"
          >
            ”
          </span>
        </div>
      )}

      <Stats entry={entry} />
    </>
  );

  const shell = `flex flex-col gap-[10px] rounded-xl p-4 text-left ${size} ${tone.card}`;

  return entry.href ? (
    <Link href={entry.href} className={`${shell} transition-opacity active:opacity-55`}>
      {inside}
    </Link>
  ) : (
    <article className={shell}>{inside}</article>
  );
}
