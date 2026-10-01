"use client";

import { Fragment } from "react";
import Img from "@/components/common/Img";
import { useInView } from "@/hooks/useInView";
import { useMyPhoto } from "@/hooks/useMyPhoto";
import { useUserName } from "@/hooks/usePersona";
import { level, me, stats } from "../_data/activity";
import type { MyActivity } from "../_lib/useMyActivity";

/**
 * 등급 카드 — 1731:5274 맨 위 초록 판.
 *
 * 왼쪽에 이름 · 등급 · 레벨, 오른쪽에 내 프로필 사진(동그라미). 그 아래 다음
 * 등급까지의 막대와, 흰 판에 활동 현황 셋. 숫자는 전부 `useMyActivity` 가 세어
 * 준 것이라 글을 쓰거나 댓글을 달면 여기 값과 막대가 함께 움직인다.
 *
 * 사진은 회원증 · 메뉴 프로필과 같은 것(useMyPhoto) — 퍼소나마다 다르고, 가입
 * 때 넣은 사진이 있으면 그것. 전에는 점원 마스코트가 앉아 있었다(사용자 결정으로
 * 사진으로).
 *
 * 막대는 화면에 들어올 때 차오른다(useInView) — 냉장고 「이어서 먹기」와 같은
 * 움직임이다. 처음부터 차 있으면 움직임이 없고, 안 보이는데 움직이면 헛일이다.
 */
export default function TierCard({
  fresh,
  counts,
  progress,
  percent,
}: Pick<MyActivity, "fresh" | "counts" | "progress" | "percent">) {
  const name = useUserName();
  const photo = useMyPhoto();
  const [box, seen] = useInView<HTMLElement>();
  // 손님(fresh)은 프레임의 VIP · Lv.3 대신 손님 · Lv.1 — 숫자도 전부 0 에서 시작한다
  const rank = fresh ? me.fresh : me;
  const rows = [
    { ...stats.posts, value: counts.posts },
    { ...stats.comments, value: counts.comments },
    { ...stats.debates, value: counts.debates },
  ];

  return (
    <section
      ref={box}
      aria-label="내 등급"
      className="flex w-full flex-col gap-[18px] rounded-[20px] bg-primary-600 p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-2">
          <p className="truncate text-body-14 text-white/80">{me.greet(name.full)}</p>
          <p className="flex items-center gap-2">
            <span className="inline-flex h-6 items-center rounded-full bg-yellow-500 px-[10px] text-body-12 leading-none font-bold text-gray-black">
              {rank.tier}
            </span>
            <span className="text-heading-24 font-extrabold text-white">{rank.level}</span>
          </p>
        </div>
        {/* 프로필 사진 — 흰 테두리를 둘러 초록 위에서 뜬다 */}
        <Img
          src={photo}
          alt=""
          className="size-16 shrink-0 rounded-full border-2 border-white/80 bg-white/20 object-cover"
        />
      </div>

      <div className="flex w-full flex-col gap-2">
        <div className="flex w-full items-center justify-between">
          <span className="text-body-12 text-white/80">{level.label}</span>
          <span className="text-body-16 font-bold text-yellow-500">{percent}</span>
        </div>
        <div className="h-[10px] w-full overflow-hidden rounded-full bg-white/22">
          <div
            className="h-full rounded-full bg-yellow-500 transition-[width] duration-700 ease-out"
            style={{ width: `${seen ? progress * 100 : 0}%` }}
          />
        </div>
        {/* 빈 막대만 보이면 무엇을 해야 차는지 모른다 — 손님에게 한 줄 */}
        {fresh ? <p className="text-body-12 text-white/70">{me.fresh.nudge}</p> : null}
      </div>

      {/* 활동 현황 — 흰 판에 셋, 사이에 세로 실선 */}
      <div className="flex w-full items-center rounded-[14px] bg-white py-[14px]">
        {rows.map((row, index) => (
          <Fragment key={row.label}>
            {index === 0 ? null : <span aria-hidden className="h-8 w-px shrink-0 bg-gray-200" />}
            <div className="flex min-w-0 flex-1 flex-col items-center gap-1">
              <span className="text-heading-22 font-bold text-gray-black">{row.value}</span>
              <span className="text-body-12 text-gray-500">{row.label}</span>
            </div>
          </Fragment>
        ))}
      </div>
    </section>
  );
}
