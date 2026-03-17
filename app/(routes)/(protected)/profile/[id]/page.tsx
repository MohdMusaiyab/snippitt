import { getUserProfile } from "@/actions/user/getUserProfile";
import ProfileHeader from "@/app/components/profile/ProfileHeader";
import ProfileTabs from "@/app/components/profile/ProfileTabs";
import { notFound } from "next/navigation";

interface PageProps {
  params: {
    id: string;
  };
}

const Page = async ({ params }: PageProps) => {
  const { id } = await params; 

  const result = await getUserProfile({ profileId: id });

  if (!result.success || !result.data) {
    return notFound();
  }

  const { profile, initialPosts, totalPosts, initialCollections, totalCollections, currentUserId } = result.data;

  return (
    <div className="min-h-screen bg-gray-50">
      <ProfileHeader 
        profileData={profile} 
        totalPosts={totalPosts} 
        totalCollections={totalCollections}
      >
        <ProfileTabs
          initialPosts={initialPosts}
          totalPosts={totalPosts}
          initialCollections={initialCollections}
          totalCollections={totalCollections}
          profileId={id}
          currentUserId={currentUserId}
          isOwner={profile.isOwner}
        />
      </ProfileHeader>
    </div>
  );
};
export default Page;