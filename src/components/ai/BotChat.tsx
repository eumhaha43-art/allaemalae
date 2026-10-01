"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import Img from "@/components/common/Img";
import BotDesk from "@/components/ai/BotDesk";
import ChatComposer from "@/components/chat/ChatComposer";
import TypingDots from "@/components/chat/TypingDots";
import { useTypingField } from "@/hooks/useIosKeyboard";
import Link from "next/link";
import { bot, chipsAgain, inquiryCopy, scriptFor, type BotAnswer, type BotLine } from "@/data/common/ai";
import { categoryChip, CATEGORY_CHIP_FALLBACK } from "@/data/common/community";
import { getKnowledge, tagOf } from "@/data/common/knowledge";
import { topicIconOf } from "@/data/common/menu";
import { findHits } from "@/data/common/search";
import {
  aboutOf,
  advance,
  clock,
  enqueue,
  getBotChat,
  getBotChatServerSnapshot,
  openBotChat,
  sayMine,
  subscribeBotChat,
} from "@/state/botChatStore";

/**
 * AI 알래봇 — Figma node 1191:2865.
 *
 * 들어오면 인사와 알약 단추가 한 덩어리씩 차례로 올라온다. 한꺼번에 펼치면
 * 이미 하던 대화에 끼어든 것 같은데, 차례로 오면 지금 나에게 말을 거는
 * 것으로 읽힌다.
 *
 * 그 뒤로 오가는 말은 Claude 에게 물어 온다(`/api/ai`). 열쇠는 서버에만
 * 있으므로 화면은 그 길로만 묻는다 — 브라우저에서 바로 붙으면 열쇠가 딸려
 * 나간다.
 *
 * 모양이 정해진 답(토론 주제의 A VS B 말풍선)만 미리 적어 둔 것을 쓴다.
 * 모델은 그 모양을 만들어 낼 수 없다.
 *
 * 내가 물어본 때부터 알래봇이 첫 마디를 뗄 때까지는 치고 있는 점 세 개를
 * 띄운다. 그 사이가 비어 있으면 눌리기는 한 것인지 알 수가 없다.
 *
 * 입력바는 채팅방 것을 그대로 가져다 쓴다(`ChatComposer`). 첨부 자리에는
 * 알약을 다시 꺼내는 단추를 둔다.
 *
 * 오간 말은 화면 밖 저장소(`botChatStore`)에 있다. 글 카드를 눌러 나갔다
 * 돌아와도 대화가 그대로고, 인사는 처음 한 번만 한다.
 *
 * 지식문의(1202:3843) — 지식 상세의 「알래봇에게 물어보기」로 들어오면 「콘텐츠
 * 문의 주셨습니다」와 그 글의 카드가 올라오고, 그 뒤의 물음은 그 글을 두고 답한다
 * (about 을 서버에 같이 보낸다). 답에는 그 글의 출처가 말풍선 안에 붙는다.
 * 답을 못 가져오면 글의 요약과 출처로 대신한다 — 글은 화면이 이미 갖고 있다.
 */

/** 한 덩어리가 올라오고 다음 것까지 — 한 줄 읽을 만큼. */
const BEAT_MS = 620;

/** 서버(`/api/ai`)에 넘기는 대화 한 줄. 화면 장식은 빼고 오간 말만 담는다. */
type Turn = { role: "user" | "assistant"; text: string };

/**
 * 이 줄이 알래봇의 새 차례를 여는가.
 *
 * 얼굴과 이름은 차례마다 한 번씩만 붙는다. 줄마다 붙이면 한 번 말하는 것을
 * 여럿이 한 마디씩 하는 것처럼 보이고, 맨 처음 한 번만 붙이면 아래로 내려갈
 * 수록 왼쪽이 텅 비어 누가 하는 말인지 알 수 없다.
 *
 * 내 말과 시각이 차례를 끊는다 — 그 뒤에 오는 알래봇 말이 새 차례다.
 */
function opensTurn(lines: BotLine[], index: number): boolean {
  if (index === 0) return true;
  const before = lines[index - 1].kind;
  return before === "mine" || before === "time";
}

