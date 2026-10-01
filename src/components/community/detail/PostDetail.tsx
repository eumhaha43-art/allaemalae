"use client";

import { useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import Img from "@/components/common/Img";
import AppHeader, { HeaderBell, HeaderSearch } from "@/components/common/AppHeader";
import PostMenu from "@/components/community/PostMenu";
import PostQuiz from "@/components/community/detail/PostQuiz";
import PostComments from "@/components/community/detail/PostComments";
import CommentComposer, {
  type ReplyTarget,
} from "@/components/community/detail/CommentComposer";
import { buildThread, parentOf, sourceHref, type Post } from "@/data/common/community";
import { MY_AVATAR } from "@/data/common/personas";
import {
  commentsFor,
  getCommentsServerSnapshot,
  getCommentsSnapshot,
  subscribeComments,
} from "@/state/commentStore";
import {
  getReactionsServerSnapshot,
  getReactionsSnapshot,
  subscribeReactions,
  toggleLike,
  toggleSave,
} from "@/state/reactionStore";
import {
  arrivalsFor,
  getArrivals,
  getArrivalsServerSnapshot,
  subscribeNotifications,
} from "@/state/notificationStore";
import { showToast } from "@/state/toastStore";

/**
 * 게시글 상세 — Figma node 856:6105.
 *
 * The seeded posts carry a body, source, tags, quiz and thread; one written in
 * 글쓰기 has only its excerpt, so those sections simply do not render.
 */
export default function PostDetail({ post }: { post: Post }) {
  const router = useRouter();
  const body = post.body ?? [post.excerpt];

  /*
    내가 쓴 글에만 「⋯」이 붙는다. 이 기기에서 쓴 글은 id 가 「me-」로
    시작한다 — 목록 카드가 「몇 번째까지가 내 것」으로 세는 것과 달리, 상세는
    글 한 장만 들고 있어서 자리로는 알 수 없다.
  */
  const myPost = post.id.startsWith("me-");

  // Liking and 담기 live in the store, so 게시글 홈 shows the same state.
  const reactions = useSyncExternalStore(
    subscribeReactions,
    getReactionsSnapshot,
    getReactionsServerSnapshot,
  );
  const liked = reactions.liked.includes(post.id);
  const saved = reactions.saved.includes(post.id);

  // Comments left here follow the seeded thread and lift the count with them.
  const written = useSyncExternalStore(
    subscribeComments,
    getCommentsSnapshot,
    getCommentsServerSnapshot,
  );
  const mine = commentsFor(written, post.id);
  // 남이 내 댓글에 단 답글 — 내 것과 같은 규칙으로 부모 밑에 끼우되, 고칠 수는 없다
  const arrived = arrivalsFor(
    useSyncExternalStore(subscribeNotifications, getArrivals, getArrivalsServerSnapshot),
    post.id,
  );
  const thread = buildThread(post.thread ?? [], [...mine, ...arrived]);
  const commentCount = post.comments + mine.length + arrived.length;
  const [replyTo, setReplyTo] = useState<ReplyTarget | null>(null);

  return (
    <main className="flex min-h-full w-full flex-col bg-white">
      {/*
        헤더 — 941:2525. 커뮤니티의 다른 화면과 같은 공용 헤더를 쓴다.
        예전에는 여기에 하트·장바구니가 있었는데, 그 두 동작은 바로 아래
        반응 바에 그대로 있다.
      */}
      {/*
        머리에 「⋯」을 단다. 예전에는 목록 카드에만 있어서, 내 글을 열어 놓고도
        고치려면 목록으로 되돌아가야 했다.
      */}
      <AppHeader divider>
        <HeaderBell />
        <HeaderSearch />
        <PostMenu
          postId={myPost ? post.id : undefined}
          onDeleted={() => router.replace("/community")}
        />
      </AppHeader>

      {/* 글 헤더 — 787:3410 */}
      <div className="flex w-full flex-col items-start gap-[10px] px-6 pt-5 pb-4">
        <div className="flex items-center gap-[6px]">
          <span className="rounded-[6px] bg-blue-600 px-[10px] py-[5px] text-xs leading-[1.3] font-semibold text-blue-100">
            {post.category}
          </span>
          {/* 카더라 — 출처 없이 올라온 글. 글을 읽기 전에 먼저 눈에 들어와야 한다. */}
          {post.source ? null : (
            <span className="rounded-[6px] bg-primary-600 px-[10px] py-[5px] text-xs leading-[1.3] font-semibold text-white">
              카더라
            </span>
          )}
        </div>
        <h1 className="w-full text-xl leading-[1.3] font-semibold text-[#1a1c1c]">{post.title}</h1>

        <div className="flex w-full items-center gap-[10px] pt-[6px]">
          <Img
            src={post.authorAvatar ?? MY_AVATAR}
            className="size-10 shrink-0 rounded-full bg-gray-200 object-cover"
          />
          <div className="flex flex-col items-start gap-[3px]">
            <div className="flex items-center gap-[6px]">
              <span className="text-xs leading-[1.3] font-medium text-[#1a1c1c]">
                {post.author}
              </span>
              {post.authorLevel ? (
                <span className="rounded-[6px] bg-primary-100 px-[10px] py-[5px] text-[10px] leading-[1.4] font-bold text-primary-800">
                  {post.authorLevel}
                </span>
              ) : null}
            </div>
            <p className="text-[11px] leading-[1.4] text-[#9a9a9e]">
              {post.when}
              {post.views !== undefined ? ` · 조회 ${post.views.toLocaleString()}` : null}
            </p>
          </div>
        </div>
      </div>

      {post.image ? (
        <div className="w-full px-6">
          <Img src={post.image} className="h-[217px] w-full rounded-[10px] object-cover" />
        </div>
      ) : null}

      {/* 본문 — 787:3427 */}
      <div className="flex w-full flex-col gap-[10px] px-6 py-5">
        {body.map((paragraph) => (
          <p key={paragraph} className="w-full text-base leading-[1.6] font-medium text-[#2a2a2a]">
            {paragraph}
          </p>
        ))}
      </div>

      {/* 출처 — 856:6152. 눌러서 확인하러 갈 수 있다. */}
      <div className="w-full px-6">
        {post.source ? (
          /*
            눌러서 확인하러 갈 수 있다. 글쓰기에서 고른 줄은 갈 곳을 알고
            있고, 손으로 친 출처는 적힌 글 그대로 웹을 뒤진다 — 어느 쪽이든
            「이 출처가 이 말과 맞나」를 볼 수 있으면 된다.

            앱 밖으로 나가므로 새 탭에서 연다. 읽던 글이 사라지면 확인하고
            돌아올 자리를 잃는다.
          */
          <a
            href={sourceHref(post)}
            target="_blank"
            rel="noopener noreferrer"
            className="tap [--tap-w:0px] flex w-full items-center gap-[10px] rounded-[10px] bg-gray-100 px-5 py-[14px] transition-opacity active:opacity-55"
          >
            <Img src="/assets/post/source.svg" className="size-[18px] shrink-0" />
            <p className="min-w-px flex-1 text-xs leading-[1.3] text-primary-black">{post.source}</p>
            <Img src="/assets/post/source-go.svg" className="h-4 w-3 shrink-0" />
          </a>
        ) : (
          /*
            출처 자리를 비워 두지 않는다. 있던 자리가 그냥 사라지면 「출처를
            안 적었다」가 아니라 「이 화면에는 원래 출처가 없다」로 읽힌다.
          */
          <div className="flex w-full items-center gap-[10px] rounded-[10px] bg-gray-100 px-5 py-[14px]">
            <Img src="/assets/write/flag.svg" className="size-[18px] shrink-0" />
            <p className="min-w-px flex-1 text-xs leading-[1.3] text-text-sub">
              출처가 없는 글이에요 — 그대로 믿기 전에 한 번 더 확인해 주세요
            </p>
          </div>
        )}
      </div>

      {post.tags?.length ? (
        <div className="flex w-full items-start gap-2 px-6 pt-4">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-[14px] bg-gray-100 px-[10px] py-1 text-xs leading-[1.3] text-[#5e5e5e]"
            >
              #{tag}
            </span>
          ))}
        </div>
      ) : null}

      {post.quiz ? <PostQuiz quiz={post.quiz} /> : null}

      {/* 반응 바 — 856:6183. Its 좋아요 and 저장 are the same toggles as the header. */}
      <div className="flex w-full items-center justify-between px-6 py-[18px]">
        <Reaction
          icon={liked ? "/assets/post/like.svg" : "/assets/post/like-off.svg"}
          label={`좋아요 ${post.likes + (liked ? 1 : 0)}`}
          pressed={liked}
          onClick={() => toggleLike(post.id)}
        />
        <Reaction icon="/assets/post/comment.svg" label={`댓글 ${commentCount}`} />
        <Reaction
          icon={saved ? "/assets/post/save-on.svg" : "/assets/post/save.svg"}
          label={`저장 ${post.saves + (saved ? 1 : 0)}`}
          pressed={saved}
          onClick={() => {
            if (!saved) showToast("나의 활동에 저장되었습니다");
            toggleSave(post.id);
          }}
        />
        <Reaction icon="/assets/post/share.svg" label="공유" />
      </div>

      <PostComments
        postId={post.id}
        count={commentCount}
        thread={thread}
        /* 이 기기에서 쓴 것만 고치고 지울 수 있다 — 씨앗 댓글은 남의 글이다 */
        mine={new Set(mine.map((comment) => comment.id))}
        onReply={(target) =>
          setReplyTo({
            parentId: parentOf(thread, target.id),
            author: target.author,
            commentId: target.id,
          })
        }
      />

      <div className="flex-1" />
      <CommentComposer
        postId={post.id}
        replyTo={replyTo}
        onCancelReply={() => setReplyTo(null)}
      />
    </main>
  );
}

function Reaction({
  icon,
  label,
  pressed,
  onClick,
}: {
  icon: string;
  label: string;
  pressed?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className="tap [--tap-w:0px] flex items-center gap-[6px] py-1"
    >
      <Img src={icon} className="size-[18px]" />
      <span className="text-xs leading-[1.4] font-medium text-[#5e5e5e]">{label}</span>
    </button>
  );
}
