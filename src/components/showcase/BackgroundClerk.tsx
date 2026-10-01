"use client";

import { useRef, useState } from "react";
import Img from "@/components/common/Img";
import { SHOWCASE } from "@/config/showcase";

/**
 * 웹 배경의 점원 — 배경 그림(Figma 1779:6130)의 「캐릭터」(1779:6339) 자리에 따로
 * 얹은 것. 가로등 밑 상자 뒤에 숨어 고개만 내밀고 있다가, 누르면 **깜짝 놀라**
 * 상자를 뛰어넘어 편의점 문으로 뛰어 들어간다(사용자 요청). 그림에 박혀 있으면
 * 움직일 수 없어서 그림은 점원 없이 뽑고, 그 자리에 SVG 로 세운다. 그림(clerk.svg,
 * 70 × 82)은 참고 그림 1968:7211 을 따라 직접 그린 것 — 다리(발 둘)가 있고 왼팔을
 * 들어 흔든다(SVG 안의 CSS). 참고 그림의 손 옆 노란 선과 흰 외곽선은 뺐다(사용자
 * 지시). 발끝이 상자 밑선(823)에 딱 닿게 세운다. 상자 둘(파랑 1968:6910 · 노랑 1968:6944)도 그림에서 따로 떠서 점원
 * **앞에** 얹는다(boxes.svg) — 그래야 점원이 상자 뒤에 서 있고, 뛰어넘을 때 상자
 * 뒤로 지나간다. 그림에도 상자가 그대로 있어 겹쳐도 티가 안 난다.
 *
 * 배경은 cover · 아래 가운데 맞춤이라 그림의 배율은 max(창 너비 / 1920, 창 높이 /
 * 1080)다. 자리는 CSS 가 같은 식(--bg-k, ShowcaseLayout)으로 잡고 — 배경 판이 아니라
 * 화면 위의 누름 안 통하는 판에 얹혀 이 단추만 눌린다 — 움직임의 거리는 누르는 순간
 * JS 가 같은 배율을 곱한다. 그 사이 창이 바뀌면 조금 어긋나지만 곧 제자리로 돌아온다.
 *
 * 움직임 — 배경 그림 좌표(1920 기준), 2.5초:
 *   1. 놀람: 몸이 납작해졌다 위로 폴짝(-16), 머리 위에 「!」가 튄다(.clerk-shout)
 *   2. 상자를 뛰어넘음: 오른쪽으로 포물선(위로 -34 까지 올랐다가 상자 오른쪽 땅
 *      x +92 에 내려섬 — 발끝이 이미 문턱(823) 높이라 y 는 그대로)
 *   3. 문으로 달림: 문(1968:6921, x 475 ~ 520) 앞까지(+212), 걷기보다 빠른 잔걸음
 *      (.clerk-run)
 *   4. 문 안으로 — 조금 작아지며 사라진다
 * 들어간 뒤 1.6초 지나 상자 뒤 제자리에 도로 나타나 다시 누를 수 있다.
 *
 * 안내 — 아는 사람만 누를까 봐(사용자 요청) 머리 위에 흰 말풍선을 띄운다: 「알바생이
 * 일 안 하고 상자 뒤에 숨었어요 · 눌러서 일하러 보내요」(SHOWCASE.clerkHint). 꼭지는
 * 오른쪽 아래에서 머리를 가리키고, 풍선은 살짝 떠다닌다(.clerk-hint). 가만히 있을 때는
 * 점원도 이따금 상자 뒤로 고개를 숙였다 도로 내민다(.clerk-peek) — 숨어서 눈치 보는
 * 결이고, 움직이는 것이 있어야 눈이 간다. 한 번 누르면 풍선은 거두고 몸짓만 남는다.
 * 숙일 때 발이 상자 밑(823)보다 내려가면 상자 아래로 몸이 비친다 — 발끝이 딱 823
 * 이라 여유가 없다. 그래서 그림을 단추 아래선에서 잘라(clip-path, 아래만) 내려간
 * 만큼은 안 그린다 — 그 자리는 어차피 상자 뒤다. 위 · 옆은 안 자른다: 달릴 때
 * 들썩이는 것(-9%)과 든 팔이 잘리면 안 된다.
 *
 * 2026-09-20 편의점이 왼쪽으로 갔다(night-store-left, showcase.ts) — 무리가 통째로
 * x −1210 이라 점원(1460 → 250) · 상자(1474.33 → 264.33)도 같은 만큼. 문은 여전히
 * 점원의 오른쪽(475 ~ 520)이라 뛰는 방향 · 거리(MOVE)는 그대로다.
 */
const CLERK = { x: 250, y: 741, w: 70, h: 82 };
const BOXES = { x: 264.33, y: 784.18, w: 83.4, h: 38.82 };
const MOVE = { hop: -16, leap: -34, land: 92, ground: 0, door: 212, ms: 2500 };

const bgPos = (x: number, y: number, w: number, h: number) => ({
  left: `calc(50% + ${x - 960}px * var(--bg-k))`,
  bottom: `calc(${1080 - y - h}px * var(--bg-k))`,
  width: `calc(${w}px * var(--bg-k))`,
  height: `calc(${h}px * var(--bg-k))`,
});

