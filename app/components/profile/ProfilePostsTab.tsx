"use client";

import React, { useState } from "react";
import { Grid3X3, Loader2 } from "lucide-react";
import Snippet from "@/app/components/general/Snippitt";
import { getProfilePosts } from "@/actions/user/getProfilePosts";

interface ProfilePostsTabProps {
  initialPosts: any[];
  totalPosts: number;
  profileId: string;
  currentUserId: string | null;
}

export default function ProfilePostsTab({
  initialPosts,
  totalPosts,
  profileId,
  currentUserId,
}: ProfilePostsTabProps) {
  const [posts, setPosts] = useState(initialPosts);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  const toggleMenu = (id: string) => setMenuOpen(menuOpen === id ? null : id);

  const loadMore = async () => {
    if (isLoadingMore) return;
    setIsLoadingMore(true);
    try {
      const res = await getProfilePosts({ profileId, skip: posts.length, take: 5 });
      if (res.success && res.data) {
        setPosts((prev) => [...prev, ...res.data]);
      }
    } catch (error) {
      console.error("Failed to load more posts", error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  if (posts.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-16 text-center space-y-3">
        <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto text-gray-300">
          <Grid3X3 size={22} />
        </div>
        <p className="text-sm font-medium text-gray-400">No posts published yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => (
          <Snippet
            key={post.id}
            post={post}
            currentUserId={currentUserId as any}
            showActions
            menuOpen={menuOpen}
            toggleMenu={toggleMenu}
          />
        ))}
      </div>

      {posts.length < totalPosts && (
        <div className="flex justify-center pt-4 pb-8">
          <button
            onClick={loadMore}
            disabled={isLoadingMore}
            className="flex items-center gap-2 px-6 py-2.5 bg-white border border-gray-200 hover:border-indigo-300 hover:bg-slate-50 text-gray-700 rounded-xl text-sm font-semibold transition-all shadow-sm disabled:opacity-50"
          >
            {isLoadingMore ? <Loader2 size={16} className="animate-spin" /> : null}
            {isLoadingMore ? "Loading..." : "Load More"}
          </button>
        </div>
      )}
    </div>
  );
}