/**
 * 이 시각 꼬리표가 내 말 뒤에 붙는가.
 *
 * 시각은 말풍선의 안쪽 모서리 밑에 놓는다 — 프레임(1191:2865)이 그렇다. 내
 * 말(오른쪽) 뒤에는 왼쪽 끝에, 알래봇 말(왼쪽) 뒤에는 오른쪽 끝에. 말풍선
 * 반대편에 두어 말과 시각이 한 덩어리로 묶이지 않고 사이를 띄운다. 어느
 * 쪽인지는 바로 앞의 말(시각이 아닌 것)이 누구 것인지로 안다.
 */
function afterMine(lines: BotLine[], index: number): boolean {
  for (let i = index - 1; i >= 0; i -= 1) {
    if (lines[i].kind !== "time") return lines[i].kind === "mine";
  }
  return false;
}

export default function BotChat() {
  const router = useRouter();
  const { shown, queue, thinking } = useSyncExternalStore(
    subscribeBotChat,
    getBotChat,
    getBotChatServerSnapshot,
  );
  /** 시각 꼬리표에 시각이 없을 때(옛 저장) 쓰는 값 — 화면이 열린 때. */
  const [at] = useState(clock);
  const end = useRef<HTMLDivElement>(null);
  const keyboard = useTypingField();

  // 처음이면 인사를 대기 줄에 넣고, 돌아온 것이면 저장된 대화를 꺼낸다
  useEffect(() => {
    openBotChat();
  }, []);

  /*
    한 덩어리가 올라올 때마다 다음 것의 시계를 다시 건다. 화면을 나가면
    effect 가 걷히면서 시계도 같이 멈춘다 — 돌아오면 남은 것부터 이어서
    올라온다.
  */
  useEffect(() => {
    if (!queue.length) return;
    const id = window.setTimeout(advance, BEAT_MS);
    return () => window.clearTimeout(id);
  }, [queue]);

  /*
    새 말은 늘 맨 아래에 붙으므로 거기로 따라 내려간다.

    움직여야 하는 것은 기기 안의 스크롤 상자다 — 채팅방과 같다. scrollIntoView
    는 붙어 있는 입력바 뒤에서 멎기도 하고, 그보다 나쁘게는 기기 바깥 페이지
    까지 밀어 올려 PC 목업에서 상태바가 화면 위로 사라졌다.

    부드럽게(behavior: "smooth") 내리지 않는다. 이 상자에서는 그 요청이 그냥
    무시돼서 화면이 맨 위에 멈춰 있었다 — 대화가 길어지면 손으로 내려야 했다.
    한 번에 붙이는 쪽은 확실히 듣는다.

    자판이 오르내릴 때도 다시 맞춘다. 안 그러면 마지막 말이 자판 뒤로 들어간다.
  */
  useEffect(() => {
    const scroller = end.current?.closest<HTMLElement>("[data-scroll-area]");
    scroller?.scrollTo({ top: scroller.scrollHeight });
  }, [shown.length, thinking, keyboard.open]);

  /**
   * 내 말을 올리고 답을 받아 온다.
   *
   * 지금까지 오간 말을 함께 보낸다 — 그러지 않으면 「그게 뭔데요?」 같은
   * 되물음에 무엇을 가리키는지 알 수가 없다. 알약과 인사는 화면 장식이라
   * 빼고, 실제로 오간 말만 추린다.
   */
  const say = async (text: string) => {
    const scripted = scriptFor(text);
    /*
      내 말이 오르는 순간부터 점 세 개를 띄운다 — 답이 어디서 오는지와 상관없이.

      예전에는 물어보러 가는 동안(`/api/ai`)에만 띄웠다. 그런데 알약처럼 미리
      적어 둔 답은 물어보러 가지 않아 점이 아예 안 떴고, 열쇠가 없을 때는
      503 이 곧바로 돌아와 한 틀 만에 사라져 보이지도 않았다. 어느 쪽이든
      기다리는 것은 마찬가지인데 화면만 멎어 있는 것으로 보였다.

      거두는 것은 답이 도착한 때가 아니라 첫 마디가 떠오른 때다(대기 줄).
    */
    sayMine(text);

    if (scripted) {
      enqueue(scripted.lines);
      return;
    }

    const history = shown.flatMap<Turn>((line) =>
      line.kind === "mine"
        ? [{ role: "user", text: line.text }]
        : line.kind === "bot"
          ? [{ role: "assistant", text: line.text.join("\n") }]
          : [],
    );
    /** 지식문의 중인 글 — 마지막 카드의 것. 서버가 이 글을 두고 답한다 */
    const about = aboutOf(shown);

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ turns: [...history, { role: "user", text }], about }),
      });
      // 지식문의 중에 길이 막히면(열쇠 없음 따위) 글 요약으로 대신한다 — 아래 catch
      if (!res.ok && about) throw new Error(String(res.status));
      const data: BotAnswer = await res.json();
      const answer = data.text?.trim();
      const posts = data.posts ?? [];
      const links = data.links ?? [];
      // 갈 곳이 하나라도 있으면 말풍선 뒤에 안내 카드를 한 덩어리 더 올린다
      const refs: BotLine[] =
        posts.length || links.length || data.write
          ? [{ kind: "refs", posts, links, write: Boolean(data.write) }]
          : [];
      enqueue([
        {
          kind: "bot",
          text: answer ? answer.split("\n") : [...bot.fallback],
          ...(data.source ? { source: data.source, sourceUrl: data.sourceUrl } : {}),
        },
        ...refs,
        { kind: "time" },
      ]);
    } catch {
      /*
        지식문의 중이면 글의 요약과 출처로 답한다 — 글은 화면이 이미 갖고 있다.
        아무 답도 없는 것보다 낫고, 없는 말을 지어내는 것도 아니다.
      */
      const post = about ? getKnowledge(about) : undefined;
      if (post) {
        enqueue([
          { kind: "bot", text: [post.excerpt], source: post.source, sourceUrl: post.sourceUrl },
          { kind: "time" },
        ]);
        return;
      }
      /*
        길이 막혔을 때도(열쇠 없음 · 통신 끊김) 화면은 답을 하나 받는다 — 아무
        일도 안 일어나면 고장이다. 그래도 제목으로는 찾아 줄 수 있다 — 검색과
        같은 표(findHits)에서 지식을 골라 카드로 내민다(감수 요청: 최소한 제목
        매칭으로 앱 안의 콘텐츠를 안내).
      */
      const found = findHits(text)
        .filter((hit) => hit.group === "지식")
        .slice(0, 3)
        .map((hit) => ({ id: hit.id, title: hit.title, category: hit.where.split(" · ")[0], href: hit.href }));
      enqueue(
        found.length
          ? [
              { kind: "bot", text: [...bot.offlineFound] },
              { kind: "refs", posts: found, links: [], write: false },
              { kind: "time" },
            ]
          : [{ kind: "bot", text: [...bot.fallback] }, { kind: "time" }],
      );
    }
  };

  /** 알약을 다시 꺼낸다 — 인사 없이 「아래 버튼에서 골라보셔도 좋아요!」와 알약만. */
  const showChips = () => {
    if (queue.length) return;
    enqueue(chipsAgain.lines);
  };

  const send = () => {
    const text = keyboard.value.trim();
    if (!text) return;
    keyboard.clear();
    void say(text);
  };

  /*
    shrink-0 이 있어야 머리가 계속 위에 붙어 있는다 — 채팅방(`ChatRoom`)과 같은
    자리다. 스크롤 상자가 세로 flex 라 이 main 이 기본으로 줄어드는데, 말이
    쌓여 내용이 상자보다 길어지면 main 은 상자 높이에 멈춘 채 안쪽만 넘친다.
    sticky 는 제 부모 상자 안에서만 버티므로, 한 화면을 넘겨 내리는 순간 머리가
    같이 떠내려가 나갈 길이 사라졌다.
  */
  return (
    <main className="flex min-h-full w-full shrink-0 flex-col">
      {/*
        머리 — 1191:2881. 뒤로 · 이름 · 닫기.

        프레임은 흰 머리인데, 화면이 통째로 검은 모니터라 흰 띠가 위에 얹힌
        것처럼 떴다. 글자와 그림을 흰 것으로 바꾸고 바탕은 모니터에 맡긴다
        — 상태바도 같이 어두워진다(`isDarkStatusRoute`).

        비워 두지는 못한다. 붙어 있는 머리라 그 뒤로 흰 말풍선이 지나가는데,
        비치면 글자가 겹쳐 둘 다 못 읽는다. 대신 모니터와 같은 알갱이를 한 번
        더 깔아(`bot-screen`) 가리면서도 바탕과 이어져 보이게 한다.
      */}
      <header className="bot-screen sticky top-0 z-20 flex h-[60px] w-full shrink-0 items-center justify-between px-6 py-3">
        <button
          type="button"
          aria-label="뒤로"
          onClick={() => router.back()}
          className="tap flex transition-opacity active:opacity-55"
        >
          <Img src="/assets/community/back-light.svg" className="h-[14px] w-[7px]" />
        </button>
        <h1 className="absolute left-1/2 -translate-x-1/2 text-lg leading-normal font-medium text-white">
          {bot.title}
        </h1>
        <button
          type="button"
          aria-label="닫기"
          onClick={() => router.back()}
          className="tap [--tap-w:40px] flex transition-opacity active:opacity-55"
        >
          <Img src="/assets/debate/close.svg" className="size-[18px]" />
        </button>
      </header>

      {/* 대화. 바탕(노이즈)은 기기 화면이 깔고 있으므로 여기는 비워 둔다 */}
      <div className="flex flex-1 flex-col gap-[10px] pt-[10px]">
        <div className="flex w-full items-center gap-[14px] px-6 pb-[5px]">
          <div className="h-px min-w-px flex-1 bg-white/12" />
          <span className="text-[11.5px] leading-[17px] tracking-[-0.23px] text-[#9a9a9e]">
            오늘
          </span>
          <div className="h-px min-w-px flex-1 bg-white/12" />
        </div>

        <ol className="flex w-full flex-col gap-[15px] px-6">
          {shown.map((line, index) => (
            <li key={index} className="bot-line flex w-full flex-col">
              <Line
                line={line}
                at={at}
                onPick={(text) => void say(text)}
                opens={opensTurn(shown, index)}
                mine={afterMine(shown, index)}
              />
            </li>
          ))}
        </ol>

        {thinking ? (
          <div className="bot-line w-full px-6 pt-[5px]">
            {/* 얼굴 자리를 알래봇 말풍선과 맞춘다 — 30 · 사이 10 */}
            <TypingDots avatar="/assets/home/ai.svg" size={30} gap={10} />
          </div>
        ) : null}

        <div ref={end} />

        {/*
          자리 그림은 늘 맨 아래다. `mt-auto` 라 대화가 짧으면 빈 자리를 밀고
          내려가 바닥에 붙고, 길어지면 마지막 말 뒤를 따라온다.
        */}
        <BotDesk />
      </div>

      <ChatComposer
        keyboard={keyboard}
        onSend={send}
        placeholder={bot.placeholder}
        leading={
          <button
            type="button"
            aria-label={chipsAgain.label}
            onClick={showChips}
            /*
              보내기 화살표와 같은 초록이라 한 쌍의 단추로 보였다 — 하는 일이
              아주 다른데 색이 같으면 어느 쪽이 보내기인지 매번 헷갈린다.
              노랑은 편의점 간판에서 가져온 강조색이라 초록 옆에서 따로 읽힌다.
            */
            className="tap flex size-[38px] shrink-0 items-center justify-center rounded-[10px] bg-yellow-500 text-[19px] leading-none font-bold text-yellow-900 transition-opacity active:opacity-70"
          >
            ?
          </button>
        }
        indicator
      />
    </main>
  );
}

