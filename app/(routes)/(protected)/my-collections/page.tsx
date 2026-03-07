import MyCollectionsComponent from "@/app/components/collection/MyCollectionsComponent";
import { getUserCollections } from "@/actions/collection/getUserCollections";

interface PageProps {
  searchParams: Promise<{
    page?: string;
    visibility?: string;
  }>;
}

const Page = async ({ searchParams }: PageProps) => {
  const params = await searchParams;
  const currentPage = parseInt(params.page || "1");
  const visibility = params.visibility || "";

  const result = await getUserCollections({
    page: currentPage,
    perPage: 12,
    visibility: visibility as any,
  });

  const initialData = result.success ? result.data : null;

  return (
    <MyCollectionsComponent 
      initialData={initialData} 
      filters={{ currentPage, visibility }} 
    />
  );
};

export default Page;