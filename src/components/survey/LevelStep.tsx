"use client";

import { useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import SurveyShell from "@/components/survey/SurveyShell";
import PickRow from "@/components/survey/PickRow";
import { levelOptions, survey } from "@/data/common/survey";
import {
  getSurvey,
  getSurveyServerSnapshot,
  setLevel,
  subscribeSurvey,
} from "@/state/surveyStore";

/** 설문 2/3 — 난이도, Figma node 1501:4226. */
export default function LevelStep() {
  const router = useRouter();
  const picked = useSyncExternalStore(subscribeSurvey, getSurvey, getSurveyServerSnapshot);

  return (
    <SurveyShell
      at={2}
      title={survey.level.title}
      sub={survey.level.sub}
      note={survey.level.note}
      cta={survey.level.cta}
      ready={Boolean(picked.level)}
      onNext={() => router.push("/survey/time")}
    >
      <ul className="flex w-full flex-col gap-[10px]">
        {levelOptions.map((one) => (
          <li key={one.id}>
            <PickRow
              icon={one.icon}
              label={one.label}
              on={picked.level === one.id}
              onPick={() => setLevel(one.id)}
            />
          </li>
        ))}
      </ul>
    </SurveyShell>
  );
}
