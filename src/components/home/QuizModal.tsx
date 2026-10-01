"use client";

import { useCallback, useEffect, useState } from "react";
import Img from "@/components/common/Img";
import Confetti from "@/components/home/Confetti";
import { useNameFill } from "@/hooks/usePersona";
import { quizLabels, quizQuestions, quizResult } from "@/data/common/quiz";

/**
 * 잡지식 세트 퀴즈 팝업 — Figma 907:10701 · 955:3144 · 955:3180 · 955:3215.
 *
 * 네 프레임은 한 팝업의 상태다. 보기를 고르기 전에는 둘 다 흰 카드로 있다가,
 * 하나를 고르면 그 보기가 노랗게 켜지고 나머지는 회색으로 가라앉는다(1·2번
 * 프레임). 마지막 문제에서는 버튼이 「결과 보기」로 바뀌고, 누르면 결과가
 * 같은 팝업 안에서 열린다 — 다 맞으면 초록에 팡파레, 하나라도 틀리면 분홍.
 *
 * 감수를 거치며 셋이 바뀌었다.
 *   - 「다음」은 보기를 골라야 켜진다. 전에는 안 고르고도 끝까지 갔다.
 *   - 상금은 다 맞혔을 때만이다(`onSolved`). 전에는 결과를 보고 나가기만 하면
 *     틀려도 3코인이 들어왔다.
 *   - 결과에 점수 · 문항별 정오와 풀이 · 「다시 풀기」가 있다. 「다음 기회에...」
 *     한 줄로 끝나면 무엇을 틀렸는지 모른 채 나간다.
 *   - 「힌트 보기」가 진짜 단추다 — 펼치면 문항의 힌트가 나온다. 힌트를 본 문항
 *     수는 결과에 적되 상금에는 영향이 없다.
 *
 * 카드 폭 314 는 402 화면에서 좌우 44 씩 남긴 값이다.
 */
