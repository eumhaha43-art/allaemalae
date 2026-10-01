"use client";

import LogoSplash from "@/components/common/LogoSplash";

/**
 * 온보딩의 여는 화면 — 앱을 열 때 뜨는 것(LogoSplash)과 같은 그림이다.
 *
 * 「이 계정 처음부터 체험」으로 온보딩을 다시 열면 여기서 한 번 더 뜬다.
 * 앱을 막 열어 여는 화면을 방금 본 사람은 Onboarding 이 이 화면을 건너뛴다
 * (recentlySplashed).
 */
export default function Splash({ onDone }: { onDone: () => void }) {
  return (
    <main className="relative min-h-full w-full shrink-0">
      <LogoSplash onDone={onDone} />
    </main>
  );
}
