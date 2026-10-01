"use client";

import { useState } from "react";
import BottomSheet from "@/components/common/BottomSheet";
import Img from "@/components/common/Img";
import Clerk from "@/components/home/Clerk";
import { guide } from "../_data/activity";

/**
 * 커뮤니티 이용 가이드 — 1731:5274 맨 아래 검은 카드.
 *
 * 왼쪽에 점원, 「처음이신가요?」 · 「알래말래븐 커뮤니티 이용 가이드」, 오른쪽에
 * 꺾쇠. 점원은 프레임의 새 마스코트 대신 홈 배너의 알래말래븐 점원(Clerk)이다.
 * 검은 판 위에서는 검은 얼굴이 묻혀서, 초록 동그라미 안에 앉힌다 — 알래봇
 * 단추와 같은 초록이라 「점원이 알려 준다」로 읽힌다.
 *
 * 갈 화면이 따로 없어 전에는 눌러도 아무 일이 없었다. 지금은 아래에서 시트가
 * 올라와 이 화면이 세는 네 가지를 짧게 풀어 준다(`guide.steps`).
 *
 * 오른쪽 꺾쇠는 뒤로가기 화살표(흰색)를 뒤집어 쓴다. 같은 7x14 모양이라
 * 파일을 하나 더 두지 않는다.
 */
export default function GuideCard({ fresh }: { fresh: boolean }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className="flex w-full items-center gap-[14px] rounded-[20px] bg-gray-black px-[18px] py-4 text-left transition-opacity active:opacity-70"
      >
        <span
          aria-hidden
          className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary-600"
        >
          {/* 얼굴이 상자 왼쪽 아래에 앉아서 조금 오른쪽 · 아래로 밀어 가운데를 맞춘다 */}
          <span className="mt-[6px] ml-[6px] block">
            <Clerk size={36} />
          </span>
        </span>
        <span className="flex min-w-0 flex-1 flex-col gap-[3px]">
          <span className="text-body-12 font-medium text-yellow-500">
            {fresh ? guide.eyebrow : guide.eyebrowAgain}
          </span>
          <span className="truncate text-body-14 font-bold text-white">{guide.label}</span>
        </span>
        <Img
          src="/assets/community/back-light.svg"
          alt=""
          className="h-[14px] w-[7px] shrink-0 rotate-180"
        />
      </button>

      <BottomSheet open={open} title={guide.sheetTitle} onClose={() => setOpen(false)}>
        <ol className="flex flex-col gap-4">
          {guide.steps.map((step, index) => (
            <li key={step.title} className="flex items-start gap-3">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary-600 text-body-12 leading-none font-bold text-white">
                {index + 1}
              </span>
              <span className="flex min-w-0 flex-col gap-1">
                <span className="text-body-14 font-bold text-gray-black">{step.title}</span>
                <span className="text-body-12 leading-[1.5] text-gray-600">{step.body}</span>
              </span>
            </li>
          ))}
        </ol>
      </BottomSheet>
    </>
  );
}
