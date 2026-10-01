"use client";

import { useEffect, useState } from "react";
import Img from "@/components/common/Img";

/**
 * 비공개 방의 비밀번호 — 네 자리.
 *
 * 자물쇠 달린 방을 누르면 뜬다. 글자판이 아니라 숫자판을 안에 그린다 —
 * 네 자리 숫자에 한글 자판이 올라오면 어디를 눌러야 할지 모른다. 네 칸이
 * 차면 바로 맞춰 본다: 맞으면 방으로, 틀리면 칸이 흔들리고 비워진다.
 *
 * 다이얼로그는 열 때마다 새로 올린다(조건부 마운트) — 닫았다 열면 비어
 * 있어야 한다.
 */
const LENGTH = 4;
const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "⌫"];

export default function PasswordDialog({
  title,
  password,
  onPass,
  onCancel,
}: {
  title: string;
  password: string;
  onPass: () => void;
  onCancel: () => void;
}) {
  const [typed, setTyped] = useState("");
  const [wrong, setWrong] = useState(false);

  /**
   * 한 자리 누른다. 네 자리가 차면 바로 맞춰 본다 — 「확인」을 또 누르게 하지
   * 않는다. 틀리면 반 초 붉게 흔들리고 비워진다.
   */
  const press = (key: string) => {
    if (wrong || !key) return;
    if (key === "⌫") {
      setTyped(typed.slice(0, -1));
      return;
    }
    if (typed.length >= LENGTH) return;
    const next = typed + key;
    setTyped(next);
    if (next.length < LENGTH) return;
    if (next === password) {
      onPass();
      return;
    }
    setWrong(true);
    window.setTimeout(() => {
      setTyped("");
      setWrong(false);
    }, 500);
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCancel();
      else if (/^[0-9]$/.test(event.key)) press(event.key);
      else if (event.key === "Backspace") press("⌫");
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  return (
    <div
      className="fixed inset-0 z-50 mx-auto flex w-full max-w-screen items-center justify-center bg-black/40 px-8"
      onClick={onCancel}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="비밀번호 입력"
        onClick={(e) => e.stopPropagation()}
        className="flex w-full flex-col items-center rounded-2xl bg-white px-5 pt-6 pb-4"
      >
        <Img src="/assets/debate/lock.svg" className="size-6" />
        <h2 className="mt-2 text-center text-base leading-[1.4] font-bold tracking-[-0.32px] text-[#17171a]">
          비밀번호를 입력해 주세요
        </h2>
        <p className="mt-1 text-center text-[13px] leading-[1.5] text-[#6a6a6e]">
          {title} · 방장에게 받은 {LENGTH}자리
        </p>

        {/* 네 칸 — 찬 칸은 진초록, 틀리면 빨갛게 흔들린다 */}
        <div
          aria-label={`${typed.length}자리 입력됨`}
          className={`mt-5 flex items-center gap-3 ${wrong ? "stamp-shake" : ""}`}
        >
          {Array.from({ length: LENGTH }, (_, i) => (
            <span
              key={i}
              aria-hidden
              className={`size-[14px] rounded-full transition-colors ${
                wrong ? "bg-live" : i < typed.length ? "bg-primary-800" : "bg-gray-200"
              }`}
            />
          ))}
        </div>
        <p className={`mt-2 h-[18px] text-xs leading-[18px] text-live ${wrong ? "" : "invisible"}`}>
          비밀번호가 달라요
        </p>

        <div className="mt-3 grid w-full max-w-[240px] grid-cols-3 gap-2">
          {KEYS.map((key, i) => (
            <button
              key={i}
              type="button"
              aria-label={key === "⌫" ? "지우기" : key || undefined}
              disabled={!key}
              onClick={() => press(key)}
              className={`h-11 rounded-[10px] text-lg font-semibold transition-colors ${
                key ? "bg-[#f1f1f1] text-[#17171a] active:bg-gray-300" : "invisible"
              }`}
            >
              {key}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={onCancel}
          className="mt-4 w-full rounded-[10px] bg-[#f1f1f1] py-3 text-sm leading-[1.4] font-bold text-[#6a6a6e]"
        >
          취소
        </button>
      </div>
    </div>
  );
}
