"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import CoinNote from "@/components/common/CoinNote";
import BigButton from "@/components/common/BigButton";
import Img from "@/components/common/Img";
import { fridge } from "@/data/common/cart";
import LockedCard from "@/components/menu/LockedCard";
import RelatedKnowledge from "@/components/menu/RelatedKnowledge";
import { sourceHref, type Post } from "@/data/common/community";
import { fieldCategory, fields, knowledgeCopy } from "@/data/common/menu";
import { useCartEntry } from "@/hooks/useCartEntry";
import { useDragScroll } from "@/hooks/useDragScroll";
import { useReadProgress } from "@/hooks/useReadProgress";
import { putIntoCart } from "@/state/cartFlightStore";
import { askAbout } from "@/state/botChatStore";
import { useKnowledgePass } from "@/state/passStore";
import { toggleSave } from "@/state/reactionStore";
import { showToast } from "@/state/toastStore";
import { copyLink } from "@/utils/copyLink";

/**
 * 지식 상세 — Figma 440:151.
 *
 * 제목 아래 본문이 한 문단에 한 장씩 옆으로 넘기는 카드로 놓이고(점이 몇 장째
 * 인지 알려 준다), 그 밑에 출처 줄(링크 이동), 같은 분야의 다른 지식 셋, 맨
 * 아래 「AI에게 물어보기 · 장바구니」 두 단추가 있다.
 *
 * 프레임 주석대로 — AI 는 알래봇 화면으로 가고, 장바구니는 담는다. 담은 뒤에는
 * 단추가 「담김」으로 바뀐다. 홈의 담기 단추와 같은 저장소라 탭 바 배지도
 * 같이 오른다.
 *
 * 같은 지식은 한 번만 담긴다(useCartEntry). 홈에서 다른 이름으로 담아 둔 것이면
 * 그 이름을 그대로 쓰고, 장바구니에 처음부터 있던 것(다 먹음 · 먹는 중)이면
 * 담기 대신 「이미 담은 지식이에요」만 알린다 — 먹는 중에 같은 것이 둘 쌓이면
 * 어느 것을 봐야 할지 모른다.
 *
 * 들어오면 코인 1개를 치른다(useKnowledgePass). 코인이 없으면 본문 카드 자리에
 * 잠긴 카드가 놓이고 진행률도 적지 않는다.
 *
 * 카드 그림은 없다 — 프레임도 글만 있는 회색 판이라 그대로 두되, 첫 장에는
 * 글의 사진이 있으면 그 사진을 위에 얹어 회색 판이 비어 보이지 않게 한다.
 */
/** 한 칸 — 카드 폭(상자 안폭) + 사이 10 */
const stepOf = (el: HTMLDivElement) => el.clientWidth - 48 + 10;

