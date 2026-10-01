/**
 * 알래봇 대화 — Figma node 1191:2865.
 *
 * 인사와 알약은 미리 적어 둔 것이 차례로 올라오고, 그 뒤로 오가는 말은
 * Claude 에게 물어 온다(`/api/ai`). 모양이 정해진 답 하나만 아래에 적어 둔다.
 */

import type { BotAnswer, BotLine, BotScript } from "@/types/ai";

export type { BotAnswer, BotLine, BotScript };

export const bot = {
  /** 이름은 어디서나 「알래봇」 하나 — 「AI 알래봇」 · 「AI에게」로 갈려 있었다(감수 지적) */
  title: "알래봇",
  name: "알래봇",
  badge: "알바생",
  placeholder: "메시지를 입력해주세요.",
  /** 답을 가져오지 못했을 때 — 없는 대답을 지어내지 않는다. */
  fallback: ["지금은 답을 가져오지 못했어요.", "잠시 뒤에 다시 물어봐 주세요."],
  /** 답은 못 가져왔지만 제목이 맞는 지식은 찾았을 때 */
  offlineFound: ["지금은 답을 가져오지 못했지만,", "이런 지식이 진열대에 있어요!"],
  /** 안내 카드의 문구 */
  refs: {
    posts: "이 글에 있어요",
    links: "바깥에서 찾아보기",
    write: "내가 직접 등록하기",
  },
} as const;

/** 입력바 옆 단추 — 알약을 다시 꺼낸다. 돌아온 사람은 인사를 다시 안 듣는다. */
export const chipsAgain = {
  label: "자주 묻는 질문 보기",
  lines: [
    { kind: "bot", text: ["아래 버튼에서 골라보셔도 좋아요!"] },
    {
      kind: "chips",
      items: ["지식 추천", "토론 주제 추천", "가장 많이 본 분야", "핵심 내용 요약", "출처 확인", "이 글 요약해줘"],
    },
    { kind: "time" },
  ] as BotLine[],
};

/** 첫 인사 한 마디 — 처음 한 번만. 지식문의로 들어와도 처음이면 이것부터 */
export const hello: BotLine = { kind: "bot", text: ["안녕하세요. 알바생 알래봇 입니다."] };

/**
 * 지식문의 — 지식 상세의 「알래봇에게 물어보기」로 들어왔을 때(1202:3843).
 * 「콘텐츠 문의 주셨습니다 · 어떤 점이 궁금하신가요?」 뒤에 그 글의 카드가 붙는다.
 */
export const inquiryOpening: BotLine[] = [
  { kind: "bot", text: ["콘텐츠 문의 주셨습니다.", "어떤 점이 궁금하신가요?"] },
];
/** 카드의 표 · 말풍선의 출처 줄 */
export const inquiryCopy = { tag: "지식문의", source: "출처: " } as const;

/** 들어오자마자 차례로 올라오는 인사 — 처음 한 번만. */
export const opening: BotLine[] = [
  hello,
  {
    kind: "bot",
    text: ["궁금한 지식이 있다면 언제든지 물어보세요!", "아래 버튼에서 골라보셔도 좋아요!"],
  },
  chipsAgain.lines[1],
  { kind: "time" },
];

/**
 * 미리 적어 둔 답 — 화면에 그려 둔 모양이 있는 것만 남긴다.
 *
 * 「토론 주제 추천」은 A VS B 가 든 말풍선(1191:2995)이라 디자인이 정해져
 * 있다. 모델은 그 모양을 만들어 낼 수 없으므로 이것만 적어 둔 채로 둔다.
 *
 * 나머지 알약과 손으로 친 말은 모두 Claude 에게 물어 온다(/api/ai). 예전에는
 * 여기 여섯 개를 다 적어 두었는데, 무엇을 물어도 같은 말만 돌아왔다.
 */
export const scripts: BotScript[] = [
  {
    chip: "토론 주제 추천",
    lines: [
      {
        kind: "versus",
        text: ["근무 시간을 줄이면 집중도가 올라가", "생산성이 높아질까, 업무 과중으로 이어질까?"],
        a: "생산성 및 삶의 질 향상",
        b: "업무 밀도 증가 및 부작용",
      },
      { kind: "bot", text: ["선택지를 선택하시면", "거기에 맞는 자료를 찾아드릴게요."] },
      { kind: "time" },
    ],
  },
];

export const scriptFor = (chip: string): BotScript | undefined =>
  scripts.find((script) => script.chip === chip);
