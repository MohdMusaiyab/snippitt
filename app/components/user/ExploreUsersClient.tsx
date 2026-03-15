"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, Loader2, User, X, Users, Compass } from "lucide-react";
import { useInView } from "react-intersection-observer";
import { getExploreUsers } from "@/actions/user/exploreUser";

interface UserItem {
  id: string;
  username: string;
  avatar: string | null;
}

interface ExploreUsersClientProps {
  initialUsers: UserItem[];
}

const UserSkeleton = () => (
  <div className="bg-white border border-gray-200 rounded-2xl p-4 animate-pulse">
    <div className="flex flex-col items-center gap-3">
      <div className="w-16 h-16 rounded-xl bg-gray-100" />
      <div className="h-3 bg-gray-100 rounded w-20" />
    </div>
  </div>
);

const ExploreUsersClient = ({ initialUsers }: ExploreUsersClientProps) => {
  const [users, setUsers] = useState<UserItem[]>(initialUsers);
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [hasMore, setHasMore] = useState(initialUsers.length === 50);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const { ref, inView } = useInView({ threshold: 0 });
  const isFirstRender = useRef(true);

  const handleSearchChange = (val: string) => {
    setSearchInput(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setSearchTerm(val);
      setPage(1);
    }, 500);
  };

  const handleSearch = useCallback(async (query: string) => {
    setIsSearching(true);
    try {
      const result = await getExploreUsers(0, query);
      if (result.success && result.data) {
        setUsers(result.data);
        setPage(1);
        setHasMore(result.data.length === 50);
      }
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsSearching(false);
    }
  }, []);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (searchTerm.trim() === "") {
      setUsers(initialUsers);
      setPage(1);
      setHasMore(initialUsers.length === 50);
    } else {
      handleSearch(searchTerm);
    }
  }, [searchTerm, handleSearch, initialUsers]);

  const loadMoreUsers = useCallback(async () => {
    if (isLoading || !hasMore) return;
    setIsLoading(true);
    try {
      const result = await getExploreUsers(page, searchTerm);
      if (result.success && result.data && result.data.length > 0) {
        setUsers((prev) => [...prev, ...result.data!]);
        setPage((prev) => prev + 1);
        setHasMore(result.data.length === 50);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Load more error:", error);
    } finally {
      setIsLoading(false);
    }
  }, [page, searchTerm, isLoading, hasMore]);

  useEffect(() => {
    if (inView && hasMore && !isLoading) loadMoreUsers();
  }, [inView, hasMore, isLoading, loadMoreUsers]);

  const loading = isSearching;
  const hasActiveFilters = !!searchInput;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Header */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900">
              Explore Creators
            </h1>
          </div>
          <p className="text-sm text-gray-400">
            Discover creators across the platform
          </p>
        </div>

        {/* Search bar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              value={searchInput}
              placeholder="Search by title or description…"
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-1 focus:ring-indigo-200 focus:border-[#5865F2] transition-all outline-none"
            />
            {searchInput && (
              <button
                onClick={() => handleSearchChange("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>
        {/* Active filters */}
        {hasActiveFilters && (
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100 flex-wrap">
            <span className="text-xs font-medium text-gray-400">Active:</span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-lg text-xs font-medium">
              &quot;{searchInput}&quot;
              <button onClick={() => handleSearchChange("")}>
                <X size={10} />
              </button>
            </span>
            <button
              onClick={() => handleSearchChange("")}
              className="text-xs font-medium text-gray-400 hover:text-red-500 transition-colors ml-auto"
            >
              Clear all
            </button>
          </div>
        )}

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {[...Array(10)].map((_, i) => (
              <UserSkeleton key={i} />
            ))}
          </div>
        ) : users.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {users.map((user) => (
              <Link
                key={user.id}
                href={`/profile/${user.id}`}
                className="group bg-white border border-gray-200 rounded-2xl p-4 hover:border-indigo-200 hover:shadow-sm transition-all"
              >
                <div className="flex flex-col items-center text-center gap-2.5">
                  <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 group-hover:ring-2 group-hover:ring-indigo-400 group-hover:ring-offset-2 transition-all">
                    {user.avatar ? (
                      <Image
                        src={user.avatar}
                        alt={user.username}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-indigo-50">
                        <User size={18} className="text-indigo-400" />
                      </div>
                    )}
                  </div>
                  <p className="text-xs font-semibold text-gray-700 group-hover:text-indigo-600 transition-colors truncate w-full">
                    @{user.username}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-16 text-center space-y-3">
            <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto">
              <Users size={22} className="text-gray-300" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-700">
                No creators found
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                {searchInput
                  ? `No results for "${searchInput}"`
                  : "Check back later"}
              </p>
            </div>
            {hasActiveFilters && (
              <button
                onClick={() => handleSearchChange("")}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
              >
                Clear filters
              </button>
            )}
          </div>
        )}

        {/* Infinite scroll sentinel */}
        <div
          ref={ref}
          className="flex flex-col items-center justify-center py-4 gap-2"
        >
          {isLoading && users.length > 0 && (
            <Loader2 size={18} className="animate-spin text-gray-300" />
          )}
          {!hasMore && users.length > 0 && (
            <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">
              End of results
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExploreUsersClient;
