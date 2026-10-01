"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Img from "@/components/common/Img";
import CartToggle from "@/components/home/CartToggle";
import { pick } from "@/data/common/home";
import type { PickCard } from "@/types/home";

/**
 * 점장님 Pick! — Figma 856:8053.
 *
 * 왼쪽 끝에 와 있는 카드가 240x310 으로 커지고 나머지는 210x270 으로
 * 내려간다 — 프레임도 맨 앞 카드가 큰 상태다.
 *
 * 넘기는 건 사용자 몫이다 — 가로로 밀면 왼쪽에 온 카드가 커진다. 손가락은
 * 그냥 쓸어 넘기면 되지만 PC 마우스로는 스크롤 상자를 끌 수 없어서, 마우스일
 * 때만 끌어서 미는 동작을 직접 붙였다. 놓으면 가장 가까운 카드로 붙는다.
 *
 * 끝에서 처음으로 돌아오는 무한 스크롤은 넣지 않았다. 커진 카드가 30px 더
 * 넓어서 줄 전체 위치가 같이 밀리는데, 그 상태로 「한 벌 뒤로 옮기기」를 하면
 * 옮길 자리를 잘못 잡는다. 무한으로 만들려면 크기 변화가 자리를 안 밀도록
 * 먼저 고쳐야 한다.
 *
 * 오른쪽 여백이 「화면 − 큰 카드 − 왼쪽 여백」인 이유: 그만큼 뒤가 비어야
 * 마지막 카드도 왼쪽 끝까지 올라와 커질 수 있다.
 *
 * 크기는 전환 없이 바로 바뀐다. width 에 transition 을 걸면 스크롤 도중의
 * 중간 폭이 다시 「어느 카드가 왼쪽이냐」 계산에 들어가 서로 물린다.
 */

/**
 * 끌기로 볼 만큼 움직인 거리.
 *
 * 이만큼 넘기 전에는 포인터를 잡지 않는다 — 누르자마자 잡으면 카드 안
 * 장바구니 단추를 눌러도 클릭이 그 단추가 아니라 이 스크롤 상자로 가서,
 * 담기가 아예 먹지 않는다(색이 안 바뀐다).
 */
const DRAG_SLOP = 4;

/** 카드를 왼쪽 끝에 세우는 데 필요한 scrollLeft. */
function stopFor(track: HTMLElement, index: number): number {
  const card = track.children[index] as HTMLElement;
  const first = track.firstElementChild as HTMLElement;
  return card.offsetLeft - first.offsetLeft;
}

/** 지금 왼쪽 끝에 가장 가까운 카드. */
function leading(track: HTMLElement): number {
  const first = track.firstElementChild as HTMLElement;
  const edge = track.scrollLeft + first.offsetLeft;
  let best = 0;
  let bestGap = Infinity;
  [...track.children].forEach((card, index) => {
    const gap = Math.abs((card as HTMLElement).offsetLeft - edge);
    if (gap < bestGap) {
      bestGap = gap;
      best = index;
    }
  });
  return best;
}

