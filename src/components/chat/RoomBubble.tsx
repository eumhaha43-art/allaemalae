import Link from "next/link";
import Img from "@/components/common/Img";
import { hasTalk, sinceLabel, type Room } from "@/data/common/chat";

/**
 * A room's speech bubble on the lobby scene — Figma nodes 761:1107 / 761:1120.
 * Tapping it walks into that table, so the whole card is the link.
 *
 * A room someone made here can carry a cover photo, which sits to the left of
 * the two rows; the rooms from the design have none and are laid out as drawn.
 *
 * 말이 오간 방만 또렷하다. 아직 아무도 입을 안 뗀 방은 흐려 두는데, 어두운
 * 장면 위라 목록보다 조금 더 남긴다(0.55) — 여기서 더 내리면 글씨가 밤 배경에
 * 묻혀 무슨 방인지도 안 보인다.
 *
 * 높이는 65 로 못 박는다. 내용에 맡겼더니 LIVE 인 방은 62, 아닌 방은 65 가 됐다
 * (제목 줄 높이가 다르다). 말꼬리는 장면 위 고정 좌표에 놓인 그림이라 말풍선이
 * 3 씩 오르내리면 어떤 방은 꼬리가 겹치고 어떤 방은 떨어진다. 제목이 한 줄로
 * 잘리는 상자라 높이를 정해 둬도 넘칠 일이 없다.
 */
export default function RoomBubble({ room, className }: { room: Room; className?: string }) {
  return (
    <Link
      href={`/community/chat/${room.id}`}
      className={`flex h-[65px] w-[262px] items-center gap-[10px] rounded-xl bg-white px-[14px] shadow-[0px_3px_8px_0px_rgba(0,0,0,0.1)] ${
        hasTalk(room.id) ? "" : "opacity-55 grayscale"
      } ${className ?? ""}`}
    >
      {room.image ? (
        <Img src={room.image} className="size-[38px] shrink-0 rounded-lg object-cover" />
      ) : null}

      <div className="flex min-w-px flex-1 flex-col gap-[7px]">
        <div className="flex w-full items-center gap-[6px]">
          <h3
            className={`min-w-px flex-1 truncate text-[15px] font-bold tracking-[-0.3px] text-[#17171a] ${
              room.live ? "leading-none" : "leading-[1.2]"
            }`}
          >
            {room.title}
          </h3>
          {room.live ? (
            <span className="live-blink shrink-0 rounded-[4px] bg-live px-[7px] py-[3px] text-[9px] leading-none font-bold tracking-[-0.18px] text-white">
              LIVE
            </span>
          ) : room.approval ? (
            <span className="shrink-0 rounded-[4px] bg-[#f0f0f0] px-[7px] py-[3px] text-[9px] leading-none font-bold tracking-[-0.18px] text-[#6a6a6e]">
              승인제
            </span>
          ) : null}
        </div>

        <div className="flex w-full items-center gap-[6px]">
          <span className="shrink-0 text-[11.5px] leading-none tracking-[-0.23px] text-[#9a9a9e]">
            {room.host}
          </span>
          <Dot />
          <Img src="/assets/chat/people-13.svg" className="size-[13px] shrink-0" />
          <span className="shrink-0 text-[11px] leading-none font-medium tracking-[-0.22px] text-[#6a6a6e]">
            {room.members}/{room.capacity}
          </span>
          <Dot />
          <span className="shrink-0 text-[11.5px] leading-none tracking-[-0.23px] text-[#bdbdc0]">
            {sinceLabel(room.minutesAgo)}
          </span>
        </div>
      </div>
    </Link>
  );
}

function Dot() {
  return (
    <span className="shrink-0 text-[11px] leading-4 tracking-[-0.22px] text-[#bdbdc0]" aria-hidden>
      ·
    </span>
  );
}
