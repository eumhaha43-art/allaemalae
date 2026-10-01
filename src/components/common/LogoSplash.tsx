"use client";

import { useLayoutEffect, useState } from "react";
import LottieMotion from "@/app/onboarding/_components/LottieMotion";
import { SPLASH_MS } from "@/app/onboarding/_data/onboarding";
import { markSplash, setSplashVisible } from "@/state/splashStore";

/**
 * 여는 화면 — 로고가 봉투 안으로 떨어져 모이는 그림(로티, 2초).
 *
 * 두 자리에서만 뜬다 — 온보딩 앞(Onboarding 의 Splash)과 쓰던 사람의 로그인
 * 앞(LoginScreen). 앱을 여는 판마다 띄우던 것(ShowcaseLayout 의 AppSplash)은
 * 뺐다 — 새로고침이 끼면 지식 상세 한가운데서도 튀어나왔다(사용자 지적).
 * 바탕은 메인 초록,
 * 그림은 한 번만 돌고 마지막 칸에 멈춘다 — 돌고 또 돌면 로고가 아니라
 * 로딩으로 읽힌다.
 *
 * SPLASH_MS 뒤에 흐려지며(FADE_MS) 걷힌다. 그림이 2초라 그 뒤 반 초쯤 완성된
 * 로고를 보여 주고 나간다.
 *
 * 떠 있는 동안 목업 상태바도 같은 초록이 된다(splashStore.setSplashVisible).
 * 온보딩 · 로그인에서는 이 화면이 스크롤 상자 안에 그려져 상태바를 못 덮는다.
 * 그 켜기는 첫 그림 **전**(useLayoutEffect)에 한다 — 그림 뒤(useEffect)에 켜면
 * 첫 프레임이 흰 상태바로 나가 초록 화면 위에 흰 띠가 스쳤다(감수 지적).
 */
const FADE_MS = 300;

export default function LogoSplash({ onDone }: { onDone: () => void }) {
  const [leaving, setLeaving] = useState(false);

  useLayoutEffect(() => {
    markSplash();
    setSplashVisible(true);
    const fade = window.setTimeout(() => {
      setLeaving(true);
      // 걷히기 시작하면 상태바도 같이 돌아온다 — 상태바 쪽 색 전환이 이 흐림과 같은 길이다
      setSplashVisible(false);
    }, SPLASH_MS);
    const done = window.setTimeout(onDone, SPLASH_MS + FADE_MS);
    return () => {
      window.clearTimeout(fade);
      window.clearTimeout(done);
      setSplashVisible(false);
    };
  }, [onDone]);

  return (
    <div
      aria-label="알래말래븐"
      className={`absolute inset-0 z-[70] flex items-center justify-center bg-primary-600 transition-opacity duration-300 ${
        leaving ? "pointer-events-none opacity-0" : ""
      }`}
    >
      {/* 402 × 874 로 그린 그림 — 화면에 맞춰 비율대로 들어간다 */}
      <LottieMotion src="/assets/splash/logo.json" loop={false} className="size-full" />
    </div>
  );
}
