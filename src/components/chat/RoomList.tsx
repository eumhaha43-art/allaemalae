import Link from "next/link";
import Img from "@/components/common/Img";
import { hasTalk, sinceLabel, type Room } from "@/data/common/chat";

/**
 * The lobby's 목록 view — every room at once, instead of two tables at a time.
 * Rows follow the community feed: white section, hairline dividers, 25px gutter.
 *
 * 말이 오간 방만 또렷하고, 아직 아무도 입을 안 뗀 방은 흐리다. 들어가 보기
 * 전에는 알 수가 없어 다 똑같이 보이면 아무 데나 눌러 보고 빈 방을 만난다.
 * 흐릴 뿐 잠그지는 않는다 — 빈 방도 들어가서 먼저 말을 걸 수 있다.
 */
export default function RoomList({ rooms }: { rooms: Room[] }) {
  return (
    <ul className="w-full divide-y divide-divider border-y border-border bg-white">
      {rooms.map((room) => (
        <li key={room.id}>
          <Link
            href={`/community/chat/${room.id}`}
            className={`flex w-full items-center gap-3 px-[25px] py-[14px] ${
              hasTalk(room.id) ? "" : "opacity-45 grayscale"
            }`}
          >
            {room.image ? (
              <Img src={room.image} className="size-12 shrink-0 rounded-[10px] object-cover" />
            ) : (
              <span className="flex size-12 shrink-0 items-center justify-center rounded-[10px] bg-[#f1f1f1]">
                <Img src="/assets/chat/people-13.svg" className="size-5" />
              </span>
            )}

            <div className="flex min-w-px flex-1 flex-col gap-[5px]">
              <div className="flex items-center gap-[6px]">
                <h3 className="min-w-px truncate text-[15px] leading-[1.3] font-bold tracking-[-0.3px] text-[#17171a]">
                  {room.title}
                </h3>
                {room.live ? (
                  <span className="live-blink shrink-0 rounded-[4px] bg-live px-[6px] py-[2px] text-[9px] leading-none font-bold text-white">
                    LIVE
                  </span>
                ) : room.approval ? (
                  <span className="shrink-0 rounded-[4px] bg-[#f0f0f0] px-[6px] py-[2px] text-[9px] leading-none font-bold text-[#6a6a6e]">
                    승인제
                  </span>
                ) : null}
              </div>

              <div className="flex items-center gap-[6px]">
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

            <Img src="/assets/write/chevron.svg" className="size-4 shrink-0" />
          </Link>
        </li>
      ))}
    </ul>
  );
}

function Dot() {
  return (
    <span className="shrink-0 text-[11px] leading-4 tracking-[-0.22px] text-[#bdbdc0]" aria-hidden>
      ·
    </span>
  );
}
