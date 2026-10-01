"use client";

import Link from "next/link";
import Img from "@/components/common/Img";
import { HIDDEN, HIDE_WHEN_SCROLLING, useScrollingDown } from "@/hooks/useScrollingDown";

/**
 * 떠 있는 동그란 버튼 — Figma 856:5438.
 *
 * 게시글은 펜(글쓰기), 채팅방·토론방은 + 를 단다. 모양과 자리는 셋이 같다.
 *
 * 아래로 넘기는 동안은 알래봇과 함께 숨고, 멈추거나 올리면 돌아온다
 * (useScrollingDown) — 알래봇만 비켜 서고 이 단추는 늘 떠 있어 어긋났다
 * (사용자 지적).
 *
 * 화면에 고정하고 402 폭에 가둔다. 오른쪽 24 로 알래봇과 줄을 맞추고, 크기도
 * 알래봇과 같다 — 디자인은 50 인데 알래봇을 1.2배(60)로 키우면서 같이 키웠다.
 * 안 그러면 알래봇보다 작고 왼쪽 가장자리가 어긋나 보인다. 안의 아이콘도
 * 같은 비율로(22 → 26).
 *
 * 자리는 알래봇 바로 위 한 칸 — 탭 바(60) + 20 + 알래봇(61) + 12 = 153.
 * 알래봇이 커지기 전엔 사이가 10 이었는데 그대로 두면 알래봇 꼭대기(141)에
 * 이 단추 바닥(140)이 물려 겹쳐 보였다. 사이도 1.2배로 12. 홈 인디케이터(34)가
 * 목업에만 있어서 PC 에서만 그만큼 더 올린다.
 */
export default function ActionFab({
  href,
  label,
  icon,
  iconClassName = "size-[26px]",
}: {
  /** 갈 곳. 아직 화면이 없으면 비워 둔다 — 눌러도 넘어가지 않는 버튼이 된다. */
  href?: string;
  label: string;
  icon: string;
  iconClassName?: string;
}) {
  const hiding = useScrollingDown();
  const face = `pointer-events-auto flex size-[60px] items-center justify-center rounded-full bg-primary-600 shadow-[0px_4px_12px_0px_rgba(0,0,0,0.2)] ${HIDE_WHEN_SCROLLING} ${
    hiding ? HIDDEN : ""
  }`;

  // 폰에서는 홈 인디케이터(env)만큼 더 올린다 — 알래봇과 같은 이유(감수 T2-a). 브라우저에서는 0
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-[calc(153px_+_env(safe-area-inset-bottom))] z-20 mx-auto flex w-full max-w-screen justify-end pr-6 lg:bottom-[187px]">
      {href ? (
        <Link href={href} aria-label={label} tabIndex={hiding ? -1 : undefined} className={face}>
          <Img src={icon} className={iconClassName} />
        </Link>
      ) : (
        <button type="button" aria-label={label} tabIndex={hiding ? -1 : undefined} className={face}>
          <Img src={icon} className={iconClassName} />
        </button>
      )}
    </div>
  );
}
