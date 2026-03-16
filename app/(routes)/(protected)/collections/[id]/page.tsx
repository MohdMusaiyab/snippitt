import { getCollectionWithSnippets } from "@/actions/collection/getCollectionWithSnippites";
import CollectionDetailsClient from "@/app/components/collection/CollectionDetailsClient";
import { authOptions } from "@/lib/auth-providers";
import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";

export default async function CollectionViewPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: Promise<{ page?: string }>;
}) {
  const session = await getServerSession(authOptions);
  const currentUserId = session?.user?.id;
  const { id } = await params;
  const { page } = await searchParams;
  const currentPage = parseInt(page || "1");

  const result = await getCollectionWithSnippets({
    collectionId: id,
    page: currentPage,
    perPage: 12,
  });

  if (!result.success || !result.data) return notFound();

  return (
    <CollectionDetailsClient
      collection={result.data.collection}
      snippets={result.data.snippets}
      currentUserId={currentUserId}
      isOwner={result.data.isOwner}
      pagination={result.data.pagination}
    />
  );
}
