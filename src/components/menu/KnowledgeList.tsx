"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import AppHeader from "@/components/common/AppHeader";
import CoinNote from "@/components/common/CoinNote";
import Img from "@/components/common/Img";
import CartToggle from "@/components/home/CartToggle";
import { recent, type Post } from "@/data/common/community";
import { cartIdFor, shelfKnowledge } from "@/data/common/knowledge";
import { useInView } from "@/hooks/useInView";
import {
  chipOrder,
  fieldById,
  fieldCategory,
  fields,
  isReadyKnowledge,
  knowledgeCopy,
  topicIconOf,
} from "@/data/common/menu";
import {
  getCategoryChip,
  getCategoryChipServerSnapshot,
  setCategoryChip,
  subscribeCategoryChip,
} from "@/state/categoryChipStore";
import {
  getReactionsServerSnapshot,
  getReactionsSnapshot,
  subscribeReactions,
} from "@/state/reactionStore";

/**
 * 분야의 지식 목록 — Figma 1549:1341 「카테고리 상세」(과학 장으로 받았다).
 *
 * 메뉴의 분야 카드를 누르면 온다. 머리는 공통 헤더(뒤로 · 로고)에 오른쪽만
 * 필터 그림이고, 그 아래 분야 칩이 한 줄 — 고른 것은 그 분야 색으로 칠한다
 * (과학은 올리브). 지식은 한 편에 한 장씩 쌓인다 — 검은 네모에 세부 갈래
 * 그림, 제목, 「과학 · 우주」 알약, 담기, 화살표.
 *
 * 헤더와 칩 줄은 위에 붙어 따라온다 — 목록을 내려 보다가도 분야를 바꿀 수
 * 있어야 한다.
 *
 * 필터는 아직 모양만이다 — 무엇으로 거를지 디자인이 없다. 자리를 비워 두면
 * 머리가 한쪽으로 기울어 그림만 앉혀 둔다.
 *
 * 글 데이터는 커뮤니티의 씨앗 글과 점장님이 진열한 지식(shelfKnowledge)이다
 * — 지식 상세(440:151)가 그 본문을 장으로 나눠 보여 준다. 알약의 「과학 ·
 * 우주」는 분야 이름에 세부 갈래를 붙인 것 — 메뉴의 분야 카드 밑에 적힌 그
 * 갈래다. 갈래가 없는 글(글쓰기로 쓴 글)은 분야만 적는다.
 *
 * 카드뉴스 상세가 있는 지식(isReadyKnowledge)만 눌리고 위에 오며, 나머지는
 * 흐리게 잠긴다 — 새 디자인의 상세가 아직 없는 지식이다(사용자 결정).
 *
 * 고른 칩은 화면 밖(categoryChipStore)에 둔다 — 지식을 열고 돌아와도 마지막에
 * 고른 칩 그대로다(사용자 요청). 주소의 분야(/menu/category/society)는 안 본다 —
 * 메뉴의 분야 카드가 누르는 순간 그 분야 칩을 박아 두고 들어온다(FieldList). 그래서
 * 사회 카드로 들어오면 사회로 열리고, 지식을 열고 돌아와도 마지막에 고른 대로다.
 *
 * 장은 화면에 들어오는 순간 아래에서 톡 올라온다(`rank-pop`, 커뮤니티 최신 글과
 * 같은 결 — 사용자 요청). 장마다 따로 지켜보다(useInView) 들어올 때 올린다.
 * 처음 화면에 같이 들어오는 장들(FIRST_SCREEN)은 차례로 늦추고, 그 아래는 굴려
 * 내려올 때 하나씩 들어오므로 안 늦춘다 — 늦추면 들어와 놓고 잠깐 비어 보인다.
 */

/** 같이 들어온 장 사이를 늦추는 폭 — 뜨는 지식(TrendingList)과 같다. */
const STEP_MS = 70;
/** 처음 화면에 들어오는 장 수 — 장 90 + 사이 16 으로 헤더·칩 줄 밑에 여섯 장. */
const FIRST_SCREEN = 6;

