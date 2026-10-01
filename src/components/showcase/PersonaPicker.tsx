"use client";

import PersonaCards from "@/components/showcase/PersonaCards";

/**
 * 누구로 볼지 고르는 자리 — PC 쇼케이스의 왼쪽 칸.
 *
 * 기획 문서에 정해진 퍼소나 둘을 늘어놓고, 고르면 그 사람의 시작 지점으로
 * 기기를 보낸다(usePersonaStart). 로그인 화면이 아직 없어 이 고르기가 그 자리를
 * 대신한다 — 나중에 로그인이 붙으면 이 컴포넌트 대신 그 화면이 `personaStore`
 * 에 사람을 앉히면 되고, 화면들은 고칠 것이 없다.
 *
 * 카드와 「처음부터 체험」은 모바일 바텀시트(PersonaSwitch)와 같은 것
 * (PersonaCards)이다 — 좁은 폭에서도 같은 저장소로 사람을 바꾼다.
 */
export default function PersonaPicker() {
  return (
    <div className="pointer-events-auto flex w-full flex-col pt-7">
      <PersonaCards />
    </div>
  );
}
