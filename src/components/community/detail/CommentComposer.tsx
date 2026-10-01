"use client";

import { useEffect, useRef, useState } from "react";
import IosKeyboard from "@/components/keyboard/IosKeyboard";
import {
  KEYBOARD_HEIGHT,
  KeyboardSpacer,
  useControlledTypingField,
  keepFocus,
} from "@/hooks/useIosKeyboard";
import Img from "@/components/common/Img";
import { addComment } from "@/state/commentStore";
import { scheduleReply } from "@/state/notificationStore";

/** Who the next comment answers, if anyone. */
export type ReplyTarget = {
  /** 답글이 매달릴 댓글(실의 뿌리). */
  parentId: string;
  author: string;
  /** 실제로 「답글 달기」를 누른 댓글 — 화면에 보이게 끌어올릴 것. */
  commentId: string;
};

/**
 * 댓글 입력 — Figma node 787:3533. Pinned above the home indicator.
 *
 * 키보드가 올라오면 화면 아래 절반이 가려진다. 그대로 두면 답글을 다는 댓글도,
 * 방금 달린 댓글들도 안 보인 채 쓰게 된다(사용자 지적) — 입력바가 열릴 때
 * 시선을 옮긴다. 답글이면 그 댓글이 입력바 바로 위에 오도록, 그냥 댓글이면
 * 댓글 줄 끝이 입력바 위에 오도록 스크롤한다(`lift`).
 */
export default function CommentComposer({
  postId,
  replyTo,
  onCancelReply,
}: {
  postId: string;
  replyTo: ReplyTarget | null;
  onCancelReply: () => void;
}) {
  const [draft, setDraft] = useState("");
  const input = useRef<HTMLInputElement>(null);
  const form = useRef<HTMLFormElement>(null);
  // 채팅방 입력바와 같은 방식 — 키보드가 올라오면 이 바도 그만큼 올라간다
  const keyboard = useControlledTypingField({ value: draft, onChange: setDraft });

  // 답글 달기 aims the box at that comment, so put the caret in it too.
  useEffect(() => {
    if (replyTo) input.current?.focus();
  }, [replyTo]);

  /*
    키보드가 올라온 뒤(입력바가 그 위로 올라가고 아래에 키보드만큼 자리가 생긴
    뒤) 한 틀 기다려 잰다 — 그 전에 재면 입력바가 아직 제자리라 엉뚱한 데로
    스크롤된다. 답글 대상이 바뀌어도(다른 댓글의 답글 달기) 다시 옮긴다.
  */
  useEffect(() => {
    if (!keyboard.open) return;
    const bar = form.current;
    const scroller = bar?.closest<HTMLElement>("[data-scroll-area]");
    if (!bar || !scroller) return;
    const frame = requestAnimationFrame(() => {
      const target = replyTo
        ? scroller.querySelector<HTMLElement>(`[data-comment-id="${replyTo.commentId}"]`)
        : null;
      if (target) lift(target, bar, scroller);
      else scroller.scrollTo({ top: scroller.scrollHeight, behavior: "smooth" });
    });
    return () => cancelAnimationFrame(frame);
  }, [keyboard.open, replyTo]);

  const post = (form: HTMLElement) => {
    const text = draft.trim();
    if (!text) return;
    const written = addComment(postId, text, replyTo?.parentId);
    // 시연 — 10초 뒤 누군가 이 댓글에 답글을 단다
    scheduleReply(postId, written);
    keyboard.clear();
    onCancelReply();
    // The new line lands right above this bar, so ride down to it.
    const scroller = form.closest<HTMLElement>("[data-scroll-area]");
    requestAnimationFrame(() => scroller?.scrollTo({ top: scroller.scrollHeight }));
  };

  return (
    <>
      <form
      ref={form}
      onSubmit={(e) => {
        e.preventDefault();
        post(e.currentTarget);
      }}
      className="sticky w-full bg-white"
      style={{ bottom: keyboard.open ? KEYBOARD_HEIGHT : 0 }}
    >
      {replyTo ? (
        <div className="flex w-full items-center gap-2 border-t border-gray-200 bg-gray-100 px-4 py-[9px]">
          <span className="min-w-px flex-1 truncate text-[11.5px] leading-[1.4] text-[#5e5e5e]">
            <b className="font-bold text-[#1a1c1c]">{replyTo.author}</b>님에게 답글 남기는 중
          </span>
          <button
            type="button"
            aria-label="답글 취소"
            onClick={onCancelReply}
            className="tap px-1 text-xs leading-none text-[#5e5e5e]"
          >
            ✕
          </button>
        </div>
      ) : null}

      <div
        className={`flex w-full items-center gap-3 px-4 py-3 ${
          replyTo ? "" : "border-t border-gray-200"
        }`}
      >
        <div className="size-8 shrink-0 rounded-2xl bg-gray-200" />
        <input
          ref={input}
          value={keyboard.value}
          onChange={(e) => keyboard.type(e.target.value)}
          onFocus={keyboard.onFocus}
          onBlur={keyboard.onBlur}
          placeholder={replyTo ? "답글을 남겨보세요" : "댓글을 남겨보세요"}
          aria-label={replyTo ? "답글 입력" : "댓글 입력"}
          className="min-w-px flex-1 rounded-[22px] bg-gray-200 px-[18px] py-[13px] text-[12.5px] leading-[18px] tracking-[-0.25px] text-[#2a2a2a] outline-none placeholder:text-[#9a9a9e]"
        />
        <button
        type="submit"
        aria-label={replyTo ? "답글 등록" : "댓글 등록"}
        {...keepFocus}
        className="tap flex size-6 shrink-0"
      >
          <Img src="/assets/post/send.svg" className="size-6" />
        </button>
      </div>

      {/*
        홈 인디케이터 — 787:3539, drawn here since this route hides the shared one.
        키보드가 올라와 있으면 그 아래로 들어가므로 접는다.
      */}
      {keyboard.open ? null : (
        <div className="home-bar flex w-full items-center justify-center pt-[10px] pb-3">
          <div className="h-[5px] w-[140px] rounded-[3px] bg-[#1a1c1c]" />
        </div>
      )}
      </form>

      <KeyboardSpacer open={keyboard.open} />

      {keyboard.open ? (
        <IosKeyboard {...keyboard.keyboardProps} onEnter={() => input.current?.form?.requestSubmit()} />
      ) : null}
    </>
  );
}

/**
 * 댓글 하나를 입력바 바로 위로 끌어올린다.
 *
 * 입력바 위끝이 바닥이다 — 키보드 위에 입력바가 앉아 있으니 「키보드 위」로만
 * 올리면 입력바에 가린다(`scrollFieldAboveKeyboard` 가 그렇다). 댓글이 화면
 * 위로 나가 있으면 반대로 내린다. PC 목업은 기기를 축소해 그리므로 페이지
 * 픽셀과 화면 픽셀의 비를 먼저 잰다.
 */
function lift(target: HTMLElement, bar: HTMLElement, scroller: HTMLElement): void {
  const port = scroller.getBoundingClientRect();
  const scale = scroller.clientHeight > 0 ? port.height / scroller.clientHeight : 1;
  const margin = 12 * scale;
  const rect = target.getBoundingClientRect();
  const floor = bar.getBoundingClientRect().top;

  const hidden = rect.bottom + margin - floor;
  if (hidden > 0) {
    scroller.scrollBy({ top: hidden / scale, behavior: "smooth" });
    return;
  }
  const over = port.top + margin - rect.top;
  if (over > 0) scroller.scrollBy({ top: -over / scale, behavior: "smooth" });
}
