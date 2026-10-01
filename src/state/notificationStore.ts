"use client";

import { getPost, type Comment, type Post } from "@/data/common/community";
import { getSnapshot as getWrittenPosts, reactToPost } from "@/state/postStore";

/**
 * 알림 — 누군가 내 글에 좋아요 · 북마크 · 댓글을 남겼다는 것.
 *
 * 서버가 없으므로 「누군가」는 여기서 만든다. 글을 올리면 10초 뒤부터 씨앗
 * 인물들이 차례로 반응한다(`scheduleReactions`) — 좋아요, 댓글, 북마크 순.
 * 반응이 올 때마다 글의 숫자가 오르고(postStore.reactToPost), 알림이 목록에
 * 쌓이며, 화면 위에 띠(NotificationBanner)가 잠깐 내려온다.
 *
 * 내가 단 댓글에도 10초 뒤 누군가 답글을 단다(`scheduleReply`). 남의 글(씨앗)
 * 에는 글 데이터에 댓글을 붙일 수 없으므로 여기 `arrivals` 에 두고, 상세가
 * 실을 짤 때 끼워 넣는다 — 답글은 내 댓글 밑에 매달린다.
 *
 * 이 판(page load)에만 산다. 예약도 알림도 새로고침하면 사라진다 — 시연을
 * 처음부터 다시 할 수 있어야 하고, 지난 판의 예약이 뒤늦게 터지면 무슨 글에
 * 대한 것인지 모른다. 씨앗 알림 셋은 목록이 비어 보이지 않게 두는 것이라
 * 읽은 것으로 시작한다.
 */

/**
 * 「coupon」만 결이 다르다 — 남이 내 글에 한 일이 아니라 가게가 나에게 보낸 것이다.
 * 그래서 누가 했는지(actor) 대신 무엇이 왔는지를 읽어 주고, 글이 아니라 뽑기
 * 화면으로 간다(`href`).
 */
export type NotificationKind = "like" | "comment" | "save" | "reply" | "coupon";

export type Notification = {
  id: string;
  kind: NotificationKind;
  /** 누가 */
  actor: string;
  avatar: string;
  /** 어느 글에 — 글 화면으로 가는 데 쓴다. 씨앗 알림은 갈 곳이 없다. */
  postId?: string;
  /** 글이 아닌 데로 보내는 알림(쿠폰 → 뽑기). 있으면 `postId` 보다 이것이 이긴다. */
  href?: string;
  postTitle: string;
  /** 댓글이면 그 내용 */
  text?: string;
  at: number;
  read: boolean;
};

/** 알림 한 줄의 말 — 「○○님이 내 글을 좋아합니다」. 「회원님」은 다른 화면의 호칭과 달랐다(감수 지적). */
export const NOTICE_COPY: Record<NotificationKind, string> = {
  like: "내 글을 좋아합니다",
  comment: "내 글에 댓글을 남겼어요",
  save: "내 글을 스크랩했어요",
  reply: "내 댓글에 답글을 남겼어요",
  /** 쿠폰은 「○○님이」를 앞에 붙이지 않는다 — 읽는 쪽에서 따로 그린다. */
  coupon: "무료 뽑기 쿠폰이 도착했어요",
};

const AVATAR = {
  night: "/assets/post/avatar-1.png",
  fridge: "/assets/post/avatar-2.png",
  ramen: "/assets/post/avatar-3.png",
} as const;

const MINUTE = 60_000;
/** 글을 올리고 첫 반응이 오기까지 — 시연에서 기다릴 만한 길이. */
const FIRST_REACTION_MS = 10_000;

/**
 * 목록이 비어 보이지 않게 두는 지난 알림 — 전부 읽은 것. 실제로 열리는 씨앗
 * 글을 가리켜야 눌렀을 때 갈 데가 있다.
 */
const SEED: Notification[] = [
  {
    id: "seed-1",
    kind: "comment",
    actor: "점심에컵라면",
    avatar: AVATAR.ramen,
    postId: "p1",
    postTitle: "왜 판사는 망치를 두드릴까?",
    text: "출처 링크 감사합니다. 이런 글 더 올려주세요",
    at: Date.now() - 42 * MINUTE,
    read: true,
  },
  {
    id: "seed-2",
    kind: "like",
    actor: "냉장고문닫아",
    avatar: AVATAR.fridge,
    postId: "p2",
    postTitle: "삼각김밥 포장이 3단계인 이유",
    at: Date.now() - 3 * 60 * MINUTE,
    read: true,
  },
  {
    id: "seed-3",
    kind: "save",
    actor: "야간알바중",
    avatar: AVATAR.night,
    postId: "p3",
    postTitle: "클레오파트라는 피라미드보다 아이폰에 더 가깝다",
    at: Date.now() - 26 * 60 * MINUTE,
    read: true,
  },
];

