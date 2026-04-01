import { getExplorePosts } from "@/actions/posts/explore";
import ExplorePostsClient from "@/app/components/posts/ExplorePostsClient";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-providers";

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<{ tag?: string }>;
}) {
  const { tag } = await searchParams;

  const result = await getExplorePosts({
    page: 1,
    perPage: 9,
    tag,
  });

  const session = await getServerSession(authOptions);
  const currentUserId = session?.user?.id || undefined;
  
  const initialPosts = result.success ? (result.data?.posts ?? []) : [];
  const initialPagination = result.data?.pagination;

  return (
    <ExplorePostsClient
      initialPosts={initialPosts}
      initialPagination={initialPagination}
      initialTag={tag || ""}
      currentUserId={currentUserId}
    />
  );
}
