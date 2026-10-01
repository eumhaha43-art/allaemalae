"use client";

import { useState } from "react";
import Img from "@/components/common/Img";
import type { Quiz } from "@/data/common/community";

/**
 * 이 지식으로 만든 퀴즈 — Figma node 856:6168.
 *
 * 「도장 +1」 배지는 프레임에서 숨김 처리돼 있어 그리지 않는다.
 *
 * O 와 X 는 색이 다르다 — 둘 다 흰 단추였을 때는 어느 쪽이 어느 쪽인지
 * 글자 하나로만 갈렸다. 답을 고르면 정답 단추에 「정답」이, 내가 고른 오답에
 * 「내 답」이 붙는다. 틀렸을 때 글로만 「정답은 O예요」라고 하면 다시 위를
 * 올려다봐야 한다 — 단추 자체가 말해야 한다.
 *
 * 내가 고른 오답에 취소선을 긋지 않는다 — X 위에 줄이 겹치면 글자가 아니라
 * 이상한 도형이 됐다(사용자 지적). 물러난 색과 「내 답」 알약이면 충분하다.
 */

/** 고르기 전의 단추 색 — O 는 초록, X 는 빨강. */
const TONE = {
  O: "bg-white text-primary-600",
  X: "bg-white text-[#e5484d]",
} as const;
export default function PostQuiz({ quiz }: { quiz: Quiz }) {
  const [picked, setPicked] = useState<"O" | "X" | null>(null);
  const correct = picked === quiz.answer;

  return (
    <div className="w-full px-6 pt-[18px]">
      <div className="flex w-full flex-col gap-3 rounded-xl bg-primary-600 p-4">
        <div className="flex w-full items-center">
          <div className="flex items-center gap-[7px]">
            <Img src="/assets/post/quiz.svg" className="size-[18px]" />
            <h2 className="text-[12.5px] leading-[1.4] font-bold text-white">
              이 지식으로 만든 퀴즈
            </h2>
          </div>
        </div>

        <p className="w-full text-sm leading-[1.4] font-bold text-white">{quiz.question}</p>

        <div className="flex w-full items-start gap-3">
          {(["O", "X"] as const).map((choice) => {
            const isAnswer = choice === quiz.answer;
            const isMine = choice === picked;
            /*
              고른 뒤: 정답은 노랑으로 켜지고, 내가 고른 오답은 속이 비어 물러난다.
              고르지도 않았고 정답도 아닌 것은 흐려진다.
            */
            const tone =
              picked === null
                ? TONE[choice]
                : isAnswer
                  ? "bg-yellow-500 text-gray-900 ring-2 ring-white"
                  : isMine
                    ? "bg-white/20 text-white"
                    : "bg-white/20 text-white/50";
            return (
              <button
                key={choice}
                type="button"
                disabled={picked !== null}
                onClick={() => setPicked(choice)}
                className={`relative flex min-w-px flex-1 items-center justify-center rounded-lg py-[13px] text-[15px] leading-[22px] font-bold tracking-[-0.3px] transition-colors ${tone}`}
              >
                {choice}
                {picked !== null && (isAnswer || isMine) ? (
                  <span
                    className={`absolute -top-[9px] right-[10px] rounded-full px-[7px] py-[2px] text-[10px] leading-[1.3] font-bold ${
                      isAnswer ? "bg-gray-900 text-yellow-300" : "bg-white text-[#e5484d]"
                    }`}
                  >
                    {isAnswer ? "정답" : "내 답"}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>

        {picked ? (
          <p className="w-full text-center text-xs leading-[1.4] font-medium text-white">
            {correct
              ? "정답이에요! 도장을 하나 받았어요"
              : `아쉬워요. 정답은 ${quiz.answer}예요`}
          </p>
        ) : null}
      </div>
    </div>
  );
}
