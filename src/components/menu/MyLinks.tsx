"use client";

import { useState, useSyncExternalStore } from "react";
import BottomSheet from "@/components/common/BottomSheet";
import Img from "@/components/common/Img";
import PickRow from "@/components/survey/PickRow";
import { myLinks, myLinksCopy } from "@/data/common/menu";
import { timeOptions } from "@/data/common/survey";
import { getSurvey, getSurveyServerSnapshot, setTime, subscribeSurvey } from "@/state/surveyStore";
import { showToast } from "@/state/toastStore";

/**
 * MY 탭의 설정 줄 — Figma 965:5630.
 *
 * 「알림 설정」만 진짜다 — 아래에서 올라오는 판으로 알림 시간을 고친다(온보딩이
 * 「MY > 알림 설정에서 바꿀 수 있어요」라고 약속한 자리). 나머지 줄과 로그아웃 ·
 * 회원탈퇴는 갈 화면이 아직 없어 「준비 중」이라고 알린다 — 눌러도 아무 일이
 * 없으면 고장으로 보인다(감수 지적).
 */
export default function MyLinks() {
  const picked = useSyncExternalStore(subscribeSurvey, getSurvey, getSurveyServerSnapshot);
  const [alarm, setAlarm] = useState(false);

  const press = (label: (typeof myLinks)[number]) => {
    if (label === "알림 설정") setAlarm(true);
    else showToast(myLinksCopy.soon(label));
  };

  return (
    <div className="flex w-full flex-col">
      <ul className="mx-6 flex flex-col">
        {myLinks.map((label) => (
          <li key={label}>
            <button
              type="button"
              onClick={() => press(label)}
              className="tap [--tap-w:0px] flex w-full items-center justify-between border-b border-divider py-[15px] text-left transition-opacity active:opacity-55"
            >
              <span className="text-[15px] leading-[1.4] text-[#17171a]">{label}</span>
              <span className="flex items-center gap-2">
                {label === "알림 설정" ? (
                  <span className="text-xs leading-none text-gray-500">
                    {timeOptions.find((one) => one.id === picked.time)?.short ?? myLinksCopy.alarmOff}
                  </span>
                ) : null}
                <Img src="/assets/my/chevron.svg" className="size-5 shrink-0" />
              </span>
            </button>
          </li>
        ))}
      </ul>

      <div className="flex w-full items-center justify-center gap-3 pt-6">
        <button
          type="button"
          onClick={() => showToast(myLinksCopy.soon("로그아웃"))}
          className="tap text-[13px] leading-[1.3] text-gray-500 transition-opacity active:opacity-55"
        >
          로그아웃
        </button>
        <span aria-hidden className="text-xs leading-[1.3] text-gray-300">
          |
        </span>
        <button
          type="button"
          onClick={() => showToast(myLinksCopy.soon("회원탈퇴"))}
          className="tap text-[13px] leading-[1.3] text-gray-500 transition-opacity active:opacity-55"
        >
          회원탈퇴
        </button>
      </div>

      <BottomSheet open={alarm} title={myLinksCopy.alarmTitle} onClose={() => setAlarm(false)}>
        <p className="mb-2 text-xs leading-[1.4] text-gray-500">{myLinksCopy.alarmNote}</p>
        <ul className="flex w-full flex-col gap-2">
          {timeOptions.map((one) => (
            <li key={one.id}>
              <PickRow
                icon={one.icon}
                label={one.label}
                on={picked.time === one.id}
                onPick={() => {
                  setTime(one.id);
                  setAlarm(false);
                  showToast(myLinksCopy.alarmSaved(one.short));
                }}
              />
            </li>
          ))}
        </ul>
      </BottomSheet>
    </div>
  );
}
