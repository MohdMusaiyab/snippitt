"use client";

import React, { useState } from "react";
import { FolderHeart, Loader2 } from "lucide-react";
import { Collections } from "@/app/components/collection/Collection";
import { getProfileCollections } from "@/actions/user/getProfileCollections";

interface ProfileCollectionsTabProps {
  initialCollections: any[];
  totalCollections: number;
  profileId: string;
  isOwner: boolean;
}

export default function ProfileCollectionsTab({
  initialCollections,
  totalCollections,
  profileId,
  isOwner,
}: ProfileCollectionsTabProps) {
  const [collections, setCollections] = useState(initialCollections);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const loadMore = async () => {
    if (isLoadingMore) return;
    setIsLoadingMore(true);
    try {
      const res = await getProfileCollections({ profileId, skip: collections.length, take: 5 });
      if (res.success && res.data) {
        setCollections((prev) => [...prev, ...res.data]);
      }
    } catch (error) {
      console.error("Failed to load more collections", error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  if (collections.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-16 text-center space-y-3">
        <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto text-gray-300">
          <FolderHeart size={22} />
        </div>
        <p className="text-sm font-medium text-gray-400">No collections yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Collections collections={collections} isOwner={isOwner} />

      {collections.length < totalCollections && (
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
