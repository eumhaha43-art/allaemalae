import Img from "@/components/common/Img";

/**
 * 대화 아래에 깔리는 자리 그림 — Figma 1886:6453(디자이너가 고친 것. 전에는 1191:3020).
 *
 * 알바생이 모니터 앞에 앉아 이 대화를 받아 적고 있다는 장면이다. 화면이
 * 대화만 있으면 검은 판인데, 여기 하나 두면 「편의점 뒷방」이 된다.
 *
 * 새 그림은 모니터 왼쪽에 붉은 갓의 책상 등이 서서 아래로 붉은 빛(반투명
 * 사다리꼴)을 흘리고, 바닥은 왼쪽이 어두운 초록으로 비스듬히 갈린다. 전에는
 * 계산대 스캐너였다. 시안대로 원래 밝기로 깐다 — 전에는 0.45 로 흐렸는데,
 * 「알래봇 배경은 다 이걸로」라는 지시라 시안을 따른다.
 *
 * 모니터는 네모 몇 개라 요소로 그린다. 등과 바닥은 그림 파일이다(시안에서
 * 그대로 내보낸 것). 등의 갓과 빛은 함께 숨을 쉰다(scanner-blink) — 켜진 등이다.
 */
/**
 * 말풍선 하나가 늦게 뜨는 폭 — `.desk-bubble` 한 바퀴(7.2초)의 3분의 1.
 *
 * 위에서부터 차례로 떠야 대화가 쌓이는 것으로 읽힌다. 한꺼번에 뜨면 그림
 * 한 장이 통째로 깜빡이는 것이 된다.
 */
const BUBBLE_STEP_MS = 2400;

export default function BotDesk() {
  return (
    <div aria-hidden className="relative mt-auto h-[125px] w-full shrink-0 overflow-x-clip">
      {/* 책상 위 — 1886:6454. 가로 402 기준 자리를 오른쪽 끝에서 잰다 — 좁은 화면에서 밖으로 나가지 않게 */}
      <div className="absolute top-0 right-[25px] h-[100px] w-[148px]">
        {/* 책상 등의 기둥 — 1886:6455. 모니터 뒤에 선다 */}
        <Img
          src="/assets/ai/lamp-stem.svg"
          className="absolute top-[43px] left-0 h-[51px] w-[29px] max-w-none"
        />

        <div className="absolute top-0 left-[23px] h-[100px] w-[125px]">
          {/* 받침대와 발 — 1886:6461 · 1886:6462 */}
          <div className="absolute top-[66px] left-[51px] h-[27px] w-[23px] bg-[#e3e3e3]" />
          <div className="absolute top-[75px] left-0 h-[25px] w-[125px] rounded-[3px] bg-[#e3e3e3]" />

          {/* 모니터 — 흰 테에 검은 화면. 1886:6478 · 1886:6479 */}
          <div className="absolute top-0 left-[5px] w-[116px] rounded-[5px] bg-white p-1">
            <div className="h-[60px] w-[108px] rounded-[3px] bg-black" />
          </div>

          {/*
            모니터 안에서도 말이 오간다 — 1886:6481 · 6483 · 6485.
            내 말만 초록이라, 이 화면이 지금 이 대화라는 표시가 된다.

            셋이 위에서부터 차례로 떠올랐다 사그라든다(`desk-bubble`). 가만히
            박혀 있으면 모니터에 띄워 둔 그림이고, 느리게 오가면 저쪽에서도
            지금 대화가 이어지는 중인 것으로 읽힌다. 늦추는 폭은 한 바퀴의
            3분의 1씩이라 늘 두엇은 떠 있다 — 다 같이 사라지면 모니터가 꺼진
            것처럼 보인다.
          */}
          <div
            className="desk-bubble absolute top-px left-[6px] w-[71px] p-[10px]"
            style={{ animationDelay: `${BUBBLE_STEP_MS * 0}ms` }}
          >
            <p className="w-full rounded-[10px] rounded-tl-none bg-white text-center text-xs leading-none font-medium text-black">
              ...
            </p>
          </div>
          <p
            className="desk-bubble absolute top-[28px] left-[63px] w-[51px] rounded-[10px] rounded-tr-none bg-primary-600 text-center text-xs leading-none font-medium text-[#f8f9f8]"
            style={{ animationDelay: `${BUBBLE_STEP_MS * 1}ms` }}
          >
            ...
          </p>
          <p
            className="desk-bubble absolute top-[47px] left-4 w-[51px] rounded-[10px] rounded-tl-none bg-white text-center text-xs leading-none font-medium text-black"
            style={{ animationDelay: `${BUBBLE_STEP_MS * 2}ms` }}
          >
            ...
          </p>
        </div>

        {/*
          책상 등의 갓과 빛 — 1886:6490 · 1886:6491. 갓은 붉은 알약, 빛은 아래로
          퍼지는 반투명 사다리꼴이라 모니터 받침 위로 겹치면 그쪽이 발갛게 물든다
          (시안이 그렇다). 둘이 같은 박자로 숨 쉰다 — 켜진 등.
        */}
        <Img
          src="/assets/ai/lamp-cap.svg"
          className="scanner-blink absolute top-[46px] left-[2px] h-[9px] w-[22px] max-w-none"
        />
        <Img
          src="/assets/ai/lamp-beam.svg"
          className="scanner-blink absolute top-[50.5px] -left-4 h-[50px] w-[59px] max-w-none"
        />
      </div>

      {/* 편의점 뒷방 바닥 — 1886:6487. 왼쪽이 어두운 초록으로 비스듬히 갈린다 */}
      <Img
        src="/assets/ai/ground.svg"
        className="absolute bottom-0 left-0 h-[25px] w-full"
      />
    </div>
  );
}
