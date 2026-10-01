"use client";

import { useEffect, useState } from "react";
import Img from "@/components/common/Img";
import { renderReceiptImage } from "@/utils/receiptImage";
import type { SavedRecord } from "@/types/record";

/**
 * 저장해 둔 영수증을 그림 한 장으로 줄여 놓은 것 — 주간지식의 막대 한 칸.
 *
 * 전에는 진짜 영수증(`Receipt`)을 그대로 그린 뒤 CSS `zoom` 으로 줄였다
 * (`ReceiptThumb`). 그런데 기기 · 브라우저에 따라 `zoom` 안의 글자와 스티커가
 * 어긋나 깨져 보였다(사용자 지적). 그래서 SNS 공유 · 저장이 쓰는 그리기
 * (`renderReceiptImage`)로 영수증을 PNG 한 장으로 뽑아 `<img>` 로 둔다 — 그림은
 * 어디서나 같은 얼굴이고, 고른 용지 · 붙인 스티커 · 담은 지식 수에 따른 길이도
 * 공유 그림과 똑같이 남는다.
 *
 * 저장하는 순간이 아니라 **처음 그릴 때** 만든다. 보관함은 localStorage 에
 * 있고(archiveStore) 그림은 한 장에 수백 KB 라, 저장할 때 같이 넣으면 열댓 장에
 * 한도(5MB)가 찬다. 대신 한 번 만든 것은 이 판(page load)이 사는 동안 기억해
 * 두어(cache) 주를 넘겼다 돌아와도 다시 그리지 않는다. 시연용 더미 영수증
 * (seedArchive)도 같은 길로 그림이 된다.
 *
 * 열쇠는 id 만이 아니라 생김새 전부다 — 같은 영수증을 다시 꾸며 저장하면 id 는
 * 그대로인데 얼굴이 바뀐다.
 *
 * 공유 그림에는 종이 둘레에 바탕색 여백(MARGIN)이 있다 — 걸친 스티커가 잘리지
 * 않게 둔 것. 막대에서는 종이만 보여야 하므로 그 여백을 오려 낸다. 여백 폭은
 * 그림 전체 폭에서 종이 폭(PAPER_W × SCALE)을 빼면 나온다 — receiptImage.ts 의
 * 그 두 값과 같아야 하고, 한쪽을 고치면 여기도 같이 본다.
 *
 * 그림이 오기 전에는 같은 폭의 옅은 자리를 두어(placeholder) 칸이 비어 보이지
 * 않게 한다 — 글꼴이 이미 와 있으면 한 장에 수십 ms 라 눈에 잘 띄지 않는다.
 */

/** receiptImage.ts 의 PAPER_W · SCALE 과 같아야 한다 — 종이만 오려 내는 기준. */
const PAPER_W = 280;
const SCALE = 3;

/** 그림이 오기 전 자리의 세로 비율 — 지식 셋 담긴 기본 영수증의 폭 대비 높이쯤. */
const PLACEHOLDER_RATIO = 1.35;

/** 한 번 만든 그림 — 생김새 열쇠 → data URL. 이 판이 사는 동안만. */
const cache = new Map<string, Promise<string>>();

/** 얼굴을 정하는 것 전부 — 하나라도 다르면 다른 그림이다. */
function keyOf(record: SavedRecord): string {
  return JSON.stringify([
    record.id,
    record.issued,
    record.paper,
    record.font ?? "basic",
    record.stickers,
    record.lines,
  ]);
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("영수증 그림을 못 읽었어요"));
    image.src = url;
  });
}

/** 공유 그림을 뽑아 종이만 오려 낸 data URL. */
async function thumbOf(record: SavedRecord): Promise<string> {
  const blob = await renderReceiptImage({ ...record, font: record.font ?? "basic" });
  const url = URL.createObjectURL(blob);
  try {
    const image = await loadImage(url);
    const margin = Math.max(0, Math.round((image.naturalWidth - PAPER_W * SCALE) / 2));
    const width = image.naturalWidth - margin * 2;
    const height = image.naturalHeight - margin * 2;

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("캔버스를 쓸 수 없어요");
    context.drawImage(image, margin, margin, width, height, 0, 0, width, height);
    return canvas.toDataURL("image/png");
  } finally {
    URL.revokeObjectURL(url);
  }
}

function thumbFor(record: SavedRecord): Promise<string> {
  const key = keyOf(record);
  let pending = cache.get(key);
  if (!pending) {
    pending = thumbOf(record);
    // 못 그린 것은 기억하지 않는다 — 다음에 다시 시도한다
    pending.catch(() => cache.delete(key));
    cache.set(key, pending);
  }
  return pending;
}

export default function ReceiptThumbImage({
  record,
  width,
}: {
  record: SavedRecord;
  /** 줄여서 놓을 폭(px) */
  width: number;
}) {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    thumbFor(record).then(
      (url) => {
        if (alive) setSrc(url);
      },
      () => {
        // 못 그렸으면 자리만 남는다 — 누르면 그날 영수증은 그대로 열린다
      },
    );
    return () => {
      alive = false;
    };
  }, [record]);

  if (!src) {
    return (
      <span
        aria-hidden
        style={{ width, height: Math.round(width * PLACEHOLDER_RATIO) }}
        className="block shrink-0 rounded-[2px] bg-[#f3f3f3]"
      />
    );
  }

  return (
    <Img
      src={src}
      aria-hidden
      draggable={false}
      style={{ width, height: "auto" }}
      className="block shrink-0 select-none"
    />
  );
}
