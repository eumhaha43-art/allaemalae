"use client";

import { useState } from "react";
import { ACTION_BTN } from "@/components/common/actionButton";
import QuizModal from "@/components/home/QuizModal";
import { quizSet } from "@/data/common/home";
import { earnCoinsSlowly } from "@/state/coinStore";
import { markQuizSolved, markStepRead, useQuizSet } from "@/state/quizSetStore";

/**
 * 잡지식 세트 — Figma 846:3600 / 856:8006.
 *
 * 읽은 글은 초록으로 칠하고, 지금 읽을 글은 초록 테두리, 남은 글은 회색이다. 세
 * 줄은 같은 크기(40)고 색 · 테두리로만 가른다 — 프레임처럼 읽는 중만 크면 읽고 나서
 * 줄어들어 이상했다(사용자 지시, ROW).
 * 세로 연결선이 세 줄을 하나의 세트로 묶는다 — 읽은 데까지는 초록 실선, 나머지는
 * 회색 점선이고, 한 줄을 읽으면 초록 선이 다음 줄까지 이어진다(사용자 요청).
 *
 * 선은 줄의 동그라미 가운데(x 31)를 지나고, 첫 줄 가운데에서 마지막 줄 가운데까지다.
 * 줄 높이가 상태마다 달라(읽는 중 60, 나머지 40) 자리는 상태로 셈한다. 전에는
 * 가로 점선 그림(103 × 2)을 1px 폭 상자에 눌러 세로선으로 썼는데 — 점선이 화면
 * 비율에 따라 부분픽셀이 되어 어떤 화면에서는 보이고 어떤 화면에서는 안 보였고,
 * 길이 · 자리도 고정(41 · 103)이라 줄 높이가 바뀌면 어긋났다(사용자 지적).
 *
 * 읽은 순간 그 줄의 체크가 참고 영상처럼 튄다 — 동그라미가 통 하고 커졌다 앉고,
 * 체크가 그어지며, 테가 퍼져 나가고, 불꽃이 흩어진다(QuizCheck). 아이콘의 크기 ·
 * 색은 그림 파일(quiz-check.svg) 그대로다(사용자 지시).
 *
 * 줄을 누르면 읽은 것으로 바뀐다. 아직 지식 상세 화면이 없어 실제로 읽고
 * 돌아오는 흐름을 만들 수 없으므로, 누르는 것으로 대신한다 — 시연에서 세트를
 * 다 읽는 데까지 갈 수 있어야 퀴즈를 보여줄 수 있다.
 *
 * 「퀴즈 풀러가기」는 셋을 다 읽어야 켜진다. 세트를 다 읽어야 퀴즈가 열리는
 * 것이 이 화면의 규칙이라, 안 읽었는데 눌리면 규칙이 없는 것이 된다.
 *
 * 다 맞히고 나오면 그 자리가 다음 세트를 기다리는 안내로 바뀐다 — 한 세트는
 * 한 번만 맞힌다. 틀리고 나온 사람은 다시 풀 수 있다.
 *
 * 읽은 줄과 맞혔는지는 저장소(quizSetStore)가 든다 — 상세에 갔다 돌아와도
 * 그대로다. 전에는 여기 useState 라 홈이 새로 그려질 때마다 처음으로 돌아갔다.
 */
/**
 * 줄 높이 · 사이 — QuizRow 와 같아야 한다. 세 줄이 다 같은 40 — 프레임은 읽는 중만
 * 60 이었는데, 읽고 나면 줄어들어 이상했고(사용자 지적) 읽는 중도 남은 줄과 같은
 * 크기여야 한다고 했다(사용자 지시). 상태는 색 · 테두리로만 가른다.
 */
const ROW = { done: 40, current: 40, todo: 40, gap: 20 };
/** 줄의 동그라미 가운데 x — 읽음 pl 20 + 11, 읽는 중 · 남음 19 + 11 */
const RAIL_X = 31;

