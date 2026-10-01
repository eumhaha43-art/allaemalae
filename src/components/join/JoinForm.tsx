"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AppHeader from "@/components/common/AppHeader";
import TypingInput from "@/components/keyboard/TypingInput";
import ConsentRow from "@/components/join/ConsentRow";
import DummyFill from "@/components/join/DummyFill";
import JoinButton from "@/components/join/JoinButton";
import SecretInput from "@/components/join/SecretInput";
import { join, joinSample, joinSampleBy } from "@/data/common/join";
import { usePersona } from "@/hooks/usePersona";
import type { Persona } from "@/types/persona";

/**
 * 회원가입 — Figma node 1254:4024.
 *
 * 아이디 한 줄, 비밀번호 두 줄, 그 아래 필수 동의 두 줄. 세 칸이 다 차고
 * 비밀번호 둘이 같고 동의가 둘 다 켜져야 아래 단추가 메인 색으로 살아난다.
 *
 * 머리 오른쪽의 알림 · 검색은 뺀다 — 아직 가입도 안 한 사람에게 알림함과
 * 검색을 열어 줄 일이 없다(뒷 장 ProfileForm 도 같다).
 *
 * 「중복확인」은 시연용이라 누르면 늘 쓸 수 있다고 답한다 — 보낼 서버가 없다.
 * 그래도 단추를 살려 둔 것은, 눌러 보지도 못하는 단추가 화면에 있으면 만들다
 * 만 것으로 보이기 때문이다.
 *
 * 아이디를 고친 뒤에는 확인이 풀린다. 확인해 둔 채로 다른 아이디를 넣고 가입할
 * 수 있으면 확인하는 뜻이 없다.
 *
 * 칸은 더미(joinSample)가 들어찬 채로 열린다 — 중복확인과 동의까지 켜진 채로.
 * 더미 단추는 켜진 채 「직접 입력하기」로 있고, 누르면 죄다 비워 손으로 넣을 수
 * 있고 「더미 텍스트 입력」을 다시 누르면 더미가 돌아온다.
 *
 * 더미 아이디는 고른 사람 것이다. 사람은 서버에서 그릴 때는 모르고
 * (personaStore) 브라우저에서야 정해지므로, 사람이 바뀌면 칸을 새로 앉힌다(key)
 * — 뒷 장 `ProfileForm` 과 같은 방식이다.
 */
export default function JoinForm() {
  /** 고르고 들어온 사람 — 더미 아이디가 그 사람 것이 된다. */
  const persona = usePersona();
  return <JoinFields key={persona?.id ?? "guest"} persona={persona} />;
}

