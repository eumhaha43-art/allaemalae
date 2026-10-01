"use client";

import { useState, useSyncExternalStore } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Img from "@/components/common/Img";
import IntroStep, { type Cover } from "@/components/chat/create/IntroStep";
import MembersStep from "@/components/chat/create/MembersStep";
import { DEFAULT_RULES, ROOM_RULES, type Room } from "@/data/common/chat";
import {
  addRoom,
  getRoomsServerSnapshot,
  getRoomsSnapshot,
  subscribeRooms,
  updateRoom,
} from "@/state/roomStore";

const STEPS = ["채팅방을 소개해볼까요?", "어떻게 멤버를 모을까요?"] as const;
const EDIT_STEPS = ["채팅방 소개를 고칠까요?", "멤버 조건을 고칠까요?"] as const;

const TAG_MAX = 5;

/**
 * 방 만들기 — the two-step sheet behind the lobby's 방 만들기 button.
 *
 * Takes its shape from 글쓰기: same field cards and copy voice, with a step bar
 * and a full-width bottom action instead of the header 등록 button. It doubles
 * as the edit screen at `?edit=<room id>`, the way 글쓰기 does for a post — and
 * like there, the room only exists in localStorage, so the fields are seeded by
 * remounting on a key rather than written from an effect.
 */
export default function CreateRoomFlow() {
  const editId = useSearchParams().get("edit");
  const mine = useSyncExternalStore(subscribeRooms, getRoomsSnapshot, getRoomsServerSnapshot);
  const editRoom = editId ? mine.find((room) => room.id === editId) : undefined;

  return (
    <CreateRoomFields
      key={editRoom ? `edit:${editRoom.id}` : (editId ?? "new")}
      editId={editId}
      editRoom={editRoom}
    />
  );
}

function CreateRoomFields({ editId, editRoom }: { editId: string | null; editRoom?: Room }) {
  const router = useRouter();

  const [step, setStep] = useState(0);
  const [cover, setCover] = useState<Cover | null>(
    editRoom?.image ? { url: editRoom.image, thumb: editRoom.image } : null,
  );
  const [title, setTitle] = useState(editRoom?.title ?? "");
  const [intro, setIntro] = useState(editRoom?.intro ?? "");
  const [tagText, setTagText] = useState((editRoom?.tags ?? []).map((t) => `#${t}`).join(" "));
  const [approval, setApproval] = useState(editRoom?.approval ?? false);
  const [capacity, setCapacity] = useState(editRoom?.capacity ?? 20);
  const [rules, setRules] = useState<boolean[]>(
    editRoom ? ROOM_RULES.map((rule) => (editRoom.rules ?? []).includes(rule)) : [...DEFAULT_RULES],
  );

  const titles = editId ? EDIT_STEPS : STEPS;

  const tags = tagText
    .split(/[\s,]+/)
    .map((tag) => tag.replace(/^#+/, "").trim())
    .filter((tag, i, all) => tag.length > 0 && all.indexOf(tag) === i)
    .slice(0, TAG_MAX);

  const last = step === titles.length - 1;
  const blocked = step === 0 && title.trim().length === 0;

  /** Editing came from inside the room, so backing out lands there again. */
  const exit = editId ? `/community/chat/${editId}` : "/community/chat";

  const back = () => {
    if (step === 0) router.push(exit);
    else setStep((current) => current - 1);
  };

  const next = () => {
    if (blocked) return;
    if (!last) {
      setStep((current) => current + 1);
      return;
    }
    const kept: string[] = ROOM_RULES.filter((_, i) => rules[i]);
    const written = {
      title: title.trim(),
      capacity,
      intro: intro.trim() || undefined,
      tags: tags.length > 0 ? tags : undefined,
      image: cover?.thumb,
      approval: approval || undefined,
      rules: kept.length > 0 ? kept : undefined,
    };
    if (editId) {
      updateRoom(editId, written);
    } else {
      // You are the first one at the table.
      addRoom({ ...written, host: "나", members: 1 });
    }
    router.push(exit);
  };

  return (
    <main className="flex min-h-full w-full flex-col bg-white">
      <div className="h-[3px] w-full shrink-0 bg-[#f0f0f0]">
        <div
          className="h-full bg-primary-600 transition-[width]"
          style={{ width: `${((step + 1) / titles.length) * 100}%` }}
        />
      </div>

      <header className="flex h-[60px] w-full shrink-0 items-center px-5">
        <button type="button" aria-label="뒤로" onClick={back} className="tap flex p-[6px]">
          <Img src="/assets/chat/back.svg" className="size-[22px]" />
        </button>
      </header>

      {/* 스타일 가이드 Heading_22 — 이 화면은 피그마 프레임이 아니라 가이드를 따른다 */}
      <h1 className="px-6 pt-1 pb-7 text-heading-22 text-[#17171a]">
        {titles[step]}
      </h1>

      <div className="flex-1">
        {step === 0 ? (
          <IntroStep
            cover={cover}
            onCover={setCover}
            title={title}
            onTitle={setTitle}
            intro={intro}
            onIntro={setIntro}
            tagText={tagText}
            onTagText={setTagText}
          />
        ) : (
          <MembersStep
            approval={approval}
            onApproval={setApproval}
            capacity={capacity}
            onCapacity={setCapacity}
            rules={rules}
            onRules={setRules}
          />
        )}
      </div>

      <div className="sticky bottom-0 w-full bg-white px-5 pt-2 pb-5">
        <button
          type="button"
          disabled={blocked}
          onClick={next}
          className={`h-14 w-full rounded-full text-base leading-[1.4] font-bold ${
            blocked ? "bg-[#ededed] text-[#bdbdc0]" : "bg-primary-600 text-white"
          }`}
        >
          {last ? (editId ? "수정 완료" : "채팅방 만들기") : "다음"}
        </button>
      </div>
    </main>
  );
}
