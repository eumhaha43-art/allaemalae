"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import Img from "@/components/common/Img";
import { ACTION_BTN, ACTION_ON } from "@/components/common/actionButton";
import RecordHeader from "@/components/record/RecordHeader";
import Receipt from "@/components/record/Receipt";
import PrintSheet from "@/components/record/PrintSheet";
import { saveRecord } from "@/state/archiveStore";
import {
  getStickers,
  getStickersServerSnapshot,
  subscribeStickers,
} from "@/state/stickerPackStore";
import {
  addSticker,
  clearStickers,
  getReceiptServerSnapshot,
  getReceiptSnapshot,
  restoreReceipt,
  setFont,
  setPaper,
  subscribeReceipt,
  type Receipt as ReceiptState,
} from "@/state/receiptStore";
import { decorate, fontPicks, fonts, papers } from "@/data/common/record";
import { usePersona } from "@/hooks/usePersona";
import { toThumbnail } from "@/utils/imageThumb";
import type { Paper } from "@/types/record";

/**
 * 영수증 꾸미기 — Figma node 829:2501.
 *
 * 아래 스티커를 누르면 영수증에 붙고, 붙은 스티커를 누르면 떨어진다. 끌어서
 * 옮기는 것은 아직 없어, 미리 잡아 둔 자리에 순서대로 놓는다 — 겹쳐서 뭐가
 * 붙었는지 안 보이는 것보다 낫다.
 *
 * 붙인 것은 그 자리에서 오늘 영수증에 적힌다(꾸미다 돌아와도 보여야 해서).
 * 나가는 길은 둘뿐이다 — 「기록 저장하기」가 곧 완료이고, 헤더 뒤로는 붙이던
 * 것을 버리고 나간다(들어올 때 모습으로 되돌린다). 전에는 「완료」가 따로
 * 있어서, 그걸 누른 사람은 기록에 들어간 줄 알았는데 안 들어가 있었다(사용자
 * 지적). 「초기화」는 한 번 묻고 나서 지운다 — 스티커 · 용지 · 글씨체가
 * 한꺼번에 날아가는 일이라.
 *
 * 한 화면에 다 들어가야 한다 — 스티커를 붙이다가 저장하러 스크롤을 내려야 하면
 * 붙이던 자리를 잃는다. 그래서 미리보기 · 탭 · 단추는 제 높이를 지키고, 남는
 * 자리를 스티커 서랍이 통째로 가져가 그 안에서만 넘겨본다. 화면이 짧은 기기
 * 에서는 서랍이 140 까지 줄어들고 더는 줄지 않는다.
 *
 * 「기록 저장하기」는 지금 꾸민 그대로를 보관함에 쌓고(주간지식·월간지식이
 * 그것을 읽는다) 프린터에서 뽑히는 장면을 띄운다. 파일로 내려받거나 공유하는
 * 것은 그 장면 안의 두 단추가 맡는다 — 저장한 것이 어디로 갔는지 눈으로 보고
 * 나서 고르는 편이 낫다.
 */
