import AppHeader from "@/components/common/AppHeader";
import FirstRun from "@/app/onboarding/_components/FirstRun";
import CoinGuide from "@/components/home/CoinGuide";
import NoticeBar from "@/components/home/NoticeBar";
import HeroSection from "@/components/home/HeroSection";
import RecommendSection from "@/components/home/RecommendSection";
import QuizBox from "@/components/home/QuizBox";
import PickBox from "@/components/home/PickBox";
import FreeBox from "@/components/home/FreeBox";
import LuckyDraw from "@/components/home/LuckyDraw";
import MachineCard from "@/components/home/MachineCard";
import ContinueSection from "@/components/home/ContinueSection";
import RiseIn from "@/components/home/RiseIn";

/**
 * 홈 — Figma node 856:7909.
 *
 * 디자인은 섹션을 절대 위치로 쌓아 두었지만, 여기서는 세로 흐름으로 두고
 * 프레임에서 잰 간격을 섹션 사이에 그대로 준다.
 */
export default function Home() {
  return (
    <>
      {/* 앱을 처음 여는 사람은 홈이 아니라 온보딩부터 본다 */}
      <FirstRun />
      {/* 온보딩과 설문을 마치고 돌아온 처음 온 사람에게 코인 규칙을 한 번 */}
      <CoinGuide />
      {/*
        홈은 돌아갈 곳이 없어 뒤로가기 자리가 빈다 — 그 자리에 보유 코인을 둔다.
        디자인의 opacity 0 짜리 빈 칸을 쓰는 것이라 로고 자리는 그대로다.
      */}
      <AppHeader back={null} coins divider />
      {/* 아래 여백은 탭 바 위의 알래봇 자리(81)까지 — 마지막 카드가 단추 밑에 깔리지 않게 */}
      <main className="flex flex-1 flex-col bg-[#f8f9f8] pt-5 pb-[100px]">
        {/* 뽑기 쿠폰 티켓은 여기 두지 않는다(사용자 결정) — 기계로 가는 길은 지식깡 밑 카드와 MY 출석 밑 티켓 */}
        {/* 섹션은 위에서부터 차례로 떠오른다(RiseIn, 사용자 요청) — 순번이 곧 박자다 */}
        <RiseIn order={0}>
          <NoticeBar />
        </RiseIn>
        <div className="h-5 shrink-0" />
        <RiseIn order={1}>
          <HeroSection />
        </RiseIn>
        <div className="h-10 shrink-0" />
        <RiseIn order={2}>
          <RecommendSection />
        </RiseIn>
        <div className="h-20 shrink-0" />
        <RiseIn order={3}>
          <QuizBox />
        </RiseIn>
        <div className="h-20 shrink-0" />
        {/* 뽑기 기계로 가는 카드 — 지식깡 밑에 있다가 점장님 Pick 위로(사용자 지시). Pick 과 40, 앞 섹션과는 여느 사이처럼 80 */}
        <RiseIn order={4}>
          <MachineCard />
        </RiseIn>
        <div className="h-10 shrink-0" />
        <RiseIn order={5}>
          <PickBox />
        </RiseIn>
        <div className="h-20 shrink-0" />
        <RiseIn order={6}>
          <FreeBox />
        </RiseIn>
        <div className="h-20 shrink-0" />
        <RiseIn order={7}>
          <LuckyDraw />
        </RiseIn>
        <div className="h-20 shrink-0" />
        <RiseIn order={8}>
          <ContinueSection />
        </RiseIn>
      </main>
    </>
  );
}