export default function BackgroundClerk() {
  const ref = useRef<HTMLButtonElement>(null);
  /** idle → startled(놀라는 동안 「!」) → running(달리는 동안 잔걸음) */
  const [phase, setPhase] = useState<"idle" | "startled" | "running">("idle");
  /** 한 번이라도 눌렀으면 안내 말풍선은 거둔다 */
  const [tried, setTried] = useState(false);

  const flee = () => {
    const el = ref.current;
    if (!el || phase !== "idle") return;

    const k = Math.max(window.innerWidth / 1920, window.innerHeight / 1080);
    const px = (n: number) => `${(n * k).toFixed(2)}px`;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // 박자(ms) — 키프레임 offset 과 「!」 · 잔걸음이 같은 값을 본다
    const T = { squash: 120, hop: 400, top: 620, land: 860, door: 2100 };
    const at = (ms: number) => ms / MOVE.ms;
    const tf = (x: number, y: number, sx: number, sy: number) =>
      `translate(${px(x)}, ${px(y)}) scale(${sx}, ${sy})`;

    const frames: Keyframe[] = reduce
      ? [
          { transform: tf(0, 0, 1, 1), opacity: 1 },
          { transform: tf(MOVE.door, MOVE.ground, 1, 1), opacity: 0 },
        ]
      : [
          { transform: tf(0, 0, 1, 1), opacity: 1, offset: 0, easing: "ease-out" },
          // 놀람 — 납작
          { transform: tf(0, 0, 1.12, 0.86), offset: at(T.squash), easing: "ease-out" },
          // 폴짝
          { transform: tf(0, MOVE.hop, 0.94, 1.1), offset: at((T.squash + T.hop) / 2), easing: "ease-in" },
          { transform: tf(0, 0, 1.04, 0.94), offset: at(T.hop), easing: "ease-out" },
          // 상자를 뛰어넘는다 — 오른쪽 위로 올랐다가
          { transform: tf(MOVE.land / 2, MOVE.leap, 0.96, 1.06), offset: at(T.top), easing: "ease-in" },
          // 상자 오른쪽 땅에 내려선다
          { transform: tf(MOVE.land, MOVE.ground, 1.08, 0.92), offset: at(T.land), easing: "ease-out" },
          { transform: tf(MOVE.land, MOVE.ground, 1, 1), offset: at(T.land + 80), easing: "ease-in" },
          // 문 앞까지 달린다
          { transform: tf(MOVE.door, MOVE.ground, 1, 1), opacity: 1, offset: at(T.door), easing: "ease-in" },
          // 문 안으로
          { transform: tf(MOVE.door + 10, MOVE.ground - 2, 0.82, 0.82), opacity: 0, offset: 1 },
        ];

    setTried(true);
    setPhase("startled");
    const run = el.animate(frames, { duration: reduce ? 600 : MOVE.ms, easing: "linear", fill: "forwards" });
    const toRun = window.setTimeout(() => setPhase("running"), reduce ? 0 : T.land);
    run.onfinish = () => {
      window.setTimeout(() => {
        run.cancel();
        el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 400, easing: "ease-out" });
        window.clearTimeout(toRun);
        setPhase("idle");
      }, 1600);
    };
  };

  return (
    <>
      <button
        ref={ref}
        type="button"
        aria-label="알바생 — 상자 뒤에 숨어 있어요. 누르면 놀라서 편의점에 일하러 들어가요"
        onClick={flee}
        className="pointer-events-auto absolute cursor-pointer"
        style={bgPos(CLERK.x, CLERK.y, CLERK.w, CLERK.h)}
      >
        {/* 아래선에서만 자르는 틀 — 숙인 몸이 상자 밑으로 비치지 않게 */}
        <span className="block h-full w-full [clip-path:inset(-100%_-100%_0_-100%)]">
          <Img
            src="/assets/showcase/clerk.svg"
            className={`block h-full w-full max-w-none ${
              phase === "running" ? "clerk-run" : phase === "idle" ? "clerk-peek" : ""
            }`}
          />
        </span>
        {/*
          안내 말풍선 — 머리 위 왼쪽으로 뻗고 꼭지가 오른쪽 아래에서 머리를 가리킨다.
          글자는 배율을 안 탄다 — 작은 창에서도 읽혀야 한다. 읽어 주지는 않는다 —
          단추 이름이 이미 말해 준다. 한 번 누르면 거둔다.
        */}
        {tried || phase !== "idle" ? null : (
          <span
            aria-hidden
            className="clerk-hint absolute right-[30%] bottom-[calc(100%+9px)] rounded-[12px] bg-white px-[11px] py-[6px] text-left text-[12px] leading-[1.45] whitespace-nowrap text-gray-700"
          >
            <b className="block font-semibold text-gray-900">{SHOWCASE.clerkHint.lead}</b>
            {SHOWCASE.clerkHint.action}
          </span>
        )}
        {/* 놀란 「!」 — 머리 위에서 튀었다 사라진다 */}
        {phase === "startled" ? (
          <span
            aria-hidden
            className="clerk-shout absolute -top-[55%] left-1/2 flex size-[46%] items-center justify-center rounded-full bg-white text-[calc(30px*var(--bg-k))] leading-none font-bold text-yellow-500"
          >
            !
          </span>
        ) : null}
      </button>
      {/* 상자 — 점원 앞에. 그림의 상자와 같은 자리라 겹쳐도 티가 안 난다 */}
      <Img
        src="/assets/showcase/boxes.svg"
        aria-hidden
        className="absolute max-w-none"
        style={bgPos(BOXES.x, BOXES.y, BOXES.w, BOXES.h)}
      />
    </>
  );
}
