"use client";

import { useState } from "react";
import Img from "@/components/common/Img";
import { attendance } from "@/data/common/my";
import { usePersona } from "@/hooks/usePersona";
import { earnCoins } from "@/state/coinStore";
import type { AttendanceDay } from "@/types/menu";

/**
 * 출석 — 새로 그리는 중인 디자인(참고 이미지)을 옮긴 것.
 *
 * 예전 것은 흰 카드에 7일을 늘어놓고 체크만 찍었다. 새 것은 연한 초록 판
 * 하나를 깔고 그 위에 제목 · 동그라미 일곱 · 아래 띠를 얹는다. 카드 안의 한
 * 줄이 아니라 화면 한 자리를 차지하는 덩어리가 됐다.
 *
 * 한 바퀴는 이레고, 오늘은 첫날이다(사용자 요청). 마지막 칸에는 얼굴 대신
 * 이레째에 받을 코인이 앉아 있다 — 이레 끝에 무엇이 있는지가 줄 안에 미리
 * 놓여 있어야 오늘 찍는 이유가 된다.
 *
 * 오늘 칸은 눌러야 찍힌다. 그냥 두면 일곱 칸 중 하나가 진할 뿐이라 눌러야
 * 하는 줄 모른다(사용자 지적) — 테두리에서 빛이 퍼져 나가고(`stamp-beacon`)
 * 밑에 「눌러서 찍기」가 적힌다. 찍으면 둘 다 사라지고 코인 하나가 지갑에
 * 들어간다.
 *
 * 얼굴은 알래봇 아바타(`home/ai.svg`)를 그대로 쓴다. 참고 이미지도 캐릭터
 * 얼굴을 쓰는데, 이 앱에서 그 자리에 설 수 있는 얼굴은 이것뿐이다. 아직 안 온
 * 날은 회색으로 빼서 「아직」을 표시한다.
 *
 * 적힌 말은 참고 이미지에서 옮긴 것이라 확정이 아니다(`data/common/my`).
 */

/**
 * 동그라미 지름. 얼굴은 이보다 조금 작게 앉힌다.
 *
 * 이레가 한 줄에 들어가야 한다 — 판 안쪽 폭이 322(354 - 양옆 16)이라 40 이면
 * 사이가 7 남는다. 참고 이미지는 닷새라 동그라미가 훨씬 컸는데, 이레를 같은
 * 크기로 두면 줄이 화면 밖으로 나간다.
 */
const RING = 40;
const FACE = 28;

/**
 * 도장이 떨어지고 팝업이 뜨기까지.
 *
 * 도장 자체가 700ms 다. 그보다 800 을 더 기다려 찍힌 자리를 충분히 보여 준
 * 뒤에 덮는다 — 붙여 두면 도장을 보기도 전에 팝업이 가리고, 400 일 때는
 * 「찍혔다」를 알아채는 순간 이미 덮였다.
 */
const PRIZE_MS = 1500;

export default function Attendance() {
  /*
    몇째 날인지는 사람에 따라 다르다(사용자 결정) — 막 가입한 김민정은 첫날,
    쓰던 한상현은 엿새를 채운 이레째. 아무도 안 골랐으면 프레임대로 이레째.
  */
  const persona = usePersona();
  const run = persona?.fresh ? attendance.fresh : attendance.regular;
  /** 오늘 칸에 받을 것이 앉아 있는지 — 이레째만. 첫날 도장은 도장뿐이다. */
  const rewarded = run.days.some((day) => day.state === "today" && day.reward);

  /** 오늘 칸에 도장이 찍혔는지. */
  const [stamped, setStamped] = useState(false);
  /** 받았다는 팝업이 떠 있는지. */
  const [prize, setPrize] = useState(false);

  /*
    오늘 칸을 누르면 도장이 찍힌다. 이레째면 한 박자 뒤 코인이 들어오며 받았다는
    팝업이 뜨고, 첫날이면 찍히고 끝이다(사용자 결정 — 받은 것이 없는데 팝업이
    뜨면 거짓말이다).

    예전에는 출석 줄로 스크롤해 내려오면 저절로 찍혔다. 보여 주는 사람이
    타이밍을 못 잡고, 화면을 훑기만 해도 찍혀 버려 정작 보여 줄 때는 이미 끝나
    있었다. 손으로 눌러 찍는 것이 출석의 몸짓에도 맞다. 한 번 찍으면 끝 —
    또 눌러도 다시 안 찍힌다.
  */
  const stamp = () => {
    if (stamped) return;
    setStamped(true);
    if (!rewarded) return;
    window.setTimeout(() => {
      earnCoins(1, "출석 7일 보너스");
      setPrize(true);
    }, PRIZE_MS);
  };

  return (
    <section className="mx-6 flex flex-col gap-5 rounded-[16px] bg-[#CDE9DA] p-4">
      <header className="flex w-full items-start justify-between gap-3">
        <div className="flex min-w-px flex-1 flex-col">
          <div className="flex items-center gap-[6px]">
            <h2 className="text-heading-22 text-gray-black">{run.title}</h2>
            <span className="shrink-0 rounded-full bg-primary-600 px-2 py-[3px] text-xs leading-[1.3] font-medium text-white">
              {attendance.state}
            </span>
          </div>
          <p className="pt-2 text-body-14 text-gray-600">{run.sub}</p>
        </div>
      </header>

      {/*
        자리를 고르게 벌린다 — 일곱이 한 줄에 들어가고 오늘이 그 안에 선다.
        360 아래에서는 일곱(280)이 안 들어가 옆으로 넘겨본다 — 화면 밖으로 삐져
        나가 페이지가 옆으로 밀리던 것(감수 지적)보다 낫다.
      */}
      <div className="no-scrollbar -mx-4 w-[calc(100%+32px)] overflow-x-auto px-4">
        <ol className="flex w-full min-w-[280px] items-start justify-between">
          {run.days.map((day, index) => (
            <li key={index} className="flex flex-col items-center">
              <Day day={day} stamped={stamped} onStamp={day.state === "today" ? stamp : undefined} />
            </li>
          ))}
        </ol>
      </div>

      <Promo />

      {prize ? <Prize onClose={() => setPrize(false)} /> : null}
    </section>
  );
}

