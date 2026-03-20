"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { FolderHeart, ChevronRight, Loader2 } from "lucide-react";
import { Collections } from "@/app/components/collection/Collection";
import { getProfileCollections } from "@/actions/user/getProfileCollections";

interface ProfileCollectionsTabProps {
  initialCollections: any[];
  totalCollections: number;
  profileId: string;
  isOwner: boolean;
  mode?: "preview" | "full";
}

export default function ProfileCollectionsTab({
  initialCollections,
  totalCollections,
  profileId,
  isOwner,
  mode = "full",
}: ProfileCollectionsTabProps) {
  const [collections, setCollections] = useState(initialCollections);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Refs to track current values without causing observer re-registration
  const isLoadingRef = useRef(false);
  const collectionsLengthRef = useRef(initialCollections.length);
  const hasMoreRef = useRef(initialCollections.length < totalCollections);

  const loadMore = useCallback(async () => {
    if (isLoadingRef.current || !hasMoreRef.current) return;

    isLoadingRef.current = true;
    setIsLoadingMore(true);

    try {
      const res = await getProfileCollections({
        profileId,
        skip: collectionsLengthRef.current,
        take: 9,
      });

      if (res.success && res.data && res.data.length > 0) {
        setCollections((prev) => {
          const next = [...prev, ...res.data];
          collectionsLengthRef.current = next.length;
          hasMoreRef.current = next.length < totalCollections;
          return next;
        });
      } else {
        hasMoreRef.current = false;
      }
    } catch (error) {
      console.error("Failed to load more collections", error);
    } finally {
      isLoadingRef.current = false;
      setIsLoadingMore(false);
    }
  }, [profileId, totalCollections]); // ← stable deps only

  // Register observer once — never re-registers
  useEffect(() => {
    if (mode !== "full") return;
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMoreRef.current) {
          loadMore();
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [mode, loadMore, collections.length]);

  const hasMore = collections.length < totalCollections;

  if (collections.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-16 text-center space-y-3">
        <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto text-gray-300">
          <FolderHeart size={22} />
        </div>
        <p className="text-sm font-medium text-gray-400">
          No collections published yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Collections collections={collections} isOwner={isOwner} />

      {mode === "full" && (
        <>
          {hasMore && (
            <div
              ref={sentinelRef}
              className="flex justify-center py-8 min-h-[60px]"
            >
              {isLoadingMore && (
                <Loader2 size={18} className="animate-spin text-gray-300" />
              )}
            </div>
          )}
        </>
      )}

      {/* Preview mode */}
      {mode === "preview" && hasMore && (
        <div className="flex justify-center pt-4 pb-8">
          <Link
            href={`/profile/${profileId}/posts`}
            className="flex items-center gap-2 px-6 py-2.5 text-primary text-sm font-semibold"
          >
            See all posts
            <ChevronRight size={15} />
          </Link>
        </div>
      )}
      {!hasMore && collections.length > 0 && (
        <div className="flex justify-center">
          <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">
            All collections loaded
          </p>
        </div>
      )}
    </div>
  );
}
