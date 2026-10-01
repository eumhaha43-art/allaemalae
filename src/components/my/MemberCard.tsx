"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Img from "@/components/common/Img";
import { myLinksCopy } from "@/data/common/menu";
import { card } from "@/data/common/my";
import { useUserName } from "@/hooks/usePersona";
import { interestOptions } from "@/data/common/survey";
import { useCoins } from "@/state/coinStore";
import { showToast } from "@/state/toastStore";
import { getSurvey, getSurveyServerSnapshot, subscribeSurvey } from "@/state/surveyStore";
import { useMyPhoto } from "@/hooks/useMyPhoto";
import { usePersona } from "@/hooks/usePersona";

/**
 * 회원증 — 블랙 앞 2093:6154 · 블랙 뒤 2093:6260 · 신용 앞 2093:6082 · 신용 뒤
 * 2093:6186 · 체크 앞 2093:6118 · 체크 뒤 2093:6223.
 *
 * 세 벌이다 — 입력정보의 구독 등급(체크 / 신용 / 블랙) 그대로. 쓰던 사람(한상현)은
 * **블랙카드**, 막 가입한 사람(김민정)은 **체크카드** — 퍼소나가 정한다
 * (`Persona.card`). 아무도 안 골랐으면 프레임대로 블랙이다. **신용카드**는 아직
 * 쓰는 퍼소나가 없다(사용자 결정: 디자인만 둔다). 짜임은 세 벌이 같고(칩 ·
 * 카드번호 · 발급일 · 가운데 무늬 · 오른쪽 아래 점원 캐릭터, 뒤는 마그네틱 띠 ·
 * 사진 · 정보 줄) 바탕과 글자색, 가운데 무늬만 다르다.
 *
 *   블랙 — 검은 알루미늄(`METAL`, 전부터 쓰던 것 그대로 — 사용자 요청), 흰 글자,
 *          가운데 VIP 워터마크.
 *   신용 — 초록 플라스틱(`SURFACE.credit`). 카드번호는 흰 글자, 발급일만 연한
 *          초록(Primary/100)이다.
 *   체크 — 보라 플라스틱(`SURFACE.check`). 프레임은 한 판 색인데 실제 카드처럼
 *          보이라는 요청이라 비스듬한 광택과 모서리 두께를 얹고, 카드번호는
 *          양각처럼 살짝 띄운다.
 *
 * 신용 · 체크의 가운데 무늬는 가로로 누운 로고 네 조각(logo-shapes.svg)이고,
 * 뒷면 오른쪽 아래 마크도 같은 가로형(mark-wide-*.svg)이다. 앞면 왼쪽 아래에
 * 있던 로고 마크는 새 디자인에서 빠졌다.
 *
 * 오른쪽 위 단추를 누르면 뒤집힌다. 두 면을 실제로 앞뒤에 겹쳐 두고 상자째
 * 돌린다 — 뒤를 향한 면은 backface-visibility 로 감춘다. 겉으로 보이는 자리는
 * 늘 354x224 라 뒤집혀도 아래 내용이 밀리지 않는다.
 *
 * 넘어가는 동안 세 가지가 같이 일어난다 — 타로 카드가 넘어가는 느낌으로 해
 * 달라는 요청이다.
 *   1) 늘 같은 방향으로 돈다. 센 횟수에 180 을 곱해 각을 만드므로 되돌아오지
 *      않고 계속 넘어간다 — 앞뒤로 왔다 갔다 하면 「뒤집는」게 아니라
 *      「취소하는」 것으로 보인다.
 *   2) 반쯤 들렸다 내려앉는다. 올라갔다 내려오는 것은 전환 하나로는 못 그려서
 *      절반 시점에 상태를 되돌린다.
 *   3) 표면을 빛이 훑고 지나간다(globals.css `card-shine`).
 *
 * 프레임의 BLACK CARD · DEBIT CARD · VIP 는 Rufina 인데 이 프로젝트는 Pretendard 만
 * 불러온다. 글꼴 하나를 더 받아 오는 대신 세리프 계열로 대신한다 — 산세리프로
 * 두면 카드 느낌이 아예 사라진다.
 */

