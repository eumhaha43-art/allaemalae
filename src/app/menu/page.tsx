"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import AppHeader, { HeaderBell } from "@/components/common/AppHeader";
import BurgerClose from "@/components/menu/BurgerClose";
import MenuProfile from "@/components/menu/MenuProfile";
import UnderlineTabs from "@/components/menu/UnderlineTabs";
import FieldList from "@/components/menu/FieldList";
import MyPanel from "@/components/my/MyPanel";
import PersonaSwitch from "@/components/showcase/PersonaSwitch";

const TABS = ["카테고리", "MY"] as const;

/** 나가는 동작 길이 — globals.css 의 `.menu-leave` 와 같아야 한다. */
const LEAVE_MS = 200;

/**
 * 햄버거 메뉴 — Figma node 965:5444.
 *
 * 오른쪽에서 밀려 들어오고, 닫으면 같은 길로 나간 뒤에 앞 화면으로 돌아간다.
 *
 * 나가는 시점을 animationend 로 잡지 않는 이유: 애니메이션을 끈 환경
 * (prefers-reduced-motion)에서는 그 신호가 아예 오지 않아 닫기가 먹지 않는다.
 * 시간으로 재면 두 경우 모두 같은 길로 흐른다.
 */
export default function MenuPage() {
  const router = useRouter();
  const [tab, setTab] = useState<(typeof TABS)[number]>("카테고리");
  const [leaving, setLeaving] = useState(false);
  const timer = useRef<number | null>(null);

  useEffect(() => () => {
    if (timer.current !== null) window.clearTimeout(timer.current);
  }, []);

  const close = () => {
    if (leaving) return; // 두 번 눌러도 한 번만 나간다
    setLeaving(true);
    timer.current = window.setTimeout(() => {
      // 주소를 직접 쳐서 들어오면 돌아갈 곳이 없다 — 그때는 홈으로 보낸다
      if (window.history.length > 1) router.back();
      else router.push("/");
    }, LEAVE_MS);
  };

  /*
    MY 탭은 회원증부터 설정 줄까지가 한 덩어리(`MyPanel`)라 자기 여백과 바탕을
    직접 쥔다 — 여기서 pt-5 · pb-5 를 덧대면 회색 바탕이 흰 띠로 잘린다.
  */
  const my = tab === "MY";

  return (
    <main
      className={`flex flex-1 flex-col bg-white ${
        leaving ? "menu-leave" : "menu-enter"
      }`}
    >
      {/* 닫기(X)만 — 뒤로 화살표까지 두면 나가는 길이 둘로 보였다(감수 지적). 밀려 나가는 것을 보고 나서 화면이 바뀐다. */}
      <AppHeader back={null}>
        <HeaderBell />
        <BurgerClose onClick={close} />
      </AppHeader>
      {/* 프로필 줄 오른쪽에 데모 계정 「전환」 — MY 화면과 같은 단추(사용자 요청) */}
      <MenuProfile action={<PersonaSwitch />} />
      <UnderlineTabs tabs={TABS} value={tab} onChange={setTab} />
      {my ? (
        <MyPanel />
      ) : (
        /* 카테고리 바탕은 연한 초록 — 분야 목록이 쥐고 있던 뒤판 색을 화면이 받았다(사용자 지시) */
        <div className="flex-1 bg-[#e6f4ed] pt-5 pb-5">
          <FieldList />
        </div>
      )}
    </main>
  );
}
