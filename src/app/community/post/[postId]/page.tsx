import PostDetailLoader from "@/components/community/detail/PostDetailLoader";
import { recent } from "@/data/common/community";

export function generateStaticParams() {
  return recent.posts.map((post) => ({ postId: post.id }));
}

/** 게시글 상세 — Figma node 787:3384 */
export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ postId: string }>;
}) {
  const { postId } = await params;
  return <PostDetailLoader postId={postId} />;
}
