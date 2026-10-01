"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import BigButton from "@/components/common/BigButton";
import AppHeader from "@/components/common/AppHeader";
import Img from "@/components/common/Img";
import LockedCard from "@/components/menu/LockedCard";
import RelatedKnowledge from "@/components/menu/RelatedKnowledge";
import { sourceHref, type Post } from "@/data/common/community";
import { knowledgeCopy } from "@/data/common/menu";
import { useDragScroll } from "@/hooks/useDragScroll";
import { useReadProgress } from "@/hooks/useReadProgress";
import { getArchiveSnapshot } from "@/state/archiveStore";
import { askAbout } from "@/state/botChatStore";
import { useKnowledgePass } from "@/state/passStore";
import { addReceiptLine, getReceiptSnapshot } from "@/state/receiptStore";
import { showToast } from "@/state/toastStore";
import { copyLink } from "@/utils/copyLink";

/**
 * 지식 상세 · 카드뉴스 — Figma 1632:7537 · 1632:7943 · 1632:8127.
 *
 * 글 카드로 넘기던 상세(KnowledgeDetail, 440:151)의 다음 판이다. 본문이 디자이너가
 * 그린 카드(354 × 218) 여섯 장이고 옆으로 넘겨 본다 — 글자까지 그림 안에 있어
 * 카드는 그림 한 장씩이다. 마지막에 「영수증에 기록하세요」 초록 카드가 붙는
 * 글은 그것만 코드로 그린다(단추가 진짜로 눌려야 해서).
 *
 * 그 아래는 점(몇 장째), 출처 줄(연두 바탕), 회색 띠, 관련 지식 셋, 맨 아래
 * 「AI에게 물어보기」 하나다. 프레임에는 담기 단추가 없다 — 담기는 분야 목록의
 * 카드에서 한다.
 *
 * 카드가 있는 글(`Post.cards`)만 이리로 온다(지식 상세 페이지가 가른다). 나머지는
 * 아직 옛 상세다 — 디자인이 오는 대로 카드를 붙이면 된다.
 *
 * PC 에서는 마우스로 끌거나 세로 휠로 카드를 넘기고(useDragScroll), 점을 눌러
 * 그 장으로 갈 수도 있다 — 스크롤바를 숨겨 두어 그 길이 없으면 못 넘긴다.
 *
 * 들어오면 코인 1개를 치른다(useKnowledgePass). 코인이 없으면 카드 자리에 잠긴
 * 카드가 놓이고 진행률도 적지 않는다.
 */

/** 한 칸 — 카드 폭(상자 안폭) + 사이 8 */
const stepOf = (el: HTMLDivElement) => el.clientWidth - 48 + 8;
export default function CardNewsDetail({ post }: { post: Post }) {
  const [page, setPage] = useState(0);

  const cards = post.cards ?? [];
  const total = cards.length + (post.recordCard ? 1 : 0);
  // 코인 1개를 치르고 연다 — 없으면 잠긴 채다
  const open = useKnowledgePass(post.id);
  // 장을 넘길 때마다 어디까지 봤는지 장바구니에 적는다 — 글 카드 상세와 같은 셈이다.
  // 퍼센트는 내용 카드 수로 센다 — 끝의 기록 카드는 읽을 것이 아니다
  useReadProgress({ knowledgeId: post.id, page, total: cards.length, enabled: open });
  const rail = useDragScroll<HTMLDivElement>(stepOf);

  const goTo = (index: number) => {
    const el = rail.current;
    if (el) el.scrollTo({ left: index * stepOf(el), behavior: "smooth" });
  };

  return (
    <main className="flex min-h-full w-full shrink-0 flex-col bg-[#f8f9f8]">
      {/* 머리 — 1632:7553. 뒤로 · 로고 · 공유 */}
      <AppHeader>
        <button
          type="button"
          aria-label={knowledgeCopy.share}
          onClick={() =>
            copyLink(window.location.href).then((ok) =>
              showToast(ok ? knowledgeCopy.linkCopied : knowledgeCopy.linkFailed),
            )
          }
          className="tap [--tap-w:40px] flex transition-opacity active:opacity-55"
        >
          <Img src="/assets/post/share.svg" className="size-[22px]" />
        </button>
      </AppHeader>

      <h1 className="px-6 pt-5 text-xl leading-[1.3] font-semibold text-black">{post.title}</h1>

      {/*
        카드 — 1632:7859. 한 장이 화면 폭에서 양옆 24 를 뺀 354 이고 옆으로 밀어
        넘긴다(상자의 안쪽 폭이 그것이라 w-full). 어느 장이 앞에 있는지는 스크롤
        위치로 센다 — 장 폭 + 사이(8). 코인이 없으면 이 자리에 잠긴 카드 한 장.
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
          className="no-scrollbar mt-5 flex w-full cursor-grab snap-x snap-mandatory gap-2 overflow-x-auto scroll-pl-6 px-6 select-none"
        >
          {cards.map((src, i) => (
            <article
              key={src}
              aria-label={`${i + 1}/${total}`}
              className="aspect-[354/218] w-full shrink-0 snap-start overflow-hidden rounded-[7px] border border-gray-black bg-white"
            >
              <Img src={src} alt="" className="size-full object-cover" />
            </article>
          ))}
          {post.recordCard ? <RecordCard post={post} /> : null}
        </div>
      )}

      {/* 몇 장째인지 — 1632:7641. 10px 점, 사이 6. 누르면 그 장으로 간다 */}
      {open ? (
        <div className="mt-5 flex w-full items-center justify-center gap-[6px]">
          {Array.from({ length: total }, (_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`${i + 1}/${total}`}
              aria-current={i === page}
              onClick={() => goTo(i)}
              className={`tap [--tap:24px] size-[10px] rounded-full ${i === page ? "bg-primary-600" : "bg-gray-300"}`}
            />
          ))}
        </div>
      ) : null}

      {/* 출처 — 1632:7646. 연두 줄에 「출처 : ○○ · 링크 이동 ›」. 바탕은 #cde9da — 글 상세의 출처 줄과 한 색(사용자 지시) */}
      <div className="mx-6 mt-5 flex h-10 items-center justify-between rounded-lg border border-gray-100 bg-[#cde9da] px-[19px] text-xs leading-[1.3] text-black">
        {post.source ? (
          <>
            <span className="min-w-px flex-1 truncate">
              {knowledgeCopy.source} : {post.source}
            </span>
            <a
              href={sourceHref(post)}
              target="_blank"
              rel="noopener noreferrer"
              className="tap [--tap-w:0px] flex shrink-0 items-center gap-[10px] pl-3"
            >
              {knowledgeCopy.sourceGo}
              <Chevron />
            </a>
          </>
        ) : (
          <span className="text-gray-600">출처가 없는 글이에요 — 그대로 믿기 전에 한 번 더 확인해 주세요</span>
        )}
      </div>

      <div className="mt-10 h-2 w-full shrink-0 bg-[#eee]" />

      {/* 관련 지식 추천 — 1632:7652. 정말 이어지는 것부터, 잠긴 것은 「준비 중」 */}
      <RelatedKnowledge post={post} />

      <div className="min-h-6 flex-1" />

      {/*
        알래봇에게 물어보기 — 1632:7661. 초록 한 줄, 오른쪽에 알래봇 얼굴.

        홈의 큰 동작 단추(BigButton)와 같은 벌 — 프레임의 40 · 4 · 12 는 홈
        단추(42 · 10 · 16) 옆에 두면 작고 납작해 보였다(사용자 요청 · 기획 피드백).
      */}
      <BigButton href="/ai" onNavigate={() => askAbout(post.id)} className="mx-6 mb-7">
        {knowledgeCopy.ask}
        <Img src="/assets/home/ai.svg" className="size-[19px] rounded-full" />
      </BigButton>
    </main>
  );
}

