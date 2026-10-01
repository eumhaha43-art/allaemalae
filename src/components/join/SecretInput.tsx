"use client";

import { useState } from "react";
import TypingInput from "@/components/keyboard/TypingInput";

/**
 * 비밀번호 칸 — 글자를 ●로 가리고, 오른쪽 눈을 누르면 보인다.
 *
 * 가리는 것은 `type="password"` 가 아니라 CSS(`-webkit-text-security`)로 한다.
 * 진짜 비밀번호 칸으로 두면 브라우저가 끼어든다 — 다음 장으로 넘어가는 순간
 * 「비밀번호를 저장할까요」 풍선이 뜨고, Edge 는 제 눈 단추를 하나 더 그린다.
 * 시연에서 보이면 안 되는 것들이고, 보낼 곳도 없는 칸이라 잃는 것이 없다.
 * 자리 표시 글은 가리지 않는다 — 「비밀번호」가 ●●●● 로 보이면 빈 칸인지
 * 알 수 없다.
 *
 * 테두리는 입력칸이 아니라 바깥 틀이 두른다 — 눈이 틀 안 오른쪽에 앉아야
 * 해서다. 틀에 `relative` 를 주지 않는 것은 목업 자판(TypingInput 이 같이
 * 그린다)이 absolute 라, 틀이 자리를 잡으면 자판이 화면 바닥이 아니라 이 칸
 * 바닥에 붙기 때문이다.
 *
 * 눈은 칸마다 따로다 — 확인 칸을 열어 본다고 위 칸까지 열리면 놀란다.
 */

/**
 * 칸의 생김새 — 화면마다 조금 다르다. 회원가입(1254:4024)은 옅은 테두리에
 * 15px, 로그인(1554:3556)은 조금 진한 테두리에 16px 이다. 테두리 색을 따로
 * 둔 것은 붉은 경고 테두리와 같은 자리를 다투기 때문이다.
 */
const LOOK = {
  join: {
    border: "border-[#e8e8e8]",
    pad: "pl-[14px]",
    text: "text-[15px] font-medium placeholder:text-[#d1d1d1]",
  },
  login: {
    border: "border-[#cfcfcf]",
    pad: "pl-4",
    text: "text-[16px] placeholder:text-[#c8c8c8]",
  },
} as const;

export default function SecretInput({
  value,
  onChange,
  label,
  placeholder,
  maxLength,
  alert = false,
  look = "join",
}: {
  value: string;
  onChange: (next: string) => void;
  label: string;
  placeholder: string;
  maxLength?: number;
  /** 틀을 붉게 — 두 칸이 서로 다를 때 확인 칸이 쓴다 */
  alert?: boolean;
  /** 어느 화면의 칸인지 — 안 주면 회원가입 */
  look?: keyof typeof LOOK;
}) {
  const [shown, setShown] = useState(false);
  const style = LOOK[look];

  return (
    <div
      className={`flex h-12 w-full items-center gap-2 rounded-[8px] border bg-white pr-[10px] ${style.pad} ${
        alert ? "border-[#ff5a5a]" : style.border
      }`}
    >
      <TypingInput
        value={value}
        onChange={onChange}
        maxLength={maxLength}
        aria-label={label}
        placeholder={placeholder}
        className={`h-full min-w-px flex-1 bg-transparent leading-[1.3] text-gray-black outline-none placeholder:[-webkit-text-security:none] ${style.text} ${
          shown ? "" : "[-webkit-text-security:disc]"
        }`}
      />
      <button
        type="button"
        aria-label={shown ? "비밀번호 가리기" : "비밀번호 보기"}
        aria-pressed={shown}
        // 눌러도 입력칸의 초점은 그대로 — 치던 중에 자판이 내려가지 않게(자판과 같은 수)
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => setShown((on) => !on)}
        className="tap [--tap-w:36px] flex shrink-0 text-gray-400 transition-opacity active:opacity-55"
      >
        <Eye off={shown} />
      </button>
    </div>
  );
}

/** 눈 — 가려져 있을 때는 뜬 눈(눌러서 보라는 뜻), 보이고 있을 때는 빗금 친 눈. */
function Eye({ off }: { off: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-5"
      aria-hidden
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
      <circle cx="12" cy="12" r="3" />
      {off ? <path d="M4 20 20 4" /> : null}
    </svg>
  );
}
