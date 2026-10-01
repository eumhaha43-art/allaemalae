"use client";

import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import StatusBar from "@/components/device/StatusBar";
import BottomNav from "@/layouts/BottomNav";
import AiButton from "@/components/home/AiButton";
import HomeIndicator from "@/components/device/HomeIndicator";
import Toast from "@/components/common/Toast";
import NotificationBanner from "@/components/common/NotificationBanner";
import Img from "@/components/common/Img";
import BackgroundClerk from "@/components/showcase/BackgroundClerk";
import PersonaPicker from "@/components/showcase/PersonaPicker";
import { PersonaFirstPick } from "@/components/showcase/PersonaSwitch";
import { DEVICE, SHOWCASE } from "@/config/showcase";
import {
  actualScale,
  getMonitor,
  getMonitorServerSnapshot,
  monitorInchesOf,
  setMonitorInches,
  subscribeMonitor,
} from "@/state/monitorStore";
import { isChatRoomRoute, isDarkStatusRoute } from "@/routes/paths";
import { skyBackground, useChatSky } from "@/hooks/useNightChrome";
import {
  getSplashVisible,
  subscribeSplash,
} from "@/state/splashStore";

/**
 * 기기 목업(PC) · 실제 화면(모바일) — 요구사항 2장 · 3장.
 *
 * 트리는 하나다. PC·모바일에서 컴포넌트를 갈아끼우지 않고 `lg:` 클래스로
 * 표현만 바꾸므로, 창 크기를 바꿔도 현재 페이지와 입력값이 유지된다.
 *
 * - 1024px 이상: 배경 + 베젤 + 시스템 상태바 + 홈 인디케이터를 여기서 한 번만 그린다.
 * - 1024px 미만: 목업 장식이 전부 사라지고 앱만 실제 화면 크기로 남는다.
 *
 * 상태바와 홈 인디케이터가 목업 쪽에 있는 이유: Figma 402 프레임에 이미
 * 그려져 있는 요소라 앱 화면마다 두면 실기기에서 진짜 상태바와 겹친다.
 */

const OUTER_WIDTH = DEVICE.width + DEVICE.bezel * 2;
const OUTER_HEIGHT = DEVICE.height + DEVICE.bezel * 2;

/** 목업 위아래 여백 + 안내 문구가 쓰는 세로 공간. */
const CHROME_HEIGHT = 140;

/** 왼쪽 칸(소개 글 + 퍼소나 고르기)이 차지하는 가로 폭. */
const ASIDE_WIDTH = 300;
/** 창이 아무리 낮아도 이보다 더 줄이지는 않는다. */
const MIN_SCALE = 0.3;

/**
 * 글이 창 왼쪽 끝에서 얼마나 떨어져 앉는지.
 *
 * 창을 넓히면 같이 벌어진다 — 넓은 모니터에서 여백만 32 로 붙어 있으면 글이
 * 화면 구석에 처박힌 것처럼 보인다. 그렇다고 끝없이 벌어지면 기기와 멀어져
 * 둘이 딴 이야기가 되므로 88 에서 멈춘다.
 */
const ASIDE_EDGE = "clamp(32px, 4vw, 88px)";

/**
 * 왼쪽 글의 배율 — 창 너비에 매인다(vw). 1920 에서 1배.
 *
 * 글은 px 로 짜여 있어(제목 34, 카드 15 …) 창이 낮으면 기기는 줄어도 글은
 * 그대로라, 세로로 넘쳐 위아래가 잘리고 기기 쪽으로 밀렸다(사용자 지적).
 * 글자 하나하나를 vw 로 고쳐 적는 대신 칸 전체를 한 배율로 줄인다 — 안의
 * 간격 · 아바타 · 카드가 다 같이 줄어야 짜임이 안 깨진다. 아주 넓거나 좁은
 * 창에서는 0.5~2 배 사이에 세운다.
 */
const ASIDE_SCALE = "clamp(0.5, tan(atan2(100vw, 1920px)), 2)";

/**
 * 배경 그림의 배율 — cover 라 창 너비 / 1920 과 창 높이 / 1080 중 큰 쪽. 단위 없는 수로
 * 받으려고 tan(atan2()) 를 쓴다(ASIDE_SCALE 과 같은 꼴). 그림 위에 얹는 점원
 * (BackgroundClerk)이 자리를 잡는 데 쓴다.
 */
