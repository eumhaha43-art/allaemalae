"use client";

import AppHeader from "@/components/common/AppHeader";
import JoinButton from "@/components/join/JoinButton";
import { survey } from "@/data/common/survey";

/**
 * 설문 세 장의 공통 틀 — Figma 1501:4334 · 1501:4226 · 1501:4276.
 *
 * 물음 · 설명 · 고르는 자리 · 진행 막대 · 단추. 장마다 다른 것은 가운데뿐이라
 * 나머지를 여기 한 벌로 둔다.
 *
 * 프레임 위의 초록 배너는 빼 두었다. 세 장 내내 같은 인사가 붙어 있어 정작
 * 물음이 화면 한가운데로 밀렸는데, 물음이 가장 먼저 읽혀야 하는 화면이다.
 *
 * 글씨는 스타일가이드 표를 그대로 쓴다 — 물음 heading-22, 설명 body-14,
 * 고르는 칸의 이름 body-14, 그 아래 갈래 body-12. 프레임은 Inter 로 그려져
 * 있지만 앱의 글꼴은 프리텐다드 한 벌이다.
 */
export default function SurveyShell({
  at,
  title,
  sub,
  extra,
  note,
  cta,
  ready,
  onNext,
  children,
}: {
  /** 몇 번째 장인지 — 진행 막대와 STEP 글씨가 이것을 따른다 */
  at: number;
  title: string;
  sub: string;
  /** 설명 아래 한 줄 더 — 「(최대 2개)」처럼 */
  extra?: string;
  /** 「언제든 MY 에서 바꿀 수 있어요」 — 가운데가 굵고 밑줄이다 */
  note: readonly string[];
  cta: string;
  /** 고른 것이 있는지 — 없으면 단추가 잠긴다 */
  ready: boolean;
  onNext: () => void;
  children: React.ReactNode;
}) {
  /*
    세 장이 같은 짜임이다(기획 피드백): 위에 물음, 가운데 고르는 칸, 아래에 진행
    막대와 단추. 높이는 화면(h-full)에 맞추고 남는 자리는 가운데가 가진다 —
    화면이 낮아 안 들어가면 **고르는 칸만** 넘겨보고 물음과 단추는 늘 보인다.
    전에는 402 × 874 에서도 관심사 장이 20px 넘쳐 스크롤이 생기고 단추가 잘린
    것처럼 보였다. 위아래 여백은 화면 높이에 비례한다(clamp) — 낮은 기기에서는
    좁아지고 높은 기기에서는 숨을 쉰다.
  */
  return (
    <main className="flex h-full min-h-0 w-full shrink-0 flex-col bg-white">
      {/* 로고는 홈으로 안 간다 — 설문을 건너뛰는 길이 된다(온보딩과 같은 규칙) */}
      <AppHeader sticky={false} logoHome={false}>
        <span aria-hidden />
      </AppHeader>

      <div className="flex min-h-0 flex-1 flex-col px-6 pt-[clamp(8px,2vh,16px)] pb-[clamp(8px,2vh,24px)]">
        <h1 className="w-full shrink-0 text-center text-heading-24 text-gray-black">{title}</h1>
        <p className="mt-[clamp(6px,1.6vh,14px)] w-full shrink-0 text-center text-[15px] leading-[1.5] text-[#535454]">
          {sub}
        </p>
        {extra ? (
          <p className="mt-[6px] w-full shrink-0 text-center text-[15px] leading-[1.5] font-bold text-[#535454]">
            {extra}
          </p>
        ) : null}

        {/* 고르는 칸 — 남는 자리를 다 쓰고, 넘치면 이 안에서만 넘긴다 */}
        <div className="no-scrollbar mt-[clamp(8px,3vh,32px)] flex min-h-0 w-full flex-1 flex-col overflow-y-auto overscroll-contain">
          <div className="w-full shrink-0">{children}</div>
          {/* 낮은 화면(700 미만)에서는 이 줄을 접는다 — 고르는 칸이 다 보이는 쪽이 먼저다 */}
          <p className="mt-[clamp(10px,2.2vh,20px)] w-full shrink-0 text-center text-body-12 text-gray-500 [@media(max-height:700px)]:hidden">
            {note[0]}
            {/* 굵게만 — 밑줄을 그으면 링크로 보이는데 눌리지 않는다(감수 지적) */}
            <span className="font-bold text-[#383838]">{note[1]}</span>
            {note[2]}
          </p>
        </div>

        {/* 아래는 늘 보인다 — 고르는 칸이 넘쳐도 막대와 단추는 이 자리 */}
        <div className="mt-[clamp(8px,2.6vh,28px)] flex w-full shrink-0 flex-col items-center gap-[6px]">
          <span aria-hidden className="h-[6px] w-full overflow-hidden rounded-full bg-gray-300">
            <span
              className="block h-full rounded-full bg-primary-600 transition-[width] duration-300"
              style={{ width: `${(at / 3) * 100}%` }}
            />
          </span>
          <p className="w-full text-center text-[11px] leading-4 font-extrabold tracking-[0.55px] text-[#1c1b1b]">
            {survey.step(at)}
          </p>
        </div>

        <div className="mt-[clamp(10px,2.3vh,20px)] w-full shrink-0">
          <JoinButton label={cta} on={ready} onClick={onNext} />
        </div>
      </div>
    </main>
  );
}
