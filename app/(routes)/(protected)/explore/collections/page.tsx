import { getExploreCollections } from "@/actions/collection/exploreCollections";
import ExploreCollectionsClient from "@/app/components/collection/ExploreCollectionClient";

export default async function ExploreCollectionsPage() {
  const result = await getExploreCollections(0, "");

  return (
    
      <ExploreCollectionsClient initialData={result.data || []} />
  );
}