/** 지식 한 장의 li — 화면에 들어오면 올라오고, 그 전엔 비워 둔다. */
function KnowledgeItem({ post, ready, index }: { post: Post; ready: boolean; index: number }) {
  const [box, seen] = useInView<HTMLLIElement>(0.15);
  const order = index < FIRST_SCREEN ? index : 0;
  return (
    <li
      ref={box}
      className={seen ? "rank-pop" : "opacity-0"}
      style={{ animationDelay: `${order * STEP_MS}ms` }}
    >
      <KnowledgeRow post={post} ready={ready} />
    </li>
  );
}

export default function KnowledgeList() {
  const chip = useSyncExternalStore(
    subscribeCategoryChip,
    getCategoryChip,
    getCategoryChipServerSnapshot,
  );
  const category = fieldCategory[chip];

  const posts = [...recent.posts, ...shelfKnowledge]
    .filter((post) => (chip === "all" ? true : post.category === category))
    .map((post) => ({ post, ready: isReadyKnowledge(post) }))
    // 열린 것이 위에, 그 안에서는 데이터 차례대로(sort 는 안정적이다)
    .sort((a, b) => Number(b.ready) - Number(a.ready));

  return (
    /*
      shrink-0 — 스크롤 상자가 세로 flex 라 main 이 상자 높이에 멈춘 채 안쪽만
      넘치면, sticky 는 제 부모 안에서만 버티므로 헤더가 같이 떠내려간다.
    */
    <main className="flex min-h-full w-full shrink-0 flex-col bg-[#f8f9f8]">
      <div className="sticky top-0 z-10 w-full shrink-0 bg-[#f8f9f8]">
        {/* 머리 — 1549:1357. 뒤로 · 로고 · 필터 */}
        <AppHeader>
          <span
            role="img"
            aria-label={knowledgeCopy.filter}
            className="flex size-[22px] items-center justify-center"
          >
            <Img src="/assets/category/filter.svg" className="size-[22px]" />
          </span>
        </AppHeader>

        {/*
          분야 칩 — 1549:1481. 머리에서 40 내려와 양끝에 맞춰 벌려 선다. 고른
          것은 분야 색(과학은 올리브)으로 차고 글씨가 희어진다.
        */}
        {/* 여섯 칩이 안 들어가는 좁은 폭(320)에서는 옆으로 넘겨본다 — 화면 밖으로 삐져 나가지 않게 */}
        <div className="no-scrollbar flex w-full shrink-0 items-start justify-between gap-[6px] overflow-x-auto bg-[#f5f8fa] px-6 pt-10 pb-4">
          {chipOrder.map((id) => {
            const on = id === chip;
            const color = id === "all" ? "#595959" : (fieldById(id)?.color ?? "#595959");
            const name = id === "all" ? knowledgeCopy.all : fieldCategory[id];
            return (
              <button
                key={id}
                type="button"
                aria-pressed={on}
                onClick={() => setCategoryChip(id)}
                style={on ? { backgroundColor: color, borderColor: color } : undefined}
                className={`tap [--tap-w:0px] flex shrink-0 items-center rounded-[17px] border px-[14px] py-2 text-xs leading-[1.3] whitespace-nowrap transition-colors ${
                  on
                    ? "font-semibold text-white"
                    : "border-[#e8e8e8] bg-white font-medium text-[#8b8c8c]"
                }`}
              >
                {name}
              </button>
            );
          })}
        </div>
      </div>

      {/*
        코인 안내 — 카드를 누르기 전에 값이 눈에 들어와야 한다. 프레임에는 없지만
        「지식 = 코인」을 고르기 전에 한 번 일러 주는 자리라 둔다.

        붙어 따라오는 칸(sticky) 안에 넣지 않은 것은, 규칙을 한 번 일러 주는
        줄이지 매번 봐야 하는 것이 아니어서다. 목록을 내리기 시작하면 자연스레
        올라가 사라진다.
      */}
      <CoinNote className="mx-6 mb-1" />

      {posts.length ? (
        <ul className="mx-6 flex flex-col gap-4 pt-2 pb-8">
          {posts.map(({ post, ready }, index) => (
            <KnowledgeItem key={post.id} post={post} ready={ready} index={index} />
          ))}
        </ul>
      ) : (
        <p className="px-6 pt-16 text-center text-sm leading-[1.4] text-gray-500">
          {knowledgeCopy.empty}
        </p>
      )}
    </main>
  );
}

