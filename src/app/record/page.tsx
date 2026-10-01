"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PILL_OFF, PILL_ROW, PILL_TAB } from "@/components/common/pillTabs";
import { ACTION_BTN, ACTION_ON } from "@/components/common/actionButton";
import EmptyState from "@/components/common/EmptyState";
import Img from "@/components/common/Img";
import RecordHeader from "@/components/record/RecordHeader";
import Receipt from "@/components/record/Receipt";
import MonthlyGrid from "@/components/record/MonthlyGrid";
import PrintSheet from "@/components/record/PrintSheet";
import WeeklyBars from "@/components/record/WeeklyBars";
import { usePersona } from "@/hooks/usePersona";
import { useReceiptExport } from "@/hooks/useReceiptExport";
import { openCartTab } from "@/state/cartTabStore";
import { showToast } from "@/state/toastStore";
import { closeOverlay, openOverlay } from "@/state/overlayStore";
import {
  getArchiveServerSnapshot,
  getArchiveSnapshot,
  saveRecord,
  subscribeArchive,
} from "@/state/archiveStore";
import {
  getReceiptServerSnapshot,
  getReceiptSnapshot,
  subscribeReceipt,
} from "@/state/receiptStore";
import {
  clearRecordTab,
  getRecordTabServerSnapshot,
  getRecordTabSnapshot,
  subscribeRecordTab,
} from "@/state/recordTabStore";
import {
  tabs,
  recordCopy,
  emptyBy,
  receipt as sample,
} from "@/data/common/record";
import type { SavedRecord } from "@/types/record";

/**
 * 기록 — Figma 829:2595(민 영수증) · 855:3309(꾸민 영수증) · 556:3016(월간지식)
 * · 556:3186(주간지식).
 *
 * 영수증 탭은 오늘 것 한 장이고, 나머지 둘은 저장해 둔 것을 달력과 막대로
 * 되돌아본다. 기록에 넣는 길은 둘 — 여기서 「영수증 바로 뽑기」(꾸미지 않고
 * 그대로), 또는 꾸미기 화면의 「기록 저장하기」. 넣었는지는 보관함에 오늘
 * 영수증(발행 시각이 번호다)이 있는지로 안다 — 안내문과 단추가 그것을 따른다.
 * 전에는 꾸몄는지로 갈랐는데, 꾸미기만 하고 저장 안 한 사람에게 「캘린더에도
 * 보여요」라고 거짓말을 했다(사용자 지적).
 *
 * 월간·주간은 「지금」을 알아야 이번 달·이번 주에서 시작하는데, 그리는 중에
 * 시각을 만들면 서버가 그린 것과 어긋난다. 저장소가 주는 값을 쓰고, 서버에서는
 * 데이터 파일의 날짜로 버틴다.
 *
 * 바탕은 헤더와 같은 흰색이다 — 사용자 요청. 그래서 흰 바탕에 흰 단추를 두면
 * 사라진다. 초록 채운 단추가 아닌 것들은 회색으로 채우고 테두리를 한 단계
 * 진하게(gray-300) 잡아 두었다(`SECONDARY`).
 */

/**
 * 초록 단추가 아닌 나머지 — 흰 바탕에서도 덩어리로 보이게 회색을 채운다.
 *
 * 크기는 초록 단추와 같은 공용 값을 쓴다. 바로 위아래에 붙어 서므로 높이나
 * 글자가 다르면 둘이 다른 단추처럼 보인다. 색만 이 화면 것으로 덮는다.
 */
const SECONDARY = `${ACTION_BTN} w-full border border-gray-300 bg-gray-100 text-gray-700 active:opacity-55`;

/** 「더 담으러 가기」 — 주 동작이 아니라 글자만 있는 셋째 줄. 두 단추 밑에 조용히 선다. */
const MORE = `${ACTION_BTN} w-full text-gray-600 underline underline-offset-4 active:opacity-55`;

/*
  탭 줄의 점원 — 커뮤니티 탭(CommunityTabs)의 점원이 상자를 안고 있다면, 여기서는
  영수증 용지를 두 손으로 들고 있다(디자이너 조각 2090:2737 몸 · 2751 손 · 2755 용지
  펴짐 · 2757 용지 말림). 고른 칸이 곧 용지다 — 아래가 톱니로 뜯긴 초록 종이(106 × 39.7)
  위에 글자가 앉고, 점원 몸은 그 뒤에, 손은 윗변을 잡고 맨 앞에 선다.

  다른 탭을 누르면 용지가 손 밑으로 말리고(ROLL) → 점원이 그 칸으로 덜컥 옮겨 앉고
  (커뮤니티의 tab-clerk-jolt) → 다시 펴진다(UNROLL). 화면 내용은 옮겨 앉는 순간 바뀐다.
  움직임을 줄인 사람은 바로 바뀐다.
*/
const ROLL_MS = 150;
const SETTLE_MS = 110;
const UNROLL_MS = 180;
/** 말린 용지(106 × 6)를 펴진 용지 높이에 댄 비율 — 윗변을 축으로 이만큼 줄인다 */
const ROLLED = 6 / 39.737;
type Phase = "idle" | "roll" | "move" | "unroll";

