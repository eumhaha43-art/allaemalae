"use client";

import Img from "@/components/common/Img";
import { tagColor } from "@/data/common/cart";
import type { CartItem } from "@/types/cart";

/**
 * 장바구니에 담긴 지식 한 장 — Figma 1446:5695.
 *
 * 150x175 안에서 알약 · 그림 · 제목의 자리가 정해져 있어 절대 위치로 잡는다. 모서리는
 * 새 냉장고 틀(2012:6870)의 카드대로 16 — 전에는 10.
 *
 * 자리를 카드마다 재지 않고 한 벌로 못 박아 둔 것이 이 컴포넌트의 요점이다.
 * 그림은 제 크기가 제각각(34x48 ~ 57x44)이라 흐름에 그냥 놓으면 그림이 큰
 * 카드는 제목이 아래로 밀리고 작은 카드는 위로 붙어, 나란히 놓인 두 줄의
 * 제목이 서로 어긋난다. 프레임에서 달러 그림이 든 카드(1446:5746)가 가장
 * 반듯해 그 자리를 그대로 옮겨 왔다 — 그림 칸은 57x58 로 고정하고 안에서
 * 비율대로 맞추며, 제목은 그림 크기와 상관없이 늘 같은 높이에 앉는다.
 *
 * 카드 전체가 단추다. 다 먹음 탭(`picked` 가 있을 때)에서는 고르는 단추라
 * 오른쪽 위 동그라미가 고른 상태를 보여 주고, 다른 탭에서는 누르면 곧장 그
 * 지식으로 간다 — 동그라미 없이(사용자 요청). 동그라미만 눌러야 했을 때는
 * 손가락으로 자꾸 빗나갔다.
 *
 * 먹는 중인 지식은 맨 아래에 가는 막대와 그 옆에 진행률을 단다 — 홈의 「남겨둔
 * 지식 상품」이 보여 주는 그 숫자다. 전에는 진행률 알약이 왼쪽 위에 있어 갈래
 * 칩을 덮었다(기획 피드백) — 갈래 칩은 왼쪽 위, 진행률은 막대 옆.
 *
 * 다 먹은 지식은 한눈에 갈라 보인다(기획 피드백 — 세 탭이 같은 카드라 어느
 * 것이 영수증을 뽑을 수 있는지 몰랐다): 연한 초록 바탕과 테두리, 오른쪽 아래
 * 「완독」 도장.
 */
export default function KnowledgeCard({
  item,
  picked,
  onPress,
}: {
  item: CartItem;
  /** 고르는 탭이면 골랐는지, 아니면(누르면 곧장 여는 탭) undefined */
  picked?: boolean;
  onPress: () => void;
}) {
  const done = item.state === "다 먹음";
  const picking = picked !== undefined;
  return (
    <button
      type="button"
      aria-label={`${item.title.join(" ")}${done ? " · 다 먹음" : ""}`}
      aria-pressed={picking ? picked : undefined}
      onClick={onPress}
      className={`relative h-[175px] w-full rounded-[16px] text-left transition-transform active:scale-[0.97] ${
        picked
          ? "border-2 border-primary-600 bg-white"
          : done
            ? "border border-primary-300 bg-[#f1faf6]"
            : "bg-white"
      }`}
    >
      {picking ? (
        <span aria-hidden className="absolute top-[10px] right-[10px] z-10 flex size-5">
          <Img
            src={picked ? "/assets/cart/check-on.svg" : "/assets/cart/check-off.svg"}
            className="size-full"
          />
        </span>
      ) : null}

      {/* 완독 도장 — 다 먹은 지식만, 고르기 동그라미 바로 밑(동그라미가 없으면 그 자리). 아래에 두면 두 줄 제목을 덮는다 */}
      {done ? (
        <span
          aria-hidden
          className={`absolute right-[9px] z-10 flex size-7 rotate-[-12deg] items-center justify-center rounded-full border-2 border-primary-600/70 text-[9px] leading-none font-black text-primary-700/85 ${
            picking ? "top-[36px]" : "top-[9px]"
          }`}
        >
          완독
        </span>
      ) : null}
      {item.progress !== undefined ? (
        <>
          {/* 막대 · 퍼센트는 바닥에서 13 · 9(전 8 · 4) — 5 올렸다(사용자 지시) */}
          <span aria-hidden className="absolute bottom-[13px] left-[10px] right-[42px] h-[3px] overflow-hidden rounded-full bg-gray-200">
            <span className="block h-full rounded-full bg-primary-600" style={{ width: `${item.progress}%` }} />
          </span>
          <span className="absolute right-[10px] bottom-[9px] text-[10px] leading-none font-bold text-primary-700 tabular-nums">
            {item.progress}%
          </span>
        </>
      ) : null}

      {/* 갈래 알약 — 왼쪽 위. 오른쪽 위 동그라미와 마주 본다 */}
      <span
        style={{ backgroundColor: tagColor(item.tag) }}
        className="absolute top-[10px] left-[10px] flex h-[22px] max-w-[calc(100%-44px)] items-center justify-center truncate rounded-[17px] border-[0.5px] border-[#e2e2e2] px-[8px] text-[11px] leading-none font-semibold tracking-[-0.22px] whitespace-nowrap text-white"
      >
        {item.tag}
      </span>

      {/* 그림 칸 — 카드마다 같은 크기다. 안에서 비율대로 맞춘다. 알약 밑 42(전 47) — 제목과 함께 5 씩 올려 아래 진행 막대가 숨 쉬게(사용자 지시) */}
      <span className="absolute top-[42px] left-1/2 flex h-[58px] w-[57px] -translate-x-1/2 items-center justify-center">
        <span className={item.art.box ?? "flex size-full items-center justify-center"}>
          {item.art.parts.map((part) => (
            <Img
              key={part.src}
              src={part.src}
              style={part.width ? { width: part.width, height: part.height } : undefined}
              className={part.className}
            />
          ))}
        </span>
      </span>

      {/*
        제목 — 두 줄까지. 칸 높이를 두 줄에 맞춰 못 박아 두면, 한 줄짜리 제목도
        같은 자리에 가운데로 앉아 카드끼리 줄이 맞는다.
      */}
      <span className="absolute inset-x-[11px] top-[108px] flex h-[37px] flex-col justify-center overflow-hidden text-[13px] leading-[1.3] font-semibold text-gray-900">
        <span className="line-clamp-2">{item.title.join(" ")}</span>
      </span>
    </button>
  );
}
