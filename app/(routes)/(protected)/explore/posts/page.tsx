import { getExplorePosts } from "@/actions/posts/explore";
import ExplorePostsClient from "@/app/components/posts/ExplorePostsClient";

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
  const initialPosts = result.success ? (result.data?.posts ?? []) : [];
  const initialPagination = result.data?.pagination;

  return (
    <ExplorePostsClient
      initialPosts={initialPosts}
      initialPagination={initialPagination}
      initialTag={tag || ""}
    />
  );
}
