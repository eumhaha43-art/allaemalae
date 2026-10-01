"use client";

import { useSyncExternalStore } from "react";
import BottomSheet from "@/components/common/BottomSheet";
import Img from "@/components/common/Img";
import PickRow from "@/components/survey/PickRow";
import { interests } from "@/data/common/my";
import { interestOptions, levelOptions, survey as surveyCopy } from "@/data/common/survey";
import {
  getSurvey,
  getSurveyServerSnapshot,
  setLevel,
  subscribeSurvey,
  toggleInterest,
} from "@/state/surveyStore";

/**
 * 관심 카테고리 수정 판 — MY 의 「관심 카테고리」(Interests) 안에 있는 아래에서
 * 올라오는 판과 같은 것을 홈에서도 띄우려고 떼어 낸 것.
 *
 * 홈의 관심 태그 옆 「+」는 MY 로 보내던 것인데(관심 카테고리 탭을 미리 열어
 * 두고), 화면을 옮기지 않고 그 자리에서 바로 고치고 싶다(사용자 지시). 고른
 * 분야 · 난이도는 가입 설문(surveyStore)의 것이라 여기서 바꾸면 홈 진열대도
 * MY 도 같이 바뀐다.
 *
 * 알맹이는 Interests 의 판을 그대로 옮겨 적은 것이다 — 분야 알약 두 줄(셋 · 둘,
 * 사용자 지시), 난이도 줄, 「완료」. MY 쪽은 손대지 않았으므로(사용자 결정) 그
 * 판을 고치면 여기도 같이 봐야 한다.
 */
/** 수정 판의 분야 알약 두 줄 — 앞의 셋, 나머지 둘(Interests 와 같다) */
const CHIP_ROWS = [interestOptions.slice(0, 3), interestOptions.slice(3)];

export default function InterestSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const picked = useSyncExternalStore(subscribeSurvey, getSurvey, getSurveyServerSnapshot);
  const max = surveyCopy.interests.max;

  return (
    <BottomSheet open={open} title={interests.sheetTitle} onClose={onClose}>
      <p className="mb-2 text-xs leading-[1.4] text-gray-500">{interests.pickNote}</p>
      <div className="flex w-full flex-col gap-2">
        {CHIP_ROWS.map((row, r) => (
          <ul key={r} className="flex w-full justify-center gap-2">
            {row.map((one) => {
              const on = picked.interests.includes(one.id);
              return (
                <li key={one.id} className="flex w-[calc((100%-16px)/3)] shrink-0">
                  <button
                    type="button"
                    aria-pressed={on}
                    onClick={() => toggleInterest(one.id, max)}
                    className={`flex h-10 w-full items-center justify-center gap-[6px] rounded-full border bg-white px-2 transition-colors ${
                      on
                        ? "border-primary-600 shadow-[inset_0_0_0_1px_var(--color-primary-600)]"
                        : "border-gray-300"
                    }`}
                  >
                    <span
                      aria-hidden
                      style={{ backgroundColor: one.bg }}
                      className="flex size-7 shrink-0 items-center justify-center rounded-full"
                    >
                      <Img src={one.icon} className="size-[18px] object-contain" />
                    </span>
                    <span className="text-body-14 text-gray-black">{one.name}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        ))}
      </div>

      <p className="mt-5 mb-2 text-xs leading-[1.4] text-gray-500">{interests.levelNote}</p>
      <ul className="flex w-full flex-col gap-2">
        {levelOptions.map((one) => (
          <li key={one.id}>
            <PickRow
              icon={one.icon}
              label={one.label}
              on={picked.level === one.id}
              onPick={() => setLevel(one.id)}
            />
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={onClose}
        className="tap [--tap-w:0px] mt-6 flex h-[46px] w-full items-center justify-center rounded-[10px] bg-primary-700 text-sm leading-[1.3] font-bold text-white transition-opacity active:opacity-80"
      >
        {interests.done}
      </button>
    </BottomSheet>
  );
}
