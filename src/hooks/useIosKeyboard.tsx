"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { KeyboardHandlers, PressedKey } from "@/components/keyboard/IosKeyboard";
import { setKeyboardOpen } from "@/state/keyboardStore";
import {
  applyBackspace,
  applyJamo,
  applyLiteral,
  type Composition,
} from "@/utils/hangul";

/**
 * 목업 아이폰 키보드를 쓰는 화면들이 나눠 쓰는 부분 — 글쓰기 · 채팅방 · 토론방.
 *
 * 글쓰기는 칸이 셋이라 어느 칸에 들어가는지를 자기가 들고 있고, 나머지는 칸이
 * 하나라 `useTypingField` 가 값까지 대신 들고 있다. 둘 다 아래 두 훅을 본다.
 */

/** 키(220) + 글로브·마이크 줄(71) — Figma 634:1601 · 634:1640. */
export const KEYBOARD_HEIGHT = 291;

/** 진짜 소프트 키보드는 화면을 적어도 이만큼 먹는다. */
const KEYBOARD_MIN_HEIGHT = 120;

/** 물리 키를 눌렀을 때 화면 키가 켜져 있는 시간. */
const FLASH_MS = 130;

/**
 * 물리 키 → 자모. 2벌식 자리로 잡으므로 OS 자판이 무엇이든 그대로 맞는다.
 */
const KEY_TO_JAMO: Record<string, string> = {
  KeyQ: "ㅂ", KeyW: "ㅈ", KeyE: "ㄷ", KeyR: "ㄱ", KeyT: "ㅅ",
  KeyY: "ㅛ", KeyU: "ㅕ", KeyI: "ㅑ", KeyO: "ㅐ", KeyP: "ㅔ",
  KeyA: "ㅁ", KeyS: "ㄴ", KeyD: "ㅇ", KeyF: "ㄹ", KeyG: "ㅎ",
  KeyH: "ㅗ", KeyJ: "ㅓ", KeyK: "ㅏ", KeyL: "ㅣ",
  KeyZ: "ㅋ", KeyX: "ㅌ", KeyC: "ㅊ", KeyV: "ㅍ", KeyB: "ㅠ",
  KeyN: "ㅜ", KeyM: "ㅡ",
};

/** 시프트를 잡고 누르면 된소리 · 넓은 모음이 된다. */
const SHIFTED_JAMO: Record<string, string> = {
  ㅂ: "ㅃ", ㅈ: "ㅉ", ㄷ: "ㄸ", ㄱ: "ㄲ", ㅅ: "ㅆ", ㅐ: "ㅒ", ㅔ: "ㅖ",
};

/** 눌린 키를 지금 값·조합 상태에 적용한다. */
export type RunKey = (
  transform: (value: string, comp: Composition) => { value: string; comp: Composition },
) => void;

/**
 * 기기가 자기 키보드를 안 올리는 곳에서만 목업 키보드를 그린다 — 아니면
 * 폰에서 키보드가 둘 겹친다.
 *
 * 포인터 종류를 보는 대신 실제 뷰포트를 본다. 폰은 소프트 키보드가 올라오면
 * 뷰포트가 줄고, 데스크톱 브라우저(터치를 흉내 내지만 키보드는 없는
 * 개발자도구 기기 모드 포함)는 줄지 않는다.
 */
export function useOnScreenKeyboard(fieldFocused: boolean): boolean {
  const [nativeKeyboard, setNativeKeyboard] = useState<boolean | null>(null);

  useEffect(() => {
    if (!fieldFocused) return;

    const viewport = window.visualViewport;
    const baseline = viewport?.height ?? 0;
    const shrank = () => Boolean(viewport && viewport.height < baseline - KEYBOARD_MIN_HEIGHT);

    // 기기가 자기 키보드를 올릴 틈을 준 뒤에 판단한다.
    const timer = setTimeout(() => setNativeKeyboard(shrank()), 350);
    const onResize = () => {
      if (shrank()) setNativeKeyboard(true);
    };

    viewport?.addEventListener("resize", onResize);
    return () => {
      clearTimeout(timer);
      viewport?.removeEventListener("resize", onResize);
    };
  }, [fieldFocused]);

  const open = fieldFocused && nativeKeyboard === false;

  // 탭 바 · 알래봇 · 홈 인디케이터가 비켜날 수 있게 알린다.
  useEffect(() => {
    setKeyboardOpen(open);
    return () => setKeyboardOpen(false);
  }, [open]);

  return open;
}