let notifications: Notification[] = SEED;
/** 남이 내 댓글에 단 답글 — 글마다. 상세가 실을 짤 때 끼운다. */
/** 늘 같은 빈 값 — 새로 만들면 useSyncExternalStore 가 끝없이 다시 그린다. */
const NO_ARRIVALS: Record<string, Comment[]> = {};
const NONE: Comment[] = [];
let arrivals: Record<string, Comment[]> = NO_ARRIVALS;
/** 지금 화면 위에 내려와 있는 띠. */
let banner: Notification | null = null;
let bannerTimer: number | null = null;
const listeners = new Set<() => void>();

/** 띠가 떠 있는 시간 — 읽고 누를 수 있을 만큼. */
export const BANNER_MS = 4000;

function notify() {
  listeners.forEach((run) => run());
}

export function subscribeNotifications(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getNotifications(): Notification[] {
  return notifications;
}

/** 서버는 씨앗만 안다. 시각은 브라우저에서 다시 잰다. */
export function getNotificationsServerSnapshot(): Notification[] {
  return SEED;
}

export function getArrivals(): Record<string, Comment[]> {
  return arrivals;
}

export function getArrivalsServerSnapshot(): Record<string, Comment[]> {
  return NO_ARRIVALS;
}

/** 한 글에 온 답글들 — 없으면 늘 같은 빈 배열(useSyncExternalStore 가 돌지 않게). */
export function arrivalsFor(snapshot: Record<string, Comment[]>, postId: string): Comment[] {
  return snapshot[postId] ?? NONE;
}

export function getBanner(): Notification | null {
  return banner;
}

export function getBannerServerSnapshot(): Notification | null {
  return null;
}

export function countUnread(list: Notification[]): number {
  return list.filter((item) => !item.read).length;
}

/** 알림 화면을 열면 다 읽은 것이 된다. */
export function markAllRead(): void {
  if (!notifications.some((item) => !item.read)) return;
  notifications = notifications.map((item) => (item.read ? item : { ...item, read: true }));
  notify();
}

export function dismissBanner(): void {
  if (bannerTimer !== null) window.clearTimeout(bannerTimer);
  bannerTimer = null;
  banner = null;
  notify();
}

function push(item: Notification) {
  notifications = [item, ...notifications];
  if (bannerTimer !== null) window.clearTimeout(bannerTimer);
  banner = item;
  bannerTimer = window.setTimeout(dismissBanner, BANNER_MS);
  notify();
}

/**
 * 글을 올린 뒤 씨앗 인물들이 반응한다 — 10초 뒤 좋아요, 이어서 댓글, 북마크.
 *
 * 셋을 한꺼번에 터뜨리지 않고 띄운다. 띠는 한 장씩 보여야 읽히고, 알림이
 * 한 번에 셋 오면 만들어 둔 것처럼 보인다.
 */
export function scheduleReactions(post: Post): void {
  const at = (kind: NotificationKind, actor: string, avatar: string, delay: number, text?: string) =>
    window.setTimeout(() => {
      const comment: Comment | undefined =
        kind === "comment"
          ? {
              id: `them-${Date.now()}`,
              author: actor,
              avatar,
              when: "방금",
              at: Date.now(),
              text: text ?? "",
              likes: 0,
            }
          : undefined;
      reactToPost(post.id, {
        likes: kind === "like" ? 1 : 0,
        saves: kind === "save" ? 1 : 0,
        comment,
      });
      push({
        id: `${kind}-${post.id}-${Date.now()}`,
        kind,
        actor,
        avatar,
        postId: post.id,
        postTitle: post.title,
        text,
        at: Date.now(),
        read: false,
      });
    }, delay);

  at("like", "야간알바중", AVATAR.night, FIRST_REACTION_MS);
  at(
    "comment",
    "냉장고문닫아",
    AVATAR.fridge,
    FIRST_REACTION_MS + 4_000,
    "오 이거 진짜 몰랐어요 ㅋㅋ 다음에 빵집 가면 유심히 봐야겠다",
  );
  at("save", "점심에컵라면", AVATAR.ramen, FIRST_REACTION_MS + 12_000);
}

/**
 * 무료 뽑기 쿠폰이 도착했다 — 블랙카드로 들어온 사람에게 한 번.
 *
 * 앱에 막 들어선 사람에게 「여기 이런 것도 있어요」를 알려 주는 자리다. 뽑기
 * 기계는 탭 바에도 홈에도 대놓고 나와 있지 않아서, 알려 주지 않으면 시연에서
 * 아예 안 열어 본 채로 지나간다.
 *
 * 한 번만 보낸다 — 홈을 오갈 때마다 또 오면 알림이 아니라 잔소리가 된다.
 * 들어서자마자 띄우지 않고 잠깐 두는 것은, 화면이 그려지기도 전에 띠가
 * 내려오면 무엇 위에 뜬 것인지 알 수 없어서다.
 */
let couponSent = false;

export function sendCouponNotice(delay = 1800): void {
  if (couponSent) return;
  couponSent = true;
  window.setTimeout(() => {
    push({
      id: `coupon-${Date.now()}`,
      kind: "coupon",
      actor: "알래말래븐",
      avatar: "/assets/gacha/coupon.svg",
      postTitle: "지금 뽑기 한 번 하러 가볼까요?",
      href: "/gacha",
      at: Date.now(),
      read: false,
    });
  }, delay);
}

/**
 * 쿠폰을 썼다 — 뽑기에서 무료 쿠폰으로 한 판 돌리면 알림에서 걷어 간다.
 *
 * 다 쓴 쿠폰이 목록에 남아 있으면 아직 있는 줄 알고 또 누른다. 띠가 그것을
 * 보여 주고 있으면 띠도 함께 내린다. 다시 보내지는 않는다(`couponSent`).
 */
export function takeCouponNotice(): void {
  if (!notifications.some((item) => item.kind === "coupon")) return;
  notifications = notifications.filter((item) => item.kind !== "coupon");
  if (banner?.kind === "coupon") dismissBanner();
  else notify();
}

/** 답글을 다는 사람 — 내 댓글마다 돌아가며. */
const REPLIERS = [
  { actor: "우유는뒤에", avatar: "/assets/post/avatar-cow.jpg", text: "저도 이 생각했어요 ㅋㅋ 공감" },
  { actor: "새벽두시반", avatar: "/assets/post/avatar-patrick.jpg", text: "오 그렇게 볼 수도 있겠네요" },
  { actor: "잡지식수집가", avatar: "/assets/post/avatar-mii.jpg", text: "이거 출처 있으면 저도 스크랩할게요" },
];
let replyTurn = 0;

/**
 * 내가 단 댓글에 10초 뒤 누군가 답글을 단다.
 *
 * 답글은 내 댓글이 매달린 맨 위 댓글 밑에 붙는다 — 내 댓글이 답글이면 그
 * 부모, 아니면 내 댓글 자신이 부모다(buildThread 의 규칙과 같다). 글 제목은
 * 알림에 적을 것이라 씨앗 글과 내가 쓴 글 양쪽에서 찾는다.
 */
export function scheduleReply(postId: string, mine: Comment): void {
  const who = REPLIERS[replyTurn % REPLIERS.length];
  replyTurn += 1;
  window.setTimeout(() => {
    const post = getPost(postId) ?? getWrittenPosts().find((entry) => entry.id === postId);
    const reply: Comment = {
      id: `them-${Date.now()}`,
      author: who.actor,
      avatar: who.avatar,
      when: "방금",
      at: Date.now(),
      text: who.text,
      likes: 0,
      reply: true,
      parentId: mine.parentId ?? mine.id,
    };
    arrivals = { ...arrivals, [postId]: [...(arrivals[postId] ?? []), reply] };
    push({
      id: `reply-${postId}-${Date.now()}`,
      kind: "reply",
      actor: who.actor,
      avatar: who.avatar,
      postId,
      postTitle: post?.title ?? "",
      text: who.text,
      at: Date.now(),
      read: false,
    });
  }, FIRST_REACTION_MS);
}
