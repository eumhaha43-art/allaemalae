"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ticker } from "@/data/common/home";

/**
 * 새로 들어온 지식 공지 — Figma 856:7933.
 *
 * 한 줄만 그려져 있지만 NEW! 와 HOT 이 번갈아 도는 자리라, 5초마다 다음
 * 지식으로 넘어간다. 새 지식은 노랑(856:7933), 많이 읽힌 지식은 분홍
 * (965:5876)으로 알약 전체 색이 같이 바뀐다.
 *
 * 색은 물들듯 바뀌고, 글씨는 위에서 내려와 자리에 선다. 그냥 갈리면 무엇이
 * 바뀌었는지 모르고 지나간다. 흐렸다 나타나게는 하지 않는다 — 읽으려던 순간에
 * 글씨가 옅어 두 번 봐야 한다. 자리만 옮기고 진하기는 그대로 둔다.
 *
 * 누르면 지금 떠 있는 지식의 상세로 간다 — 전에는 단추인데 아무 데도 안 갔다
 * (사용자 지적). 글이 바뀌는 순간 누르면 새로 뜬 것으로 간다 — 눈에 보이는
 * 것이 곧 가는 곳이다.
 */

/** 다음 지식으로 넘어가는 간격. */
const ROTATE_MS = 5000;

export default function NoticeBar() {
  const [at, setAt] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(
      () => setAt((current) => (current + 1) % ticker.items.length),
      ROTATE_MS,
    );
    return () => window.clearInterval(timer);
  }, []);

  const notice = ticker.items[at];
  const hot = notice.badge.startsWith("HOT");

  return (
    <Link
      href={`/menu/knowledge/${notice.id}`}
      className={`mx-6 flex shrink-0 items-center overflow-hidden rounded-[50px] px-5 py-[10px] text-left transition-colors duration-500 active:opacity-80 motion-reduce:transition-none ${
        hot ? "bg-[#ffe4f1]" : "bg-yellow-200"
      }`}
    >
      {/* 줄 높이가 흔들리지 않도록 한 줄로 잘라 둔다 */}
      <span className="flex items-center gap-3">
        <span
          className={`flex shrink-0 items-center justify-center rounded-[50px] px-2 py-1 text-xs leading-[1.3] transition-colors duration-500 motion-reduce:transition-none ${
            hot ? "bg-[#ff92c5] text-gray-900" : "bg-yellow-500 text-gray-900"
          }`}
        >
          {notice.badge}
        </span>
        {/*
          한 줄 높이로 잘라 둔 자리. 이 밖에 있는 동안은 안 보이므로, 새 글이
          위에서 내려오면 잘린 자리로 스르르 나타난다. 높이는 글씨(14)에 맞춰
          18 로 두어 받침이 잘리지 않게 한다.

          key 를 붙여 글이 바뀔 때마다 새로 붙게 한다 — 같은 요소에 클래스만
          두면 두 번째부터 안 움직인다.
        */}
        <span className="block h-[18px] min-w-px flex-1 overflow-hidden">
          <span
            key={at}
            className="notice-in block truncate text-sm leading-[18px] font-medium text-gray-black"
          >
            {notice.text}
          </span>
        </span>
      </span>
    </Link>
  );
}