/**
 * 노트북 물리 키를 눌러도 화면에 그려진 키가 같이 켜지게 한다. OS 가 한글
 * 모드가 아니면(IME 가 안 돌면) 조합까지 우리가 대신 한다.
 */
export function usePhysicalKeys(enabled: boolean, runKey: RunKey): PressedKey {
  const [pressed, setPressed] = useState<PressedKey>(null);

  useEffect(() => {
    if (!enabled) return;

    let timer: ReturnType<typeof setTimeout>;
    const flash = (key: PressedKey) => {
      setPressed(key);
      clearTimeout(timer);
      timer = setTimeout(() => setPressed(null), FLASH_MS);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey || event.altKey) return;

      if (event.key === "Backspace") return flash("backspace");
      if (event.key === " ") return flash("space");
      if (event.key === "Enter") return flash("enter");

      const jamo = KEY_TO_JAMO[event.code];
      if (!jamo) return;
      flash(jamo);

      // 라틴 문자가 들어왔다는 건 OS 가 한글 모드가 아니라는 뜻이라 우리가
      // 조합해도 된다. IME 가 조합 중이면 건드리지 않고 키만 켠다.
      const typingLatin = /^[a-zA-Z]$/.test(event.key) && !event.isComposing;
      if (!typingLatin) return;

      event.preventDefault();
      const shifted = event.shiftKey ? (SHIFTED_JAMO[jamo] ?? jamo) : jamo;
      runKey((value, comp) => applyJamo(value, comp, shifted));
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      clearTimeout(timer);
    };
  }, [enabled, runKey]);

  return pressed;
}

/**
 * 보내기 단추에 얹는다 — 입력칸의 초점을 뺏지 않게 한다.
 *
 * 단추를 누르는 순간 입력칸이 초점을 잃으면 키보드가 내려가고, 그만큼 화면이
 * 접히면서 단추가 손가락 밑에서 비켜난다. 그래서 첫 번째 누름은 키보드만
 * 내리고 끝나, 보내려면 한 번 더 눌러야 했다.
 *
 * mousedown 을 막으면 초점이 옮겨 가지 않는다 — 키보드를 띄운 채로 바로
 * 보내진다. 터치 기기도 mousedown 이 click 앞에 오므로 같이 걸린다.
 */
export const keepFocus = {
  onMouseDown: (event: React.MouseEvent) => event.preventDefault(),
};

/**
 * 키보드가 덮는 만큼 화면 끝에 비워 두는 자리.
 *
 * 화면들의 뿌리가 `min-h-full` 이라 padding 으로는 안 된다 — 높이가 이미
 * 정해져 있어서 안쪽만 줄어들고 내용이 넘친다. 진짜 칸을 하나 더 세운다.
 */
export function KeyboardSpacer({ open }: { open: boolean }) {
  if (!open) return null;
  return <div aria-hidden className="w-full shrink-0" style={{ height: KEYBOARD_HEIGHT }} />;
}

/**
 * 쓰고 있는 칸을 키보드 위로 올린다. `scrollIntoView` 는 스크롤 영역 한가운데에
 * 맞추는데 그 자리를 키보드가 덮어서 도움이 안 된다.
 *
 * PC 목업은 기기를 축소해 그리므로 페이지 픽셀과 화면 픽셀의 비를 먼저 잰다.
 */
export function scrollFieldAboveKeyboard(element: HTMLElement, margin = 16): void {
  const scroller = element.closest<HTMLElement>("[data-scroll-area]");
  if (!scroller) return;

  const port = scroller.getBoundingClientRect();
  const scale = scroller.clientHeight > 0 ? port.height / scroller.clientHeight : 1;
  const floor = port.bottom - KEYBOARD_HEIGHT * scale;
  const hidden = element.getBoundingClientRect().bottom + margin * scale - floor;
  if (hidden > 0) scroller.scrollBy({ top: hidden / scale, behavior: "smooth" });
}

export type TypingField = {
  /** 지금 값 — 입력칸에 그대로 넣는다. */
  value: string;
  /** 목업 키보드를 그려야 하는지. 입력바를 그만큼 올릴 때도 이걸 본다. */
  open: boolean;
  /** 진짜 키보드로 친 값 — 우리 조합기를 안 거쳤으니 조합 상태를 버린다. */
  type: (next: string) => void;
  /** 보낸 뒤처럼 값을 비울 때. */
  clear: () => void;
  onFocus: () => void;
  onBlur: () => void;
  /**
   * `<IosKeyboard {...keyboardProps} />`. 엔터가 줄바꿈이 아니라 전송인
   * 입력바는 뒤에 `onEnter` 를 덧씌운다.
   */
  keyboardProps: KeyboardHandlers;
};

