"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import Img from "@/components/common/Img";
import GroundsSheet from "@/components/debate/GroundsSheet";
import IosKeyboard from "@/components/keyboard/IosKeyboard";
import { KeyboardSpacer, keepFocus, useTypingField } from "@/hooks/useIosKeyboard";
import type { Debate, Side } from "@/data/common/debate";
import {
  getGroundsServerSnapshot,
  getGroundsSnapshot,
  groundsFor,
  takeFreshGround,
  subscribeGrounds,
} from "@/state/groundStore";

/** How far back each line of the ticker sits — Figma 805:3660 … 805:3669. */
const DEPTHS = [
  { bg: "bg-black/36", text: "text-gray-400", fade: "opacity-42" },
  { bg: "bg-black/41", text: "text-gray-300", fade: "opacity-62" },
  { bg: "bg-black/46", text: "text-gray-200", fade: "opacity-82" },
  { bg: "bg-black/50", text: "text-white", fade: "" },
];

/** Drag this far down and letting go closes the sheet instead of snapping back. */
const DISMISS_AT = 90;

/** 「11:05:30」 → 「11시간 5분」. 데이터는 시:분:초인데 그대로 적으면 시각으로 읽힌다(감수 지적). */
function spell(clock: string): string {
  const [h = 0, m = 0] = clock.split(":").map(Number);
  return h > 0 ? `${h}시간 ${m}분` : `${m}분`;
}

/** Snap-back and slide-out; the way in is the `sheet-enter` keyframe. */
const SHEET_MOTION =
  "transition-transform duration-[240ms] ease-out motion-reduce:transition-none";

/**
 * 토론방 상세 — Figma node 805:3605, with the 근거 팝업 (805:3731) as the same
 * screen with its sheet pulled up.
 *
 * The room sits on a photo, so it hides the tab bar and paints the status bar
 * dark through `isDarkStatusRoute`.
 */
