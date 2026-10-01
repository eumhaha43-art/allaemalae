"use client";

import { useEffect, useLayoutEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { needsOnboarding } from "@/app/onboarding/_lib/seen";
import { setSplashVisible } from "@/state/splashStore";

/**
 * 처음 온 사람을 온보딩으로 보낸다 — 홈에만 붙인다.
 *
 * 온보딩은 앱을 처음 여는 사람에게 한 번 보여 주는 화면이라, 주소를 직접
 * 쳐야만 볼 수 있으면 아무도 못 본다. 그렇다고 아무 화면에서나 가로채면 링크로
 * 받은 글을 열려던 사람까지 소개 화면에 갇히므로, 앱의 첫 자리인 홈만 본다.
 *
 * `replace` 로 간다. 밀어 넣으면 온보딩에서 뒤로 눌렀을 때 홈으로 갔다가 여기서
 * 다시 온보딩으로 끌려와, 나갈 수 없는 고리가 된다.
 *
 * 넘어가는 동안 천을 덮는다. 기기 목업 안에서는 `fixed` 가 기기 화면을
 * 기준으로 잡히므로(ShowcaseLayout 의 transform) 이 한 장이면 화면이 다 가려진다.
 * 천은 여는 화면과 같은 초록이고 그동안 상태바도 초록으로 둔다(setSplashVisible)
 * — 흰 천이면 초록 여는 화면 앞에 흰 화면이 한 번 끼어 상태바가 흰색 · 초록을
 * 오갔다(감수 지적). 온보딩의 여는 화면이 이어받아 끄고, 여기서는 나갈 때 끈다.
 */

/**
 * 홈에서 저절로 온보딩으로 보낼지.
 *
 * 스위치로 남겨 둔 것은, 커뮤니티 화면을 같이 만들던 동안 이것을 켜 두면 홈을
 * 새로고침할 때마다 온보딩으로 튕겨 그쪽 확인을 막았기 때문이다. 그때는 홈
 * (`src/app/page.tsx`)에서 `<FirstRun />` 을 빼는 대신 여기서 껐다 — 공용
 * 파일을 두 사람이 번갈아 고치면 서로 지운다.
 *
 * 같은 일이 또 있으면 이 한 줄만 `false` 로 두면 된다. 꺼 두어도 온보딩은
 * `/onboarding` 으로 들어가면 그대로 보인다.
 */
const AUTO_OPEN = true;

/*
  칠하기 전에 정해야 홈이 한 번 번쩍이지 않는다. useEffect 는 첫 칠 뒤에 도는
  터라, 처음 온 사람에게 홈이 한 틀 보였다가 사라졌다.

  서버에는 layout effect 가 없어 그대로 부르면 경고가 난다 — 서버에서는 어차피
  아무것도 안 하는 useEffect 로 바꿔 둔다.
*/
const useBeforePaint = typeof window === "undefined" ? useEffect : useLayoutEffect;

export default function FirstRun() {
  const router = useRouter();
  const [leaving, setLeaving] = useState(false);

  useBeforePaint(() => {
    if (!AUTO_OPEN) return;
    if (!needsOnboarding()) return;
    setLeaving(true);
    setSplashVisible(true);
    router.replace("/onboarding");
    return () => setSplashVisible(false);
  }, [router]);

  if (!leaving) return null;

  return <div aria-hidden className="fixed inset-0 z-50 bg-primary-600" />;
}
