import Link from "next/link";
import Stats from "./Stats";
import { kindTone, recent, type ActivityEntry } from "../_data/activity";

/**
 * 최근 활동 카드 한 장 — 1731:5274 넷째 묶음.
 *
 * 윗줄에 갈래 칩(작성한 글 · 댓글 남긴 글 · …)과 분야 칩, 오른쪽에 시각.
 * 그 아래 제목 · 본문 한 줄. 댓글이나 근거를 단 것이면 내가 한 말이 보라 띠
 * 인용 상자에 따로 선다. 맨 아래 숫자 줄.
 *
 * 열 화면이 있는 것만 링크가 되고, 나머지는 그냥 카드로 남는다(`href` 참고).
 */
export default function ActivityCard({ entry }: { entry: ActivityEntry }) {
  const quoteLabel = recent.quoteLabel[entry.kind];

  const inside = (
    <>
      <div className="flex items-center gap-[6px]">
        <span
          className={`inline-flex h-5 items-center rounded-[6px] px-[7px] text-body-12 leading-none font-bold ${kindTone[entry.kind]}`}
        >
          {entry.kind}
        </span>
        {entry.category ? (
          <span className="inline-flex h-5 items-center rounded-[6px] bg-gray-100 px-[7px] text-body-12 leading-none font-medium text-gray-600">
            {entry.category}
          </span>
        ) : null}
        <span className="ml-auto text-body-12 text-gray-500">{entry.when}</span>
      </div>

      <div className="flex w-full flex-col gap-1">
        <p className="text-body-16 font-bold text-gray-black">{entry.title}</p>
        {/* 한 줄만 보여 주고 자른다 — 프레임도 한 줄로 잘라 두었다. */}
        <p className="w-full truncate text-body-12 text-gray-500">{entry.excerpt}</p>
      </div>

      {entry.quote && quoteLabel ? (
        <blockquote className="flex flex-col gap-1 rounded-[10px] border-l-[3px] border-purple bg-purple-100 px-3 py-[10px]">
          <span className="text-body-12 font-bold text-purple">{quoteLabel}</span>
          <p className="line-clamp-2 text-body-12 text-gray-800">{entry.quote}</p>
        </blockquote>
      ) : null}

      <Stats entry={entry} className="text-gray-500 [&>span:first-child]:text-gray-700" />
    </>
  );

  const shell = "flex w-full flex-col gap-[10px] rounded-2xl border border-gray-200 bg-white p-4";

  return entry.href ? (
    <Link href={entry.href} className={`${shell} transition-opacity active:opacity-55`}>
      {inside}
    </Link>
  ) : (
    <article className={shell}>{inside}</article>
  );
}
