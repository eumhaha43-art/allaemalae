import { notFound } from "next/navigation";
import KnowledgeList from "@/components/menu/KnowledgeList";
import { fields } from "@/data/common/menu";

export function generateStaticParams() {
  return [{ field: "all" }, ...fields.map((field) => ({ field: field.id }))];
}

/**
 * 분야의 지식 목록 — Figma 440:74. 메뉴의 분야 카드에서 들어온다.
 *
 * 주소의 분야는 문패일 뿐이다 — 목록은 늘 「전체」로 열리고 그 뒤로는 마지막에
 * 고른 칩을 따른다(KnowledgeList · categoryChipStore, 사용자 요청). 없는 분야만 막는다.
 */
export default async function CategoryPage({ params }: { params: Promise<{ field: string }> }) {
  const { field } = await params;
  if (field !== "all" && !fields.some((f) => f.id === field)) notFound();
  return <KnowledgeList />;
}