export default function QuizModal({
  open,
  onClose,
  onSolved,
}: {
  open: boolean;
  onClose: () => void;
  /** 결과까지 보고 나갔을 때 — 다 맞혔으면 true. 도중에 닫으면 부르지 않는다. */
  onSolved?: (won: boolean) => void;
}) {
  const [step, setStep] = useState(0);
  /** 결과를 보고 있는지. 마지막 문제에서 「결과 보기」를 누르면 켜진다. */
  const [showResult, setShowResult] = useState(false);
  /** 문제마다 고른 보기. 아직 안 골랐으면 null. */
  const [picks, setPicks] = useState<(number | null)[]>(() => quizQuestions.map(() => null));
  /** 힌트를 펼쳐 본 문항 — 결과에 「힌트 사용 N개」로 적는다. */
  const [hinted, setHinted] = useState<boolean[]>(() => quizQuestions.map(() => false));
  /** 지금 문항의 힌트가 펼쳐져 있는지 */
  const [hintOpen, setHintOpen] = useState(false);

  /** 다 맞혔는지 — 하나라도 안 골랐으면 틀린 것으로 본다. */
  const allRight = quizQuestions.every((item, at) => picks[at] === item.answer);

  const reset = () => {
    setStep(0);
    setShowResult(false);
    setPicks(quizQuestions.map(() => null));
    setHinted(quizQuestions.map(() => false));
    setHintOpen(false);
  };

  /**
   * 닫을 때는 다음에 다시 열었을 때 1번부터 시작하도록 되돌린다.
   *
   * 결과까지 보고 나간 것만 「다 풀었다」로 친다 — 문제 도중에 X 로 닫은 것은
   * 푼 것이 아니다.
   */
  const close = useCallback(() => {
    if (showResult) onSolved?.(allRight);
    setStep(0);
    setShowResult(false);
    setPicks(quizQuestions.map(() => null));
    setHinted(quizQuestions.map(() => false));
    setHintOpen(false);
    onClose();
  }, [showResult, allRight, onSolved, onClose]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, close]);

  if (!open) return null;

  const question = quizQuestions[step];
  const picked = picks[step];
  const last = step === quizQuestions.length - 1;

  const pick = (index: number) =>
    setPicks((current) => current.map((value, at) => (at === step ? index : value)));

  const go = (to: number) => {
    setHintOpen(false);
    setStep(to);
  };

  const toggleHint = () => {
    setHintOpen((now) => !now);
    setHinted((now) => now.map((seen, at) => (at === step ? true : seen)));
  };

  return (
    <div
      className="fixed inset-0 z-50 mx-auto flex w-full max-w-screen items-center justify-center bg-black/40 px-11"
      onClick={close}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="잡지식 세트 퀴즈"
        onClick={(event) => event.stopPropagation()}
        className="relative flex max-h-[90dvh] w-full flex-col overflow-y-auto rounded-lg bg-white px-5 py-[30px]"
      >
        {showResult ? (
          <Result
            picks={picks}
            hinted={hinted.filter(Boolean).length}
            allRight={allRight}
            onRetry={reset}
            onClose={close}
          />
        ) : null}

        <div className={`flex w-full flex-col items-end justify-center gap-10 ${showResult ? "hidden" : ""}`}>
          <div className="flex w-full items-start justify-between">
            <h2 className="flex flex-col text-base leading-[1.3] font-medium whitespace-nowrap text-gray-black">
              {question.prompt.map((line) => (
                <span key={line}>{line}</span>
              ))}
            </h2>
            <button type="button" aria-label="닫기" onClick={close} className="tap flex size-4 shrink-0">
              <Img src="/assets/quiz/close.svg" className="size-4" />
            </button>
          </div>

          <div className="flex w-full flex-col gap-[10px]">
            <div className="flex w-full flex-col gap-[10px]">
              {question.choices.map((choice, index) => (
                <Choice
                  key={choice}
                  label={choice}
                  state={picked === null ? "idle" : picked === index ? "on" : "off"}
                  onClick={() => pick(index)}
                />
              ))}
            </div>

            {/* 힌트 — 누르면 펼친다. 꺾쇠는 펼쳐지면 아래를 본다 */}
            <button
              type="button"
              aria-expanded={hintOpen}
              aria-controls={`quiz-hint-${question.id}`}
              onClick={toggleHint}
              className="tap [--tap-w:0px] flex items-center gap-1 self-start text-xs leading-[1.3] text-gray-500 transition-opacity active:opacity-55"
            >
              <Img
                src="/assets/quiz/hint-caret.svg"
                className={`h-2 w-1 transition-transform ${hintOpen ? "rotate-90" : ""}`}
              />
              {hintOpen ? quizLabels.hintClose : quizLabels.hint}
            </button>
            {hintOpen ? (
              <p
                id={`quiz-hint-${question.id}`}
                className="w-full rounded-lg bg-yellow-100 px-3 py-2 text-xs leading-[1.5] text-gray-700"
              >
                {question.hint}
              </p>
            ) : null}
          </div>

          <div className="flex w-full items-center justify-between">
            <ol className="flex items-center gap-[10px]">
              {quizQuestions.map((entry, index) => (
                <li
                  key={entry.id}
                  aria-current={index === step ? "step" : undefined}
                  className={`flex size-5 items-center justify-center rounded-[50px] text-center text-xs leading-[1.3] ${
                    index === step ? "bg-yellow-500 text-white" : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {index + 1}
                </li>
              ))}
            </ol>

            <div className="flex items-center gap-[10px]">
              {step > 0 ? (
                <button
                  type="button"
                  onClick={() => go(step - 1)}
                  className="flex h-6 w-[50px] items-center justify-center rounded-[4px] border border-gray-400 bg-white text-center text-xs leading-[1.3] text-gray-400"
                >
                  {quizLabels.back}
                </button>
              ) : null}

              {/* 보기를 골라야 넘어간다 — 안 고르고 넘기면 결과가 「틀림」으로만 남는다 */}
              <button
                type="button"
                disabled={picked === null}
                onClick={last ? () => setShowResult(true) : () => go(step + 1)}
                className={`flex h-6 items-center justify-center rounded-[4px] text-center text-xs leading-[1.3] font-medium transition-colors ${
                  last ? "w-[70px]" : "w-[50px]"
                } ${picked === null ? "bg-gray-200 text-gray-500" : "bg-primary-500 text-white"}`}
              >
                {last ? quizLabels.result : quizLabels.next}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** 보기 한 줄 — 고르기 전(idle) · 고른 것(on) · 밀려난 것(off). */
function Choice({
  label,
  state,
  onClick,
}: {
  label: string;
  state: "idle" | "on" | "off";
  onClick: () => void;
}) {
  const skin = {
    idle: "border-gray-300 bg-white text-gray-900",
    on: "border-yellow-500 bg-yellow-100 text-gray-900",
    off: "border-gray-300 bg-gray-100 text-gray-400",
  }[state];

  return (
    <button
      type="button"
      aria-pressed={state === "on"}
      onClick={onClick}
      className={`flex min-h-11 w-full items-center gap-[9px] rounded-lg border px-[11px] py-2 text-left text-sm leading-[1.35] ${skin}`}
    >
      {state === "on" ? (
        <Img src="/assets/quiz/radio-on.svg" className="size-[18px] shrink-0" />
      ) : (
        <span className="size-[18px] shrink-0 rounded-[50px] border border-gray-300" />
      )}
      {/*
        높이를 고정하지 않고 줄바꿈도 막지 않는다 — 가장 긴 선택지가 19자라
        글자를 키우면 한 줄에 안 들어가 잘린다.
      */}
      <span>{label}</span>
    </button>
  );
}

/**
 * 결과 — Figma 955:3215(다 맞음) · 965:5816(틀림).
 *
 * 두 프레임은 같은 틀에 그림 · 아래 문구 · 문구 색만 다르다. 다 맞혔을 때만
 * 위에서 팡파레가 터진다.
 *
 * 프레임은 그림 한 장과 한 줄뿐이었는데, 점수와 문항별 풀이를 아래에 붙였다
 * (감수 요청). 그림은 그만큼 작아진다(156 → 96). 틀렸으면 「다시 풀기」가
 * 앞에 서고, 다 맞혔으면 나가기만이다 — 한 세트는 한 번 맞히면 끝이다.
 */
function Result({
  picks,
  hinted,
  allRight,
  onRetry,
  onClose,
}: {
  picks: (number | null)[];
  hinted: number;
  allRight: boolean;
  onRetry: () => void;
  onClose: () => void;
}) {
  const skin = allRight ? quizResult.win : quizResult.lose;
  const fill = useNameFill();
  const right = quizQuestions.filter((item, at) => picks[at] === item.answer).length;

  return (
    <div className="relative flex w-full flex-col gap-4">
      {allRight ? <Confetti /> : null}

      <div className="flex w-full items-start justify-between">
        <h2 className="text-base leading-[1.3] font-medium whitespace-nowrap text-gray-black">
          {fill(quizResult.title)}
        </h2>
        <button type="button" aria-label="닫기" onClick={onClose} className="tap flex size-4 shrink-0">
          <Img src="/assets/quiz/close.svg" className="size-4" />
        </button>
      </div>

      <div className="flex w-full items-center gap-4">
        <Img src={skin.art} className="size-[96px] shrink-0" />
        <div className="flex min-w-px flex-1 flex-col gap-1">
          <span
            style={{ color: skin.noteColor }}
            className={`text-base leading-[1.3] ${allRight ? "font-semibold" : "font-medium"}`}
          >
            {skin.note}
          </span>
          <span className="text-sm leading-[1.3] font-semibold text-gray-black">
            {quizLabels.score(right, quizQuestions.length)}
            {hinted > 0 ? (
              <span className="font-normal text-gray-500"> · {quizLabels.hinted(hinted)}</span>
            ) : null}
          </span>
          {allRight ? null : (
            <span className="text-[11.5px] leading-[1.45] text-gray-500">{quizResult.lose.reason}</span>
          )}
        </div>
      </div>

      {/* 문항마다 — 맞았는지와 왜 그런지 */}
      <ol className="flex w-full flex-col gap-2">
        {quizQuestions.map((item, at) => {
          const ok = picks[at] === item.answer;
          return (
            <li
              key={item.id}
              className={`flex w-full items-start gap-2 rounded-lg px-3 py-2 ${
                ok ? "bg-primary-100/60" : "bg-[#ffeaf3]"
              }`}
            >
              <span
                aria-label={ok ? "정답" : "오답"}
                className={`flex size-[18px] shrink-0 items-center justify-center rounded-full text-[11px] leading-none font-bold text-white ${
                  ok ? "bg-primary-600" : "bg-[#dc5f9a]"
                }`}
              >
                {ok ? "O" : "X"}
              </span>
              <span className="flex min-w-px flex-1 flex-col gap-[2px] leading-[1.4]">
                <span className="text-xs font-semibold text-gray-black">
                  {at + 1}. {item.choices[item.answer]}
                </span>
                <span className="text-[11px] text-gray-600">{item.why}</span>
              </span>
            </li>
          );
        })}
      </ol>

      <div className="flex w-full items-center justify-end gap-[10px]">
        {allRight ? null : (
          <button
            type="button"
            onClick={onRetry}
            className="tap [--tap-w:0px] flex h-7 items-center justify-center rounded-[4px] border border-gray-400 bg-white px-3 text-center text-xs leading-[1.3] text-gray-700 transition-opacity active:opacity-55"
          >
            {quizLabels.retry}
          </button>
        )}
        <button
          type="button"
          onClick={onClose}
          className="tap [--tap-w:0px] flex h-7 w-[70px] items-center justify-center rounded-[4px] bg-primary-600 text-center text-xs leading-[1.3] font-medium text-white transition-opacity active:opacity-80"
        >
          {quizLabels.exit}
        </button>
      </div>
    </div>
  );
}
