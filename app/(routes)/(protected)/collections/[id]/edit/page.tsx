import { getCollectionWithSnippets } from "@/actions/collection/getCollectionWithSnippites";
import EditCollectionClient from "@/app/components/collection/EditCollectionClient";
import { notFound, redirect } from "next/navigation";

export default async function EditCollectionPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: Promise<{ page?: string }>;
}) {
  const { id } = await params;
  const { page } = await searchParams;
  const currentPage = parseInt(page || "1");

  const result = await getCollectionWithSnippets({
    collectionId: id,
    page: currentPage,
    perPage: 12,
  });

  if (!result.success || !result.data) return notFound();
  if (!result.data.isOwner) redirect("/dashboard");

  return (
    <EditCollectionClient
      initialCollection={result.data.collection}
      snippets={result.data.snippets}
      currentUserId={result.data.currentUserId}
      pagination={result.data.pagination}
    />
  );
}
