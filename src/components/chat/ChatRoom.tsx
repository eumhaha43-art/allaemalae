"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import ChatComposer from "@/components/chat/ChatComposer";
import ChatHeader from "@/components/chat/ChatHeader";
import ChatNotice from "@/components/chat/ChatNotice";
import MessageRow from "@/components/chat/MessageRow";
import TypingDots from "@/components/chat/TypingDots";
import { useTypingField } from "@/hooks/useIosKeyboard";
import { NOTICE, type Message, type Room, type Thread } from "@/data/common/chat";

const clock = () => {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
};

/**
 * 날짜·입장 알림은 방에 들어가기 전부터 붙어 있던 것이라 한꺼번에 보인다.
 * 사람 말은 그 다음부터 한 줄씩 올라온다.
 */
function opening(messages: Message[]): number {
  let count = 0;
  while (count < messages.length && messages[count].kind === "chip") count += 1;
  return count;
}

/** 다음 말이 시작되기까지 — 앞말을 읽을 틈. */
const PAUSE_MS = 900;

/** 치는 시간. 긴 말은 오래 걸린다 — 길든 짧든 같으면 받아쓰기처럼 보인다. */
function typeMs(message: Message): number {
  if (message.kind === "chip") return 0;
  const length = message.kind === "text" ? message.text.length : message.title.length;
  return Math.min(2400, 600 + length * 40);
}

/**
 * 이어지는 말에 지금 시각을 찍는다. 데이터에는 비워 두는데, 라이브라 방금
 * 올라온 말에 새벽 3시가 적혀 있으면 안 되기 때문이다.
 */
function stamp(message: Message): Message {
  return message.kind === "chip" ? message : { ...message, time: clock() };
}

/**
 * A chat room — Figma node 564:6197 ("채팅방_대화").
 *
 * 라이브 방이라 들어가면 대화가 한 줄씩 올라온다. 미리 적어 둔 대화가 바닥나면
 * `thread.live` 가 이어받아, 카더라 태그가 붙는 데까지 가고 멎는다. 한꺼번에
 * 다 떠 있으면 지나간 기록을 보는 것이지 지금 벌어지는 일이 아니다.
 *
 * 말이 올라오기 전에는 점 세 개가 파도친다 — 다음 말이 남의 말일 때만. 내가
 * 보낸 말과 입·퇴장 알림은 누가 치는 것이 아니다.
 *
 * 내가 친 말도 같은 줄(`live`)에 넣는다. 따로 두면 뒤에 올라오는 남의 말이
 * 내 말 위로 끼어들어, 내가 보낸 것이 계속 맨 아래에 붙어 있게 된다.
 */
