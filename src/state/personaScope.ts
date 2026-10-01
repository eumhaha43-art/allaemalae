import { findPersona } from "@/data/common/personas";

/**
 * 사람마다 따로 두는 저장소들이 같이 쓰는 두 가지 — 열쇠와, 남길지 말지.
 *
 * 글 · 댓글 · 좋아요 · 근거 · 채팅방 · 영수증 · 보관함은 전부 「내 것」으로
 * 그려지고 고치고 지울 수 있어서, 사람이 바뀌면 통째로 갈아 끼워야 한다
 * (coinStore 의 `follow()` 와 같은 규칙). 열쇠 뒤에 퍼소나 id 를 붙인다.
 *
 * 오늘 막 가입한 사람(김민정 · 이 탭에서 가입한 사람)의 것은 localStorage 에
 * **남기지 않는다** — 이번 판(메모리)에만 있다가 새로고침하면 사라진다. 새 계정
 * 시연은 새로고침이 곧 초기화라, 기록도 커뮤니티 활동도 깨끗해야 한다(기획).
 * 쓰던 사람(한상현)과 아무도 안 고른 프레임 상태는 전처럼 남긴다.
 */

/** 사람마다 다른 열쇠 — 아무도 안 골랐으면 예전 열쇠 그대로 */
export function keyFor(base: string, id: string | null): string {
  return id ? `${base}.${id}` : base;
}

/** 이 사람 것은 브라우저에 남기지 않는지 — 오늘 막 가입한 사람(fresh) */
export function isVolatile(id: string | null): boolean {
  return findPersona(id)?.fresh ?? false;
}
