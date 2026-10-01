"use client";

import { useEffect, useState } from "react";

/**
 * 햄버거 → X 로 접히는 닫기 단추.
 *
 * 메뉴가 열리면 상단바에 있던 세 줄이 그대로 이어지도록, 처음에는 세 줄로
 * 그려 두고 화면이 들어온 뒤에 가운데로 모아 X 로 만든다. 그림 파일 대신
 * 막대 세 개로 그리는 이유가 이것이다 — SVG 로는 중간 상태를 만들 수 없다.
 *
 * 모이는 동작과 돌아가는 동작을 같은 시간에 함께 굴린다. 나눠서 하면 「모였다
 * 가 돈다」로 두 박자가 되어 툭툭 끊긴다 — 겹쳐야 세 줄이 스스륵 X 로 흘러
 * 들어간다. 가운데 줄도 같은 창에서 함께 옅어진다.
 *
 * 색과 굵기는 상단바의 menu.svg 와 같다 — stroke #232323, 2px, 폭 22.
 */
export default function BurgerClose({ onClick }: { onClick: () => void }) {
  const [x, setX] = useState(false);

  useEffect(() => {
    // 화면이 드러나기 시작한 뒤에 접혀야 눈에 들어온다
    const id = window.setTimeout(() => setX(true), 180);
    return () => window.clearTimeout(id);
  }, []);

  const bar = "block h-[2px] w-full rounded-full bg-[#232323]";
  // 두 동작이 같은 시간·같은 가속도로 흘러야 한 몸처럼 움직인다
  const move =
    "transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] motion-reduce:transition-none";

  return (
    <button
      type="button"
      aria-label="메뉴 닫기"
      onClick={onClick}
      className="tap [--tap-w:40px] relative block size-[22px] transition-opacity active:opacity-55"
    >
      <span className="absolute inset-0 flex items-center">
        <span className={`w-full ${move} ${x ? "translate-y-0" : "-translate-y-[7px]"}`}>
          <span className={`${bar} ${move} ${x ? "rotate-45" : "rotate-0"}`} />
        </span>
      </span>

      <span className="absolute inset-0 flex items-center">
        <span
          className={`${bar} transition-opacity duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] motion-reduce:transition-none ${
            x ? "opacity-0" : "opacity-100"
          }`}
        />
      </span>

      <span className="absolute inset-0 flex items-center">
        <span className={`w-full ${move} ${x ? "translate-y-0" : "translate-y-[7px]"}`}>
          <span className={`${bar} ${move} ${x ? "-rotate-45" : "rotate-0"}`} />
        </span>
      </span>
    </button>
  );
}
