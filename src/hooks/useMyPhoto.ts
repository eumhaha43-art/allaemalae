"use client";

import { useSyncExternalStore } from "react";
import { MY_AVATAR } from "@/data/common/personas";
import { usePersona } from "@/hooks/usePersona";
import { getSurvey, getSurveyServerSnapshot, subscribeSurvey } from "@/state/surveyStore";

/**
 * 내 프로필 사진 — 회원증 뒷면과 메뉴 프로필이 같은 것을 본다.
 *
 * 가입 프로필 장에서 넣은 사진이 있으면 그것(surveyStore). 없으면 퍼소나의
 * 사진(한상현은 인형 사진, 김민정은 가입 더미와 같은 토끼). 아무도 안 골랐으면
 * 프레임의 사진(MY_AVATAR). 가입 때 넣은 얼굴과 회원증의 얼굴이 다르면 같은
 * 사람인지 모른다(사용자 지적).
 */
export function useMyPhoto(): string {
  const persona = usePersona();
  const survey = useSyncExternalStore(subscribeSurvey, getSurvey, getSurveyServerSnapshot);
  return survey.photo ?? persona?.photo ?? MY_AVATAR;
}
