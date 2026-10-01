import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { ACTION_BTN, ACTION_DISABLED, ACTION_OFF, ACTION_ON } from "@/components/common/actionButton";

/**
 * 큰 동작 단추 한 벌 — Figma 807:3271. (파일 이름이 actionButton.ts 와 대소문자만 달라 Windows 에서 부딪혀 BigButton 이다.)
 *
 * 높이 42 · 모서리 10 · 글자 16/medium 은 `actionButton.ts` 의 토큰이다. 화면마다
 * 단추를 손으로 다시 그리다 보니 지식 상세의 「알래봇에게 물어보기」가 40 · 4 로
 * 납작해지고 홈의 「퀴즈 풀러가기」만 14 였다(기획 피드백) — 이제 이 하나를 쓴다.
 *
 *   primary    메인 초록에 흰 글자 — 그 화면의 주 동작
 *   secondary  흰 바탕에 회색 테두리 — 곁에 서는 동작
 *   off        회색으로 죽은 것 — 조건이 안 찼을 때(disabled 와 같이 쓴다)
 *
 * 갈 곳(href)이 있으면 링크로, 아니면 단추로 그린다. 폭은 부르는 쪽이 붙인다.
 */
type Variant = "primary" | "secondary" | "off";

const LOOK: Record<Variant, string> = {
  primary: ACTION_ON,
  secondary: "border border-gray-300 bg-white text-gray-700 active:opacity-55",
  off: ACTION_OFF,
};

type Props = {
  variant?: Variant;
  href?: string;
  /** 링크로 갈 때 누르는 순간 할 일 — 갈 곳에 미리 적어 둘 것이 있을 때(지식문의) */
  onNavigate?: () => void;
  className?: string;
  children: ReactNode;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children">;

export default function BigButton({
  variant = "primary",
  href,
  onNavigate,
  className = "",
  children,
  ...rest
}: Props) {
  const look = `${ACTION_BTN} gap-2 ${LOOK[variant]} ${className}`;
  if (href) {
    return (
      <Link href={href} onClick={onNavigate} className={look}>
        {children}
      </Link>
    );
  }
  return (
    <button type="button" className={`${look} ${ACTION_DISABLED}`} {...rest}>
      {children}
    </button>
  );
}
