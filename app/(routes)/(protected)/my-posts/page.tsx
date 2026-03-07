import MyPostComponent from "@/app/components/posts/MyPostComponent";
import { getMyPosts } from "@/actions/posts/getMyPosts";

interface PageProps {
  searchParams: Promise<{ 
    page?: string; 
    category?: string; 
    visibility?: string 
  }>;
}

const Page = async ({ searchParams }: PageProps) => {
  const params = await searchParams;
  const currentPage = parseInt(params.page || "1");
  const category = params.category || "";
  const visibility = params.visibility || "";

  const result = await getMyPosts({
    page: currentPage,
    perPage: 10,
    category,
    visibility: visibility as any,
  });

  const initialData = result.success ? result.data : null;

  return (
    <MyPostComponent 
      initialData={initialData} 
      filters={{ currentPage, category, visibility }}
    />
  );
};

export default Page;