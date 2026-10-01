"use client";

import Img from "@/components/common/Img";
import IosKeyboard from "@/components/keyboard/IosKeyboard";
import {
  KeyboardSpacer,
  KEYBOARD_HEIGHT,
  keepFocus,
  type TypingField,
} from "@/hooks/useIosKeyboard";

/**
 * 메시지 입력바 — Figma 564:6292.
 *
 * 채팅방과 알래봇이 같이 쓴다. 자판이 올라오면 그만큼 위로 붙고, 자리비움
 * (`KeyboardSpacer`)과 자판까지 한 덩어리로 들고 있다 — 셋이 흩어져 있으면
 * 쓰는 쪽이 하나를 빠뜨렸을 때 입력바만 자판에 덮인다.
 *
 * 값과 조합 상태는 부르는 쪽의 `useTypingField` 가 쥔다. 보낸 뒤에 무엇을
 * 할지가 화면마다 다르고(방은 상대 말을 잇고, 알래봇은 답을 짓는다) 그
 * 판단에 입력값이 필요하기 때문이다.
 */
export default function ChatComposer({
  keyboard,
  onSend,
  placeholder = "메시지 입력",
  /** 첨부 단추 — 알래봇에는 붙일 것이 없어 빼고 쓴다(1191:3058). */
  attach = true,
  /** 첨부 자리에 대신 놓을 것 — 알래봇은 알약을 꺼내는 단추를 둔다. */
  leading,
  /**
   * 홈 인디케이터를 직접 그릴지.
   *
   * 탭 바가 있는 화면은 그 바가 받쳐 주지만, 전체화면은 입력바가 화면 맨
   * 아래에 닿아 둥근 모서리에 잘린다. 그런 화면은 공용 인디케이터가 빠지므로
   * (`isFullscreenRoute`) 여기서 그려 자리를 만든다 — 게시글 상세의 댓글
   * 입력바(787:3539)가 하는 것과 같다.
   */
  indicator = false,
  /**
   * 화면 바닥(안전영역)까지 내려갈지 — 채팅방.
   *
   * 홈 화면에 내려받은 앱에서는 그린 인디케이터가 빠지고 바닥 안전영역(34)이
   * 남는데, 기기 화면이 그만큼 띄우면 입력창 밑에 흰 띠가 생겼다(사용자 지적).
   * 그 여백을 기기 화면 대신 입력바가 갖되 20 을 덜 띄워, 입력창이 홈
   * 인디케이터 바로 위(12 남짓)까지 내려온다. 브라우저에서는 안전영역이 0 이라
   * 아무 일도 없다 — 그때는 그린 인디케이터(indicator)가 자리를 만든다.
   */
  edge = false,
}: {
  keyboard: TypingField;
  onSend: () => void;
  placeholder?: string;
  attach?: boolean;
  leading?: React.ReactNode;
  indicator?: boolean;
  edge?: boolean;
}) {
  return (
    <>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          onSend();
        }}
        className="sticky w-full bg-white"
        style={{
          bottom: keyboard.open ? KEYBOARD_HEIGHT : 0,
          // 자판이 올라와 있으면 바닥에 닿지 않으니 안 띄운다
          paddingBottom: edge && !keyboard.open ? "max(env(safe-area-inset-bottom) - 20px, 0px)" : undefined,
        }}
      >
        <div className="h-px w-full bg-[#e5e5e5]" />
        <div className="flex w-full items-center gap-[10px] py-[11px] pr-[14px] pl-[18px]">
          {leading ??
            (attach ? (
              <button
                type="button"
                aria-label="첨부"
                className="tap flex size-[38px] shrink-0 items-center justify-center rounded-[10px] bg-primary-700"
              >
                <Img src="/assets/chat/plus.svg" className="size-5" />
              </button>
            ) : null)}

          <input
            value={keyboard.value}
            onChange={(event) => keyboard.type(event.target.value)}
            onFocus={keyboard.onFocus}
            onBlur={keyboard.onBlur}
            placeholder={placeholder}
            aria-label="메시지 입력"
            className="min-w-px flex-1 rounded-[10px] bg-[#f1f1f1] px-[15px] py-[10px] text-[13.5px] leading-[1.4] text-[#333336] outline-none placeholder:text-[#bdbdc0]"
          />

          <button
            type="submit"
            aria-label="보내기"
            {...keepFocus}
            className="tap relative block size-[21px] shrink-0"
          >
            <Img
              src="/assets/chat/send.svg"
              className="absolute -top-px -left-[2px] h-[23px] w-6 max-w-none"
            />
          </button>
        </div>

        {/* 자판이 올라와 있으면 그 아래로 들어가므로 접는다 */}
        {indicator && !keyboard.open ? (
          <div className="home-bar flex w-full items-center justify-center pt-[10px] pb-3">
            <div className="h-[5px] w-[140px] rounded-[3px] bg-[#1a1c1c]" />
          </div>
        ) : null}
      </form>

      <KeyboardSpacer open={keyboard.open} />

      {keyboard.open ? <IosKeyboard {...keyboard.keyboardProps} onEnter={onSend} /> : null}
    </>
  );
}
