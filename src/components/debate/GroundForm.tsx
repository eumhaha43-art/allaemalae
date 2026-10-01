"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Img from "@/components/common/Img";
import IosKeyboard from "@/components/keyboard/IosKeyboard";
import {
  KeyboardSpacer,
  scrollFieldAboveKeyboard,
  useTypingField,
} from "@/hooks/useIosKeyboard";
import type { Debate, Side } from "@/data/common/debate";
import {
  addGround,
  getGroundsServerSnapshot,
  getGroundsSnapshot,
  groundsFor,
  subscribeGrounds,
  updateGround,
} from "@/state/groundStore";

const TEXT_MAX = 200;

/**
 * 근거 달기 — Figma node 805:4304, opened by the sheet's 나도 근거 달기.
 *
 * Note: this frame paints Primary/100 as #cbffe3 and Primary/800 as #004d2c,
 * a shade off the style guide's #d6fff1 / #004d32. The frame values are used
 * here so the screen matches; the two need reconciling in Figma.
 *
 * 고치는 화면도 겸한다: `?edit=<근거 id>` 로 들어오면 내가 단 근거를 도로
 * 담아 두고, 새로 붙이는 대신 그 자리에 덮어쓴다 — 글쓰기(`?edit=`)와 같다.
 *
 * 새로 다는 근거는 더미(debate.sample)가 들어찬 채로 열린다 — 진영 · 근거 ·
 * 가장 맞는 출처까지. 더미 단추는 켜진 채 「직접 입력하기」로 있고, 누르면 빈
 * 화면으로 돌려 손으로 쓸 수 있고 「더미 텍스트 입력」을 다시 누르면 더미가
 * 돌아온다. 글쓰기와 같은 구조다.
 */
