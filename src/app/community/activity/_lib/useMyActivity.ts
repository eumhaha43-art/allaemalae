"use client";

import { useSyncExternalStore } from "react";
import { getPost } from "@/data/common/community";
import type { Post } from "@/data/common/community";
import { rooms } from "@/data/common/debate";
import {
  getServerSnapshot,
  getSnapshot,
  subscribe,
} from "@/state/postStore";
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
import {
  getGroundsServerSnapshot,
  getGroundsSnapshot,
  subscribeGrounds,
} from "@/state/groundStore";
import {
  level,
  missions,
  seedActivity,
  stats,
  top,
  type ActivityEntry,
  type ActivityFilter,
  type Mission,
} from "../_data/activity";

/**
 * 이 화면이 보여 줄 값 — 씨앗(`_data/activity`) + 이 기기에서 한 활동.
 *
 * 네 저장소를 한 번에 읽는 곳은 여기뿐이다. 카드들은 결과만 받아 그린다
 * (요구사항 7-9: 화면 컴포넌트에 저장소 처리를 몰아넣지 않는다).
 *
 * 서버에는 localStorage 가 없어 첫 그림은 씨앗만으로 그려진다 — 다른 화면들과
 * 같은 방식이라 hydration 이 어긋나지 않는다.
 */

export type MyActivity = {
  /** 오늘 막 가입한 사람 — 씨앗 없이 이 기기에서 한 것만 센다. */
  fresh: boolean;
  counts: { posts: number; comments: number; debates: number };
  /** 채워진 비율 0~1 — 막대 길이. */
  progress: number;
  /** 「다음 등급까지」 옆에 적히는 **찬** 비율 — 「70%」. */
  percent: string;
  missions: (Pick<Mission, "id" | "label" | "hint" | "icon" | "tone"> & {
    now: number;
    goal: number;
    /** 채워진 비율 0~1 */
    progress: number;
  })[];
  /** 아직 다 못 채운 조건 수 — 머리의 「2개 남음」 */
  missionsLeft: number;
  /** 반응이 좋았던 내 글 — 좋아요 많은 것부터 `top.count` 장. */
  top: ActivityEntry[];
  entries: Record<ActivityFilter, ActivityEntry[]>;
};

