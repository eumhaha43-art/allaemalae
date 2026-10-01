import AppHeader from "@/components/common/AppHeader";
import CommunityTabs from "@/components/community/CommunityTabs";
import PollHero from "@/components/community/PollHero";
import CategoryChips from "@/components/community/CategoryChips";
import TrendingList from "@/components/community/TrendingList";
import RecentPosts from "@/components/community/RecentPosts";
import ActionFab from "@/components/common/ActionFab";

/** 커뮤니티 게시글 홈 — Figma node 856:5217 */
export default function CommunityPage() {
  return (
    <main className="flex flex-1 flex-col items-start bg-[#f8f9f8]">
      <AppHeader />
      <CommunityTabs />
      <PollHero />
      <div className="flex w-full flex-col gap-[10px] bg-[#f5f8fa] pb-[10px]">
        <TrendingList />
        {/*
          분류 칩은 최신 글 바로 위에 둔다 — 투표 아래(뜨는 지식 위)에 있을 때는
          무엇을 거르는 칩인지 알 수 없었다. 뜨는 지식은 분류와 상관없이 도는
          순위라, 칩이 그 위에 있으면 순위를 거르는 것처럼 읽힌다.
        */}
        <CategoryChips />
        <RecentPosts />
      </div>
      <ActionFab href="/community/write" label="글쓰기" icon="/assets/community/pen.svg" />
    </main>
  );
}
