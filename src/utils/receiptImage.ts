"use client";

/**
 * 영수증을 그림 한 장으로 뽑는다.
 *
 * 화면에 그려진 것을 그대로 찍는 방법(html2canvas 류)을 안 쓴 이유:
 *   - 글꼴을 CDN 에서 받아 쓰는데, 그 방식이 쓰는 SVG foreignObject 안에서는
 *     바깥 자원을 못 받아 와 한글이 시스템 글꼴로 바뀐다.
 *   - 스티커 · 용지 사진을 전부 data URL 로 다시 만들어 넣어야 한다.
 *   - 라이브러리를 하나 더 받아야 한다.
 * 캔버스에 직접 그리면 셋 다 없다 — 캔버스는 페이지가 이미 받아 둔 글꼴을
 * 그대로 쓰고, 같은 서버에서 온 그림은 바로 그릴 수 있다.
 *
 * 대신 `Receipt.tsx` 의 배치를 여기에 한 번 더 적는 셈이라, 한쪽을 고치면
 * 다른 쪽도 같이 봐야 한다. 아래 상수가 그 짝이다.
 */

import { fontOf, papers, receipt as fallback, stickerSize } from "@/data/common/record";
import type { Receipt } from "@/state/receiptStore";

/** 종이 폭 — 화면의 큰 영수증(max-w-[280px])과 같다. */
const PAPER_W = 280;
/** 종이 좌우 여백 — px-5 */
const PAD = 20;
/**
 * 종이 바깥 여백.
 *
 * 스티커는 종이 밖으로 6%까지 걸칠 수 있어서(StickerLayer) 딱 맞게 자르면
 * 걸친 부분이 잘려 나간다. 그만큼 둘레를 띄우고 바탕을 깐다.
 */
const MARGIN = 26;
/** 실제 픽셀은 이 배수로 그린다 — SNS 에 올려도 글자가 뭉개지지 않는다. */
const SCALE = 3;

/** 톱니 한 칸 — Receipt.tsx 의 backgroundSize 와 같다. */
const TOOTH = { w: 16, h: 10 };

/** 브랜드 마크 — 영수증 맨 위. 원래 비율 55.6 x 27.8 을 그대로 쓴다. */
const LOGO = { src: "/assets/logo-wide.svg", w: 108, h: 24 };

/** Receipt.tsx 의 글자색과 같아야 한다 — 한쪽만 고치면 뽑은 그림이 흐려진다. */
const INK = {
  date: "#383838",
  title: "#232323",
  price: "#0c0c0c",
  totalLabel: "#232323",
  total: "#0c0c0c",
  shop: "#535454",
  rule: "#b9baba",
  canvas: "#f5f8fa",
};

/**
 * 캔버스는 CSS 를 모른다 — 글꼴 이름을 직접 적어 준다.
 *
 * 화면에서 고른 글씨체 그대로 뽑아야 해서, 이름표를 받아 그 목록을 쓴다.
 * `fonts` 의 값이 CSS 변수가 아니라 글꼴 이름인 것도 여기서 쓰기 위해서다.
 */
const font = (weight: number, size: number, face: string) =>
  `${weight} ${size}px ${face}`;



/** 세로 리듬 — Receipt.tsx 의 여백 클래스를 픽셀로 옮긴 것. */
const Y = {
  padTop: 28,
  afterLogo: 8,
  dateH: 15,
  beforeList: 16,
  ruleGap: 12,
  rowH: 26,
  totalH: 24,
  beforeShop: 24,
  shopH: 13,
  padBottom: 20,
};

function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const image = new Image();
    // 같은 서버에서 오는 그림뿐이라 캔버스가 더러워지지 않는다.
    image.onload = () => resolve(image);
    image.onerror = () => resolve(null);
    image.src = src;
  });
}

/** 칸에 안 들어가는 제목은 뒤를 자르고 말줄임을 붙인다. */
function fit(context: CanvasRenderingContext2D, text: string, max: number): string {
  if (context.measureText(text).width <= max) return text;
  let cut = text;
  while (cut.length > 1 && context.measureText(`${cut}…`).width > max) cut = cut.slice(0, -1);
  return `${cut}…`;
}

/** 가운데 정렬 한 줄. */
function center(context: CanvasRenderingContext2D, text: string, x: number, y: number) {
  context.textAlign = "center";
  context.fillText(text, x, y);
  context.textAlign = "left";
}

/** 점선 · 파선 한 줄. */
function rule(
  context: CanvasRenderingContext2D,
  x1: number,
  x2: number,
  y: number,
  dash: number[],
) {
  context.save();
  context.strokeStyle = INK.rule;
  context.lineWidth = 1;
  context.setLineDash(dash);
  context.beginPath();
  context.moveTo(x1, y + 0.5);
  context.lineTo(x2, y + 0.5);
  context.stroke();
  context.restore();
}

