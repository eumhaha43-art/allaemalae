import { notFound } from "next/navigation";
import CardNewsDetail from "@/components/menu/CardNewsDetail";
import KnowledgeDetail from "@/components/menu/KnowledgeDetail";
import { recent } from "@/data/common/community";
import { getKnowledge, shelfKnowledge } from "@/data/common/knowledge";

export function generateStaticParams() {
  return [...recent.posts, ...shelfKnowledge].map((post) => ({ id: post.id }));
}

/**
 * 지식 상세 — 분야 목록에서 한 편을 누르면 온다.
 *
 * 카드뉴스가 있는 글은 새 상세(1632:7537 · CardNewsDetail)로, 아직 글 카드뿐인
 * 글은 옛 상세(440:151 · KnowledgeDetail)로 — 디자인이 오는 대로 카드를 붙이면
 * 그 글부터 새 상세가 된다.
 */
export default async function KnowledgePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = getKnowledge(id);
  if (!post) notFound();
  return post.cards?.length ? <CardNewsDetail post={post} /> : <KnowledgeDetail post={post} />;
}