type Skin = "black" | "credit" | "check";

/** 한 번 넘어가는 데 걸리는 시간. globals.css 의 `card-shine` 과 같아야 한다. */
const FLIP_MS = 900;

/**
 * 블랙 — 검은 알루미늄.
 *
 * 프레임은 회색 두 칸짜리 그라데이션(#222 → #525252) 한 겹이라 평면으로만
 * 보였다. 금속처럼 보이려면 세 가지가 같이 있어야 해서 겹을 나눴다. 위에 적은
 * 것이 위에 덮인다.
 *
 *   1) 스팟 — 위쪽 가운데에서 번지는 빛. 카드가 평평하지 않고 살짝 휘어
 *      보이게 한다.
 *   2) 결 — 세로로 미세하게 긁힌 자국. 주기가 2 · 3 · 7px 로 서로 안 나눠
 *      떨어지는 세 겹을 포갠다. 한 겹만 쓰면 무늬가 규칙적으로 반복되는 것이
 *      눈에 보여 금속이 아니라 줄무늬 천처럼 된다.
 *   3) 결지음(anisotropy) — 금속이 빛을 받는 방향에 따라 밝고 어두운 띠가
 *      번갈아 생긴다. 색을 고르게 잇지 않고 여덟 칸으로 끊어 놓은 이유다.
 *
 * 밝은 칸도 #4a4d52 를 넘지 않게 해서 「검은 카드」로 남는다.
 */
const METAL: React.CSSProperties = {
  backgroundImage: [
    "radial-gradient(120% 85% at 50% -12%, rgba(255,255,255,0.17) 0%, rgba(255,255,255,0) 62%)",
    "repeating-linear-gradient(90deg, rgba(255,255,255,0.05) 0px, rgba(255,255,255,0.05) 1px, rgba(0,0,0,0.06) 1px, rgba(0,0,0,0.06) 2px)",
    "repeating-linear-gradient(90deg, rgba(255,255,255,0.035) 0px, rgba(255,255,255,0.035) 1px, rgba(0,0,0,0) 1px, rgba(0,0,0,0) 3px)",
    "repeating-linear-gradient(90deg, rgba(0,0,0,0.055) 0px, rgba(0,0,0,0.055) 1px, rgba(0,0,0,0) 1px, rgba(0,0,0,0) 7px)",
    "linear-gradient(100deg, #16171a 0%, #2e3034 12%, #4a4d52 26%, #26282c 38%, #3c3f44 52%, #1d1f22 66%, #35383d 80%, #17181b 100%)",
  ].join(", "),
};

/**
 * 플라스틱 — 신용(초록 #1b9a59) · 체크(보라 #7c73e6).
 *
 * 금속과 달리 결이 없다 — 매끈한 판이 빛을 한 덩어리로 받는다. 그래서 겹이 둘뿐이다.
 *
 *   1) 광택 — 왼쪽 위에서 오른쪽 아래로 비스듬히 지나가는 넓은 빛. 위쪽 절반이
 *      살짝 밝고 아래 오른쪽이 살짝 가라앉아, 코팅된 플라스틱이 조명을 받는
 *      모양이 된다.
 *   2) 바탕 — 프레임 색(`base`)을 가운데 두고 위는 조금 밝게(`light`), 아래는 조금
 *      어둡게(`dark`). 한 색으로 채우면 종이처럼 보인다.
 *
 * 밝은 데도 프레임 색에서 크게 안 벗어나게 해서 「그 색 카드」로 남는다.
 */
