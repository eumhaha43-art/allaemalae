import Link from "next/link";
import Img from "@/components/common/Img";
import { poll } from "@/data/common/community";

/**
 * 오늘의 지식 투표 — Figma 856:5257.
 *
 * 오른쪽 117 상자는 디자인에 「아이콘으로」라고만 적혀 있고 그림이 비어 있어
 * 검은 상자로 두었더니 깨진 그림으로 보였다(감수 지적) — 편의점 매대 사진
 * (poll.image)을 넣는다. 「투표하기」는 같은 주제의 토론방(A vs B 투표)으로 간다.
 *
 * 높이 160 을 못 박으면 320 폭에서 제목이 세 줄이 되어 단추가 잘렸다 — 최소
 * 높이로 두고 제목은 폭이 좁으면 접힌다.
 */
export default function PollHero() {
  return (
    <div className="w-full shrink-0 px-[25px] pb-5">
      <div className="flex min-h-[160px] w-full items-center justify-center gap-[14px] overflow-hidden rounded-[10px] bg-primary-600 p-5">
        <div className="flex min-w-px flex-1 flex-col items-start">
          <div className="flex items-center gap-[5px] text-white">
            <Img src="/assets/community/clock.svg" className="size-[13px]" />
            <p className="font-medium tracking-[-0.28px]">
              <span className="text-xs leading-[1.3]">{poll.label} </span>
              <span className="text-sm leading-[17px]">· </span>
              <span className="text-[10px] leading-[17px]">{poll.remaining}</span>
            </p>
          </div>

          <h2 className="mt-2 text-lg leading-[26px] font-semibold tracking-[-0.36px] text-white">
            {poll.title[0]}{" "}
            <br className="hidden min-[360px]:inline" />
            {poll.title[1]}
          </h2>

          <Link
            href={poll.href}
            className="tap mt-[14px] rounded-lg bg-primary-black px-[14px] py-2 text-[12.5px] leading-[18px] font-semibold tracking-[-0.25px] whitespace-nowrap text-white transition-opacity active:opacity-80"
          >
            {poll.cta}
          </Link>
        </div>

        <Img
          src={poll.image}
          className="size-[117px] shrink-0 rounded-[10px] object-cover max-[359px]:size-[88px]"
        />
      </div>
    </div>
  );
}