export default function DebateRoom({ debate }: { debate: Debate }) {
  const router = useRouter();
  /**
   * "entering" runs the keyframe, "open" hands control back to transitions,
   * and "closing" keeps the sheet mounted while it slides out.
   */
  const [sheet, setSheet] = useState<"closed" | "entering" | "open" | "closing">("closed");
  /** Pixels dragged down, or null while nobody is holding the sheet. */
  const [drag, setDrag] = useState<number | null>(null);
  const from = useRef(0);
  const [side, setSide] = useState<Side | "all">("all");
  /** Which option is yours — the design opens with B outlined. */
  const [vote, setVote] = useState<Side>("B");
  const opinion = useTypingField();
  const input = useRef<HTMLInputElement>(null);
  /** 화면에 떠 있는 말들 — 뒤에서부터 DEPTHS 개만 남긴다. */
  const [lines, setLines] = useState(debate.chatter);
  /** 다음에 올라올 말과, 번호를 매기는 숫자. 그리는 중에 시각·난수를 쓰지 않으려고 둔다. */
  const tick = useRef(0);

  /**
   * 라이브처럼 계속 말이 올라온다.
   *
   * 준비해 둔 말을 돌려 쓴다 — 끝나면 처음으로 돌아간다. 번호는 순서대로
   * 매겨서, 같은 말이 다시 나와도 새 줄로 들어오며 애니메이션이 돈다.
   */
  useEffect(() => {
    const timer = window.setInterval(() => {
      // 번호는 바깥에서 매긴다 — 안에서 매기면 React 가 이 함수를 두 번 불러 볼 때
      // 두 칸씩 건너뛰어, 준비해 둔 말이 한 줄씩 빠진다.
      const next = debate.incoming[tick.current % debate.incoming.length];
      tick.current += 1;
      const said = { ...next, id: `live-${tick.current}` };
      setLines((now) => [...now, said].slice(-DEPTHS.length));
    }, 3200);
    return () => window.clearInterval(timer);
  }, [debate.incoming]);

  /** 내가 쓴 말도 같은 티커에 올린다. */
  const say = (text: string) => {
    const said = text.trim();
    if (!said) return;
    tick.current += 1;
    const mine = { id: `me-${tick.current}`, author: "나", text: said };
    setLines((now) => [...now, mine].slice(-DEPTHS.length));
  };

  /**
   * 이 화면은 딱 한 뼘이라 키보드가 올라오면 화면 아래에 자리를 만들고 거기까지
   * 내려간다 — 아이폰이 하는 것과 같다. 입력바가 키보드 바로 위에 서고, 위쪽
   * LIVE 바는 화면 밖으로 밀려난다.
   */
  useEffect(() => {
    if (!opinion.open) return;
    const scroller = input.current?.closest<HTMLElement>("[data-scroll-area]");
    scroller?.scrollTo({ top: scroller.scrollHeight });
  }, [opinion.open]);

  const open = sheet !== "closed";
  const dragging = drag !== null;
  const written = useSyncExternalStore(
    subscribeGrounds,
    getGroundsSnapshot,
    getGroundsServerSnapshot,
  );
  /*
    접힌 카드에 보이는 한 줄 — 내가 방금 단 근거가 있으면 그것, 없으면 가장
    공감받은 씨앗 근거. 등록하고 돌아왔는데 카드가 그대로면 등록이 된 건지
    모른다.
  */
  const mine = groundsFor(written, debate.id);
  const latestMine = mine[mine.length - 1];
  const top = latestMine ? { ...latestMine, rank: 1 } : debate.grounds[0];

  // 근거 달기에서 막 돌아왔으면 한 박자 뒤 팝업을 열어 방금 단 것을 보여 준다
  // — 방이 먼저 보이고 그 위로 올라와야 「등록돼서 올라왔다」로 읽힌다
  useEffect(() => {
    const id = window.setTimeout(() => {
      if (takeFreshGround(debate.id)) setSheet("entering");
    }, 350);
    return () => window.clearTimeout(id);
  }, [debate.id]);
  /*
    접힌 카드의 「+N 더보기」. 팝업 머리의 개수와 같은 셈을 써야 한다 —
    눌러서 열었더니 숫자가 달라져 있으면 둘 중 하나가 거짓말이 된다.
  */
  const groundCount = debate.groundCount + groundsFor(written, debate.id).length;
  const summary = debate.options
    .map((option) => `${option.side} ${option.label} ${option.percent}%`)
    .join("   ·   ");

  const grab = {
    onPointerDown: (event: React.PointerEvent<HTMLDivElement>) => {
      if (sheet === "closing") return;
      // Grabbing mid-slide takes over from the keyframe.
      if (sheet === "entering") setSheet("open");
      from.current = event.clientY;
      setDrag(0);
      event.currentTarget.setPointerCapture(event.pointerId);
    },
    onPointerMove: (event: React.PointerEvent<HTMLDivElement>) => {
      if (drag === null) return;
      setDrag(Math.max(0, event.clientY - from.current));
    },
    onPointerUp: () => {
      if (drag !== null && drag > DISMISS_AT) setSheet("closing");
      setDrag(null);
    },
    onPointerCancel: () => setDrag(null),
  };

  return (
    <>
    {/*
      shrink-0 — overflow-hidden 인 플렉스 아이템은 내용보다 작게 눌린다. 그대로
      두면 키보드 자리비움이 눌려 사라져서 입력바가 키보드 뒤로 들어간다.
    */}
    <main className="relative flex min-h-full w-full shrink-0 flex-col overflow-hidden bg-black">
      {/* 방마다 제 사진 — 없으면 편의점 진열대 */}
      <Img
        src={debate.background ?? "/assets/debate/stage.png"}
        className="absolute inset-0 size-full object-cover"
      />
      {/*
        Tapping the dimmed photo closes the sheet — the design draws no X for
        it. It sits above the topic and the spacer so the whole dark area is
        the target, and below the top bar and the sheet so those still work.
      */}
      {open ? (
        <button
          type="button"
          aria-label="근거 닫기"
          onClick={() => setSheet("closing")}
          className={`absolute inset-0 z-10 bg-black/55 transition-opacity duration-[240ms] motion-reduce:transition-none ${
            // On the way out it stops taking taps, so a missed transitionend
            // cannot leave an invisible sheet swallowing them.
            sheet === "closing"
              ? "pointer-events-none opacity-0"
              : "animate-[fade-in_240ms_ease-out]"
          }`}
        />
      ) : (
        /* 사진 위에 흰 글씨와 흰 카드가 얹히므로 사진을 눌러 둔다 — 위쪽은
           살짝, 아래로 갈수록 짙게. */
        <div className="absolute inset-0 bg-gradient-to-b from-black/52 via-black/72 to-black/92" />
      )}

      {/* 상단 바 — 805:3618 */}
      <div className="relative z-20 flex h-[50px] w-full shrink-0 items-center justify-between px-5">
        <div className="flex items-center gap-[10px]">
          <span className="flex items-center gap-[6px] rounded-[14px] bg-[#1a1c1c] py-[6px] pr-3 pl-[11px]">
            <Img src="/assets/debate/live-dot.svg" className="live-blink size-2" />
            <span className="text-[11px] leading-[1.4] font-bold text-white">토론 LIVE</span>
          </span>
          <span className="text-[11.5px] leading-[1.4] font-medium text-white">
            {debate.members}명 참여 중
          </span>
        </div>
        <div className="flex items-center gap-[14px]">
          <button type="button" aria-label="더보기" className="tap [--tap-w:36px] flex">
            <Img src="/assets/debate/more.svg" className="h-[23.6px] w-[22.8px]" />
          </button>
          <button
            type="button"
            aria-label="닫기"
            // 뒤로가 아니라 목록이다 — 알림이나 검색으로 바로 들어오면 뒤에 목록이 없다.
            onClick={() => router.push("/community/debate")}
            className="tap [--tap-w:36px] flex"
          >
            <Img src="/assets/debate/close.svg" className="size-6" />
          </button>
        </div>
      </div>

      {open ? (
        <>
          {/* 주제 — 805:3748. Reads above the dim, but taps fall through to it. */}
          <div className="pointer-events-none relative z-20 flex w-full shrink-0 flex-col items-start px-6 py-[22px] text-white">
            <h1 className="text-[20px] leading-[1.4] font-bold opacity-90">{debate.topic}</h1>
            <p className="text-xs leading-4 tracking-[-0.24px] whitespace-pre opacity-62">
              {summary}
            </p>
          </div>
          <div className="pointer-events-none relative min-h-px flex-1" />
          <div
            onAnimationEnd={() => {
              // Hand the transform back to the transitions once it has landed.
              if (sheet === "entering") setSheet("open");
            }}
            onTransitionEnd={(event) => {
              // Only the slide-out ends the sheet; ignore bubbles from inside.
              if (sheet === "closing" && event.target === event.currentTarget) setSheet("closed");
            }}
            className={`relative z-20 w-full shrink-0 ${
              sheet === "entering" ? "sheet-enter" : dragging ? "" : SHEET_MOTION
            }`}
            style={{
              transform:
                sheet === "closing"
                  ? "translateY(100%)"
                  : dragging
                    ? `translateY(${drag}px)`
                    : undefined,
            }}
          >
            <GroundsSheet
              debate={debate}
              side={side}
              onSide={setSide}
              onWrite={() => router.push(`/community/debate/${debate.id}/ground`)}
              grab={grab}
            />
          </div>
        </>
      ) : (
        <>
          {/* 타이머 — 805:3636 */}
          <div className="relative flex w-full shrink-0 items-start px-5 pt-3">
            <span className="flex items-center gap-[7px] rounded-[14px] bg-primary-700/50 py-[6px] pr-[14px] pl-3">
              <Img src="/assets/debate/timer.svg" className="size-[15px]" />
              <span className="text-[11px] leading-[1.4] font-bold text-white">
                남은 시간 {spell(debate.remaining)}
              </span>
            </span>
          </div>

          {/* 투표 카드 — 805:3641 */}
          <div className="relative flex w-full shrink-0 flex-col px-4 pt-3">
            <div className="flex w-full flex-col gap-[10px] rounded-2xl border border-gray-200 bg-white/89 px-4 pt-4 pb-[14px]">
              <p className="text-[10.5px] leading-[1.4] font-medium text-[#9a9a9e]">오늘의 투표</p>
              <h1 className="w-full text-[17px] leading-[1.4] font-bold text-[#1a1c1c]">
                {debate.topicLines.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </h1>

              {debate.options.map((option) => {
                const mine = option.side === vote;
                return (
                  <button
                    key={option.side}
                    type="button"
                    aria-pressed={mine}
                    onClick={() => setVote(option.side)}
                    className={`relative flex h-[42px] w-full items-center justify-between overflow-hidden rounded-[10px] py-3 pr-4 pl-[14px] ${
                      mine ? "border-[1.4px] border-primary-700 bg-white" : "bg-[#f4f3f3]"
                    }`}
                  >
                    <span
                      aria-hidden
                      className={`absolute inset-y-0 left-0 rounded-[10px] ${
                        mine ? "bg-[#f4f3f3]" : "bg-primary-700"
                      }`}
                      style={{ width: `${option.percent}%` }}
                    />
                    <span
                      className={`relative text-[13px] leading-[1.4] font-bold ${
                        mine ? "text-[#1a1c1c]" : "text-white"
                      }`}
                    >
                      {option.side}&nbsp;&nbsp;{option.label}
                    </span>
                    <span className="relative text-[13px] leading-[1.4] font-bold text-[#1a1c1c]">
                      {option.percent}%
                    </span>
                  </button>
                );
              })}

              <p className="w-full text-[10px] leading-[1.4] text-gray-600">
                지금까지 {debate.voters}명 참여 · 투표하면 정확한 비율이 보여요
              </p>
            </div>
          </div>

          <div className="relative min-h-px flex-1" />

          {/* 실시간 토론 — 805:3654 */}
          <div className="relative flex w-full shrink-0 items-center gap-[10px] px-6">
            <span className="flex items-center gap-[7px]">
              <Img src="/assets/debate/dot.svg" className="size-[6px]" />
              <span className="text-[11px] leading-[1.4] font-bold text-white">실시간 토론</span>
            </span>
            <span className="text-[10px] leading-[1.4] text-gray-200 opacity-60">
              ↑ 계속 올라오는 중
            </span>
          </div>

          {/* 채팅 리스트 — 805:3659. Older lines sit further back. */}
          <div className="relative flex w-full shrink-0 flex-col items-start gap-[6px] px-6 pt-2">
            {lines.map((line, i) => {
              // 줄이 DEPTHS 보다 적을 때도 마지막 줄이 가장 또렷해야 한다.
              const depth = DEPTHS[i + DEPTHS.length - lines.length] ?? DEPTHS[0];
              return (
                <div
                  key={line.id}
                  className={`ticker-line flex flex-col gap-[2px] rounded-2xl pt-2 pr-4 pb-[9px] pl-[14px] ${depth.bg} ${depth.text}`}
                >
                  <span className={`text-[12px] leading-[1.4] font-bold ${depth.fade}`}>
                    {line.author}
                  </span>
                  <span className={`text-[15px] leading-[1.45] ${depth.fade}`}>{line.text}</span>
                </div>
              );
            })}
          </div>

          {/* 근거 — 805:3672 */}
          <div className="relative flex w-full shrink-0 items-start px-6 pt-[14px] pb-[6px]">
            <p className="text-[10px] leading-[1.4] font-bold text-white opacity-80">
              {latestMine ? "방금 등록한 근거" : "가장 많이 공감받은 근거"}
            </p>
          </div>
          <div className="relative flex w-full shrink-0 flex-col px-4">
            <button
              type="button"
              onClick={() => setSheet("entering")}
              className="flex w-full items-center overflow-hidden rounded-[14px] border border-gray-200 bg-white"
            >
              <span className="flex min-w-px flex-1 items-center gap-3 px-3 py-[14px]">
                <span className="flex size-[26px] shrink-0 items-center justify-center rounded-[13px] bg-primary-800 text-[13px] leading-[1.4] font-bold text-white">
                  {top.rank}
                </span>
                <span className="min-w-px flex-1 text-left text-xs leading-[1.4] font-bold text-[#1a1c1c]">
                  {top.short ?? top.text}
                </span>
              </span>
              <span className="flex w-[110px] shrink-0 flex-col items-center justify-center gap-px self-stretch border-l border-gray-200 py-[14px]">
                <span className="text-sm leading-[1.4] font-bold text-primary-black">
                  +{groundCount - 1}
                </span>
                <span className="text-[10px] leading-[1.4] text-gray-500">더보기</span>
              </span>
            </button>
          </div>

          {/* 입력 바 — 805:3684 */}
          <div className="relative flex w-full shrink-0 items-center px-4 pt-[10px] pb-[14px]">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                say(opinion.value);
                opinion.clear();
              }}
              className="flex min-w-px flex-1 items-center gap-3 rounded-[23px] border border-gray-200 bg-white py-[7px] pr-[7px] pl-4"
            >
              <Img src="/assets/debate/input-dot.svg" className="size-[10px] shrink-0" />
              <input
                ref={input}
                value={opinion.value}
                onChange={(e) => opinion.type(e.target.value)}
                onFocus={opinion.onFocus}
                onBlur={opinion.onBlur}
                placeholder="내 의견 남기기"
                aria-label="의견 입력"
                className="min-w-px flex-1 text-[14px] leading-[1.4] text-[#1a1c1c] outline-none placeholder:text-gray-600"
              />
              <button
                type="submit"
                aria-label="보내기"
                {...keepFocus}
                className="tap flex size-8 shrink-0 items-center justify-center rounded-2xl bg-primary-600"
              >
                <Img src="/assets/debate/send.svg" className="size-4" />
              </button>
            </form>
          </div>

          {/* 플로팅 액션 — 805:3690, frame-relative 480 minus the status bar */}
          <div className="absolute top-[418px] left-[335px] flex flex-col items-center gap-[22px]">
            <Fab icon="/assets/debate/fab-like.svg" label={`${debate.likes}`} size={22} />
            <Fab icon="/assets/debate/fab-save.svg" label={`${debate.saves}`} size={20} />
            <Fab icon="/assets/debate/fab-share.svg" label="공유" size={22} />
          </div>
        </>
      )}

      <KeyboardSpacer open={opinion.open} />
    </main>

    {/* 키보드는 main 바깥이라야 기기 화면 바닥에 붙는다 — main 은 relative 다. */}
    {opinion.open ? (
      <IosKeyboard
        {...opinion.keyboardProps}
        onEnter={() => {
          say(opinion.value);
          opinion.clear();
        }}
      />
    ) : null}
    </>
  );
}

function Fab({ icon, label, size }: { icon: string; label: string; size: number }) {
  return (
    <button type="button" className="flex flex-col items-center gap-1">
      <span className="flex size-11 items-center justify-center rounded-[22px] border-[1.2px] border-white bg-black/42">
        <Img src={icon} style={{ width: size, height: size }} />
      </span>
      <span className="text-[10px] leading-[14px] font-bold tracking-[-0.2px] text-white">
        {label}
      </span>
    </button>
  );
}
