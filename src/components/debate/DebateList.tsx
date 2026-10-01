"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Img from "@/components/common/Img";
import RiseIn from "@/components/home/RiseIn";
import PasswordDialog from "@/components/debate/PasswordDialog";
import SearchBar from "@/components/search/SearchBar";
import { filters, rooms, type DebateRoom } from "@/data/common/debate";

/**
 * 토론방 홈 — Figma node 761:2346.
 *
 * 방마다 상세가 있어 다 눌린다. 자물쇠 달린 방은 바로 들어가지 않고
 * 비밀번호를 묻는다(PasswordDialog) — 맞으면 그때 방으로 간다. 상세가 없는
 * 방이 다시 생기면 예전처럼 흐리게 놓고 안 눌리게 둔다.
 */
export default function DebateList() {
  const router = useRouter();
  const [filter, setFilter] = useState<string>(filters[0]);
  const [keyword, setKeyword] = useState("");
  /** 비밀번호를 묻는 중인 비공개 방. */
  const [asking, setAsking] = useState<DebateRoom | null>(null);

  /*
    필터와 검색어로 거른다. 「참여 중」은 내가 들어가 있는 방(joined), 공개 ·
    비공개는 자물쇠 유무. 검색어는 제목과 꼬리표에서 찾는다.
  */
  const query = keyword.trim();
  const shown = rooms.filter((room) => {
    if (filter.startsWith("참여 중") && !room.joined) return false;
    if (filter === "공개" && room.locked) return false;
    if (filter === "비공개" && !room.locked) return false;
    if (query && !room.title.includes(query) && !room.tags.some((tag) => tag.includes(query))) {
      return false;
    }
    return true;
  });

  return (
    <main className="flex w-full flex-1 flex-col bg-canvas">
      <div className="h-px w-full shrink-0 bg-[#e5e5e5]" />

      <div className="flex w-full flex-col gap-3 pt-4 pb-5">
        {/* 검색 — 761:2385. 검색 화면과 같은 알약(SearchBar) — 따로 그렸더니 거기만 옛 모양이었다(사용자 지적) */}
        <div className="flex w-full px-5">
          <SearchBar
            placeholder="방 이름 · 태그로 찾기"
            label="토론방 검색"
            keyword={keyword}
            onKeyword={setKeyword}
          />
        </div>

        {/* 필터 — 761:2389 */}
        <div className="no-scrollbar flex w-full gap-2 overflow-x-auto px-5">
          {filters.map((option) => {
            const on = option === filter;
            return (
              <button
                key={option}
                type="button"
                aria-pressed={on}
                onClick={() => setFilter(option)}
                className={`tap [--tap-w:0px] shrink-0 rounded-lg px-[14px] py-[9px] text-[13px] leading-[19px] tracking-[-0.26px] ${
                  on
                    ? "bg-primary-600 font-bold text-white"
                    : "border border-[#e5e5e5] bg-white font-normal text-[#6a6a6e]"
                }`}
              >
                {option}
              </button>
            );
          })}
        </div>

        {shown.length === 0 ? (
          <p className="w-full px-5 pt-10 text-center text-sm leading-[1.4] text-gray-500">
            맞는 토론방이 없어요
          </p>
        ) : null}
        {/*
          카드는 위에서부터 차례로 떠오른다(RiseIn — 홈 섹션과 같은 것, 사용자 요청). key 에
          필터를 붙여 칩을 바꾸면 남는 카드도 새로 붙어 다시 떠오른다(봉투와 같은 규칙).
        */}
        {shown.map((room, i) => (
          <RiseIn key={`${filter}-${room.id}`} order={i} className="w-full px-5">
            {room.ready && room.password ? (
              <button
                type="button"
                onClick={() => setAsking(room)}
                className="flex min-w-px flex-1 text-left"
              >
                <RoomCard room={room} />
              </button>
            ) : room.ready ? (
              <Link href={`/community/debate/${room.id}`} className="flex min-w-px flex-1">
                <RoomCard room={room} />
              </Link>
            ) : (
              // 상세 화면이 아직 없는 방 — 눌리지 않는다는 게 보이도록 흐리게.
              <div aria-disabled className="flex min-w-px flex-1 opacity-45 select-none">
                <RoomCard room={room} />
              </div>
            )}
          </RiseIn>
        ))}
      </div>

      {asking?.password ? (
        <PasswordDialog
          title={asking.title}
          password={asking.password}
          onPass={() => {
            setAsking(null);
            router.push(`/community/debate/${asking.id}`);
          }}
          onCancel={() => setAsking(null)}
        />
      ) : null}
    </main>
  );
}

/** 채팅방 카드 — Figma 761:2399 */
function RoomCard({ room }: { room: DebateRoom }) {
  const full = room.members >= room.capacity;

  return (
    <article className="flex min-w-px flex-1 gap-[14px] rounded-xl bg-white px-4 py-[15px]">
      {/* 썸네일 — 사진이 있으면 사진, 없으면 회색 알래봇 얼굴 */}
      <div className="flex size-[52px] shrink-0 items-center justify-center overflow-hidden rounded-[10px] border border-[#d2d2d2] bg-[#e6e6e6]">
        <Img
          src={room.thumb ?? "/assets/debate/thumb-bot.svg"}
          className={room.thumb ? "size-full object-cover" : "size-[34px]"}
        />
      </div>

      <div className="flex min-w-px flex-1 flex-col">
        <div className="flex w-full items-center gap-[6px]">
          {room.locked ? (
            <Img src="/assets/debate/lock.svg" className="size-[13px] shrink-0" />
          ) : null}
          <h3 className="min-w-px truncate text-[15px] leading-[1.2] font-bold text-[#17171a]">
            {room.title}
          </h3>
          {room.live ? (
            <span className="live-blink shrink-0 rounded-[4px] bg-live px-[6px] py-[2.5px] text-[9px] leading-[13px] font-bold tracking-[-0.18px] text-white">
              LIVE
            </span>
          ) : null}
          <div className="flex-1" />
          <span className="shrink-0 text-[11px] leading-4 tracking-[-0.22px] text-[#bdbdc0]">
            {room.when}
          </span>
        </div>

        <p className="mt-[7px] w-full truncate text-[13px] leading-[1.2] tracking-[-0.26px] text-[#6a6a6e]">
          {room.lastMessage}
        </p>

        <div className="mt-[10px] flex w-full items-center gap-[7px]">
          <span className="flex shrink-0 items-center gap-[5px]">
            <Img src="/assets/chat/people-13.svg" className="size-[13px]" />
            <span
              className={`text-[11px] leading-4 font-medium tracking-[-0.22px] ${
                full ? "text-[#17171a]" : "text-[#9a9a9e]"
              }`}
            >
              {room.members}/{room.capacity}
              {full ? " 마감" : null}
            </span>
          </span>
          {room.tags.map((tag) => {
            const secret = tag === "비공개";
            return (
              <span
                key={tag}
                className={`inline-flex h-5 shrink-0 items-center rounded-[6px] px-2 text-[10.5px] leading-none tracking-[-0.21px] ${
                  secret ? "bg-primary-800 text-white" : "bg-gray-200 text-gray-600"
                }`}
              >
                #{tag}
              </span>
            );
          })}
        </div>
      </div>
    </article>
  );
}
