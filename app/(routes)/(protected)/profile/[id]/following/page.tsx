// app/profile/[id]/following/page.tsx
import { getFollowingList } from "@/actions/user/getFollowing";
import UserListClient from "@/app/components/user/UserListClient";
import { ArrowLeft, UserCheck } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function FollowingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await getFollowingList(id, 1, 10);

  if (!result.success || !result.data) return notFound();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 space-y-6">

        {/* Back */}
        <Link
          href={`/profile/${id}`}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-400 hover:text-indigo-600 transition-colors group"
        >
          <ArrowLeft size={15} className="group-hover:-translate-x-0.5 transition-transform" />
          Back to profile
        </Link>

        {/* Header */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
              <UserCheck size={18} className="text-indigo-500" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-gray-900 tracking-tight">
                Following
              </h1>
              <p className="text-sm text-gray-400">
                Users followed by this profile
              </p>
            </div>
          </div>
        </div>

        {/* List */}
        <UserListClient
          profileId={id}
          initialUsers={result.data}
          initialHasMore={result.hasMore || false}
          fetchAction={getFollowingList}
          emptyMessage="Not following anyone yet."
        />

      </div>
    </div>
  );
}