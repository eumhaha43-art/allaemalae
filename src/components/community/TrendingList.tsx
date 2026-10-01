"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Img from "@/components/common/Img";
import { trending, trendingPages } from "@/data/common/community";

/**
 * 지금 뜨는 커뮤니티 지식 — Figma 856:5285.
 *
 * 열 개를 세 개씩 끊어 돌아가며 보여 준다. 열 줄을 한꺼번에 펼치면 이 섹션이
 * 화면 한 장을 통째로 먹어서, 아래 「최신 글」까지 내려가기 전에 스크롤이
 * 한참이다.
 *
 * 넘어올 때 줄이 아래에서 톡 올라온다(`rank-pop`). 셋을 한꺼번에 올리지
 * 않고 1·2·3 차례로 늦춰서, 화면이 바뀐 것이 아니라 순위가 매겨지는 것으로
 * 보이게 한다.
 */

/** 줄 사이를 늦추는 폭. 셋이 다 오는 데 0.14초 — 차례는 보이되 기다림은 없다. */
const STEP_MS = 70;

const PAGES = trendingPages(trending.items.length, trending.perPage);

export default function TrendingList() {
  const [page, setPage] = useState(0);

  useEffect(() => {
    const id = window.setInterval(
      () => setPage((now) => (now + 1) % PAGES.length),
      trending.turnMs,
    );
    return () => window.clearInterval(id);
  }, []);

  const from = PAGES[page];
  const shown = trending.items.slice(from, from + trending.perPage);

  return (
    <section className="w-full shrink-0 border-y border-border bg-white px-6 py-[30px]">
      <div className="flex w-full flex-col gap-[30px]">
        <div className="flex w-full items-center justify-between">
          <h2 className="text-xl leading-[1.3] font-semibold text-text">{trending.title}</h2>
          <button type="button" className="tap flex items-center">
            <span className="text-xs leading-[1.3] text-text-meta">{trending.viewAll}</span>
            <Img src="/assets/community/view-all.svg" className="size-3" />
          </button>
        </div>

        {/*
          `key` 에 쪽 번호를 물려 두면 넘어갈 때마다 줄이 새로 그려져 톡 하는
          동작이 다시 돈다. 없으면 React 가 글자만 갈아 끼워 조용히 바뀐다.

          읽어 주는 쪽에는 바뀐 것을 알린다 — 눈으로는 움직임이 보이지만
          소리로 듣는 쪽에는 아무 일도 안 일어난 것이 된다.
        */}
        <ol key={page} aria-live="polite" className="flex w-full flex-col gap-5">
          {shown.map((item, i) => {
            const rank = from + i + 1;
            const row = (
              <>
                {/*
                  순위 — 프레임은 16px 인데(856:5295) 제목이 14px 이라 둘의
                  차이가 2px 뿐이었다. 그러면 번호가 아니라 글 앞에 붙은 글자로
                  읽힌다. 제목의 한 뼘 위인 20px 로 올려 순위임을 먼저 알린다.

                  자리를 20px 로 잡아 두는 것은 두 자리 수 때문이다 — 글자 폭을
                  그대로 쓰면 10번에서 제목 줄이 밀린다.
                */}
                <span className="w-5 shrink-0 text-xl leading-[1.1] font-bold tracking-[-0.4px] text-primary-600">
                  {rank}
                </span>
                <div className="flex min-w-px flex-1 flex-col gap-[2px]">
                  <p className="truncate text-sm leading-[1.3] font-medium text-text">
                    {item.title}
                  </p>
                  <p className="text-xs leading-[1.4] tracking-[-0.24px] text-text-faint">
                    {item.category} · {item.when}
                  </p>
                </div>
                <Img src="/assets/community/upvote.svg" className="size-[13px] shrink-0" />
              </>
            );
            const cls = "tap [--tap-w:0px] flex w-full items-start gap-3";
            return (
              <li
                key={item.id}
                className="rank-pop"
                style={{ animationDelay: `${i * STEP_MS}ms` }}
              >
                {/* Only the entries the feed also carries have a post to open. */}
                {item.postId ? (
                  <Link href={`/community/post/${item.postId}`} className={cls}>
                    {row}
                  </Link>
                ) : (
                  <div className={cls}>{row}</div>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
