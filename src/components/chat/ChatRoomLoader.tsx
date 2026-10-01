"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import ChatRoom from "@/components/chat/ChatRoom";
import { getRoom, getThread } from "@/data/common/chat";
import {
  getLoadedServerSnapshot,
  getLoadedSnapshot,
  getRoomsServerSnapshot,
  getRoomsSnapshot,
  subscribeRooms,
} from "@/state/roomStore";

/**
 * Finds the room behind a `/community/chat/<id>` URL.
 *
 * Built-in rooms are known on the server; a room made on this device only
 * exists in localStorage, so it cannot be resolved until the store has been
 * read. `ready` is what says the answer can be trusted — without it the
 * hydrating render would call every created room missing and bounce out.
 */
export default function ChatRoomLoader({ roomId }: { roomId: string }) {
  const router = useRouter();
  const mine = useSyncExternalStore(subscribeRooms, getRoomsSnapshot, getRoomsServerSnapshot);
  const ready = useSyncExternalStore(
    subscribeRooms,
    getLoadedSnapshot,
    getLoadedServerSnapshot,
  );

  const own = mine.find((candidate) => candidate.id === roomId);
  const room = getRoom(roomId) ?? own;

  useEffect(() => {
    if (ready && !room) router.replace("/community/chat");
  }, [ready, room, router]);

  if (!room) return <div className="min-h-full w-full bg-white" />;
  return <ChatRoom room={room} thread={getThread(roomId)} mine={Boolean(own)} />;
}
