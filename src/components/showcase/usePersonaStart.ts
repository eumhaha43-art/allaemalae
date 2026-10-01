"use client";

import { useRouter } from "next/navigation";
import { resetOnboarding } from "@/app/onboarding/_lib/seen";
import { resetCoinGuide } from "@/state/coinGuideStore";
import { resetComments } from "@/state/commentStore";
import { resetGachaGuide } from "@/state/gachaGuideStore";
import { resetGrounds } from "@/state/groundStore";
import { setPersona } from "@/state/personaStore";
import { resetWrittenPosts } from "@/state/postStore";
import { resetReactions } from "@/state/reactionStore";
import { resetRooms } from "@/state/roomStore";
import { markSplash, requestSplash } from "@/state/splashStore";
import { clearProfile } from "@/state/surveyStore";
import type { Persona } from "@/types/persona";
import { isMobileShell } from "@/utils/mobileShell";

/**
 * 고른 사람의 시작 지점으로 보낸다 — PC 셸의 고르기와 모바일의 바텀시트가 같이
 * 쓴다(한 저장소 · 한 규칙). 로그인 화면이 아직 없어 이 고르기가 그 자리를
 * 대신한다.
 *
 * 처음 온 사람: 여는 화면 → 온보딩 → 가입 → 설문 → 홈. 쓰던 사람: 여는 화면 →
 * 로그인 → 홈. 온보딩은 제 여는 화면을 갖고 있고, 로그인은 부탁받았을 때만
 * 띄운다(requestSplash) — 온보딩을 지나온 사람에게 또 보이지 않게.
 *
 * 안내들(코인 · 뽑기 사용법)도 처음 온 사람처럼 되돌린다 — 이 탭에서 두 번째
 * 시연에도 떠야 한다. 앞사람이 가입 때 넣은 이름 · 사진은 그 사람 것이라 잊는다.
 *
 * 이 사람이 지난 시연에서 남긴 커뮤니티 활동(글 · 댓글 · 좋아요 · 근거 · 채팅방)도
 * 비운다 — 「처음부터」인데 나의 활동에 지난번 글이 대표 지식으로 걸려 있으면
 * 처음이 아니다(기획 지적). 이번 시연 중에 쓴 것은 그때부터 쌓인다. 오늘 막
 * 가입한 사람 것은 애초에 브라우저에 남지 않는다(personaScope).
 *
 * 모바일(목업 없는 폭, isMobileShell)에서는 바꿀 때 여는 화면을 건너뛴다(사용자
 * 지시) — 앱을 열며 이미 한 번 봤는데 첫 진입 시트에서 사람을 고르는 순간 또
 * 나와 두 번 보였다. 처음 온 사람은 「방금 봤다」로 쳐서(markSplash) 온보딩이 제
 * 여는 화면을 건너뛰고, 쓰던 사람은 로그인에 부탁하지 않는다. PC 셸은 그대로다.
 */
export function usePersonaStart(): (persona: Persona) => void {
  const router = useRouter();
  return (persona) => {
    setPersona(persona.id);
    resetOnboarding();
    resetGachaGuide();
    resetCoinGuide();
    clearProfile();
    resetWrittenPosts(persona.id);
    resetComments(persona.id);
    resetReactions(persona.id);
    resetGrounds(persona.id);
    resetRooms(persona.id);
    // resetOnboarding 이 「방금 봤다」를 잊은 뒤에 읽어야 한다 — 그 앞에서 표시하면 지워진다
    const mobile = isMobileShell();
    if (persona.fresh) {
      if (mobile) markSplash();
      router.replace("/onboarding");
      return;
    }
    if (!mobile) requestSplash();
    router.replace("/login");
  };
}
