"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import AppHeader from "@/components/common/AppHeader";
import Img from "@/components/common/Img";
import TypingInput from "@/components/keyboard/TypingInput";
import DummyFill from "@/components/join/DummyFill";
import JoinButton from "@/components/join/JoinButton";
import { AFTER_JOIN, profile, profileSample, profileSamplePhoto } from "@/data/common/join";
import { signup } from "@/data/common/personas";
import { usePersona } from "@/hooks/usePersona";
import { setPersona } from "@/state/personaStore";
import { setSurveyName, setSurveyPhoto } from "@/state/surveyStore";
import type { Persona } from "@/types/persona";
import { toThumbnail } from "@/utils/imageThumb";

/**
 * 사진과 이름 — Figma node 1265:5625.
 *
 * 가입의 뒷 장이다. 이름만 있으면 시작할 수 있다 — 사진은 넣어도 되고 말아도
 * 된다. 디자인도 사진 자리를 빈 채로 두고 아래 단추를 살리는 그림이다.
 *
 * 고른 사진은 올릴 곳이 없어 줄여서 화면에만 둔다(영수증 용지와 같은 방식).
 *
 * 이름(과 그 사람 몫의 사진)은 더미가 들어찬 채로 열린다. 더미 단추는 켜진 채
 * 「직접 입력하기」로 있고, 누르면 비워 손으로 넣을 수 있고 「더미 텍스트 입력」을
 * 다시 누르면 더미가 돌아온다.
 *
 * 사람은 서버에서 그릴 때는 모르고(personaStore) 브라우저에서야 정해진다. 더미가
 * 그 사람 이름이어야 하므로, 사람이 바뀌면 칸을 새로 앉힌다(key).
 */
export default function ProfileForm() {
  /** 고르고 들어온 사람 — 더미 이름이 그 사람 이름이 된다. */
  const persona = usePersona();
  return <ProfileFields key={persona?.id ?? "guest"} persona={persona} />;
}

/** 닉네임 최대 글자 수 — 아래 카운터와 같은 수 */
const NAME_MAX = 12;

function ProfileFields({ persona }: { persona: Persona | null }) {
  const router = useRouter();
  /** 더미가 채우는 값 — 이름과, 그 사람 몫의 사진이 있으면 사진. */
  const sample = {
    name: persona?.name ?? profileSample.name,
    photo: (persona && profileSamplePhoto[persona.id]) ?? null,
  };
  const [dummy, setDummy] = useState(true);
  const [name, setName] = useState<string>(sample.name);
  const [photo, setPhoto] = useState<string | null>(sample.photo);
  const pick = useRef<HTMLInputElement>(null);

  /** 더미를 넣거나(켬) 이름 · 사진을 비운다(끔). */
  const toggleDummy = () => {
    const next = !dummy;
    setDummy(next);
    setName(next ? sample.name : "");
    setPhoto(next ? sample.photo : null);
  };

  const choose = async (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;
    setPhoto(await toThumbnail(file, URL.createObjectURL(file)));
  };

  return (
    <main className="flex min-h-full w-full shrink-0 flex-col bg-white">
      {/* 알림 · 검색은 뺀다 — 앞 장(JoinForm)과 같은 까닭 */}
      {/* 로고는 홈으로 안 간다 — 가입을 건너뛰는 길이 된다(온보딩과 같은 규칙) */}
      <AppHeader logoHome={false}>
        <span aria-hidden />
      </AppHeader>

      <div className="flex min-h-px flex-1 flex-col bg-[#f8f9f8] px-6 pt-7 pb-6">
        <div className="flex w-full items-start justify-between gap-3">
          <h1 className="text-[28px] leading-[1.3] font-semibold text-[#1c1b1b]">
            {profile.heading.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </h1>
          <DummyFill label={dummy ? profile.manual : profile.dummy} on={dummy} onToggle={toggleDummy} />
        </div>

        {/* 얼굴 — 고른 사진이 있으면 그 사진, 없으면 빈 사람 그림 */}
        <div className="relative mx-auto mt-[46px] size-[167px] shrink-0">
          <span className="flex size-full items-center justify-center overflow-hidden rounded-full border-4 border-[#fcf9f8] bg-[#ebe7e7] shadow-[0_8px_24px_0_rgba(0,0,0,0.04)]">
            {photo ? (
              <Img src={photo} className="size-full object-cover" />
            ) : (
              <Img src="/assets/join/avatar.svg" className="size-[42.7px]" />
            )}
          </span>
          <button
            type="button"
            aria-label={profile.photoPick}
            onClick={() => pick.current?.click()}
            className="tap absolute right-0 bottom-0 flex size-10 items-center justify-center rounded-full border-2 border-[#fcf9f8] bg-[#5f5f5f] transition-opacity active:opacity-80"
          >
            <Img src="/assets/join/camera.svg" className="h-[15px] w-[16.7px]" />
          </button>
          <input
            ref={pick}
            type="file"
            accept="image/*"
            hidden
            onChange={(event) => {
              void choose(event.target.files);
              event.target.value = "";
            }}
          />
        </div>

        <div className="mt-[46px] flex w-full flex-col gap-2">
          <div className="flex h-12 w-full items-center gap-2 border-b border-[#232323] px-[10px]">
            <TypingInput
              value={name}
              onChange={setName}
              maxLength={NAME_MAX}
              aria-label={profile.namePlaceholder}
              placeholder={profile.namePlaceholder}
              className="min-w-px flex-1 bg-transparent text-[17px] leading-none text-gray-900 outline-none placeholder:text-[#b9baba]"
            />
            {name ? (
              <button
                type="button"
                aria-label={profile.clear}
                onClick={() => setName("")}
                className="tap flex size-6 shrink-0 transition-opacity active:opacity-55"
              >
                <Img src="/assets/join/x-circle.svg" className="size-full" />
              </button>
            ) : null}
          </div>
          {/* 열두 자까지 — 넘치면 조용히 잘리기만 해서 몇 자인지 알 길이 없었다(감수 지적) */}
          <div className="flex w-full items-start justify-between gap-3">
            <p className="text-[13px] leading-[1.45] text-[#b9baba]">{profile.nameHint}</p>
            <span className="shrink-0 text-[12px] leading-[1.45] text-[#b9baba] tabular-nums">
              {name.length}/{NAME_MAX}
            </span>
          </div>
        </div>

        <div className="min-h-[24px] flex-1" />
        <JoinButton
          label={profile.cta}
          on={name.trim().length > 0}
          onClick={() => {
            // 설문 마지막 장이 이 이름으로 부르고, 회원증 · 메뉴 프로필이 이 사진을 쓴다
            setSurveyName(name.trim());
            setSurveyPhoto(photo);
            /*
              PC 셸에서 퍼소나를 고르지 않고 여기까지 온 사람 — 지금부터 「이 탭에서
              가입한 사람」이다. 안 앉히면 홈이 프레임의 자리 표시(홍길동 · 블랙카드
              · 80코인)로 그려진다(감수 지적). 고르고 온 사람(김민정)은 그대로.
            */
            if (!persona) setPersona(signup.id);
            router.push(AFTER_JOIN);
          }}
        />
      </div>
    </main>
  );
}