export default function QuizBox() {
  const [quizOpen, setQuizOpen] = useState(false);
  const { read, solved } = useQuizSet();
  /** 방금 이 화면에서 읽은 줄 — 그 줄의 체크만 튄다. 처음부터 읽혀 있던 줄은 가만히 */
  const [justRead, setJustRead] = useState<number | null>(null);

  const allRead = read.length === quizSet.steps.length;
  /** 지금 읽을 차례 — 아직 안 읽은 것 중 첫 번째. */
  const current = quizSet.steps.find((step) => !read.includes(step.n))?.n;

  const states = quizSet.steps.map((step) =>
    read.includes(step.n) ? "done" : step.n === current ? "current" : "todo",
  );
  /* 줄마다 동그라미 가운데 y — 위에서부터 높이를 쌓는다 */
  const centers: number[] = [];
  let y = 0;
  for (const state of states) {
    centers.push(y + ROW[state] / 2);
    y += ROW[state] + ROW.gap;
  }
  const railTop = centers[0];
  const railHeight = centers[centers.length - 1] - railTop;
  /* 초록 선은 읽은 줄 다음 줄까지 — 다 읽었으면 끝까지 */
  const doneHeight = centers[Math.min(read.length, centers.length - 1)] - railTop;

  return (
    <section className="mx-6 flex shrink-0 flex-col gap-[30px]">
      <div className="flex flex-col gap-1 whitespace-nowrap">
        <h2 className="text-[22px] leading-[1.3] font-semibold text-ink">{quizSet.title}</h2>
        <p className="text-sm leading-[1.3] text-[#b3b3b3]">{quizSet.sub}</p>
      </div>

      <div className="relative w-full">
        <div className="flex w-full flex-col gap-[30px]">
          {/* 세트를 잇는 세로선(846:3605)은 줄 뒤에 깔린다 — 줄이 relative 라 뒤에 오는 줄이 위에 그려진다 */}
          <div className="relative w-full">
            <span
              aria-hidden
              className="quiz-rail"
              style={{ left: RAIL_X - 1, top: railTop, height: railHeight }}
            />
            <span
              aria-hidden
              className="quiz-rail-done"
              style={{ left: RAIL_X - 1, top: railTop, height: doneHeight }}
            />
            <ol className="relative flex w-full flex-col gap-5">
              {quizSet.steps.map((step, i) => (
                <li key={step.n} className="w-full">
                  <QuizRow
                    n={step.n}
                    text={step.text}
                    state={states[i]}
                    celebrate={justRead === step.n}
                    onRead={
                      states[i] === "done"
                        ? undefined
                        : () => {
                            setJustRead(step.n);
                            markStepRead(step.n);
                          }
                    }
                  />
                </li>
              ))}
            </ol>
          </div>

          {/* 홈의 큰 동작 단추 토큰(ACTION_BTN) — 글자 16. 여기만 14 였다(기획 피드백) */}
          <button
            type="button"
            disabled={!allRead || solved}
            onClick={() => setQuizOpen(true)}
            className={`${ACTION_BTN} w-full ${
              allRead && !solved
                ? "bg-yellow-500 text-gray-900 active:opacity-80"
                : "bg-gray-200 text-gray-600"
            }`}
          >
            {solved ? quizSet.solved : quizSet.cta}
          </button>
        </div>
      </div>

      <QuizModal
        open={quizOpen}
        onClose={() => setQuizOpen(false)}
        onSolved={(won) => {
          // 틀리고 나온 사람은 다시 풀 수 있다 — 상금도 없다(감수 지적)
          if (!won) return;
          markQuizSolved();
          /*
            적어 둔 상금을 실제로 지갑에 넣는다 — 「3코인을 받을 수 있어요」라고
            해 놓고 헤더의 수가 그대로면 받은 것이 아니다.

            한꺼번에 더하지 않고 한 개씩 떨어뜨린다. 세 번 오르는 것이 보여야
            세 개를 받은 줄 안다(`earnCoinsSlowly`).
          */
          earnCoinsSlowly(quizSet.reward, "잡지식 세트 퀴즈");
        }}
      />
    </section>
  );
}

/**
 * 세트의 한 줄. 아직 안 읽은 줄만 누를 수 있다 — 읽은 것을 다시 안 읽음으로
 * 되돌리는 길은 두지 않는다.
 */
function QuizRow({
  n,
  text,
  state,
  celebrate,
  onRead,
}: {
  n: number;
  text: string;
  state: "done" | "current" | "todo";
  /** 방금 읽은 줄 — 체크가 튄다 */
  celebrate?: boolean;
  onRead?: () => void;
}) {
  if (state === "done") {
    return (
      <div className="flex h-10 w-full items-center gap-[10px] overflow-hidden rounded-lg bg-primary-600 pl-5">
        <QuizCheck celebrate={celebrate} />
        <span className="text-xs leading-normal font-medium text-white">{text}</span>
      </div>
    );
  }

  if (state === "current") {
    // 남은 줄과 같은 크기(40 · 동그라미 22 · 글자 12) — 프레임의 60 은 읽고 나서 줄어들어 이상했다(사용자 지시). 초록 테두리 · 초록 번호 · 검은 글자로만 가른다
    return (
      <button
        type="button"
        onClick={onRead}
        className="tap [--tap-w:0px] flex h-10 w-full items-center gap-[10px] overflow-hidden rounded-lg border border-primary-600 bg-white pl-[19px] text-left transition-opacity active:opacity-55"
      >
        <span className="flex size-[22px] shrink-0 items-center justify-center rounded-[55px] bg-primary-600 text-xs leading-none font-semibold tracking-[-0.24px] text-white">
          {n}
        </span>
        <span className="text-xs leading-normal font-medium text-gray-black">{text}</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onRead}
      className="tap [--tap-w:0px] flex h-10 w-full items-center gap-[10px] overflow-hidden rounded-lg border border-gray-400 bg-white pl-[19px] text-left transition-opacity active:opacity-55"
    >
      <span className="flex size-[22px] shrink-0 items-center justify-center rounded-[55px] bg-gray-400 text-xs leading-none font-semibold tracking-[-0.24px] text-white">
        {n}
      </span>
      <span className="text-xs leading-normal font-medium text-gray-400">{text}</span>
    </button>
  );
}

