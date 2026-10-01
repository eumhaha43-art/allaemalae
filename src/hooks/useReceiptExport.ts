"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { recordCopy } from "@/data/common/record";
import { renderReceiptImage } from "@/utils/receiptImage";
import { saveImage, type SaveMode, type SaveResult } from "@/utils/saveImage";
import type { Receipt } from "@/state/receiptStore";

/**
 * 영수증을 그림으로 뽑아 기기에 남긴다.
 *
 * 기록 홈의 「SNS 공유」·「핸드폰 저장」과 꾸미기 화면의 「저장 및 공유」가 모두
 * 여기를 거친다 — 같은 길을 타야 어디서 눌러도 같은 그림이 나온다.
 *
 * 가는 곳만 다르다. 공유는 공유 창으로, 저장은 PC 라면 다운로드 폴더로 · 손에
 * 드는 기기라면 공유 창(거기서 사진첩)으로 간다 — `saveImage` 가 가른다.
 *
 * 어디로 갔는지 한 줄로 알려 준다. 안 그러면 눌러도 아무 일도 안 난 줄 안다 —
 * 특히 공유 창은 앱 밖에서 뜬다.
 *
 * 그림은 영수증이 바뀔 때마다 미리 그려 둔다. 공유 창은 「사용자가 방금 눌러서
 * 여는 것」일 때만 열리는데, 누른 뒤에 그리기 시작하면 그 자격이 만료돼 사파리
 * 에서 창이 안 뜨고 그냥 내려받기로 떨어진다. 미리 그려 두면 누르는 즉시
 * 넘긴다.
 */

/** 알림 문구가 떠 있는 시간 */
const NOTE_MS = 4500;

/** 파일 이름은 아스키로 — 공유 창을 거치면 한글 이름이 깨지는 기기가 있다. */
function filename(issued: string): string {
  const at = new Date(issued);
  const when = Number.isNaN(at.getTime()) ? new Date() : at;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `receipt-${when.getFullYear()}${pad(when.getMonth() + 1)}${pad(when.getDate())}-${pad(when.getHours())}${pad(when.getMinutes())}.png`;
}

export function useReceiptExport(state: Receipt) {
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");
  const timer = useRef<number | null>(null);
  /** 미리 그려 둔 그림. 어느 영수증으로 그린 것인지 같이 들고 있어야 한다. */
  const ready = useRef<{ from: Receipt; blob: Blob } | null>(null);

  useEffect(
    () => () => {
      if (timer.current !== null) window.clearTimeout(timer.current);
    },
    [],
  );

  useEffect(() => {
    let stale = false;
    void renderReceiptImage(state)
      .then((blob) => {
        // 그리는 사이에 스티커를 또 붙였으면 이 그림은 이미 낡았다.
        if (!stale) ready.current = { from: state, blob };
      })
      // 미리 그리다 실패해도 조용히 둔다 — 누를 때 다시 그려 본다.
      .catch(() => {});
    return () => {
      stale = true;
    };
  }, [state]);

  const say = useCallback((text: string) => {
    setNote(text);
    if (timer.current !== null) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setNote(""), NOTE_MS);
  }, []);

  const run = useCallback(
    async (mode: SaveMode): Promise<SaveResult> => {
    setBusy(true);
    try {
      const kept = ready.current;
      const blob = kept?.from === state ? kept.blob : await renderReceiptImage(state);
      const result = await saveImage(
        blob,
        filename(state.issued),
        { title: recordCopy.shareTitle, text: recordCopy.shareText },
        mode,
      );
      // 공유 창을 그냥 닫은 것은 실패가 아니라 「안 하기로 했다」 — 말 걸지 않는다.
      if (result === "shared") {
        // 저장하려다 공유 창을 만난 것이면 사진첩까지 가는 길을 알려 준다.
        say(mode === "save" ? recordCopy.savedToPhone : recordCopy.sharedOk);
      } else if (result === "downloaded") say(recordCopy.savedToDisk);
      else if (result === "failed") say(recordCopy.saveFailed);
      return result;
    } catch {
      say(recordCopy.saveFailed);
      return "failed";
    } finally {
      setBusy(false);
    }
    },
    [state, say],
  );

  return { busy, note, run };
}