/**
 * 마지막 카드 — 1632:7903 「다 먹은 잡지식을 영수증에 기록하세요!」.
 *
 * 카드뉴스를 다 넘긴 사람을 기록으로 보낸다. 다른 카드와 달리 코드로 그리는
 * 것은 「기록하러 가기」가 진짜로 눌려야 해서다 — 오른쪽 영수증 그림만 프레임에서
 * 뽑아 왔다.
 *
 * 가면서 이 지식을 오늘 영수증에 한 줄 얹는다(addReceiptLine) — 「기록하러」
 * 왔는데 영수증이 비어 있으면 무엇을 기록하라는 건지 알 수 없다. 기록 화면의
 * 「더 담으러 가기」로 한 편 더 읽고 오면 그 줄이 뒤에 붙는다.
 */
function RecordCard({ post }: { post: Post }) {
  const copy = knowledgeCopy.recordCard;
  const router = useRouter();
  const record = () => {
    const issued = getReceiptSnapshot().issued;
    const recorded = getArchiveSnapshot().records.some((one) => one.id === issued);
    addReceiptLine({ title: post.title, price: "1코인" }, recorded);
    router.push("/record");
  };
  return (
    <article className="relative aspect-[354/218] w-full shrink-0 snap-start overflow-hidden rounded-[7px] border border-gray-black bg-primary-600">
      <Img
        src="/assets/knowledge/cta-receipt.png"
        className="absolute top-[26%] left-[58.5%] w-[36.4%]"
      />
      <div className="absolute top-1/2 left-[19px] flex w-[166px] -translate-y-1/2 flex-col items-start gap-[10px]">
        <p className="text-xl leading-[1.3] text-white">
          {copy.line1}
          <br />
          <span className="font-semibold">{copy.strong}</span>
          {copy.line2}
        </p>
        <button
          type="button"
          onClick={record}
          className="tap [--tap-w:0px] flex items-center gap-2 rounded-[50px] bg-[#00341c] px-[10px] py-[6px] text-xs leading-[1.3] text-white transition-opacity active:opacity-70"
        >
          {copy.go}
          <Chevron />
        </button>
      </div>
    </article>
  );
}

/** 오른쪽 꺾쇠 5 × 10 — 출처 줄과 초록 카드가 같이 쓴다. 글자색을 따른다. */
function Chevron() {
  return (
    <svg width="5" height="10" viewBox="0 0 5 10" aria-hidden fill="none">
      <path d="M0.5 0.5 4.5 5 0.5 9.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
