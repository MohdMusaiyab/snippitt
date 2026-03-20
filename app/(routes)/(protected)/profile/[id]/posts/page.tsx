import { getUserProfile } from "@/actions/user/getUserProfile";
import { getProfilePosts } from "@/actions/user/getProfilePosts";
import ProfilePostsTab from "@/app/components/profile/ProfilePostsTab";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

const Page = async ({ params }: PageProps) => {
  const { id } = await params;

  const profileResult = await getUserProfile({ profileId: id });
  if (!profileResult.success || !profileResult.data) return notFound();

  const postsResult = await getProfilePosts({
    profileId: id,
    skip: 0,
    take: 9,
  });

  const profile = profileResult.data.profile;
  const initialPosts = postsResult.success ? postsResult.data ?? [] : [];
  const totalPosts = profileResult.data.totalPosts;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900">
                @{profile.username}&apos;s Posts
              </h1>
              <p className="text-sm text-gray-400">
                {totalPosts} post{totalPosts !== 1 ? "s" : ""} published
              </p>
            </div>
          </div>
        </div>

        <ProfilePostsTab
          initialPosts={initialPosts}
          totalPosts={totalPosts}
          profileId={id}
          currentUserId={profileResult.data.currentUserId}
        />
      </div>
    </div>
  );
};

export default Page;