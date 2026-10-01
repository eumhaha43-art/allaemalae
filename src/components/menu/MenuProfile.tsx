"use client";

import type { ReactNode } from "react";
import Img from "@/components/common/Img";
import { useMyPhoto } from "@/hooks/useMyPhoto";
import { useUserName } from "@/hooks/usePersona";

/**
 * 메뉴 맨 위 프로필 — 동그란 사진 한 칸에 이름과 등급이 붙는다.
 * 사진은 회원증 뒷면의 그 사진이다(useMyPhoto — 가입 때 넣은 것, 없으면 퍼소나 것).
 *
 * 이름과 등급은 고른 퍼소나의 것이다. 아무도 안 골랐으면 프레임에 적혀 있던
 * 「홍길동 · BLACK CARD」 그대로다(`data/common/personas` 의 guest).
 *
 * `action` — 줄 오른쪽 끝에 놓을 것. MY 화면이 데모 계정 「전환」 단추를 넣는다
 * (T1-R); 햄버거 메뉴는 안 준다.
 */
export default function MenuProfile({ action }: { action?: ReactNode } = {}) {
  const me = useUserName();
  const photo = useMyPhoto();

  return (
    <div className="flex w-full shrink-0 items-center gap-3 px-6 pt-4 pb-3">
      <Img src={photo} className="size-14 shrink-0 rounded-full bg-gray-200 object-cover" />
      <div className="flex flex-col gap-1">
        <span className="text-base leading-[1.3] font-semibold text-gray-black">{me.full}</span>
        {/* 갓 가입한 사람은 등급이 없다 — 빈 줄을 남기지 않는다 */}
        {me.tier ? (
          <span className="text-[11px] leading-[1.4] font-semibold tracking-[0.2px] text-gray-500">
            {me.tier}
          </span>
        ) : null}
      </div>
      {action}
    </div>
  );
}
