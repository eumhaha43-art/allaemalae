"use client";

import { Fragment, useCallback, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Img from "@/components/common/Img";
import LogoSplash from "@/components/common/LogoSplash";
import DummyFill from "@/components/join/DummyFill";
import SecretInput from "@/components/join/SecretInput";
import TypingInput from "@/components/keyboard/TypingInput";
import { markOnboarded } from "@/app/onboarding/_lib/seen";
import { joinSample } from "@/data/common/join";
import { login, socialLogins } from "@/data/common/login";
import { usePersona } from "@/hooks/usePersona";
import { sendCouponNotice } from "@/state/notificationStore";
import { takeSplashRequest } from "@/state/splashStore";
import type { Persona } from "@/types/persona";

/**
 * 로그인 — Figma 1554:3556.
 *
 * 쓰던 사람(한상현)의 길에만 있다: 여는 화면 → 로그인 → 홈. 처음 온 사람은
 * 여기를 거치지 않는다 — 온보딩 → 가입 → 설문 → 홈으로 곧장 간다. 방금
 * 가입한 사람에게 「로그인」을 또 누르게 하는 것이라 뺐다.
 *
 * 실제 로그인은 아직 없다 — 퍼소나를 고른 것이 곧 로그인이다(personas.ts).
 * 아이디 · 비밀번호를 채우고 「로그인」을 누르거나 아래 소셜 단추 중 하나를
 * 누르면 들어간다. 소셜 단추가 죽어 있으면 만들다 만 화면으로 보이고, 소셜
 * 로그인은 원래 칸을 안 채우고 들어가는 길이라 같은 곳으로 보낸다. 나중에
 * 진짜 로그인이 붙으면 이 화면이 personaStore 에 사람을 앉히면 된다.
 *
 * 두 칸은 더미가 들어찬 채로 열린다 — 아이디는 고른 사람의 id, 비밀번호는
 * 회원가입 장과 같은 것. 더미 단추는 켜진 채 「직접 입력하기」로 있고, 누르면
 * 두 칸을 비워 손으로 넣을 수 있고 「더미 텍스트 입력」을 다시 누르면 더미가
 * 돌아온다. 머리 오른쪽에 둔 것은 디자인이 그 자리를 비워 두고 있어서다
 * (1554:3630).
 *
 * 사람은 서버에서 그릴 때는 모르고(personaStore) 브라우저에서야 정해진다. 칸이
 * 그 사람 id 로 시작해야 하므로, 사람이 바뀌면 칸을 새로 앉힌다(key).
 *
 * 쓰던 사람으로 고르면 앱을 다시 연 것처럼 여는 화면부터 본다 — 퍼소나 고르기
 * 가 `requestSplash` 로 부탁해 두고, 여기서 한 번 꺼내 쓴다.
 *
 * 머리는 뒤로가기 하나뿐이라 공통 헤더를 안 쓴다 — 가운데 로고 자리와 오른쪽
 * 단추 자리가 디자인에서 비어 있다(1554:3629 · 1554:3630).
 */
export default function LoginScreen() {
  const persona = usePersona();
  const [splash, setSplash] = useState(() => takeSplashRequest());
  const doneSplash = useCallback(() => setSplash(false), []);

  return (
    <main className="relative flex min-h-full w-full shrink-0 flex-col bg-white">
      {splash ? <LogoSplash onDone={doneSplash} /> : null}
      <LoginFields key={persona?.id ?? "guest"} persona={persona} />
    </main>
  );
}

function LoginFields({ persona }: { persona: Persona | null }) {
  const router = useRouter();
  /** 더미가 채우는 값. */
  const sample = { id: persona?.id ?? joinSample.id, pw: joinSample.password };
  const [dummy, setDummy] = useState(true);
  const [id, setId] = useState<string>(sample.id);
  const [pw, setPw] = useState<string>(sample.pw);

  /** 더미를 넣거나(켬) 두 칸을 비운다(끔). */
  const toggleDummy = () => {
    const next = !dummy;
    setDummy(next);
    setId(next ? sample.id : "");
    setPw(next ? sample.pw : "");
  };

  const ready = id.length > 0 && pw.length > 0;

  const enter = () => {
    // 로그인까지 왔으면 소개는 끝난 것 — 홈이 다시 온보딩으로 보내지 않게
    markOnboarded();
    /*
      쓰던 사람(블랙카드)에게는 들어서자마자 무료 뽑기 쿠폰이 온다.

      뽑기 기계는 탭 바에도 홈에도 대놓고 나와 있지 않아서, 알려 주지 않으면
      시연에서 아예 안 열어 본 채로 지나간다. 갓 가입한 사람에게는 보내지
      않는다 — 그쪽은 출석과 퀴즈로 코인을 모으는 길을 먼저 봐야 한다.
    */
    if (persona && !persona.fresh) sendCouponNotice();
    router.replace("/");
  };

  return (
    <>
      {/* 머리 — 1554:3625. 뒤로 하나, 오른쪽 빈 자리에 더미 입력 */}
      <div className="flex h-[60px] w-full shrink-0 items-center justify-between px-6">
        <button
          type="button"
          aria-label="뒤로"
          onClick={() => router.back()}
          className="tap flex transition-opacity active:opacity-55"
        >
          <Img src="/assets/community/back.svg" className="h-[14px] w-[7px]" />
        </button>
        <DummyFill label={dummy ? login.manual : login.dummy} on={dummy} onToggle={toggleDummy} />
      </div>

      {/* 폭 338 — 402 에서 양옆 32 를 뺀 것. 칸 · 단추 · 구분선이 다 이 폭이다 */}
      <div className="flex min-h-px flex-1 flex-col items-center px-8">
        {/* 로고 — 1554:3636. 183.45 × 40.82 */}
        <Img
          src="/assets/logo-wide.svg"
          alt=""
          className="mt-[46px] h-[41px] w-[183px] shrink-0"
        />
        <h1 className="mt-[42px] text-[30px] leading-none font-bold text-black">{login.title}</h1>
        <p className="mt-[11px] text-center text-sm leading-none font-medium text-[#808080]">
          {login.sub}
        </p>

        {/* 폼 — 1554:3605 */}
        <p className="mt-[42px] text-center text-sm leading-none text-[#1c1b1b]">{login.lead}</p>
        <div className="mt-4 flex w-full flex-col gap-[15px]">
          <TypingInput
            value={id}
            onChange={setId}
            maxLength={20}
            aria-label={login.idPlaceholder}
            placeholder={login.idPlaceholder}
            className="h-12 w-full rounded-[8px] border border-[#cfcfcf] bg-white px-4 text-[16px] leading-[1.3] text-gray-black outline-none placeholder:text-[#c8c8c8]"
          />
          <SecretInput
            look="login"
            value={pw}
            onChange={setPw}
            maxLength={20}
            label={login.pwPlaceholder}
            placeholder={login.pwPlaceholder}
          />
          {/*
            1554:3617. 프레임은 짙은 회색(#373737)인데 메인 초록으로 칠한다 — 회원가입
            쪽 단추와 색이 같아야 한 앱으로 보인다(사용자 결정). 두 칸이 차기
            전에는 회원가입 단추처럼 회색으로 죽어 있다.
          */}
          <button
            type="button"
            disabled={!ready}
            onClick={enter}
            className={`tap [--tap-w:0px] flex h-[50px] w-full items-center justify-center rounded-[8px] text-[18px] leading-none transition-colors ${
              ready ? "bg-primary-600 text-white active:opacity-80" : "bg-[#e8e8e8] text-[#6f7070]"
            }`}
          >
            {login.cta}
          </button>
        </div>

        {/* 1554:3619 — 찾기 둘은 갈 화면이 없어 글자만, 회원가입은 진짜로 간다 */}
        <div className="mt-6 flex items-center gap-[15px] text-xs leading-none text-[#202020]">
          {login.links.map((link, index) => (
            <Fragment key={link}>
              {index > 0 ? <span aria-hidden className="h-[10px] w-px bg-[#757575]" /> : null}
              {index === login.links.length - 1 ? (
                <Link href="/join" className="tap [--tap-w:0px] transition-opacity active:opacity-55">
                  {link}
                </Link>
              ) : (
                <span>{link}</span>
              )}
            </Fragment>
          ))}
        </div>

        <div className="min-h-6 flex-1" />

        {/* 소셜 — 1554:3576. 아래 여백 60 은 홈 인디케이터 위까지 */}
        <div className="flex w-full items-center px-[18px]">
          <span aria-hidden className="h-px min-w-px flex-1 bg-[#373737]" />
          <span className="px-4 text-xs leading-4 whitespace-nowrap text-[#737373]">{login.sns}</span>
          <span aria-hidden className="h-px min-w-px flex-1 bg-[#373737]" />
        </div>
        <div className="mt-4 mb-[60px] flex items-center justify-center gap-4">
          {socialLogins.map((social) => (
            <button
              key={social.id}
              type="button"
              aria-label={social.label}
              onClick={enter}
              style={{ backgroundColor: social.color }}
              className="tap [--tap-w:0px] flex size-14 shrink-0 items-center justify-center rounded-full shadow-md transition-opacity active:opacity-80"
            >
              {"icon" in social ? (
                <Img
                  src={social.icon}
                  style={{ width: social.size, height: social.size }}
                  className="shrink-0"
                />
              ) : (
                <span className="text-[25px] leading-none font-black text-white">{social.mark}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* 홈 인디케이터 — 전체화면이라 공용 인디케이터가 빠진다 */}
      <div className="home-bar relative h-[34px] w-full shrink-0 bg-white">
        <Img
          src="/assets/home-indicator.svg"
          className="absolute bottom-2 left-1/2 h-[5px] w-[134px] -translate-x-1/2"
        />
      </div>
    </>
  );
}
