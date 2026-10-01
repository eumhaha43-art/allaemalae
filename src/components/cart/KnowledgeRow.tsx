"use client";

import Img from "@/components/common/Img";
import { tagColor } from "@/data/common/cart";
import type { CartItem } from "@/types/cart";

/**
 * 목록형으로 본 지식 한 줄.
 *
 * 격자에서는 카드가 좁아 제목을 세 줄로 끊어 놓지만, 여기서는 가로가 넉넉해
 * 한 줄로 이어 붙인다 — 같은 제목을 두 벌로 들고 있지 않기 위해서다.
 *
 * 카드와 마찬가지로 줄 전체가 단추다 — 고르는 탭(`picked` 가 있을 때)이면
 * 고르고, 아니면 누르면 곧장 그 지식으로 간다.
 */
export default function KnowledgeRow({
  item,
  picked,
  onPress,
}: {
  item: CartItem;
  /** 고르는 탭이면 골랐는지, 아니면(누르면 곧장 여는 탭) undefined */
  picked?: boolean;
  onPress: () => void;
}) {
  const picking = picked !== undefined;
  return (
    <button
      type="button"
      aria-label={item.title.join(" ")}
      aria-pressed={picking ? picked : undefined}
      onClick={onPress}
      className={`flex w-full items-center gap-3 rounded-[10px] p-3 text-left transition-transform active:scale-[0.99] ${
        picked
          ? "border-2 border-primary-600 bg-white p-[10px]"
          : item.state === "다 먹음"
            ? "border border-primary-300 bg-[#f1faf6] p-[11px]"
            : "bg-white"
      }`}
    >
      <span className="flex size-[52px] shrink-0 items-center justify-center">
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

      <span className="flex min-w-px flex-1 flex-col items-start gap-[6px]">
        <span
          style={{ backgroundColor: tagColor(item.tag) }}
          className="flex items-center rounded-[17px] border-[0.5px] border-[#e2e2e2] px-[10px] py-1 text-[11px] leading-none font-semibold tracking-[-0.22px] whitespace-nowrap text-white"
        >
          {item.tag}
        </span>
        <span className="w-full text-[13px] leading-[1.3] font-medium text-gray-900">
          {item.title.join(" ")}
        </span>
        {item.progress !== undefined ? (
          <span className="flex w-full items-center gap-2">
            <span aria-hidden className="h-[3px] min-w-px flex-1 overflow-hidden rounded-full bg-gray-200">
              <span className="block h-full rounded-full bg-primary-600" style={{ width: `${item.progress}%` }} />
            </span>
            <span className="text-[10px] leading-none font-bold text-primary-700">{item.progress}%</span>
          </span>
        ) : null}
      </span>

      {/* 완독 도장 — 다 먹은 것만, 고르기 동그라미 왼쪽에 */}
      {item.state === "다 먹음" ? (
        <span
          aria-hidden
          className="flex size-8 shrink-0 rotate-[-12deg] items-center justify-center rounded-full border-2 border-primary-600/70 text-[9px] leading-none font-black text-primary-700/85"
        >
          완독
        </span>
      ) : null}
      {picking ? (
        <span aria-hidden className="flex size-5 shrink-0">
          <Img
            src={picked ? "/assets/cart/check-on.svg" : "/assets/cart/check-off.svg"}
            className="size-full"
          />
        </span>
      ) : (
        /* 누르면 열린다 — 오른쪽 꺾쇠가 그 뜻이다 */
        <Img src="/assets/community/back.svg" alt="" className="h-[14px] w-[7px] shrink-0 rotate-180 opacity-40" />
      )}
    </button>
  );
}
