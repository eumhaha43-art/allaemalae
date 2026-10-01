"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Img from "@/components/common/Img";
import { coinCopy } from "@/data/common/menu";
import { skyBackground, useChatSky, useNightChrome } from "@/hooks/useNightChrome";
import { useCoins } from "@/state/coinStore";
import {
  countUnread,
  getNotifications,
  getNotificationsServerSnapshot,
  subscribeNotifications,
} from "@/state/notificationStore";

/**
 * 공통 헤더 — Figma 941:2524 (컴포넌트 / Header).
 *
 * 디자인이 헤더를 한 컴포넌트로 묶어 두었다(Header01 ~ Header05). 화면마다
 * 다른 것은 가운데와 오른쪽뿐이라, 틀은 여기 한 곳에만 두고 그 둘을 받는다.
 *
 * - Header01  뒤로 · 로고 · 알림 + 검색      (홈 · 커뮤니티 · 장바구니)
 * - Header02  뒤로 · 담기 + 더보기           (아직 쓰는 화면 없음)
 * - Header03  뒤로 · 화면 이름 · 등록        (글쓰기)
 * - Header04  뒤로 · 로고 · 알림 + 닫기      (햄버거 메뉴)
 * - Header05  뒤로 · 로고 · Skip             (아직 쓰는 화면 없음)
 *
 * 가운데는 좌우 버튼 개수와 상관없이 한가운데 와야 해서 absolute 로 띄운다 —
 * 그래서 헤더 자신이 위치를 잡고 있어야 한다. sticky 를 빼면 로고가 헤더를
 * 벗어나 기기 화면에 붙어, 내용만 스크롤되고 로고는 배경 없이 떠 있었다.
 *
 * 채팅방 홈의 테이블 화면에서는 아래 밤 배경과 이어지도록 어둡게 그린다.
 * 아이콘 SVG 는 CSS 로 색을 못 바꿔서 흰색 사본을 따로 쓴다.
 */

/** 눌린 느낌 — 헤더 안 모든 단추가 같이 쓴다. */
const PRESS = "transition-opacity active:opacity-55";

type AppHeaderProps = {
  /**
   * 왼쪽 뒤로가기.
   *
   * 안 주면 브라우저 뒤로, `null` 이면 자리만 잡고 그리지 않는다 — 홈처럼
   * 돌아갈 곳이 없는 화면이다(디자인에서도 opacity 0 으로 자리만 있다).
   */
  back?: (() => void) | null;
  /** 가운데 화면 이름. 안 주면 로고가 온다. */
  title?: string;
  /**
   * 화면 이름 크기.
   *
   * 디자인이 둘로 갈라져 있다 — 장바구니 같은 이름은 18px(1021:15168),
   * 오른쪽에 등록 단추가 붙는 글쓰기 머리는 16px(941:2624) 다. 한쪽으로
   * 몰지 않고 화면이 골라 쓰게 둔다.
   */
  titleSize?: 16 | 18;
  /**
   * 오른쪽 묶음. 사이 간격(18px)은 헤더가 준다.
   *
   * 안 주면 알림 + 검색이 온다 — 디자인 컴포넌트의 기본값(Header01)이다.
   * 오른쪽이 다른 화면만 따로 넘긴다.
   */
  children?: React.ReactNode;
  /**
   * 왼쪽에 보유 코인을 띄울지.
   *
   * 오른쪽(알림 · 검색)이 아니라 왼쪽인 것은 가운데 로고가 절대 위치라 폭을
   * 양보하지 않기 때문이다. 오른쪽에 하나를 더 붙이면 402 폭에서 묶음이
   * 로고 자리까지 밀고 들어와 글자가 겹친다. 왼쪽은 홈에서 뒤로가기가 빈
   * 칸으로 남는 자리라, 그 빈 칸을 코인이 대신 채운다.
   */
  coins?: boolean;
  /** 아래 실선. */
  divider?: boolean;
  /** 스크롤 영역 맨 위에 붙일지 — 기본은 붙는다. */
  sticky?: boolean;
  /**
   * 가운데 로고가 홈으로 가는 고리인지 — 기본은 간다.
   *
   * 온보딩처럼 앱에 들어가기 전 화면에서는 끈다 — 로고를 눌러 소개와 가입을
   * 건너뛰고 홈에 들어가 버렸다(사용자 지적). 그때는 로고가 그냥 그림이다.
   */
  logoHome?: boolean;
};

