"use client";

import { useRef, type Dispatch, type SetStateAction } from "react";
import Img from "@/components/common/Img";
import RequirementTag from "@/components/community/write/RequirementTag";
import { toThumbnail } from "@/utils/imageThumb";

const MAX_PHOTOS = 5;

export type Photo = {
  id: string;
  /** Object URL, for the preview on this screen. */
  url: string;
  /** Downscaled data URL — the copy that goes into the post. */
  thumb: string;
};

/** Photo picker — Figma node 564:5758 */
export default function WritePhotos({
  photos,
  onChange,
}: {
  photos: Photo[];
  onChange: Dispatch<SetStateAction<Photo[]>>;
}) {
  const fileInput = useRef<HTMLInputElement>(null);

  const add = async (files: FileList | null) => {
    if (!files) return;
    const picked = await Promise.all(
      Array.from(files)
        .slice(0, MAX_PHOTOS - photos.length)
        .map(async (file) => {
          const url = URL.createObjectURL(file);
          return { id: crypto.randomUUID(), url, thumb: await toThumbnail(file, url) };
        }),
    );
    onChange((current) => [...current, ...picked].slice(0, MAX_PHOTOS));
  };

  const remove = (id: string) => {
    const gone = photos.find((photo) => photo.id === id);
    // A photo restored from a saved post is a data URL, with nothing to revoke.
    if (gone?.url.startsWith("blob:")) URL.revokeObjectURL(gone.url);
    onChange((current) => current.filter((photo) => photo.id !== id));
  };

  return (
    <Card>
      <div className="flex w-full items-center">
        <div className="flex items-center gap-[6px]">
          <h2 className="text-sm leading-[1.4] font-bold tracking-[-0.28px] text-[#17171a]">사진</h2>
          <RequirementTag kind="선택" />
        </div>
        <div className="flex-1" />
        <span className="text-[11.5px] leading-[1.4] tracking-[-0.23px] text-[#bdbdc0]">
          {photos.length} / {MAX_PHOTOS}
        </span>
      </div>

      <div className="flex w-full items-start gap-[10px] pt-1 pl-[6px]">
        {photos.map((photo) => (
          <div
            key={photo.id}
            className="relative size-16 shrink-0 rounded-[10px] border border-[#d2d2d2] bg-[#e6e6e6]"
          >
            <Img src={photo.url} className="size-full rounded-[10px] object-cover" />
            <button
              type="button"
              aria-label="사진 삭제"
              onClick={() => remove(photo.id)}
              className="absolute -top-px -right-[11px] flex size-5 items-center justify-center rounded-[10px] bg-[#17171a]/82"
            >
              <Img src="/assets/write/x-small.svg" className="size-[11px]" />
            </button>
          </div>
        ))}

        {photos.length < MAX_PHOTOS ? (
          <button
            type="button"
            onClick={() => fileInput.current?.click()}
            className="flex size-16 shrink-0 flex-col items-center justify-center gap-1 rounded-[10px] border-[1.2px] border-dashed border-[#d2d2d2] bg-[#f7f7f7]"
          >
            <Img src="/assets/write/plus.svg" className="size-[19px]" />
            <span className="text-[10.5px] leading-[1.4] tracking-[-0.21px] text-[#bdbdc0]">
              사진
            </span>
          </button>
        ) : null}
      </div>

      <input
        ref={fileInput}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(e) => {
          void add(e.target.files);
          e.target.value = "";
        }}
      />
    </Card>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full px-5">
      <div className="flex flex-col gap-[10px] rounded-xl border border-[#e5e5e5] bg-white px-[18px] py-[14px]">
        {children}
      </div>
    </div>
  );
}