export default function PickBox() {
  const [active, setActive] = useState(0);
  /**
   * 마우스로 끄는 중일 때의 시작점. 터치는 브라우저에 맡긴다.
   *
   * `moved` 는 손이 `DRAG_SLOP` 을 넘었는지 — 넘기 전까지는 「누른 것」이라
   * 보고 아무것도 하지 않는다.
   */
  const drag = useRef<{ x: number; left: number; moved: boolean } | null>(null);
  const [dragging, setDragging] = useState(false);
  const track = useRef<HTMLDivElement>(null);

  /*
    세로 휠로도 한 장씩 넘긴다 — PC 목업은 스크롤바를 숨겨 두어 마우스로는 끌기
    말고 넘길 길이 없었다(사용자 지적). 카드 폭이 제각각(큰 카드 240 · 나머지 210)
    이라 「지금 앞에 선 카드의 이웃」으로 간다. 끝에 닿아 더 갈 데가 없으면 그냥
    두어 페이지가 내려가게 한다. React 의 onWheel 은 passive 라 막을 수 없어
    직접 단다.

    카드가 링크(a)라 브라우저가 링크 끌기를 먼저 시작해 우리 끌기가 끊겼다 —
    dragstart 를 막는다.
  */
  useEffect(() => {
    const el = track.current;
    if (!el) return;
    let turning = false;
    const wheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
      const max = el.scrollWidth - el.clientWidth;
      const dir = event.deltaY > 0 ? 1 : -1;
      if ((dir < 0 && el.scrollLeft <= 0) || (dir > 0 && el.scrollLeft >= max - 1)) return;
      event.preventDefault();
      if (turning) return;
      turning = true;
      const next = Math.max(0, Math.min(el.children.length - 1, leading(el) + dir));
      el.scrollTo({ left: stopFor(el, next), behavior: "smooth" });
      window.setTimeout(() => {
        turning = false;
      }, 400);
    };
    const dragstart = (event: DragEvent) => event.preventDefault();
    el.addEventListener("wheel", wheel, { passive: false });
    el.addEventListener("dragstart", dragstart);
    return () => {
      el.removeEventListener("wheel", wheel);
      el.removeEventListener("dragstart", dragstart);
    };
  }, []);

  const start = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse") return;
    // 자리만 적어 둔다. 포인터를 잡는 건 실제로 움직이기 시작한 뒤다.
    drag.current = { x: event.clientX, left: event.currentTarget.scrollLeft, moved: false };
  };

  const move = (event: React.PointerEvent<HTMLDivElement>) => {
    const from = drag.current;
    if (!from) return;

    // 누른 채로 상자 밖에서 놓아 시작점이 남은 경우 — 버튼을 뗐으면 없던 일로 한다
    if (event.buttons === 0) {
      drag.current = null;
      return;
    }

    const dx = event.clientX - from.x;
    if (!from.moved) {
      if (Math.abs(dx) < DRAG_SLOP) return;
      from.moved = true;
      setDragging(true);
      // 여기서부터는 상자 밖으로 나가도 계속 따라와야 한다
      event.currentTarget.setPointerCapture(event.pointerId);
    }
    event.currentTarget.scrollLeft = from.left - dx;
  };

  const end = (event: React.PointerEvent<HTMLDivElement>) => {
    const from = drag.current;
    if (!from) return;
    drag.current = null;
    // 끌지 않고 그냥 눌렀다 뗀 것 — 클릭은 카드 안 단추가 받는다
    if (!from.moved) return;

    setDragging(false);
    // 끄는 동안은 스냅을 꺼 두므로, 놓을 때 가까운 카드로 직접 붙여 준다.
    const track = event.currentTarget;
    track.scrollTo({ left: stopFor(track, leading(track)), behavior: "smooth" });
  };

  return (
    <section className="flex shrink-0 flex-col gap-5">
      <h2 className="mx-6 flex items-center gap-1 text-[22px] leading-[1.3] font-semibold">
        <span className="text-ink">{pick.title}</span>
        <span className="text-yellow-500">{pick.accent}</span>
      </h2>

      <div
        ref={track}
        onScroll={(event) => setActive(leading(event.currentTarget))}
        onPointerDown={start}
        onPointerMove={move}
        onPointerUp={end}
        onPointerCancel={end}
        className={`no-scrollbar flex h-[310px] scroll-pl-6 items-center gap-[10px] overflow-x-auto pl-6 pr-[calc(100%-264px)] ${
          dragging ? "cursor-grabbing snap-none select-none" : "cursor-grab snap-x snap-mandatory"
        }`}
      >
        {pick.cards.map((card, index) => (
          <Card key={card.id} card={card} big={index === active} />
        ))}
      </div>
    </section>
  );
}

