"use client";

import { useCallback, useState, useSyncExternalStore } from "react";
import BottomSheet from "@/components/common/BottomSheet";
import PersonaCards from "@/components/showcase/PersonaCards";
import { personas, picker, signup } from "@/data/common/personas";
import { usePersona } from "@/hooks/usePersona";
import { setPersona } from "@/state/personaStore";
import {
  getSplashVisible,
  getSplashVisibleServerSnapshot,
  subscribeSplash,
} from "@/state/splashStore";

/**
 * 모바일의 퍼소나 바꾸기 — MY 프로필 줄 오른쪽의 「전환」 단추. 누르면 아래에서
 * 시트가 올라와 PC 셸과 같은 카드 둘과 「처음부터 체험」을 보인다.
 *
 * PC 셸(lg 이상)에는 왼쪽 칸이 있어 여기가 필요 없고(lg:hidden), 좁은 폭에서는
 * 계정을 바꿀 길이 통째로 없었다(기획 피드백). 전에는 화면 위에 떠 있는 칩 ·
 * 손잡이였는데, 떠 있는 것은 어디에 두어도 아래 내용을 덮거나 그 탭을 가로챘다
 * (감수 T1 · T1-R) — 이제 MY 화면 안의 보통 단추다.
 */
export default function PersonaSwitch() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={picker.switchLabel}
        onClick={() => setOpen(true)}
        className="tap ml-auto flex h-8 shrink-0 items-center rounded-full bg-primary-600 px-3 text-xs leading-none font-semibold text-white transition-opacity active:opacity-70 lg:hidden"
      >
        {picker.switch}
      </button>

      <BottomSheet open={open} title={picker.sheetTitle} onClose={() => setOpen(false)}>
        <PersonaCards light onPicked={() => setOpen(false)} />
      </BottomSheet>
    </>
  );
}

/**
 * 첫 진입 시트를 이미 봤는지 — 앱을 여는 판(탭 · 앱 실행)마다 한 번만 띄운다.
 *
 * 브라우저에 영영 남기지(localStorage) 않는다 — 한 번 닫고 나면 다음 시연에서
 * 계정 고르기가 아예 안 나와 「없어졌다」고 보였다(사용자 지적). 퍼소나 자체가
 * 탭 단위(sessionStorage)로 기억되니 이 표시도 같은 수명이 맞다.
 */
const SEEN_KEY = "rmb.persona.first-pick";

function seen(): boolean {
  try {
    return window.sessionStorage.getItem(SEEN_KEY) === "1";
  } catch {
    return true;
  }
}

function markSeen(): void {
  try {
    window.sessionStorage.setItem(SEEN_KEY, "1");
  } catch {
    // 기억을 못 하는 브라우저 — 이번 판에는 안 뜨게 상태가 막는다
  }
}

/** 모바일 폭인지 — PC 셸(lg 이상)에는 왼쪽 칸이 있어 첫 진입 시트가 필요 없다. */
const MOBILE = "(max-width: 1023px)";

function subscribeMobile(listener: () => void): () => void {
  const query = window.matchMedia(MOBILE);
  query.addEventListener("change", listener);
  return () => query.removeEventListener("change", listener);
}

const getMobile = () => window.matchMedia(MOBILE).matches;
const getMobileServerSnapshot = () => false;

/**
 * 모바일 첫 진입 시트 — 앱을 여는 판마다 한 번, 계정 고르기 시트를 띄운다
 * (감수 T1-R). 셸(ShowcaseLayout)이 그린다.
 *
 * 여는 화면(스플래시)이 걷힌 뒤에 올라온다 — 로고 위에 시트가 겹치지 않게.
 * 고르면 그 사람의 시작 지점으로(PersonaCards → usePersonaStart), 닫거나
 * 건너뛰면 김민정으로 조용히 이어진다 — 아무도 안 고른 새 회원(signup)은
 * 이름이 없어서, 흐름은 그대로 두고 사람만 앉힌다. 어느 쪽이든 이 판에서는 다시 안 뜬다.
 */
export function PersonaFirstPick() {
  const mobile = useSyncExternalStore(subscribeMobile, getMobile, getMobileServerSnapshot);
  const splash = useSyncExternalStore(
    subscribeSplash,
    getSplashVisible,
    getSplashVisibleServerSnapshot,
  );
  const persona = usePersona();
  /** 이 판에서 닫았는지 — sessionStorage 를 못 쓰는 브라우저에서도 한 번만 */
  const [done, setDone] = useState(false);

  const close = useCallback(() => {
    markSeen();
    setDone(true);
    if (!persona || persona.id === signup.id) {
      const minjeong = personas.find((one) => one.fresh);
      if (minjeong) setPersona(minjeong.id);
    }
  }, [persona]);

  const picked = useCallback(() => {
    markSeen();
    setDone(true);
  }, []);

  if (!mobile || splash || done || seen()) return null;

  return (
    <BottomSheet open title={picker.firstTitle} onClose={close}>
      <PersonaCards light onPicked={picked} />
      <button
        type="button"
        onClick={close}
        className="tap mt-4 self-center text-[13px] leading-[1.4] text-gray-500 underline underline-offset-4"
      >
        {picker.skip}
      </button>
    </BottomSheet>
  );
}
