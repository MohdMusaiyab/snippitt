import { getExplorePosts } from "@/actions/posts/explore";
import Explore from "@/app/components/general/Explore";

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: { tag?: string };
}) {
  const tag = searchParams.tag;

  const result = await getExplorePosts({
    page: 1,
    perPage: 9,
    tag, 
  });

  const initialPosts = result.success ? result.data?.posts || [] : [];
  const initialPagination = result.data?.pagination;

  return (
    <Explore
      initialPosts={initialPosts}
      initialPagination={initialPagination}
      initialTag={tag || ""}
    />
  );
}