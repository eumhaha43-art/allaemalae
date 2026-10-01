"use client";

import { useRef } from "react";
import TypingInput from "@/components/keyboard/TypingInput";
import Img from "@/components/common/Img";
import { FIELD } from "@/components/chat/create/fields";
import { toThumbnail } from "@/utils/imageThumb";

const TITLE_MAX = 30;
const INTRO_MAX = 300;

export type Cover = { url: string; thumb: string };

/** Step 1 — what the room is. */
export default function IntroStep({
  cover,
  onCover,
  title,
  onTitle,
  intro,
  onIntro,
  tagText,
  onTagText,
}: {
  cover: Cover | null;
  onCover: (next: Cover | null) => void;
  title: string;
  onTitle: (next: string) => void;
  intro: string;
  onIntro: (next: string) => void;
  tagText: string;
  onTagText: (next: string) => void;
}) {
  const fileInput = useRef<HTMLInputElement>(null);

  const pick = async (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    onCover({ url, thumb: await toThumbnail(file, url) });
  };

  return (
    <div className="flex flex-col gap-5 px-6 pb-8">
      {cover ? (
        <div className="relative size-[104px]">
          <Img src={cover.url} className="size-full rounded-xl object-cover" />
          <button
            type="button"
            aria-label="대표 사진 삭제"
            onClick={() => {
              if (cover.url.startsWith("blob:")) URL.revokeObjectURL(cover.url);
              onCover(null);
            }}
            className="tap absolute -top-[6px] -right-[6px] flex size-5 items-center justify-center rounded-[10px] bg-[#17171a]/82"
          >
            <Img src="/assets/write/x-small.svg" className="size-[11px]" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileInput.current?.click()}
          className="flex size-[104px] flex-col items-center justify-center gap-[6px] rounded-xl border-[1.2px] border-dashed border-[#d2d2d2] bg-[#f7f7f7]"
        >
          <Img src="/assets/write/plus.svg" className="size-[22px]" />
          <span className="text-[11px] leading-[1.4] text-[#9a9a9e]">대표 사진 (선택)</span>
        </button>
      )}
      <input
        ref={fileInput}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => {
          void pick(e.target.files);
          e.target.value = "";
        }}
      />

      <div>
        <TypingInput
          value={title}
          onChange={onTitle}
          maxLength={TITLE_MAX}
          placeholder="방 제목을 입력해 주세요"
          className={`${FIELD} font-bold`}
        />
        <p className="mt-[10px] px-1 text-[12.5px] leading-[1.4] text-[#9a9a9e]">
          제목은 짧을수록 말풍선에서 잘 보여요
        </p>
      </div>

      <TypingInput
        multiline
        value={intro}
        onChange={onIntro}
        maxLength={INTRO_MAX}
        placeholder="어떤 이야기를 나누는 방인지 적어주세요 (선택)"
        className={`${FIELD} h-[168px] resize-none`}
      />

      <div>
        <TypingInput
          value={tagText}
          onChange={onTagText}
          placeholder="#태그입력"
          className={FIELD}
        />
        <p className="mt-[10px] px-1 text-[12.5px] leading-[1.4] text-[#9a9a9e]">
          띄어쓰기로 최대 5개까지 붙일 수 있어요
        </p>
      </div>
    </div>
  );
}
