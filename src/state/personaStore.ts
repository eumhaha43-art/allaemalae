"use client";

/**
 * 지금 누구로 보고 있는지 — PC 쇼케이스에서 고른 퍼소나.
 *
 * 고르는 것이 로그인을 대신한다. 나중에 로그인 화면이 붙으면 그 화면이 여기
 * 사람을 앉히면 되고, 화면들은 지금처럼 이 값만 보면 된다.
 *
 * 탭이 살아 있는 동안만 기억한다(`sessionStorage`). 새로고침에는 남아야
 * 한다 — 시연 중에 화면을 다시 불러올 때마다 누구인지 다시 고르게 하면
 * 이야기가 끊긴다. 반대로 탭을 닫으면 지워져, 다음 사람은 고르는 자리부터
 * 시작한다.
 *
 * 아무도 안 골랐으면 **새 회원**(`signup`)이다. 앱을 처음 연 사람은 온보딩 ·
 * 가입부터 지나가는 새 회원인데, 전에는 가입 화면을 마칠 때까지 아무도 아닌
 * 채라 프레임의 자리 표시(홍길동 · 블랙카드 · 80코인 · 냉장고 아홉 · 지난 기록)
 * 가 그대로 나왔다 — 새로 시작한 사람의 앱이 아니었다(기획 지적). 퍼소나
 * 카드에서 김민정 · 한상현을 고르면 그 사람으로 바뀐다.
 */

import { signup } from "@/data/common/personas";

const KEY = "rmb.persona";

/** 아직 브라우저 것을 읽어 오기 전인지. 서버에서 그린 것과 맞추려고 둔다. */
let loaded = false;
let current: string | null = null;

const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((run) => run());
}

export function subscribePersona(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getPersonaSnapshot(): string | null {
  if (!loaded) {
    loaded = true;
    try {
      current = window.sessionStorage.getItem(KEY) ?? signup.id;
    } catch {
      // 기억을 못 하는 브라우저 — 이번 판에만 들고 있는다
      current = signup.id;
    }
  }
  return current;
}

/** 서버는 누구인지 모른다 — 아무도 안 고른 것으로 그린다. */
export function getPersonaServerSnapshot(): string | null {
  return null;
}

export function setPersona(id: string | null): void {
  loaded = true;
  if (current === id) return;
  current = id;
  try {
    if (id === null) window.sessionStorage.removeItem(KEY);
    else window.sessionStorage.setItem(KEY, id);
  } catch {
    // 못 적어도 이번 판은 위의 값이 들고 있다
  }
  notify();
}
