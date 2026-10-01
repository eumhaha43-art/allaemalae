"use client";

import { useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent, ReactNode } from "react";
import Img from "@/components/common/Img";
import { removeSticker, updateSticker } from "@/state/receiptStore";
import { decorate, stickerSize } from "@/data/common/record";
import type { Sticker } from "@/types/record";

/** 테두리를 스티커에서 이만큼 띄운다 */
const PAD = 6;
const MIN_SCALE = 0.6;
const MAX_SCALE = 3;

const clamp = (value: number, low: number, high: number) =>
  Math.min(high, Math.max(low, value));

/** 끄는 중인 스티커의 자리 · 크기 · 기울기 */
type Draft = Pick<Sticker, "id" | "left" | "top" | "scale" | "tilt">;

/** 한 번 눌렀을 때 도는 각. 끌지 않고 톡 누르기만 했을 때 쓴다. */
const TURN_STEP = 15;
/** 이만큼 안 움직였으면 「끌었다」가 아니라 「눌렀다」로 본다. */
const TAP_SLOP = 5;

/** 끄는 동안 붙잡아 두는 값 — 시작할 때의 손가락 자리와 스티커 상태. */
type Drag = {
  kind: "move" | "size" | "turn";
  id: string;
  pointer: number;
  left: number;
  top: number;
  scale: number;
  tilt: number;
  /** 돌릴 때 — 가운데에서 손가락까지의 처음 각(도) */
  aim: number;
  /** 손가락이 처음 자리에서 이만큼도 안 움직였는지 — 톡 누른 것과 가른다 */
  still: boolean;
  /** 옮길 때 — 손가락이 처음 닿은 자리 */
  fromX: number;
  fromY: number;
  /** 크기를 잴 때 — 스티커 가운데와, 거기서 손가락까지의 처음 거리 */
  centerX: number;
  centerY: number;
  reach: number;
};

/**
 * 영수증 위에 붙은 스티커들.
 *
 * 꾸미기 화면에서는 스티커를 누르면 테두리와 손잡이가 나온다 — 왼쪽 위는 떼기,
 * 왼쪽 아래는 좌우 뒤집기, 오른쪽 위는 돌리기, 오른쪽 아래를 끌면 크기가
 * 바뀐다. 스티커 몸통을 끌면 옮겨진다. 빈 곳을 누르면 테두리가 사라진다.
 *
 * 돌리기 손잡이는 두 가지로 쓴다. 끌면 손가락을 따라 자유롭게 돌고, 끌지 않고
 * 톡 누르면 15도씩 돈다 — 조금만 비틀고 싶을 때 손가락으로 각을 맞추기가
 * 어렵고, 크게 돌리고 싶을 때 스물네 번 누르는 것도 못 할 짓이다.
 *
 * 끄는 동안에는 저장소 대신 여기(`draft`)에 값을 두고, 손을 뗄 때 한 번만
 * 저장한다. 손잡이는 기울기를 따라 같이 돌아야 스티커에 붙어 보인다.
 */