export default function RecordPage() {
  const router = useRouter();
  /** 「더 담으러 가기」 — 냉장고의 다 먹음 탭으로. 거기서 골라 뽑으면 여기로 돌아온다. */
  const more = () => {
    openCartTab("다 먹음");
    router.push("/cart");
  };
  /**
   * 탭은 보통 여기서 고르지만, 뽑기 화면에서 「주간지식 보러가기」로 들어오면
   * 그쪽이 적어 둔 것이 이긴다. 직접 다른 탭을 누르면 적어 둔 것을 버린다.
   */
  const [chosen, setChosen] = useState<(typeof tabs)[number]>("영수증");
  const wanted = useSyncExternalStore(
    subscribeRecordTab,
    getRecordTabSnapshot,
    getRecordTabServerSnapshot,
  );
  const tab = wanted ?? chosen;
  /** 용지가 말리고 펴지는 중이면 어디까지 왔는지 — 그동안 다른 탭은 안 받는다 */
  const [phase, setPhase] = useState<Phase>("idle");
  const timer = useRef<number | null>(null);
  useEffect(
    () => () => {
      if (timer.current !== null) window.clearTimeout(timer.current);
    },
    [],
  );
  const pick = (name: (typeof tabs)[number]) => {
    if (name === tab || phase !== "idle") return;
    const land = () => {
      clearRecordTab();
      setChosen(name);
    };
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      land();
      return;
    }
    setPhase("roll");
    timer.current = window.setTimeout(() => {
      land();
      setPhase("move");
      timer.current = window.setTimeout(() => {
        setPhase("unroll");
        timer.current = window.setTimeout(() => setPhase("idle"), UNROLL_MS);
      }, SETTLE_MS);
    }, ROLL_MS);
  };
  const saved = useSyncExternalStore(
    subscribeReceipt,
    getReceiptSnapshot,
    getReceiptServerSnapshot,
  );
  const archive = useSyncExternalStore(
    subscribeArchive,
    getArchiveSnapshot,
    getArchiveServerSnapshot,
  );
  /** 달력에서 누른 날 — 그날 영수증을 크게 펼친다(556:3185). */
  const [opened, setOpened] = useState<SavedRecord[] | null>(null);
  /** 「바로 뽑기」로 뽑히는 장면이 떠 있는지 */
  const [printing, setPrinting] = useState(false);
  /** 꾸민 것으로 치는 기준 — 스티커를 붙였거나 용지를 바꿨거나. */
  const decorated = saved.stickers.length > 0 || saved.paper.kind !== "plain";
  /** 오늘 영수증이 보관함에 들어가 있는지 — 발행 시각이 곧 번호다. */
  const recorded = archive.records.some((one) => one.id === saved.issued);
  /*
    공유 — 헤더 오른쪽 위의 단추(사용자 지시). 전에는 영수증 밑에 「SNS 공유 · 핸드폰
    저장」 단추 둘과 어디로 갔는지 알려 주는 줄이 있었는데 뺐다. 어디로 갔는지는 그
    줄 대신 공용 토스트로 알린다.
  */
  const { busy, note, run } = useReceiptExport(saved);
  useEffect(() => {
    if (note) showToast(note);
  }, [note]);

  /** 꾸미지 않고 그대로 기록에 넣는다 — 꾸미기의 「기록 저장하기」와 같은 일 */
  const pull = () => {
    saveRecord({
      id: saved.issued,
      issued: saved.issued,
      stickers: saved.stickers,
      paper: saved.paper,
      font: saved.font,
      lines: saved.lines,
    });
    setPrinting(true);
  };
  const now = archive.now ? new Date(archive.now) : new Date(sample.issued);
  /** 오늘 막 가입한 사람 — 예시 영수증 줄을 보이지 않는다 */
  const fresh = usePersona()?.fresh ?? false;

  return (
    <main className="flex flex-1 flex-col bg-white">
      <RecordHeader
        title="영수증"
        action={
          <button
            type="button"
            aria-label={busy ? recordCopy.making : recordCopy.share}
            disabled={busy}
            onClick={() => void run("share")}
            className="tap [--tap-w:40px] flex text-gray-900 transition-opacity active:opacity-55 disabled:opacity-40"
          >
            <IconShare />
          </button>
        }
      />

      {/* flex-1 — 주간지식이 남는 세로를 받아 낮은 화면에서 제 키를 줄이게(WeeklyBars). 아래 여백은 탭 바 위로 넉넉히 */}
      {/* 위 여백은 점원 머리가 헤더 바로 밑에 들어갈 만큼 — 몸(44.4)이 용지 위로 38.4 솟는다. 점원 전엔 8. */}
      <div className="flex w-full flex-1 flex-col gap-5 px-6 pt-10 pb-8">
        <div role="tablist" className={`${PILL_ROW} w-full bg-gray-100`}>
          {tabs.map((name) => {
            const on = name === tab;
            /* 말린 상태 — 말리는 동안과, 옮겨 앉아 아직 안 편 동안 */
            const rolled = phase === "roll" || phase === "move";
            /* 움직이는 두 구간에만 전환을 건다 — 옮겨 앉는 순간(move)은 말린 채로 바로 그려야 한다 */
            const sliding = phase === "roll" || phase === "unroll";
            const clerkLayer = `tab-clerk pointer-events-none absolute left-1/2 ${
              phase === "move" || phase === "unroll" ? "tab-clerk-jolt" : ""
            }`;
            return (
              <button
                key={name}
                type="button"
                role="tab"
                aria-selected={on}
                onClick={() => pick(name)}
                className={`${PILL_TAB} relative min-w-px flex-1 ${
                  on ? "font-bold text-[#f1f1f1]" : `${PILL_OFF} text-tab-off`
                }`}
              >
                {on ? (
                  <>
                    {/*
                      점원 몸 — 용지 뒤. 팔 끝(44.4)이 용지 윗변에 닿게 42.4 위로. 용지 밑으로
                      들어가던 몸통은 디자이너가 잘랐다. 눈은 몸에서 떼어 커뮤니티 점원처럼
                      깜빡인다(clerk-blink) — 자리는 몸 그림 안의 눈 좌표 그대로(3.52 원).
                    */}
                    <span aria-hidden className={`${clerkLayer} z-0 -top-[42.4px] h-[44.44px] w-[52.47px]`}>
                      <Img src="/assets/record/tab/clerk.svg" className="absolute inset-0 size-full max-w-none" />
                      <Img
                        src="/assets/record/tab/clerk-eye.svg"
                        className="clerk-blink absolute size-[3.52px] max-w-none"
                        style={{ left: 17.36, top: 17.4 }}
                      />
                      <Img
                        src="/assets/record/tab/clerk-eye.svg"
                        className="clerk-blink absolute size-[3.52px] max-w-none"
                        style={{ left: 30.09, top: 17.4 }}
                      />
                    </span>
                    {/*
                      용지 — 알약 자리에 놓이고 톱니 끝(39.7)이 줄의 아래 여백(4)까지 내려온다.
                      손이 잡은 윗변을 축으로 말린다(scaleY).
                    */}
                    <Img
                      aria-hidden
                      src="/assets/record/tab/paper.svg"
                      className={`absolute inset-x-0 top-0 z-10 h-[39.74px] w-full max-w-none origin-top ${
                        sliding ? "transition-transform duration-150 ease-out" : ""
                      }`}
                      style={{ transform: `scaleY(${rolled ? ROLLED : 1})` }}
                    />
                    <span
                      className={`relative z-10 ${sliding ? "transition-opacity duration-150" : ""} ${
                        rolled ? "opacity-0" : ""
                      }`}
                    >
                      {name}
                    </span>
                    {/* 손 — 용지 윗변을 쥐고 맨 앞. 위로 3 걸쳐 종이를 잡은 것처럼 */}
                    <span aria-hidden className={`${clerkLayer} z-20 -top-[3px] h-[7.39px] w-[47.74px]`}>
                      <Img src="/assets/record/tab/hands.svg" className="size-full max-w-none" />
                    </span>
                  </>
                ) : (
                  name
                )}
              </button>
            );
          })}
        </div>

        {tab === "영수증" ? (
          <>
            <Receipt
              stickers={saved.stickers}
              paper={saved.paper}
              font={saved.font}
              lines={saved.lines}
              issued={saved.issued}
              sample={!fresh}
            />

            <p className="w-full text-center text-xs leading-[1.4] text-gray-500">
              {!recorded
                ? recordCopy.unsavedNote
                : decorated
                  ? recordCopy.savedDecoratedNote
                  : recordCopy.savedNote}
            </p>

            {recorded ? (
              /*
                단추 둘은 한 덩어리 — 「다시 꾸미기」와 「더 담으러 가기」. 전에 위에 있던
                SNS 공유 · 핸드폰 저장 단추와 저장 알림 줄은 뺐다(사용자 지시) — 공유 ·
                저장은 꾸미기 화면(PrintSheet)에서 한다.
              */
              <div className="flex w-full flex-col gap-2">
                <Link href="/record/decorate" className={SECONDARY}>
                  {decorated ? recordCopy.again : recordCopy.decorate}
                </Link>
                <button type="button" onClick={more} className={MORE}>
                  {recordCopy.more}
                </button>
              </div>
            ) : (
              /* 아직 기록에 안 넣은 영수증 — 꾸미러 가거나, 꾸미지 않고 그대로 뽑는다 */
              <>
                <Link
                  href="/record/decorate"
                  className={`${ACTION_BTN} ${ACTION_ON} w-full`}
                >
                  {recordCopy.decorate}
                </Link>
                <button type="button" onClick={pull} className={SECONDARY}>
                  {recordCopy.pull}
                </button>
                <button type="button" onClick={more} className={MORE}>
                  {recordCopy.more}
                </button>
              </>
            )}
          </>
        ) : archive.records.length === 0 ? (
          /* 기록이 없으면 — 수첩 그림(1968:7144)을 남는 자리 한가운데에. 막 가입한 사람이 여기다 */
          <EmptyState icon="/assets/record/empty.svg" text={emptyBy[tab]} />
        ) : tab === "월간지식" ? (
          <MonthlyGrid
            records={archive.records}
            now={now}
            onPick={(_, of) => setOpened(of)}
          />
        ) : (
          <WeeklyBars
            records={archive.records}
            now={now}
            onPick={(_, of) => setOpened(of)}
          />
        )}
      </div>

      {opened ? <DayView of={opened} onClose={() => setOpened(null)} /> : null}

      {/* 「바로 뽑기」 — 여기가 곧 기록 화면이라 「주간지식 보러가기」는 덮개만 걷고 탭만 바꾼다 */}
      {printing ? (
        <PrintSheet
          receipt={saved}
          onClose={() => setPrinting(false)}
          onGo={() => setPrinting(false)}
        />
      ) : null}
    </main>
  );
}

