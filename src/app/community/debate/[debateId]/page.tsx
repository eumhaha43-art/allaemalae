import { notFound } from "next/navigation";
import DebateRoom from "@/components/debate/DebateRoom";
import { getDebate, rooms } from "@/data/common/debate";

export function generateStaticParams() {
  return rooms.filter((room) => room.ready).map((room) => ({ debateId: room.id }));
}

/** 토론방 상세 — Figma node 805:3605 */
export default async function DebateRoomPage({
  params,
}: {
  params: Promise<{ debateId: string }>;
}) {
  const { debateId } = await params;
  const debate = getDebate(debateId);
  if (!debate) notFound();

  return <DebateRoom debate={debate} />;
}
