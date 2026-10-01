"use client";

import { useSyncExternalStore } from "react";
import { findPersona, guest } from "@/data/common/personas";
import {
  getPersonaServerSnapshot,
  getPersonaSnapshot,
  subscribePersona,
} from "@/state/personaStore";
import { getSurvey, getSurveyServerSnapshot, subscribeSurvey } from "@/state/surveyStore";
import type { Persona } from "@/types/persona";

/** 지금 고른 퍼소나. 아무도 안 골랐으면 `null`. */
export function usePersona(): Persona | null {
  const id = useSyncExternalStore(
    subscribePersona,
    getPersonaSnapshot,
    getPersonaServerSnapshot,
  );
  return findPersona(id);
}

/**
 * 화면이 사람을 부를 때 쓰는 이름 — 어디서나 같은 이름 하나다.
 *
 * 차례는 가입 때 넣은 닉네임(surveyStore) → 고른 퍼소나의 이름 → 프레임에 적혀
 * 있던 자리 표시(홍길동). 전에는 홈이 성을 뗀 「상현 님」, 회원증은 「한상현」,
 * 알림은 「회원님」이라 화면마다 달랐다(감수 지적) — 이제 성을 떼지 않는다.
 * `call` 과 `full` 은 같은 값이다 — 부르는 자리가 둘이던 때의 이름을 남겨
 * 둔 것뿐이다.
 *
 * 등급은 없으면 없는 대로 빈칸이다. 아무도 안 골랐을 때의 값(BLACK CARD)을
 * 끌어다 쓰면, 오늘 막 가입한 사람에게 최고 등급이 붙는다.
 */
export function useUserName(): { call: string; full: string; tier: string } {
  const persona = usePersona();
  const survey = useSyncExternalStore(subscribeSurvey, getSurvey, getSurveyServerSnapshot);
  const name = survey.name.trim() || persona?.name || guest.name;
  const tier = persona ? persona.tier : guest.tier;
  return { call: name, full: name, tier };
}

/**
 * 글 안에 든 이름 자리를 지금 사람 이름으로 바꾼다.
 *
 * 「○○ 님을 위한 오늘의 상품」처럼 이름이 문장 한가운데 박힌 자리가 있어서,
 * 데이터에는 자리만 비워 두고 그리는 쪽에서 채운다 — 데이터가 누가 보고
 * 있는지 알 필요는 없다. `{name}` 과 `{fullName}` 은 이제 같은 이름이다.
 */
export function useNameFill(): (text: string) => string {
  const { call, full } = useUserName();
  return (text: string) => text.replaceAll("{name}", call).replaceAll("{fullName}", full);
}