/**
 * 달력에서 누른 날의 영수증 — 556:3185 「날짜를 누르면 그날 영수증이 크게
 * 열려요」. 하루에 여러 장 저장한 날은 위에서부터 차례로 쌓아 보여 준다.
 */
function DayView({ of, onClose }: { of: SavedRecord[]; onClose: () => void }) {
  // 떠 있는 동안에는 탭 바를 내린다 — 덮개 밑으로 비쳐 보이고 눌리기까지 했다(감수 지적)
  useEffect(() => {
    openOverlay();
    return closeOverlay;
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div
      className="no-scrollbar fixed inset-0 z-50 mx-auto flex w-full max-w-screen flex-col items-center overflow-y-auto bg-black/80 px-6 py-8"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="그날의 영수증"
        onClick={(event) => event.stopPropagation()}
        className="flex w-full flex-col items-center gap-6"
      >
        <div className="flex w-full items-start justify-end">
          <button
            type="button"
            aria-label="닫기"
            onClick={onClose}
            className="tap flex size-6 items-center justify-center text-white/80 transition-opacity active:opacity-55"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              aria-hidden
              fill="none"
            >
              <path
                d="M2 2l12 12M14 2L2 14"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        {of.map((one, at) => (
          <div key={one.id} className="flex w-full flex-col items-center gap-2">
            {/* 하루에 여러 장이면 몇 번째인지 — 같은 날 영수증이 줄지어 있을 때 길잡이 */}
            {of.length > 1 ? (
              <span className="text-xs leading-none font-medium text-white/70">
                {at + 1} / {of.length}
              </span>
            ) : null}
            <Receipt
              stickers={one.stickers}
              paper={one.paper}
              font={one.font}
              lines={one.lines}
              issued={one.issued}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

/** 공유 — 점 셋을 선으로 이은 공유 표시. 헤더의 종(22)과 같은 크기 */
function IconShare() {
  return (
    <svg width="22" height="22" viewBox="0 0 18 18" aria-hidden fill="none">
      <circle
        cx="13.7"
        cy="3.8"
        r="2.3"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <circle cx="4.3" cy="9" r="2.3" stroke="currentColor" strokeWidth="1.4" />
      <circle
        cx="13.7"
        cy="14.2"
        r="2.3"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <path
        d="M6.35 7.85 11.65 4.95M6.35 10.15l5.3 2.9"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}