export default function StickerLayer({
  stickers,
  small,
  editable,
}: {
  stickers: Sticker[];
  small?: boolean;
  /** 꾸미기 화면에서만 고르고 옮길 수 있다 */
  editable?: boolean;
}) {
  const box = useRef<HTMLDivElement>(null);
  const [picked, setPicked] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const drag = useRef<Drag | null>(null);
  /**
   * 손을 뗄 때 저장할 값.
   *
   * 그리기용 `draft` 만 두면, 옮긴 직후에 손을 떼는 순간의 값을 아직 못 받은
   * 상태로 저장하게 된다 — 그래서 같은 값을 여기에도 둔다.
   */
  const latest = useRef<Draft | null>(null);

  const hold = (next: Draft) => {
    latest.current = next;
    setDraft(next);
  };

  const grab = (event: ReactPointerEvent, sticker: Sticker, kind: Drag["kind"]) => {
    if (!editable) return;
    const area = box.current?.getBoundingClientRect();
    if (!area) return;

    event.stopPropagation();
    setPicked(sticker.id);

    const centerX = area.left + (sticker.left / 100) * area.width;
    const centerY = area.top + (sticker.top / 100) * area.height;
    const reach = Math.hypot(event.clientX - centerX, event.clientY - centerY);
    // 손잡이를 가운데 가까이에서 잡으면 배율도 각도 튄다 — 그럴 땐 끌지 않는다.
    if ((kind === "size" || kind === "turn") && reach < 8) return;

    try {
      // 손가락이 스티커 밖으로 나가도 계속 따라오게 붙잡아 둔다.
      box.current?.setPointerCapture(event.pointerId);
    } catch {
      // 이미 놓친 손가락이면 잡을 게 없다 — 끄는 것만 그대로 이어 간다.
    }
    drag.current = {
      kind,
      id: sticker.id,
      pointer: event.pointerId,
      left: sticker.left,
      top: sticker.top,
      scale: sticker.scale,
      fromX: event.clientX,
      fromY: event.clientY,
      centerX,
      centerY,
      reach,
      tilt: sticker.tilt,
      aim: (Math.atan2(event.clientY - centerY, event.clientX - centerX) * 180) / Math.PI,
      still: true,
    };
    hold({
      id: sticker.id,
      left: sticker.left,
      top: sticker.top,
      scale: sticker.scale,
      tilt: sticker.tilt,
    });
  };

  const drift = (event: ReactPointerEvent) => {
    const job = drag.current;
    const area = box.current?.getBoundingClientRect();
    if (!job || !area || job.pointer !== event.pointerId) return;

    if (Math.hypot(event.clientX - job.fromX, event.clientY - job.fromY) > TAP_SLOP) {
      job.still = false;
    }

    if (job.kind === "move") {
      /*
        가장자리에 걸치는 것까지는 두되, 가운데가 종이를 벗어나지는 못한다.

        종이가 밖을 잘라 내므로(Receipt), 더 밀어내면 스티커가 통째로 사라진다 —
        안 보이는 것은 눌러서 뗄 수도 없어 영영 못 지운다.
      */
      hold({
        id: job.id,
        scale: job.scale,
        tilt: job.tilt,
        left: clamp(job.left + ((event.clientX - job.fromX) / area.width) * 100, 4, 96),
        top: clamp(job.top + ((event.clientY - job.fromY) / area.height) * 100, 4, 96),
      });
      return;
    }

    if (job.kind === "turn") {
      // 잡은 손잡이가 가리키던 각에서 얼마나 돌았는지를 그대로 스티커에 더한다
      const aim = (Math.atan2(event.clientY - job.centerY, event.clientX - job.centerX) * 180) / Math.PI;
      hold({
        id: job.id,
        left: job.left,
        top: job.top,
        scale: job.scale,
        tilt: Math.round(job.tilt + (aim - job.aim)),
      });
      return;
    }

    const reach = Math.hypot(event.clientX - job.centerX, event.clientY - job.centerY);
    hold({
      id: job.id,
      left: job.left,
      top: job.top,
      tilt: job.tilt,
      scale: clamp((job.scale * reach) / job.reach, MIN_SCALE, MAX_SCALE),
    });
  };

  const drop = (event: ReactPointerEvent) => {
    const job = drag.current;
    if (!job || job.pointer !== event.pointerId) return;
    drag.current = null;
    const last = latest.current;
    // 돌리기 손잡이를 끌지 않고 톡 누르기만 했으면 한 칸(15도)만 돌린다
    if (job.kind === "turn" && job.still) {
      updateSticker(job.id, { tilt: job.tilt + TURN_STEP });
    } else if (last) {
      updateSticker(job.id, {
        left: last.left,
        top: last.top,
        scale: last.scale,
        tilt: last.tilt,
      });
    }
    latest.current = null;
    setDraft(null);
  };

  return (
    <div
      ref={box}
      className={`absolute inset-0 z-10 ${editable ? "" : "pointer-events-none"}`}
      onPointerDown={() => setPicked(null)}
      onPointerMove={drift}
      onPointerUp={drop}
      onPointerCancel={drop}
    >
      {stickers.map((sticker) => {
        // 끄는 중인 스티커만 저장된 값 대신 지금 끌고 있는 값으로 그린다.
        const live = draft?.id === sticker.id ? { ...sticker, ...draft } : sticker;
        const on = Boolean(editable) && picked === sticker.id;
        /*
          한 변은 종이 폭의 몇 % — px 로 두면 좁은 화면(320)에서 종이만 줄고
          스티커는 그대로라 본문 글을 덮었다(감수 지적). stickerSize 는 종이가
          가장 넓을 때(280 · 220)의 px 다.
        */
        const side = `${((small ? stickerSize.small / 220 : stickerSize.big / 280) * live.scale * 100).toFixed(2)}%`;

        return (
          <div
            key={sticker.id}
            className="absolute"
            style={{
              left: `${live.left}%`,
              top: `${live.top}%`,
              width: side,
              aspectRatio: "1",
              transform: `translate(-50%, -50%) rotate(${live.tilt}deg)`,
              // 브라우저가 스크롤로 가져가면 끌리지 않는다.
              touchAction: "none",
              zIndex: on ? 2 : 1,
            }}
          >
{/*
              꾸미기 화면이 아니면 단추가 아니라 그림으로만 둔다. 눌러도 하는 일이
              없기도 하지만, 주간지식처럼 영수증 전체를 단추로 감싼 자리에서는
              단추 안에 단추가 들어가 HTML 이 깨진다.
            */}
            {editable ? (
              <button
                type="button"
                aria-label={decorate.sticker.pick}
                onPointerDown={(event) => grab(event, live, "move")}
                className="block size-full select-none"
              >
                <Art sticker={sticker} />
              </button>
            ) : (
              <span className="block size-full select-none">
                <Art sticker={sticker} />
              </span>
            )}

            {on ? (
              <>
                <span
                  aria-hidden
                  className="pointer-events-none absolute rounded-[8px] border border-gray-black/45"
                  style={{ inset: -PAD }}
                />
                <Handle
                  at="top-left"
                  label={decorate.sticker.remove}
                  onClick={() => removeSticker(sticker.id)}
                >
                  <IconClose />
                </Handle>
                <Handle
                  at="bottom-left"
                  label={decorate.sticker.flip}
                  onClick={() => updateSticker(sticker.id, { flipped: !sticker.flipped })}
                >
                  <IconFlip />
                </Handle>
                <Handle
                  at="top-right"
                  label={decorate.sticker.turn}
                  onPointerDown={(event) => grab(event, live, "turn")}
                >
                  <IconTurn />
                </Handle>
                <Handle
                  at="bottom-right"
                  label={decorate.sticker.resize}
                  onPointerDown={(event) => grab(event, live, "size")}
                >
                  <IconResize />
                </Handle>
              </>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

/** 스티커 그림 한 장 — 붙인 채로 좌우 뒤집혀 있을 수 있다. */
function Art({ sticker }: { sticker: Sticker }) {
  return (
    <Img
      src={sticker.art}
      // 마우스로 끌면 브라우저가 그림 끌어 놓기를 시작하면서 포인터를 뺏어
      // 간다 — 손가락으로는 되는데 웹에서만 안 움직이던 까닭이다.
      draggable={false}
      className="size-full object-contain"
      style={{ transform: sticker.flipped ? "scaleX(-1)" : undefined }}
    />
  );
}

/** 손잡이가 붙는 모서리 — 테두리 위에 반씩 걸치게 놓는다. */
const CORNER = {
  "top-left": { left: -PAD, top: -PAD },
  "top-right": { left: `calc(100% + ${PAD}px)`, top: -PAD },
  "bottom-left": { left: -PAD, top: `calc(100% + ${PAD}px)` },
  "bottom-right": { left: `calc(100% + ${PAD}px)`, top: `calc(100% + ${PAD}px)` },
} as const;

/**
 * 테두리 모서리의 흰 동그라미.
 *
 * 보이는 크기는 22px 로 작지만 `.tap` 이 뒤에 34px 짜리 누를 자리를 깔아 준다 —
 * 손가락으로도 놓치지 않게. 기본값 44px 로 두면 작은 스티커에서는 손잡이 세 개가
 * 스티커 몸통을 다 덮어 버려 끌어서 옮길 곳이 없어진다.
 */
function Handle({
  at,
  label,
  onClick,
  onPointerDown,
  children,
}: {
  at: keyof typeof CORNER;
  label: string;
  onClick?: () => void;
  onPointerDown?: (event: ReactPointerEvent) => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      // 누르자마자 스티커가 따라 움직이면 안 된다.
      onPointerDown={(event) => {
        event.stopPropagation();
        onPointerDown?.(event);
      }}
      className="tap [--tap:34px] absolute flex size-[22px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-gray-black shadow-[0_1px_4px_rgba(0,0,0,0.28)]"
      style={CORNER[at]}
    >
      {children}
    </button>
  );
}

function IconClose() {
  return (
    <svg width="11" height="11" viewBox="0 0 11 11" aria-hidden fill="none">
      <path
        d="M1.5 1.5 9.5 9.5M9.5 1.5 1.5 9.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** 좌우 뒤집기 — 가운데 접힌 선을 두고 양쪽에 삼각형 */
function IconFlip() {
  return (
    <svg width="13" height="11" viewBox="0 0 13 11" aria-hidden fill="none">
      <path d="M6.5 1v9" stroke="currentColor" strokeWidth="1.2" strokeDasharray="1.6 1.4" strokeLinecap="round" />
      <path d="M4.6 2.2 1.3 5.5l3.3 3.3z" fill="currentColor" />
      <path d="M8.4 2.2l3.3 3.3-3.3 3.3z" fill="currentColor" />
    </svg>
  );
}

/** 돌리기 — 화살촉이 달린 열린 동그라미 */
function IconTurn() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" aria-hidden fill="none">
      <path
        d="M10.6 4.2a4.6 4.6 0 1 1-1.9-2.1"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path d="M11.2 1v3.4H7.9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** 크기 조절 — 바깥으로 뻗는 대각선 화살표 */
function IconResize() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden fill="none">
      <path
        d="M4.4 7.6 1.4 10.6M1.4 10.6h3M1.4 10.6v-3M7.6 4.4l3-3M10.6 1.4h-3M10.6 1.4v3"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
