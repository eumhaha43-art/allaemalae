"use client";

import Link from "next/link";
import { recent, type Post } from "@/data/common/community";
import { shelfKnowledge } from "@/data/common/knowledge";
import { isReadyKnowledge, knowledgeCopy, relatedKnowledge } from "@/data/common/menu";
import { showToast } from "@/state/toastStore";

/**
 * 관련 지식 추천 — 지식 상세 둘(글 카드 · 카드뉴스)이 같이 쓴다. 1632:7652.
 *
 * 정말로 이어지는 것부터 셋(relatedKnowledge) — 제목만 회색 칸에 적는다. 카드뉴스가
 * 아직 없는 것은 **꺼진 모양**이다(사용자 결정 — 어차피 없는 내용이다): 흐린
 * 글씨에 「준비 중」 꼬리표, 눌러도 잠깐 알리기만 한다. 열린 것은 그 상세로 간다.
 */
export default function RelatedKnowledge({ post }: { post: Post }) {
  const related = relatedKnowledge(post, [...recent.posts, ...shelfKnowledge]);
  if (!related.length) return null;

  const box =
    "flex h-[82px] min-w-px flex-1 items-center justify-center rounded-[4px] px-3 text-center text-xs leading-[1.5] font-medium tracking-[-0.13px]";

  return (
    <section className="flex flex-col gap-[10px] px-6 pt-10">
      <h2 className="text-sm leading-[1.3] font-medium text-black">{knowledgeCopy.related}</h2>
      <div className="flex w-full gap-[10px]">
        {related.map((other) =>
          isReadyKnowledge(other) ? (
            <Link
              key={other.id}
              href={`/menu/knowledge/${other.id}`}
              className={`${box} bg-[#f0f0f0] text-black/80 transition-opacity active:opacity-60`}
            >
              <span className="line-clamp-3">{other.title}</span>
            </Link>
          ) : (
            <button
              key={other.id}
              type="button"
              aria-disabled
              onClick={() => showToast(knowledgeCopy.soon)}
              className={`${box} cursor-not-allowed flex-col gap-1 bg-[#f6f6f6] text-black/35`}
            >
              <span className="line-clamp-2">{other.title}</span>
              <span className="rounded-full bg-gray-200 px-[6px] py-[1px] text-[10px] leading-[1.4] font-medium text-gray-500">
                {knowledgeCopy.soon}
              </span>
            </button>
          ),
        )}
      </div>
    </section>
  );
}
