"use client";

import Img from "@/components/common/Img";
import { useInView } from "@/hooks/useInView";
import { mission } from "../_data/activity";
import type { MyActivity } from "../_lib/useMyActivity";

/**
 * 다음 등급까지 남은 조건 — 1731:5274 둘째 묶음.
 *
 * 머리 오른쪽에 「2개 남음」, 아래에 색판 두 장(보라 · 노랑). 장마다 아이콘 ·
 * 조건 · 「현재 1 / 2 달성」 · 백분율, 그리고 막대다. 두 장 다 실제로 세는
 * 값이다 — 출처를 붙여 글을 올리면 첫 장이, 게시글에 좋아요를 누르면 둘째
 * 장이 찬다. 다 채우면 백분율 자리에 「달성」이 선다.
 *
 * 막대는 화면에 들어올 때 차오른다(useInView).
 */
export default function MissionList({
  missions,
  missionsLeft,
}: Pick<MyActivity, "missions" | "missionsLeft">) {
  const [box, seen] = useInView<HTMLElement>();

  return (
    <section ref={box} aria-labelledby="mission-title" className="flex w-full flex-col gap-[14px]">
      <div className="flex items-center justify-between">
        <h2 id="mission-title" className="text-heading-18 font-bold text-gray-black">
          {mission.title}
        </h2>
        <span className="inline-flex h-6 items-center rounded-full bg-yellow-200 px-[10px] text-body-12 leading-none font-bold text-yellow-800">
          {mission.left(missionsLeft)}
        </span>
      </div>

      {missions.map((one) => {
        const done = one.now >= one.goal;
        return (
          <article
            key={one.id}
            className={`flex w-full flex-col gap-[14px] rounded-[20px] p-[18px] ${one.tone.card}`}
          >
            <div className="flex items-center gap-3">
              <span
                className={`flex size-11 shrink-0 items-center justify-center rounded-[14px] ${one.tone.iconBox}`}
              >
                <Img src={one.icon} alt="" className="size-6 object-contain" />
              </span>
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <p className="text-body-16 font-bold">{one.label}</p>
                <p className={`text-body-12 ${one.tone.sub}`}>
                  {one.now === 0 ? one.hint : mission.now(one.now, one.goal)}
                </p>
              </div>
              <span className="shrink-0 text-heading-20 font-bold">
                {done ? mission.done : `${Math.round(one.progress * 100)}%`}
              </span>
            </div>
            <div className={`h-2 w-full overflow-hidden rounded-full ${one.tone.track}`}>
              <div
                className={`h-full rounded-full transition-[width] duration-700 ease-out ${one.tone.fill}`}
                style={{ width: `${seen ? one.progress * 100 : 0}%` }}
              />
            </div>
          </article>
        );
      })}
    </section>
  );
}
