"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Img from "@/components/common/Img";
import CartToggle from "@/components/home/CartToggle";
import SnackBag, { pickBagTones, type BagTone } from "@/components/home/SnackBag";
import { lucky } from "@/data/common/home";
import { getCartSnapshot, markDrawn } from "@/state/cartStore";
import type { LuckyArt, LuckyCard } from "@/types/home";

/**
 * 랜덤 지식깡 뽑기 연출 — Figma 856:8268(노란 봉지) · 856:8474(카드).
 *
 * 색이 다른 봉지(856:8268 · SnackBag) 세 개가 호를 그리며 섞이다가 하나가
 * 앞에서 서고, 빛이 번쩍한 뒤 그 봉지가 뜯기며 카드가 튀어나온다. 세 단계는
 * 여기서 타이머로 넘기고, 섞는 움직임은 `Shuffle`, 나머지는 globals.css 의
 * `lucky-*` 가 맡는다.
 *
 * 홈 안에서 그대로 벌어지게 하려면 카드가 솟을 자리(150px 남짓)를 봉지 위에
 * 마련해야 하는데, 그만큼 늘리면 뽑기 전에도 빈 자리가 남거나 봉지가 아래로
 * 밀린다 — 둘 다 프레임과 어긋난다. 그래서 화면을 덮고 연출한다. 어두운
 * 바탕이 있어야 「빛이 번쩍」도 빛으로 보인다.
 *
 * 단계마다 요소가 붙었다 떨어지므로, 다시 뽑을 때 애니메이션이 처음부터
 * 다시 시작한다 — 같은 요소를 두고 클래스만 바꾸면 두 번째부터 안 움직인다.
 */

/**
 * 봉지가 섞이는 단계의 길이. 호 자체는 SHUFFLE_MS 에 서므로 250ms 는 선 채로
 * 머문다 — 서자마자 터지면 「멈췄다」가 안 읽힌다.
 */
const SPIN_MS = 2250;
/** 빛이 봉지를 덮고 있는 시간. 빛 자체는 620ms 라 카드가 솟는 동안 마저 잦아든다. */
const FLASH_MS = 380;

type Phase = "spin" | "flash" | "reveal";

/* ── 섞기 ─────────────────────────────────────────────────────────────
   봉지 세 개가 호(타원)를 따라 돈다. 앞으로 나올수록 커지고 내려앉고 똑바로
   서며, 옆으로 갈수록 작아지고 들리고 기운다 — 홈 프레임(846:3775)이 가운데
   봉지만 크게 세우고 양옆을 기울여 둔 그 배치가 호 위의 한 순간이다.

   자리 · 크기 · 기울기가 모두 각도의 함수라 CSS 키프레임으로는 자리마다 수십
   단계를 적어야 한다. 프레임마다 직접 계산하는 편이 짧고, 값을 만지기도 쉽다.
   ------------------------------------------------------------------ */

/** 도는 각. 네 바퀴하고 3분의 1 — 처음 앞에 있던 봉지가 아니라 그 다음이 선다. */
const TURN_DEG = 1560;
/**
 * 다 돌고 앞에 서는 봉지.
 *
 * 세 봉지가 색이 달라진 뒤로는 어느 것이 서는지가 눈에 보인다 — 빛이 걷힌 뒤
 * 남는 봉지에 이 봉지의 색을 줘야 「돌던 것 중 하나가 섰다」로 이어진다.
 *
 * TURN_DEG 가 360 의 배수에 120 을 더한 값이라 2번이 0도(앞)에 온다.
 */
const FRONT_SLOT = 2;
/** 도는 시간. 처음엔 초당 여덟 바퀴가 넘어 무엇이 무엇인지 안 보인다. */
const SHUFFLE_MS = 2000;

/**
 * 호의 가로 반지름.
 *
 * 375px 폰 기준으로 이 이상 키우면 가장 크게 벌어지는 순간에 봉지가 화면 밖으로
 * 잘린다. 그 순간이 마지막 감속 구간에 걸려 있어서(끝나기 0.8초 전) 잘리면
 * 눈에 띈다 — 빠르게 지나가는 구간이 아니다.
 *
 * ARC_LEAN 과 서로 자리를 뺏는다. 기울일수록 봉지가 가로로 넓게 눕기 때문에,
 * 기울기를 키우면 반지름을 그만큼 줄여야 화면 안에 남는다.
 */
