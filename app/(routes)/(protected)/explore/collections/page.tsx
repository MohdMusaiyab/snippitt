import { getExploreCollections } from "@/actions/collection/exploreCollections";
import ExploreCollectionsClient from "@/app/components/collection/ExploreCollectionsClient";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-providers";

export default async function ExploreCollectionsPage() {
  const result = await getExploreCollections(0, "");
  const session = await getServerSession(authOptions);
  const currentUserId = session?.user?.id || null;

  return (
    
      <ExploreCollectionsClient initialData={result.data || []} currentUserId={currentUserId} />
  );
}