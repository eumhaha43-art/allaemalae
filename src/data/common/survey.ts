/**
 * 가입 설문 — Figma 1501:4334 · 1501:4226 · 1501:4276 · 1501:4784.
 *
 * 회원가입을 마친 사람에게 세 가지를 묻고(관심사 · 난이도 · 알림 시간), 마지막에
 * 「매대를 바꾸는 중」 화면을 보여 준 뒤 앱으로 들여보낸다.
 *
 * 프레임 위쪽의 초록 배너(점원이 인사하는 띠)는 넣지 않는다 — 세 장 내내 같은
 * 말이 붙어 있어 정작 질문이 화면 아래로 밀렸다. 물음은 화면에서 가장 먼저
 * 읽혀야 한다.
 */

import { fields } from "@/data/common/menu";

export const survey = {
  /** 관심사 — 1501:4334 */
  interests: {
    title: "당신의 관심사는 무엇인가요?",
    sub: "선택하신 주제를 바탕으로 개인화된 지식 피드를 구성합니다.",
    limit: "(최대 2개)",
    note: ["선택한 관심사는 언제든 ", "MY > 관심 카테고리", " 에서 바꿀 수 있어요!"],
    /** 최대 몇 개까지 고를 수 있는지 */
    max: 2,
    cta: "다음",
  },
  /** 난이도 — 1501:4226 */
  level: {
    title: "당신의 유형은 무엇인가요?",
    sub: "이해하기 쉬운 난이도로 지식 피드를 추천해 드려요.",
    note: ["난이도는 언제든 ", "MY > 관심 카테고리", " 에서 바꿀 수 있어요!"],
    cta: "다음",
  },
  /** 알림 시간 — 1501:4276 */
  time: {
    title: "하루 언제 지식을 충전할까요?",
    sub: "가장 편안한 시간대에 맞춰 잊지 않게 알림을 보내드려요.",
    more: "알림 시간 설정",
    note: ["알림 시간은 언제든 ", "MY > 알림 설정", " 에서 바꿀 수 있어요!"],
    cta: "알래말래븐 입장하기",
  },
  /** 진열 중 — 1501:4784 */
  ready: {
    /** 맨 위 알약(badge, 「알래말래븐 편의점 진열 중..」)은 뺐다 — 사용자 지시 */
    wait: "잠시만 기다려 주세요..",
    /** 다 차면 — 「기다려 주세요」가 100% 옆에 남아 있었다(감수 지적) */
    ready: "준비 완료!",
    /** 「{이름}님에게 꼭 맞는 지식으로 / 매대 상품을 교체 하고 있어요!」 */
    line1: "님에게 꼭 맞는 지식으로",
    mark: "매대 상품을 교체",
    line2: " 하고 있어요!",
    /**
     * 세 줄은 동그라미가 도는 동안 하나씩 끝난다 — 그래서 줄마다 「하는 중」과
     * 「끝났다」 두 벌을 둔다. 전에는 둘이 이미 끝난 채로 시작해서, 정작 기다리는
     * 일은 마지막 하나뿐인 것처럼 보였다.
     */
    steps: [
      { doing: "관심 분야 분석 중", done: "관심 분야 분석 완료" },
      { doing: "맞춤 난이도 최적화 중", done: "맞춤 난이도 최적화 완료" },
      { doing: "신상 콘텐츠 진열 중", done: "신상 콘텐츠 진열 완료" },
    ],
    cta: "알래말래븐 입장하기",
    /** 이름을 아직 안 정했을 때 — 퍼소나의 이름을 쓴다 */
    guest: "민정",
  },
  step: (at: number) => `STEP ${at}/3`,
} as const;

/** 고를 수 있는 분야 — 메뉴의 갈래 표(menu.ts fields) 그대로. 두 곳이 따로 적혀 어긋났었다(감수 지적). */
export const interestOptions = fields;

/**
 * 난이도 — 1501:4226. 그림은 디자이너가 그린 것(1968:6552 — 알에서 나오는 병아리 ·
 * 돋보기 · 뇌, 이 차례). 전에는 이모지(🐣 🔍 🧠)였는데 기기마다 생김이 달랐다.
 */
export const levelOptions = [
  { id: "lv1", icon: "/assets/survey/level-1.svg", label: "Lv.1 세상을 알아가는 입문자" },
  { id: "lv2", icon: "/assets/survey/level-2.svg", label: "Lv.2 궁금한 게 많은 탐험가" },
  { id: "lv3", icon: "/assets/survey/level-3.svg", label: "Lv.3 걸어 다니는 잡학 사전" },
];

/** 알림 시간 — 1501:4276 */
/**
 * 알림 시간대 — 아침부터 밤까지 빈 시간 없이 이어지고, 안 받는 길도 있다.
 * 전에는 10~11시 · 14~17시 · 20~21시가 어느 칸에도 없었고 「받지 않기」가
 * 없었다(감수 지적). `short` 는 MY 설정 줄에 적는 짧은 말.
 *
 * 그림은 디자이너가 그린 것(시안 1968:7180 — morning · lunch · afternoon · dinner ·
 * night · alarmNone)을 그대로 내보낸 SVG 다(사용자 요청). 전에는 이모지였다.
 */
export const timeOptions = [
  { id: "morning", icon: "/assets/survey/time-morning.svg", label: "아침 (06:00~11:00)", short: "아침" },
  { id: "noon", icon: "/assets/survey/time-noon.svg", label: "점심 (11:00~14:00)", short: "점심" },
  { id: "afternoon", icon: "/assets/survey/time-afternoon.svg", label: "오후 (14:00~17:00)", short: "오후" },
  { id: "evening", icon: "/assets/survey/time-evening.svg", label: "저녁 (17:00~21:00)", short: "저녁" },
  { id: "night", icon: "/assets/survey/time-night.svg", label: "밤 (21:00 이후)", short: "밤" },
  { id: "off", icon: "/assets/survey/time-off.svg", label: "알림 받지 않기", short: "받지 않음" },
];

/**
 * 설문을 마치면 가는 곳 — 홈.
 *
 * 전에는 로그인 화면을 한 번 거쳤다. 방금 가입하고 취향까지 다 말한 사람에게
 * 「로그인하고 시작하기」를 또 누르게 하는 셈이라 뺐다 — 사용자 지적. 로그인
 * 화면은 쓰던 사람(한상현)의 여는 화면 → 로그인 → 홈 길에만 남는다.
 */
export const AFTER_SURVEY = "/";