const ARC_X = 92;
/** 뒤로 갈수록 들리는 높이. 이것이 호를 「타원」으로 보이게 한다. */
const ARC_LIFT = 30;
/**
 * 기우는 각의 최대치(옆으로 완전히 갔을 때).
 *
 * 멈춘 자리에서는 양옆 봉지가 이 값의 0.866배, 곧 ±17.3° 로 눕는다 — 프레임의
 * -10.45° · +15° 보다 더 눕힌 값이다.
 */
const ARC_LEAN = 20;

/**
 * 깊이에 따른 배율 — 원근 그대로다(시점 거리 = 반지름 x 4).
 *
 * 앞 1.333 · 옆 1 · 뒤 0.8 이 나오고, 여기에 0.75 를 곱해 앞에 선 봉지가 정확히
 * 1 배(157x192)가 된다. 빛이 걷힌 뒤 남는 봉지와 자리가 맞아야 해서 그렇다.
 */
function nearness(cos: number): number {
  return 4 / (4 - cos);
}

/** 끝으로 갈수록 급격히 느려진다 — 처음의 무작위한 속도가 이 곡선에서 나온다. */
function easeOut(t: number): number {
  return 1 - (1 - t) ** 4;
}

/**
 * 섞이는 봉지 세 개.
 *
 * 자리잡기는 상자 두 겹으로 나눈다. 바깥이 옮기고 키우고(밑변 기준이라 커져도
 * 봉지가 바닥에 붙어 있다), 안쪽이 기운다(가운데 기준이라 프레임의 회전과 같다).
 * 한 겹에 몰면 기울일 때 봉지가 바닥에서 떠오르거나 옆으로 밀린다.
 */