export default function KnowledgeDetail({ post }: { post: Post }) {
  const router = useRouter();
  const [page, setPage] = useState(0);
  const { savedAs, inCart: saved } = useCartEntry(post.id);
  /** 담을 때 쓸 이름 — 이미 다른 이름으로 담겼으면 그 이름, 아니면 `post-`. */
  const cartId = savedAs ?? `post-${post.id}`;

  const field = fields.find((f) => fieldCategory[f.id] === post.category);
  const slides = post.body?.length ? post.body : [post.excerpt];

  // 코인 1개를 치르고 연다 — 없으면 잠긴 채다
  const open = useKnowledgePass(post.id);
  // 장을 넘길 때마다 어디까지 봤는지 장바구니에 적는다 — 카드뉴스 상세와 같은 셈이다
  useReadProgress({ knowledgeId: post.id, page, total: slides.length, enabled: open });
  // PC 에서는 마우스로 끌거나 세로 휠로 넘긴다 — 카드뉴스 상세와 같은 손잡이
  const rail = useDragScroll<HTMLDivElement>(stepOf);

  /*
    날리는 그림은 단추 안의 장바구니 아이콘(16px)에서 뜬다. 단추 전체를 넘기면
    그 폭(150 남짓)만큼 큰 그림이 튀어 올라 화면을 덮는다 — 홈의 담기 단추처럼
    작은 아이콘 하나가 날아가야 한다.
  */
  /*
    이미 담긴 것을 또 누르면 빼지 않고 알린다 — 장바구니에서 「지식 보러가기」로
    왔다가 습관처럼 담기를 누르는 자리라, 여기서 빠지면 돌아갔을 때 사라져
    있다. 빼는 것은 장바구니에서.
  */
  const cart = (button: HTMLElement) => {
    if (saved) {
      showToast(fridge.already);
      return;
    }
    putIntoCart(button.querySelector("img") ?? button);
    showToast(fridge.putDone);
    toggleSave(cartId);
  };

  return (
    <main className="flex min-h-full w-full shrink-0 flex-col bg-white pb-8">
      {/* 헤더 — 440:166. 뒤로 · 공유(동그란 단추) */}
      <header className="sticky top-0 z-10 flex h-[65px] w-full shrink-0 items-center justify-between bg-white px-6">
        <button type="button" aria-label="뒤로" onClick={() => router.back()} className="tap flex">
          <Img src="/assets/community/back.svg" className="h-[14px] w-[7px]" />
        </button>
        <button
          type="button"
          aria-label={knowledgeCopy.share}
          onClick={() =>
            copyLink(window.location.href).then((ok) =>
              showToast(ok ? "링크를 복사했어요" : "링크를 복사하지 못했어요"),
            )
          }
          className="tap flex size-9 items-center justify-center rounded-full bg-gray-200 transition-opacity active:opacity-60"
        >
          <Img src="/assets/post/share.svg" className="size-[18px]" />
        </button>
      </header>

      <div className="flex items-center gap-2 px-6 pt-5">
        <span
          style={{ backgroundColor: field?.color }}
          className="rounded-[4px] inline-flex h-5 items-center px-[7px] text-[10.5px] leading-none font-bold tracking-[-0.21px] text-white"
        >
          {post.category}
        </span>
        <h1 className="min-w-px flex-1 truncate text-[22px] leading-[1.3] font-semibold text-black">
          {post.title}
        </h1>
      </div>

      {/*
        본문 카드 — 440:174. 한 장이 화면 폭(354)이고 옆으로 밀어 넘긴다. 어느
        장이 앞에 있는지는 스크롤 위치로 센다 — 장 폭 + 사이(10)로 나눈 값.
        코인이 없으면 이 자리에 잠긴 카드 한 장.
      */}
      {!open ? (
        <LockedCard />
      ) : (
        <div
          ref={rail}
          onScroll={(event) => {
            const el = event.currentTarget;
            setPage(Math.round(el.scrollLeft / stepOf(el)));
          }}
          className="no-scrollbar mt-4 flex w-full cursor-grab snap-x snap-mandatory gap-[10px] overflow-x-auto scroll-pl-6 px-6 select-none"
        >
          {slides.map((text, i) => (
            <article
              key={i}
              className="relative flex h-[218px] w-[calc(100%-48px)] shrink-0 snap-start items-center justify-center overflow-hidden rounded-lg bg-[#f0f0f0] px-6"
            >
              {i === 0 && post.image ? (
                <>
                  <Img src={post.image} className="absolute inset-0 size-full object-cover" />
                  <span aria-hidden className="absolute inset-0 bg-black/45" />
                </>
              ) : null}
              <p
                className={`relative text-center text-[13px] leading-[1.6] font-medium tracking-[-0.13px] ${
                  i === 0 && post.image ? "text-white" : "text-black"
                }`}
              >
                {text}
              </p>
            </article>
          ))}
        </div>
      )}

      {/* 몇 장째인지 — 440:182 */}
      {open && slides.length > 1 ? (
        <div className="mt-[10px] flex w-full items-center justify-center gap-[6px]">
          {slides.map((_, i) => (
            <span
              key={i}
              aria-hidden
              className={`size-[10px] rounded-full ${i === page ? "bg-[#595959]" : "bg-[#d9d9d9]"}`}
            />
          ))}
        </div>
      ) : null}

      {/* 출처 — 440:186. 없으면 「카더라」 — 그대로 믿기 전에 한 번 더 확인하라는 말. 바탕은 #cde9da — 카드뉴스 상세의 출처 줄과 한 색(사용자 지시) */}
      <div className="mx-6 mt-5 flex h-[50px] items-center justify-between rounded-lg bg-[#cde9da] px-5 text-xs leading-[1.5] tracking-[-0.13px] text-black">
        {post.source ? (
          <>
            <span className="min-w-px flex-1 truncate">
              {knowledgeCopy.source} : {post.source}
            </span>
            <a
              href={sourceHref(post)}
              target="_blank"
              rel="noopener noreferrer"
              className="tap shrink-0 pl-3 font-medium"
            >
              {knowledgeCopy.sourceGo} &gt;
            </a>
          </>
        ) : (
          <span className="text-gray-600">출처가 없는 글이에요 — 그대로 믿기 전에 한 번 더 확인해 주세요</span>
        )}
      </div>

      <div className="mt-5 h-2 w-full shrink-0 bg-[#eee]" />

      {/* 관련 지식 추천 — 440:189. 정말 이어지는 것부터, 잠긴 것은 「준비 중」 */}
      <RelatedKnowledge post={post} />

      {/*
        코인 안내 — 담기 단추 바로 위.

        장바구니에 담긴 지식은 영수증에서 한 줄에 1코인으로 매겨진다. 값이
        붙는 단추 바로 위가 그 말을 할 자리다 — 화면 맨 위에 띠로 두면 본문을
        읽고 내려오는 동안 잊는다.
      */}
      <CoinNote className="mx-6 mt-8" />

      {/*
        AI 에게 물어보기 · 장바구니 — 440:198.

        글자는 홈의 큰 동작 단추(「카드 뽑기」 · actionButton.ts)와 같은 16 ·
        medium 이다 — 카드뉴스 상세의 초록 한 줄과 같은 까닭(사용자 요청). 한
        쌍이라 장바구니도 같이 키운다.
      */}
      {/* 둘 다 홈의 큰 동작 단추(BigButton) 한 벌 — 프레임의 34 · 4 는 홈 옆에서 납작해 보였다 */}
      <div className="flex gap-[10px] px-6 pt-4">
        <BigButton
          href="/ai"
          onNavigate={() => askAbout(post.id)}
          variant="secondary"
          className="min-w-px flex-1"
        >
          <Img src="/assets/home/ai.svg" className="size-[18px] rounded-full" />
          {knowledgeCopy.ask}
        </BigButton>
        <BigButton
          variant={saved ? "primary" : "secondary"}
          aria-pressed={saved}
          onClick={(event) => cart(event.currentTarget)}
          className="min-w-px flex-1"
        >
          <Img
            src={saved ? "/assets/home/bag-white.svg" : "/assets/home/bag-dark.svg"}
            className="size-[16px]"
          />
          {saved ? knowledgeCopy.carted : knowledgeCopy.cart}
        </BigButton>
      </div>
    </main>
  );
}