/** 발행 시각 — 「2026.09.09 10:47」 */
export function formatIssued(iso: string): string {
  const at = new Date(iso);
  if (Number.isNaN(at.getTime())) return iso.slice(0, 10).replace(/-/g, ".");
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${at.getFullYear()}.${pad(at.getMonth() + 1)}.${pad(at.getDate())} ${pad(at.getHours())}:${pad(at.getMinutes())}`;
}

/**
 * 글자가 커진 만큼 줄 높이도 같이 키운다.
 *
 * 손글씨체는 배율을 곱해 크게 그리는데(fonts.scale), 줄 사이는 그대로 두면
 * 글자끼리 겹친다. 글자가 앉는 칸만 늘리고 로고·여백처럼 글자와 상관없는
 * 값은 그대로 둔다.
 */
const metrics = (scale: number) => ({
  ...Y,
  dateH: Y.dateH * scale,
  rowH: Y.rowH * scale,
  totalH: Y.totalH * scale,
  shopH: Y.shopH * scale,
});

/** 종이 높이를 미리 잰다 — 캔버스는 만들기 전에 크기를 알아야 한다. */
function paperHeight(rows: number, scale: number): number {
  const Y = metrics(scale);
  return (
    Y.padTop +
    LOGO.h +
    Y.afterLogo +
    Y.dateH +
    Y.beforeList +
    (Y.ruleGap * 2 + 1) +
    Y.rowH * rows +
    (Y.ruleGap * 2 + 1) +
    Y.totalH +
    Y.beforeShop +
    Y.shopH +
    Y.padBottom
  );
}

/**
 * 영수증 한 장을 PNG 로 만든다.
 *
 * 붙인 스티커 · 고른 용지 · 뽑은 지식이 화면에서 보이는 그대로 들어간다.
 */
export async function renderReceiptImage(state: Receipt): Promise<Blob> {
  /*
    글꼴이 아직 안 왔으면 캔버스가 시스템 글꼴로 그려 버린다.

    ready 만 기다리면 모자란다 — 아직 아무도 안 쓴 글꼴은 받기 시작조차 안 해서
    기다릴 것이 없다고 나온다. 고른 글씨체를 먼저 불러 놓고 기다린다.
  */
  try {
    await document.fonts.load(font(400, 16, fontOf(state.font).stack));
  } catch {
    // 이름을 못 알아들어도 아래 ready 로 넘어간다 — 대체 글꼴로라도 그린다.
  }
  await document.fonts.ready;

  const bill = state.lines.length ? state.lines : [...fallback.lines];
  const skin = papers[state.paper.kind];
  // 화면에서 고른 글씨체 그대로 뽑는다
  const face = fontOf(state.font).stack;
  const scale = fontOf(state.font).scale;
  // 이 아래의 Y 는 배율이 반영된 것이다 — 위쪽 상수 Y 를 가린다
  const Y = metrics(scale);

  const paperH = paperHeight(bill.length, scale);
  const width = PAPER_W + MARGIN * 2;
  const height = paperH + TOOTH.h + MARGIN * 2;

  const canvas = document.createElement("canvas");
  canvas.width = width * SCALE;
  canvas.height = height * SCALE;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("캔버스를 쓸 수 없어요");
  context.scale(SCALE, SCALE);
  context.textBaseline = "alphabetic";

  // 바탕 — 종이만 덩그러니 두면 톱니와 걸친 스티커가 어디까지인지 안 보인다
  context.fillStyle = INK.canvas;
  context.fillRect(0, 0, width, height);

  const left = MARGIN;
  const top = MARGIN;
  const inner = PAPER_W - PAD * 2;

  // 종이 그림자 — 붙여 놓은 종이처럼 살짝 떠 보이게
  context.save();
  context.shadowColor = "rgba(0,0,0,0.14)";
  context.shadowBlur = 14;
  context.shadowOffsetY = 5;
  context.fillStyle = skin.tint;
  context.fillRect(left, top, PAPER_W, paperH);
  context.restore();

  const photo =
    state.paper.kind === "photo" ? await loadImage(state.paper.src) : null;

  if (photo) {
    // background-size: cover — 짧은 쪽을 채우고 넘치는 쪽은 가운데를 남긴다
    context.save();
    context.beginPath();
    context.rect(left, top, PAPER_W, paperH);
    context.clip();
    const cover = Math.max(PAPER_W / photo.width, paperH / photo.height);
    const w = photo.width * cover;
    const h = photo.height * cover;
    context.drawImage(photo, left + (PAPER_W - w) / 2, top + (paperH - h) / 2, w, h);
    // 사진 위에서는 글씨가 묻히므로 종이색을 한 겹 덮는다 — 화면과 같은 72%
    context.fillStyle = "rgba(255,255,255,0.72)";
    context.fillRect(left, top, PAPER_W, paperH);
    context.restore();
  } else if (state.paper.kind === "pattern") {
    // 잔점 무늬 — 화면은 radial-gradient 를 14px 간격으로 반복한다
    context.fillStyle = "#d8cdb8";
    for (let y = top + 7; y < top + paperH; y += 14) {
      for (let x = left + 7; x < left + PAPER_W; x += 14) {
        context.beginPath();
        context.arc(x, y, 1, 0, Math.PI * 2);
        context.fill();
      }
    }
  }

  // ── 종이 위의 내용 ────────────────────────────────────────────────
  let y = top + Y.padTop;

  const logo = await loadImage(LOGO.src);
  if (logo) {
    context.drawImage(logo, left + (PAPER_W - LOGO.w) / 2, y, LOGO.w, LOGO.h);
  }
  y += LOGO.h + Y.afterLogo;

  context.fillStyle = INK.date;
  context.font = font(400, 11 * scale, face);
  center(context, formatIssued(state.issued || fallback.issued), left + PAPER_W / 2, y + 11 * scale);
  y += Y.dateH + Y.beforeList;

  y += Y.ruleGap;
  rule(context, left + PAD, left + PAPER_W - PAD, y, [4, 4]);
  y += 1 + Y.ruleGap;

  const rows = bill.map((line) => [line.title, line.price] as const);

  for (const [title, price] of rows) {
    const base = y + (6 + 11) * scale;
    context.font = font(400, 11 * scale, face);
    const priceW = context.measureText(price).width;
    const titleText = fit(context, title, inner - priceW - 16);
    const titleW = context.measureText(titleText).width;

    context.fillStyle = INK.title;
    context.fillText(titleText, left + PAD, base);
    context.fillStyle = INK.price;
    context.fillText(price, left + PAPER_W - PAD - priceW, base);
    // 사이를 잇는 점선 — 양쪽 글자에서 4씩 띄운다
    rule(context, left + PAD + titleW + 4, left + PAPER_W - PAD - priceW - 4, base - 3 * scale, [1, 3]);

    y += Y.rowH;
  }

  y += Y.ruleGap;
  rule(context, left + PAD, left + PAPER_W - PAD, y, [4, 4]);
  y += 1 + Y.ruleGap;

  const totalBase = y + 18 * scale;
  context.fillStyle = INK.totalLabel;
  context.font = font(500, 16 * scale, face);
  context.fillText(fallback.totalLabel, left + PAD, totalBase);
  context.fillStyle = INK.total;
  context.font = font(700, 18 * scale, face);
  const totalText = `${bill.length}코인`;
  context.fillText(
    totalText,
    left + PAPER_W - PAD - context.measureText(totalText).width,
    totalBase,
  );
  y += Y.totalH + Y.beforeShop;

  context.fillStyle = INK.shop;
  context.font = font(400, 10 * scale, face);
  center(context, fallback.shop, left + PAPER_W / 2, y + 10 * scale);

  // ── 톱니 ─────────────────────────────────────────────────────────
  context.fillStyle = skin.tint;
  for (let x = left; x < left + PAPER_W; x += TOOTH.w) {
    const right = Math.min(x + TOOTH.w, left + PAPER_W);
    context.beginPath();
    context.moveTo(x, top + paperH);
    context.lineTo(right, top + paperH);
    context.lineTo((x + right) / 2, top + paperH + TOOTH.h);
    context.closePath();
    context.fill();
  }

  // ── 스티커 ───────────────────────────────────────────────────────
  // 같은 그림을 여러 장 붙일 수 있으니 한 번씩만 받아 온다.
  const arts = [...new Set(state.stickers.map((one) => one.art))];
  const loaded = new Map<string, HTMLImageElement>();
  await Promise.all(
    arts.map(async (art) => {
      const image = await loadImage(art);
      if (image) loaded.set(art, image);
    }),
  );

  for (const sticker of state.stickers) {
    const image = loaded.get(sticker.art);
    if (!image) continue; // 한 장 못 받아 왔다고 영수증 전체를 버리지는 않는다
    // 자리는 종이 상자(톱니 제외) 기준의 % 다 — StickerLayer 와 같다.
    const cx = left + (sticker.left / 100) * PAPER_W;
    const cy = top + (sticker.top / 100) * paperH;
    const side = stickerSize.big * sticker.scale;

    context.save();
    context.translate(cx, cy);
    context.rotate((sticker.tilt * Math.PI) / 180);
    if (sticker.flipped) context.scale(-1, 1);
    // object-contain — 원래 비율을 지키며 정사각 칸 안에 넣는다
    const shrink = Math.min(side / image.width, side / image.height);
    const w = image.width * shrink;
    const h = image.height * shrink;
    context.drawImage(image, -w / 2, -h / 2, w, h);
    context.restore();
  }

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("그림을 만들지 못했어요"))),
      "image/png",
    );
  });
}
