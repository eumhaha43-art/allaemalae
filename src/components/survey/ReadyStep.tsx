"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import AppHeader from "@/components/common/AppHeader";
import JoinButton from "@/components/join/JoinButton";
import { markOnboarded } from "@/app/onboarding/_lib/seen";
import { AFTER_SURVEY, survey } from "@/data/common/survey";
import { getSurvey, getSurveyServerSnapshot, subscribeSurvey } from "@/state/surveyStore";

/**
 * 진열 중 — Figma node 1501:4784.
 *
 * 설문을 다 마치면 「당신 것으로 매대를 바꾸는 중」을 보여 준다. 실제로 기다릴
 * 일은 없지만, 방금 고른 것이 어딘가에 쓰이고 있다는 것을 눈으로 보여 주는
 * 자리다 — 고르자마자 홈이 열리면 물어본 뜻이 없어 보인다.
 *
 * 프레임은 80% 에 멈춘 그림 한 장이라, 여기서는 0 에서 100 까지 올린다. 다
 * 차면 아래 단추가 열린다.
 *
 * 원은 SVG 두 겹이다 — 회색 바탕 위에 초록 획을 `stroke-dasharray` 로 잘라
 * 얹는다. 12시부터 시계 방향으로 도는 것이 프레임과 같아 -90도 돌려 둔다.
 *
 * 원 안에는 퍼센트 숫자 대신 알래봇 얼굴(시안 2012:6904 — 검은 동그라미에 노란
 * 모자, 흰 눈 둘과 웃는 입)이 앉는다(사용자 요청). 얼굴은 시안의 선을 그대로 옮긴
 * 것이고 눈만 따로 두어 움직인다. 숫자는 읽어 주기만 한다(sr-only).
 *
 * 움직임은 사용자가 준 참고 영상(핀터레스트의 로딩 얼굴)을 따르되 더 부산하게
 * (사용자 요청): 눈이 두 번씩 깜빡이고(.face-blink), 둘이 같이 사방을 두리번거리며
 * (.face-look), 입이 오물거리고(.face-mouth), 모자가 까딱이고(.face-hat), 얼굴은
 * 갸웃하며 숨 쉬듯 커졌다 작아진다(.face-sway). 원은 그냥 퍼센트대로 차오른다 —
 * 원 위를 도는 빛 띠는 넣었다 뺐다(사용자: 선이 링 안으로 들어가는 느낌이라 별로,
 * 차는 느낌 그대로).
 *
 * 얼굴은 원 안을 원을 그리며 계속 돌아다닌다(사용자 요청 — 참고 영상처럼 원을
 * 따라 움직여야 한다): 바깥 틀(.face-orbit)이 한 바퀴 돌고, 그 위에 ORBIT 만큼
 * 띄운 안쪽 틀(.face-orbit-counter)이 반대로 한 바퀴 돌아 얼굴은 똑바로 선 채
 * 가운데가 반지름 ORBIT 의 원을 그린다. 퍼센트와는 따로 논다 — 퍼센트를 따라
 * 옮기면 4초에 한 바퀴뿐이라 가만히 있는 것처럼 보였다(사용자 지적). 다 차면
 * 띄운 만큼을 0 으로 되돌려 얼굴이 빙글 돌며 가운데로 모여 앉는다(사용자 요청).
 * 얼굴은 136 — 돌아다닐 자리를 두느라 너무 작아지면 안 된다(사용자 지시).
 */

/** 다 차기까지 — 한 걸음(40ms)에 1%씩 */
const TICK_MS = 40;
const R = 88;
const ROUND = 2 * Math.PI * R;
/** 얼굴이 원을 그리며 돌아다니는 반지름 — 원 안쪽(80)에서 얼굴(68, 숨 쉴 때 69.4)을 뺀 만큼에서 조금 남긴다 */
const ORBIT = 10;

