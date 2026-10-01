import { Suspense } from "react";
import CreateRoomFlow from "@/components/chat/create/CreateRoomFlow";

/** 방 만들기 — reached from the lobby's 방 만들기 button. */
export default function CreateRoomPage() {
  // CreateRoomFlow reads `?edit=`, which a prerendered page has to suspend on.
  return (
    <Suspense fallback={<div className="min-h-full w-full bg-white" />}>
      <CreateRoomFlow />
    </Suspense>
  );
}
