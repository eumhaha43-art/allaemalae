"use client";

import { useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import Img from "@/components/common/Img";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import MoreMenu from "@/components/common/MoreMenu";
import { RANK_COLORS, type Debate, type Ground, type Side } from "@/data/common/debate";
import {
  buildGrounds,
  getGroundsServerSnapshot,
  getGroundsSnapshot,
  groundsFor,
  isMine,
  removeGround,
  subscribeGrounds,
} from "@/state/groundStore";


/**
 * 근거 팝업 — Figma node 805:3731.
 *
 * 씨앗 근거 뒤에 이 기기에서 단 것이 이어 붙는다. 내가 단 것에만 「⋯」이
 * 붙어 고치고 지울 수 있다 — 남의 근거는 이 기기에 없다.
 */
export default function GroundsSheet({
  debate,
  side,
  onSide,
  onWrite,
  grab,
}: {
  debate: Debate;
  side: Side | "all";
  onSide: (next: Side | "all") => void;
  onWrite: () => void;
  /** Pointer handlers for the drag-down-to-close area (the handle and title). */
  grab: React.ComponentProps<"div">;
}) {
  const label = (of: Side) => {
    const option = debate.options.find((entry) => entry.side === of);
    return `${of} ${option?.label ?? ""}`;
  };
  // 진영 탭은 이 방의 선택지 이름으로 — 전에는 첫 방(1+1)의 이름이 박혀 있었다
  const SIDES: { id: Side | "all"; label: string }[] = [
    { id: "all", label: "전체" },
    ...debate.options.map((option) => ({ id: option.side, label: label(option.side) })),
  ];
  const router = useRouter();
  const written = useSyncExternalStore(
    subscribeGrounds,
    getGroundsSnapshot,
    getGroundsServerSnapshot,
  );
  const [removing, setRemoving] = useState<Ground | null>(null);

  const all = buildGrounds(debate.grounds, groundsFor(written, debate.id));
  const shown = all.filter((ground) => side === "all" || ground.side === side);

  return (
    <div className="relative w-full rounded-t-[24px] bg-white">
      {/* Grabbing here and pulling down closes the sheet. */}
      <div {...grab} className="w-full cursor-grab touch-none active:cursor-grabbing">
        <div className="flex w-full items-center justify-center pt-[14px] pb-2">
          <div className="h-1 w-10 rounded-[2px] bg-primary-black" />
        </div>

        <div className="flex w-full items-center justify-between px-6 pt-2 pb-1">
          <h2 className="text-base leading-[1.4] font-bold text-[#1a1c1c]">
            가장 많이 공감받은 근거
          </h2>
          {/* 내가 단 것까지 세어야 목록과 숫자가 어긋나지 않는다 */}
          <span className="text-xs leading-[1.4] text-[#9a9a9e]">
            {debate.groundCount + groundsFor(written, debate.id).length}개
          </span>
        </div>
      </div>

      <div className="flex w-full items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2">
          {SIDES.map((option) => {
            const on = option.id === side;
            return (
              <button
                key={option.id}
                type="button"
                aria-pressed={on}
                onClick={() => onSide(option.id)}
                className={`flex items-center rounded-[15px] px-[14px] py-[7px] text-xs leading-4 tracking-[-0.24px] ${
                  on
                    ? "bg-primary-600 font-bold text-white"
                    : "border border-gray-200 bg-white font-normal text-[#5e5e5e]"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
        <button type="button" className="flex items-center gap-[5px]">
          <span className="text-xs leading-[1.4] font-medium text-[#5e5e5e]">공감순</span>
          <Img src="/assets/debate/sort-caret.svg" className="size-3" />
        </button>
      </div>

      <div className="h-px w-full bg-gray-200" />

      <ul className="flex w-full flex-col px-6">
        {shown.map((ground) => (
          <li key={ground.id} className="flex w-full items-start gap-3 py-4">
            <span
              className="shrink-0 text-sm leading-[1.4] font-bold"
              style={{ color: RANK_COLORS[ground.rank - 1] ?? RANK_COLORS.at(-1) }}
            >
              {ground.rank}
            </span>

            <div className="flex min-w-px flex-1 flex-col gap-[10px]">
              <p className="text-[12.5px] leading-[1.4] font-bold text-[#1a1c1c]">{ground.text}</p>
              <div className="flex items-start gap-[6px]">
                <Pill>{label(ground.side)}</Pill>
                {ground.sourced ? <Pill dark>출처 있음</Pill> : <Pill>카더라</Pill>}
              </div>
            </div>

            <div className="flex w-11 shrink-0 flex-col items-center gap-[2px] pt-[2px]">
              {ground.fresh ? (
                <span className="text-[10px] leading-[1.4] font-bold text-primary-800">NEW</span>
              ) : (
                <>
                  <Img src="/assets/debate/upvote.svg" className="size-[14px]" />
                  <span className="text-[10px] leading-[1.4] font-bold text-primary-800">
                    {ground.likes}
                  </span>
                </>
              )}

              {isMine(ground) ? (
                <MoreMenu
                  label="근거 더보기"
                  items={[
                    {
                      label: "수정하기",
                      onSelect: () =>
                        router.push(`/community/debate/${debate.id}/ground?edit=${ground.id}`),
                    },
                    { label: "삭제하기", danger: true, onSelect: () => setRemoving(ground) },
                  ]}
                >
                  <span aria-hidden className="px-1 text-xs leading-[17px] text-[#9a9a9e]">
                    ⋯
                  </span>
                </MoreMenu>
              ) : null}
            </div>
          </li>
        ))}
      </ul>

      <ConfirmDialog
        open={removing !== null}
        title="근거를 삭제할까요?"
        description={"삭제한 근거는 되돌릴 수 없어요."}
        confirmLabel="삭제"
        cancelLabel="취소"
        onConfirm={() => {
          if (removing) removeGround(debate.id, removing.id);
          setRemoving(null);
        }}
        onCancel={() => setRemoving(null)}
      />

      <div className="flex w-full flex-col border-t border-gray-200 px-4 py-[14px]">
        <button
          type="button"
          onClick={onWrite}
          className="flex w-full items-center justify-center gap-[9px] rounded-[14px] bg-primary-600 py-[17px]"
        >
          <Img src="/assets/debate/pencil.svg" className="size-[18px]" />
          <span className="text-sm leading-[1.4] font-bold text-white">나도 근거 달기</span>
        </button>
      </div>

      {/* 홈 인디케이터 — 805:3842 */}
      <div className="home-bar flex w-full items-start justify-center pt-[6px] pb-[10px]">
        <div className="h-[5px] w-[140px] rounded-[3px] bg-[#1a1c1c]" />
      </div>
    </div>
  );
}

function Pill({ children, dark = false }: { children: React.ReactNode; dark?: boolean }) {
  return (
    <span
      className={`flex items-center rounded-[10px] px-[10px] py-[5px] text-[9.5px] leading-[1.4] font-bold ${
        dark ? "bg-primary-black text-white" : "border border-gray-200 bg-[#f4f3f3] text-[#5e5e5e]"
      }`}
    >
      {children}
    </span>
  );
}