/**
 * 제목 밑 줄 — 「사회 법률」. 분야 이름은 메뉴 쪽 이름을 쓴다(fieldCategory).
 * 세부 갈래가 없으면 분야만.
 */
export function subLabel(post: Post): string {
  const field = fields.find((f) => fieldCategory[f.id] === post.category)?.name ?? post.category;
  return post.topic ? `${field} ${post.topic}` : field;
}

/**
 * 지식 한 장 — 1549:1370. 카드 전체가 상세로 가는 링크이고, 담기만 따로 눌린다.
 *
 * 링크는 카드 전체를 덮는 투명한 판이고, 보이는 것들은 그 위에 얹혀 눌림을
 * 통과시킨다(pointer-events-none). 담기 단추만 다시 눌리게 한다 — 링크(a)
 * 안에 단추(button)를 넣을 수 없어서다.
 *
 * 왼쪽 검은 네모(60)에는 세부 갈래 그림이 앉는다(`topicIconOf` — 홈 매대와
 * 같은 표). 그림이 없는 갈래는 분야 그림(흰색)으로 대신한다.
 *
 * 잠긴 것(`ready` 아님)은 흐리게 두고 링크도 담기도 없다 — 아직 상세가 없는
 * 지식이라 눌러서 갈 데가 없다.
 */
function KnowledgeRow({ post, ready }: { post: Post; ready: boolean }) {
  const icon = topicIconOf(post.category, post.topic);
  const pill = post.topic ? `${post.category} · ${post.topic}` : post.category;
  // 홈에서 다른 이름으로 담긴 지식이면 그 이름으로 켜고 끈다 — 두 번 담기지 않게
  const saved = useSyncExternalStore(
    subscribeReactions,
    getReactionsSnapshot,
    getReactionsServerSnapshot,
  ).saved;

  return (
    <div
      aria-disabled={!ready}
      className={`relative flex h-[90px] w-full items-center rounded-[8px] border border-[#ebebeb] bg-white px-5 py-[10px] ${
        ready ? "" : "opacity-40"
      }`}
    >
      {ready ? (
        <Link
          href={`/menu/knowledge/${post.id}`}
          aria-label={post.title}
          className="absolute inset-0 rounded-[8px] transition-opacity active:opacity-60"
        />
      ) : null}

      <div className="pointer-events-none relative flex w-full items-end gap-[10px]">
        <span className="flex size-[60px] shrink-0 items-center justify-center overflow-hidden rounded-[4.286px] bg-gray-black">
          <Img
            src={icon.src}
            style={{ width: icon.width, height: icon.height }}
            className="object-contain"
          />
        </span>

        {/*
          제목은 위, 알약은 아래 — 네모 높이(60) 안에서 양끝에 붙인다. 제목이
          두 줄이 되어도(1549:1470) 알약은 바닥에 그대로 있다.
        */}
        <span className="flex h-[60px] min-w-px flex-1 flex-col justify-between">
          <span className="flex items-center justify-between gap-2">
            <span className="line-clamp-2 text-sm leading-[1.3] font-medium text-gray-900">
              {post.title}
            </span>
            <Img src="/assets/home/chevron-12.svg" className="h-3 w-[6px] shrink-0" />
          </span>
          <span className="flex items-center gap-[10px]">
            <span className="rounded-[50px] bg-gray-200 px-2 py-1 text-xs leading-none whitespace-nowrap text-gray-500">
              {pill}
            </span>
            {ready ? (
              <span className="pointer-events-auto flex">
                <CartToggle
                  id={cartIdFor(post.id, saved)}
                  off="/assets/home/bag-15.svg"
                  on="/assets/home/bag-15-on.svg"
                  className="size-[18px]"
                />
              </span>
            ) : (
              <Img src="/assets/home/bag-15.svg" className="size-[18px]" />
            )}
          </span>
        </span>
      </div>
    </div>
  );
}