/**
 * 카드 한 장. 장바구니가 그 안의 단추라 카드 자체는 button 이 아니다.
 *
 * 카드 전체를 덮는 투명한 링크가 그 지식의 카드뉴스 상세로 간다 — 분야 목록의
 * 지식 한 장과 같은 방식. 위 줄(알약 · 담기)만 그 위로 올려 담기가 따로 눌린다.
 * 트랙을 끌었을 때는 포인터를 트랙이 잡고 있어 링크에 클릭이 안 간다.
 *
 * 광고 카드(card.ad)는 위 줄 분야 알약 옆에 검은 「AD」 표, 그림 밑에 「광고 · 누구」
 * 줄이 붙어 다른 카드와 구별된다(사용자 요청 — 광고인 줄 알 수 있어야 한다).
 * 이름에도 「광고」를 넣어 읽어 준다.
 *
 * 아래 그림은 그 지식 카드뉴스의 첫 장(썸네일) — 프레임(856:8053)이 그렇다.
 * 큰 지식 콘텐츠는 사진, 작은 것(우유곽 · 냉장고 칸 · 이어보기)은 아이콘
 * (사용자 결정). 전에는 여기도 검은 상자에 아이콘을 놓았다. 위 줄과 아래 덩어리
 * 사이는 남는 자리(justify-between) — 그림이 카드 비율(354:218)대로 들어가면
 * 큰 카드 123 · 작은 카드 105 로 프레임 값이 그대로 나온다.
 */
function Card({ card, big }: { card: PickCard; big: boolean }) {
  return (
    <div
      style={{ backgroundColor: card.color }}
      className={`relative flex shrink-0 snap-start flex-col justify-between rounded-xl p-5 text-left ${
        big ? "h-[310px] w-[240px]" : "h-[270px] w-[210px] items-center"
      }`}
    >
      <Link
        href={`/menu/knowledge/${card.id}`}
        aria-label={card.ad ? `광고 — ${card.title.join(" ")}` : card.title.join(" ")}
        draggable={false}
        className="absolute inset-0 rounded-xl transition-opacity active:opacity-80"
      />

      <div className={`relative z-10 flex items-center justify-between ${big ? "w-full" : "w-[170px]"}`}>
        <span className="flex items-center gap-1">
          <span className="flex items-center justify-center rounded-[50px] bg-white px-2 py-1 text-xs leading-[1.2] font-medium text-gray-900">
            {card.tag}
          </span>
          {card.ad ? (
            <span className="flex items-center justify-center rounded-[4px] bg-gray-900/80 px-[5px] py-[3px] text-[10px] leading-none font-bold tracking-[0.5px] text-white">
              {pick.adBadge}
            </span>
          ) : null}
        </span>
        <CartToggle
          id={`home-card-${card.id}`}
          off={big ? "/assets/home/bag-on-yellow.svg" : "/assets/home/bag-white.svg"}
          on={big ? "/assets/home/bag-on-yellow-on.svg" : "/assets/home/bag-white-on.svg"}
          className={big ? "size-[18px]" : "h-[15px] w-[15.035px]"}
        />
      </div>

      <div className={`flex w-full flex-col gap-[10px] ${big ? "" : "items-center"}`}>
        <h3
          className={`flex h-11 w-full flex-col justify-center leading-[1.3] text-white ${
            big ? "text-lg font-semibold" : "text-base font-medium"
          }`}
        >
          {card.title.map((line) => (
            <span key={line}>{line}</span>
          ))}
        </h3>
        {/*
          카드뉴스 첫 장 파일 중 몇 장은 검은 테두리(2px)가 그림에 박혀 있다 — 상세에서는
          카드 테두리로 보여야 하지만 썸네일에서는 지저분하다(사용자 지적). 상자를
          넘치지 않게 잠그고 그림을 1.5% 키워 테두리만 밖으로 밀어낸다.
        */}
        <span
          className={`relative block w-full shrink-0 overflow-hidden ${big ? "rounded-[5px]" : "rounded-[4px]"}`}
          style={{ aspectRatio: "354 / 218" }}
        >
          <Img
            src={`/assets/knowledge/${card.id}/1.webp`}
            alt=""
            draggable={false}
            className="absolute inset-0 size-full scale-[1.015] object-cover"
          />
        </span>
        {card.ad ? (
          <span className={`text-[11px] leading-[1.3] text-white/80 ${big ? "" : "text-center"}`}>
            {pick.adBy(card.ad)}
          </span>
        ) : null}
      </div>
    </div>
  );
}
