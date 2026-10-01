import ActionFab from "@/components/common/ActionFab";
import AppHeader from "@/components/common/AppHeader";
import CommunityTabs from "@/components/community/CommunityTabs";
import DebateList from "@/components/debate/DebateList";

/** 토론방 홈 — Figma node 761:2346 */
export default function DebatePage() {
  return (
    <>
      <AppHeader />
      <CommunityTabs />
      <DebateList />
      {/*
        토론방 만들기 화면이 아직 없다 — 나의 활동 탭과 같이, 갈 곳이 생길
        때까지는 눌러도 넘어가지 않는 버튼으로 둔다.
      */}
      <ActionFab label="토론방 만들기" icon="/assets/chat/plus.svg" />
    </>
  );
}
