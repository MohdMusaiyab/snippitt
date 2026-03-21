"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, Loader2, Users, X } from "lucide-react";
import FollowButton from "@/app/components/general/FollowButton";
import { useDebounce } from "@/hooks/use-debounce";

interface UserListItem {
  id: string;
  username: string;
  avatar: string | null;
  bio: string | null;
  followerCount: number;
  followingCount: number;
  isFollowing: boolean;
  isMe: boolean;
}

interface UserListClientProps {
  profileId: string;
  initialUsers: UserListItem[];
  initialHasMore: boolean;
  fetchAction: (profileId: string, page: number, limit: number, search: string) => Promise<any>;
  emptyMessage: string;
}

const UserListClient = ({
  profileId,
  initialUsers,
  initialHasMore,
  fetchAction,
  emptyMessage,
}: UserListClientProps) => {
  const [users, setUsers] = useState<UserListItem[]>(initialUsers);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const isFirstRender = useRef(true);

  const debouncedSearch = useDebounce(search, 400);
  const observer = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return; }
    const performSearch = async () => {
      setIsSearching(true);
      const result = await fetchAction(profileId, 1, 10, debouncedSearch);
      if (result.success) { setUsers(result.data); setHasMore(result.hasMore); setPage(1); }
      setIsSearching(false);
    };
    performSearch();
  }, [debouncedSearch, profileId, fetchAction]);

  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore) return;
    setIsLoading(true);
    const nextPage = page + 1;
    const result = await fetchAction(profileId, nextPage, 10, debouncedSearch);
    if (result.success) { setUsers((prev) => [...prev, ...result.data]); setHasMore(result.hasMore); setPage(nextPage); }
    setIsLoading(false);
  }, [page, isLoading, hasMore, profileId, fetchAction, debouncedSearch]);

  const lastUserRef = useCallback(
    (node: HTMLDivElement) => {
      if (isLoading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver(
        (entries) => { if (entries[0].isIntersecting && hasMore) loadMore(); },
        { rootMargin: "100px" },
      );
      if (node) observer.current.observe(node);
    },
    [isLoading, hasMore, loadMore],
  );

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-10 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all shadow-sm"
        />
        {search && !isSearching && (
          <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
            <X size={14} />
          </button>
        )}
        {isSearching && (
          <Loader2 size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 animate-spin" />
        )}
      </div>

      {/* List */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden divide-y divide-gray-100">
        {isSearching ? (
          [...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3 animate-pulse">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex-shrink-0" />
              <div className="flex-1 h-3 bg-gray-100 rounded w-28" />
              <div className="w-16 h-7 bg-gray-100 rounded-lg flex-shrink-0" />
            </div>
          ))
        ) : users.length === 0 ? (
          <div className="p-16 text-center space-y-3">
            <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto">
              <Users size={22} className="text-gray-300" />
            </div>
            <p className="text-sm font-medium text-gray-400">{emptyMessage}</p>
          </div>
        ) : (
          <>
            {users.map((user, index) => (
              <div
                key={user.id}
                ref={index === users.length - 1 ? lastUserRef : null}
                className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
              >
                {/* Avatar */}
                <Link href={`/profile/${user.id}`} className="flex-shrink-0">
                  <div className="relative w-10 h-10 rounded-full overflow-hidden bg-indigo-50">
                    {user.avatar ? (
                      <Image src={user.avatar} alt={user.username} fill className="object-cover" unoptimized />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-sm font-extrabold text-indigo-400">
                        {user.username[0].toUpperCase()}
                      </div>
                    )}
                  </div>
                </Link>

                {/* Username */}
                <Link href={`/profile/${user.id}`} className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 hover:text-indigo-600 transition-colors truncate">
                    @{user.username}
                  </p>
                </Link>

                {/* Action */}
                <div className="flex-shrink-0">
                  {user.isMe ? (
                    <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 bg-gray-100 px-3 py-1.5 rounded-lg">
                      You
                    </span>
                  ) : (
                    <FollowButton
                      targetUserId={user.id}
                      initialIsFollowing={user.isFollowing}
                    />
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-center py-4">
                <Loader2 size={16} className="animate-spin text-gray-300" />
              </div>
            )}

            {!hasMore && users.length > 0 && (
              <div className="flex justify-center py-4">
                <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">
                  All loaded
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default UserListClient;