export default function GroundForm({ debate }: { debate: Debate }) {
  const router = useRouter();
  const back = `/community/debate/${debate.id}`;
  const editId = useSearchParams().get("edit");

  const written = useSyncExternalStore(
    subscribeGrounds,
    getGroundsSnapshot,
    getGroundsServerSnapshot,
  );
  const editing = editId
    ? groundsFor(written, debate.id).find((entry) => entry.id === editId)
    : undefined;

  /** 더미가 들어 있는지. 고치기는 그 근거가 들어 있으니 더미가 없다. */
  const [dummy, setDummy] = useState(!editing);
  const [side, setSide] = useState<Side>(editing?.side ?? debate.sample.side);
  const ground = useTypingField({
    maxLength: TEXT_MAX,
    initial: editing?.text ?? debate.sample.text,
  });
  /** 이 방 주제의 출처 후보 — 방마다 다르다. */
  const sourceHits = debate.sources;
  /** 더미가 붙이는 출처 — 이 방 근거에 가장 맞는 자료. */
  const bestHit = sourceHits.find((hit) => hit.best) ?? sourceHits[0];
  const field = useRef<HTMLTextAreaElement>(null);
  /*
    붙여 둔 출처. 처음 다는 근거는 더미가 고른 자료가 붙은 채로 열리고, 더미를
    비우면 디자인처럼 첫 자료가 붙는다. 고치러 들어왔을 때는 그때 붙였는지
    아닌지를 그대로 되살린다.
  */
  const [attached, setAttached] = useState<string | null>(
    editing ? (editing.sourced ? sourceHits[0].id : null) : bestHit.id,
  );

  /**
   * 근거를 붙이거나 덮어쓰고 방으로 돌아간다.
   *
   * 빈 근거는 붙이지 않는다 — 목록에 빈 줄이 생기고 지울 길이 그 줄의 「⋯」
   * 뿐이라, 무엇을 지우는 것인지 알 수 없는 줄이 된다. 대신 칸으로 데려간다.
   */
  const submit = () => {
    const text = ground.value.trim();
    if (!text) {
      field.current?.focus();
      return;
    }
    const values = { text, side, sourced: attached !== null };
    if (editing) updateGround(debate.id, editing.id, values);
    else addGround(debate.id, values);
    router.push(back);
  };

  useEffect(() => {
    const element = field.current;
    if (!ground.open || !element) return;
    // 자리비움이 붙고 나서 재야 한다.
    const id = requestAnimationFrame(() => scrollFieldAboveKeyboard(element));
    return () => cancelAnimationFrame(id);
  }, [ground.open]);

  const source = sourceHits.find((hit) => hit.id === attached);

  /**
   * 더미 단추 — 더미를 넣거나(켬) 빈 화면으로 돌린다(끔).
   *
   * 넣을 때는 방마다 적어 둔 근거(sample)를 진영과 함께 채우고 가장 맞는 출처를
   * 붙인다 — 시연에서 글자를 치지 않고도 등록까지 보여 준다. 비울 때는 A 진영 ·
   * 빈 칸 · 첫 자료, 디자인이 그려 둔 첫 모습이다.
   */
  const putDummy = (next: boolean) => {
    setDummy(next);
    setSide(next ? debate.sample.side : "A");
    if (next) ground.type(debate.sample.text);
    else ground.clear();
    setAttached(next ? bestHit.id : sourceHits[0].id);
  };
  const label = (of: Side) => {
    const option = debate.options.find((entry) => entry.side === of);
    return `${of}  ${option?.label ?? ""}`;
  };

  return (
    <main className="flex min-h-full w-full flex-col bg-white">
      {/* Container — 805:4388 */}
      <div className="flex h-[60px] w-full shrink-0 items-center justify-between px-5">
        <button
          type="button"
          aria-label="닫기"
          onClick={() => router.push(back)}
          className="tap flex"
        >
          <Img src="/assets/write/close.svg" className="size-[21px]" />
        </button>
        <h1 className="text-base leading-[1.6] font-bold tracking-[-0.32px] text-[#17171a]">
          {editing ? "근거 수정" : "근거 달기"}
        </h1>
        <button
          type="button"
          onClick={submit}
          className="rounded-[10px] bg-primary-600 px-4 py-2 text-[13.5px] leading-5 font-bold tracking-[-0.27px] text-white"
        >
          등록
        </button>
      </div>
      <div className="h-px w-full shrink-0 bg-gray-200" />

      {/* 진영 선택 — 805:4317 */}
      <div className="flex w-full shrink-0 flex-col items-start gap-[10px] px-[25px] py-[18px]">
        <div className="flex flex-col gap-[3px] leading-[1.4]">
          <p className="text-base font-bold text-[#5e5e5e]">{debate.topic}</p>
          <p className="text-xs text-[#9a9a9e]">어느 쪽에 근거를 다시나요?</p>
        </div>
        <div className="flex w-full items-start gap-3">
          {debate.options.map((option) => {
            const on = option.side === side;
            return (
              <button
                key={option.side}
                type="button"
                aria-pressed={on}
                onClick={() => setSide(option.side)}
                className={`flex min-w-px flex-1 items-center justify-center rounded-xl py-[14px] text-[13.5px] leading-[1.4] whitespace-pre ${
                  on
                    ? "bg-primary-600 font-bold text-white"
                    : "border-[1.4px] border-gray-200 bg-white font-normal text-[#5e5e5e]"
                }`}
              >
                {label(option.side)}
              </button>
            );
          })}
        </div>
      </div>

      {/* 근거 입력 — 805:4325 */}
      <div className="flex w-full shrink-0 flex-col items-start gap-[10px] px-6 py-[22px]">
        <div className="flex w-full items-center justify-between">
          <h2 className="text-[13px] leading-[1.4] font-bold text-[#1a1c1c]">근거</h2>
          {/* 켜져 있으면(더미가 들어 있으면) 메인 색으로 채워 「직접 입력하기」로 보인다 — 글쓰기와 같다 */}
          {editing ? null : (
            <button
              type="button"
              aria-pressed={dummy}
              onClick={() => putDummy(!dummy)}
              className={`tap [--tap-w:0px] rounded-[8px] border px-[10px] py-[5px] text-[11px] leading-[1.4] font-semibold transition-colors active:opacity-55 ${
                dummy
                  ? "border-primary-500 bg-primary-500 text-white"
                  : "border-dashed border-primary-500 text-primary-600"
              }`}
            >
              {dummy ? "직접 입력하기" : "더미 텍스트 입력"}
            </button>
          )}
        </div>
        <textarea
          ref={field}
          value={ground.value}
          onChange={(e) => ground.type(e.target.value)}
          onFocus={ground.onFocus}
          onBlur={ground.onBlur}
          maxLength={TEXT_MAX}
          placeholder="왜 그렇게 생각하는지 적어주세요"
          className="h-[108px] w-full resize-none rounded-xl border border-gray-200 bg-white p-[14px] text-xs leading-[1.4] text-[#1a1c1c] outline-none placeholder:text-[#9a9a9e] focus:border-primary-600"
        />
        <p className="w-full text-right text-[10.5px] leading-[1.4] text-[#9a9a9e]">
          {ground.value.length} / {TEXT_MAX}
        </p>
      </div>

      {/* 출처 검색 — 805:4331 */}
      <div className="flex w-full shrink-0 flex-col items-start gap-3 px-6 py-[10px]">
        <h2 className="text-[13px] leading-[1.4] font-bold text-[#1a1c1c]">출처 검색</h2>
        <div className="flex w-full items-center gap-[10px] rounded-xl bg-[#f4f3f3] px-4 py-[14px]">
          <Img src="/assets/debate/search-source.svg" className="size-4 shrink-0" />
          <input
            placeholder="지식 · 기사 · 논문에서 출처 검색"
            aria-label="출처 검색"
            className="min-w-px flex-1 text-xs leading-[1.4] text-[#1a1c1c] outline-none placeholder:text-[#9a9a9e]"
          />
        </div>

        <ul className="flex w-full flex-col gap-2">
          {sourceHits.map((hit) => (
            <li
              key={hit.id}
              className="flex w-full items-center gap-3 rounded-[10px] border border-gray-200 bg-white py-[11px] pr-3 pl-[14px]"
            >
              <div className="flex min-w-px flex-1 flex-col gap-[3px] leading-[1.4]">
                <p className="w-full text-xs font-bold text-[#1a1c1c]">{hit.title}</p>
                <p className="w-full text-[10px] text-[#9a9a9e]">{hit.meta}</p>
              </div>
              <button
                type="button"
                onClick={() => setAttached(hit.id)}
                className={`flex shrink-0 items-center justify-center rounded-[14px] px-4 py-[6px] text-[11px] leading-[1.4] font-bold text-[#1a1c1c] ${
                  hit.best ? "bg-[#cbffe3]" : "bg-[#f4f3f3]"
                }`}
              >
                붙이기
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* 첨부됨 — 805:4359 */}
      {source ? (
        <div className="flex w-full shrink-0 flex-col px-6 pt-[14px]">
          <div className="flex w-full items-center gap-3 rounded-[10px] border-[1.4px] border-[#004d2c] bg-white py-[11px] px-[14px]">
            <div className="flex min-w-px flex-1 flex-col gap-[3px] leading-[1.4]">
              <p className="w-full text-[11.5px] font-bold text-[#1a1c1c]">
                첨부됨 · {source.title.replace(" · ", " ")}
              </p>
              <p className="text-[10px] whitespace-nowrap text-[#9a9a9e]">
                {source.meta.split(" · ")[0]}
              </p>
            </div>
            <button
              type="button"
              aria-label="출처 떼기"
              onClick={() => setAttached(null)}
              className="tap flex shrink-0"
            >
              <Img src="/assets/debate/detach.svg" className="size-[14px]" />
            </button>
          </div>
        </div>
      ) : null}

      <div className="flex w-full shrink-0 items-start px-6 pt-[14px]">
        <p className="min-w-px flex-1 text-[10.5px] leading-[1.4] text-[#9a9a9e]">
          출처 없이 등록하면 근거에 “카더라” 표시가 붙어요
        </p>
      </div>

      <div className="flex-1" />

      {/* CTA — 805:4368 */}
      <div className="sticky bottom-0 flex w-full flex-col bg-white px-6 pt-[18px] pb-[14px]">
        <button
          type="button"
          onClick={submit}
          className="flex w-full items-center justify-center rounded-[14px] bg-primary-600 py-[17px] text-sm leading-[1.4] font-bold text-white"
        >
          {editing ? "근거 수정하기" : "근거 등록하기"}
        </button>
      </div>

      {/* 홈 인디케이터 — 805:4370 */}
      <div className="home-bar flex w-full shrink-0 items-start justify-center bg-white pt-[6px] pb-[10px]">
        <div className="h-[5px] w-[140px] rounded-[3px] bg-[#1a1c1c]" />
      </div>

      <KeyboardSpacer open={ground.open} />

      {ground.open ? <IosKeyboard {...ground.keyboardProps} /> : null}
    </main>
  );
}
