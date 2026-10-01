"use client";

import { useRouter } from "next/navigation";
import Img from "@/components/common/Img";
import ChatRoomMenu from "@/components/chat/ChatRoomMenu";
import type { Room } from "@/data/common/chat";

/** Room title bar — Figma node 564:6212 */
export default function ChatHeader({ room, mine }: { room: Room; mine: boolean }) {
  const router = useRouter();

  return (
    <>
      <header className="flex h-[60px] w-full shrink-0 items-center gap-2 bg-white px-[14px] py-[10px]">
        <button type="button" aria-label="뒤로" onClick={() => router.back()} className="tap flex p-[6px]">
          <Img src="/assets/chat/back.svg" className="size-[22px]" />
        </button>

        <div className="flex min-w-px flex-1 flex-col gap-[2px]">
          <div className="flex items-center gap-[6px]">
            <h1 className="text-[15.5px] leading-[1.4] font-bold text-[#17171a]">{room.title}</h1>
            {room.live ? (
              <span className="live-blink rounded-[4px] bg-live px-[6px] py-[2px] text-[9px] leading-[1.4] font-bold text-white">
                LIVE
              </span>
            ) : null}
          </div>
          <div className="flex items-center gap-[5px]">
            <Img src="/assets/chat/people-12.svg" className="size-3" />
            <p className="text-[11px] leading-[1.4] text-[#bdbdc0]">
              {room.members} / {room.capacity}명 참여 중
            </p>
          </div>
        </div>

        <ChatRoomMenu room={room} mine={mine} />
      </header>
      <div className="h-px w-full shrink-0 bg-[#e5e5e5]" />
    </>
  );
}