const BG_SCALE = "max(tan(atan2(100vw, 1920px)), tan(atan2(100vh, 1080px)))";

/**
 * 「화면에 맞추기」 배율 — 창 높이에만 매인다(vh).
 *
 * 기기 높이(베젤 포함 898)가 창 높이에서 위아래 여백과 안내 줄을 뺀 만큼을
 * 꼭 채운다. 창보다 크면 줄이고 남으면 키운다 — 1배에 묶어 두면 세로가
 * 넉넉한 모니터에서 「화면에 맞추기」와 「실제 크기로 보기」가 똑같이 보였다.
 *
 * 너비는 안 본다. 전에는 왼쪽 글과 겹치지 않도록 너비로도 눌렀는데, 그러면
 * 모니터 비율에 따라 기기 크기가 달라져 발표 화면마다 다르게 보였다(사용자
 * 지적). 어느 비율이든 세로를 기준으로 같은 크기다 — 16:9 · 16:10 · 4:3 의
 * 흔한 해상도에서는 이 배율로도 글과 기기가 겹치지 않는 것을 셈해 두었다.
 *
 * CSS 로 두는 것은 첫 칠부터 맞추기 위해서다. 자바스크립트로 창 크기를 재면
 * 서버가 그린 1배 기기가 한 틀 보였다가 줄어든다. 길이를 수로 바꾸는 데
 * `tan(atan2())` 를 쓴다 — `scale()` 은 단위 없는 수만 받는다.
 */
const FIT_SCALE = `max(${MIN_SCALE}, tan(atan2(calc(100vh - ${CHROME_HEIGHT}px), ${OUTER_HEIGHT}px)))`;

/*
  「실제 크기로 보기」 배율은 monitorStore.actualScale 이 낸다 — 손에 쥐는
  아이폰과 같은 크기. 전에는 1배(402 CSS px)였는데 그것은 「픽셀 그대로」지
  실제 크기가 아니다 — 모니터에서 402px 는 손바닥보다 크고, 낮은 창에서는
  넘쳐서 잘렸다(사용자 지적). 모니터 인치는 오른쪽 아래 눈금으로 맞춘다.
*/

/**
 * 옆면 버튼 — 왼쪽 위부터 무음 · 볼륨 업 · 볼륨 다운, 오른쪽은 전원.
 *
 * 레일과 같은 흰 금속인데, 눌린 부분이라 안쪽이 조금 어둡다. 테 밖으로 3px
 * 내밀어 옆에서 튀어나온 것처럼 보이게 한다. 자리 값은 기기 바깥 높이(898)를
 * 기준으로 잰 것이다.
 */
const SIDE_BUTTONS = [
  { side: "left", top: 128, height: 30 },
  { side: "left", top: 188, height: 58 },
  { side: "left", top: 258, height: 58 },
  { side: "right", top: 222, height: 96 },
] as const;

function SideButtons() {
  return (
    <>
      {SIDE_BUTTONS.map((button) => (
        <span
          key={`${button.side}-${button.top}`}
          aria-hidden
          style={{ top: button.top, height: button.height }}
          className={`absolute hidden w-[5px] shadow-[0_1px_3px_rgba(0,0,0,0.35)] lg:block ${
            button.side === "left"
              ? "-left-[3px] rounded-l-[3px] bg-[linear-gradient(90deg,#b7bac1_0%,#f4f5f7_60%,#d9dbe0_100%)]"
              : "-right-[3px] rounded-r-[3px] bg-[linear-gradient(270deg,#b7bac1_0%,#f4f5f7_60%,#d9dbe0_100%)]"
          }`}
        />
      ))}
    </>
  );
}

