"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import Link from "next/link";
import Img from "@/components/common/Img";
import PostMenu from "@/components/community/PostMenu";
import { MY_AVATAR } from "@/data/common/personas";
import {
  categoryChip,
  CATEGORY_CHIP_FALLBACK,
  type Post,
} from "@/data/common/community";
import {
  commentsFor,
  getCommentsServerSnapshot,
  getCommentsSnapshot,
  subscribeComments,
} from "@/state/commentStore";
import {
  getReactionsServerSnapshot,
  getReactionsSnapshot,
  subscribeReactions,
} from "@/state/reactionStore";

/** 방금 올린 내 글의 바탕이 남아 있는 시간(ms) — 지나면 다른 글과 같아진다(사용자 지시, 8초 → 4초) */
const LIT_MS = 4000;
/** 빠지는 데 걸리는 시간(ms) */
const FADE_MS = 700;

/** 게시글 한 줄 — Figma 856:5327 */
export default function PostCard({
  post,
  first = false,
  /** Your own posts get the 수정 / 삭제 menu behind the "..." */
  mine = false,
}: {
  post: Post;
  first?: boolean;
  mine?: boolean;
}) {
  // 상세에서 누른 좋아요·담기가 여기에도 그대로 보인다.
  const reactions = useSyncExternalStore(
    subscribeReactions,
    getReactionsSnapshot,
    getReactionsServerSnapshot,
  );
  const liked = reactions.liked.includes(post.id);
  const saved = reactions.saved.includes(post.id);

  /*
    내 글의 바탕은 올린 직후 4초만 — 그 뒤엔 0.7초에 걸쳐 빠져 다른 글과 같아진다
    (사용자 지시). 언제 올렸는지는 id 에 있다(postStore — `me-<시각>`). 바탕(::before)은
    평소 투명하고, 4초 안에 붙은 글만 효과에서 애니메이션을 걸어 켠다 — 그리는 중에
    시계를 읽으면 안 되므로(react-hooks/purity) 상태가 아니라 효과에서 한다. 4초를
    지나 들어온(나중에 다시 온) 글은 처음부터 안 깐다.
  */
  const postedAt =
    mine && post.id.startsWith("me-") ? Number(post.id.slice(3)) : NaN;
  const card = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = card.current;
    if (!el || !Number.isFinite(postedAt)) return;
    const left = LIT_MS - (Date.now() - postedAt);
    if (left <= 0) return;
    try {
      const run = el.animate(
        [
          { opacity: 1, offset: 0 },
          { opacity: 1, offset: left / (left + FADE_MS) },
          { opacity: 0, offset: 1 },
        ],
        {
          duration: left + FADE_MS,
          pseudoElement: "::before",
          fill: "forwards",
        },
      );
      return () => run.cancel();
    } catch {
      // ::before 에 애니메이션을 못 거는 브라우저 — 바탕 없이 둔다
    }
  }, [postedAt]);

  const written = useSyncExternalStore(
    subscribeComments,
    getCommentsSnapshot,
    getCommentsServerSnapshot,
  );
  const commentCount = post.comments + commentsFor(written, post.id).length;

  return (
    /*
      내가 쓴 글은 바탕을 연하게 깔아 목록에서 바로 찾게 한다 — 글을 올린 사람이
      「내 글이 게시글에서 어떻게 보이나」를 확인하러 오는 자리다. 올린 직후 4초만
      (위 효과) — 그 뒤엔 서서히 빠진다.

      색만 줄 끝까지 닿게 하려고 뒤에 한 장을 따로 깐다(::before). 글 상자를
      음수 여백으로 넓히면 자리까지 같이 움직여 제목이 다른 글보다 왼쪽으로
      쏠린다 — 25 는 목록을 감싼 RecentPosts 의 좌우 여백이다.

      -z-10 과 isolate 가 짝이다. 깐 장이 글 위로 올라오지 않게 뒤로 보내되,
      그것이 이 글 밖(목록 바탕)까지 뚫고 내려가지는 않게 막는다.
    */
    <article
      ref={card}
      className={`flex w-full flex-col gap-[9px] pb-[13px] ${first ? "pt-5" : "pt-[14px]"} ${
        mine
          ? "relative isolate before:absolute before:inset-y-0 before:-left-[25px] before:-right-[25px] before:-z-10 before:bg-primary-100/55 before:opacity-0"
          : ""
      }`}
    >
      <div className="flex w-full items-center gap-[6px]">
        <span
          className={`rounded-[4px] inline-flex h-5 items-center px-[7px] text-[10.5px] leading-none font-bold tracking-[-0.21px] ${
            categoryChip[post.category] ?? CATEGORY_CHIP_FALLBACK
          }`}
        >
          {post.category}
        </span>
        {post.badge ? (
          <span className="rounded-[4px] border border-text-faint inline-flex h-5 items-center px-[7px] text-[10.5px] leading-none font-bold tracking-[-0.21px] text-text-sub">
            {post.badge}
          </span>
        ) : null}
        {/*
          카더라 — 출처 없이 올라온 글이다. 제목보다 먼저 읽히도록 갈래 칩
          옆에 붙인다. 채팅방의 카더라 표(564:6212)와 같은 모양이다.
        */}
        {post.source ? null : (
          <span className="rounded-[4px] bg-primary-600 inline-flex h-5 items-center px-[7px] text-[10.5px] leading-none font-bold tracking-[-0.21px] text-white">
            카더라
          </span>
        )}
        {mine ? (
          <span className="rounded-[4px] border border-primary-600 inline-flex h-5 items-center px-[7px] text-[10.5px] leading-none font-bold tracking-[-0.21px] text-primary-700">
            내 글
          </span>
        ) : null}
        <div className="flex-1" />
        <PostMenu postId={mine ? post.id : undefined} />
      </div>

      {/* Everything below the header row opens the post; the "..." stays out
          of the link so the menu keeps working. */}
      <Link
        href={`/community/post/${post.id}`}
        className="flex w-full flex-col gap-[9px]"
      >
        <div className="flex w-full items-start gap-3">
          <div className="flex min-w-px flex-1 flex-col gap-[5px]">
            <h3 className="text-lg leading-[1.3] font-semibold text-text">
              {post.title}
            </h3>
            {/* 두 줄까지만 — 쓴 글은 본문이 통째로 들어와, 그대로 두면 카드 한 장이 화면을 다 먹는다 */}
            <p className="line-clamp-2 text-sm leading-[1.4] tracking-[-0.28px] text-text-sub">
              {post.excerpt}
            </p>
          </div>
          {post.image ? (
            <Img
              src={post.image}
              className="size-[72px] shrink-0 rounded-[6px] object-cover"
            />
          ) : null}
        </div>

        <div className="flex w-full items-center gap-3">
          <div className="flex items-center gap-[5px]">
            <Img
              src={post.authorAvatar ?? MY_AVATAR}
              className="size-4 rounded-full bg-line object-cover"
            />
            <span className="text-xs leading-[1.3] font-semibold text-text-sub">
              {post.author}
            </span>
            <span className="text-[11px] leading-4 tracking-[-0.22px] text-text-faint">
              ·
            </span>
            <span className="text-[11.5px] leading-[1.4] tracking-[-0.23px] text-text-faint">
              {post.when}
            </span>
          </div>
          <div className="flex-1" />
          <div className="flex items-center gap-[11px] text-[11px] leading-[1.4] tracking-[-0.22px] text-text-meta">
            <span
              className={`flex items-center gap-1 ${liked ? "text-[#ff0707]" : ""}`}
            >
              <Img
                src={
                  liked
                    ? "/assets/community/like-on.svg"
                    : "/assets/community/like.svg"
                }
                alt="좋아요"
                className="size-[14px]"
              />
              {post.likes + (liked ? 1 : 0)}
            </span>
            <span className="flex items-center gap-1">
              <Img
                src="/assets/community/comment.svg"
                alt="댓글"
                className="size-[14px]"
              />
              {commentCount}
            </span>
            <span
              className={`flex items-center gap-1 ${saved ? "text-primary-600" : ""}`}
            >
              <Img
                src={
                  saved
                    ? "/assets/community/bookmark-on.svg"
                    : "/assets/community/bookmark.svg"
                }
                alt="스크랩"
                className="size-[14px]"
              />
              {post.saves + (saved ? 1 : 0)}
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}
