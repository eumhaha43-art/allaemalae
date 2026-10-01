"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import AppHeader from "@/components/common/AppHeader";
import Img from "@/components/common/Img";
import CouponTicket from "@/components/notifications/CouponTicket";
import {
  getNotifications,
  getNotificationsServerSnapshot,
  markAllRead,
  NOTICE_COPY,
  subscribeNotifications,
  type Notification,
  type NotificationKind,
} from "@/state/notificationStore";

/**
 * 알림 — 헤더의 종을 누르면 온다.
 *
 * 내 글에 온 반응이 새것부터 쌓인다. 열면 전부 읽은 것이 되어 종의 점이
 * 꺼진다 — 하나씩 읽었다고 표시할 만큼의 양이 아니다. 열 때 안 읽었던 줄은
 * 이 화면에 있는 동안은 바탕을 살짝 초록으로 깔아 방금 온 것이 구별되게
 * 한다.
 */

const ICON: Record<NotificationKind, string> = {
  like: "/assets/community/like-on.svg",
  comment: "/assets/community/comment.svg",
  save: "/assets/community/bookmark-on.svg",
  reply: "/assets/community/comment.svg",
  coupon: "/assets/gacha/coupon.svg",
};

/** 「방금 · 3분 전 · 2시간 전 · 어제」— 시각을 그대로 적으면 언제인지 셈해야 한다. */
function ago(at: number): string {
  const minutes = Math.round((Date.now() - at) / 60_000);
  if (minutes < 1) return "방금";
  if (minutes < 60) return `${minutes}분 전`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}시간 전`;
  return hours < 48 ? "어제" : `${Math.round(hours / 24)}일 전`;
}

export default function NotificationsPage() {
  const list = useSyncExternalStore(
    subscribeNotifications,
    getNotifications,
    getNotificationsServerSnapshot,
  );

  /** 열 때 안 읽었던 것 — 읽은 것으로 바꾼 뒤에도 이 화면에서는 새것으로 보인다. */
  const [fresh] = useState(() => new Set(getNotifications().filter((n) => !n.read).map((n) => n.id)));
  useEffect(() => {
    markAllRead();
  }, []);

  return (
    <main className="flex flex-1 flex-col bg-canvas">
      <AppHeader title="알림" divider>
        <span aria-hidden className="size-[22px]" />
      </AppHeader>

      {/* 뽑기 쿠폰 티켓 — 1421:8795. 알림 줄들 위에 하나 */}
      <div className="w-full px-6 pt-[19px] pb-3">
        <CouponTicket />
      </div>

      {list.length ? (
        <ul className="flex w-full flex-col">
          {list.map((item) => (
            <li key={item.id}>
              <Row item={item} fresh={fresh.has(item.id)} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="px-6 pt-16 text-center text-sm leading-[1.4] text-gray-500">
          아직 온 알림이 없어요
        </p>
      )}
    </main>
  );
}

function Row({ item, fresh }: { item: Notification; fresh: boolean }) {
  const coupon = item.kind === "coupon";
  const inside = (
    <>
      {/* 쿠폰은 사람이 한 일이 아니라 가게가 보낸 물건이라 얼굴 자리를 다르게 쓴다 */}
      {coupon ? (
        <span className="flex size-10 shrink-0 items-center justify-center rounded-[12px] bg-[#f3f0ff]">
          <Img src={item.avatar} className="h-[22px] w-[33px]" />
        </span>
      ) : (
        <span className="relative shrink-0">
          <Img src={item.avatar} className="size-10 rounded-full object-cover" />
          <span className="absolute -right-[3px] -bottom-[3px] flex size-[18px] items-center justify-center rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.15)]">
            <Img src={ICON[item.kind]} className="size-[11px]" />
          </span>
        </span>
      )}
      <span className="flex min-w-px flex-1 flex-col gap-[3px]">
        <span className="text-[13.5px] leading-[1.4] text-[#1a1c1c]">
          {coupon ? (
            <b className="font-semibold">{NOTICE_COPY.coupon}</b>
          ) : (
            <>
              <b className="font-semibold">{item.actor}</b>님이 {NOTICE_COPY[item.kind]}
            </>
          )}
        </span>
        <span className="truncate text-xs leading-[1.4] text-[#6a6a6e]">
          {(item.kind === "comment" || item.kind === "reply") && item.text
            ? `“${item.text}”`
            : item.postTitle}
        </span>
        {/* 「몇 분 전」은 서버가 그린 때와 브라우저가 그린 때가 달라 글자가 어긋난다 — 브라우저 것을 그대로 둔다 */}
        <span suppressHydrationWarning className="text-[11px] leading-[1.4] text-[#9a9a9e]">
          {ago(item.at)}
        </span>
      </span>
      {fresh ? (
        <span aria-label="새 알림" className="mt-2 size-2 shrink-0 rounded-full bg-primary-600" />
      ) : null}
    </>
  );

  const shell = `flex w-full items-start gap-3 border-b border-[#eeeeee] px-5 py-[14px] ${
    fresh ? "bg-primary-100/60" : "bg-white"
  }`;

  const href = item.href ?? (item.postId ? `/community/post/${item.postId}` : null);

  return href ? (
    <Link href={href} className={`${shell} active:opacity-60`}>
      {inside}
    </Link>
  ) : (
    <div className={shell}>{inside}</div>
  );
}
