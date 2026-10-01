"use client";

import { useState, useSyncExternalStore } from "react";
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
 * 관심 카테고리 — Figma 1021:10536 을 출석 카드와 같은 짜임으로 다시 그린 것.
 *
 * 프레임은 흰 카드에 칩 넷(분야 둘 · 난이도 · 「+ 수정」)뿐이라 옆 탭(출석)에 비해
 * 허전했고 「+ 수정」이 다른 칩만큼 컸다(사용자 지적). 그래서 출석 카드처럼 한 줄
 * 설명 · 알맹이로 나누고, 분야는 칩 대신 메뉴의 분야 목록(FieldList)과 같은 타일 —
 * 분야색(토큰 500) 네모 위 분야 그림(시안 1968:6518), 이름, 세부 갈래 — 로 놓는다. 「수정」은 설명 줄 오른쪽의
 * 작은 알약 단추다 — 메인색(primary-600)으로 채운 알약에 흰 글자. 글자만 두었더니
 * 안 보였고, 테두리 알약도 옅었다(사용자 지적). 제목은 안 적는다 — 바로 위 탭이 그 말이다.
 * 분야 타일과 난이도 줄은 한 묶음 — 사이가 타일끼리(8)와 같다(사용자 지시).
 *
 * 고른 분야 · 난이도는 가입 설문(surveyStore)의 것이다 — 김민정은 문화 · 생활,
 * 한상현은 역사 · 사회. 최대(둘)보다 적으면 빈 자리에 점선 타일이 서서 하나 더
 * 고르라고 한다 — 눌러도 수정 판이 열린다.
 *
 * 「수정」은 아래에서 올라오는 판으로 분야(최대 둘)와 난이도를 고친다 — 온보딩이
 * 「MY > 관심 카테고리에서 바꿀 수 있어요」라고 약속했는데 눌러도 아무 일이
 * 없었다(감수 지적).
 */
/** 수정 판의 분야 알약 두 줄 — 앞의 셋, 나머지 둘(사용자 지시 — 넷 · 하나로 떨어지지 않게) */
const CHIP_ROWS = [interestOptions.slice(0, 3), interestOptions.slice(3)];

export default function Interests() {
  const picked = useSyncExternalStore(subscribeSurvey, getSurvey, getSurveyServerSnapshot);
  const [editing, setEditing] = useState(false);

  const chosen = interestOptions.filter((one) => picked.interests.includes(one.id));
  const level = levelOptions.find((one) => one.id === picked.level);
  const max = surveyCopy.interests.max;

  return (
    <section className="mx-6 flex flex-col gap-4 rounded-[16px] border border-gray-300 bg-white p-4">
      {/* 제목은 없다 — 바로 위 탭이 「관심 카테고리」라 또 적으면 두 번 외치는 꼴이다(사용자 지적). 설명 한 줄과 「수정」뿐 */}
      <header className="flex w-full items-center justify-between gap-3">
        <p className="min-w-px flex-1 text-body-14 text-gray-600">{interests.sub}</p>

        <button
          type="button"
          onClick={() => setEditing(true)}
          className="tap [--tap-w:0px] flex shrink-0 items-center gap-[3px] rounded-full bg-primary-600 py-[5px] pr-[8px] pl-[10px] text-xs leading-[1.3] font-medium text-white transition-opacity active:opacity-80"
        >
          {interests.edit}
          <Chevron />
        </button>
      </header>

      <div className="flex w-full flex-col gap-2">
        <ul className="flex w-full flex-col gap-2">
          {chosen.map((one) => (
            <li key={one.id} className="flex items-center gap-3 rounded-[10px] bg-gray-100 p-3">
              <span
                aria-hidden
                style={{ backgroundColor: one.bg }}
                className="flex size-11 shrink-0 items-center justify-center rounded-lg"
              >
                <Img src={one.icon} className="size-7 object-contain" />
              </span>
              <span className="flex min-w-px flex-1 flex-col gap-1">
                <span className="text-body-16 text-gray-black">{one.name}</span>
                <span className="truncate text-xs leading-[1.3] text-gray-500">{one.sub}</span>
              </span>
            </li>
          ))}

          {/* 아직 고를 수 있는 자리 — 점선 타일. 눌러도 수정 판이 열린다 */}
          {chosen.length < max ? (
            <li>
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="flex w-full items-center gap-3 rounded-[10px] border border-dashed border-gray-400 p-3 text-left transition-colors active:bg-gray-100"
              >
                <span
                  aria-hidden
                  className="flex size-11 shrink-0 items-center justify-center rounded-lg border border-dashed border-gray-400 text-xl leading-none text-gray-500"
                >
                  +
                </span>
                <span className="text-body-14 text-gray-500">{interests.addOne}</span>
              </button>
            </li>
          ) : null}
        </ul>

        {/* 난이도 — 분야 타일과 같은 줄이지만 색 네모 대신 흰 네모에 난이도 그림(1968:6552), 오른쪽에 이름표를 달아 구분한다 */}
        {level ? (
          <div className="flex items-center gap-3 rounded-[10px] bg-gray-100 p-3">
            <span
              aria-hidden
              className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-white"
            >
              <Img src={level.icon} className="h-7 w-auto" />
            </span>
            <span className="min-w-px flex-1 truncate text-body-14 text-gray-black">{level.label}</span>
            <span className="shrink-0 text-xs leading-[1.3] text-gray-500">{interests.levelLabel}</span>
          </div>
        ) : null}
      </div>

      <BottomSheet open={editing} title={interests.sheetTitle} onClose={() => setEditing(false)}>
        <p className="mb-2 text-xs leading-[1.4] text-gray-500">{interests.pickNote}</p>
        {/*
          분야는 두 글자라 한 줄짜리 PickRow 로 늘어놓으면 단추가 글자보다 훨씬 컸다(사용자
          지적). 분야색 동그라미 + 이름의 알약을 두 줄 — 셋 · 둘 — 로 가운데 모아 놓는다
          (흘려 놓으면 넷 · 하나로 떨어져 하나가 외톨이였다, 사용자 지적). 알약은 다섯이
          다 같은 폭(셋이 한 줄에 드는 폭)이다 — 아랫줄 둘을 늘여 채우지 않는다(사용자 지시).
          고른 것은 초록 테두리 — 굵기는 안쪽 그림자로 더해 알약 크기가 안 바뀐다.
        */}
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
          onClick={() => setEditing(false)}
          className="tap [--tap-w:0px] mt-6 flex h-[46px] w-full items-center justify-center rounded-[10px] bg-primary-700 text-sm leading-[1.3] font-bold text-white transition-opacity active:opacity-80"
        >
          {interests.done}
        </button>
      </BottomSheet>
    </section>
  );
}

/** 「수정」 뒤의 작은 꺾쇠 — 글자색을 따른다. 그림 파일의 꺾쇠는 주황 · 검정뿐이다 */
function Chevron() {
  return (
    <svg width="6" height="10" viewBox="0 0 6 10" fill="none" aria-hidden>
      <path
        d="M1 1l4 4-4 4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