export default function AppHeader({
  back,
  title,
  titleSize = 18,
  children,
  coins = false,
  divider = false,
  sticky = true,
  logoHome = true,
}: AppHeaderProps) {
  const router = useRouter();
  const sky = useChatSky();
  const night = sky === "night";

  /*
    글씨 색은 한 곳에서 고른다. 색 클래스를 두 개 겹쳐 쓰면 어느 쪽이 이길지는
    클래스를 적은 차례가 아니라 스타일시트에 실린 차례가 정해서, 밤에 검은
    글씨가 그대로 남을 수 있다.
  */
  const titleColor = night
    ? "text-white"
    : titleSize === 16
      ? "text-[#17171a]"
      : "text-black";

  return (
    <div className={`w-full shrink-0 ${sticky ? "sticky top-0 z-20" : "relative"}`}>
      <header
        className={`relative flex h-[60px] w-full items-center justify-between px-6 py-3 ${
          skyBackground(sky)
        }`}
      >
        <div className="flex items-center gap-[10px]">
          {back === null ? (
            // 코인이 그 자리를 채우면 빈 칸까지 둘 필요는 없다
            coins ? null : <span aria-hidden className="h-[14px] w-[7px] shrink-0" />
          ) : (
            <button
              type="button"
              aria-label="뒤로"
              onClick={back ?? (() => router.back())}
              className={`tap flex ${PRESS}`}
            >
              <Img
                src={night ? "/assets/community/back-light.svg" : "/assets/community/back.svg"}
                className="h-[14px] w-[7px]"
              />
            </button>
          )}

          {coins ? <HeaderCoins /> : null}
        </div>

        {title === undefined ? (
          logoHome ? (
            <Link
              href="/"
              aria-label="홈으로"
              className={`tap absolute left-1/2 flex -translate-x-1/2 ${PRESS}`}
            >
              {/* 가로 로고(183.53 × 40.81) — 헤더 높이에 맞춰 20 */}
              <Img src="/assets/logo-wide.svg" alt="알래말래븐" className="h-5 w-[90px]" />
            </Link>
          ) : (
            <span className="absolute left-1/2 flex -translate-x-1/2">
              <Img src="/assets/logo-wide.svg" alt="알래말래븐" className="h-5 w-[90px]" />
            </span>
          )
        ) : (
          <h1
            className={`absolute left-1/2 -translate-x-1/2 font-medium ${
              titleSize === 16 ? "text-base leading-[1.3]" : "text-lg leading-normal"
            } ${titleColor}`}
          >
            {title}
          </h1>
        )}

        <div className="flex items-center gap-[18px]">
          {children === undefined ? (
            <>
              <HeaderBell />
              <HeaderSearch />
            </>
          ) : (
            children
          )}
        </div>
      </header>

      {divider ? <div className="h-px w-full bg-[#e5e5e5]" /> : null}
    </div>
  );
}

/**
 * 알림 — 914:2367. 누르면 알림 화면(/notifications)으로 간다.
 *
 * 안 읽은 알림이 있을 때만 노란 점이 붙는다(notificationStore). 점은 종
 * 그림에서 떼어 여기서 얹는다 — 그림 안에 있으면 점 하나만 깜빡이게 할 수
 * 없다. 자리는 원래 그림의 원과 같은 오른쪽 위 4px 이고, 깜빡임은
 * `.bell-dot` 가 쥔다.
 *
 * 점은 읽어 주지 않는다 — 단추에 이미 「알림」이라는 이름이 붙어 있다.
 *
 * 종은 이따금 좌우로 흔들린다(.bell-ring, 사용자 요청) — 위 꼭지를 축으로
 * 크게 한 번, 점점 잦아들며. 점은 그림 밖에 있어 같이 안 흔들린다. 안 읽은
 * 알림이 있을 때만 흔들린다(사용자 지시) — 늘 흔들리면 「새 알림」의 뜻이 없다.
 */