function JoinFields({ persona }: { persona: Persona | null }) {
  const router = useRouter();
  /** 더미가 채우는 값 — 고른 사람 몫이 있으면 그것, 없으면 가게 이름. */
  const sample = (persona && joinSampleBy[persona.id]) ?? joinSample;
  const [dummy, setDummy] = useState(true);
  const [id, setId] = useState<string>(sample.id);
  const [pw, setPw] = useState<string>(sample.password);
  const [pw2, setPw2] = useState<string>(sample.password);
  const [checked, setChecked] = useState(true);
  /** 필수 동의 — `join.consents` 와 같은 차례. */
  const [agreed, setAgreed] = useState<readonly boolean[]>(() => join.consents.map(() => true));

  const toggle = (index: number) =>
    setAgreed((now) => now.map((on, at) => (at === index ? !on : on)));

  const typeId = (next: string) => {
    setId(next);
    setChecked(false);
  };

  /** 더미를 넣거나(켬) 칸 · 확인 · 동의를 죄다 비운다(끔). */
  const toggleDummy = () => {
    const next = !dummy;
    setDummy(next);
    setId(next ? sample.id : "");
    setPw(next ? sample.password : "");
    setPw2(next ? sample.password : "");
    setChecked(next);
    // 동의까지 함께 켠다 — 칸은 다 찼는데 단추가 죽어 있으면 시연에서 빠진 것을 찾게 된다
    setAgreed(join.consents.map(() => next));
  };

  const mismatch = pw2.length > 0 && pw !== pw2;
  const ready = id.length > 0 && pw.length >= 6 && pw === pw2 && agreed.every(Boolean);

  return (
    <main className="flex min-h-full w-full shrink-0 flex-col bg-white">
      <AppHeader title={join.title} titleSize={16}>
        <span aria-hidden />
      </AppHeader>

      {/*
        위 여백을 9 에서 28 로 열었다 — 칸이 머리에 바로 붙어 「위에 몰렸다」는
        느낌을 주던 자리다. 칸 높이와 글씨도 한 단 키워 손가락과 눈에 맞춘다.
      */}
      <div className="flex min-h-px flex-1 flex-col bg-[#f8f9f8] px-6 pt-7 pb-6">
        <div className="flex w-full items-center justify-between">
          <label className="text-[13px] leading-[1.3] font-medium text-primary-700">
            {join.idLabel}
          </label>
          <DummyFill label={dummy ? join.manual : join.dummy} on={dummy} onToggle={toggleDummy} />
        </div>

        <div className="mt-3 flex w-full items-center gap-[10px]">
          <TypingInput
            value={id}
            onChange={typeId}
            maxLength={20}
            aria-label={join.idLabel}
            placeholder={join.idPlaceholder}
            className="min-w-px flex-1 rounded-[8px] border border-[#e8e8e8] bg-white px-5 py-3 text-[15px] leading-[1.3] font-medium text-gray-black outline-none placeholder:text-[#d1d1d1]"
          />
          <button
            type="button"
            disabled={!id}
            onClick={() => setChecked(true)}
            className={`tap [--tap-w:0px] flex shrink-0 items-center justify-center rounded-[8px] border px-5 py-3 text-[15px] leading-[1.3] font-medium transition-colors ${
              checked
                ? "border-primary-600 bg-primary-600 text-white"
                : "border-[#e8e8e8] bg-[#e8e8e8] text-[#6f7070]"
            }`}
          >
            {join.idCheck}
          </button>
        </div>

        {checked ? (
          <p className="mt-2 text-[13px] leading-[1.3] text-primary-700">{join.idChecked}</p>
        ) : null}

        <label className="mt-8 text-[13px] leading-[1.3] font-medium text-primary-700">
          {join.pwLabel}
        </label>

        {/* 둘 다 ●로 가려지고, 칸마다 눈을 눌러 따로 열어 본다 */}
        <div className="mt-3 flex w-full flex-col gap-[10px]">
          <SecretInput
            value={pw}
            onChange={setPw}
            maxLength={20}
            label={join.pwLabel}
            placeholder={join.pwPlaceholder}
          />
          <SecretInput
            value={pw2}
            onChange={setPw2}
            maxLength={20}
            label={join.pw2Placeholder}
            placeholder={join.pw2Placeholder}
            alert={mismatch}
          />
        </div>

        <p
          className={`mt-3 text-[13px] leading-[1.45] ${mismatch ? "text-[#ff5a5a]" : "text-[#b9baba]"}`}
        >
          {mismatch ? join.pwMismatch : join.pwHint}
        </p>

        {/* 필수 동의 — 줄 사이는 줄 자체의 위아래 여백(10px)이 벌린다 */}
        <div className="mt-6 flex w-full flex-col gap-1">
          {join.consents.map((label, index) => (
            <ConsentRow
              key={label}
              label={label}
              on={agreed[index]}
              onToggle={() => toggle(index)}
            />
          ))}
        </div>

        {/* 단추는 바닥에 — 칸이 짧아도 디자인처럼 화면 아래에 앉는다 */}
        <div className="min-h-[24px] flex-1" />
        <JoinButton label={join.cta} on={ready} onClick={() => router.push("/join/profile")} />
      </div>
    </main>
  );
}
