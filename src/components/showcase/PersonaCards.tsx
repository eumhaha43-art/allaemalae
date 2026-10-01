"use client";

import Img from "@/components/common/Img";
import { personas, picker } from "@/data/common/personas";
import { usePersona } from "@/hooks/usePersona";
import { usePersonaStart } from "@/components/showcase/usePersonaStart";

/**
 * 퍼소나 카드 둘과 「이 계정 처음부터 체험」 — PC 셸의 왼쪽 칸과 모바일 바텀시트가
 * 같은 것을 그린다. 바탕이 다르다(셸은 어두운 밤, 시트는 흰 판) — `light` 로
 * 글자 · 테두리 색만 바꾼다.
 *
 * 얼굴은 그 사람의 사진(Persona.photo)이다 — 김민정은 가입 때 넣는 토끼 인형,
 * 한상현은 회원증 뒷면의 사진. 전에는 이름 첫 글자만 둥근 바탕에 앉혔는데
 * 이니셜만 덩그러니 있는 것은 프로필로 안 보였다(기획 피드백). 회원증 · 메뉴
 * 프로필과 같은 사진이라 고른 뒤에 앱 안에서 보는 얼굴과도 이어진다.
 */
export default function PersonaCards({ light = false, onPicked }: { light?: boolean; onPicked?: () => void }) {
  const chosen = usePersona();
  const start = usePersonaStart();
  const go = (persona: (typeof personas)[number]) => {
    start(persona);
    onPicked?.();
  };

  const ink = light
    ? {
        ask: "text-gray-500",
        on: "border-primary-600 bg-primary-100/60",
        off: "border-gray-200 bg-white active:bg-gray-50",
        name: "text-gray-black",
        tag: "text-gray-500",
        line: "text-gray-600",
        mark: "text-gray-500",
        restart: "text-gray-500 hover:text-gray-800 disabled:hover:text-gray-500",
      }
    : {
        ask: "text-white/70",
        on: "border-white/45 bg-white/20",
        off: "border-white/15 bg-white/8 hover:bg-white/14",
        name: "text-white",
        tag: "text-white/60",
        line: "text-white/65",
        mark: "text-white/70",
        restart: "text-white/55 hover:text-white/80 disabled:hover:text-white/55",
      };

  return (
    <div className="flex w-full flex-col gap-[10px]">
      <p className={`text-[13px] leading-[1.4] ${ink.ask}`}>{picker.ask}</p>

      {personas.map((persona) => {
        const on = chosen?.id === persona.id;
        return (
          <button
            key={persona.id}
            type="button"
            onClick={() => go(persona)}
            className={`flex w-full items-center gap-3 rounded-[12px] border px-[14px] py-3 text-left transition-colors ${
              on ? ink.on : ink.off
            }`}
          >
            <Img
              src={persona.photo}
              className="size-11 shrink-0 rounded-full bg-gray-200 object-cover ring-2 ring-white/60"
            />

            <span className="flex min-w-px flex-1 flex-col">
              <span className="flex items-baseline gap-[6px]">
                <span className={`text-[15px] leading-[1.3] font-semibold ${ink.name}`}>{persona.name}</span>
                <span className={`text-[11px] leading-[1.3] ${ink.tag}`}>{persona.tag}</span>
              </span>
              <span className={`pt-[3px] text-[12px] leading-[1.35] ${ink.line}`}>{persona.line}</span>
            </span>

            {/* 고른 것에는 체크, 아닌 것에는 화살표 — 「지금 이 사람」과 「이쪽으로 갈 수 있다」 */}
            <span aria-hidden className={`shrink-0 text-[15px] leading-none ${ink.mark}`}>
              {on ? "✓" : "→"}
            </span>
          </button>
        );
      })}

      {/* 같은 사람으로 처음부터 다시 — 시연을 두 번 보여 줄 때 */}
      <button
        type="button"
        disabled={!chosen}
        onClick={() => chosen && go(chosen)}
        className={`self-center pt-1 text-[12px] leading-[1.4] underline underline-offset-4 transition-opacity disabled:opacity-35 ${ink.restart}`}
      >
        {picker.restart}
      </button>
    </div>
  );
}