export default function ChatRoom({
  room,
  thread,
  mine,
}: {
  room: Room;
  thread: Thread;
  /** True when this device opened the room, which swaps the "..." menu. */
  mine: boolean;
}) {
  const backlog = thread.messages;
  // 없는 방에서는 빈 배열이 매번 새로 생겨 시계가 계속 다시 걸린다
  const pool = useMemo(() => thread.live ?? [], [thread.live]);

  /** 미리 적어 둔 대화 중 몇 줄까지 올라왔나. */
  const [step, setStep] = useState(() => opening(backlog));
  /** 그 뒤에 올라온 것 — 돌고 있는 라이브 말과 내가 보낸 말이 섞여 있다. */
  const [live, setLive] = useState<Message[]>([]);
  /** 라이브 말을 몇 개 꺼내 썼나. 내 말이 `live` 에 섞이므로 따로 센다. */
  const [turn, setTurn] = useState(0);
  const [typing, setTyping] = useState(false);

  const end = useRef<HTMLDivElement>(null);
  // 입력칸 하나짜리라 값도 조합 상태도 훅이 들고 있다.
  const keyboard = useTypingField();

  /** 다음에 올라올 말. 다 올라왔거나 대화가 없는 방이면 그대로 멎는다. */
  const upcoming: Message | null =
    step < backlog.length ? backlog[step] : turn < pool.length ? pool[turn] : null;

  /*
    한 줄이 올라올 때마다 다음 줄의 시계를 다시 건다 — 「뜸 들이고 → 치고 →
    올라온다」한 바퀴다. 방을 나가면 effect 가 걷히면서 시계도 같이 멈춘다.
  */
  useEffect(() => {
    if (!upcoming) return;

    const typed = upcoming.kind !== "chip" && !(upcoming.kind === "text" && upcoming.mine);
    const think = typed ? PAUSE_MS : 700;
    const write = typed ? typeMs(upcoming) : 0;

    const starts = window.setTimeout(() => setTyping(typed), think);
    const lands = window.setTimeout(() => {
      setTyping(false);
      if (step < backlog.length) {
        setStep(step + 1);
      } else {
        setLive((list) => [...list, stamp(pool[turn])]);
        setTurn(turn + 1);
      }
    }, think + write);

    return () => {
      window.clearTimeout(starts);
      window.clearTimeout(lands);
    };
  }, [upcoming, step, turn, backlog.length, pool]);

  // Open on the newest message, and follow along as more are sent. The layout
  // scroller is the one that moves — scrollIntoView would stop short, since the
  // sticky composer sits below the end of the thread.
  //
  // 키보드가 올라올 때도 다시 맞춘다 — 안 그러면 마지막 말이 키보드 뒤로
  // 들어간다.
  useEffect(() => {
    const scroller = end.current?.closest<HTMLElement>("[data-scroll-area]");
    scroller?.scrollTo({ top: scroller.scrollHeight });
  }, [step, live.length, typing, keyboard.open]);

  const send = () => {
    const text = keyboard.value.trim();
    if (!text) return;
    setLive((current) => [
      ...current,
      { kind: "text", id: `me-${Date.now()}`, mine: true, text, time: clock() },
    ]);
    keyboard.clear();
  };

  /*
    shrink-0 이 있어야 상단바가 계속 위에 붙어 있는다. 스크롤 상자가 세로
    flex 라 이 main 이 기본으로 줄어드는데, 말이 쌓여 내용이 상자보다 길어지면
    main 은 상자 높이에 멈춘 채 안쪽만 넘친다. sticky 는 제 부모 상자 안에서만
    버티므로 그 아래로 내려가는 순간 상단바가 같이 떠내려가, 나갈 길이 사라진다.
  */
  return (
    <main className="flex min-h-full w-full shrink-0 flex-col bg-white">
      {/* header and notice stay put; only the thread scrolls — Figma 564:6237 */}
      <div className="sticky top-0 z-10 w-full bg-white">
        <ChatHeader room={room} mine={mine} />
        {/* A host who wrote an intro gets it pinned in place of the house rule. */}
        <ChatNotice text={room.intro || NOTICE} rules={room.rules} />
        {room.tags?.length ? (
          <div className="flex w-full flex-wrap gap-[6px] px-5 pt-2 pb-1">
            {room.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-[4px] bg-[#f0f0f0] inline-flex h-5 items-center px-[7px] text-[10.5px] leading-none font-bold tracking-[-0.21px] text-[#6a6a6e]"
              >
                #{tag}
              </span>
            ))}
          </div>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-[14px] px-5 py-[14px]">
        {[...backlog.slice(0, step), ...live].map((message) => (
          <MessageRow key={message.id} message={message} />
        ))}

        {/* 치고 있는 사람의 얼굴을 그대로 쓴다 — 누가 쓰는지까지 보인다 */}
        {typing && upcoming ? (
          <TypingDots
            avatar={
              (upcoming.kind === "chip" ? undefined : upcoming.avatar) ??
              thread.typing?.avatar ??
              "/assets/chat/avatar-typing.svg"
            }
          />
        ) : null}

        <div ref={end} />
      </div>

      {/* 전체화면(탭 바 없음)이라 입력바가 제 홈 인디케이터를 그리고, 앱에서는 바닥까지 내려간다 */}
      <ChatComposer keyboard={keyboard} onSend={send} indicator edge />
    </main>
  );
}