/**
 * 하루 한 칸.
 *
 * 오늘 칸에만 위에 화살표를 세운다 — 일곱이 나란하면 어디가 오늘인지 색만으로는
 * 잘 안 잡힌다. 삼각형은 테두리로 만든다(그림 파일을 하나 더 두기에는 작다).
 *
 * 마지막 날은 얼굴 대신 받을 코인을 보여 준다. 이레 끝에 무엇이 있는지가 줄
 * 안에 미리 놓여 있어야, 오늘 찍는 이유가 눈에 보인다.
 *
 * 오늘 칸은 찍기 전까지 테두리 밖으로 빛이 퍼져 나간다(beacon) — 누르는 칸이
 * 여기라는 표시. 찍히면 멈춘다.
 */
function Day({
  day,
  stamped,
  onStamp,
}: {
  day: AttendanceDay;
  stamped: boolean;
  /** 오늘 칸만 받는다 — 누르면 도장. */
  onStamp?: () => void;
}) {
  const today = day.state === "today";
  /** 오늘 칸 — 도장이 찍히면 이 칸은 다 찍은 날이 된다. */
  const hit = today && stamped;
  const todo = day.state === "todo";

  return (
    <>
      <span
        aria-hidden
        className={`mb-1 h-[10px] w-0 border-x-[6px] border-t-[7px] border-x-transparent border-t-primary-600 ${
          today ? "" : "invisible"
        }`}
      />

      {/*
        테두리를 따로 그린다 — 큰 동그라미를 테두리 색으로 칠하고 그보다 3
        작은 흰 동그라미를 얹으면, 남는 3px 이 테두리가 된다.

        `ring` 을 쓰지 않은 것은 오늘 칸을 한 겹 더 굵게(4px) 두르기 위해서다.
        찍은 날과 오늘은 둘 다 다 찍은 날이라 색만으로는 구별이 안 되는데,
        테두리 굵기와 진하기가 다르면 화살표가 없어도 오늘이 잡힌다.
      */}
      {/*
        오늘 칸은 단추다 — 누르면 찍힌다. 찍고 나면 눌리지 않는다. 다른 날은
        그냥 칸이라 button 이 아니다(눌러도 아무 일 없는 단추는 두지 않는다).
      */}
      <Tile
        button={Boolean(onStamp) && !hit}
        onClick={onStamp}
        className={`relative block ${hit ? "stamp-shake" : ""}${
          onStamp && !hit ? " tap [--tap:52px] cursor-pointer transition-transform active:scale-95" : ""
        }`}
        style={{ width: RING, height: RING }}
      >
        {/* 빛 — 오늘 칸에서 퍼져 나간다. 찍으면 그친다. */}
        {onStamp && !hit ? (
          <span
            aria-hidden
            className="stamp-beacon absolute inset-0 rounded-full border-[3px] border-primary-500"
          />
        ) : null}

        <span
          aria-hidden
          className={`absolute inset-0 rounded-full ${
            todo ? "bg-gray-200" : today ? "bg-primary-600" : "bg-primary-500"
          }`}
        />

        <span
          className={`absolute flex items-center justify-center rounded-full ${
            today ? "inset-[4px]" : "inset-[3px]"
          } ${todo ? "bg-gray-100" : "bg-white"}`}
        >
          {/*
            도장이 찍힌 뒤에는 안을 비운다. 코인을 그대로 두었더니 도장 글씨와
            겹쳐 둘 다 못 읽는 덩어리가 됐다 — 이미 받은 것이라 여기 남아 있을
            이유도 없다(밑의 말이 「받음」으로 바뀌고, 팝업이 알려 준다).
          */}
          {hit ? null : day.reward ? (
            <span className="text-sm leading-none font-semibold text-primary-600">
              {day.reward}
            </span>
          ) : (
            <Img
              src="/assets/home/ai.svg"
              style={{ width: FACE, height: FACE }}
              className={`rounded-full ${todo ? "opacity-25 grayscale" : ""}`}
            />
          )}
        </span>

        {/*
          도장. 칸보다 조금 크게(RING + 10) 찍혀 테두리 밖으로 걸친다 — 칸
          안에 딱 맞으면 원래 그 자리에 있던 그림처럼 보이고, 걸쳐야 나중에
          위에서 눌러 찍은 것이 된다.
        */}
        {hit ? (
          <span
            aria-hidden
            style={{ width: RING + 10, height: RING + 10, left: -5, top: -5 }}
            className="stamp-hit absolute flex items-center justify-center rounded-full border-[3px] border-primary-700 text-[13px] leading-none font-bold text-primary-700"
          >
            완료
          </span>
        ) : null}
      </Tile>

      {/*
        「오늘 완료」는 다른 말보다 길어 제 칸(40)을 넘는다. 넘치는 만큼은
        양옆 빈자리로 나가는데, 옆 칸의 말이 짧아(「완료」 · 「5일」) 서로
        닿지 않는다. 줄바꿈만 막아 두면 된다.
      */}
      <span
        className={`pt-[6px] text-xs leading-[1.3] whitespace-nowrap ${
          todo ? "text-gray-400" : today && !hit ? "font-semibold text-primary-700" : "text-primary-600"
        }`}
      >
        {hit ? (day.reward ? "받음" : "완료") : onStamp ? attendance.hint : day.label}
      </span>
    </>
  );
}

