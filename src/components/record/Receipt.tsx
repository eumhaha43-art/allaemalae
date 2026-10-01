"use client";

import Img from "@/components/common/Img";
import StickerLayer from "@/components/record/StickerLayer";
import { receipt, fontOf, fonts, papers } from "@/data/common/record";
import { formatIssued } from "@/utils/receiptImage";
import type { FontId, Paper, ReceiptLine, Sticker } from "@/types/record";

/**
 * 영수증 — Figma 829:2595(민 것) · 855:3309(꾸민 것).
 *
 * 아래 끝이 톱니처럼 잘린 종이다. 그림 없이 그리려고 원뿔 그러데이션을 가로로
 * 반복해 톱니를 만든다 — 종이 색이 바뀌어도 톱니가 같이 따라온다.
 *
 * 용지는 따로 고른다 — 스티커를 붙였다고 종이색이 바뀌지는 않는다.
 *
 * 글자는 종이색과 가까우면 안 읽힌다 — 크래프트·패턴 용지와 사진 위에서 특히
 * 그렇다. 제목·값은 거의 검정으로 두고, 날짜와 가게 이름만 한 단계 흐리게
 * 둔다. 내보내는 그림(`@/utils/receiptImage`)의 색도 같이 맞춰야 한다.
 *
 * 글씨체는 종이 상자에 한 번만 걸어 안쪽 글자가 다 물려받게 한다 — 줄마다
 * 걸면 나중에 줄을 더할 때 빠뜨린다. 스티커는 그림이라 영향을 안 받는다.
 *
 * 손글씨체는 같은 글자라도 폭이 제각각이라, 지식 제목이 한 줄에 안 들어가는
 * 일이 생긴다. 제목 칸을 줄어들 수 있게 두어 넘치면 아래로 접히게 했다 —
 * 종이는 내용만큼 길어지므로 글자가 종이 밖으로 나가지 않는다.
 *
 * 글자 크기는 `--rf`(글꼴마다의 배율)를 곱해서 쓴다. 손글씨체는 글자 자리에
 * 견줘 획이 작게 들어가 있어, 같은 px 로 적으면 고르는 순간 확 작아 보인다.
 * 값 하나로 묶어 두면 종이·미리보기·뽑은 그림이 같이 따라온다.
 *
 * `small` 은 꾸미기 화면의 미리보기다. 220 은 큰 영수증(280)의 0.786 배이고,
 * 안쪽 글자·여백·톱니도 같은 비율로 줄여 두었다 — 폭만 늘리면 종이만 넓어지고
 * 글자는 그대로라 비어 보인다. 스티커 크기(`stickerSize`)도 같은 비율이다.
 */