/**
 * 한 덩어리를 그린다.
 *
 * 알래봇 얼굴과 이름은 차례를 여는 줄에만 붙는다(`opensTurn`). 잇달아 나오는
 * 줄에는 자리만 남겨 두어 말풍선이 왼쪽 끝으로 밀려나지 않게 한다.
 */
function Line({
  line,
  at,
  opens,
  mine,
  onPick,
}: {
  line: BotLine;
  at: string;
  /** 알래봇의 새 차례를 여는 줄 — 얼굴과 이름이 여기 붙는다. */
  opens: boolean;
  /** 시각 꼬리표가 내 말 뒤에 붙는가 — 왼쪽 끝에 놓는다. 알래봇 말 뒤면 오른쪽 끝. */
  mine: boolean;
  onPick: (text: string) => void;
}) {
  if (line.kind === "time") {
    return (
      <p
        className={`w-full text-[11.5px] leading-[17px] tracking-[-0.23px] text-[#9a9a9e] ${
          mine ? "pl-[10px] text-left" : "pr-[10px] text-right"
        }`}
      >
        {line.at ?? at}
      </p>
    );
  }

  if (line.kind === "mine") {
    return (
      <div className="flex w-full justify-end">
        <p className="max-w-[260px] rounded-[10px] rounded-tr-none bg-primary-600 px-[10px] py-[13px] text-sm leading-[1.3] font-medium text-white">
          {line.text}
        </p>
      </div>
    );
  }

  return (
    <div className="flex w-full items-start gap-[10px]">
      {opens ? (
        <Img src="/assets/home/ai.svg" className="size-[30px] shrink-0 rounded-full" />
      ) : (
        <span aria-hidden className="size-[30px] shrink-0" />
      )}

      <div className="flex min-w-px flex-1 flex-col items-start gap-[10px]">
        {opens ? (
          <div className="flex items-center gap-[6px]">
            <span className="text-xs leading-[1.3] text-[#e2e8f0]">{bot.name}</span>
            <span className="rounded-[4px] border border-[rgba(16,185,129,0.4)] bg-[rgba(2,44,34,0.7)] px-[7px] py-px text-xs leading-[1.3] text-[#6ee7b7]">
              {bot.badge}
            </span>
          </div>
        ) : null}

        {line.kind === "refs" ? (
          <Refs line={line} />
        ) : line.kind === "inquiry" ? (
          <Inquiry line={line} />
        ) : line.kind === "chips" ? (
          <div className="flex w-full flex-wrap gap-[5px]">
            {line.items.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => onPick(item)}
                className="tap [--tap-w:0px] rounded-full border border-[#676767] bg-[#202020] px-[10px] py-[13px] text-sm leading-[1.3] font-medium text-white transition-colors active:border-[#83ffd9] active:bg-primary-600"
              >
                {item}
              </button>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-start gap-[10px] rounded-[10px] rounded-tl-none bg-white px-[10px] py-[13px]">
            <div className="text-sm leading-[1.3] font-medium text-black">
              {line.text.map((row) => (
                <p key={row}>{row}</p>
              ))}
            </div>

            {/* 지식문의의 답 — 그 글의 출처가 말풍선 안 아래 줄에(1202:3979). 주소가 있으면 눌러서 간다 */}
            {line.kind === "bot" && line.source ? (
              <p className="text-xs leading-[1.3] font-medium break-all text-[#4d4d4d]">
                {inquiryCopy.source}
                {line.sourceUrl ? (
                  <a href={line.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline">
                    {line.sourceUrl}
                  </a>
                ) : (
                  line.source
                )}
              </p>
            ) : null}

            {line.kind === "versus" ? (
              <div className="flex flex-wrap items-center gap-[5px]">
                <button
                  type="button"
                  onClick={() => onPick(line.a)}
                  className="tap [--tap-w:0px] rounded-[10px] border border-[#e5e5e5] bg-[#f7f7f7] px-[5px] py-2 text-xs leading-[1.3] font-medium text-black"
                >
                  {line.a}
                </button>
                <span className="text-xs leading-[1.3] font-medium text-black">VS</span>
                <button
                  type="button"
                  onClick={() => onPick(line.b)}
                  className="tap [--tap-w:0px] rounded-[10px] border border-[#e5e5e5] bg-[#f7f7f7] px-[5px] py-2 text-xs leading-[1.3] font-medium text-black"
                >
                  {line.b}
                </button>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * 지식문의 카드 — 1202:3957. 흰 알약 안에 「지식문의」 표(짙은 남회색), 제목 한
 * 줄(넘치면 줄임표), 「역사 · 인물」 갈래, 오른쪽에 검은 네모의 갈래 그림(지식 목록의
 * 그것 — topicIconOf). 누르면 그 글로 돌아간다 — 읽다 온 글이다.
 */
function Inquiry({ line }: { line: Extract<BotLine, { kind: "inquiry" }> }) {
  // 그림은 지식 목록의 검은 네모(60)용 크기라 절반으로 — 시안의 뇌(40 → 20)가 그렇다
  const icon = topicIconOf(line.category, line.topic);
  return (
    <Link
      href={`/menu/knowledge/${line.id}`}
      className="tap [--tap-w:0px] flex max-w-[290px] flex-col items-start gap-[2px] rounded-[10px] bg-white px-[10px] py-[13px] transition-opacity active:opacity-60"
    >
      <span className="rounded-[2px] bg-[#43546e] px-[3px] text-xs leading-[1.3] font-medium text-[#eee]">
        {inquiryCopy.tag}
      </span>
      <span className="flex w-full items-center gap-2">
        <span className="flex min-w-px flex-1 flex-col gap-px">
          <span className="truncate text-sm leading-[1.3] font-medium text-black">‘{line.title}’</span>
          <span className="text-xs leading-[1.3] font-medium text-[#919192]">
            {tagOf(line.id) || line.category}
          </span>
        </span>
        <span className="flex size-[35px] shrink-0 items-center justify-center rounded-[2.4px] bg-[#232323]">
          <Img src={icon.src} style={{ width: icon.width / 2, height: icon.height / 2 }} className="max-w-none" />
        </span>
      </span>
    </Link>
  );
}

/**
 * 안내 카드 — 알래봇이 「여기로 가 보세요」 하고 내미는 것.
 *
 * 글 카드는 흰 알약에 분야 칩과 제목, 누르면 그 글로 간다. 바깥 링크는
 * 새 창으로 연다 — 앱을 떠나는 것이니 돌아올 길을 남긴다. 글쓰기 단추는
 * 메인색 — 이 앱이 가장 바라는 행동이다.
 *
 * 말풍선(흰 바탕)과 따로 둔다. 말풍선 안에 넣으면 글 카드까지 흰 위에 흰이라
 * 눌리는 것으로 안 보인다.
 */
function Refs({ line }: { line: Extract<BotLine, { kind: "refs" }> }) {
  return (
    <div className="flex w-full max-w-[290px] flex-col gap-[6px]">
      {line.posts.map((post) => (
        <Link
          key={post.id}
          href={post.href ?? `/community/post/${post.id}`}
          className="tap [--tap-w:0px] flex w-full items-center gap-2 rounded-[10px] bg-white px-3 py-[10px] transition-opacity active:opacity-60"
        >
          <span
            className={`inline-flex h-5 shrink-0 items-center rounded-[4px] px-[7px] text-[10.5px] leading-none font-bold tracking-[-0.21px] ${
              categoryChip[post.category] ?? CATEGORY_CHIP_FALLBACK
            }`}
          >
            {post.category}
          </span>
          <span className="min-w-px flex-1 truncate text-[13px] leading-[1.3] font-semibold text-black">
            {post.title}
          </span>
          <Img src="/assets/home/chevron-12.svg" className="h-[11px] w-[6px] shrink-0" />
        </Link>
      ))}
      {line.links.map((link) => (
        <a
          key={link.url}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="tap [--tap-w:0px] flex w-full items-center gap-2 rounded-[10px] border border-[#676767] bg-[#202020] px-3 py-[10px] text-[13px] leading-[1.3] font-medium text-white transition-colors active:border-[#83ffd9]"
        >
          <span className="min-w-px flex-1 truncate">{link.label}</span>
          <span aria-hidden className="shrink-0 text-[#9a9a9e]">↗</span>
        </a>
      ))}
      {line.write ? (
        <Link
          href="/community/write"
          className="tap [--tap-w:0px] flex w-full items-center justify-center rounded-[10px] bg-primary-600 px-3 py-[11px] text-[13px] leading-[1.3] font-bold text-white transition-opacity active:opacity-80"
        >
          {bot.refs.write}
        </Link>
      ) : null}
    </div>
  );
}
