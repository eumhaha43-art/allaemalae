import ChatRoomLoader from "@/components/chat/ChatRoomLoader";
import { rooms } from "@/data/common/chat";

export function generateStaticParams() {
  return rooms.map((room) => ({ roomId: room.id }));
}

/** A chat room — Figma node 564:6197 ("채팅방_대화") */
export default async function ChatRoomPage({
  params,
}: {
  params: Promise<{ roomId: string }>;
}) {
  const { roomId } = await params;
  return <ChatRoomLoader roomId={roomId} />;
}
