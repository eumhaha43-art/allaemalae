"use client";

import { useState, useSyncExternalStore } from "react";
import Img from "@/components/common/Img";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import MoreMenu from "@/components/common/MoreMenu";
import { commentAge, type Comment } from "@/data/common/community";
import { removeComment, updateComment } from "@/state/commentStore";
import {
  getReactionsServerSnapshot,
  getReactionsSnapshot,
  subscribeReactions,
  toggleCommentLike,
} from "@/state/reactionStore";

/**
 * 댓글 머리말과 목록 — Figma 856:6201 · 856:6209.
 *
 * 내가 쓴 댓글에만 「⋯」이 붙어 고치고 지울 수 있다. 씨앗 댓글은 이 기기에
 * 없는 남의 글이라 손댈 수 없다 — `mine` 이 그 둘을 갈라 준다.
 *
 * 고치기는 화면을 새로 열지 않고 그 줄에서 바로 한다. 한 줄짜리 글을 고치자고
 * 화면을 옮겼다 돌아오면 어디를 고치던 중이었는지 놓친다.
 *
 * 댓글마다 공감(하트)을 누를 수 있다. 글의 좋아요와 같은 저장소에 두어
 * 새로고침해도 남는다 — 씨앗 댓글의 숫자에 내 것 하나를 더해 보여 준다.
 */
export default function PostComments({
  postId,
  count,
  thread,
  mine,
  onReply,
}: {
  postId: string;
  count: number;
  thread: Comment[];
  /** 이 기기에서 쓴 댓글 id — 이것만 고치고 지울 수 있다. */
  mine: Set<string>;
  onReply: (target: Comment) => void;
}) {
  /** 지금 고치고 있는 댓글과 그 안의 글. 둘은 늘 함께 움직인다. */
  const [editing, setEditing] = useState<{ id: string; text: string } | null>(null);
  const [removing, setRemoving] = useState<Comment | null>(null);
  const reactions = useSyncExternalStore(
    subscribeReactions,
    getReactionsSnapshot,
    getReactionsServerSnapshot,
  );

  const save = () => {
    if (!editing) return;
    const text = editing.text.trim();
    // 빈 댓글로 만드는 것은 지우기와 같은데, 물어보지 않고 지우는 셈이 된다.
    if (text) updateComment(postId, editing.id, text);
    setEditing(null);
  };

  return (
    <>
      <div className="h-2 w-full shrink-0 bg-[#f5f5f5]" />

      <div className="flex w-full items-center justify-between px-6 pt-[18px] pb-[10px]">
        <h2 className="flex items-center gap-[6px] text-[15px] leading-[1.4] font-bold">
          <span className="text-[#1a1c1c]">댓글</span>
          <span className="text-[#2e7d4f]">{count}</span>
        </h2>
        <button type="button" className="tap flex items-center gap-[5px] py-1">
          <span className="text-[11.5px] leading-[1.4] text-[#5e5e5e]">등록순</span>
          <Img src="/assets/post/sort-caret.svg" className="size-3" />
        </button>
      </div>

      <ul className="flex w-full flex-col px-6 pb-[10px]">
        {thread.map((comment) => (
          <li
            key={comment.id}
            /* 답글을 달 때 입력바가 이 댓글을 화면 안으로 끌어올린다(CommentComposer) */
            data-comment-id={comment.id}
            className={`flex w-full items-start gap-[10px] py-3 ${comment.reply ? "pl-8" : ""}`}
          >
            <Img src={comment.avatar} className="size-8 shrink-0 rounded-full object-cover" />
            <div className="flex min-w-px flex-1 flex-col gap-1">
              <div className="flex w-full items-center justify-between">
                <div className="flex items-center gap-[6px] leading-[1.4] whitespace-nowrap">
                  <span className="text-xs font-semibold text-[#1a1c1c]">{comment.author}</span>
                  <span className="text-[10.5px] text-[#9a9a9e]">
                    · {comment.at ? commentAge(comment.at) : comment.when}
                  </span>
                  {comment.edited ? (
                    <span className="text-[10.5px] text-[#bdbdc0]">· 수정됨</span>
                  ) : null}
                </div>
                {mine.has(comment.id) ? (
                  <MoreMenu
                    label="댓글 더보기"
                    items={[
                      {
                        label: "수정하기",
                        onSelect: () => setEditing({ id: comment.id, text: comment.text }),
                      },
                      {
                        label: "삭제하기",
                        danger: true,
                        onSelect: () => setRemoving(comment),
                      },
                    ]}
                  >
                    <span aria-hidden className="px-1 text-xs leading-[17px] text-[#9a9a9e]">
                      ⋯
                    </span>
                  </MoreMenu>
                ) : (
                  /* 남의 댓글에는 뒤에 아무것도 없다 — 자리만 비워 둔다 */
                  <span aria-hidden className="px-1 text-xs leading-[17px] text-transparent">
                    ⋯
                  </span>
                )}
              </div>

              {editing?.id === comment.id ? (
                <div className="flex w-full flex-col gap-2 pt-1">
                  <textarea
                    autoFocus
                    value={editing.text}
                    onChange={(event) => setEditing({ id: comment.id, text: event.target.value })}
                    rows={2}
                    className="w-full resize-none rounded-[10px] border border-gray-200 bg-white p-[10px] text-xs leading-[1.4] text-[#2a2a2a] outline-none focus:border-primary-600"
                  />
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={save}
                      className="tap [--tap:34px] rounded-[8px] bg-primary-600 px-3 py-[6px] text-[11px] leading-[1.4] font-bold text-white"
                    >
                      저장
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditing(null)}
                      className="tap [--tap:34px] rounded-[8px] bg-gray-100 px-3 py-[6px] text-[11px] leading-[1.4] font-medium text-[#5e5e5e]"
                    >
                      취소
                    </button>
                  </div>
                </div>
              ) : (
                <p className="w-full text-xs leading-[1.3] text-[#2a2a2a]">{comment.text}</p>
              )}

              <div className="flex items-center gap-[14px] pt-[2px]">
                {(() => {
                  const liked = reactions.likedComments.includes(comment.id);
                  return (
                    <button
                      type="button"
                      aria-pressed={liked}
                      aria-label={liked ? "공감 취소" : "공감"}
                      onClick={() => toggleCommentLike(comment.id)}
                      className="tap [--tap:34px] flex items-center gap-[5px]"
                    >
                      <Img
                        src={liked ? "/assets/post/like-small-on.svg" : "/assets/post/like-small.svg"}
                        className="size-[13px]"
                      />
                      <span
                        className={`text-[11px] leading-[15px] tracking-[-0.22px] ${
                          liked ? "font-semibold text-[#ff0707]" : "text-[#9a9a9e]"
                        }`}
                      >
                        {comment.likes + (liked ? 1 : 0)}
                      </span>
                    </button>
                  );
                })()}
                <button
                  type="button"
                  onClick={() => onReply(comment)}
                  className="tap [--tap:34px] text-[11px] leading-[1.4] font-medium text-[#5e5e5e]"
                >
                  답글 달기
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <ConfirmDialog
        open={removing !== null}
        title="댓글을 삭제할까요?"
        description={
          removing && !removing.reply
            ? "이 댓글에 달린 내 답글도 함께 지워져요."
            : "삭제한 댓글은 되돌릴 수 없어요."
        }
        confirmLabel="삭제"
        cancelLabel="취소"
        onConfirm={() => {
          if (removing) removeComment(postId, removing.id);
          setRemoving(null);
        }}
        onCancel={() => setRemoving(null)}
      />
    </>
  );
}
