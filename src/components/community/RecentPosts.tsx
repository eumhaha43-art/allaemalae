"use client";

import { useEffect, useSyncExternalStore } from "react";
import PostCard from "@/components/community/PostCard";
import SortMenu from "@/components/chat/SortMenu";
import { POST_SORTS, recent, sortPosts } from "@/data/common/community";
import {
  getFilter,
  getFilterServerSnapshot,
  resetFilter,
  setPage,
  setSort,
  subscribeFilter,
} from "@/state/communityFilterStore";
import { getServerSnapshot, getSnapshot, subscribe, takeReveal } from "@/state/postStore";
import { useInView } from "@/hooks/useInView";
import type { Post } from "@/types/community";

/**
 * 최신 글 — Figma 856:5315.
 *
 * 위의 분류 칩으로 거르고, 처음에는 네 편만 보이고 「더 보기」로 네 편씩
 * 이어 붙는다. 전에는 ‹ 3 / 14 › 쪽 넘기기였는데, 손안의 화면에서는 이어
 * 내려가는 쪽이 맞다(감수 지적) — 넘길 때마다 목록 머리로 올라가 어디까지
 * 읽었는지 놓쳤다.
 *
 * 고른 갈래와 펼친 쪽수는 저장소(communityFilterStore)에 있다 — 갈래를 바꾸면
 * 처음 네 편으로 돌아가는 것도 거기서 한다.
 *
 * 글은 화면에 들어오는 순간 아래에서 톡 올라온다(`rank-pop`, 뜨는 지식과 같은
 * 결 — 사용자 요청). 목록이 길어 처음부터 다 올리면 아래 글은 안 보이는 데서
 * 헛움직이니, 글마다 따로 지켜보다(useInView) 들어올 때 올린다. 한꺼번에
 * 들어오는 글(처음 네 편, 더 보기로 붙는 네 편)은 쪽 안 차례로 늦춘다.
 */

/** 같이 들어온 글 사이를 늦추는 폭 — 뜨는 지식(TrendingList)과 같다. */
const STEP_MS = 70;

/** 최신 글 한 편의 li — 화면에 들어오면 올라오고, 그 전엔 비워 둔다. */
function PostRow({ post, order, mine }: { post: Post; order: number; mine: boolean }) {
  // 문턱을 낮게 — 글 한 편이 화면 높이의 1/4 라, 머리만 걸쳐도 올라오게
  const [box, seen] = useInView<HTMLLIElement>(0.15);
  return (
    // scroll-mt: 굴려 올렸을 때 글 위에 남기는 여백 — 헤더(60) + 탭 줄(86) + 분류 칩(55) + 숨 쉴 자리
    <li
      ref={box}
      id={`post-${post.id}`}
      className={`scroll-mt-[214px] ${seen ? "rank-pop" : "opacity-0"}`}
      style={{ animationDelay: `${order * STEP_MS}ms` }}
    >
      <PostCard post={post} mine={mine} />
    </li>
  );
}
export default function RecentPosts() {
  const written = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const { category, sort, page } = useSyncExternalStore(
    subscribeFilter,
    getFilter,
    getFilterServerSnapshot,
  );

  const all = [...written, ...recent.posts];
  const shown = sortPosts(
    category === "전체" ? all : all.filter((post) => post.category === category),
    sort,
  );
  const pages = Math.max(1, Math.ceil(shown.length / recent.perPage));
  // 펼친 쪽수 — 갈래가 바뀌어 쪽수가 줄면 그만큼만
  const current = Math.min(page, pages - 1);
  const slice = shown.slice(0, (current + 1) * recent.perPage);
  const left = shown.length - slice.length;

  /*
    방금 올린 글이 있으면 「전체」 1쪽으로 가서 그 글이 화면 맨 위에 오게
    굴린다. 다른 갈래를 보고 있었다면 새 글이 그 갈래가 아닐 수 있고, 2쪽
    이후를 보고 있었다면 새 글은 1쪽에 있다. 헤더(60)와 탭 줄이 위에 붙어
    있어 그만큼 아래에 세운다(li 의 scroll-margin) — 딱 맞추면 글 머리가 헤더
    밑에 깔린다. 부드럽게 굴리면 어디로 가는지 보인다.
  */
  useEffect(() => {
    const id = takeReveal();
    if (!id) return;
    resetFilter();
    // 갈래·쪽이 바뀌어 다시 그린 뒤에 굴려야 그 글이 있다
    const frame = requestAnimationFrame(() => {
      document.getElementById(`post-${id}`)?.scrollIntoView({ block: "start", behavior: "smooth" });
    });
    return () => cancelAnimationFrame(frame);
  }, [written]);

  return (
    // scroll-mt: 쪽을 넘길 때 목록 머리가 붙어 있는 띠(헤더 + 탭 + 칩 = 201) 밑에 깔리지 않게
    <section id="recent-posts" className="w-full shrink-0 scroll-mt-[201px] border-y border-border bg-white px-[25px] pt-[25px] pb-4">
      <div className="flex h-[22px] w-full items-center justify-between">
        <div className="flex items-center gap-[6px] leading-[1.4]">
          <h2 className="text-xl leading-[1.3] font-semibold text-text">{recent.title}</h2>
          <span className="text-[12.5px] leading-[1.4] font-semibold tracking-[-0.25px] text-text-meta">
            {shown.length}
          </span>
        </div>
        {/* 최신순 · 인기순(하트) · 댓글순 · 스크랩순 — 고르면 1쪽부터 다시 */}
        <SortMenu
          sort={sort}
          onSort={setSort}
          options={POST_SORTS}
          icons={{ sort: "/assets/community/sort.svg", caret: "/assets/community/sort-caret.svg" }}
        />
      </div>

      {slice.length ? (
        /*
          mt-5 — 제목 줄과 목록 사이 20. 전에는 첫 글의 안쪽 여백(first, 20)으로 띄웠는데,
          내 글의 초록 바탕이 그 여백까지 덮어 제목 줄에 딱 붙었다(사용자 지적). 여백을
          목록 바깥으로 빼고 첫 글도 다른 글과 같은 안쪽 여백(14)이다.
        */
        <ul className="mt-5 divide-y divide-divider">
          {slice.map((post, index) => (
            <PostRow
              key={post.id}
              post={post}
              order={index % recent.perPage}
              mine={written.some((w) => w.id === post.id)}
            />
          ))}
        </ul>
      ) : (
        <p className="py-16 text-center text-sm leading-[1.4] text-gray-500">
          아직 이 갈래의 글이 없어요
        </p>
      )}

      {/* 더 보기 — 남은 것이 있을 때만. 읽던 자리는 그대로고 아래에 붙는다 */}
      {left > 0 ? (
        <button
          type="button"
          onClick={() => setPage(current + 1)}
          className="tap [--tap-w:0px] mt-4 flex h-11 w-full items-center justify-center rounded-[10px] border border-gray-200 bg-white text-[13px] leading-[1.4] font-medium text-gray-700 transition-opacity active:opacity-55"
        >
          {recent.more(Math.min(left, recent.perPage), left)}
        </button>
      ) : null}
    </section>
  );
}