export default function Receipt({
  stickers = [],
  paper = { kind: "plain" },
  font = "basic",
  lines,
  issued,
  small,
  editable,
  sample = true,
}: {
  stickers?: Sticker[];
  paper?: Paper;
  /** 고른 글씨체. 예전에 쌓아 둔 기록에는 없어서 기본으로 받는다. */
  font?: FontId;
  /** 장바구니에서 뽑아 온 줄. 없으면 디자인의 기본 영수증을 그린다. */
  lines?: ReceiptLine[];
  /**
   * 발행 시각(ISO). 서버에서는 비어 있고 브라우저에서 채워진다 — 그때까지는
   * 데이터 파일의 날짜를 그려 두어 hydration 이 어긋나지 않게 한다.
   */
  issued?: string;
  /** 꾸미기 화면의 미리보기는 작게 그린다 */
  small?: boolean;
  /** 붙인 스티커를 눌러 옮기고 뗄 수 있게 할 때 */
  editable?: boolean;
  /**
   * 뽑은 것이 없을 때 디자인의 예시 줄을 보일지. 오늘 막 가입한 사람에게는 끈다
   * — 장바구니는 비었는데 영수증에 지식 셋이 찍혀 있으면 앞뒤가 안 맞는다(감수
   * 지적). 그때는 빈 줄 하나로 「아직 없다」를 말한다.
   */
  sample?: boolean;
}) {
  // 장바구니에서 아직 뽑은 것이 없으면 디자인에 그려진 영수증을 그대로 보여준다.
  const bill = lines?.length ? lines : sample ? receipt.lines : [];

  const skin = papers[paper.kind];
  /** 톱니는 종이와 같은 색이어야 뜯긴 자리처럼 보인다. 사진 용지는 사진에 맞춰 잘라 낸다. */
  const zigzag = skin.tint;
  const dark = paper.kind === "photo";

  return (
    <div className={`relative mx-auto w-full transition-none ${small ? "max-w-[220px]" : "max-w-[280px]"}`}>
      <FontWarmer />
      {/*
        종이 밖으로 나간 스티커는 잘린다.

        뽑아 낸 그림(`@/utils/receiptImage`)이 종이만 담으므로, 미리보기에서만
        밖까지 보이면 저장하고 나서야 잘린 것을 알게 된다 — 보이는 대로 나오는
        편이 맞다. 손잡이도 함께 잘리지만, 스티커가 종이 안에 머물도록
        붙는 자리를 잡아 두었다(StickerLayer).
      */}
      <div
        className={`relative flex w-full flex-col overflow-hidden px-5 transition-none ${small ? "min-h-[290px] pt-5 pb-4" : "pt-7 pb-5"}`}
        style={{
          fontFamily: fontOf(font).stack,
          ["--rf" as string]: fontOf(font).scale,
          backgroundColor: skin.tint,
          backgroundImage:
            paper.kind === "photo" ? `url(${paper.src})` : (skin.pattern ?? undefined),
          backgroundSize: paper.kind === "photo" ? "cover" : skin.patternSize,
          backgroundPosition: "center",
        }}
      >
        {/* 사진 위에서는 글씨가 묻히므로 종이색을 한 겹 덮어 준다 */}
        {dark ? <span aria-hidden className="absolute inset-0 bg-white/72" /> : null}
        {/*
          꾸미기 미리보기(small)는 최소 높이를 둔다 — 손글씨체는 배율이 커서 제목이
          한 줄 더 접히는데, 글꼴을 누를 때마다 종이가 늘었다 줄었다 하면 아래
          서랍까지 출렁였다(기획 피드백). 남는 자리는 가게 이름 위로 간다(mt-auto).
        */}
        <div className="relative flex min-h-0 flex-1 flex-col">
        {/* 가게 이름 자리에 브랜드 마크가 들어간다 — 영수증 맨 위 */}
        <Img
          src="/assets/logo-wide.svg"
          alt={receipt.brand}
          className={`mx-auto block ${small ? "h-[18px] w-[81px]" : "h-[24px] w-[108px]"}`}
        />

        <p
          className={`w-full text-center text-gray-800 ${small ? "mt-[6px] text-[calc(8.5px*var(--rf,1))] leading-[14px]" : "mt-2 text-[calc(11px*var(--rf,1))] leading-[18px]"}`}
        >
          {formatIssued(issued || receipt.issued)}
        </p>

        <div className={small ? "mt-3" : "mt-4"}>

          <span className={`block w-full border-t border-dashed border-gray-400 ${small ? "my-[10px]" : "my-3"}`} />

          {bill.length ? (
            bill.map((line) => (
              <Row key={line.title} small={small} left={line.title} right={line.price} />
            ))
          ) : (
            <Row small={small} left={receipt.emptyLine} right="" muted />
          )}

          <span className={`block w-full border-t border-dashed border-gray-400 ${small ? "my-[10px]" : "my-3"}`} />

          <div className="flex w-full items-center justify-between">
            <span className={`font-medium text-gray-900 ${small ? "text-[calc(12.5px*var(--rf,1))] leading-[20px]" : "text-[calc(16px*var(--rf,1))] leading-[26px]"}`}>
              {receipt.totalLabel}
            </span>
            <span className={`font-bold text-gray-black ${small ? "text-[calc(14px*var(--rf,1))] leading-[20px]" : "text-[calc(18px*var(--rf,1))] leading-[26px]"}`}>
              {`${bill.length}코인`}
            </span>
          </div>

          <p className={`mt-auto w-full text-center text-gray-700 ${small ? "pt-[19px] text-[calc(8.5px*var(--rf,1))] leading-[14px]" : "pt-6 text-[calc(10px*var(--rf,1))] leading-[16px]"}`}>
            {receipt.shop}
          </p>
        </div>
        </div>

        {/* 붙인 스티커 — 종이 밖으로 걸친 자리는 잘린다 */}
        <StickerLayer stickers={stickers} small={small} editable={editable} />
      </div>

      {/* 톱니 — 원뿔 그러데이션을 반복해 종이를 뜯은 자리처럼 만든다 */}
      <div
        aria-hidden
        className={small ? "h-[8px] w-full" : "h-[10px] w-full"}
        style={{
          // 줄임 표기(background)와 낱개 표기를 섞으면 React 가 경고하고, 크기·반복이
          // 덮여 톱니가 안 그려진다. 낱개로만 준다.
          // 부채꼴 중심을 칸 아래에 두고 위쪽 90도를 칠하면, 꼭짓점이 아래로
          // 향한 톱니가 된다. 중심을 위에 두면 색이 칸 밖으로 나가 아무것도
          // 안 보인다.
          backgroundImage: `conic-gradient(from -45deg at 50% 100%, ${zigzag} 0 90deg, transparent 90deg 360deg)`,
          backgroundSize: small ? "12.5px 8px" : "16px 10px",
          backgroundRepeat: "repeat-x",
        }}
      />
    </div>
  );
}