export default function ReadyStep() {
  const router = useRouter();
  const picked = useSyncExternalStore(subscribeSurvey, getSurvey, getSurveyServerSnapshot);
  const [at, setAt] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setAt((now) => {
        if (now >= 100) {
          window.clearInterval(timer);
          return 100;
        }
        return now + 1;
      });
    }, TICK_MS);
    return () => window.clearInterval(timer);
  }, []);

  const done = at >= 100;
  const name = picked.name.trim() || survey.ready.guest;
  /**
   * 세 줄은 동그라미가 차오르는 동안 차례로 끝난다 — 33% · 66% · 100%.
   *
   * 전에는 위의 둘이 처음부터 끝난 채로 있고 마지막 하나만 돌았다. 그러면
   * 화면에 들어서는 순간 이미 3분의 2가 끝나 있어서, 기다리는 일이 하나뿐인
   * 것으로 보인다 — 셋을 늘어놓은 뜻이 없어진다. 셋 다 도는 데서 시작해
   * 하나씩 도장이 찍혀야 「진열 중」이 눈에 보인다.
   */
  const steps = survey.ready.steps.map((one, i) => {
    const over = at >= ((i + 1) * 100) / survey.ready.steps.length;
    return { label: over ? one.done : one.doing, on: over };
  });

  return (
    <main className="flex min-h-full w-full shrink-0 flex-col bg-white">
      {/* 로고는 홈으로 안 간다 — 설문을 건너뛰는 길이 된다(온보딩과 같은 규칙) */}
      <AppHeader logoHome={false}>
        <span aria-hidden />
      </AppHeader>

      {/* 맨 위에 있던 「알래말래븐 편의점 진열 중..」 알약은 뺐다(사용자 지시) — 원이 그만큼 올라온다 */}
      <div className="flex min-h-px flex-1 flex-col items-center px-6 pt-5 pb-6">
        <div className="relative mt-6 size-[200px] shrink-0">
          <svg viewBox="0 0 200 200" className="size-full -rotate-90" aria-hidden>
            <circle cx="100" cy="100" r={R} fill="none" stroke="#e8e8e8" strokeWidth="16" />
            <circle
              cx="100"
              cy="100"
              r={R}
              fill="none"
              stroke="#008154"
              strokeWidth="16"
              strokeLinecap="round"
              strokeDasharray={ROUND}
              strokeDashoffset={ROUND * (1 - at / 100)}
            />
          </svg>
          {/* 얼굴 — 시안(2012:6905)의 선 그대로, 136. 원 안을 반지름 ORBIT 의 원을 그리며 돌아다니다 다 차면 가운데로 */}
          <div className="face-orbit absolute inset-0">
          <div
            style={{
              transform: `translateY(-${done ? 0 : ORBIT}px)`,
              transition: "transform 700ms cubic-bezier(0.22, 1, 0.36, 1)",
            }}
            className="absolute inset-0 flex items-center justify-center"
          >
          <div className="face-orbit-counter">
          <svg viewBox="0 0 183 183" aria-hidden className="face-sway size-[136px]">
            <defs>
              <clipPath id="ready-face">
                <circle cx="91.02" cy="91.02" r="91.02" />
              </clipPath>
            </defs>
            <g clipPath="url(#ready-face)">
              <path
                d="M109.52 3.28003H71.07C27.7 3.28003 -7.45996 38.44 -7.45996 81.81V198.09C19.08 215.38 50.76 225.44 84.8 225.44C123.67 225.44 159.48 212.32 188.05 190.29V81.81C188.05 38.44 152.89 3.28003 109.52 3.28003Z"
                fill="#2a2a2a"
              />
              {/* 눈 — 둘이 같이 두리번거리고(face-look), 각자 깜빡인다(face-blink) */}
              <g className="face-look">
                <circle cx="51.43" cy="78.92" r="10.8" fill="#fff" className="face-blink" />
                <circle cx="129.17" cy="78.92" r="10.8" fill="#fff" className="face-blink" />
              </g>
              {/* 입 — 윗선을 축으로 오물거린다 */}
              <path
                d="M90.2002 140.63C104.12 140.63 115.41 129.34 115.41 115.42H64.9902C64.9902 129.34 76.2802 140.63 90.2002 140.63Z"
                fill="#fff"
                className="face-mouth"
              />
              {/* 모자 — 아래 가운데를 축으로 까딱인다 */}
              <path
                d="M150.26 -38.25H41.0202C26.1102 -38.25 14.0202 -26.16 14.0202 -11.25V0.32H-30.8098C-42.1498 0.32 -51.3398 9.51 -51.3398 20.85C-51.3398 32.19 -42.1498 41.38 -30.8098 41.38H177.26V-11.25C177.26 -26.16 165.17 -38.25 150.26 -38.25Z"
                fill="#f9b208"
                className="face-hat"
              />
            </g>
          </svg>
          </div>
          </div>
          </div>
          <span aria-live="polite" className="sr-only">
            {at}%
          </span>
        </div>

        <div className="mt-6">
          <Pill>{done ? survey.ready.ready : survey.ready.wait}</Pill>
        </div>

        <h1 className="mt-[18px] w-full text-center text-heading-24 text-gray-black">
          <span className="block">{`${name}${survey.ready.line1}`}</span>
          <span className="block">
            <span className="border-b-2 border-primary-600 text-primary-600">
              {survey.ready.mark}
            </span>
            {survey.ready.line2}
          </span>
        </h1>

        <ul className="mt-7 flex w-full flex-col gap-[10px]">
          {steps.map((one) => (
            <li
              key={one.label}
              className="flex h-[58px] w-full items-center gap-[14px] rounded-[10px] border border-primary-300 bg-white px-[18px]"
            >
              {one.on ? (
                <span
                  aria-hidden
                  className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary-600"
                >
                  <svg width="13" height="10" viewBox="0 0 13 10" fill="none">
                    <path
                      d="M1.5 5.2 4.8 8.5 11.2 1.6"
                      stroke="#ffffff"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              ) : (
                <span
                  aria-hidden
                  className="size-6 shrink-0 animate-spin rounded-full border-2 border-primary-200 border-t-primary-600 motion-reduce:animate-none"
                />
              )}
              <span className="text-body-16 text-gray-black">{one.label}</span>
            </li>
          ))}
        </ul>

        <div className="min-h-6 flex-1" />

        <div className="w-full">
          <JoinButton
            label={survey.ready.cta}
            on={done}
            onClick={() => {
              // 여기까지 왔으면 소개는 끝난 것 — 홈이 다시 온보딩으로 보내지 않게(전에는 로그인 화면이 하던 일)
              markOnboarded();
              router.replace(AFTER_SURVEY);
            }}
          />
        </div>
      </div>
    </main>
  );
}

/** 연한 초록 알약 — 원 아래 한 곳에 쓴다. */
function Pill({ children }: { children: string }) {
  return (
    <span className="flex items-center gap-[6px] rounded-full bg-primary-100 px-4 py-2 text-[13px] leading-[1.3] font-medium text-primary-800">
      <span aria-hidden className="size-[6px] shrink-0 rounded-full bg-primary-600" />
      {children}
    </span>
  );
}