export default function ShowcaseLayout({ children }: { children: React.ReactNode }) {
  /** 화면에 맞추기(기본) ↔ 실제 크기로 보기 */
  const [fit, setFit] = useState(true);
  /** 기기 안을 한 번이라도 스크롤했으면 안내를 접는다. */
  const [scrolled, setScrolled] = useState(false);
  /** 지금 화면이 실제로 넘치는지 — 넘치는 화면에서만 안내를 띄운다. */
  const [scrollable, setScrollable] = useState(false);
  const scroller = useRef<HTMLDivElement>(null);

  const pathname = usePathname();

  /*
    화면이 바뀌면 맨 위부터 보여 준다. 스크롤 상자가 화면들 바깥에서 하나로
    이어져 있어, 목록을 내려 보다가 글쓰기로 넘어가면 글쓰기도 그만큼 내려간
    채로 열렸다 — 출처 칸이 먼저 보이고 제목은 위에 숨어 있었다.

    칠하기 전(layout effect)에 되돌려야 한 틀 깜빡이지 않고, 새 화면의
    useEffect(방금 올린 글로 굴려 가기 등)보다 먼저 돌아 그쪽을 덮어쓰지 않는다.
  */
  useLayoutEffect(() => {
    if (scroller.current) scroller.current.scrollTop = 0;
  }, [pathname]);

  // 토론방 상세는 상태바가 검게 깔린다 — 노치 안전영역도 같은 색이어야 한다.
  const dark = isDarkStatusRoute(pathname);
  /*
    채팅방 테이블 장면에서는 화면 바탕도 하늘색이다. 상태바 · 헤더 · 탭 · 보기
    줄이 저마다 하늘색을 칠하지만, PC 목업은 화면을 transform 으로 줄여 그려서
    그 블록들 사이에 1px 흰 실금이 비친다 — 바탕까지 같은 색이면 실금이 안
    보인다.
  */
  const sky = useChatSky();
  /*
    알래봇은 검은 모니터라 노치 안전영역도 그 검정으로 이어져야 한다.

    모니터 알갱이(`bot-screen`)도 여기서 깐다. 이 상자는 스크롤하지 않으므로
    바탕이 대화를 따라 흐르지 않는다 — 안쪽 대화 상자에 붙였을 때는 말이
    쌓이는 대로 바탕까지 같이 밀려 올라갔다.
  */
  const bot = pathname === "/ai";
  /*
    여는 화면(초록)이 떠 있는 동안은 바탕도 같은 초록 — 온보딩 · 로그인의 여는
    화면은 스크롤 상자 안에 그려져 상태바 밑에서 시작하는데, 위의 하늘색과 같은
    까닭으로 상태바와 그 사이에 흰 실금이 비쳤다(사용자 지적).
  */
  const splash = useSyncExternalStore(
    subscribeSplash,
    getSplashVisible,
    // 서버는 홈과 온보딩을 여는 화면부터라고 본다 — 처음 여는 HTML 의 상태바 색
    // (theme-color)이 이미 초록이어야 hydration 전까지 흰 띠가 없다(감수 지적).
    // 홈도 넣는 것은 처음 온 사람이 전부 홈(QR · 공유 링크)으로 들어와 온보딩으로
    // 넘어가기 때문이다(FirstRun) — 쓰던 사람이 홈을 새로 고치면 hydration 까지
    // 잠깐 초록이었다가 흰색으로 돌아온다(감수 결정). 로그인의 여는 화면은 앱 안
    // 이동으로만 뜨니 서버가 알 필요 없다.
    () => pathname === "/" || pathname === "/onboarding",
  );

  /*
    상단 상태바 색(theme-color)을 화면 맨 위 색에 맞춘다.

    홈 화면에 내려받은 앱에서는 iOS 가 상태바 바탕을 theme-color 로 칠하고,
    Safari 는 주소창을 그 색으로 물들인다. 한 색(로고 초록)으로 못 박아 두니
    흰 화면 위에 초록 띠가, 어두운 화면(토론방 · 알래봇 · 밤 채팅방) 위에 흰
    띠가 앉았다(사용자 지적). 아래 기기 화면 바탕과 같은 규칙으로 고른다 —
    글자색(검정 · 흰색)은 iOS 가 바탕 밝기를 보고 정한다.

    meta 는 여기서 직접 그린다(React 19 는 어디서 그리든 head 로 올린다).
    layout 의 viewport 에 적어 두고 값만 바꿔 끼우면, 화면을 옮길 때 Next 가
    메타를 다시 그리며 처음 값으로 되돌려 놓았다.
  */
  const tint = splash
    ? "#008154"
    : bot
      ? "#0d0d0e"
      : dark
        ? "#000000"
        : sky === "night"
          ? "#243541"
          : sky === "day"
            ? "#dcefff"
            : "#ffffff";

  /**
   * 화면이 넘치는지 재 둔다.
   *
   * 스크롤이 필요 없는 화면(토론방처럼 한 뼘에 딱 맞는 것)에까지 「스크롤해
   * 보세요」가 떠 있으면 거짓말이 된다.
   *
   * 첫 값은 다음 틀에서 잰다 — 효과 본문에서 곧바로 상태를 건드리면 린트에
   * 걸리고, 그림·글꼴이 아직 안 와서 값도 틀리기 쉽다. 그 뒤로는 내용이
   * 자라거나 줄 때마다 ResizeObserver 가 다시 재 준다.
   *
   * 자식을 하나만 보면 안 된다 — 화면마다 헤더 · 본문이 나란히 오기도 해서,
   * 첫째만 보면 본문이 길어지는 것을 놓친다. 화면이 바뀌면 안쪽이 통째로
   * 갈리므로 경로마다 다시 건다.
   */
  useEffect(() => {
    const area = scroller.current;
    if (!area) return;
    const measure = () => setScrollable(area.scrollHeight - area.clientHeight > 8);

    const first = window.setTimeout(measure, 0);
    const observer = new ResizeObserver(measure);
    observer.observe(area);
    for (const child of area.children) observer.observe(child);
    return () => {
      window.clearTimeout(first);
      observer.disconnect();
    };
  }, [pathname]);

  /** 발표 모니터 — 인치와 화면 픽셀. 「실제 크기」가 여기서 나온다. */
  const monitor = useSyncExternalStore(subscribeMonitor, getMonitor, getMonitorServerSnapshot);
  const monitorInches = monitorInchesOf(monitor);

  // 실제 크기로 보기 = 손에 쥐는 아이폰 크기 — 창이 어떻든 같고, 모니터 인치에만 매인다.
  const scale = fit ? FIT_SCALE : String(actualScale(monitor));

  return (
    <>
      {/* 상단 상태바 · 주소창 색 — 화면 맨 위 색과 같다(tint) */}
      <meta name="theme-color" content={tint} />
    <div
      /*
        기기는 창 한가운데, 소개 글은 왼쪽 끝에 붙는다.

        글을 흐름 안에 두고 둘을 나란히 세워 봤더니, 창을 넓힐수록 두 칸이
        한 덩어리로 가운데 몰려 오른쪽만 휑하게 남았다. 글을 흐름에서 빼
        (absolute) 왼쪽에 붙이면 기기는 창을 넓히든 좁히든 늘 한가운데다.

        배율은 창 높이에만 매여 있어(`FIT_SCALE`) 흔한 모니터 비율에서는 왼쪽
        글과 겹치지 않는다 — 아주 좁고 높은 창에서만 글이 기기 뒤로 들어간다.
      */
      className="lg:relative lg:flex lg:min-h-dvh lg:items-center lg:justify-center lg:py-8"
      style={
        {
          "--screen-w": `${DEVICE.width}px`,
          "--screen-h": `${DEVICE.height}px`,
          "--bezel": `${DEVICE.bezel}px`,
          "--screen-radius": `${DEVICE.radius}px`,
          "--frame-radius": `${DEVICE.radius + DEVICE.bezel}px`,
          "--device-scale": scale,
        } as React.CSSProperties
      }
    >
      {/*
        배경 — 모바일에서는 그리지 않는다. 그림은 아래 가운데에 맞춘다 — 점포와
        보도가 바닥에 붙어 있어, 창이 넓어 위아래가 잘릴 때 하늘 쪽이 잘려야 한다.
      */}
      <div
        aria-hidden
        className="fixed inset-0 -z-10 hidden bg-cover bg-[position:center_bottom] lg:block"
        style={
          SHOWCASE.image
            ? { backgroundImage: `url(${SHOWCASE.image})` }
            : { background: SHOWCASE.background }
        }
      />
      <div
        aria-hidden
        className="fixed inset-0 -z-10 hidden lg:block"
        style={{ background: `rgba(0, 0, 0, ${SHOWCASE.overlay})` }}
      />
      {/*
        점원 — 그림에서 빼내 따로 세운다. 누르면 편의점에 들어간다(BackgroundClerk). 배경
        판(-z-10) 안에 두면 위에 깔린 화면이 누름을 다 가로채 안 눌린다 — 화면 위(z 1)에
        누름이 통하지 않는 판을 하나 더 깔고 점원만 눌리게 한다. 그림이 없으면 설 자리도
        없다.
      */}
      {SHOWCASE.image ? (
        <div
          className="pointer-events-none fixed inset-0 z-[1] hidden lg:block"
          style={{ ["--bg-k" as string]: BG_SCALE } as React.CSSProperties}
        >
          <BackgroundClerk />
        </div>
      ) : null}

      {/*
        서비스 소개와 퍼소나 고르기 — 창 왼쪽 끝에 붙어 세로 가운데에 선다(시안
        2019:7849). 맨 위는 상표 줄(작은 한 줄 · 로고 · 알래봇 얼굴), 맨 아래는 배포
        주소 큐알(150) — 전에 있던 「iPhone 17 · 402 × 874」는 뺐다(사용자 지시).
      */}
      <aside
        /*
          세로 가운데는 translate(Tailwind 의 `translate` 속성)가, 배율은
          transform 이 맡는다 — 둘은 따로 겹쳐 쓸 수 있다. 원점을 왼쪽 가운데에
          두어 줄어들어도 왼쪽 끝과 세로 가운데는 그대로다.

          fixed — 창의 세로 가운데다. absolute 로 두면 낮은 창에서 기기가 창보다
          커져 바깥 상자가 늘어나고, 그 가운데가 창 가운데보다 아래로 내려갔다
          (사용자 지적: 왼쪽이 아래로 내려가 있다). 맞추는 것은 창이 아니라 기기의
          가운데 — 오른쪽 칸은 기기 밑에 스크롤 안내(32)와 사이(16)를 달고 통째로
          가운데에 서므로 기기 가운데는 창 가운데보다 24 위다.

          2026-09-20 편의점(배경 그림)과 자리를 맞바꿔 기기 오른쪽에 선다(사용자
          지시). 창 끝이 아니라 **기기 오른쪽 모서리에서 150** 떨어진 자리다 — 기기는
          창 높이에 따라 줄어드므로(--device-scale) 모서리를 같은 식으로 셈해 붙인다.
          창을 아무리 넓혀도 기기 옆에 붙어 있고, 원점은 왼쪽 가운데. 안의 짜임은
          그대로다. 다만 창이 좁아 그 자리가 창 밖으로 나가면 오른쪽 끝에서
          ASIDE_EDGE 만큼은 남기고 멈춘다(min).
        */
        style={{
          width: ASIDE_WIDTH,
          left: `min(calc(50% + ${OUTER_WIDTH / 2}px * var(--device-scale) + 150px), calc(100vw - ${ASIDE_EDGE} - ${ASIDE_WIDTH}px * ${ASIDE_SCALE}))`,
          top: "calc(50% - 24px)",
          transform: `scale(${ASIDE_SCALE})`,
          transformOrigin: "left center",
        }}
        className="fixed hidden -translate-y-1/2 text-white [text-shadow:0_1px_10px_rgba(0,0,0,0.45)] lg:block"
      >
        {/*
          상표 줄 — 시안의 12px 한 줄 바로 밑(7)에 로고(168 × 37), 그 오른쪽(18)에 알래봇
          얼굴(75). 얼굴은 한 줄의 위보다 6 위에서 시작해 로고 밑까지 내려온다 — 시안의
          자리 그대로. 전에는 얼굴 밑선에 로고를 맞춰 한 줄과 로고 사이가 벌어졌다(사용자
          지적).
        */}
        <div className="flex items-start gap-[18px]">
          <div className="flex flex-col gap-[7px]">
            <p className="text-xs leading-[1.3] text-white">{SHOWCASE.brand}</p>
            <h1 className="sr-only">{SHOWCASE.title}</h1>
            <Img src="/assets/logo-wide.svg" className="h-[37px] w-auto" />
          </div>
          <Img src="/assets/home/ai.svg" className="-mt-[6px] size-[75px] shrink-0" />
        </div>
        <p className="pt-4 text-[15px] leading-[1.6] text-white/85">{SHOWCASE.description}</p>

        <PersonaPicker />

        {/* 큐알 — 배포 주소. 사용자가 준 그림(흰 바탕이 그림에 들어 있다), 105 · 왼쪽 아래 (150 에서 30% 줄였다 · 사용자 지시) */}
        <a
          href={SHOWCASE.qr.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={SHOWCASE.qr.label}
          className="mt-6 block w-fit overflow-hidden rounded-[10px]"
        >
          <Img src={SHOWCASE.qr.src} className="block size-[105px]" />
        </a>
      </aside>

      {/*
        오른쪽 칸 — 기기와 그 아래 안내가 한 덩어리다. 모바일에서는 `contents`
        라 이 상자가 사라지고 앱만 남는다.
      */}
      <div className="contents lg:flex lg:shrink-0 lg:flex-col lg:items-center lg:gap-4">
      {/* 축소한 만큼만 자리를 차지하도록 바깥 상자를 따로 둔다 */}
      <div
        className="contents lg:block lg:shrink-0"
        style={{
          width: `calc(${OUTER_WIDTH}px * var(--device-scale))`,
          height: `calc(${OUTER_HEIGHT}px * var(--device-scale))`,
        }}
      >
        {/*
          베젤. `device-frame` 이 PC 에서 transform 을 걸어 주는데, 그 덕분에
          안쪽 position:fixed(다이얼로그 · 플로팅 버튼)가 브라우저 전체가 아니라
          이 기기 화면을 기준으로 잡힌다 — 요구사항 2장.
        */}
        {/*
          기기는 겹 세 개다 — 바깥은 흰 금속 테(레일), 안쪽은 검은 베젤, 그 안이
          화면이다. 베젤 12 를 레일 5 + 검정 7 로 나눠 쓴다. 진짜 아이폰도 옆에서
          보면 금속 테가 두르고 그 안이 검은 유리다.

          PC 목업은 창 높이에 맞춰 0.85배쯤으로 줄여 그리므로, 여기 값은 화면에서
          보이는 것보다 조금 굵게 잡아야 한다 — 3 으로 두었더니 실이 되어 사라졌다.

          lg:w-fit — 축소 전 원래 크기(화면 + 베젤)로 잡혀야 transform 이 한 번만 걸린다.
          모바일에서는 겹만 남고 꾸밈은 전부 빠진다(lg: 만 쓴다).
        */}
        <div className="device-frame relative h-dvh w-full lg:h-auto lg:w-fit lg:rounded-[var(--frame-radius)] lg:bg-[linear-gradient(145deg,#ffffff_0%,#e4e6ea_34%,#fdfdfe_52%,#dcdfe4_72%,#f4f5f7_100%)] lg:p-[5px] lg:shadow-[0_40px_90px_-20px_rgba(0,0,0,0.5)] lg:ring-1 lg:ring-black/12">
          <SideButtons />

          <div className="h-full w-full lg:rounded-[calc(var(--frame-radius)-5px)] lg:bg-[#0a0a0c] lg:p-[7px] lg:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]">
            <div
              data-app-screen
              // 여는 화면이 떠 있는 동안 뿌리(html)까지 초록으로 — globals.css 의 html:has([data-splash])
              data-splash={splash ? "" : undefined}
              className={`device-screen relative mx-auto flex h-full w-full max-w-screen flex-col overflow-hidden pt-[env(safe-area-inset-top)] lg:h-[var(--screen-h)] lg:w-[var(--screen-w)] lg:rounded-[var(--screen-radius)] lg:pt-0 lg:pb-0 ${
                // 채팅방은 입력바가 바닥 안전영역까지 내려가 제 여백을 갖는다(ChatComposer edge) — 여기서 한 번 더 띄우면 흰 띠가 남는다
                isChatRoomRoute(pathname) ? "" : "pb-[env(safe-area-inset-bottom)]"
              } ${
                splash
                  ? "bg-primary-600"
                  : bot
                    ? "bot-screen bg-bot"
                    : dark
                      ? "bg-black"
                      : skyBackground(sky)
              }`}
            >
              {/*
                시스템 상태바 · 다이내믹 아일랜드 — 목업에서만.

                스크롤 상자 위에 1px 겹쳐 앉는다(z, 아래 상자의 -mt-px). PC 목업은
                화면을 transform 으로 줄여 그려서 상태바와 스크롤 상자의 경계가
                픽셀 사이에 걸치고, 그 틈으로 밑을 지나가는 내용(붙어 따라오는
                헤더 아래로 스크롤되는 초록 카드 같은 것)이 실선으로 비쳤다
                (사용자 지적 — 「자꾸 상단바 쪽에 실선」). 상태바가 그 경계를 덮어
                버리면 틈이 없다. z 는 붙어 따라오는 헤더(z-10 · z-20)보다 위,
                떠 있는 단추 · 팝업(z-30 이상)보다 아래.
              */}
              <div className="relative z-[25] hidden w-full shrink-0 lg:block">
                <StatusBar />
              </div>

              {/* PC 에서는 위로 1px 밀어 상태바 밑으로 들어간다 — 안쪽 내용 자리는 pt-px 로 그대로 */}
              <div
                ref={scroller}
                data-scroll-area
                onScroll={() => setScrolled(true)}
                className="no-scrollbar flex flex-1 flex-col overflow-x-clip overflow-y-auto overscroll-contain lg:-mt-px lg:pt-px"
              >
                {children}
              </div>

            {/*
              알래봇은 탭 바가 있는 화면이면 어디서나 뜬다. 전체화면(글쓰기 ·
              게시글 상세 · 토론방 · 방 만들기)은 자기 바닥 바가 있어 겹치므로
              BottomNav 와 같은 조건으로 빠진다.
            */}
              <AiButton />
              {/* 모바일 첫 진입에 한 번 — 계정 고르기 시트. 바꾸는 단추는 MY 프로필 줄에 있다(T1-R) */}
              <PersonaFirstPick />
              <BottomNav />
              <Toast />
              <NotificationBanner />

            {/* 홈 인디케이터 — 목업에서만. 모바일은 안전영역 여백이 대신한다. */}
              <div className="hidden w-full shrink-0 lg:block">
                <HomeIndicator />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/*
        스크롤 안내 — 넘치는 화면에만, 한 번 스크롤하면 접힌다.
        자리는 늘 잡아 두어 안내가 뜨고 질 때 기기가 위아래로 흔들리지 않게 한다.
        글자는 왼쪽 글과 같은 배율(vw)로 — 작은 창에서 기기보다 큰 글이 되지 않게.
      */}
      <p
        aria-hidden={!scrollable}
        style={{ fontSize: `calc(19px * ${ASIDE_SCALE})` }}
        className={`hidden h-8 items-center gap-[0.5em] leading-8 font-semibold transition-opacity duration-300 lg:flex [text-shadow:0_1px_8px_rgba(0,0,0,0.5)] ${
          !scrollable ? "opacity-0" : scrolled ? "text-white/45" : "text-white"
        }`}
      >
        {scrollable ? (
          <>
            <svg
              width="17"
              height="19"
              viewBox="0 0 17 19"
              aria-hidden
              fill="none"
              className="h-[1em] w-auto"
            >
              <path
                d="M8.5 2v14M2.5 10.5l6 6 6-6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {scrolled ? "기기 안에서 스크롤합니다" : "기기 안에서 스크롤해 보세요"}
          </>
        ) : null}
      </p>
      </div>

      {/*
        오른쪽 아래 — 보기 전환과, 실제 크기일 때만 모니터 인치 눈금.

        눈금이 있는 것은 브라우저가 모니터의 진짜 크기를 모르기 때문이다. 같은
        4K 라도 27인치와 32인치에서 402px 는 다른 크기다. 손에 쥔 아이폰을
        화면에 대 보고 −/+ 로 맞추면 이 브라우저에 남는다.
      */}
      <div className="fixed right-5 bottom-5 z-50 hidden flex-col items-end gap-2 lg:flex">
        {!fit ? (
          <div className="flex items-center gap-1 rounded-full border border-white/15 bg-white/10 py-1 pr-1 pl-3 text-xs leading-[1.4] font-medium text-white/80 backdrop-blur-sm">
            <span>모니터 {monitorInches}″</span>
            <button
              type="button"
              aria-label="모니터 인치 줄이기"
              onClick={() => setMonitorInches(monitorInches - 1)}
              className="flex size-6 items-center justify-center rounded-full hover:bg-white/15"
            >
              −
            </button>
            <button
              type="button"
              aria-label="모니터 인치 늘리기"
              onClick={() => setMonitorInches(monitorInches + 1)}
              className="flex size-6 items-center justify-center rounded-full hover:bg-white/15"
            >
              +
            </button>
          </div>
        ) : null}
        <button
          type="button"
          onClick={() => setFit((on) => !on)}
          className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs leading-[1.4] font-medium text-white/80 backdrop-blur-sm hover:bg-white/15"
        >
          {fit ? "실제 크기로 보기" : "화면에 맞추기"}
        </button>
      </div>
    </div>
    </>
  );
}
