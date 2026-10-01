"use client";

import { useSyncExternalStore } from "react";
import { quizSet } from "@/data/common/home";
import { getPersonaSnapshot, subscribePersona } from "@/state/personaStore";

/**
 * 잡지식 세트의 진행 — 읽은 줄과 퀴즈를 다 맞혔는지.
 *
 * 전에는 홈의 QuizBox 가 제 안에서 들고 있었다(`useState`). 세트 두 줄을 읽고
 * 지식 상세에 갔다 돌아오면 홈이 새로 그려지며 디자인의 처음 상태(1번만 읽음)로
 * 되돌아갔고, 켜져 있던 「퀴즈 풀러가기」가 도로 꺼졌다 — 시연 중에 겪으면
 * 사고다(감수 지적). 코인 · 쿠폰처럼 이 판(page load)에 사는 저장소로 옮긴다.
 *
 * 처음 상태는 디자인에 그려진 그대로(1번 읽음)다. 퍼소나를 새로 고르면 그 사람의
 * 처음으로 돌아간다 — 코인 지갑과 같은 규칙.
 */

type State = {
  /** 읽은 줄의 번호 */
  read: number[];
  /** 퀴즈를 다 맞혀 상금까지 받았는지 — 다음 세트가 열릴 때까지 다시 풀 수 없다 */
  solved: boolean;
};

function start(): State {
  return {
    read: quizSet.steps.filter((step) => step.state === "done").map((step) => step.n),
    solved: false,
  };
}

const SERVER: State = start();

let state: State = start();
/** 지금 진행이 누구 것인지 */
let owner: string | null = null;

const listeners = new Set<() => void>();

function set(next: State): void {
  state = next;
  listeners.forEach((listener) => listener());
}

/** 퍼소나가 바뀌면 처음부터 — 바뀌었을 때만(coinStore 와 같다). */
function follow(): void {
  const id = getPersonaSnapshot();
  if (id === owner) return;
  owner = id;
  set(start());
}

if (typeof window !== "undefined") {
  follow();
  subscribePersona(follow);
}

export function subscribeQuizSet(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getQuizSetSnapshot(): State {
  return state;
}

export function getQuizSetServerSnapshot(): State {
  return SERVER;
}

/** 한 줄을 읽었다. 읽은 것을 되돌리는 길은 없다. */
export function markStepRead(n: number): void {
  if (state.read.includes(n)) return;
  set({ ...state, read: [...state.read, n] });
}

/** 퀴즈를 다 맞혔다 — 이 세트는 끝. */
export function markQuizSolved(): void {
  if (state.solved) return;
  set({ ...state, solved: true });
}

export function useQuizSet(): State {
  return useSyncExternalStore(subscribeQuizSet, getQuizSetSnapshot, getQuizSetServerSnapshot);
}
