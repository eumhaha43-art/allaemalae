"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AppHeader from "@/components/common/AppHeader";
import Img from "@/components/common/Img";
import LottieMotion from "@/app/onboarding/_components/LottieMotion";
import { ACTION_BTN, ACTION_DISABLED, ACTION_ON } from "@/components/common/actionButton";
import Splash from "@/app/onboarding/_components/Splash";
import { AFTER_ONBOARDING, onboardingCopy, steps } from "@/app/onboarding/_data/onboarding";
import {
  getOnboardingRun,
  getOnboardingRunServerSnapshot,
  markOnboarded,
  subscribeOnboardingRun,
} from "@/app/onboarding/_lib/seen";
import { recentlySplashed } from "@/state/splashStore";

/**
 * 온보딩 — Figma 1272:3246 · 1182:1073 · 1219:3769 · 1251:3947.
 *
 * 네 장인데 첫 장은 이름만 띄우는 여는 화면이라 따로 그린다(`Splash`).
 * 그 뒤 셋이 여기다 — 머리는 공통 헤더의 Header05(뒤로 · 로고 · Skip)로,
 * 컴포넌트에 그려만 두고 쓰는 화면이 없던 갈래에 자리가 생겼다.
 *
 * 가운데는 디자이너가 준 Lottie 가 돈다. 장마다 다른 것은 글 두 줄과 그
 * 그림뿐이라 셋을 `steps` 에 적어 두고 여기서는 한 장씩 넘기기만 한다.
 *
 * 아래 점은 배열 길이를 그대로 따른다. 몇 개인지 손으로 적어 두면 장을
 * 늘렸을 때 점만 그대로 남아, 다음 장이 있는데 없는 것처럼 보인다.
 *
 * 퍼소나를 고를 때마다(resetOnboarding) 판이 바뀌고, 그 수를 key 로 삼아
 * 흐름을 통째로 다시 그린다 — 온보딩에 서 있는 채로 김민정을 고르면 같은
 * 경로라 아무것도 안 바뀌었다. 여는 화면부터 첫 장까지 처음처럼 다시 간다.
 */
export default function Onboarding() {
  const run = useSyncExternalStore(
    subscribeOnboardingRun,
    getOnboardingRun,
    getOnboardingRunServerSnapshot,
  );
  return <OnboardingFlow key={run} />;
}