const plastic = (light: string, base: string, dark: string): React.CSSProperties => ({
  backgroundImage: [
    "linear-gradient(118deg, rgba(255,255,255,0.26) 0%, rgba(255,255,255,0.10) 26%, rgba(255,255,255,0) 44%, rgba(255,255,255,0) 66%, rgba(0,0,0,0.09) 100%)",
    "radial-gradient(90% 60% at 18% -8%, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0) 60%)",
    `linear-gradient(180deg, ${light} 0%, ${base} 50%, ${dark} 100%)`,
  ].join(", "),
});

/**
 * 벌마다의 바탕과 모서리.
 *
 * 그림자는 판이 떠 있는 것(바깥)과 잘라 낸 두께(안쪽 셋)를 같이 그린다. 바깥
 * 그림자는 그 카드 색을 어둡게 한 것이라야 카드에서 떨어진 그늘로 보인다 —
 * 검정 한 가지로 두면 색 카드 밑에 때가 낀 것처럼 보였다. 플라스틱은 금속보다
 * 윗선이 밝고 아랫선이 옅다 — 반투명한 코팅이 빛을 더 튕긴다.
 */
const SURFACE: Record<Skin, { style: React.CSSProperties; shadow: string }> = {
  black: {
    style: METAL,
    shadow:
      "shadow-[0_14px_30px_-12px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.34),inset_0_-1px_0_rgba(0,0,0,0.5),inset_0_0_0_1px_rgba(255,255,255,0.08)]",
  },
  credit: {
    style: plastic("#25aa65", "#1b9a59", "#15884e"),
    shadow:
      "shadow-[0_14px_30px_-12px_rgba(12,72,42,0.55),inset_0_1px_0_rgba(255,255,255,0.5),inset_0_-1px_0_rgba(0,0,0,0.22),inset_0_0_0_1px_rgba(255,255,255,0.14)]",
  },
  check: {
    style: plastic("#8981ea", "#7c73e6", "#6e65d4"),
    shadow:
      "shadow-[0_14px_30px_-12px_rgba(58,48,150,0.55),inset_0_1px_0_rgba(255,255,255,0.5),inset_0_-1px_0_rgba(0,0,0,0.22),inset_0_0_0_1px_rgba(255,255,255,0.14)]",
  },
};

/**
 * 면마다 다른 색 — 프레임 값. 블랙은 흰 글자, 신용 · 체크는 검은 글자다.
 *
 * 카드번호(`number`)와 발급일(`issued`)을 따로 두는 것은 신용카드 때문이다 —
 * 번호는 흰색인데 발급일만 연한 초록(프레임의 Primary/100 = #cbffe3)이다. 이
 * 값은 프로젝트의 `--color-primary-100`(#d6fff1)과 달라 프레임 값을 그대로
 * 적는다(커뮤니티 GroundForm 도 같은 이유로 그렇게 두었다).
 */
const INK = {
  black: {
    title: "text-white",
    number: "text-white",
    issued: "text-white",
    line: "border-white",
    stripe: "bg-[#181818]",
    pill: "bg-white text-black",
    button: "border-white text-white",
    mark: "/assets/my/mark-wide-white.svg",
    flip: "/assets/my/flip.svg",
  },
  credit: {
    title: "text-gray-black",
    number: "text-white",
    issued: "text-[#cbffe3]",
    line: "border-black",
    stripe: "bg-white",
    pill: "bg-black text-[#f8f9f8]",
    button: "border-black text-black",
    mark: "/assets/my/mark-wide-black.svg",
    flip: "/assets/my/flip-dark.svg",
  },
  check: {
    title: "text-black",
    number: "text-[#e5e3fa]",
    issued: "text-[#e5e3fa]",
    line: "border-black",
    stripe: "bg-white",
    pill: "bg-black text-[#f8f9f8]",
    button: "border-black text-black",
    mark: "/assets/my/mark-wide-black.svg",
    flip: "/assets/my/flip-dark.svg",
  },
} as const;

