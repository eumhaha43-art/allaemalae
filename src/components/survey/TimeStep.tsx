"use client";

import { useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import SurveyShell from "@/components/survey/SurveyShell";
import PickRow from "@/components/survey/PickRow";
import { survey, timeOptions } from "@/data/common/survey";
import {
  getSurvey,
  getSurveyServerSnapshot,
  setTime,
  subscribeSurvey,
} from "@/state/surveyStore";

/**
 * 설문 3/3 — 알림 시간, Figma node 1501:4276.
 *
 * 「알림 시간 설정」(직접 시각 고르기)은 뺐다 — 준비 중인 단추가 한 줄 더
 * 있으면 낮은 화면에서 넘쳤고(기획 피드백), 시간대는 MY > 알림 설정에서 언제든
 * 바꿀 수 있다.
 *
 * 프레임의 진행 막대에는 STEP 2/3 이 적혀 있으나 마지막 장이므로 3/3 으로 둔다.
 */
export default function TimeStep() {
  const router = useRouter();
  const picked = useSyncExternalStore(subscribeSurvey, getSurvey, getSurveyServerSnapshot);

  return (
    <SurveyShell
      at={3}
      title={survey.time.title}
      sub={survey.time.sub}
      note={survey.time.note}
      cta={survey.time.cta}
      ready={Boolean(picked.time)}
      onNext={() => router.push("/survey/ready")}
    >
      {/* 시각을 직접 고르는 「알림 시간 설정」은 뺐다 — 준비 중인 단추가 한 줄 더 있으면 낮은 화면에서 넘친다 */}
      <ul className="flex w-full flex-col gap-[10px] [@media(max-height:700px)]:gap-2">
        {timeOptions.map((one) => (
          <li key={one.id}>
            <PickRow
              icon={one.icon}
              label={one.label}
              on={picked.time === one.id}
              onPick={() => setTime(one.id)}
            />
          </li>
        ))}
      </ul>
    </SurveyShell>
  );
}