/** 칸의 겉 — 이레째는 단추, 나머지는 그냥 상자. 안은 같다. */
function Tile({
  button,
  onClick,
  className,
  style,
  children,
}: {
  button: boolean;
  onClick?: () => void;
  className: string;
  style: React.CSSProperties;
  children: React.ReactNode;
}) {
  return button ? (
    <button
      type="button"
      aria-label={attendance.stampLabel}
      onClick={onClick}
      className={className}
      style={style}
    >
      {children}
    </button>
  ) : (
    <span className={className} style={style}>
      {children}
    </span>
  );
}

function Prize({ onClose }: { onClose: () => void }) {
  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 mx-auto flex w-full max-w-screen items-center justify-center bg-black/40 px-11"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={attendance.prize.title}
        onClick={(event) => event.stopPropagation()}
        className="prize-pop flex w-full flex-col items-center rounded-[16px] bg-white px-5 py-7"
      >
        <span className="flex size-[62px] items-center justify-center rounded-full bg-primary-100 text-[20px] leading-none font-bold text-primary-600">
          {attendance.prize.coin}
        </span>

        <p className="pt-4 text-base leading-[1.3] font-semibold text-gray-black">
          {attendance.prize.title}
        </p>
        <p className="pt-[6px] text-body-14 text-gray-600">{attendance.prize.sub}</p>

        <button
          type="button"
          onClick={onClose}
          className="tap [--tap-w:0px] mt-6 flex h-[42px] w-full items-center justify-center rounded-[10px] bg-primary-600 text-base leading-[1.3] font-medium text-white transition-opacity active:opacity-80"
        >
          {attendance.prize.cta}
        </button>
      </div>
    </div>
  );
}

/**
 * 아래 띠 — 아직 안 열린 것.
 *
 * 선물 상자는 그림 파일이 없어 네모와 띠 두 줄로 짰다. 자리를 비워 두면 왼쪽이
 * 허전해서 글이 판 한가운데로 떠 보이는데, 여기는 「무언가 받는다」가 한눈에
 * 읽혀야 하는 자리다. 진짜 그림이 오면 이 덩어리만 갈아 끼운다.
 */
function Promo() {
  return (
    <div className="flex w-full items-center gap-[10px] rounded-[14px] bg-white p-[14px]">
      {/*
        선물 상자 — 리본 두 줄을 두른 상자.

        가로줄을 한가운데 두었더니 네모가 넷으로 갈려 상자가 아니라 격자로
        보였다. 위쪽 1/3 에 두면 그 줄이 뚜껑 자리가 되어 상자로 읽힌다.
      */}
      <span aria-hidden className="relative size-8 shrink-0 rounded-[5px] bg-purple-500">
        <span className="absolute inset-y-0 left-1/2 w-[4px] -translate-x-1/2 bg-white/90" />
        <span className="absolute inset-x-0 top-[10px] h-[4px] bg-white/90" />
      </span>

      <div className="flex min-w-px flex-1 flex-col">
        <div className="flex items-center gap-[5px]">
          <span className="shrink-0 rounded-[4px] bg-purple-100 px-[5px] py-px text-[11px] leading-[1.3] font-medium text-purple-600">
            {attendance.promo.tag}
          </span>
        </div>
        <p className="pt-1 text-base leading-[1.3] font-semibold text-gray-black">
          {attendance.promo.title}
        </p>
      </div>

      <button
        type="button"
        className="tap [--tap-w:0px] shrink-0 rounded-full bg-primary-100 px-3 py-2 text-[13px] leading-[1.3] font-medium text-primary-700 transition-opacity active:opacity-70"
      >
        {attendance.promo.cta}
      </button>
    </div>
  );
}