/** 프레임의 카드 크기 — 안의 좌표가 전부 이 기준이다 */
const CARD_W = 354;
const CARD_H = 224;

export default function MemberCard() {
  const persona = usePersona();
  const skin: Skin = persona?.card ?? "black";

  /** 넘긴 횟수. 홀수면 뒷면이고, 빛을 다시 켜는 열쇠로도 쓴다. */
  const [turns, setTurns] = useState(0);
  const [lifted, setLifted] = useState(false);
  const timer = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (timer.current !== null) window.clearTimeout(timer.current);
    },
    [],
  );

  const flip = () => {
    setTurns((count) => count + 1);
    setLifted(true);
    if (timer.current !== null) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setLifted(false), FLIP_MS / 2);
  };

  /*
    354 보다 좁은 화면(320 · 344)에서는 카드를 통째로 줄인다. 안의 칩 · 번호 ·
    무늬가 전부 프레임의 절대 좌표라 폭만 줄이면 오른쪽이 잘렸다(감수 지적).
    자리의 폭을 재서 배율을 준다 — 넓은 화면에서는 1 그대로.
  */
  const wrap = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const box = wrap.current;
    if (!box) return;
    const measure = () => setScale(Math.min(1, box.clientWidth / CARD_W));
    measure();
    const watch = new ResizeObserver(measure);
    watch.observe(box);
    return () => watch.disconnect();
  }, []);

  return (
    <div ref={wrap} className="mx-6 w-full max-w-[354px] shrink-0 self-center" style={{ height: CARD_H * scale }}>
    <div
      style={{ width: CARD_W, height: CARD_H, transform: `scale(${scale})`, transformOrigin: "top left" }}
      className="[perspective:1200px]"
    >
      {/* 들림 — 돌기 시작할 때 떠올랐다가 반쯤 돌았을 때부터 내려앉는다 */}
      <div
        style={{ transitionDuration: `${FLIP_MS / 2}ms` }}
        className={`size-full transition-transform ease-out motion-reduce:transition-none ${
          lifted ? "scale-[1.045]" : "scale-100"
        }`}
      >
        <div
          style={{ transform: `rotateY(${turns * 180}deg)`, transitionDuration: `${FLIP_MS}ms` }}
          className="relative size-full transition-transform [transform-style:preserve-3d] [transition-timing-function:cubic-bezier(0.4,0,0.2,1)] motion-reduce:transition-none"
        >
          <Face skin={skin} turns={turns}>
            <Front skin={skin} />
            {/* 앞면 단추 — 오른쪽 위 10 · 10 */}
            <FlipButton skin={skin} onClick={flip} className="top-[10px] right-[10px]" />
          </Face>

          <Face flipped skin={skin} turns={turns}>
            <Back skin={skin} />
            {/*
              뒷면 단추 — 블랙은 마그네틱 띠 위에 앉아 20 · 20(1554:3872), 체크는
              앞면과 같은 자리(1554:3826).
            */}
            <FlipButton
              skin={skin}
              onClick={flip}
              className={skin === "black" ? "top-[20px] right-[20px]" : "top-[10px] right-[10px]"}
            />
          </Face>
        </div>
      </div>
    </div>
    </div>
  );
}

/**
 * 카드 한 면.
 *
 * 바탕과 모서리는 벌이 정한다(`SURFACE`). 그 위에 늘 깔려 있는 광택 한 겹과
 * 넘어갈 때만 지나가는 빛 한 줄기가 얹힌다. 둘 다 글자 위를 덮어야 표면에 비친
 * 빛으로 보이므로 내용보다 뒤에 그린다.
 */
