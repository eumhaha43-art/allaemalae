"use client";

import { useState } from "react";
import Link from "next/link";
import AppHeader, { HeaderBell } from "@/components/common/AppHeader";
import EmptyState from "@/components/common/EmptyState";
import SearchBar from "@/components/search/SearchBar";
import RankList from "@/components/search/RankList";
import { PILL_OFF, PILL_ON, PILL_ROW, PILL_TAB } from "@/components/common/pillTabs";
import {
  tabs,
  placeholder,
  popular,
  popularMore,
  more,
  emptyBy,
  findHits,
  groupHits,
  searchCopy,
  suggestions,
} from "@/data/common/search";

/**
 * 검색 — Figma node 556:5226 (와이어프레임).
 *
 * 와이어프레임에는 바닥 탭이 없지만 나갈 길이 필요해 남긴다.
 *
 * 입력칸은 눌러야 초점을 받는다. 열리자마자 자판이 올라오게 했었는데, 인기
 * 검색어를 훑어보러 온 사람 앞에서도 화면 절반을 자판이 덮어 버렸다 — 무엇을
 * 칠지 정한 사람은 어차피 칸을 누른다.
 *
 * 헤더 오른쪽에는 알림만 둔다. 메뉴는 탭 바로 내려갔고, 돋보기는 이미 이 화면
 * 이라 여기 또 둘 이유가 없다.
 */
export default function SearchPage() {
  const [tab, setTab] = useState<(typeof tabs)[number]>("인기");
  const [keyword, setKeyword] = useState("");
  const [showAll, setShowAll] = useState(false);

  // 친 글자에 맞는, 실제로 열리는 화면이 있는 것들 — 지식 · 커뮤니티로 나눠서
  const groups = groupHits(findHits(keyword));
  const searching = keyword.trim().length > 0;

  return (
    <main className="flex flex-1 flex-col bg-canvas">
      {/* 돋보기는 이미 이 화면이라 오른쪽에는 알림만 둔다. */}
      <AppHeader>
        <HeaderBell />
      </AppHeader>

      {/* flex-1 — 빈 탭의 그림(EmptyState)이 남는 세로 한가운데에 오게 */}
      <div className="flex w-full flex-1 flex-col gap-[14px] px-5 pt-[14px] pb-6">
        <SearchBar
          placeholder={placeholder}
          keyword={keyword}
          onKeyword={setKeyword}
        />

        {/*
          미리보기 — 친 글자와 맞는 것이 있으면 바로 들어갈 수 있게 띄운다.
          맞는 것이 없어도 그렇다고 알려 준다. 안 그러면 아무 반응이 없어
          검색이 되는지 알 수 없다.
        */}
        {searching ? (
          <div className="w-full overflow-hidden rounded-xl border border-[#e5e5e5] bg-white">
            {groups.length ? (
              groups.map(({ group, items }) => (
                <section key={group}>
                  <h2 className="bg-gray-50 px-4 py-[6px] text-[11px] leading-4 font-bold tracking-[0.2px] text-[#9a9a9e]">
                    {group}
                  </h2>
                  <ul className="divide-y divide-[#f0f0f0]">
                    {items.map((hit) => (
                      <li key={hit.id}>
                        <Link
                          href={hit.href}
                          className="tap [--tap-w:0px] flex w-full items-center gap-2 px-4 py-3 transition-opacity active:opacity-55"
                        >
                          <span className="min-w-px flex-1 truncate text-sm leading-5 font-medium tracking-[-0.28px] text-[#17171a]">
                            {hit.title}
                          </span>
                          <span className="shrink-0 rounded-[4px] bg-gray-100 px-2 py-[3px] text-[11px] leading-4 text-[#6a6a6e]">
                            {hit.where}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              ))
            ) : (
              /* 없으면 없다고만 하지 않고, 대신 눌러 볼 말을 준다 */
              <div className="flex flex-col items-center gap-3 px-4 py-6">
                <p className="text-center text-[13px] leading-[1.4] text-[#6a6a6e]">
                  {searchCopy.none(keyword.trim())}
                </p>
                <p className="text-[11px] leading-4 text-[#9a9a9e]">{searchCopy.instead}</p>
                <div className="flex flex-wrap justify-center gap-[6px]">
                  {suggestions.map((word) => (
                    <button
                      key={word}
                      type="button"
                      onClick={() => setKeyword(word)}
                      className="tap [--tap-w:0px] rounded-full border border-[#e5e5e5] bg-white px-3 py-[6px] text-xs leading-none text-[#17171a] transition-opacity active:opacity-55"
                    >
                      {word}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : null}

        {/* 탭 — 생김새는 커뮤니티와 같은 값(pillTabs), 폭만 셋으로 똑같이 나눈다 */}
        <div role="tablist" className={`${PILL_ROW} w-full bg-gray-100`}>
          {tabs.map((name) => {
            const on = name === tab;
            return (
              <button
                key={name}
                type="button"
                role="tab"
                aria-selected={on}
                onClick={() => setTab(name)}
                className={`${PILL_TAB} min-w-px flex-1 ${on ? PILL_ON : `${PILL_OFF} text-tab-off`}`}
              >
                {name}
              </button>
            );
          })}
        </div>

        {tab === "인기" ? (
          <>
            <RankList items={popular} more={showAll ? popularMore : []} />

            {showAll ? null : (
              <button
                type="button"
                onClick={() => setShowAll(true)}
                className="tap [--tap-w:0px] w-full rounded-[10px] border border-[#e5e5e5] bg-white py-[13px] text-[13.5px] leading-5 font-medium tracking-[-0.27px] text-[#6a6a6e] transition-opacity active:opacity-55"
              >
                {more}
              </button>
            )}
          </>
        ) : (
          /* 최신 · 최근 검색은 비어 있다 — 돋보기 든 점원(1968:7142)을 남는 자리 한가운데에 */
          <EmptyState icon="/assets/search/empty.svg" text={emptyBy[tab]} />
        )}
      </div>
    </main>
  );
}