/** `me-<시각>` 로 시작하는 id 에서 얼마나 지났는지 뽑는다 — 근거에는 시각이 없다. */
function since(id: string): string {
  const at = Number(id.replace(/^me-/, ""));
  if (!Number.isFinite(at) || at <= 0) return "방금";
  const minutes = Math.floor((Date.now() - at) / 60000);
  if (minutes < 1) return "방금";
  if (minutes < 60) return `${minutes}분 전`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}시간 전`;
  return `${Math.floor(hours / 24)}일 전`;
}

/**
 * @param fresh 오늘 막 가입한 사람인지(`persona.fresh`).
 *
 * 프레임의 숫자(12 · 28 · 5, 70%, 조건 1/2 · 4/5, 예전 글 셋)는 기존 회원
 * 한상현의 것이다. 손님 김민정은 커뮤니티에서 아직 아무것도 안 했으므로 씨앗을
 * 하나도 받지 않는다 — 이 시연에서 글을 쓰고 댓글을 달면 그때부터 쌓인다
 * (저장소는 사람마다 따로고, 퍼소나를 고를 때 그 사람 것을 비운다).
 */
export function useMyActivity(fresh: boolean): MyActivity {
  const written = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const comments = useSyncExternalStore(
    subscribeComments,
    getCommentsSnapshot,
    getCommentsServerSnapshot,
  );
  const reactions = useSyncExternalStore(
    subscribeReactions,
    getReactionsSnapshot,
    getReactionsServerSnapshot,
  );
  const grounds = useSyncExternalStore(
    subscribeGrounds,
    getGroundsSnapshot,
    getGroundsServerSnapshot,
  );

  /** 씨앗 글과 이 기기에서 쓴 글을 함께 뒤진다 — 스크랩·댓글이 가리키는 글. */
  const find = (postId: string): Post | undefined =>
    getPost(postId) ?? written.find((post) => post.id === postId);

  /** 카드 한 장이 쓰는 숫자 — 목록·상세에서 누른 좋아요와 담기가 여기에도 보인다. */
  const numbers = (post: Post) => ({
    likes: post.likes + (reactions.liked.includes(post.id) ? 1 : 0),
    comments: post.comments + commentsFor(comments, post.id).length,
    saves: post.saves + (reactions.saved.includes(post.id) ? 1 : 0),
  });

  const myComments = Object.values(comments).reduce((sum, list) => sum + list.length, 0);
  const joinedDebates = Object.keys(grounds).filter((id) => grounds[id]?.length);

  /** 씨앗 — 손님(오늘 막 가입한 사람)에게는 없다 */
  const seed = fresh
    ? { posts: 0, comments: 0, debates: 0, points: 0, sourced: 0, liked: 0, activity: [] }
    : {
        posts: stats.posts.seed,
        comments: stats.comments.seed,
        debates: stats.debates.seed,
        points: level.seedPoints,
        sourced: missions[0].seed,
        liked: missions[1].seed,
        activity: seedActivity,
      };

  const counts = {
    posts: seed.posts + written.length,
    comments: seed.comments + myComments,
    debates: seed.debates + joinedDebates.length,
  };

  const earned =
    seed.points +
    written.length * level.points.post +
    myComments * level.points.comment +
    joinedDebates.length * level.points.debate;
  const progress = Math.min(1, earned / level.goal);
  const percent = `${Math.round(progress * 100)}%`;

  const done = {
    sourced: seed.sourced + written.filter((post) => post.source).length,
    liked: seed.liked + reactions.liked.length,
  };
  const missionRows = missions.map((one) => {
    const now = Math.min(done[one.id], one.goal);
    return {
      id: one.id,
      label: one.label,
      hint: one.hint,
      icon: one.icon,
      tone: one.tone,
      now,
      goal: one.goal,
      progress: now / one.goal,
    };
  });

  const posts: ActivityEntry[] = [
    ...written.map((post) => ({
      id: post.id,
      kind: "작성한 글" as const,
      category: post.category,
      title: post.title,
      excerpt: post.excerpt,
      when: post.when,
      href: `/community/post/${post.id}`,
      image: post.image,
      ...numbers(post),
    })),
    ...seed.activity,
  ];

  /**
   * 댓글을 단 글 — 마지막으로 쓴 댓글이 그 글의 인용이 된다.
   *
   * 저장소는 글 id 로 묶어 두어 차례를 모르므로, 마지막 댓글을 쓴 시각으로
   * 새것부터 세운다.
   */
  const commented: ActivityEntry[] = Object.entries(comments)
    .flatMap(([postId, list]) => {
      const last = list[list.length - 1];
      const post = last ? find(postId) : undefined;
      if (!post || !last) return [];
      return [
        {
          at: last.at ?? 0,
          entry: {
            id: `comment-${postId}`,
            kind: "댓글 남긴 글" as const,
            category: post.category,
            title: post.title,
            excerpt: post.excerpt,
            quote: last.text,
            when: last.when,
            href: `/community/post/${post.id}`,
            ...numbers(post),
          },
        },
      ];
    })
    .sort((a, b) => b.at - a.at)
    .map((row) => row.entry);

  /** 근거를 단 토론방 — 상세가 아직 없는 방은 눌리지 않는다(목록과 같은 규칙). */
  const debates: ActivityEntry[] = joinedDebates.flatMap((debateId) => {
    const room = rooms.find((candidate) => candidate.id === debateId);
    const mine = grounds[debateId] ?? [];
    const last = mine[mine.length - 1];
    if (!room || !last) return [];
    return [
      {
        id: `debate-${debateId}`,
        kind: "참여한 토론" as const,
        category: room.tags[0],
        title: room.title,
        excerpt: room.lastMessage,
        quote: last.text,
        when: since(last.id),
        // 방금 단 근거는 아직 공감이 없다. 담기는 토론방에 없는 개념이라 뺀다.
        likes: last.likes ?? 0,
        comments: mine.length,
        ...(room.ready ? { href: `/community/debate/${room.id}` } : null),
      },
    ];
  });

  /** 스크랩 — 담아 둔 글. 담은 차례의 반대(새것이 위)로 세운다. */
  const saved: ActivityEntry[] = [...reactions.saved]
    .reverse()
    .flatMap((postId) => {
      const post = find(postId);
      if (!post) return [];
      return [
        {
          id: `saved-${postId}`,
          kind: "스크랩" as const,
          category: post.category,
          title: post.title,
          excerpt: post.excerpt,
          when: post.when,
          href: `/community/post/${post.id}`,
          ...numbers(post),
        },
      ];
    });

  /*
    대표 지식 — 내 글을 좋아요 많은 것부터. 같으면 저장이 많은 것.
    sort 는 안정 정렬이라 둘 다 같으면 목록 차례(새것이 앞)를 지킨다.
  */
  const best = [...posts]
    .sort((a, b) => (b.likes ?? 0) - (a.likes ?? 0) || (b.saves ?? 0) - (a.saves ?? 0))
    .slice(0, top.count);

  return {
    fresh,
    counts,
    progress,
    percent,
    missions: missionRows,
    missionsLeft: missionRows.filter((one) => one.now < one.goal).length,
    top: best,
    entries: {
      "작성한 글": posts,
      "댓글 남긴 글": commented,
      "참여한 토론": debates,
      스크랩: saved,
    },
  };
}