function Face({
  skin,
  flipped,
  turns,
  children,
}: {
  skin: Skin;
  flipped?: boolean;
  /** 넘긴 횟수. 바뀔 때마다 빛이 새로 지나간다. */
  turns: number;
  children: React.ReactNode;
}) {
  const surface = SURFACE[skin];
  return (
    <div
      style={surface.style}
      className={`absolute inset-0 overflow-hidden rounded-[10px] [backface-visibility:hidden] ${surface.shadow} ${
        flipped ? "[transform:rotateY(180deg)]" : ""
      }`}
    >
      {children}

      {/*
        늘 깔려 있는 광택 — 표면에 씌운 코팅이라 글자 위까지 덮는다. 바탕이
        이미 밝고 어두운 띠를 가지고 있어서 여기서는 옅게만 얹는다.
      */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(118deg,rgba(255,255,255,0.10)_0%,rgba(255,255,255,0.03)_28%,rgba(255,255,255,0)_46%,rgba(255,255,255,0)_72%,rgba(255,255,255,0.06)_100%)]"
      />

      {/*
        지나가는 빛. 뒷면은 부모가 좌우로 뒤집어 놓아서 그대로 두면 빛이 화면
        에서는 반대로 흐른다 — 한 번 더 뒤집어 앞뒤가 같은 방향으로 흐르게 한다.

        이 상자는 자르지 않는다. 띠가 상자 밖으로 나가며 지나가는 것이라 여기서
        자르면 아예 안 보인다 — 카드 모서리에서 잘리는 것은 면(Face)이 맡는다.
      */}
      {turns > 0 ? (
        <span
          key={turns}
          aria-hidden
          className={`pointer-events-none absolute inset-y-[-60%] left-0 w-[45%] ${
            flipped ? "scale-x-[-1]" : ""
          }`}
        >
          <span className="card-shine absolute inset-0 block bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.45)_50%,transparent_100%)] blur-[4px]" />
        </span>
      ) : null}
    </div>
  );
}

/** 뒤집기 단추 — 프레임에는 그림만 있고 동작이 없다. 그림은 23, 누르는 자리는 44. */
function FlipButton({
  skin,
  onClick,
  className,
}: {
  skin: Skin;
  onClick: () => void;
  className: string;
}) {
  return (
    <button
      type="button"
      aria-label={card.flip}
      onClick={onClick}
      className={`tap absolute z-10 flex size-[23px] ${className}`}
    >
      <Img src={INK[skin].flip} className="size-full" />
    </button>
  );
}

/**
 * 앞면 — 2093:6154(블랙) · 2093:6082(신용) · 2093:6118(체크).
 *
 * 왼쪽 위 제목, 왼쪽 가운데 칩, 가운데 무늬(블랙은 VIP, 나머지는 로고 네 조각),
 * 그 밑 카드번호, 오른쪽 아래 점원 캐릭터, 발급일. 발급일은 캐릭터 위에 얹힌다
 * — 프레임이 그렇다. 왼쪽 아래에 있던 로고 마크는 새 디자인에서 빠졌다.
 */