export default function DecoratePage() {
  const router = useRouter();
  const [tab, setTab] = useState<(typeof decorate.tabs)[number]>("기본");
  /** 뽑기에서 받은 스티커들 — 받은 것만 콜라보 맨 위에 NEW 로(한 판에 한 장) */
  const won = useSyncExternalStore(subscribeStickers, getStickers, getStickersServerSnapshot);
  const pack = won.length > 0;
  const fresh = pack && tab === "콜라보" ? won : [];
  const saved = useSyncExternalStore(
    subscribeReceipt,
    getReceiptSnapshot,
    getReceiptServerSnapshot,
  );
  const photoInput = useRef<HTMLInputElement>(null);
  /** 뽑히는 장면이 떠 있는지 */
  const [printing, setPrinting] = useState(false);
  /** 초기화 묻는 중 */
  const [resetting, setResetting] = useState(false);
  /** 오늘 막 가입한 사람 — 예시 영수증 줄을 보이지 않는다 */
  const newcomer = usePersona()?.fresh ?? false;

  /*
    들어올 때 모습 — 저장하지 않고 나가면 여기로 되돌린다.

    붙이는 것은 그 자리에서 적히므로, 「버리고 나가기」는 이 베낀 것을 도로
    적는 것이다. 저장하면 그 모습이 새 기준이 된다. 되돌리는 것은 화면이
    내려갈 때(뒤로 · 탭 바 · 브라우저 뒤로 어느 길이든) 한 번 한다.
  */
  const origin = useRef<ReceiptState | null>(null);
  useEffect(() => {
    origin.current = getReceiptSnapshot();
    return () => {
      if (origin.current) restoreReceipt(origin.current);
    };
  }, []);

  const keep = () => {
    saveRecord({
      id: saved.issued,
      issued: saved.issued,
      stickers: saved.stickers,
      paper: saved.paper,
      font: saved.font,
      lines: saved.lines,
    });
    // 저장한 모습이 이제 기준이다 — 이대로 나가도 되돌리지 않는다
    origin.current = getReceiptSnapshot();
    setPrinting(true);
  };

  /** 뒤로 — 붙이던 것을 버리고 나간다(되돌리기는 내려갈 때 한다). 주소로 바로 들어왔으면 기록으로. */
  const leave = () => {
    if (window.history.length > 1) router.back();
    else router.push("/record");
  };

  /** 꾸민 것이 하나라도 있어야 물을 것이 있다 — 빈 영수증에서 초기화는 그냥 아무 일도 없다. */
  const decorated =
    saved.stickers.length > 0 || saved.paper.kind !== "plain" || saved.font !== "basic";

  /**
   * 고른 사진을 용지로 쓴다. 올릴 곳이 없어 줄인 사진을 그대로 저장소에 넣으므로
   * 방 만들기와 같은 방식(toThumbnail)으로 용량을 줄인다.
   */
  const pickPhoto = async (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;
    const src = await toThumbnail(file, URL.createObjectURL(file));
    setPaper({ kind: "photo", src });
  };

  return (
    /*
      min-h-full — 화면만큼은 차지하되 넘치면 자란다. flex-1 · min-h-0 으로 높이를
      못 박았더니 320 × 640 에서 아래 단추 줄이 탭 바 밑으로 숨고 스크롤도 안
      됐다(감수 지적). 단추 줄은 sticky 라 넘쳐도 늘 바닥에 붙어 있다.
    */
    <main className="flex min-h-full flex-col bg-white">
      <RecordHeader title="영수증" onBack={leave} />

      <div className="flex w-full shrink-0 flex-col gap-1 px-6 pt-2">
        <h2 className="text-xl leading-[1.3] font-semibold text-ink">{decorate.title}</h2>
        <p className="text-xs leading-[1.3] text-gray-500">{decorate.sub}</p>
      </div>

      <div className="flex w-full shrink-0 flex-col items-center gap-[6px] px-6 py-4">
        <Receipt
          small
          editable
          stickers={saved.stickers}
          paper={saved.paper}
          font={saved.font}
          lines={saved.lines}
          issued={saved.issued}
          sample={!newcomer}
        />
        {/* 왜 잘렸는지 — 붙인 사람이 있을 때만 말한다. 빈 종이에는 할 말이 없다. */}
        {saved.stickers.length ? (
          <p className="w-full text-center text-[11px] leading-[1.3] text-gray-500">
            {decorate.clipNote}
          </p>
        ) : null}
      </div>

      {/*
        스티커 묶음 탭 — 폴더처럼 위쪽만 둥글다.

        고른 탭은 메인 초록으로 채운다. 회색 두 단계로만 갈랐더니 어느 쪽을 보고
        있는지 한눈에 안 들어왔다 — 서랍도 같은 회색이라 고른 탭이 서랍에 묻혔다.
      */}
      <div className="flex w-full shrink-0 items-end gap-1 px-6">
        {decorate.tabs.map((name) => {
          const on = name === tab;
          return (
            <button
              key={name}
              type="button"
              role="tab"
              aria-selected={on}
              onClick={() => setTab(name)}
              className={`tap [--tap-w:0px] flex min-w-px flex-1 items-center justify-center rounded-t-[10px] text-[13px] leading-[1.3] transition-colors ${
                on
                  ? "bg-primary-600 py-3 font-bold text-white"
                  : "bg-gray-100/60 py-[10px] font-medium text-gray-500"
              }`}
            >
              {name}
              {name === "콜라보" && pack ? (
                <span className="ml-1 rounded-full bg-live px-[5px] py-[1px] text-[8px] leading-none font-bold text-white">
                  {decorate.packBadge}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      {/* 스티커 서랍 — 남는 자리를 다 가져가고, 넘치면 여기서만 넘겨진다 */}
      <div className="min-h-[140px] w-full flex-1 overflow-y-auto overscroll-contain bg-gray-100 px-6 py-4">
        {tab === "용지/폰트" ? (
          <>
          <p className="mb-2 text-[11.5px] leading-[1.3] font-bold text-gray-500">
            {decorate.paperLabel}
          </p>
          <ul className="grid grid-cols-4 gap-[10px]">
            {(["plain", "kraft", "pattern"] as const).map((kind) => (
              <li key={kind}>
                <PaperChip
                  kind={kind}
                  on={saved.paper.kind === kind}
                  onPick={() => setPaper({ kind } as Paper)}
                />
              </li>
            ))}
            <li>
              <button
                type="button"
                onClick={() => photoInput.current?.click()}
                aria-label={decorate.photoPick}
                className={`tap [--tap-w:0px] flex aspect-square w-full flex-col items-center justify-center gap-1 rounded-[10px] border-2 bg-white transition-transform active:scale-95 ${
                  saved.paper.kind === "photo" ? "border-primary-600" : "border-transparent"
                }`}
              >
                <span aria-hidden className="text-lg leading-none text-gray-600">
                  ＋
                </span>
                <span className="text-[10px] leading-[1.2] text-gray-600">
                  {papers.photo.label}
                </span>
              </button>
              <input
                ref={photoInput}
                type="file"
                accept="image/*"
                hidden
                onChange={(event) => {
                  void pickPhoto(event.target.files);
                  event.target.value = "";
                }}
              />
            </li>
          </ul>

          {/*
            글꼴 — 용지 바로 아래. 칸마다 그 글씨체로 이름을 적어 두어, 고르기
            전에 어떤 글씨인지 보인다. 이름만 같은 글씨로 적어 두면 다 비슷해
            보인다.

            용지처럼 정사각으로 두면 서랍 밖으로 밀려 반쯤 잘린다. 글꼴 칸은
            무늬가 아니라 낱말 하나만 보이면 되므로 46 으로 눕힌다. 다섯이라
            한 줄에 다섯 칸으로 나누고 사이도 8 로 좁힌다.
          */}
          <p className="mt-4 mb-2 text-[11.5px] leading-[1.3] font-bold text-gray-500">
            {decorate.fontLabel}
          </p>
          <ul className="grid grid-cols-5 gap-2">
            {fontPicks.map((id) => {
              const on = saved.font === id;
              return (
                <li key={id}>
                  <button
                    type="button"
                    onClick={() => setFont(id)}
                    aria-pressed={on}
                    style={{ fontFamily: fonts[id].stack }}
                    className={`tap [--tap-w:0px] flex h-[46px] w-full items-center justify-center rounded-[10px] border-2 bg-white text-[12px] leading-[1.3] transition-transform active:scale-95 ${
                      on ? "border-primary-600 font-bold text-gray-black" : "border-transparent text-gray-600"
                    }`}
                  >
                    {fonts[id].label}
                  </button>
                </li>
              );
            })}
          </ul>
          </>
        ) : decorate.stickers[tab].length ? (
          <ul className="grid grid-cols-4 gap-[10px]">
            {/* 뽑기에서 받은 스티커팩 — 맨 위에, 작은 NEW 를 달고 */}
            {[...fresh, ...decorate.stickers[tab]].map((art) => (
              <li key={art} className="relative">
                <button
                  type="button"
                  onClick={() => addSticker(art)}
                  aria-label="스티커 붙이기"
                  className="tap [--tap-w:0px] flex aspect-square w-full items-center justify-center rounded-[10px] bg-white transition-transform active:scale-95"
                >
                  <Img src={art} className="size-12 object-contain" />
                </button>
                {fresh.includes(art) ? (
                  <span className="pointer-events-none absolute top-1 right-1 rounded-full bg-live px-[5px] py-[1px] text-[8px] leading-none font-bold text-white">
                    {decorate.packBadge}
                  </span>
                ) : null}
              </li>
            ))}
          </ul>
        ) : (
          <p className="py-12 text-center text-[13px] leading-[1.4] text-gray-500">
            {decorate.empty}
          </p>
        )}
      </div>

      <div className="sticky bottom-0 z-10 flex w-full shrink-0 gap-[10px] bg-white px-6 py-4">
        <button
          type="button"
          onClick={() => decorated && setResetting(true)}
          className={`${ACTION_BTN} min-w-px flex-1 border border-[#e5e5e5] bg-white text-gray-700 active:opacity-55`}
        >
          {decorate.reset}
        </button>
        <button
          type="button"
          onClick={keep}
          className={`${ACTION_BTN} ${ACTION_ON} min-w-px flex-[2]`}
        >
          {decorate.save}
        </button>
      </div>

      {printing ? <PrintSheet receipt={saved} onClose={() => setPrinting(false)} /> : null}

      <ConfirmDialog
        open={resetting}
        title={decorate.resetTitle}
        description={decorate.resetBody}
        confirmLabel={decorate.resetConfirm}
        cancelLabel={decorate.cancel}
        onConfirm={() => {
          clearStickers();
          setResetting(false);
        }}
        onCancel={() => setResetting(false)}
      />
    </main>
  );
}

/** 용지 한 칸 — 고른 것에는 초록 테두리가 붙는다. */
function PaperChip({
  kind,
  on,
  onPick,
}: {
  kind: "plain" | "kraft" | "pattern";
  on: boolean;
  onPick: () => void;
}) {
  const skin = papers[kind];
  return (
    <button
      type="button"
      onClick={onPick}
      aria-pressed={on}
      className={`tap [--tap-w:0px] flex aspect-square w-full flex-col items-center justify-end gap-1 overflow-hidden rounded-[10px] border-2 pb-1 transition-transform active:scale-95 ${
        on ? "border-primary-600" : "border-transparent"
      }`}
      style={{
        backgroundColor: skin.tint,
        backgroundImage: skin.pattern ?? undefined,
        backgroundSize: skin.patternSize,
      }}
    >
      <span className="rounded-[4px] bg-white/80 px-[6px] text-[10px] leading-[1.4] text-gray-700">
        {skin.label}
      </span>
    </button>
  );
}