/**
 * 불꽃 — 체크 가운데에서 흩어지는 조각들(참고 영상의 점 · 마름모 · 별). 초록 줄
 * 위라 흰색, 별만 노랑. 어디로 얼마나 날아가는지는 조각마다 변수(--dx · --dy)로.
 */
const SPARKS: { dx: number; dy: number; kind: "dot" | "diamond" | "star"; delay: number }[] = [
  { dx: -13, dy: -9, kind: "dot", delay: 0 },
  { dx: 12, dy: -12, kind: "diamond", delay: 40 },
  { dx: 15, dy: 2, kind: "dot", delay: 20 },
  { dx: 9, dy: 13, kind: "star", delay: 60 },
  { dx: -12, dy: 10, kind: "diamond", delay: 30 },
  { dx: -15, dy: -1, kind: "dot", delay: 50 },
  { dx: 2, dy: -15, kind: "star", delay: 10 },
];

/**
 * 읽은 줄의 체크 — quiz-check.svg(흰 동그라미 22 + 초록 체크 1.65)를 그대로 옮긴
 * 인라인 SVG. 그림 파일이 아니라 인라인인 것은 체크를 그어지게 하려면 선을 잡아야
 * 해서다. 크기 · 색은 파일과 같다.
 *
 * 방금 읽은 줄(celebrate)에서는 참고 영상처럼: 동그라미가 통 하고 커졌다 앉고
 * (quiz-pop), 체크가 왼쪽부터 그어지며(quiz-draw, pathLength 1), 흰 테가 퍼져
 * 나가고(quiz-ring), 불꽃이 흩어진다(quiz-spark). 한 번 돌고 멈춘다 — 이 화면에서
 * 읽은 줄만이라 처음부터 읽혀 있던 줄은 가만히 있다. 움직임은 globals.css.
 */
function QuizCheck({ celebrate }: { celebrate?: boolean }) {
  return (
    <svg
      viewBox="0 0 22 22"
      width="22"
      height="22"
      aria-hidden
      className={`shrink-0 overflow-visible ${celebrate ? "quiz-check-pop" : ""}`}
    >
      {celebrate ? (
        <>
          <circle className="quiz-ring" cx="11" cy="11" r="11" fill="none" stroke="#fff" strokeWidth="1.4" />
          {SPARKS.map((spark, i) => {
            const style = {
              "--dx": `${spark.dx}px`,
              "--dy": `${spark.dy}px`,
              animationDelay: `${spark.delay}ms`,
            } as React.CSSProperties;
            if (spark.kind === "dot")
              return <circle key={i} className="quiz-spark" cx="11" cy="11" r="1.3" fill="#fff" style={style} />;
            if (spark.kind === "diamond")
              return (
                <path key={i} className="quiz-spark" d="M11 9.2L12.6 11L11 12.8L9.4 11Z" fill="#fff" style={style} />
              );
            return (
              <path
                key={i}
                className="quiz-spark"
                d="M11 8.6L11.7 10.3L13.4 11L11.7 11.7L11 13.4L10.3 11.7L8.6 11L10.3 10.3Z"
                fill="#f9b208"
                style={style}
              />
            );
          })}
        </>
      ) : null}
      <rect className="quiz-check-disc" width="22" height="22" rx="11" fill="white" />
      <path
        className="quiz-check-tick"
        d="M6.59996 10.7644L10.0434 14.3001L15.4 8.80009"
        // 그림 파일은 svg 에 fill="none" 이 있어 물려받는다 — 여기 없으면 세 점 사이가 검게 메워진다
        fill="none"
        stroke="#008154"
        strokeWidth="1.65"
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength="1"
      />
    </svg>
  );
}
