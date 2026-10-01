"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Img from "@/components/common/Img";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import PromptDialog from "@/components/common/PromptDialog";
import type { Room } from "@/data/common/chat";
import { removeRoom } from "@/state/roomStore";

type Sheet = "report" | "reported" | "delete";

/**
 * The "..." in a room header — Figma node 564:6226.
 *
 * A guest can leave or report the room; the host who opened it can edit or
 * delete it instead. Both 신고 and 삭제 ask for a reason first: there is no
 * moderation backend yet, so the reason is only echoed back for now.
 */
export default function ChatRoomMenu({ room, mine }: { room: Room; mine: boolean }) {
  const router = useRouter();
  const root = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [sheet, setSheet] = useState<Sheet | null>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const pick = (next: Sheet) => {
    setOpen(false);
    setSheet(next);
  };

  return (
    <div ref={root} className="relative flex">
      <button
        type="button"
        aria-label="더보기"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((on) => !on)}
        className="tap flex p-[6px]"
      >
        <Img src="/assets/chat/more.svg" className="size-[22px]" />
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute top-[34px] right-0 z-20 w-[124px] overflow-hidden rounded-[10px] border border-[#e5e5e5] bg-white shadow-[0px_3px_8px_0px_rgba(0,0,0,0.12)]"
        >
          {mine ? (
            <>
              <Item onClick={() => router.push(`/community/chat/new?edit=${room.id}`)}>
                수정하기
              </Item>
              <Divider />
              <Item accent onClick={() => pick("delete")}>
                삭제하기
              </Item>
            </>
          ) : (
            <>
              <Item onClick={() => router.push("/community/chat")}>나가기</Item>
              <Divider />
              <Item accent onClick={() => pick("report")}>
                신고하기
              </Item>
            </>
          )}
        </div>
      ) : null}

      {sheet === "report" ? (
        <PromptDialog
          title="신고 사유를 입력해 주세요"
          description={"어떤 점이 문제였는지 적어주시면\n운영팀이 방을 확인해요."}
          placeholder="예: 출처 없는 정보를 반복해서 올려요"
          confirmLabel="신고하기"
          onConfirm={() => setSheet("reported")}
          onCancel={() => setSheet(null)}
        />
      ) : null}

      <ConfirmDialog
        open={sheet === "reported"}
        title="신고가 접수됐어요"
        description="운영팀이 확인한 뒤 결과를 알려드릴게요."
        confirmLabel="확인"
        onConfirm={() => setSheet(null)}
        onCancel={() => setSheet(null)}
      />

      {sheet === "delete" ? (
        <PromptDialog
          title="채팅방을 삭제할까요?"
          description={`지금 방에 있는 ${room.members}명도 더 이상 들어올 수 없고,\n주고받은 대화는 되돌릴 수 없어요.\n삭제 사유를 남겨주세요.`}
          placeholder="예: 이야기가 다 끝나서 정리하려고요"
          confirmLabel="삭제"
          onConfirm={() => {
            setSheet(null);
            removeRoom(room.id);
            router.push("/community/chat");
          }}
          onCancel={() => setSheet(null)}
        />
      ) : null}
    </div>
  );
}

function Item({
  children,
  accent = false,
  onClick,
}: {
  children: React.ReactNode;
  /** The one that ends something — painted in the brand green. */
  accent?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className={`flex w-full px-[14px] py-[11px] text-left text-[13px] leading-[1.4] ${
        accent ? "font-medium text-primary-600" : "text-[#17171a]"
      }`}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <div className="h-px w-full bg-[#f0f0f0]" />;
}
