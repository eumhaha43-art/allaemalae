import Img from "@/components/common/Img";
import type { Message } from "@/data/common/chat";

/** Widest a bubble gets before its text wraps — Figma 564:6284 (204px of text). */
const BUBBLE = "max-w-[232px]";

/** One line of the thread — Figma nodes 564:6239 … 564:6285 */
export default function MessageRow({ message }: { message: Message }) {
  if (message.kind === "chip") {
    return (
      <div className="flex w-full justify-center">
        <span className="rounded-lg bg-[#f1f1f1] px-3 py-[6px] text-[11px] leading-4 font-medium tracking-[-0.22px] text-[#9a9a9e]">
          {message.label}
        </span>
      </div>
    );
  }

  if (message.kind === "post") {
    return (
      <Speaker author={message.author} avatar={message.avatar}>
        <div className="flex items-end gap-[6px]">
          <article className="w-[222px] overflow-hidden rounded-[12px] rounded-tl-[4px] border border-[#e5e5e5] bg-white">
            <div className="flex items-center gap-[6px] bg-[#f7f7f7] px-[13px] py-[10px]">
              <Img src="/assets/chat/receipt.svg" className="size-[14px]" />
              <span className="text-[10.5px] leading-[1.4] font-bold text-[#6a6a6e]">
                게시글 공유
              </span>
            </div>
            <div className="flex flex-col gap-[6px] px-[13px] pt-[11px] pb-3">
              <h3 className="text-[13.5px] leading-[1.4] font-bold text-[#17171a]">
                {message.title}
              </h3>
              <p className="text-[11.5px] leading-[1.4] text-[#bdbdc0]">{message.excerpt}</p>
            </div>
          </article>
          <Time>{message.time}</Time>
        </div>
      </Speaker>
    );
  }

  if (message.mine) {
    return (
      <div className="flex w-full items-end justify-end gap-[6px]">
        <Time>{message.time}</Time>
        <p
          className={`${BUBBLE} rounded-[12px] rounded-tr-[4px] bg-primary-500 px-[14px] py-[11px] text-sm leading-[1.4] text-white`}
        >
          {message.text}
        </p>
      </div>
    );
  }

  return (
    <Speaker author={message.author} avatar={message.avatar}>
      <div className="flex items-end gap-[6px]">
        <p
          className={`${BUBBLE} bg-[#efefef] px-[14px] py-[11px] text-sm leading-[1.4] text-[#333336] ${
            // Only the first bubble of a run gets the notched corner.
            message.author ? "rounded-[12px] rounded-tl-[4px]" : "rounded-[12px]"
          }`}
        >
          {/*
            카더라 표 — 출처가 없다고 스스로 붙인 것이다. 말 위에 얹어야 읽기
            전에 「이건 확인 안 된 말」이라고 먼저 알린다.
          */}
          {message.tag ? (
            <span className="mb-[6px] block w-fit rounded-[4px] bg-primary-600 px-[6px] py-[2px] text-[10px] leading-[1.4] font-bold tracking-[-0.2px] text-white">
              {message.tag}
            </span>
          ) : null}
          {message.text}
        </p>
        <Time>{message.time}</Time>
      </div>
    </Speaker>
  );
}

/**
 * Avatar + name gutter. A message that continues the same speaker keeps the
 * 34px indent but drops the picture and the name.
 */
function Speaker({
  author,
  avatar,
  children,
}: {
  author?: string;
  avatar?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex w-full items-start gap-[9px]">
      {avatar ? (
        <Img src={avatar} className="size-[34px] shrink-0 rounded-full" />
      ) : (
        <div className="h-px w-[34px] shrink-0" />
      )}
      <div className="flex flex-col items-start gap-[5px]">
        {author ? (
          <span className="text-[11.5px] leading-[1.4] text-[#9a9a9e]">{author}</span>
        ) : null}
        {children}
      </div>
    </div>
  );
}

function Time({ children }: { children: React.ReactNode }) {
  return (
    <span className="shrink-0 text-[10px] leading-none whitespace-nowrap text-[#bdbdc0]">
      {children}
    </span>
  );
}
