"use client";

import { hello, inquiryOpening, opening, type BotLine } from "@/data/common/ai";
import { getKnowledge } from "@/data/common/knowledge";

/**
 * 알래봇 대화 — 화면 밖에 둔다.
 *
 * 알래봇이 내민 글 카드를 눌러 그 글로 갔다가 돌아오면 대화가 통째로
 * 사라지고 인사부터 다시 시작했다 — 화면(컴포넌트)이 내려가면서 상태도 같이
 * 버려진 것이다. 돌아왔는데 방금 한 말이 없으면 봇이 기억을 잃은 것으로
 * 보인다. 그래서 오간 말은 여기에 두고 화면은 그것을 그리기만 한다.
 *
 * sessionStorage 에도 적어 둔다 — 새로고침이나 배포로 판이 바뀌어도 이 탭
 * 안에서는 남는다. 탭을 닫으면 사라진다: 대화는 그날의 것이지 보관할 기록이
 * 아니다. localStorage 에 두면 시연 때마다 지난 대화가 딸려 나온다.
 *
 * 인사는 처음 한 번만 한다. 돌아온 사람에게 또 「안녕하세요」 하면 기억을
 * 잃은 것으로 보이는 건 마찬가지다 — 대신 알약은 입력바 옆 단추로 언제든
 * 다시 꺼낼 수 있다.
 *
 * 화면이 「한 덩어리씩 올라오는」 박자를 위해 대기 줄(`queue`)도 여기 둔다.
 * 답을 기다리는 중에 화면을 나가도 답은 여기 쌓이고, 돌아오면 이어서
 * 올라온다.
 *
 * 지식문의 — 지식 상세의 「알래봇에게 물어보기」는 누르는 순간 그 글을 적어 두고
 * (askAbout) 들어온다. 화면이 열리면 「콘텐츠 문의 주셨습니다」와 그 글의 카드가
 * 올라가고(처음이면 인사부터), 그 뒤의 물음은 그 글을 두고 답한다(aboutOf —
 * 마지막 카드의 글). 같은 글 카드가 맨 끝에 이미 있으면(카드를 눌러 글에 갔다
 * 돌아온 것) 또 올리지 않는다.
 */

const STORAGE_KEY = "rmb-bot-chat";

type State = {
  /** 올라와 있는 것. */
  shown: BotLine[];
  /** 아직 올라오지 않고 기다리는 것. */
  queue: BotLine[];
  /** 알래봇이 답을 가져오는 중. */
  thinking: boolean;
};

/** 값이 매번 새로 만들어지면 useSyncExternalStore 가 계속 다시 그린다. */
const EMPTY: State = { shown: [], queue: [], thinking: false };

let state: State = EMPTY;
let loaded = false;
const listeners = new Set<() => void>();

function read(): BotLine[] {
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : null;
    return Array.isArray(parsed) ? (parsed as BotLine[]) : [];
  } catch {
    return [];
  }
}

function set(next: Partial<State>) {
  state = { ...state, ...next };
  if (next.shown) {
    try {
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next.shown));
    } catch {
      // 저장은 못 해도 이번 화면에서는 보이게 둔다.
    }
  }
  listeners.forEach((notify) => notify());
}

/**
 * 화면이 열릴 때 — 처음이면 인사를 대기 줄에 넣는다.
 *
 * 저장된 대화는 여기서 비로소 읽는다(모듈이 로드될 때가 아니라). 서버에서
 * 그린 빈 화면과 브라우저의 첫 그림이 같아야 하고, 그 뒤에 갈아 끼운다.
 */
export function openBotChat(): void {
  if (!loaded) {
    loaded = true;
    const saved = read();
    if (saved.length) set({ shown: saved });
    else if (!pendingAbout) set({ queue: [...opening] });
  }
  if (!pendingAbout) return;
  const id = pendingAbout;
  pendingAbout = null;
  const post = getKnowledge(id);
  if (!post) return;
  // 맨 끝이 이미 이 글의 카드면(그 뒤에 내 말이 없으면) 또 올리지 않는다
  if (aboutOf(state.shown) === id && !state.shown.slice(lastInquiryAt(state.shown)).some((l) => l.kind === "mine")) return;
  const card: BotLine = { kind: "inquiry", id: post.id, title: post.title, category: post.category, topic: post.topic };
  const first = !state.shown.length && !state.queue.length;
  set({ queue: [...state.queue, ...(first ? [hello] : []), ...inquiryOpening, card, { kind: "time" }] });
}

/** 지식 상세가 「알래봇에게 물어보기」를 누를 때 — 들어오면 이 글을 문의로 올린다 */
let pendingAbout: string | null = null;
export function askAbout(knowledgeId: string): void {
  pendingAbout = knowledgeId;
}

function lastInquiryAt(lines: BotLine[]): number {
  for (let i = lines.length - 1; i >= 0; i -= 1) if (lines[i].kind === "inquiry") return i;
  return -1;
}

/** 지금 문의 중인 글 — 마지막 지식문의 카드의 글. 없으면 null */
export function aboutOf(lines: BotLine[]): string | null {
  const at = lastInquiryAt(lines);
  const line = at < 0 ? null : lines[at];
  return line && line.kind === "inquiry" ? line.id : null;
}

export function subscribeBotChat(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getBotChat(): State {
  return state;
}

/** 서버는 빈 대화로 그린다 — 브라우저가 열면서 채운다. */
export function getBotChatServerSnapshot(): State {
  return EMPTY;
}

/** 내 말을 올린다 — 바로 보이고, 점 세 개가 뜬다. */
export function sayMine(text: string): void {
  set({
    shown: [...state.shown, { kind: "mine", text }, { kind: "time", at: clock() }],
    thinking: true,
  });
}

/** 알래봇의 답을 대기 줄에 넣는다 — 한 덩어리씩 올라온다. */
export function enqueue(lines: BotLine[]): void {
  set({ queue: [...state.queue, ...lines] });
}

/** 대기 줄 맨 앞 것을 올린다. 화면의 시계가 박자마다 부른다. */
export function advance(): void {
  const [next, ...rest] = state.queue;
  if (!next) return;
  const line: BotLine = next.kind === "time" ? { kind: "time", at: next.at ?? clock() } : next;
  set({
    shown: [...state.shown, line],
    queue: rest,
    /*
      말이 실제로 떠오르는 이 순간에 점 세 개를 거둔다. 답을 받아 온 때가
      아니다 — 받아 온 뒤에도 한 덩어리씩 올라오느라 한 박자를 더 기다리는데,
      거기서 거두면 점이 사라지고 잠깐 아무것도 없는 자리가 생긴다.
      시각은 말이 아니라 말 끝에 붙는 꼬리표라 세지 않는다.
    */
    thinking: next.kind === "time" ? state.thinking : false,
  });
}

/** 지금 몇 시 — 「오후 3:07」. 말 끝에 붙는 꼬리표라 올라오는 순간의 것이다. */
export function clock(): string {
  const now = new Date();
  const hour = now.getHours();
  const half = hour < 12 ? "오전" : "오후";
  const twelve = hour % 12 || 12;
  return `${half} ${twelve}:${String(now.getMinutes()).padStart(2, "0")}`;
}
