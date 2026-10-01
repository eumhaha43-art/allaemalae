"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Img from "@/components/common/Img";
import IosKeyboard from "@/components/keyboard/IosKeyboard";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import WriteHeader from "@/components/community/write/WriteHeader";
import WritePhotos, { type Photo } from "@/components/community/write/WritePhotos";
import RequirementTag from "@/components/community/write/RequirementTag";
import WriteOptions from "@/components/community/write/WriteOptions";
import {
  categories,
  categoryColors,
  draftQuiz,
  findSources,
  lookupWord,
  LOOKUPS,
  sourceLink,
  writeSample,
  type Post,
  type Quiz,
} from "@/data/common/community";
import {
  addPost,
  getServerSnapshot,
  getSnapshot,
  subscribe,
  updatePost,
} from "@/state/postStore";
import { scheduleReactions } from "@/state/notificationStore";
import { showToast } from "@/state/toastStore";
import {
  clearDraft,
  getDraftServerSnapshot,
  getDraftSnapshot,
  saveDraft,
  subscribeDraft,
  type Draft,
} from "@/state/draftStore";
import {
  KEYBOARD_HEIGHT,
  useOnScreenKeyboard,
  usePhysicalKeys,
  type RunKey,
} from "@/hooks/useIosKeyboard";
import {
  applyBackspace,
  applyJamo,
  applyLiteral,
  type Composition,
} from "@/utils/hangul";

const TITLE_MAX = 40;
const BODY_MAX = 1000;

type Field = "title" | "body" | "source";

const EMPTY: Record<Field, string> = { title: "", body: "", source: "" };

/** The chip the design opens on. */
const DEFAULT_CATEGORY = "생활";

/** 더미가 채우는 글 · 사진 — 「더미 텍스트 입력」이 이것과 빈 칸 사이를 오간다. */
const SAMPLE_VALUES: Record<Field, string> = {
  title: writeSample.title,
  body: writeSample.body,
  source: "",
};
const SAMPLE_PHOTO: Photo = { id: "sample", url: writeSample.photo, thumb: writeSample.photo };

/** Breathing room between the field being typed into and the keyboard. */
const FIELD_MARGIN = 16;

const limitFor = (field: Field) =>
  field === "title" ? TITLE_MAX : field === "body" ? BODY_MAX : Infinity;

/**
 * Write a post — Figma node 564:5704.
 *
 * Doubles as the edit screen: `?edit=<post id>` loads one of your own posts
 * back into the form and saves over it instead of adding a new one.
 *
 * Both stores live in localStorage, so the server — and the first hydrating
 * render — see nothing. Remounting the fields on the key below seeds them from
 * the post once it does arrive, which beats writing state from an effect.
 */
/**
 * 카테고리 칸에 늘어놓는 갈래 — 「전체」는 고를 것이 아니라 거르는 말이라 뺀다.
 *
 * 「생활」이 맨 앞이다. 시연에서 「더미 텍스트 입력」이 채워 넣는 글이
 * 생활이라, 목록 한가운데에 켜져 있으면 무엇이 골라졌는지 한눈에 안 들어온다.
 */
const writeCategories = ["생활", ...categories.filter((name) => name !== "전체" && name !== "생활")];

export default function WriteForm() {
  const editId = useSearchParams().get("edit");
  const written = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const draft = useSyncExternalStore(subscribeDraft, getDraftSnapshot, getDraftServerSnapshot);

  const editPost = editId ? written.find((post) => post.id === editId) : undefined;

  return (
    <WriteFormFields
      key={editPost ? `edit:${editPost.id}` : (editId ?? "new")}
      editId={editId}
      editPost={editPost}
      // An edit already has a saved copy; never offer it the 임시저장 too.
      draft={editId ? null : draft}
    />
  );
}

