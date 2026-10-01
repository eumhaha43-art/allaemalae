"use client";

import { useState } from "react";
import Link from "next/link";
import ActivityCard from "./ActivityCard";
import { emptyBy, filters, recent, type ActivityFilter } from "../_data/activity";
import type { MyActivity } from "../_lib/useMyActivity";

/**
 * 최근 활동 — 1731:5274 넷째 묶음.
 *
 * 거르개는 이 화면 안의 상태다. 주소를 나눠 가질 만한 화면이 아니라서
 * 라우트로 빼지 않는다(요구사항 7-8). 칩 줄은 가로로 넘기지 않는다 — 안에서
 * 스크롤이 되면 손을 대는 대로 줄이 움직여 거슬렸다(사용자 지적). 좁은 폭에서
 * 넷이 한 줄에 안 들어가면 다음 줄로 접는다.
 *
 * 머리 오른쪽 「더보기」는 따로 가는 화면이 없다 — 처음엔 세 장만 보이고,
 * 누르면 나머지가 펼쳐진다(「접기」로 되돌린다). 세 장 이하면 단추를 그리지
 * 않는다. 거르개를 바꾸면 다시 접힌다.
 *
 * 「작성한 글」말고는 이 기기에서 한 것만 모인다 — 댓글을 달거나 글을
 * 담으면 그 즉시 여기에 쌓인다. 아직 없으면 비었다고 알려 주고, 그 활동을 할
 * 수 있는 화면으로 가는 고리를 함께 둔다.
 */
export default function RecentActivity({ entries }: Pick<MyActivity, "entries">) {
  const [filter, setFilter] = useState<ActivityFilter>("작성한 글");
  const [open, setOpen] = useState(false);
  const all = entries[filter];
  const foldable = all.length > recent.fold;
  const shown = open || !foldable ? all : all.slice(0, recent.fold);
  const empty = emptyBy[filter];

  const pick = (next: ActivityFilter) => {
    setFilter(next);
    setOpen(false);
  };

  return (
    <section aria-labelledby="recent-title" className="flex w-full flex-col gap-[14px]">
      <div className="flex items-center justify-between">
        <h2 id="recent-title" className="text-heading-18 font-bold text-gray-black">
          {recent.title}
        </h2>
        {foldable ? (
          <button
            type="button"
            aria-expanded={open}
            onClick={() => setOpen((was) => !was)}
            className="tap [--tap-w:0px] flex items-center gap-[2px] text-body-12 font-medium text-gray-600 transition-opacity active:opacity-55"
          >
            {open ? recent.less : recent.more}
            <span aria-hidden className="text-[10px]">
              {open ? "︿" : "›"}
            </span>
          </button>
        ) : null}
      </div>

      <div
        role="tablist"
        aria-label="활동 종류"
        className="flex flex-wrap gap-[6px]"
      >
        {filters.map((name) => {
          const on = name === filter;
          return (
            <button
              key={name}
              type="button"
              role="tab"
              aria-selected={on}
              onClick={() => pick(name)}
              className={`tap [--tap-w:0px] flex h-8 shrink-0 items-center justify-center rounded-full border px-3 text-body-12 whitespace-nowrap transition-opacity active:opacity-55 ${
                on
                  ? "border-primary-600 bg-primary-600 font-bold text-white"
                  : "border-gray-200 bg-white font-medium text-gray-700"
              }`}
            >
              {name}
            </button>
          );
        })}
      </div>

      {shown.length ? (
        <ul className="flex w-full flex-col gap-[10px]">
          {shown.map((entry) => (
            <li key={entry.id}>
              <ActivityCard entry={entry} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex w-full flex-col items-center gap-3 rounded-2xl border border-gray-200 bg-white py-10">
          <p className="text-body-12 text-gray-500">{empty.text}</p>
          <Link
            href={empty.href}
            className="tap flex h-8 items-center rounded-full border border-primary-600 px-4 text-body-12 font-bold text-primary-600 transition-opacity active:opacity-55"
          >
            {empty.cta}
          </Link>
        </div>
      )}
    </section>
  );
}
