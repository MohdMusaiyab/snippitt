import { getUserProfile } from "@/actions/user/getUserProfile";
import { getProfileCollections } from "@/actions/user/getProfileCollections";
import ProfileCollectionsTab from "@/app/components/profile/ProfileCollectionsTab";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

const Page = async ({ params }: PageProps) => {
  const { id } = await params;

  const profileResult = await getUserProfile({ profileId: id });
  if (!profileResult.success || !profileResult.data) return notFound();

  const collectionsResult = await getProfileCollections({
    profileId: id,
    skip: 0,
    take: 9,
  });

  const profile = profileResult.data.profile;
  const initialCollections = collectionsResult.success
    ? (collectionsResult.data ?? [])
    : [];
  const totalCollections = profileResult.data.totalCollections;

  const isOwner = profile?.isOwner || false;

  // In page.tsx — verify these values
  console.log({
    totalCollections,
    initialCollections: initialCollections.length,
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900">
                @{profile.username}&apos;s Collections
              </h1>
              <p className="text-sm text-gray-400">
                {totalCollections} collection{totalCollections !== 1 ? "s" : ""}{" "}
                published
              </p>
            </div>
          </div>
        </div>

        <ProfileCollectionsTab
          initialCollections={initialCollections}
          totalCollections={totalCollections}
          profileId={id}
          isOwner={isOwner}
        />
      </div>
    </div>
  );
};

export default Page;
