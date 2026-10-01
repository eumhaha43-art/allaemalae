import AppHeader from "@/components/common/AppHeader";
import CommunityTabs from "@/components/community/CommunityTabs";
import ChatLobby from "@/components/chat/ChatLobby";

/** Chat lobby — Figma node 761:1026 ("채팅방 홈") */
export default function ChatLobbyPage() {
  return (
    <>
      <AppHeader />
      <CommunityTabs />
      <ChatLobby />
    </>
  );
}