/** 점선으로 이어지는 한 줄 — 왼쪽 제목, 오른쪽 값. */
function Row({
  left,
  right,
  small,
  muted,
}: {
  left: string;
  right: string;
  small?: boolean;
  muted?: boolean;
}) {
  return (
    <div className={`flex w-full items-baseline gap-1 ${small ? "py-[4px]" : "py-[6px]"}`}>
      {/*
        제목만 줄어들 수 있다(min-w-px). 값과 점선은 자리를 지키고, 자리가
        모자라면 제목이 아래로 접힌다 — 낱말 안에서 끊기지 않게 break-keep,
        낱말 하나가 통째로 길면 그때만 끊게 anywhere 를 같이 준다.
      */}
      <span
        className={`min-w-px break-keep [overflow-wrap:anywhere] ${small ? "text-[calc(8.5px*var(--rf,1))] leading-[14px]" : "text-[calc(11px*var(--rf,1))] leading-[18px]"} ${
          muted ? "text-gray-600" : "text-gray-900"
        }`}
      >
        {left}
      </span>
      <span aria-hidden className="min-w-[8px] flex-1 border-b border-dotted border-gray-400" />
      <span
        className={`shrink-0 ${small ? "text-[calc(8.5px*var(--rf,1))] leading-[14px]" : "text-[calc(11px*var(--rf,1))] leading-[18px]"} ${
          muted ? "text-gray-600" : "text-gray-black"
        }`}
      >
        {right}
      </span>
    </div>
  );
}

/** 직접 내주는 손글씨체 파일 — globals.css 의 @font-face 와 같은 넷(public/fonts). */
const FONT_FILES = [
  "/fonts/gamja-flower.woff2",
  "/fonts/east-sea-dokdo.woff2",
  "/fonts/nanum-pen-script.woff2",
  "/fonts/yeon-sung.woff2",
];

/**
 * 글꼴 데우기 — 영수증이 그려지는 순간 손글씨체 넷을 미리 받아 둔다.
 *
 * preload 는 이 화면에 들어서자마자 넷을 받기 시작하게 한다(React 19 가 <link>
 * 를 head 로 올린다) — 홈에는 영수증이 없어 홈 첫 로딩은 무겁지 않다. 보이지
 * 않는 「가」는 받은 글꼴을 실제로 쓰게 해서, 꾸미기에서 글꼴을 누르는 순간
 * 이미 와 있어 깜빡임 없이 바뀐다(기획 피드백). 전에는 CDN 이 한글을 조각으로
 * 내줘 「가」 조각만 데워지고 나머지는 누를 때 받았다(감수 지적) — 지금은 한
 * 파일이라 이 한 글자가 곧 전체다. 줄 높이는 글꼴과 상관없이 고정이라
 * (leading-[…px]) 종이 높이도 안 흔들린다.
 */
function FontWarmer() {
  return (
    <>
      {FONT_FILES.map((href) => (
        <link key={href} rel="preload" href={href} as="font" type="font/woff2" crossOrigin="anonymous" />
      ))}
      <span aria-hidden className="pointer-events-none absolute h-0 w-0 overflow-hidden opacity-0">
        {Object.values(fonts).map((one) => (
          <span key={one.label} style={{ fontFamily: one.stack }}>
            가
          </span>
        ))}
      </span>
    </>
  );
}
