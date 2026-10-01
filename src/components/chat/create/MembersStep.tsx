"use client";

import { useState } from "react";
import { Accordion, CheckRow, OptionCard } from "@/components/chat/create/fields";
import { ROOM_RULES } from "@/data/common/chat";

export const MIN_CAPACITY = 2;
export const MAX_CAPACITY = 30;

/** Step 2 — who gets in, and how many. */
type Panel = "policy" | "capacity" | "rules";

export default function MembersStep({
  approval,
  onApproval,
  capacity,
  onCapacity,
  rules,
  onRules,
}: {
  approval: boolean;
  onApproval: (next: boolean) => void;
  capacity: number;
  onCapacity: (next: number) => void;
  /** One flag per entry in ROOM_RULES. */
  rules: boolean[];
  onRules: (next: boolean[]) => void;
}) {
  const [open, setOpen] = useState<Panel | null>("policy");
  const toggle = (panel: Panel) => setOpen((current) => (current === panel ? null : panel));

  return (
    <div className="flex flex-col px-6 pb-8">
      <Accordion
        icon="/assets/chat/people-12.svg"
        label="신청 방식"
        value={approval ? "승인제" : "선착순"}
        open={open === "policy"}
        onToggle={() => toggle("policy")}
      >
        <div className="flex flex-col gap-[10px]">
          <OptionCard
            title="선착순"
            lines={["신청하면 바로 테이블에 앉아요.", "누구나 들어올 수 있어서 방이 빨리 차요"]}
            selected={!approval}
            onClick={() => onApproval(false)}
          />
          <OptionCard
            title="승인제"
            lines={["호스트가 직접 받거나 거절할 수 있어요.", "이야기가 통하는 사람들과만 모여요"]}
            selected={approval}
            onClick={() => onApproval(true)}
          />
        </div>
      </Accordion>

      <Accordion
        icon="/assets/chat/people-13.svg"
        label="참여 인원 (호스트 포함)"
        value={`최대 ${capacity}명`}
        open={open === "capacity"}
        onToggle={() => toggle("capacity")}
      >
        <div className="flex flex-col items-center gap-3 py-3">
          <div className="flex items-center gap-7">
            <Step
              label="한 명 줄이기"
              sign="−"
              disabled={capacity <= MIN_CAPACITY}
              onClick={() => onCapacity(Math.max(MIN_CAPACITY, capacity - 1))}
            />
            <p className="w-[86px] text-center text-[28px] leading-none font-bold text-[#17171a]">
              {capacity}
              <span className="text-base font-medium text-[#6a6a6e]">명</span>
            </p>
            <Step
              label="한 명 늘리기"
              sign="+"
              disabled={capacity >= MAX_CAPACITY}
              onClick={() => onCapacity(Math.min(MAX_CAPACITY, capacity + 1))}
            />
          </div>
          <p className="text-xs leading-[1.4] text-[#9a9a9e]">
            말풍선에 {capacity}명 중 몇 명이 앉아 있는지 보여요
          </p>
        </div>
      </Accordion>

      <Accordion
        icon="/assets/chat/flag.svg"
        label="방 규칙"
        value={`${rules.filter(Boolean).length}개`}
        open={open === "rules"}
        onToggle={() => toggle("rules")}
      >
        <div className="flex flex-col">
          {ROOM_RULES.map((rule, i) => (
            <CheckRow
              key={rule}
              label={rule}
              checked={rules[i]}
              onToggle={() => onRules(rules.map((on, at) => (at === i ? !on : on)))}
            />
          ))}
          <p className="pt-2 text-xs leading-[1.4] text-[#9a9a9e]">
            켠 규칙은 방 안내에 붙어서 들어온 사람에게 보여요
          </p>
        </div>
      </Accordion>
    </div>
  );
}

function Step({
  label,
  sign,
  disabled,
  onClick,
}: {
  label: string;
  sign: string;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={`flex size-11 items-center justify-center rounded-full border text-[20px] leading-none ${
        disabled ? "border-[#f0f0f0] text-[#d2d2d2]" : "border-[#e5e5e5] text-[#17171a]"
      }`}
    >
      {sign}
    </button>
  );
}
