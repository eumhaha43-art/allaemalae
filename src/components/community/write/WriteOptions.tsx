"use client";

import Img from "@/components/common/Img";
import type { Quiz } from "@/data/common/community";

/**
 * Extra options — Figma node 564:5789.
 *
 * 퀴즈 켬·끔과 만들어진 초안은 폼이 쥔다. 여기서만 들고 있었더니 켜 두어도
 * 글에는 아무것도 안 붙었다 — 등록할 때 읽을 사람이 없었기 때문이다.
 */
export default function WriteOptions({
  autoQuiz,
  onAutoQuiz,
  quiz,
  onQuiz,
}: {
  autoQuiz: boolean;
  onAutoQuiz: (on: boolean) => void;
  /** 지금 붙을 문제 — 초안이거나, 글쓴이가 고친 것. */
  quiz: Quiz;
  onQuiz: (next: Quiz) => void;
}) {
  return (
    <div className="w-full px-5">
      <div className="flex flex-col rounded-xl border border-[#e5e5e5] bg-white px-[18px] py-[6px]">
        <button type="button" className="flex w-full items-center gap-3 py-[11px] text-left">
          <IconBox src="/assets/write/receipt.svg" />
          <Labels
            title="내 영수증에서 지식 불러오기"
            sub="저장해 둔 지식 42개를 붙일 수 있어요"
          />
          <Img src="/assets/write/chevron.svg" className="size-4 shrink-0" />
        </button>

        <div className="h-px w-full bg-[#f0f0f0]" />

        <div className="flex w-full items-center gap-3 py-[11px]">
          <IconBox src="/assets/write/sparkle.svg" />
          <Labels title="AI 퀴즈 자동 생성" sub="본문으로 O/X 문제 1개를 만들어 붙여요" />
          <button
            type="button"
            role="switch"
            aria-checked={autoQuiz}
            aria-label="AI 퀴즈 자동 생성"
            onClick={() => onAutoQuiz(!autoQuiz)}
            className={`tap [--tap-w:0px] relative h-[26px] w-[46px] shrink-0 rounded-full transition-colors ${
              autoQuiz ? "bg-primary-600" : "bg-[#e0e0e0]"
            }`}
          >
            <span
              className={`absolute top-[3px] size-5 rounded-full bg-white transition-all ${
                autoQuiz ? "left-[23px]" : "left-[3px]"
              }`}
            />
          </button>
        </div>

        {/*
          만들어진 문제를 보여 준다. 켜 두기만 하고 무엇이 붙는지 모른 채로
          올리면, 내 글에 내가 안 쓴 문장이 붙어 나간다.

          제목이 짧거나 물음뿐이면 초안이 빈 채로 나올 수 있다 — 그때는
          빈 칸으로 두어 손으로 적게 하고, 그대로 비어 있으면 안 붙인다.
        */}
        {autoQuiz ? (
          <>
            <div className="h-px w-full bg-[#f0f0f0]" />
            <div className="flex w-full flex-col gap-[10px] py-[11px]">
              <textarea
                value={quiz.question}
                onChange={(event) => onQuiz({ ...quiz, question: event.target.value })}
                rows={2}
                placeholder="O/X 로 답할 문장을 적어주세요"
                className="w-full resize-none rounded-[10px] bg-[#f7f7f7] px-[12px] py-[10px] text-xs leading-[1.4] text-[#333336] outline-none placeholder:text-[#bdbdc0]"
              />
              <div className="flex w-full items-center gap-2">
                <span className="text-[11px] leading-[1.4] text-[#9a9a9e]">정답</span>
                {(["O", "X"] as const).map((choice) => (
                  <button
                    key={choice}
                    type="button"
                    aria-pressed={quiz.answer === choice}
                    onClick={() => onQuiz({ ...quiz, answer: choice })}
                    className={`tap [--tap:34px] flex size-[30px] items-center justify-center rounded-lg text-xs leading-[1.4] font-bold ${
                      quiz.answer === choice
                        ? "bg-primary-600 text-white"
                        : "border border-gray-200 bg-white text-[#5e5e5e]"
                    }`}
                  >
                    {choice}
                  </button>
                ))}
                <span className="min-w-px flex-1 text-right text-[10.5px] leading-[1.4] text-[#bdbdc0]">
                  본문으로 만든 초안이에요 · 고쳐서 올릴 수 있어요
                </span>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}

function IconBox({ src }: { src: string }) {
  return (
    <span className="flex size-[34px] shrink-0 items-center justify-center rounded-lg bg-[#f1f1f1]">
      <Img src={src} className="size-[18px]" />
    </span>
  );
}

function Labels({ title, sub }: { title: string; sub: string }) {
  return (
    <span className="flex min-w-px flex-1 flex-col gap-[3px] leading-[1.4]">
      <span className="text-[13.5px] font-bold text-[#17171a]">{title}</span>
      <span className="text-[11.5px] text-[#bdbdc0]">{sub}</span>
    </span>
  );
}
