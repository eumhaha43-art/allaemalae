"use client";

import TypingInput from "@/components/keyboard/TypingInput";

/**
 * 검색창 — Figma 556:5370 을 사용자가 준 참고 그림대로 다시 그린 것.
 *
 * 테두리 없는 흰 알약 오른쪽 끝에 메인색(primary-600) 동그라미 단추가 돋보기를
 * 품고 앉는다 — 참고 그림은 검은 동그라미인데 메인색을 그대로 쓰라는 지시. 그림자는
 * 참고 그림에 있지만 뺐다(사용자 지시). 토론방 목록의 검색도 이것을 쓴다(label). 돋보기는 파일(search.svg)과 같은 선인데 흰색이어야 해서
 * 여기 그린다(파일은 회색 선이라 색을 못 바꾼다). 아직 검색 결과 화면이 없어
 * 눌러도 넘어가지 않지만, 입력은 실제로 받는다 — 웹에서도 목업 아이폰 자판이
 * 올라온다.
 *
 * `autoFocus` 를 주면 열리자마자 초점을 받아 자판이 올라온다. 검색 화면은
 * 이제 주지 않는다 — 칸을 눌러야 자판이 뜬다.
 *
 * 값은 화면이 들고 있다. 친 글자에 맞는 지식을 미리보기로 띄워야 해서,
 * 여기서 들고 있으면 화면이 볼 수 없다.
 */
export default function SearchBar({
  placeholder,
  label = "지식 검색",
  keyword,
  onKeyword,
  autoFocus,
}: {
  placeholder: string;
  /** 읽어 주는 이름 — 어디를 찾는 칸인지. 기본은 지식 검색 */
  label?: string;
  keyword: string;
  onKeyword: (next: string) => void;
  /** 화면을 열자마자 커서를 넣을지 */
  autoFocus?: boolean;
}) {
  return (
    <form
      role="search"
      onSubmit={(event) => event.preventDefault()}
      className="flex h-12 w-full items-center gap-2 rounded-full bg-white pr-1 pl-5"
    >
      <TypingInput
        value={keyword}
        onChange={onKeyword}
        autoFocus={autoFocus}
        aria-label={label}
        placeholder={placeholder}
        // 세로 여백을 입력칸이 가져야 글자 줄(18px)이 아니라 띠 전체를 눌러도 잡힌다
        className="h-full min-w-px flex-1 text-[14px] leading-[1.4] text-[#17171a] outline-none placeholder:text-[#bdbdc0]"
      />
      {/* 친 것이 있으면 지우기 — 없던 것을 감수에서 찾았다. 돋보기 왼쪽에 작게 */}
      {keyword ? (
        <button
          type="button"
          aria-label="지우기"
          onClick={() => onKeyword("")}
          className="tap [--tap-w:32px] flex size-[18px] shrink-0 items-center justify-center rounded-full bg-gray-300 text-white"
        >
          <svg width="8" height="8" viewBox="0 0 8 8" aria-hidden fill="none">
            <path d="M1 1l6 6M7 1L1 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      ) : null}
      {/* 메인색 동그라미 — 알약 안쪽에 4 띄워 앉는다. 누르면 살짝 눌린다 */}
      <button
        type="submit"
        aria-label="검색"
        className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary-600 text-white transition-transform active:scale-95"
      >
        <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden>
          <path
            d="M9.16667 15.8333C12.8486 15.8333 15.8333 12.8486 15.8333 9.16667C15.8333 5.48477 12.8486 2.5 9.16667 2.5C5.48477 2.5 2.5 5.48477 2.5 9.16667C2.5 12.8486 5.48477 15.8333 9.16667 15.8333Z"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M17.5 17.5L13.875 13.875"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </form>
  );
}