export function HeaderBell() {
  const night = useNightChrome();
  const unread = countUnread(
    useSyncExternalStore(subscribeNotifications, getNotifications, getNotificationsServerSnapshot),
  );

  return (
    <Link
      href="/notifications"
      aria-label={unread ? `알림 ${unread}개 안 읽음` : "알림"}
      className={`tap [--tap-w:40px] relative flex ${PRESS}`}
    >
      <Img
        src={night ? "/assets/community/bell-light.svg" : "/assets/home/bell.svg"}
        className={`size-[22px] ${unread ? "bell-ring" : ""}`}
      />
      {unread ? (
        <span
          aria-hidden
          className="bell-dot absolute top-0 right-0 size-1 rounded-full bg-yellow-500"
        />
      ) : null}
    </Link>
  );
}

/**
 * 검색 — 965:3309.
 *
 * 예전에는 이 자리가 햄버거였다. 메뉴는 탭 바로 내려가고 그 자리에 돋보기가
 * 왔다 — 디자인 컴포넌트도 같은 자리에 돋보기를 그리고 있다.
 */
export function HeaderSearch() {
  const night = useNightChrome();

  return (
    <Link
      href="/search"
      aria-label="검색"
      className={`tap [--tap-w:40px] flex ${PRESS}`}
    >
      <Img
        src={night ? "/assets/community/search-light.svg" : "/assets/home/search.svg"}
        className="size-[22px]"
      />
    </Link>
  );
}

/**
 * 보유 코인 — 헤더 왼쪽.
 *
 * 모든 지식이 코인을 쓰는 앱이라, 지갑은 늘 보이는 자리에 있어야 한다.
 * 「살까 말까」를 정하는 순간마다 화면을 옮겨 확인하게 만들면 안 산다.
 *
 * 알약 모양인 것은 이것이 단추이면서 값이기도 해서다 — 종이나 돋보기처럼
 * 그림만 있으면 옆에 붙은 숫자가 무엇의 수인지 알 수 없고, 글자만 있으면
 * 누를 수 있다는 것이 드러나지 않는다.
 *
 * 눌러서 MY 로 간다 — 회원증 뒷면에 같은 수와 「충전하기」가 있다.
 * 밤 화면(채팅방 홈)에서는 바탕이 검어 흰 알약이 뜨므로 어둡게 깔아 준다.
 */
export function HeaderCoins() {
  const night = useNightChrome();
  const coins = useCoins();
  const pill = useRef<HTMLAnchorElement>(null);
  const before = useRef(coins);

  /*
    코인이 들어오면 알약이 한 번 튄다.

    수만 바뀌면 화면 구석의 작은 글자 하나가 조용히 달라지는 것이라, 보고
    있지 않으면 들어온 줄 모른다. 퀴즈는 세 개를 한 개씩 떨어뜨리므로
    (`earnCoinsSlowly`) 여기서도 세 번 튄다.

    CSS 클래스가 아니라 여기서 직접 거는 것은 **연달아 들어올 때도 매번**
    튀어야 하기 때문이다 — 이미 붙어 있는 클래스는 다시 붙여도 처음부터
    돌지 않는다. 홈의 상품이 들썩이는 것과 같은 방식이다.

    줄어들 때는 튀지 않는다. 쓴 것은 알고 쓰는 것이라 알릴 일이 아니다.
  */
  useEffect(() => {
    const was = before.current;
    before.current = coins;
    if (coins <= was) return;

    const el = pill.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    for (const running of el.getAnimations()) running.cancel();
    el.animate(
      [
        { transform: "scale(1)" },
        { transform: "scale(1.2)", offset: 0.35 },
        { transform: "scale(1)" },
      ],
      { duration: 340, easing: "cubic-bezier(0.33, 1, 0.68, 1)" },
    );
  }, [coins]);

  return (
    <Link
      ref={pill}
      href="/my"
      aria-label={`${coinCopy.aria} ${coins}${coinCopy.unit}`}
      className={`tap [--tap-w:0px] flex items-center gap-[5px] rounded-full py-[3px] pr-[10px] pl-[7px] ${
        night ? "bg-white/15" : "bg-[#fff5dc]"
      } ${PRESS}`}
    >
      <Img src="/assets/gacha/coin.svg" className="size-[15px] shrink-0" />
      <span
        className={`text-[13px] leading-[1.2] font-semibold tracking-[-0.26px] tabular-nums ${
          night ? "text-white" : "text-[#a8750a]"
        }`}
      >
        {coins}
      </span>
    </Link>
  );
}
