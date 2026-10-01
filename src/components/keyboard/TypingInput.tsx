"use client";

import { useEffect, useRef } from "react";
import IosKeyboard from "@/components/keyboard/IosKeyboard";
import { scrollFieldAboveKeyboard, useControlledTypingField } from "@/hooks/useIosKeyboard";

/**
 * 목업 아이폰 키보드가 딸린 입력칸.
 *
 * 화면 아래에 붙는 입력바(채팅방 · 댓글)는 키보드가 올라올 때 자기도 같이
 * 올라가야 해서 화면이 직접 다룬다. 그 밖의 평범한 칸(검색 · 방 만들기)은
 * 하는 일이 같아 여기로 묶는다 — 값 · 조합 · 키보드 · 스크롤.
 *
 * 값은 밖에서 들고 있는다. 이런 칸들은 이미 부모가 값을 쓰고 있어서, 여기서
 * 또 들면 두 벌이 된다.
 *
 * 받는 속성을 실제로 쓰는 것만 추려 둔다 — input 과 textarea 의 속성 묶음이
 * 서로 안 맞아, 통째로 넘기면 둘 중 하나가 타입에서 어긋난다.
 */
export default function TypingInput({
  value,
  onChange,
  maxLength,
  onEnter,
  multiline,
  className,
  placeholder,
  autoFocus,
  "aria-label": label,
}: {
  value: string;
  onChange: (next: string) => void;
  maxLength?: number;
  /** 엔터가 줄바꿈이 아니라 확인인 칸 */
  onEnter?: () => void;
  /** 여러 줄 칸(소개글처럼) */
  multiline?: boolean;
  className?: string;
  placeholder?: string;
  autoFocus?: boolean;
  "aria-label"?: string;
}) {
  const field = useControlledTypingField({ value, onChange, maxLength });
  const box = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  /*
    처음 초점은 `autoFocus` 속성 대신 직접 준다.

    속성으로 두면 브라우저가 제 나름의 때에 초점을 주는데, 그 시점이 React 가
    이벤트를 받기 시작하기 전이라 `onFocus` 를 놓친다. 커서만 깜빡이고 자판은
    안 올라오는 상태가 된다 — 검색 화면이 그랬다. 붙은 뒤에 직접 부르면 초점
    이벤트가 제대로 흘러 자판까지 올라온다.
  */
  useEffect(() => {
    if (autoFocus) box.current?.focus();
  }, [autoFocus]);

  // 키보드가 올라오면 쓰던 칸이 그 아래 깔리지 않게 밀어 올린다
  useEffect(() => {
    if (field.open && box.current) scrollFieldAboveKeyboard(box.current);
  }, [field.open]);

  const shared = {
    value: field.value,
    maxLength,
    placeholder,
    className,
    "aria-label": label,
    onFocus: field.onFocus,
    onBlur: field.onBlur,
  };

  return (
    <>
      {multiline ? (
        <textarea
          ref={box as React.RefObject<HTMLTextAreaElement>}
          {...shared}
          onChange={(event) => field.type(event.target.value)}
        />
      ) : (
        <input
          ref={box as React.RefObject<HTMLInputElement>}
          {...shared}
          onChange={(event) => field.type(event.target.value)}
        />
      )}

      {field.open ? (
        <IosKeyboard {...field.keyboardProps} onEnter={onEnter ?? field.keyboardProps.onEnter} />
      ) : null}
    </>
  );
}
