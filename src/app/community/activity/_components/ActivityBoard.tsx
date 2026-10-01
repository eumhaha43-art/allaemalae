"use client";

import GuideCard from "./GuideCard";
import MissionList from "./MissionList";
import RecentActivity from "./RecentActivity";
import TierCard from "./TierCard";
import TopPosts from "./TopPosts";
import RiseIn from "@/components/home/RiseIn";
import { usePersona } from "@/hooks/usePersona";
import { useMyActivity } from "../_lib/useMyActivity";

/**
 * 나의 활동의 알맹이 — 1731:5274.
 *
 * 저장소를 읽는 곳은 여기 하나다. 카드들이 저마다 읽으면 같은 값을 여러 번
 * 세게 되고, 무엇보다 화면을 읽을 때 「이 숫자가 어디서 왔나」를 여러 군데서
 * 찾아야 한다.
 *
 * 묶음 사이는 28, 좌우 24 — 프레임 그대로. 탭 줄이 아래 여백 20 을 이미 갖고
 * 있어 위는 더 띄우지 않는다.
 *
 * 프레임은 기존 회원 한상현의 화면이다. 오늘 막 가입한 김민정(`fresh`)은
 * 씨앗 없이 0 에서 시작하고, 「처음이신가요?」 가이드가 맨 아래 대신 등급 카드
 * 바로 밑에 온다 — 빈 목록을 다 내려가서야 안내를 만나면 늦다.
 */
export default function ActivityBoard() {
  const fresh = usePersona()?.fresh ?? false;
  const { counts, progress, percent, missions, missionsLeft, top, entries } = useMyActivity(fresh);

  return (
    <div className="flex w-full flex-col gap-7 px-6 pb-7">
      {/* 카드는 위에서부터 차례로 떠오른다(RiseIn — 홈 섹션과 같은 것, 사용자 요청) */}
      <RiseIn order={0}>
        <TierCard fresh={fresh} counts={counts} progress={progress} percent={percent} />
      </RiseIn>
      {fresh ? (
        <RiseIn order={1}>
          <GuideCard fresh />
        </RiseIn>
      ) : null}
      <RiseIn order={2}>
        <MissionList missions={missions} missionsLeft={missionsLeft} />
      </RiseIn>
      <RiseIn order={3}>
        <TopPosts top={top} counts={counts} />
      </RiseIn>
      <RiseIn order={4}>
        <RecentActivity entries={entries} />
      </RiseIn>
      {fresh ? null : (
        <RiseIn order={5}>
          <GuideCard fresh={false} />
        </RiseIn>
      )}
    </div>
  );
}