/**
 * 값을 바깥에서 들고 있는 칸을 위한 묶음.
 *
 * 방 만들기 · 사유 입력처럼 값이 이미 부모(또는 다른 화면)의 것인 칸이 있다.
 * 그런 곳까지 값을 여기로 옮기면 두 벌이 되므로, 값과 그 갱신을 받아서
 * 조합과 키보드만 얹는다. 값을 직접 들고 싶으면 아래 `useTypingField` 를 쓴다.
 */
export function useControlledTypingField({
  value,
  onChange,
  maxLength = Infinity,
}: {
  value: string;
  onChange: (next: string) => void;
  maxLength?: number;
}): TypingField {
  /**
   * 조합기는 지금 값을 그 자리에서 읽어야 하고, 그 갱신이 setState 업데이터
   * 안에 있으면 안 된다 — 개발 모드에서 두 번 불려 글자가 두 번 조합된다.
   */
  const valueRef = useRef(value);
  // 그리는 중에 ref 를 건드리면 안 되므로 그린 뒤에 맞춘다. 다음 입력이
  // 들어오기 전에 이 효과가 끝나므로 조합기는 늘 최신 값을 읽는다.
  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  const composition = useRef<Composition>(null);
  const [focused, setFocused] = useState(false);
  const open = useOnScreenKeyboard(focused);

  const commit = useCallback(
    (next: string) => {
      valueRef.current = next;
      onChange(next);
    },
    [onChange],
  );

  const runKey = useCallback<RunKey>(
    (transform) => {
      const next = transform(valueRef.current, composition.current);
      if (next.value.length > maxLength) return;
      composition.current = next.comp;
      commit(next.value);
    },
    [commit, maxLength],
  );

  const pressed = usePhysicalKeys(open, runKey);

  return {
    value,
    open,
    type: (next) => {
      composition.current = null;
      commit(next.slice(0, maxLength));
    },
    clear: () => {
      composition.current = null;
      commit("");
    },
    onFocus: () => setFocused(true),
    onBlur: () => setFocused(false),
    keyboardProps: {
      onJamo: (jamo) => runKey((text, comp) => applyJamo(text, comp, jamo)),
      onSpace: () => runKey((text, comp) => applyLiteral(text, comp, " ")),
      onEnter: () => runKey((text, comp) => applyLiteral(text, comp, "\n")),
      onBackspace: () => runKey(applyBackspace),
      pressed,
    },
  };
}

/**
 * 입력칸 하나짜리 화면을 위한 묶음 — 값 · 조합 상태 · 키보드 표시까지 다 든다.
 */
export function useTypingField({
  maxLength = Infinity,
  /** 고치러 들어온 화면이 처음에 담아 둘 글. 그 뒤로는 자판이 쥔다. */
  initial = "",
}: { maxLength?: number; initial?: string } = {}): TypingField {
  const [value, setValue] = useState(initial);
  const valueRef = useRef(initial);
  const composition = useRef<Composition>(null);
  const [focused, setFocused] = useState(false);
  const open = useOnScreenKeyboard(focused);

  const commit = useCallback((next: string) => {
    valueRef.current = next;
    setValue(next);
  }, []);

  const runKey = useCallback<RunKey>(
    (transform) => {
      const next = transform(valueRef.current, composition.current);
      if (next.value.length > maxLength) return;
      composition.current = next.comp;
      commit(next.value);
    },
    [commit, maxLength],
  );

  const pressed = usePhysicalKeys(open, runKey);

  return {
    value,
    open,
    type: (next) => {
      composition.current = null;
      commit(next.slice(0, maxLength));
    },
    clear: () => {
      composition.current = null;
      commit("");
    },
    onFocus: () => setFocused(true),
    onBlur: () => setFocused(false),
    keyboardProps: {
      onJamo: (jamo) => runKey((text, comp) => applyJamo(text, comp, jamo)),
      onSpace: () => runKey((text, comp) => applyLiteral(text, comp, " ")),
      onEnter: () => runKey((text, comp) => applyLiteral(text, comp, "\n")),
      onBackspace: () => runKey(applyBackspace),
      pressed,
    },
  };
}
