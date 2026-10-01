"use client";

import Link from "next/link";
import Img from "@/components/common/Img";
import { continueSection } from "@/data/common/home";
import { useContinue } from "@/hooks/useContinue";
import { useInView } from "@/hooks/useInView";
import { useNameFill } from "@/hooks/usePersona";
import type { ContinueItem } from "@/types/home";

/**
 * 남겨둔 지식 상품 — Figma 856:8122.
 *
 * 읽다 만 지식이 카드로 쌓이고, 아래 막대가 어디까지 읽었는지 보여준다.
 * 진행률은 데이터에서 오므로 막대는 이미지가 아니라 폭으로 그린다.
 *
 * 줄은 내 봉투의 「먹는 중」과 같은 것이다(useContinue) — 지식을 읽기 시작해
 * 먹는 중에 들어가면 여기에도 같이 뜬다(사용자 지시). 쓰던 사람(한상현)에게
 * 보이던 셋은 그 사람의 먹는 중 셋이라 전과 같이 나온다. 읽다 만 것이 하나도
 * 없으면 빈 상태다 — 오늘 막 가입한 사람이 여기서 시작한다.
 */
export default function ContinueSection() {
  const fill = useNameFill();
  const items = useContinue();
  /*
    막대는 이 자리가 화면에 들어올 때 0 에서 차오른다(기획 피드백 — 처음부터 차
    있어 정적이었다). 한 번만 움직이고, 움직임을 줄인 사람에게는 바로 최종값.
  */
  const [box, seen] = useInView<HTMLElement>();
  return (
    <section ref={box} className="mx-6 flex shrink-0 flex-col gap-5">
      <div className="flex w-full flex-col gap-1 leading-[1.3]">
        <h2 className="text-[22px] font-semibold text-ink">{continueSection.title}</h2>
        <p className="text-sm text-muted">{fill(continueSection.sub)}</p>
      </div>

      {items.length === 0 ? (
        <Empty />
      ) : (
        <ul className="flex w-full flex-col gap-[10px]">
          {items.map((item) => (
            <li key={item.id} className="w-full">
              <Row item={item} filled={seen} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

/**
 * 읽다 만 것이 없는 사람 — Figma 2095:2760. 닫힌 책과 말풍선 그림(106×108),
 * 20 아래 한 줄(16 Medium · gray-500), 그 밑에 메뉴로 보내는 단추.
 */
function Empty() {
  const copy = continueSection.empty;
  return (
    <div className="flex w-full flex-col items-center gap-5 rounded-[20px] border border-dashed border-gray-300 bg-white px-5 py-10 text-center">
      <Img src="/assets/home/continue-empty.svg" className="h-[108px] w-[106px]" />
      <p className="text-base leading-[1.3] font-medium text-gray-500">{copy.title}</p>
      <Link
        href="/menu"
        className="tap [--tap-w:0px] mt-3 flex h-9 items-center justify-center rounded-full bg-primary-600 px-4 text-xs leading-none font-medium text-white transition-opacity active:opacity-80"
      >
        {copy.go}
      </Link>
    </div>
  );
}

/**
 * 상자 안 그림 — 955:3266 / 965:5768 / 965:5782.
 *
 * 분류 그림이 기본인데, 주제 전용 그림이 있으면 그쪽이 더 잘 맞는다 —
 * 청바지 줄에 「생활」 달력이, 얼음 줄에 「자연」 잎사귀가 들어가 있어 무슨
 * 이야기인지 알 수 없었다. 청바지는 점장님 Pick 과 같은 파일을 쓰고, 높이만
 * 26 으로 맞춘다.
 *
 * 그림 색은 줄 색과 같은 계열로 간다 — 보라 줄에 보라 그림, 분홍 줄에 분홍
 * 그림. 원래 cat-* 세 개가 그렇게 짝지어져 있던 규칙이다.
 */
const ART: Record<ContinueItem["art"], { src: string; className: string }> = {
  lang: { src: "/assets/home/cat-lang.svg", className: "h-[26px] w-[32px]" },
  life: { src: "/assets/home/cat-life.svg", className: "h-[26px] w-[23px]" },
  jeans: { src: "/assets/home/pick-jeans.svg", className: "h-[26px] w-[20.8px]" },
  ice: { src: "/assets/home/ice-float.svg", className: "h-[26px] w-[32px]" },
  nature: { src: "/assets/home/cat-nature.svg", className: "h-[26px] w-[34px]" },
  // 아래 셋은 지식마다 그린 그림이 없어 메뉴의 분야 아이콘을 쓴다
  culture: { src: "/assets/menu/field-culture.svg", className: "size-[30px]" },
  history: { src: "/assets/menu/field-history.svg", className: "size-[30px]" },
  society: { src: "/assets/menu/field-society.svg", className: "size-[30px]" },
};

/** 한 줄 — 누르면 그 지식을 이어 본다(카드뉴스 상세). `filled` 가 켜지면 막대가 차오른다. */
function Row({ item, filled }: { item: ContinueItem; filled: boolean }) {
  return (
    <Link
      href={`/menu/knowledge/${item.id}`}
      style={{ backgroundColor: item.color }}
      className="flex h-[110px] w-full flex-col justify-center gap-[10px] rounded-[20px] p-5 text-left drop-shadow-[0_1px_1px_rgba(0,0,0,0.05)] transition-opacity active:opacity-80"
    >
      <div className="flex w-full items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-[56px] shrink-0 items-center justify-center rounded-[10px] bg-gray-black">
            <Img src={ART[item.art].src} className={ART[item.art].className} />
          </div>

          <div className="flex flex-col gap-1 text-white">
            <span className="flex items-start self-start rounded-[4px] bg-white/20 px-[6px] py-[2px] text-xs leading-[1.3]">
              {item.type}
            </span>
            <span className="text-sm leading-[1.3] font-medium">{item.title}</span>
            <span className="text-[10px] leading-none">{item.date}</span>
          </div>
        </div>

        <Img src="/assets/home/chevron-13.svg" className="h-5 w-[13px] shrink-0" />
      </div>

      <div className="flex w-full items-center justify-between px-[2px]">
        <div className="h-1 w-[260px] overflow-hidden rounded-full bg-white/40">
          <div
            className="h-full rounded-full bg-gray-black transition-[width] duration-700 ease-out motion-reduce:transition-none"
            style={{ width: `${filled ? item.progress : 0}%` }}
          />
        </div>
        <span className="text-center text-sm leading-[1.3] font-medium text-gray-black">
          {item.progress}%
        </span>
      </div>
    </Link>
  );
}