function OnboardingFlow() {
  const router = useRouter();
  /** 여는 화면을 지났는지. 저절로 넘어간다(`SPLASH_MS`). */
  // 앱을 열며 여는 화면을 방금 봤으면(홈 → 온보딩으로 넘어온 첫 손님) 건너뛴다
  const [opened, setOpened] = useState(() => recentlySplashed());
  const [at, setAt] = useState(0);
  /**
   * 이 장의 그림이 다 들어왔는지(`ready`, 없으면 다 돌았는지).
   *
   * 그 전에는 아래 단추가 잠겨 있다 — 넘기는 손이 그림을 자르지 않게.
   * 장을 넘길 때마다 도로 잠근다.
   */
  const [played, setPlayed] = useState(false);
  const step = steps[at];
  const last = at === steps.length - 1;

  /*
    그림이 끝났다는 기별은 여러 번 올 수 있다(끝남 · 못 받아 옴 · 너무 오래).
    한 번만 세워 두면 몇 번이 오든 같다.
  */
  const markPlayed = useCallback(() => setPlayed(true), []);

  /*
    여는 화면이 쥐고 있는 시계가 이것에 매여 있다. 그릴 때마다 새로 만들면
    이 화면이 다시 그려질 때 시계가 처음부터 다시 걸려, 여는 화면이 제때
    넘어가지 않는다.
  */
  const openApp = useCallback(() => setOpened(true), []);

  // 들어선 순간 본 것으로 친다 — 보다가 나간 사람을 홈에서 또 붙잡지 않게
  useEffect(() => {
    markOnboarded();
  }, []);

  /** 마지막 장에서는 앱으로 들여보내고, 아니면 다음 장으로. */
  const next = () => {
    if (!last) {
      setAt((now) => now + 1);
      setPlayed(false);
      return;
    }
    markOnboarded();
    router.replace(AFTER_ONBOARDING);
  };

  /*
    첫 장에는 뒤로가기가 없다(1182:1073 에서 뺀 것) — 앞에 있는 것은 저절로
    지나간 여는 화면이라 돌아갈 곳이 아니다. `null` 이면 자리만 잡고 그리지
    않아, 가운데 로고가 그대로 한가운데 남는다.

    두 번째 장부터는 앞 장으로 돌아간다. 브라우저 뒤로를 쓰면 방금 본 것을
    다시 보려고 눌렀는데 온보딩이 통째로 닫힌다.
  */
  const back =
    at === 0
      ? null
      : () => {
          setAt((now) => now - 1);
          setPlayed(false);
        };

  if (!opened) return <Splash onDone={openApp} />;

  return (
    <main className="flex min-h-full w-full shrink-0 flex-col bg-white">
      {/*
        로고는 홈으로 안 간다 — 소개와 가입을 건너뛰는 길이 됐다(사용자 지적).
        구분선 — 흰 헤더가 회색 본문(#f8f9f8)과 선 없이 맞닿아 색이 어긋나 보였다
        (감수 지적). 홈 · MY 와 같은 1px.
      */}
      <AppHeader back={back} sticky={false} logoHome={false} divider>
        {/*
          Skip — 1170:3579. 건너뛴 것도 본 것으로 친다. 안 그러면 홈에 닿는
          순간 다시 여기로 끌려와, 건너뛸 수가 없다.
        */}
        <Link
          href={AFTER_ONBOARDING}
          replace
          onClick={() => markOnboarded()}
          className="tap [--tap-w:40px] text-[13px] leading-[18px] font-semibold tracking-[0.26px] text-gray-900 transition-opacity active:opacity-55"
        >
          {onboardingCopy.skip}
        </Link>
      </AppHeader>

      <div className="flex flex-1 flex-col bg-[#f8f9f8] pt-10 pb-[29px]">
        <div className="w-full px-6">
          {/* 줄바꿈이 디자인이라 배열 그대로 한 줄씩 그린다 — 1182:1082 */}
          <h1 className="text-heading-28 text-gray-black">
            {step.title.map((row) => (
              <span key={row} className="block">
                {row}
              </span>
            ))}
          </h1>
          <p className="pt-[10px] text-body-14 text-gray-400">{step.sub}</p>
        </div>

        {/*
          그림은 남는 자리를 다 쓴다. 402 짜리를 그대로 박아 두면 화면이
          작은 기기에서 아래 단추를 밀어내는데, 자리에 맞춰 줄면 Lottie 가
          알아서 가운데로 맞춘다(preserveAspectRatio).

          세 장 다 그림이 왔다. 그래도 없는 장이 생기면 자리만 비워 둔다 —
          프레임도 이 자리를 비워 두고 있어서, 없는 동안의 모습이 곧 디자인이다.
        */}
        {step.motion ? (
          <LottieMotion
            src={step.motion}
            speed={step.speed}
            loop={false}
            hold={step.hold}
            doneAt={step.ready}
            onDone={markPlayed}
            className="min-h-0 w-full flex-1"
          />
        ) : (
          <div aria-hidden className="min-h-0 w-full flex-1" />
        )}

        {/* 점과 단추 — 1203:3341. 사이 20, 폭은 양옆 24 를 뺀 354 */}
        <div className="flex w-full flex-col items-center gap-5 px-6">
          <div className="flex items-center gap-2">
            {steps.map((one, index) => (
              <span
                key={one.sub}
                aria-hidden
                className={`size-[10px] rounded-full ${
                  index === at ? "bg-primary-600" : "bg-gray-300"
                }`}
              />
            ))}
          </div>

          {/*
            그림이 다 들어오면 열린다 — 그림이 없는 장은 기다릴 것이 없다.

            잠겨 있는 동안은 회색이기만 하다 — 글자는 그대로 「다음」이다
            (「영상 보는 중…」은 뺐다 · 사용자 결정). 밑에 본 만큼 차던 막대도
            뺐다(사용자 지시). 마지막 장은 「시작하기」 — 「다음」이라고 하면
            장이 더 있는 줄 안다.
          */}
          <button
            type="button"
            onClick={next}
            disabled={Boolean(step.motion) && !played}
            className={`${ACTION_BTN} ${ACTION_ON} ${ACTION_DISABLED} w-full`}
          >
            {last ? onboardingCopy.start : onboardingCopy.next}
          </button>
        </div>
      </div>

      {/*
        홈 인디케이터 — 2:62. 전체화면이라 공용 인디케이터가 빠지므로
        (`isFullscreenRoute`) 여기서 그린다. 디자인도 바탕이 흰 이 띠다.
      */}
      <div className="home-bar relative h-[34px] w-full shrink-0 bg-white">
        <Img
          src="/assets/home-indicator.svg"
          className="absolute bottom-2 left-1/2 h-[5px] w-[134px] -translate-x-1/2"
        />
      </div>
    </main>
  );
}