function WriteFormFields({
  editId,
  editPost,
  draft,
}: {
  editId: string | null;
  editPost?: Post;
  draft: Draft | null;
}) {
  const router = useRouter();

  /**
   * 더미가 들어 있는지. 새 글은 더미(writeSample)가 들어찬 채로 열린다 — 분류 ·
   * 제목 · 본문 · 사진 · 퀴즈까지. 고치기는 그 글이 들어 있으니 더미가 없다.
   */
  const [dummy, setDummy] = useState(!editPost);
  const [category, setCategory] = useState<string>(editPost?.category ?? writeSample.category);
  const [active, setActive] = useState<Field | null>(null);

  // A post carries one thumbnail, so editing gets that one back as its photo.
  const [photos, setPhotos] = useState<Photo[]>(
    editPost
      ? editPost.image
        ? [{ id: "saved", url: editPost.image, thumb: editPost.image }]
        : []
      : [SAMPLE_PHOTO],
  );

  /** 임시저장 prompt raised by the X button. */
  const [leaving, setLeaving] = useState(false);

  /**
   * The jamo composer needs to read the latest text synchronously, and its
   * state updates must stay out of the `setState` updater — React invokes that
   * twice in development, which would compose every keystroke twice.
   */
  const seed: Record<Field, string> = editPost
    ? { title: editPost.title, body: editPost.excerpt, source: editPost.source ?? "" }
    : SAMPLE_VALUES;
  const valuesRef = useRef<Record<Field, string>>(seed);
  const [values, setValuesState] = useState<Record<Field, string>>(seed);

  const commit = useCallback((next: Record<Field, string>) => {
    valuesRef.current = next;
    setValuesState(next);
  }, []);

  /**
   * O/X 퀴즈 — 켜면 제목으로 초안을 만들고, 등록할 때 글에 붙는다.
   *
   * 고치기 전까지는 초안이 제목을 따라다니게 `null` 로 둔다. 처음 한 번만
   * 만들어 두면, 제목을 고쳐도 문제는 옛 제목 그대로 남는다.
   *
   * 고치러 들어온 글은 그때 붙였던 문제를 도로 담고, 안 붙였으면 꺼 둔다.
   */
  const [autoQuiz, setAutoQuiz] = useState(editPost ? Boolean(editPost.quiz) : true);
  const [quizEdit, setQuizEdit] = useState<Quiz | null>(
    editPost ? (editPost.quiz ?? null) : writeSample.quiz,
  );

  /**
   * 더미 단추 — 더미를 넣거나(켬) 죄다 비운다(끔).
   *
   * 화면은 더미가 들어찬 채로 열리고 그 글은 그대로 고쳐 써도 된다. 「직접
   * 입력하기」를 누르면 분류 · 제목 · 본문 · 사진 · 퀴즈를 빈 화면으로 돌려
   * 처음부터 손으로 쓰는 흐름을 보여 줄 수 있고, 「더미 텍스트 입력」을 다시
   * 누르면 더미가 돌아온다 — 글자는 늘 누르면 일어날 일을 적는다.
   */
  const putDummy = (next: boolean) => {
    setDummy(next);
    setCategory(next ? writeSample.category : DEFAULT_CATEGORY);
    commit(next ? SAMPLE_VALUES : EMPTY);
    setPhotos(next ? [SAMPLE_PHOTO] : []);
    setAutoQuiz(true);
    setQuizEdit(next ? writeSample.quiz : null);
  };

  /** Jamo still being assembled by the on-screen keyboard. */
  const composition = useRef<Composition>(null);
  const titleRef = useRef<HTMLTextAreaElement>(null);
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const sourceRef = useRef<HTMLInputElement>(null);

  const showKeyboard = useOnScreenKeyboard(active !== null);

  /*
    제목 · 본문 칸은 글이 길어지는 만큼 아래로 자란다. 한 줄(제목) · 세 줄(본문)
    로 잡아 두고 안에서 스크롤하게 두면 긴 글을 쓰는 동안 앞부분이 안 보인다.
    높이를 한 번 풀었다가 내용 높이로 다시 잡는다 — 풀지 않으면 줄어들 때 안
    줄어든다.

    제목도 textarea 다 — input 은 한 줄이라 길어지면 앞이 잘려 나간다. 대신
    줄바꿈은 막는다(Enter · 붙여넣기의 개행) — 제목은 한 덩어리다.
  */
  useEffect(() => {
    const box = titleRef.current;
    if (!box) return;
    box.style.height = "auto";
    box.style.height = `${box.scrollHeight}px`;
  }, [values.title]);
  useEffect(() => {
    const box = bodyRef.current;
    if (!box) return;
    box.style.height = "auto";
    box.style.height = `${box.scrollHeight}px`;
  }, [values.body]);

  const fieldElement = useCallback((field: Field) => {
    if (field === "title") return titleRef.current;
    if (field === "body") return bodyRef.current;
    return sourceRef.current;
  }, []);

  /** Typing on a real keyboard bypasses our composer, so drop its state. */
  const handleNativeChange = (field: Field, value: string) => {
    composition.current = null;
    commit({ ...valuesRef.current, [field]: value.slice(0, limitFor(field)) });
  };

  const runKey = useCallback<RunKey>(
    (transform) => {
      if (!active) return;
      const next = transform(valuesRef.current[active], composition.current);
      if (next.value.length <= limitFor(active)) {
        composition.current = next.comp;
        commit({ ...valuesRef.current, [active]: next.value });
      }
      // Keep the caret in the field the keys are going into.
      fieldElement(active)?.focus();
    },
    [active, commit, fieldElement],
  );

  const pressed = usePhysicalKeys(showKeyboard && active !== null, runKey);

  // Keep the field being typed into above the keyboard. `scrollIntoView` is no
  // help here — it centres in the scroll area, which the keyboard overlaps.
  useEffect(() => {
    if (!active) return;
    const element = fieldElement(active);
    const scroller = element?.closest<HTMLElement>("[data-scroll-area]");
    if (!element || !scroller) return;

    const id = requestAnimationFrame(() => {
      const floor = showKeyboard
        ? window.innerHeight - KEYBOARD_HEIGHT
        : scroller.getBoundingClientRect().bottom;
      const hidden = element.getBoundingClientRect().bottom + FIELD_MARGIN - floor;
      if (hidden > 0) scroller.scrollBy({ top: hidden, behavior: "smooth" });
    });
    return () => cancelAnimationFrame(id);
  }, [active, showKeyboard, fieldElement]);

  /**
   * First required field still empty, in the order they appear on screen.
   *
   * 출처는 빠져 있다 — 선택이다. 안 적어도 등록되고, 대신 글에 「카더라」가
   * 붙는다. 막아 세우는 대신 표시를 붙이는 쪽이 이 서비스의 규칙이다
   * (채팅방 · 토론방도 같은 규칙을 쓴다).
   */
  const missingField = (["title", "body"] as Field[]).find(
    (field) => values[field].trim().length === 0,
  );

  /**
   * Nothing written — leaving has nothing to save.
   *
   * 더미가 들어온 그대로인 것도 안 쓴 것이다. 그것까지 임시저장으로 남기면 다음에
   * 열 때 「이어서 쓰시겠습니까?」가 더미를 두고 묻게 된다.
   */
  const untouched =
    (["title", "body", "source"] as Field[]).every((field) => values[field].trim().length === 0) ||
    (["title", "body", "source"] as Field[]).every((field) => values[field] === SAMPLE_VALUES[field]);

  /**
   * 붙일 만한 출처.
   *
   * 출처 칸에 친 글자로 찾고, 아직 안 쳤으면 제목 · 본문을 실마리로 알아서
   * 찾아 둔다 — 무엇을 쳐야 할지 모르는 채로 빈 칸을 보고 있는 일이 없게.
   *
   * 붙이고 나서도 목록은 남긴다 — 붙인 줄은 「붙임」으로 표시하고 나머지는
   * 그대로 「붙이기」다. 예전에는 붙이면 목록을 접었는데, 다른 것으로 바꾸려면
   * 칸을 지워야 해서 한 번 고르면 끝인 것처럼 보였다.
   *
   * 붙인 뒤에는 칸의 글자가 자료 제목 그대로라, 그 글자로 찾으면 그것 하나만
   * 나온다. 그래서 붙인 상태에서는 글(제목 · 본문)로 다시 찾고, 붙인 것이 거기
   * 없으면 맨 앞에 끼워 둔다.
   */
  const clue = { title: values.title, body: values.body };
  const typedHits = findSources(values.source, clue);
  const attachedHit = typedHits.find((hit) => hit.title === values.source.trim());
  const attached = attachedHit !== undefined;
  const hits = attachedHit
    ? [attachedHit, ...findSources("", clue).filter((hit) => hit.id !== attachedHit.id)].slice(0, 3)
    : typedHits;
  /** 「직접 찾아보기」에 넣을 낱말 — 없으면 그 줄 자체를 안 그린다. */
  const word = lookupWord(values.source, { title: values.title, body: values.body });
  const quiz = quizEdit ?? draftQuiz(values.title, values.body);

  /*
    커뮤니티로 돌아갈 때는 push 가 아니라 replace — 글쓰기 장을 커뮤니티로 갈아치운다.
    push 로 쌓으면 기록이 「커뮤니티 → 글쓰기 → 커뮤니티」가 되어, 올린 글을 보고
    뒤로가기를 누르면 글쓰기로 되돌아갔다(사용자 지적). 등록 · X · 임시저장 셋 다.
  */
  /**
   * X — ask before throwing the writing away. An edit has a saved copy already
   * and a blank form has nothing to lose, so both leave straight away.
   */
  const close = () => {
    if (editId || untouched) {
      router.replace("/community");
      return;
    }
    setLeaving(true);
  };

  const leave = (keep: boolean) => {
    if (keep) {
      saveDraft({ category, title: values.title, body: values.body, source: values.source });
    } else {
      clearDraft();
    }
    setLeaving(false);
    router.replace("/community");
  };

  return (
    /*
      shrink-0 — 스크롤 상자가 세로 flex 라 이 폼이 상자 높이(812)로 눌리고 내용만
      밖으로 넘쳤다. 헤더의 sticky 는 폼 상자 안에서만 붙어 있으므로, 폼이 내용보다
      짧으면 그 아래로 내려가는 순간 헤더가 같이 밀려 올라갔다.
    */
    <form
      className="flex min-h-full shrink-0 flex-col bg-white"
      onSubmit={(e) => {
        e.preventDefault();
        if (missingField) {
          fieldElement(missingField)?.focus();
          setActive(missingField);
          return;
        }
        const written = {
          category,
          title: values.title.trim(),
          excerpt: values.body.trim(),
          source: values.source.trim(),
          // The feed shows a single thumbnail — Figma 564:5387.
          image: photos[0]?.thumb,
          /*
            빈 문제는 붙이지 않는다 — 껍데기만 뜬 초록 상자에 답만 두 개
            놓이면 무엇을 묻는지 알 수 없다. 껐다가 다시 켜 수정할 수도
            있으므로, 고치기에서는 지워진 것으로 덮어써야 한다.
          */
          quiz: autoQuiz && quiz.question.trim() ? quiz : undefined,
        };
        if (editId) {
          updatePost(editId, written);
          showToast("수정되었습니다");
        } else {
          const created = addPost({ ...written, author: "나", likes: 0, comments: 0, saves: 0 });
          showToast("등록되었습니다");
          // 시연 — 1분 뒤부터 씨앗 인물들이 좋아요 · 댓글 · 북마크로 반응한다
          scheduleReactions(created);
        }
        clearDraft();
        router.replace("/community");
      }}
    >
      <WriteHeader
        title={editId ? "글 수정" : "글쓰기"}
        submitLabel={editId ? "수정" : "등록"}
        onClose={close}
      />

      <div
        className={`flex flex-1 flex-col gap-[10px] bg-[#f2f2f2] pt-3 ${
          // 자판이 없을 때는 떠 있는 알래봇(50 + 아래 24) 만큼 비운다 — 끝까지
          // 내렸을 때 마지막 카드의 오른쪽(퀴즈 스위치)을 덮지 않게
          showKeyboard ? "pb-[299px]" : "pb-[84px]"
        }`}
      >
        {/*
          카테고리 — Figma 856:5497. 칩 색은 고른 카테고리 색을 따른다.

          프레임은 고른 것 하나와 > 만 두고 누르면 목록이 열리는 꼴이었다. 다섯
          뿐이라 펼쳐 놓아도 한 줄이고, 펼쳐 두면 무엇이 있는지 보고 고를 수
          있다. 다섯 칸을 같은 폭으로 나눈다 — 글자 수대로 두면 줄이 들쭉날쭉하다.
        */}
        <Card className="flex flex-col gap-[10px] px-[18px] py-3">
          <div className="flex items-center gap-[6px]">
            <span className="text-sm leading-[1.4] font-medium text-[#6a6a6e]">카테고리</span>
            <RequirementTag kind="필수" />
          </div>
          <div role="radiogroup" aria-label="카테고리 선택" className="grid w-full grid-cols-5 gap-[6px]">
            {writeCategories.map((name) => {
              const on = name === category;
              const color = categoryColors[name];
              return (
                <button
                  key={name}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  onClick={() => setCategory(name)}
                  style={on ? { backgroundColor: color, borderColor: color } : undefined}
                  className={`tap [--tap-w:0px] flex h-[34px] items-center justify-center rounded-[17px] border text-xs whitespace-nowrap transition-colors ${
                    on
                      ? "font-semibold tracking-[-0.24px] text-white"
                      : "border-gray-200 bg-white font-medium text-gray-500"
                  }`}
                >
                  {name}
                </button>
              );
            })}
          </div>
        </Card>

        {/* 제목 · 본문 — Figma 856:5506. 둘 다 없으면 등록이 안 되므로 「필수」를 단다. */}
        <Card className="px-[18px] pt-[14px] pb-3">
          <div className="mb-2 flex items-center gap-[6px]">
            <h2 className="text-sm leading-[1.4] font-bold tracking-[-0.28px] text-[#17171a]">
              제목 · 본문
            </h2>
            <RequirementTag kind="필수" />
            <div className="flex-1" />
            {/*
              시연용 — 고치기에서는 그 글이 이미 들어 있어 뜨지 않는다. 켜져 있으면
              (더미가 들어 있으면) 메인 색으로 채워 「직접 입력하기」로 보인다.
            */}
            {editPost ? null : (
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
            ref={titleRef}
            value={values.title}
            onChange={(e) => handleNativeChange("title", e.target.value.replace(/\n/g, " "))}
            onKeyDown={(e) => {
              // 제목에는 줄바꿈이 없다 — Enter 는 본문으로 넘어간다
              if (e.key === "Enter") {
                e.preventDefault();
                bodyRef.current?.focus();
              }
            }}
            onFocus={() => {
              composition.current = null;
              setActive("title");
            }}
            onBlur={() => setActive((f) => (f === "title" ? null : f))}
            maxLength={TITLE_MAX}
            rows={1}
            placeholder="제목을 입력하세요"
            className="w-full resize-none overflow-hidden text-[20px] leading-[1.4] font-bold text-[#17171a] outline-none placeholder:text-[#bdbdc0]"
          />
          <Counter value={values.title.length} max={TITLE_MAX} />

          <div className="my-[10px] h-px w-full bg-[#f0f0f0]" />

          <textarea
            ref={bodyRef}
            value={values.body}
            onChange={(e) => handleNativeChange("body", e.target.value)}
            onFocus={() => {
              composition.current = null;
              setActive("body");
            }}
            onBlur={() => setActive((f) => (f === "body" ? null : f))}
            maxLength={BODY_MAX}
            rows={3}
            placeholder="알고 있는 지식을 자유롭게 적어보세요"
            className="w-full resize-none overflow-hidden text-sm leading-[1.4] text-[#333336] outline-none placeholder:text-[#bdbdc0]"
          />
          <Counter value={values.body.length} max={BODY_MAX} />
        </Card>

        <WritePhotos photos={photos} onChange={setPhotos} />

        {/* 출처 — Figma 856:5538 */}
        <Card className="px-[18px] py-[14px]">
          <div className="flex items-center gap-[6px]">
            <h2 className="text-sm leading-[1.4] font-bold tracking-[-0.28px] text-[#17171a]">
              출처
            </h2>
            <RequirementTag kind="선택" />
          </div>

          <input
            ref={sourceRef}
            value={values.source}
            onChange={(e) => handleNativeChange("source", e.target.value)}
            onFocus={() => {
              composition.current = null;
              setActive("source");
            }}
            onBlur={() => setActive((f) => (f === "source" ? null : f))}
            placeholder="지식 · 기사 · 논문에서 출처 검색"
            className={`mt-[10px] w-full rounded-[10px] bg-[#f7f7f7] px-[14px] py-[13px] text-[13.5px] leading-[1.4] text-[#333336] outline-none placeholder:text-[#bdbdc0] ${
              active === "source"
                ? "border-[1.4px] border-[#17171a]"
                : "border-[1.4px] border-[#e5e5e5]"
            }`}
          />

          {/*
            서랍에서 찾은 자료 — 토론방 「근거 달기」(805:4331)와 같은 줄이다.

            줄마다 「열기」가 먼저 온다. 내용을 보지도 않고 붙이면 확인한 척이
            되는데, 정작 확인은 읽는 쪽이 아니라 쓰는 쪽이 할 일이다.

            누를 때 onMouseDown 을 막는 것은, 칸에서 초점이 빠지면 자판이
            닫히면서 화면이 위로 밀려 손가락 밑의 줄이 바뀌기 때문이다.
          */}
          {!hits.length ? null : (
            <ul className="mt-[10px] flex w-full flex-col gap-2">
              {hits.map((hit) => {
                const on = hit.id === attachedHit?.id;
                return (
                <li
                  key={hit.id}
                  className={`flex w-full items-center gap-2 rounded-[10px] border bg-white py-[11px] pr-3 pl-[14px] ${
                    on ? "border-primary-600" : "border-gray-200"
                  }`}
                >
                  <div className="flex min-w-px flex-1 flex-col gap-[3px] leading-[1.4]">
                    <p className="w-full text-xs font-bold text-[#1a1c1c]">{hit.title}</p>
                    <p className="w-full text-[10px] text-[#9a9a9e]">{hit.meta}</p>
                  </div>
                  <a
                    href={sourceLink(hit.title)}
                    target="_blank"
                    rel="noopener noreferrer"
                    onMouseDown={(event) => event.preventDefault()}
                    className="tap [--tap-w:0px] flex shrink-0 items-center justify-center rounded-[14px] border border-gray-200 px-3 py-[6px] text-[11px] leading-[1.4] font-bold text-[#5e5e5e]"
                  >
                    열기
                  </a>
                  {/* 붙인 줄은 한 번 더 누르면 뗀다 — 칸을 지우는 것과 같다 */}
                  <button
                    type="button"
                    aria-pressed={on}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => handleNativeChange("source", on ? "" : hit.title)}
                    className={`tap [--tap-w:0px] flex shrink-0 items-center justify-center rounded-[14px] px-3 py-[6px] text-[11px] leading-[1.4] font-bold ${
                      on ? "bg-primary-600 text-white" : "bg-[#f4f3f3] text-[#1a1c1c]"
                    }`}
                  >
                    {on ? "붙임" : "붙이기"}
                  </button>
                </li>
                );
              })}
            </ul>
          )}

          {/*
            직접 찾아보기 — 서랍에 없는 주제를 여기서 찾는다.

            붙이는 길을 두지 않는다. 이것은 자료가 아니라 자료를 찾아볼 곳이라,
            눌러서 열고 읽은 다음 무엇이었는지는 위 칸에 손으로 적어야 한다.
            예전에는 이 셋을 찾은 자료처럼 세워 붙일 수 있게 했더니 「위키백과 ·
            「미란다」」가 글에 출처로 박혔다 — 아무것도 확인하지 않았는데
            확인한 꼴이 된다.
          */}
          {attached || !word ? null : (
            <div className="mt-[10px] flex w-full flex-col gap-[6px]">
              <p className="text-[10.5px] leading-[1.4] text-[#9a9a9e]">
                「{word}」 직접 찾아보고 적기
              </p>
              <div className="flex w-full flex-wrap items-center gap-[6px]">
                {LOOKUPS.map((place) => (
                  <a
                    key={place.id}
                    href={place.search(word)}
                    target="_blank"
                    rel="noopener noreferrer"
                    onMouseDown={(event) => event.preventDefault()}
                    className="tap [--tap-w:0px] flex items-center gap-[4px] rounded-[14px] border border-gray-200 bg-white px-3 py-[6px] text-[11px] leading-[1.4] font-medium text-[#5e5e5e]"
                  >
                    {place.name}
                    <span aria-hidden className="text-[9px] text-[#bdbdc0]">
                      ↗
                    </span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* 안 적었을 때만 알린다 — 적고 나서도 떠 있으면 겁주는 말이 된다 */}
          {values.source.trim() ? null : (
            <div className="mt-[10px] flex items-center gap-[6px]">
              <Img src="/assets/write/flag.svg" className="size-[13px]" />
              <span className="text-[11.5px] leading-[1.4] tracking-[-0.23px] text-[#bdbdc0]">
                출처를 안 적으면 글에 ‘카더라’ 표시가 붙어요
              </span>
            </div>
          )}
        </Card>

        <WriteOptions
          autoQuiz={autoQuiz}
          onAutoQuiz={setAutoQuiz}
          quiz={quiz}
          onQuiz={setQuizEdit}
        />
      </div>

      <ConfirmDialog
        open={leaving}
        title="임시저장 할까요?"
        description={"저장해 두면 다음에 글쓰기를 열 때\n이어서 쓸 수 있어요."}
        confirmLabel="예"
        cancelLabel="아니요"
        onConfirm={() => leave(true)}
        onCancel={() => leave(false)}
      />

      {/* Clearing the draft is what closes this — both answers consume it. */}
      <ConfirmDialog
        open={draft !== null}
        title="임시저장된 글쓰기가 있습니다."
        description="이어서 쓰시겠습니까?"
        confirmLabel="예"
        cancelLabel="아니요"
        onConfirm={() => {
          if (draft) {
            // 더미(사진 · 퀴즈까지)를 걷어 내고 그 자리에 임시저장을 앉힌다
            putDummy(false);
            setCategory(draft.category || DEFAULT_CATEGORY);
            commit({ title: draft.title, body: draft.body, source: draft.source });
          }
          clearDraft();
        }}
        onCancel={clearDraft}
      />

      {showKeyboard ? (
        <IosKeyboard
          onJamo={(jamo) => runKey((value, comp) => applyJamo(value, comp, jamo))}
          onSpace={() => runKey((value, comp) => applyLiteral(value, comp, " "))}
          onEnter={() => {
            // 제목에서의 Enter 는 줄바꿈이 아니라 본문으로 넘어가기다
            if (active === "title") {
              bodyRef.current?.focus();
              return;
            }
            runKey((value, comp) => applyLiteral(value, comp, "\n"));
          }}
          onBackspace={() => runKey(applyBackspace)}
          pressed={pressed}
        />
      ) : null}
    </form>
  );
}

function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className="w-full px-5">
      <div className={`flex flex-col rounded-xl border border-[#e5e5e5] bg-white ${className}`}>
        {children}
      </div>
    </div>
  );
}

function Counter({ value, max }: { value: number; max: number }) {
  return (
    <p className="mt-[6px] w-full text-right text-[11px] leading-[1.4] tracking-[-0.22px] text-[#bdbdc0]">
      {value} / {max.toLocaleString()}
    </p>
  );
}
