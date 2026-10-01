"use client";

import Receipt from "@/components/record/Receipt";
import type { SavedRecord } from "@/types/record";

/**
 * 저장해 둔 영수증을 통째로 줄여 놓은 것 — 주간지식의 막대 한 칸.
 *
 * 줄 다섯 개로 흉내 낸 그림(`MiniReceipt`) 대신 진짜 영수증을 그린다. 그래야
 * 고른 용지와 붙인 스티커가 그대로 보여서 「내가 꾸민 그 영수증」으로 읽힌다.
 *
 * 줄이는 데 transform 이 아니라 zoom 을 쓴다. transform 은 자리를 그대로
 * 차지해서 줄인 만큼 빈 공간이 남고, 영수증 높이가 담긴 지식 수에 따라 달라져
 * 미리 계산해 둘 수도 없다. zoom 은 배치까지 같이 줄어서 높이가 저절로 맞는다.
 *
 * 미리보기(`small`)를 220 폭으로 그린 뒤 줄이므로 배율은 폭 나누기 220 이다.
 * 안쪽 폭을 220 으로 못 박아 두어야 부모 칸 너비에 휘둘리지 않는다.
 */

/** `Receipt` 의 `small` 이 그리는 폭 — 배율의 기준이다. */
const BASE_W = 220;

export default function ReceiptThumb({
  record,
  width,
}: {
  record: SavedRecord;
  /** 줄여서 놓을 폭(px) */
  width: number;
}) {
  return (
    <span
      aria-hidden
      className="block shrink-0"
      style={{ zoom: width / BASE_W, width: BASE_W }}
    >
      <Receipt
        small
        stickers={record.stickers}
        paper={record.paper}
        font={record.font}
        lines={record.lines}
        issued={record.issued}
      />
    </span>
  );
}