function Front({ skin }: { skin: Skin }) {
  const ink = INK[skin];
  return (
    <>
      {skin === "black" ? (
        /*
          VIP — 100px 짜리 글자에 위아래 그라데이션을 입혀 반투명한 워터마크로
          쓴다. 배경을 글자 모양으로 잘라내는 방식이라 글자 자체는 투명하다.
        */
        <span
          aria-hidden
          className="absolute top-[calc(50%-1px)] left-[calc(50%+0.5px)] -translate-x-1/2 -translate-y-1/2 bg-[linear-gradient(180deg,rgba(255,255,255,0.5)_0%,rgba(153,153,153,0.5)_100%)] bg-clip-text font-serif text-[100px] leading-none whitespace-nowrap text-transparent"
        >
          {card.face.black.tier}
        </span>
      ) : (
        /* 로고 네 조각 — 반투명 그라데이션이 그림 안에 들어 있다(2093:6101) */
        <Img
          src="/assets/my/logo-shapes.svg"
          className="absolute top-1/2 left-1/2 h-[45px] w-[202.235px] -translate-x-1/2 -translate-y-1/2"
        />
      )}

      <span
        className={`absolute top-[10px] left-[10px] font-serif text-lg leading-[1.3] font-bold whitespace-nowrap ${ink.title}`}
      >
        {card.face[skin].title}
      </span>

      <Chip />

      {/*
        카드번호 — 네 덩어리를 157 안에 고르게 벌린다. 플라스틱 카드(신용 · 체크)는
        양각처럼 위에 밝은 선, 아래에 어두운 선을 살짝 둔다 — 실제 카드의 눌러
        찍은 숫자.
      */}
      <div
        className={`absolute top-[147px] left-[calc(50%-0.5px)] flex w-[157px] -translate-x-1/2 items-center justify-between text-xs leading-[1.3] ${ink.number} ${
          skin === "black"
            ? ""
            : "[text-shadow:0_0.5px_0_rgba(255,255,255,0.45),0_-0.5px_0_rgba(0,0,0,0.35)]"
        }`}
      >
        {card.number.map((group, index) => (
          <span key={index}>{group}</span>
        ))}
      </div>

      <Clerk />

      <div
        className={`absolute bottom-[10px] left-3/4 flex -translate-x-1/2 items-center gap-1 py-[2px] whitespace-nowrap ${ink.issued}`}
      >
        <span className="text-sm leading-[1.3] font-medium">{card.issued.label}</span>
        <span className="text-xs leading-[1.3]">{card.issued.value}</span>
      </div>
    </>
  );
}

/**
 * 점원 캐릭터 — 오른쪽 아래 모서리에 걸쳐 선다(1554:3723 · 1554:3710).
 *
 * 몸통은 프레임이 도형으로 그린 것이라 그대로 도형이다 — 위가 둥근 검은
 * 기둥에 흰 눈 둘과 웃는 입. 모자만 그림(hat.svg). 카드 모서리를 넘는 부분은
 * 면(Face)이 자른다.
 */
function Clerk() {
  return (
    <div aria-hidden className="absolute right-0 bottom-0 h-[120.754px] w-[105.892px]">
      <div className="absolute right-0 bottom-0 h-[104.035px] w-[89.172px] rounded-t-full bg-[#0c0c0c]">
        <span className="absolute top-[29.72px] left-[22.29px] size-[9.289px] rounded-full bg-white" />
        <span className="absolute top-[29.72px] right-[22.29px] size-[9.289px] rounded-full bg-white" />
        <span className="absolute top-[52.02px] left-[33.44px] h-[11.147px] w-[22.293px] rounded-b-full bg-white" />
      </div>
      <Img src="/assets/my/hat.svg" className="absolute top-0 left-0 h-[34.369px] w-[96.604px]" />
    </div>
  );
}

/**
 * IC 칩 — 1554:3743.
 *
 * 프레임은 얇은 선 여섯 개로 칸을 나눠 그렸다. 왼쪽 세 칸과 그것을 뒤집은
 * 오른쪽 세 칸이라, 같은 칸을 두 번 그리고 한쪽만 뒤집는다.
 */
const CHIP_ROWS = [
  { top: 0, height: 9.333, bottom: true },
  { top: 9.2, height: 9.6, bottom: true },
  { top: 18.8, height: 9.333, bottom: false },
];

function Chip() {
  return (
    <div
      aria-hidden
      className="absolute top-[98px] left-[10px] h-[28px] w-[44.24px] overflow-hidden rounded-[4px] bg-[#f4f4f3]"
    >
      {CHIP_ROWS.map((row) =>
        [0, 30.8].map((left) => (
          <span
            key={`${row.top}-${left}`}
            style={{ top: row.top, left, height: row.height }}
            className={`absolute w-[13.413px] rounded-tl-[4px] border-[#070908] border-r-[0.5px] ${
              row.bottom ? "border-b-[0.5px]" : ""
            } ${left === 0 ? "" : "rotate-180"}`}
          />
        )),
      )}
    </div>
  );
}

