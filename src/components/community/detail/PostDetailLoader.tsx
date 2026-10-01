"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import PostDetail from "@/components/community/detail/PostDetail";
import { getPost } from "@/data/common/community";
import { getServerSnapshot, getSnapshot, subscribe } from "@/state/postStore";

/**
 * Finds the post behind a `/community/post/<id>` URL.
 *
 * Seeded posts are known on the server; one written here lives only in
 * localStorage, so the store has to have been read before a missing post can
 * be called missing — `written` is empty on the hydrating render.
 */
export default function PostDetailLoader({ postId }: { postId: string }) {
  const router = useRouter();
  const written = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const seeded = getPost(postId);
  const post = seeded ?? written.find((candidate) => candidate.id === postId);

  // A written post starts with "me-"; anything else the seed did not have is
  // simply not a post, so it can be sent back without waiting for the store.
  const missing = !post && !postId.startsWith("me-");

  useEffect(() => {
    if (missing) router.replace("/community");
  }, [missing, router]);

  if (!post) return <div className="min-h-full w-full bg-white" />;
  return <PostDetail post={post} />;
}
