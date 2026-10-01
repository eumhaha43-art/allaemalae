"use client";

import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import Img from "@/components/common/Img";

/**
 * 기록 헤더 — Figma 829:2595.
 *
 * 뒤로와 화면 이름만 있는 단출한 머리다. MY 화면과 같은 틀이라 크기를 맞췄다.
 * 오른쪽 끝에 단추 하나를 둘 수 있다(`action`) — 영수증 화면의 공유(사용자 지시).
 * 안 주면 전처럼 비어 있다.
 */
export default function RecordHeader({
  title,
  onBack,
  action,
}: {
  title: string;
  /** 뒤로를 직접 맡을 때 — 안 주면 브라우저 뒤로. 꾸미기는 나가기 전에 붙이던 것을 버린다. */
  onBack?: () => void;
  /** 오른쪽 끝 단추 — 공용 헤더의 종 · 검색 자리 */
  action?: ReactNode;
}) {
  const router = useRouter();

  return (
    <header className="sticky top-0 z-20 flex h-[65px] w-full shrink-0 items-center gap-[10px] bg-white px-6">
      <button
        type="button"
        aria-label="뒤로"
        onClick={onBack ?? (() => router.back())}
        className="tap flex transition-opacity active:opacity-55"
      >
        <Img src="/assets/community/back.svg" className="h-[14px] w-[7px]" />
      </button>
      {/* 제목은 공용 헤더(AppHeader)처럼 한가운데 — 왼쪽 뒤로 단추와 상관없이 (사용자 지시). sticky 가 기준점이라 relative 는 따로 안 둔다 */}
      <h1 className="absolute left-1/2 -translate-x-1/2 text-lg leading-[1.2] font-medium text-gray-black">
        {title}
      </h1>
      {action ? <span className="ml-auto flex">{action}</span> : null}
    </header>
  );
}
