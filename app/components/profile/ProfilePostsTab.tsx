"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { Grid3X3, ChevronRight, Loader2 } from "lucide-react";
import Snippet from "@/app/components/general/Snippitt";
import { getProfilePosts } from "@/actions/user/getProfilePosts";

interface ProfilePostsTabProps {
  initialPosts: any[];
  totalPosts: number;
  profileId: string;
  currentUserId: string | null;
  mode?: "preview" | "full";
}

export default function ProfilePostsTab({
  initialPosts,
  totalPosts,
  profileId,
  currentUserId,
  mode = "full",
}: ProfilePostsTabProps) {
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const toggleMenu = (id: string) => setMenuOpen(menuOpen === id ? null : id);
  const [posts, setPosts] = useState(initialPosts);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const isLoadingRef = useRef(false);
  const postsLengthRef = useRef(initialPosts.length);
  const hasMoreRef = useRef(initialPosts.length < totalPosts);

  const loadMore = useCallback(async () => {
    if (isLoadingRef.current || !hasMoreRef.current) return;
    isLoadingRef.current = true;
    setIsLoadingMore(true);
    try {
      const res = await getProfilePosts({
        profileId,
        skip: postsLengthRef.current,
        take: 9,
      });
      if (res.success && res.data && res.data.length > 0) {
        setPosts((prev) => {
          const next = [...prev, ...res.data];
          postsLengthRef.current = next.length;
          hasMoreRef.current = next.length < totalPosts;
          return next;
        });
      } else {
        hasMoreRef.current = false;
      }
    } catch (error) {
      console.error("Failed to load more posts", error);
    } finally {
      isLoadingRef.current = false;
      setIsLoadingMore(false);
    }
  }, [profileId, totalPosts]); // stable

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
  }, [mode, loadMore, posts.length]); // posts.length re-attaches sentinel after each page

  const hasMore = posts.length < totalPosts;

  if (posts.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-16 text-center space-y-3">
        <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto text-gray-300">
          <Grid3X3 size={22} />
        </div>
        <p className="text-sm font-medium text-gray-400">
          No posts published yet.
        </p>
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

      {/* Sentinel */}
      {mode === "full" && (
        <div ref={sentinelRef} className="flex justify-center">
          {isLoadingMore && (
            <Loader2 size={18} className="animate-spin text-gray-300" />
          )}
        </div>
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

      {!hasMore && posts.length > 0 && (
        <div className="flex justify-center">
          <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">
            All posts loaded
          </p>
        </div>
      )}
    </div>
  );
}
