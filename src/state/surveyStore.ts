"use client";

/**
 * 가입 설문에서 고른 것 — 관심사 · 난이도 · 알림 시간, 그리고 프로필에서 정한 이름과
 * 사진. 사진은 회원증 뒷면과 메뉴 프로필이 그대로 쓴다 — 가입 때 넣은 얼굴이
 * 회원증에서 다른 얼굴이면 같은 사람이 아니다(사용자 지적).
 *
 * 세 장에 걸쳐 묻고 마지막 장에서 한꺼번에 쓰므로, 화면이 바뀌어도 남아 있어야
 * 한다.
 *
 * 탭이 살아 있는 동안 남긴다(`sessionStorage`) — 퍼소나 id 와 같은 수명이다.
 * 이름 · 사진은 가입을 마친 사람이 새로고침 한 번에 「회원」으로 불리면 방금
 * 만든 계정이 아니게 되어서고, 설문(관심사 · 난이도 · 시간)은 MY 에서 고친
 * 관심사로 홈 진열대가 바뀌는데 새로고침 · 브라우저 뒤로가기 한 번에 기본값으로
 * 돌아가면 고장으로 보여서다(감수 지적). 전에는 설문을 「한 번 지나가는 길」로
 * 보고 남기지 않았다. 탭을 닫으면 사라져 다음 사람은 기본값부터다.
 *
 * 관심사는 **고른 퍼소나**의 것으로 시작한다(`personas.ts` 의 `interests`) —
 * 홈 진열대가 이것으로 관심 태그를 놓으니, 김민정과 한상현의 진열대가 달라야
 * 한다. 사람이 바뀌면 그 사람 것으로 갈아 끼우고(coinStore 의 follow 와 같은
 * 규칙), 남긴 설문도 사람마다 따로다(keyFor) — 김민정이 고친 것이 한상현에게
 * 번지지 않는다.
 */

import { findPersona, signup } from "@/data/common/personas";
import { keyFor } from "@/state/personaScope";
import { getPersonaSnapshot, subscribePersona } from "@/state/personaStore";

export type Survey = {
  /** 고른 분야 id — 최대 둘 */
  interests: string[];
  level: string | null;
  time: string | null;
  /** 프로필에서 정한 닉네임. 마지막 장이 이름으로 부른다. */
  name: string;
  /** 프로필 장에서 넣은 사진(줄인 data URL). 안 넣었으면 null — 퍼소나 사진으로. */
  photo: string | null;
};

/**
 * 처음부터 골라져 있는 것 — 시연에서 세 장을 그냥 넘길 수 있게.
 *
 * 매번 다섯 칸을 눌러 가며 지나가야 하면 보여 주려는 것(설문 뒤의 진열 화면과
 * 홈)까지 가는 데만 손이 여러 번 간다. 관심사는 고른 퍼소나의 것이고(seedFor),
 * 여기 적힌 것은 아무도 안 고른 새 회원(signup)의 것 — 서버도 이것으로 그린다.
 *
 * 물론 눌러서 바꿀 수 있다. 고르지 않은 채로 넘어가는 길만 막혀 있던 것이라,
 * 미리 골라 두어도 잃는 것이 없다.
 */
const SEED: Survey = {
  interests: [...signup.interests],
  level: "lv1",
  /** 알림 시간만은 디자인에 정해진 것이 없어 아침으로 둔다. */
  time: "morning",
  name: "",
  photo: null,
};

/** 그 사람의 처음 설문 — 관심사만 퍼소나마다 다르다. 아무도 안 골랐으면 SEED. */
function seedFor(id: string | null): Survey {
  const who = findPersona(id);
  return who ? { ...SEED, interests: [...who.interests] } : SEED;
}

const PROFILE_KEY = "rmb.profile";
/** 설문(관심사 · 난이도 · 시간)의 열쇠 — 뒤에 퍼소나 id 가 붙는다. */
const SURVEY_KEY = "rmb.survey";

type Answers = Pick<Survey, "interests" | "level" | "time">;

/** 그 사람이 탭에 남긴 설문 — 없거나 깨졌으면 null(처음 값으로). */
function loadSurvey(id: string | null): Answers | null {
  try {
    const raw = window.sessionStorage.getItem(keyFor(SURVEY_KEY, id));
    if (!raw) return null;
    const kept = JSON.parse(raw) as Partial<Answers>;
    if (!Array.isArray(kept.interests)) return null;
    return {
      interests: kept.interests.filter((one): one is string => typeof one === "string"),
      level: typeof kept.level === "string" ? kept.level : null,
      time: typeof kept.time === "string" ? kept.time : null,
    };
  } catch {
    return null;
  }
}

