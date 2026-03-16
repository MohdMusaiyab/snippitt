"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, Loader2, Users } from "lucide-react";
import FollowButton from "@/app/components/general/FollowButton";
import { useDebounce } from "@/hooks/use-debounce"; // Assuming this hook exists or I'll create it

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
  
  const debouncedSearch = useDebounce(search, 500);
  const observer = useRef<IntersectionObserver | null>(null);

  // Reset and search when debounced value changes
  useEffect(() => {
    if (page === 1 && debouncedSearch === "" && users === initialUsers) return;

    const performSearch = async () => {
      setIsSearching(true);
      const result = await fetchAction(profileId, 1, 10, debouncedSearch);
      if (result.success) {
        setUsers(result.data);
        setHasMore(result.hasMore);
        setPage(1);
      }
      setIsSearching(false);
    };

    performSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, profileId, fetchAction]);

  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    const nextPage = page + 1;
    const result = await fetchAction(profileId, nextPage, 10, debouncedSearch);

    if (result.success) {
      setUsers((prev) => [...prev, ...result.data]);
      setHasMore(result.hasMore);
      setPage(nextPage);
    }
    setIsLoading(false);
  }, [page, isLoading, hasMore, profileId, fetchAction, debouncedSearch]);

  const lastUserRef = useCallback(
    (node: HTMLDivElement) => {
      if (isLoading) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          loadMore();
        }
      });

      if (node) observer.current.observe(node);
    },
    [isLoading, hasMore, loadMore]
  );

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="relative group">
        <Search
          size={18}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors"
        />
        <input
          type="text"
          placeholder="Search by username..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-100 rounded-2xl text-sm focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all outline-none shadow-sm font-medium"
        />
        {isSearching && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <Loader2 size={16} className="animate-spin text-gray-400" />
          </div>
        )}
      </div>

      {/* User List */}
      <div className="space-y-4">
        {users.length === 0 && !isSearching ? (
          <div className="text-center py-20 bg-gray-50/50 rounded-[2.5rem] border-2 border-dashed border-gray-200">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-400 font-bold uppercase tracking-wider text-xs">
              {emptyMessage}
            </p>
          </div>
        ) : (
          <>
            {users.map((user, index) => (
              <div
                key={user.id}
                ref={index === users.length - 1 ? lastUserRef : null}
                className="bg-white p-5 rounded-4xl border border-gray-100 shadow-sm flex items-center justify-between hover:border-primary/20 hover:shadow-md hover:shadow-indigo-50/50 transition-all group"
              >
                <div className="flex items-center gap-5 flex-1 min-w-0">
                  <Link href={`/profile/${user.id}`} className="shrink-0 relative">
                    <div className="relative w-14 h-14 rounded-2xl overflow-hidden bg-gray-100 border-2 border-white shadow-sm group-hover:scale-105 transition-transform">
                      {user.avatar ? (
                        <Image
                          src={user.avatar}
                          alt={user.username}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-black text-xl text-primary bg-primary/5">
                          {user.username[0].toUpperCase()}
                        </div>
                      )}
                    </div>
                  </Link>

                  <div className="min-w-0 flex-1">
                    <Link href={`/profile/${user.id}`}>
                      <h3 className="font-black text-gray-900 truncate group-hover:text-primary transition-colors text-lg tracking-tight">
                        @{user.username}
                      </h3>
                    </Link>
                    <p className="text-sm text-gray-500 line-clamp-1 font-medium mt-0.5">
                      {user.bio || "No bio yet."}
                    </p>
                  </div>
                </div>

                <div className="ml-4">
                  {!user.isMe ? (
                    <FollowButton
                      targetUserId={user.id}
                      initialIsFollowing={user.isFollowing}
                      initialFollowerCount={user.followerCount}
                      initialFollowingCount={user.followingCount}
                    />
                  ) : (
                    <span className="text-[10px] font-black uppercase tracking-widest bg-gray-100 text-gray-400 px-4 py-2 rounded-full">
                      You
                    </span>
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-center py-6">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default UserListClient;
