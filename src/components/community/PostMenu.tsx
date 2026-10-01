"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Img from "@/components/common/Img";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import MoreMenu from "@/components/common/MoreMenu";
import { removePost } from "@/state/postStore";

/**
 * The "..." on a post. Only your own posts get one — it opens 수정하기 /
 * 삭제하기. There is nothing behind it on someone else's post, so that row
 * stays empty instead of showing a dead icon.
 */
export default function PostMenu({
  postId,
  onDeleted,
}: {
  postId?: string;
  /**
   * 지운 뒤에 할 일 — 목록에서는 그 자리에서 사라지면 그만이지만, 상세에서는
   * 보고 있던 글이 없어지므로 그 화면을 떠나야 한다.
   */
  onDeleted?: () => void;
}) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);

  if (!postId) return null;

  return (
    <>
      <MoreMenu
        items={[
          {
            label: "수정하기",
            onSelect: () => router.push(`/community/write?edit=${postId}`),
          },
          { label: "삭제하기", danger: true, onSelect: () => setConfirming(true) },
        ]}
      >
        <Img src="/assets/community/more-dark.svg" className="size-[15px]" />
      </MoreMenu>

      <ConfirmDialog
        open={confirming}
        title="글을 삭제할까요?"
        description={"삭제한 글은 되돌릴 수 없어요."}
        confirmLabel="삭제"
        cancelLabel="취소"
        onConfirm={() => {
          setConfirming(false);
          removePost(postId);
          onDeleted?.();
        }}
        onCancel={() => setConfirming(false)}
      />
    </>
  );
}
