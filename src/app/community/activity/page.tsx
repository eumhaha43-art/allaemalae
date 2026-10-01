import AppHeader from "@/components/common/AppHeader";
import CommunityTabs from "@/components/community/CommunityTabs";
import ActivityBoard from "./_components/ActivityBoard";

/**
 * 나의 활동 — Figma node 1731:5274 (리디자인).
 *
 * 커뮤니티 탭의 네 번째 칸이다. 게시글·채팅방·토론방이 「남들이 무엇을
 * 하는가」라면 여기는 「내가 무엇을 했는가」다 — 등급 · 남은 조건 · 대표 지식 ·
 * 최근 활동 · 이용 가이드 차례로 내려간다.
 *
 * 화면에 뜨는 숫자와 목록은 씨앗(`_data/activity`)에 이 기기에서 한 활동을
 * 더한 것이다 — 글을 쓰거나 댓글을 달거나 글을 담으면 등급 막대와 최근 활동이
 * 함께 움직인다(요구사항 7-8: 좋아요·저장·작성은 관련 화면에 일관되게 반영).
 *
 * 바탕은 게시글 홈과 같은 #f8f9f8 — 탭을 오갈 때 바탕이 튀지 않는다.
 */
export default function ActivityPage() {
  return (
    <main className="flex flex-1 flex-col items-start bg-[#f8f9f8]">
      <AppHeader />
      <CommunityTabs />
      <ActivityBoard />
    </main>
  );
}
