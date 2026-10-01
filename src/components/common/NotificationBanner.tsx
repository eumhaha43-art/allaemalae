"use client";

import { useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import Img from "@/components/common/Img";
import {
  dismissBanner,
  getBanner,
  getBannerServerSnapshot,
  NOTICE_COPY,
  subscribeNotifications,
} from "@/state/notificationStore";

/**
 * 알림 띠 — 새 알림이 오면 기기 화면 위에서 내려왔다가 올라간다.
 *
 * 한가운데 알약(Toast)은 「방금 한 일이 됐다」고 나에게 하는 말이고, 이 띠는
 * 「남이 무언가 했다」고 밖에서 오는 말이다 — 폰 알림처럼 위에서 온다.
 * 누르면 그 글로 간다. 헤더(60) 바로 밑에 앉는다 — 화면 맨 위에 붙이면
 * 상태바 · 헤더와 겹쳐 무엇이 떴는지 안 보였다.
 *
 * `fixed` 는 기기 목업 안에서 기기 화면 기준으로 잡힌다(ShowcaseLayout 의
 * transform). 팝업(z 50) 위, 한가운데 알약(z 70)보다는 아래.
 */
export default function NotificationBanner() {
  const router = useRouter();
  const banner = useSyncExternalStore(
    subscribeNotifications,
    getBanner,
    getBannerServerSnapshot,
  );
  if (!banner) return null;

  const coupon = banner.kind === "coupon";

  const open = () => {
    dismissBanner();
    if (banner.href) router.push(banner.href);
    else if (banner.postId) router.push(`/community/post/${banner.postId}`);
    else router.push("/notifications");
  };

  return (
    <div
      key={banner.id}
      // pointer-events-none — 이 상자는 화면 맨 위부터 헤더 높이만큼 비워 두고 카드를 그린다. 그 빈 자리가 헤더 위에 얹혀 종 · 검색을 못 누르게 했다(사용자 지적). 누름은 카드만 받는다.
      className="banner-in pointer-events-none fixed inset-x-0 top-0 z-[65] flex justify-center px-3 pt-[calc(env(safe-area-inset-top)+68px)] lg:pt-[122px]"
    >
      <button
        type="button"
        onClick={open}
        className="pointer-events-auto flex w-full max-w-[380px] items-center gap-3 rounded-[16px] bg-white/95 px-[14px] py-3 text-left shadow-[0_10px_30px_-6px_rgba(0,0,0,0.35)] ring-1 ring-black/5 backdrop-blur-md transition-transform active:scale-[0.98]"
      >
        {/* 쿠폰은 사람 얼굴이 아니라 물건이라 동그랗게 자르지 않는다 */}
        {coupon ? (
          <span className="flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-[#f3f0ff]">
            <Img src={banner.avatar} className="h-5 w-[30px]" />
          </span>
        ) : (
          <Img src={banner.avatar} className="size-9 shrink-0 rounded-full object-cover" />
        )}
        <span className="flex min-w-px flex-1 flex-col gap-[2px]">
          <span className="truncate text-[13px] leading-[1.4] text-[#1a1c1c]">
            {coupon ? (
              <b className="font-semibold">{NOTICE_COPY.coupon}</b>
            ) : (
              <>
                <b className="font-semibold">{banner.actor}</b>님이 {NOTICE_COPY[banner.kind]}
              </>
            )}
          </span>
          <span className="truncate text-[12px] leading-[1.4] text-[#6a6a6e]">
            {(banner.kind === "comment" || banner.kind === "reply") && banner.text
              ? `“${banner.text}”`
              : banner.postTitle}
          </span>
        </span>
        <span className="shrink-0 text-[11px] leading-[1.4] text-[#9a9a9e]">지금</span>
      </button>
    </div>
  );
}