let survey: Survey = SEED;
/** 지금 설문이 누구 것인지 — 바뀌었을 때만 갈아 끼운다. */
let owner: string | null = null;
/** 브라우저에 남긴 이름 · 사진을 읽어 왔는지 — 서버에서 그린 것과 맞추려고 둔다. */
let loaded = false;
const listeners = new Set<() => void>();

function write(next: Survey): void {
  survey = next;
  listeners.forEach((notify) => notify());
}

/** 설문을 탭에 남긴다 — 지금 사람 것으로. */
function keepSurvey(): void {
  try {
    window.sessionStorage.setItem(
      keyFor(SURVEY_KEY, owner),
      JSON.stringify({ interests: survey.interests, level: survey.level, time: survey.time }),
    );
  } catch {
    // 못 남기면 이 판에서만 든다
  }
}

/** 이름 · 사진을 탭에 남긴다. 사진은 줄인 data URL 이라 몇십 KB 다. */
function keepProfile(): void {
  try {
    window.sessionStorage.setItem(
      PROFILE_KEY,
      JSON.stringify({ name: survey.name, photo: survey.photo }),
    );
  } catch {
    // 못 남기면 이 판에서만 든다
  }
}

/** 남겨 둔 이름 · 사진을 한 번 읽어 온다 — 처음 읽는 자리에서. */
function loadProfile(): void {
  if (loaded) return;
  loaded = true;
  try {
    const raw = window.sessionStorage.getItem(PROFILE_KEY);
    if (!raw) return;
    const kept = JSON.parse(raw) as Partial<Pick<Survey, "name" | "photo">>;
    survey = { ...survey, name: kept.name ?? "", photo: kept.photo ?? null };
  } catch {
    // 못 읽으면 빈 이름으로 — 퍼소나 이름이 대신한다
  }
}

/**
 * 퍼소나가 바뀌면 그 사람의 설문으로 갈아 끼운다 — 홈 진열대 · MY 관심 카테고리 ·
 * 회원증 Likes 가 같이 바뀐다. 이름 · 사진은 그대로 둔다(clearProfile 이 맡는다).
 *
 * **바뀌었을 때만** 갈아 끼우는 것이 중요하다. 알림마다 다시 세우면 MY 에서
 * 고친 관심사가 도로 돌아간다.
 */
function follow(): void {
  const id = getPersonaSnapshot();
  if (id === owner) return;
  owner = id;
  write({ ...seedFor(id), ...loadSurvey(id), name: survey.name, photo: survey.photo });
}

if (typeof window !== "undefined") {
  follow();
  subscribePersona(follow);
}

export function subscribeSurvey(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getSurvey(): Survey {
  loadProfile();
  return survey;
}

/** 서버도 같은 것을 본다 — 다르면 첫 그림이 갈려 React 가 화면을 다시 짠다. */
export function getSurveyServerSnapshot(): Survey {
  return SEED;
}

/**
 * 관심사 하나를 켜고 끈다.
 *
 * 꽉 찼는데 새로 고르면 가장 먼저 고른 것을 놓아 준다 — 「최대 2개」라고만 적고
 * 아무 반응이 없으면 고장으로 보인다.
 */
export function toggleInterest(id: string, max: number): void {
  const now = survey.interests;
  if (now.includes(id)) {
    write({ ...survey, interests: now.filter((one) => one !== id) });
    keepSurvey();
    return;
  }
  const next = now.length >= max ? [...now.slice(1), id] : [...now, id];
  write({ ...survey, interests: next });
  keepSurvey();
}

export function setLevel(level: string): void {
  write({ ...survey, level });
  keepSurvey();
}

export function setTime(time: string): void {
  write({ ...survey, time });
  keepSurvey();
}

export function setSurveyName(name: string): void {
  write({ ...survey, name });
  keepProfile();
}

export function setSurveyPhoto(photo: string | null): void {
  write({ ...survey, photo });
  keepProfile();
}

/**
 * 퍼소나를 새로 고를 때 · 「이 계정 처음부터 체험」 — 그 사람의 처음 설문으로
 * 돌아간다(PersonaPicker → usePersonaStart). 이름 · 사진은 그 사람 것으로, 관심사 ·
 * 난이도 · 시간은 골라 둔 값으로.
 */
export function clearProfile(): void {
  loaded = true;
  owner = getPersonaSnapshot();
  write(seedFor(owner));
  try {
    window.sessionStorage.removeItem(PROFILE_KEY);
    window.sessionStorage.removeItem(keyFor(SURVEY_KEY, owner));
  } catch {
    // 지울 것이 없으면 그만
  }
}
