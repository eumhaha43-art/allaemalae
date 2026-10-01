"use client";

import { useState } from "react";
import Img from "@/components/common/Img";

/** Figma node 634:1598 — Keyboard / KR / iOS */

const ROW_TOP = ["ㅂ", "ㅈ", "ㄷ", "ㄱ", "ㅅ", "ㅛ", "ㅕ", "ㅑ", "ㅐ", "ㅔ"];
const ROW_MID = ["ㅁ", "ㄴ", "ㅇ", "ㄹ", "ㅎ", "ㅗ", "ㅓ", "ㅏ", "ㅣ"];
const ROW_BOTTOM = ["ㅋ", "ㅌ", "ㅊ", "ㅍ", "ㅠ", "ㅜ", "ㅡ"];

/** Shift turns the plain jamo into their tense / wide counterparts. */
const SHIFTED: Record<string, string> = {
  ㅂ: "ㅃ", ㅈ: "ㅉ", ㄷ: "ㄸ", ㄱ: "ㄲ", ㅅ: "ㅆ", ㅐ: "ㅒ", ㅔ: "ㅖ",
};

/** Which key is lit up right now — a base jamo, or one of the function keys. */
export type PressedKey = string | "space" | "enter" | "backspace" | null;

export type KeyboardHandlers = {
  onJamo: (jamo: string) => void;
  onSpace: () => void;
  onEnter: () => void;
  onBackspace: () => void;
  /** Lets a physical keystroke light the matching on-screen key. */
  pressed?: PressedKey;
};

export default function IosKeyboard({
  onJamo,
  onSpace,
  onEnter,
  onBackspace,
  pressed = null,
}: KeyboardHandlers) {
  const [shift, setShift] = useState(false);

  const press = (jamo: string) => {
    onJamo(shift ? (SHIFTED[jamo] ?? jamo) : jamo);
    if (shift) setShift(false);
  };

  const label = (jamo: string) => (shift ? (SHIFTED[jamo] ?? jamo) : jamo);

  const jamoKey = (jamo: string) => (
    <Key key={jamo} lit={pressed === jamo} onPress={() => press(jamo)}>
      {label(jamo)}
    </Key>
  );

  return (
    <div
      // Keep focus in the text field: the browser must not blur it on press.
      onMouseDown={(e) => e.preventDefault()}
      className="absolute inset-x-0 bottom-0 z-20 mx-auto w-full max-w-screen bg-[#d2d3d8] select-none"
    >
      <div className="relative h-[220px] overflow-hidden">
        <div className="absolute top-2 right-[3px] left-[3px] flex flex-col gap-3">
          <Row>{ROW_TOP.map(jamoKey)}</Row>

          <div className="px-[19.5px]">
            <Row>{ROW_MID.map(jamoKey)}</Row>
          </div>

          <div className="flex items-center gap-[6px]">
            <FnKey width="w-[44px]" held={shift} label="Shift" onPress={() => setShift((s) => !s)}>
              <Img src="/assets/keyboard/shift.svg" className="size-8" />
            </FnKey>
            <div className="flex flex-1 gap-[6px]">{ROW_BOTTOM.map(jamoKey)}</div>
            <FnKey
              width="w-[44px]"
              label="지우기"
              lit={pressed === "backspace"}
              onPress={onBackspace}
            >
              <Img src="/assets/keyboard/delete.svg" className="size-8" />
            </FnKey>
          </div>
        </div>

        <div className="absolute top-[170px] right-[3px] left-[3px] flex items-start gap-[6px]">
          <FnKey width="w-[42px]" label="숫자" onPress={() => undefined}>
            <Img src="/assets/keyboard/number.svg" className="size-8" />
          </FnKey>
          <FnKey width="w-[43px]" label="이모지" onPress={() => undefined}>
            <Img src="/assets/keyboard/emojis.svg" className="size-8" />
          </FnKey>
          <button
            type="button"
            onClick={onSpace}
            className={`flex h-[42px] min-w-px flex-1 items-center justify-center rounded-[5px] pb-px text-base text-black drop-shadow-[0px_1px_0px_rgba(0,0,0,0.3)] ${
              pressed === "space" ? "bg-[#d6d8de]" : "bg-white"
            }`}
          >
            스페이스
          </button>
          <FnKey
            width="w-[91px]"
            label="줄바꿈"
            lit={pressed === "enter"}
            onPress={onEnter}
          >
            <Img src="/assets/keyboard/enter.svg" className="size-8" />
          </FnKey>
        </div>
      </div>

      <div className="relative h-[71px] overflow-hidden">
        <Img
          src="/assets/keyboard/global.svg"
          className="absolute top-[calc(50%-4.5px)] left-[22px] size-10 -translate-y-1/2"
        />
        {/*
          「완료」 — 마이크 자리에. 자판은 칸이 초점을 잃으면 내려가는데, 그것을
          모르는 사람은 덮인 단추(가입하기 · 보내기)를 못 찾고 갇혔다(감수 지적).
          누르면 쓰던 칸의 초점을 놓아 자판이 내려간다. 마이크는 원래 장식이었다.
        */}
        <button
          type="button"
          onClick={() => (document.activeElement as HTMLElement | null)?.blur()}
          className="absolute top-[calc(50%-4.5px)] right-[14px] flex h-9 -translate-y-1/2 items-center rounded-[6px] px-3 text-[15px] leading-none font-semibold text-[#0a7cff] active:opacity-55"
        >
          완료
        </button>
        <div className="home-bar absolute bottom-2 left-1/2 h-[5px] w-[138px] -translate-x-1/2 rounded-full bg-black" />
      </div>
    </div>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return <div className="flex gap-[6px]">{children}</div>;
}

function Key({
  children,
  onPress,
  lit = false,
}: {
  children: React.ReactNode;
  onPress: () => void;
  lit?: boolean;
}) {
  return (
    <button
      type="button"
      data-lit={lit || undefined}
      onClick={onPress}
      className={`flex h-[42px] min-w-px flex-1 items-center justify-center rounded-[5px] pt-[2px] text-[22px] text-black drop-shadow-[0px_1px_0px_rgba(0,0,0,0.3)] transition-colors duration-75 active:bg-[#d6d8de] ${
        lit ? "scale-95 bg-[#d6d8de]" : "bg-white"
      }`}
    >
      {children}
    </button>
  );
}

function FnKey({
  children,
  onPress,
  width,
  label,
  held = false,
  lit = false,
}: {
  children: React.ReactNode;
  onPress: () => void;
  width: string;
  label: string;
  /** Shift stays down until the next key. */
  held?: boolean;
  lit?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={held}
      onClick={onPress}
      className={`flex h-[42px] shrink-0 items-center justify-center rounded-[5px] px-[6px] py-2 drop-shadow-[0px_1px_0px_rgba(0,0,0,0.3)] transition-colors duration-75 ${width} ${
        held ? "bg-white" : lit ? "bg-[#8f95a3]" : "bg-[#abb0bc]"
      }`}
    >
      {children}
    </button>
  );
}