function Shuffle({ tones }: { tones: BagTone[] }) {
  const slots = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const place = (turn: number) => {
      slots.current.forEach((slot, index) => {
        if (!slot) return;
        const angle = ((index * 120 + turn) * Math.PI) / 180;
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        const near = nearness(cos);
        const depth = 0.75 * near;
        const lift = (ARC_LIFT * (1 - cos)) / 2;

        slot.style.transform = `translate(${(ARC_X * sin * near).toFixed(2)}px, ${(-lift).toFixed(2)}px) scale(${depth.toFixed(4)})`;
        /*
          뒤로 갈수록 옅어진다 — 겹쳤을 때 어느 것이 앞인지 이것으로 읽힌다.

          크기와 같은 값(앞 1 · 옆 0.75 · 뒤 0.6)으로 흐리던 것을 0.55 + 0.45 배
          로 바꿔 뒤엣것도 0.82 까지만 내려간다. 검정 실루엣일 때는 많이 흐려야
          겹친 자리에 경계가 생겼지만, 노란 봉지는 0.6 까지 내리면 어두운 바탕이
          비쳐 색이 죽는다 — 색을 보여 주려고 바꾼 그림이라 그러면 뜻이 없다.
        */
        slot.style.opacity = (0.55 + 0.45 * depth).toFixed(3);
        // 앞에 온 봉지가 위로 온다 — 겹칠 때 뒤엣것이 앞을 가리면 안 된다.
        slot.style.zIndex = String(Math.round(cos * 100));
        const lean = slot.firstElementChild as HTMLElement | null;
        if (lean) lean.style.transform = `rotate(${(ARC_LEAN * sin).toFixed(2)}deg)`;
      });
    };

    place(0);
    /*
      움직임을 줄이는 설정이면 다 돈 자리에 놓고 멈춘다 — 배치는 프레임의 세
      봉지 그대로이고, 앞에 서는 것만 FRONT_SLOT 과 같아진다. 0도에 세우면
      앞에 선 봉지와 빛이 걷힌 뒤 남는 봉지의 색이 서로 달라진다.
    */
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      place(TURN_DEG % 360);
      return;
    }

    let frame = 0;
    const from = performance.now();
    const step = (now: number) => {
      const t = Math.min(1, (now - from) / SHUFFLE_MS);
      place(TURN_DEG * easeOut(t));
      if (t < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div aria-hidden className="absolute inset-x-0 bottom-0 h-[192px]">
      {[0, 1, 2].map((index) => (
        <div
          key={index}
          ref={(el) => {
            slots.current[index] = el;
          }}
          className="absolute bottom-0 left-1/2 -ml-[78.5px] h-[192px] w-[157px] origin-bottom will-change-transform"
        >
          <div className="size-full">
            <SnackBag tone={tones[index]} className="size-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── 봉지 뜯기 ────────────────────────────────────────────────────────
   노란 봉지(157x192)는 납작한 그림 한 장이라 「윗동이 뜯긴다」를 그림 안에서
   만들 수 없다. 그래서 같은 그림을 두 장 겹쳐 놓고 서로 어긋나게 잘라 쓴다 —
   아래 장은 뜯긴 선 아래(몸통), 위 장은 그 위(봉함)만 남긴다. 둘이 딱 맞물려
   있어서 뜯기기 전에는 봉지 한 장으로 보인다.

   자르는 선은 들쭉날쭉하게 둔다. 곧게 자르면 뜯긴 게 아니라 가위로 오린 것
   처럼 보인다. 세로값만 14~23 사이에서 오르내리게 하고 가로는 백분율로 둬서
   봉지 폭이 바뀌어도 이가 고르게 남는다.
   ------------------------------------------------------------------ */

/** 뜯긴 자리 — 몸통의 윗변이자 봉함의 아랫변이다(왼쪽에서 오른쪽으로). */
const TEAR = [
  "0 20px",
  "7% 14px",
  "14% 21px",
  "21% 15px",
  "29% 23px",
  "36% 16px",
  "43% 22px",
  "50% 14px",
  "57% 21px",
  "64% 16px",
  "71% 23px",
  "79% 15px",
  "86% 21px",
  "93% 14px",
  "100% 20px",
];

/** 몸통 — 뜯긴 선부터 아래로. */
const BODY_CLIP = `polygon(${TEAR.join(", ")}, 100% 100%, 0 100%)`;
/** 봉함 — 위에서 뜯긴 선까지. 선을 거꾸로 밟아야 도형이 한 바퀴로 닫힌다. */
const SEAL_CLIP = `polygon(0 0, 100% 0, ${[...TEAR].reverse().join(", ")})`;

/**
 * 방금 나온 카드와 이미 열어 본 지식은 빼고 고른다.
 *
 * 같은 카드가 연달아 나오면 뽑은 것 같지 않고, 방금 코인 내고 읽은 지식이
 * 또 나오면 뽑기가 헛일이 된다(감수 지적). 열어 본 것은 cartStore.opened 가
 * 든다. 다 열어 봤으면 하는 수 없이 전부에서 고른다 — 빈 봉지를 줄 수는 없다.
 */
export function drawOne(exclude: string | null): LuckyCard {
  const opened = getCartSnapshot().opened;
  const fresh = lucky.cards.filter((card) => card.id !== exclude && !(card.id in opened));
  const pool = fresh.length ? fresh : lucky.cards.filter((card) => card.id !== exclude);
  return pool[Math.floor(Math.random() * pool.length)];
}

export default function DrawModal({
  coins,
  onDraw,
  onClose,
}: {
  /** 이번 뽑기를 치르고 남은 코인. 0 이면 「다시 뽑기」가 잠긴다. */
  coins: number;
  /** 「다시 뽑기」를 눌렀을 때 — 코인 한 개를 더 치른다. */
  onDraw: () => void;
  onClose: () => void;
}) {
  const [phase, setPhase] = useState<Phase>("spin");
  // 눌러서 열린 팝업이라 브라우저에서만 정해진다 — 서버와 다른 카드가 나올 일이 없다.
  const [card, setCard] = useState<LuckyCard>(() => drawOne(null));
  /**
   * 이번에 도는 봉지 셋의 색. 뽑을 때마다 다시 고른다 — 열 때마다 같은 봉지가
   * 돌면 연출이 녹화해 둔 것처럼 보인다.
   */
  const [tones, setTones] = useState<BagTone[]>(() => pickBagTones(3));

  /*
    코인은 뽑는 순간(카드 뽑기 · 다시 뽑기)에 이미 냈다 — 나온 카드를 여기서
    바로 장바구니에 먹는 중 0% 로 세워 둬야, 상세로 들어가도 또 안 치르고
    (useKnowledgePass 가 useShelf 를 보고 거저 연다), 안 보고 나가도 0% 로 남는다.
  */
  useEffect(() => {
    markDrawn(card.id);
  }, [card.id]);

  useEffect(() => {
    if (phase === "reveal") return;
    const id = setTimeout(
      () => setPhase(phase === "spin" ? "flash" : "reveal"),
      phase === "spin" ? SPIN_MS : FLASH_MS,
    );
    return () => clearTimeout(id);
  }, [phase]);

  /**
   * 카드를 보기 전에는 닫지 않는다 — 코인만 쓰고 아무것도 못 본 셈이 된다.
   *
   * 덮개를 누르는 것 · Esc · 오른쪽 위 ✕ 가 모두 이리로 온다.
   */
  const close = useCallback(() => {
    if (phase === "reveal") onClose();
  }, [phase, onClose]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [close]);

  const again = () => {
    if (coins <= 0) return;
    onDraw();
    setCard((current) => drawOne(current.id));
    setTones(pickBagTones(3));
    setPhase("spin");
  };

  const done = phase === "reveal";

  return (
    /*
      덮개는 어둡게 하는 데 더해 뒤 화면을 흐린다. 어둡게만 깔았을 때는 뒤의
      홈 카드와 글자가 그대로 읽혀 뽑기 연출과 섞였다 — 검은 막 한 장으로는
      「가려졌다」가 아니라 「어두워졌다」로 보인다.
    */
    <div
      className="fixed inset-0 z-50 mx-auto flex w-full max-w-screen flex-col items-center justify-center gap-8 bg-black/75 px-11 backdrop-blur-md"
      onClick={close}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={lucky.title}
        onClick={(event) => event.stopPropagation()}
        className="relative flex w-full flex-col items-center gap-8"
      >
        {/*
          닫기 — 팝업 오른쪽 위. 가로는 아래 「다시 뽑기」 단추의 오른쪽 끝
          (덮개 여백 44 안쪽)에, 세로는 카드 윗변에서 50 남짓 위에 둔다. 카드에
          바짝 붙이면 카드의 담기 단추와 헷갈리고, 화면 구석까지 올리면 실제
          폰에서 상태 표시줄 밑이라 손이 안 닿는다 — 그 사이다.

          「확인」을 빼고 나니 덮개를 눌러야 나간다는 걸 모르는 사람에게 나가는
          길이 없어 둔 단추다. 카드가 나온 뒤에야 보인다 — 도는 동안은 눌러도
          닫히지 않으므로(close) 보여 두면 고장 난 단추가 된다. 아래 단추 줄과
          같은 박자로 뜬다.
        */}
        <button
          type="button"
          aria-label={lucky.close}
          onClick={close}
          className={`tap absolute -top-10 right-0 flex transition-opacity duration-300 ${
            done ? "opacity-100 delay-[1500ms]" : "pointer-events-none opacity-0"
          }`}
        >
          <Img src="/assets/debate/close.svg" className="size-6" />
        </button>

        {/*
          봉지가 바닥에 서고 그 위로 카드가 솟는다. 476 = 카드가 선 자리(164)
          + 카드 높이(288) + 넘겼다 돌아오는 여유(24). 빛은 이 상자 밖으로
          번지지만 기기 화면이 잘라 주므로 넘칠 걱정은 없다.
        */}
        <div className="relative flex h-[476px] w-[220px] shrink-0 items-end justify-center">
          {/*
            빛 — 봉지 한가운데(바닥에서 96)를 중심으로 터진다. 도는 봉지 셋이
            사라지고 선 봉지 하나만 남는 순간을 이 빛이 덮는다.
          */}
          {phase !== "spin" ? (
            <>
              <span
                aria-hidden
                className="lucky-flash pointer-events-none absolute bottom-[96px] left-1/2 size-[240px] rounded-full bg-[radial-gradient(circle,#ffffff_0%,#fde8b5_42%,rgba(253,232,181,0)_70%)]"
              />
              <span
                aria-hidden
                className="lucky-ring pointer-events-none absolute bottom-[96px] left-1/2 size-[240px] rounded-full border-[3px] border-yellow-200"
              />
            </>
          ) : null}

          {/*
            봉지 — 856:8268 의 봉지 세 개가 저마다 다른 색으로 호를 그리며 돌고,
            빛이 지나간 뒤에는 앞에 선 하나(FRONT_SLOT)만 그 색 그대로 남아
            뜯긴다. 같은 그림·같은 크기(157x192)라 빛이 걷히면 그대로 이어진다.
          */}
          {/*
            카드 — 솟는 도중에 봉지 앞뒤가 바뀐다. 올라오는 동안은 봉지(z 10)
            뒤에 있어 뜯긴 자리로 머리만 나오고, 몸이 다 빠져나온 뒤 봉지 앞
            (z 20)으로 온다. 그 갈아타기는 lucky-pop 이 들고 있다.

            설 자리는 봉지 입구(바닥에서 192)를 28 만큼 문 높이다 — 다 나온
            뒤에도 봉지에 물려 있어야 여기서 나왔다는 게 남는다.
          */}
          {done ? (
            <div className="lucky-pop absolute bottom-[164px] left-1/2 -ml-[96px]">
              <CardFace card={card} />
            </div>
          ) : null}

          {phase === "spin" ? (
            <Shuffle tones={tones} />
          ) : (
            <div className="lucky-bag absolute bottom-0 left-1/2 z-10 -ml-[78.5px] h-[192px] w-[157px]">
              {/* 몸통 — 뜯긴 선 아래. 카드가 이 뒤에서 올라온다. */}
              <SnackBag
                tone={tones[FRONT_SLOT]}
                data-node-id="856:8268"
                style={{ clipPath: BODY_CLIP }}
                className="absolute inset-0 size-full"
              />
              {/*
                봉함 — 카드가 나오는 순간(done)에 위로 뜯겨 날아간다. 그 전에는
                몸통과 맞물려 있어 봉지 한 장으로 보인다.
              */}
              <SnackBag
                tone={tones[FRONT_SLOT]}
                aria-hidden
                style={{ clipPath: SEAL_CLIP }}
                className={`absolute inset-0 size-full ${done ? "lucky-tear" : ""}`}
              />
            </div>
          )}
        </div>

        {/* 문구는 자리를 지킨다 — 단계가 바뀔 때 아래 단추가 튀지 않게. */}
        <p
          aria-live="polite"
          className="h-[23px] text-center text-lg leading-[1.3] font-semibold text-white"
        >
          {done ? lucky.opened : lucky.drawing}
        </p>

        {/* 카드가 다 솟은 뒤에 뜬다 — 같이 뜨면 눈이 단추로 가서 카드를 못 본다. */}
        <div
          className={`flex w-full flex-col items-center gap-3 transition-opacity duration-300 ${
            done ? "opacity-100 delay-[1500ms]" : "pointer-events-none opacity-0"
          }`}
        >
          {/*
            메인색(primary-600)으로 채운 단추 — 홈의 「카드 뽑기」와 같은 색이라
            여기서도 그 일을 하는 단추로 읽힌다. 테두리만 있던 때는 어두운 바탕
            위에서 속이 비어 잠긴 단추와 구별이 안 됐다.

            잠겼을 때는 바탕을 한 단계 어두운 초록(800)으로 내리고 글자만
            흐린다. 바탕을 반투명으로 낮추면 뒤에 깔린 화면이 비쳐 「코인이
            부족해요」가 안 읽힌다 — 잠긴 것을 알려 주려다 무엇 때문에 잠겼는지를
            가린다.

            가진 코인도 여기 붙는다. 코인을 쓰는 단추가 이것이라 「얼마나
            남았나」를 여기서 봐야 다음에 뭘 누를지 정할 수 있다. 아래 한
            줄에만 작고 흐리게 적어 두면 눈에 안 들어온다.

            옆에 있던 「확인」은 뺐다. 카드를 보고 나서 할 일은 한 번 더 뽑든지
            그만두든지 둘뿐인데, 그만두는 쪽은 덮개를 눌러도 되는 일이라 단추
            까지 내줄 자리가 아니다. 하나만 남았으므로 줄을 다 쓴다.
          */}
          <button
            type="button"
            onClick={again}
            disabled={coins <= 0}
            // 읽어 주면 「다시 뽑기 4」가 되어 무슨 4 인지 모른다
            aria-label={`${lucky.again} · ${lucky.ownedLabel} 코인 ${coins}개`}
            className="tap [--tap-w:0px] flex h-[42px] w-full items-center justify-center gap-[6px] rounded-[10px] bg-primary-600 text-base leading-[1.3] font-medium text-white transition-opacity active:opacity-80 disabled:bg-primary-800 disabled:text-white/60"
          >
            {coins > 0 ? lucky.again : lucky.broke}
            {/*
              무엇의 수인지 글자로 적는다. 노란 점만 찍었을 때는 그게 코인
              이라는 걸 알 수가 없었다. 쓸 만한 코인 그림이 없어(stamp.svg 는
              회색 테두리 동그라미라 잘 안 보인다) 글자로 간다. 「보유 코인
              4」까지 늘리면 단추를 넘치므로 「보유」만 남긴다 — 바로 아래
              값 줄(-1 coin)과 함께 읽히므로 뜻이 통한다.

              코인이 0 이면 붙이지 않는다 — 단추 글자가 이미 「코인이 부족해요」
              라서 옆에 「보유 0」을 또 붙이면 같은 말이 두 번이다.
            */}
            {coins > 0 ? (
              <span className="rounded-full bg-white/20 px-[7px] py-[2px] text-[12px] leading-[1.3] font-semibold">
                {lucky.ownedLabel} {coins}
              </span>
            ) : null}
          </button>

          {/*
            값만 남긴다 — 가진 코인은 위 단추로 올라갔다.

            어두운 바탕 위에 흐린 글자 한 줄로 두면 배경 그림과 섞여 안 읽힌다.
            흰 띠를 깔아 글자가 놓일 바탕을 만들고, 글자도 13 으로 키워 흰색을
            그대로 준다. 값은 노랑을 한 단계 밝혀(400 → 300) 띠 위에서 뜬다.
          */}
          <p className="flex items-center gap-[6px] rounded-full bg-white/15 px-[12px] py-[6px] text-[13px] leading-[17px] tracking-[-0.24px] text-white">
            <Img src="/assets/home/stamp.svg" className="size-[15px] shrink-0" />
            {lucky.costLabel}
            <span className="font-semibold text-yellow-300">{lucky.cost}</span>
          </p>
          {/*
            아래는 이 둘뿐 — 프레임(856:8474) 그대로. 한때 「영수증 꾸미러 가기」와
            「닫기」를 덧붙였는데 닫기는 오른쪽 위 X 와 겹치고 단추가 셋이나 쌓여
            원래 모양이 아니었다(사용자 지적) — 되돌렸다. 닫는 길은 X 와 바깥 누르기.
          */}
        </div>
      </div>
    </div>
  );
}

/**
 * 검은 상자 안 그림 — 점장님 Pick · 남겨둔 지식과 같은 파일을 쓴다. 상자가
 * 100 이라 그림 높이는 55 로 맞추고 원래 비율대로 폭을 잡는다.
 */
const ART: Record<LuckyArt, { src: string; className: string }> = {
  lang: { src: "/assets/home/cat-lang.svg", className: "h-[55px] w-[67.682px]" },
  nature: { src: "/assets/home/cat-nature.svg", className: "h-[55px] w-[71.923px]" },
  jeans: { src: "/assets/home/pick-jeans.svg", className: "h-[55px] w-[44px]" },
  ice: { src: "/assets/home/ice-float.svg", className: "h-[55px] w-[67.682px]" },
  food: { src: "/assets/home/food.svg", className: "h-[55px] w-[57.895px]" },
  king: { src: "/assets/home/king.svg", className: "h-[55px] w-[64.87px]" },
  life: { src: "/assets/home/cat-life.svg", className: "h-[55px] w-[48.6px]" },
  // 아래 넷은 지식마다 그린 그림이 없어 분야 · 갈래 아이콘을 쓴다(메뉴 · 카테고리 상세의 것)
  history: { src: "/assets/menu/field-history.svg", className: "size-[44px]" },
  society: { src: "/assets/menu/field-society.svg", className: "size-[44px]" },
  culture: { src: "/assets/menu/field-culture.svg", className: "size-[44px]" },
  universe: { src: "/assets/category/universe.svg", className: "h-[40px] w-[69.6px]" },
};

/**
 * 뽑힌 카드 한 장 — 856:8474.
 *
 * 프레임은 120x180 흰 카드에 모서리 8 뿐이고 안은 비어 있다. 카드뉴스 한
 * 장이 들어갈 자리라 홈의 다른 카드와 같은 짜임으로 채웠다 — 분류 배지 ·
 * 제목 · 검은 그림 상자. 장바구니 단추는 점장님 Pick 카드와 같은 자리다.
 *
 * 실제로는 프레임의 1.6배(192x288)로 그린다 — 뽑고 나서 읽어야 하는 카드인데
 * 120 폭에 12px 글씨는 화면을 덮은 채로도 눈에 안 들어왔다. 안쪽 값도 같은
 * 비율로 키워 짜임은 그대로다.
 *
 * 안쪽 폭이 160 이라 제목은 한 줄에 아홉 자까지만 쓴다 — 줄바꿈은 데이터가
 * 직접 나눈다. 손가락 판(`tap`)은 40 으로 낮춘다. 기본값 44 는 카드 여백보다
 * 넓어 잘려 나가는 데다, 카드 자체가 잘라내기(overflow-hidden) 상자다.
 */
export function CardFace({ card }: { card: LuckyCard }) {
  const art = ART[card.art];

  return (
    <div
      data-node-id="856:8474"
      className="[--tap:40px] relative flex h-[288px] w-[192px] flex-col justify-between overflow-hidden rounded-[13px] bg-white p-[16px] shadow-[0_18px_42px_-10px_rgba(0,0,0,0.55)]"
    >
      {/* 카드 전체가 그 지식의 상세로 가는 링크 — 뽑힌 것을 바로 읽으러 갈 수 있어야 뽑은 보람이 있다 */}
      <Link
        href={`/menu/knowledge/${card.id}`}
        aria-label={card.title.join(" ")}
        className="absolute inset-0 rounded-[13px]"
      />

      <div className="relative z-10 flex w-full items-center justify-between">
        <span
          style={{ backgroundColor: card.color }}
          className="flex items-center justify-center rounded-[50px] px-[9px] py-[4px] text-[13px] leading-[1.3] font-medium whitespace-nowrap text-white"
        >
          {card.tag}
        </span>
        {/*
          담은 것은 커뮤니티 게시글과 같은 저장소에 남는다 — 뽑을 때마다
          새로 생기는 항목이 아니라 지식 자체를 담는 것이라 카드 id 를 쓴다.
        */}
        <CartToggle
          id={`lucky-${card.id}`}
          off="/assets/home/bag-15.svg"
          on="/assets/home/bag-15-on.svg"
          className="h-[24px] w-[24.056px]"
        />
      </div>

      <h3 className="flex flex-col text-[18px] leading-[1.35] font-semibold tracking-[-0.34px] text-gray-black">
        {card.title.map((line) => (
          <span key={line}>{line}</span>
        ))}
      </h3>

      <div className="flex h-[100px] w-full shrink-0 items-center justify-center rounded-[9px] bg-gray-black">
        <Img src={art.src} className={art.className} />
      </div>
    </div>
  );
}
