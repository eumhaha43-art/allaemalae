/**
 * 검색 — Figma 556:5226 (와이어프레임).
 *
 * 인기 목록은 검색 화면 말고 홈의 「인기 · 새로운 글」에서도 여기로 오게
 * 되어 있다(디자인 주석) — 그래서 목록을 화면이 아니라 데이터로 둔다.
 */

import { recent } from "@/data/common/community";
import { rooms as chatRooms } from "@/data/common/chat";
import { rooms as debateRooms } from "@/data/common/debate";
import { getKnowledge, shelfKnowledge } from "@/data/common/knowledge";
import type { RankItem } from "@/types/search";

export const tabs = ["인기", "최신", "최근 검색"] as const;

export const placeholder = "궁금한 지식을 검색해보세요";

export const popular: RankItem[] = [
  {
    id: "price",
    title: "편의점 가격표 끝자리가 900원인 이유는?",
    views: "2.3k",
    move: { kind: "up", by: 2 },
  },
  {
    id: "kkk",
    title: "‘ㅋㅋㅋ’은 언제부터 쓰기 시작했을까?",
    views: "1.8k",
    move: { kind: "same" },
  },
  {
    id: "barcode",
    title: "바코드 앞 세 자리가 알려주는 것",
    views: "1.2k",
    move: { kind: "new" },
  },
  {
    id: "door",
    title: "편의점 문에 붙은 눈금의 정체",
    views: "980",
    move: { kind: "up", by: 1 },
  },
  {
    id: "icecream",
    title: "아이스크림에 유통기한이 없는 이유",
    views: "860",
    move: { kind: "down", by: 1 },
  },
];

/** 6~10위 — 「더보기」를 누르면 이어 붙는다. */
export const popularMore: RankItem[] = [
  { id: "expiry", title: "유통기한과 소비기한은 무엇이 다를까?", views: "740", move: { kind: "up", by: 3 } },
  { id: "triangle", title: "편의점 삼각김밥은 왜 삼각형일까?", views: "690", move: { kind: "same" } },
  { id: "banana", title: "바나나는 나무가 아니라 풀에서 열린다", views: "610", move: { kind: "down", by: 2 } },
  { id: "gavel", title: "판사가 두드리는 망치, 영국 법정엔 없다", views: "580", move: { kind: "new" } },
  { id: "jeans", title: "청바지 작은 주머니는 회중시계 자리였다", views: "520", move: { kind: "up", by: 1 } },
];

export const more = "6~10위 더보기";

/**
 * 검색어와 맞으면 미리보기로 띄울 것들.
 *
 * 실제로 열리는 화면이 있는 것만 모은다 — 눌렀는데 아무 데도 못 가면 검색이
 * 아니라 장식이 된다. 제목은 각 화면의 데이터에서 그대로 가져오므로, 글이나
 * 방 이름이 바뀌면 검색 결과도 같이 바뀐다.
 *
 * 두 무리다(감수 지적 — 「세종」을 쳐도 점장님 Pick 의 세종대왕이 안 나왔다).
 *   지식     점장님이 진열한 지식(shelfKnowledge)과 카드뉴스가 있는 글 — 지식 상세로
 *   커뮤니티 글 · 채팅방 · 토론방(상세가 있는 방 전부)
 * 제목만이 아니라 갈래(역사 · 한국사 …)로도 찾는다 — 「역사」를 치면 역사 지식이
 * 죄다 나온다.
 */
export type HitGroup = "지식" | "커뮤니티";
export type Hit = {
  id: string;
  title: string;
  /** 오른쪽 작은 표 — 갈래나 어디에 있는 것인지 */
  where: string;
  href: string;
  group: HitGroup;
  /** 제목 말고도 걸리는 말 — 갈래 · 소분류 */
  tags: string[];
};

const knowledgeHit = (post: (typeof shelfKnowledge)[number]): Hit => ({
  id: `knowledge-${post.id}`,
  title: post.title,
  where: post.topic ? `${post.category} · ${post.topic}` : post.category,
  href: `/menu/knowledge/${post.id}`,
  group: "지식",
  tags: [post.category, post.topic ?? ""].filter(Boolean),
});

export const searchable: Hit[] = [
  ...shelfKnowledge.map(knowledgeHit),
  ...recent.posts.filter((post) => post.cards?.length).map(knowledgeHit),
  ...recent.posts.map((post) => ({
    id: `post-${post.id}`,
    title: post.title,
    where: "커뮤니티 글",
    href: `/community/post/${post.id}`,
    group: "커뮤니티" as const,
    tags: [post.category],
  })),
  ...chatRooms.map((room) => ({
    id: `chat-${room.id}`,
    title: room.title,
    where: "채팅방",
    href: `/community/chat/${room.id}`,
    group: "커뮤니티" as const,
    tags: [],
  })),
  ...debateRooms
    .filter((room) => room.ready)
    .map((room) => ({
      id: `debate-${room.id}`,
      title: room.title,
      where: "토론방",
      href: `/community/debate/${room.id}`,
      group: "커뮤니티" as const,
      tags: [],
    })),
];

const squash = (text: string) => text.replace(/\s+/g, "").toLowerCase();

/** 띄어쓰기와 대소문자는 무시하고 제목이나 갈래 안에 들어 있으면 맞은 것으로 본다. */
export function findHits(keyword: string): Hit[] {
  const needle = squash(keyword);
  if (!needle) return [];
  return searchable.filter(
    (hit) => squash(hit.title).includes(needle) || hit.tags.some((tag) => squash(tag).includes(needle)),
  );
}

/** 무리별로 — 지식이 먼저다. 한 무리에 너무 많으면 앞의 여섯만. */
export function groupHits(hits: Hit[]): { group: HitGroup; items: Hit[] }[] {
  return (["지식", "커뮤니티"] as const)
    .map((group) => ({ group, items: hits.filter((hit) => hit.group === group).slice(0, 6) }))
    .filter((one) => one.items.length > 0);
}

/**
 * 인기 순위 한 줄이 갈 곳 — 그 지식이 있으면 상세로, 없으면 null(준비 중).
 * 순위의 id 는 지식 id 와 같게 적어 두었다(price · banana · jeans).
 */
export function rankHref(item: RankItem): string | null {
  return getKnowledge(item.id) ? `/menu/knowledge/${item.id}` : null;
}

/** 맞는 것이 없을 때 — 대신 눌러 볼 말. 인기 순위의 앞 셋에서 낱말을 뽑는다. */
export const suggestions = ["세종대왕", "편의점", "바나나", "역사"];
export const searchCopy = {
  none: (keyword: string) => `「${keyword}」에 맞는 지식이 아직 없어요`,
  instead: "이런 말로 찾아보세요",
  clear: "지우기",
  soon: "준비 중인 지식이에요",
} as const;

/** 최신 · 최근 검색은 와이어프레임에 내용이 없어 비워 둔다. 최신의 말은 빈 상태 시안(1968:7142)의 것. */
export const emptyBy: Record<(typeof tabs)[number], string> = {
  "인기": "",
  "최신": "새로 올라온 지식이 없어요",
  "최근 검색": "최근 검색한 지식이 없어요",
};
