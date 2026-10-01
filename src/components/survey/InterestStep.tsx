"use client";

import { useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import Img from "@/components/common/Img";
import SurveyShell from "@/components/survey/SurveyShell";
import { interestOptions, survey } from "@/data/common/survey";
import {
  getSurvey,
  getSurveyServerSnapshot,
  subscribeSurvey,
  toggleInterest,
} from "@/state/surveyStore";

/**
 * 설문 1/3 — 관심사, Figma node 1501:4334.
 *
 * 두 줄로 다섯 칸. 프레임은 빈 여섯째 칸에 「언제든 바꿀 수 있어요」를 욱여넣어
 * 뒀는데, 좁은 칸에 세 줄로 접혀 읽기 어려웠다. 그 말은 목록 아래 한 줄로
 * 내렸다 — 뒤의 두 장도 같은 자리에 같은 말을 두고 있어 결이 맞는다.
 */
export default function InterestStep() {
  const router = useRouter();
  const picked = useSyncExternalStore(subscribeSurvey, getSurvey, getSurveyServerSnapshot);

  return (
    <SurveyShell
      at={1}
      title={survey.interests.title}
      sub={survey.interests.sub}
      extra={survey.interests.limit}
      note={survey.interests.note}
      cta={survey.interests.cta}
      ready={picked.interests.length > 0}
      onNext={() => router.push("/survey/level")}
    >
      {/* 낮은 화면(700 미만)에서는 칸 사이와 안쪽 여백을 줄여 세 줄이 한 화면에 들어간다 */}
      <ul className="grid w-full grid-cols-2 gap-[10px] [@media(max-height:700px)]:gap-2">
        {interestOptions.map((one) => {
          const on = picked.interests.includes(one.id);
          return (
            <li key={one.id}>
              <button
                type="button"
                aria-pressed={on}
                onClick={() => toggleInterest(one.id, survey.interests.max)}
                /*
                  고른 칸의 굵은 테두리는 2px 가 아니라 1px + 안쪽 그림자 1px 이다 —
                  테두리를 굵히면 안쪽 너비가 2 줄고, 칸 높이는 갈래 글자가 몇 줄로
                  접히느냐를 따르므로 줄 높이가 통째로 2 씩 움직였다(사용자 지적 — 덜컹거림).
                  그림자는 자리를 차지하지 않는다. MY 의 관심사(Interests · InterestSheet)가
                  쓰던 방법과 같다.
                */
                className={`flex h-full w-full flex-col gap-[6px] rounded-[10px] border bg-white p-3 text-left transition-colors [@media(max-height:700px)]:gap-1 [@media(max-height:700px)]:p-[10px] ${
                  on
                    ? "border-primary-600 shadow-[inset_0_0_0_1px_var(--color-primary-600)]"
                    : "border-gray-300"
                }`}
              >
                <span className="flex w-full items-start justify-between">
                  {/* 분야색(토큰 500) 네모 위 분야 그림(시안 1968:6518) — 메뉴의 분야 목록과 같은 짜임 */}
                  <span
                    style={{ backgroundColor: one.bg }}
                    className="flex size-10 shrink-0 items-center justify-center rounded-[5px] [@media(max-height:700px)]:size-8"
                  >
                    <Img
                      src={one.icon}
                      className="size-[26px] object-contain [@media(max-height:700px)]:size-5"
                    />
                  </span>
                  <span
                    aria-hidden
                    className={`flex size-6 shrink-0 items-center justify-center rounded-full border transition-colors ${
                      on ? "border-primary-600 bg-primary-600" : "border-gray-300 bg-white"
                    }`}
                  >
                    {on ? (
                      <svg width="13" height="10" viewBox="0 0 13 10" fill="none" aria-hidden>
                        <path
                          d="M1.5 5.2 4.8 8.5 11.2 1.6"
                          stroke="#ffffff"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    ) : null}
                  </span>
                </span>

                <span className="flex w-full flex-col gap-[6px]">
                  <span className="text-body-16 text-gray-black">{one.name}</span>
                  {/* 갈래는 두 줄까지 — 칸마다 개수가 달라 높이를 못 박으면 한 줄이 잘린다 */}
                  <span className="text-body-12 leading-[1.45] text-gray-500 [@media(max-height:700px)]:line-clamp-1 [@media(max-height:700px)]:text-[11px]">
                    {one.sub}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </SurveyShell>
  );
}