/**
 * 뒷면 — 2093:6260(블랙) · 2093:6186(신용) · 2093:6223(체크).
 *
 * 위에 마그네틱 띠가 지나가고 그 아래에 사진과 회원 정보가 있다. 정보는 전부
 * 고른 사람의 것이다 — 이름 · 영수증 수는 퍼소나, 관심사는 가입 설문, 코인은
 * 지갑. 가입 화면에서 고쳐 적은 이름과 넣은 사진이 있으면 그것이다(useMyPhoto).
 */
function Back({ skin }: { skin: Skin }) {
  const ink = INK[skin];
  const persona = usePersona();
  const coins = useCoins();
  const survey = useSyncExternalStore(subscribeSurvey, getSurvey, getSurveyServerSnapshot);

  const name = useUserName().full;
  const photo = useMyPhoto();
  const receipts = persona?.receipts ?? 12;
  const likes = survey.interests
    .map((id) => interestOptions.find((one) => one.id === id)?.name)
    .filter((one): one is string => Boolean(one));

  return (
    <>
      <div aria-hidden className={`absolute top-[25px] left-0 h-[30px] w-full ${ink.stripe}`} />

      <div className="absolute top-[74px] left-[18px] flex items-start gap-[10px]">
        <Img src={photo} className="h-[93px] w-[76px] shrink-0 object-cover" />

        <div className={`flex w-[231px] flex-col items-end gap-[3px] ${ink.title}`}>
          <Row label={card.labels.name} line={ink.line}>
            <span className="text-sm leading-[1.3] font-medium">{name}</span>
          </Row>

          <Row label={card.labels.receipts} line={ink.line}>
            <span className="text-sm leading-[1.3] font-medium">
              {receipts}
              {card.receiptsUnit}
            </span>
          </Row>

          <Row label={card.labels.likes} line={ink.line}>
            <span className="flex items-center gap-1">
              {likes.length ? (
                likes.map((one, index) => (
                  <span key={one} className="flex items-center gap-1">
                    {index > 0 ? <span className="text-xs leading-[1.3]">/</span> : null}
                    <span className="text-sm leading-[1.3] font-medium">{one}</span>
                  </span>
                ))
              ) : (
                <span className="text-sm leading-[1.3] font-medium">—</span>
              )}
            </span>
          </Row>

          <Row label={card.labels.coins} line={ink.line}>
            <span className="flex items-center justify-center gap-1">
              <span className="text-sm leading-[1.3] font-medium">
                {coins}
                {card.coins.unit}
              </span>
              <button
                type="button"
                className={`tap [--tap:20px] flex items-center justify-center rounded-[10px] px-[5px] text-xs leading-[1.3] ${ink.pill}`}
              >
                {card.coins.cta}
              </button>
            </span>
          </Row>

          {/* 맨 아랫줄 — 왼쪽에 프로필 수정, 오른쪽에 로고 마크. 밑줄이 없다. */}
          <div className="flex w-full items-center justify-between">
            <button
              type="button"
              onClick={() => showToast(myLinksCopy.soon(card.edit))}
              className={`tap [--tap-w:0px] flex items-center justify-center rounded-full border px-[9px] py-[5px] text-center text-xs leading-[1.3] ${ink.button}`}
            >
              {card.edit}
            </button>
            <Img src={ink.mark} className="h-[14px] w-[62.918px]" />
          </div>
        </div>
      </div>
    </>
  );
}

/** 뒷면 정보 한 줄 — 이름표는 12 보통, 값은 14 중간이고 밑줄이 깔린다. */
function Row({
  label,
  line,
  children,
}: {
  label: string;
  line: string;
  children: React.ReactNode;
}) {
  return (
    <span className={`flex w-full items-center justify-between border-b py-[2px] whitespace-nowrap ${line}`}>
      <span className="text-xs leading-[1.3]">{label}</span>
      {children}
    </span>
  );
}
