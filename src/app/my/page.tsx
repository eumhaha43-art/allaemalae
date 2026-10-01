"use client";

import AppHeader, { HeaderBell } from "@/components/common/AppHeader";
import MenuProfile from "@/components/menu/MenuProfile";
import MyPanel from "@/components/my/MyPanel";
import PersonaSwitch from "@/components/showcase/PersonaSwitch";

/**
 * MY — Figma 1021:10345(MY 출석) · 1021:10504(관심 카테고리).
 *
 * 헤더의 코인과 홈의 관심 태그 「+」가 여기로 온다. 알맹이는 햄버거 메뉴의 MY
 * 탭과 같은 것(`MenuProfile` + `MyPanel`)이다 — 전에는 헤더도 짜임도 달라(한쪽만
 * 설정 아이콘, 한쪽만 프로필) 같은 MY 가 둘로 보였다(감수 지적). 설정 아이콘은
 * 갈 화면이 없어 뺐다.
 *
 * 자기 바닥 바가 없는 전체화면이라 탭 바 대신 홈 인디케이터만 아래에 남는다
 * (`isFullscreenRoute`).
 */
export default function MyPage() {
  return (
    <main className="flex min-h-full w-full flex-col bg-[#f9f9f9]">
      <AppHeader title="MY" divider>
        <HeaderBell />
      </AppHeader>
      <div className="bg-white">
        {/* 프로필 줄 오른쪽에 데모 계정 「전환」 — 모바일에서 계정을 바꾸는 유일한 길(T1-R) */}
        <MenuProfile action={<PersonaSwitch />} />
      </div>
      <MyPanel />
    </main>
  );
}
