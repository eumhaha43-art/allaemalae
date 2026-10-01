"use client";

/**
 * 만든 그림을 기기에 남긴다.
 *
 * 웹에서 사진첩에 바로 넣는 길은 없다. 대신 공유 시트(Web Share)로 넘기면 그
 * 안에 「이미지 저장」이 있어서 사진첩까지 간다 — 휴대폰에서 사진첩에 넣는
 * 유일한 방법이다.
 *
 * 그런데 공유 시트가 있느냐만 보고 고르면 안 된다. 윈도우 크롬·엣지도 파일
 * 공유를 지원해서, PC 에서 「핸드폰 저장」을 눌러도 윈도우 공유 창이 떠 버린다
 * — 그 창에는 「폴더에 저장」이 없어서 파일을 받을 길이 사라진다.
 *
 * 그래서 무엇을 누른 것인지와 어떤 기기인지를 같이 본다.
 *   - SNS 공유  : 공유 시트가 있으면 언제나 시트
 *   - 핸드폰 저장 : 손에 드는 기기에서만 시트, PC 에서는 내려받기
 */

export type SaveResult =
  /** 공유 시트로 넘겼다 */
  | "shared"
  /** 내려받았다 — PC 의 다운로드 폴더 */
  | "downloaded"
  /** 사용자가 공유 시트를 닫았다 */
  | "cancelled"
  | "failed";

export type SaveMode = "share" | "save";

/** 손에 드는 기기인지 — 사진첩이 있는 쪽. */
function handheld(): boolean {
  const hinted = (navigator as Navigator & { userAgentData?: { mobile?: boolean } })
    .userAgentData?.mobile;
  if (typeof hinted === "boolean") return hinted;
  // 사파리에는 userAgentData 가 없다 — 손가락으로 쓰는 기기인지로 가른다.
  return window.matchMedia("(hover: none) and (pointer: coarse)").matches;
}

function download(blob: Blob, filename: string): SaveResult {
  try {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.append(link);
    link.click();
    link.remove();
    // 바로 거두면 저장이 시작되기 전에 주소가 사라지는 브라우저가 있다.
    window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
    return "downloaded";
  } catch {
    return "failed";
  }
}

export async function saveImage(
  blob: Blob,
  filename: string,
  share: { title: string; text: string },
  mode: SaveMode,
): Promise<SaveResult> {
  const file = new File([blob], filename, { type: blob.type });
  const wantSheet = mode === "share" || handheld();

  // canShare 로 먼저 물어봐야 한다 — share 는 있는데 파일은 못 보내는 브라우저가 있다.
  if (wantSheet && navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: share.title, text: share.text });
      return "shared";
    } catch (error) {
      // 사용자가 시트를 닫은 것은 실패가 아니다.
      if (error instanceof DOMException && error.name === "AbortError") return "cancelled";
      // 시트가 뜨다 말았으면 내려받기로 되돌아간다.
      return download(blob, filename);
    }
  }

  return download(blob, filename);
}
