import { Suspense } from "react";
import { notFound } from "next/navigation";
import GroundForm from "@/components/debate/GroundForm";
import { getDebate, rooms } from "@/data/common/debate";

export function generateStaticParams() {
  return rooms.filter((room) => room.ready).map((room) => ({ debateId: room.id }));
}

/** 근거 달기 — Figma node 805:4304 */
export default async function GroundPage({
  params,
}: {
  params: Promise<{ debateId: string }>;
}) {
  const { debateId } = await params;
  const debate = getDebate(debateId);
  if (!debate) notFound();

  // GroundForm reads `?edit=`, which a prerendered page has to suspend on.
  return (
    <Suspense fallback={<div className="min-h-full w-full bg-white" />}>
      <GroundForm debate={debate} />
    </Suspense>
  );
}
