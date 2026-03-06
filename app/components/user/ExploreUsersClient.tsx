"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, Loader2, User, X } from "lucide-react";
import { useInView } from "react-intersection-observer";
import { getExploreUsers } from "@/actions/user/exploreUser";
import { useDebounce } from "@/hooks/use-debounce";

interface UserItem {
  id: string;
  username: string;
  avatar: string | null;
}

interface ExploreUsersClientProps {
  initialUsers: UserItem[];
}

const ExploreUsersClient = ({ initialUsers }: ExploreUsersClientProps) => {
  // --- State ---
  const [users, setUsers] = useState<UserItem[]>(initialUsers);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [hasMore, setHasMore] = useState(initialUsers.length === 50);
  const [isLoading, setIsLoading] = useState(false);

  const debouncedSearch = useDebounce(search, 500);
  const { ref, inView } = useInView({ threshold: 0 });
  const isFirstRender = useRef(true);

  const clearSearch = () => {
    setSearch("");
    setUsers(initialUsers);
    setPage(1);
    setHasMore(initialUsers.length === 50);
  };

  const handleSearch = useCallback(async (query: string) => {
    setIsLoading(true);
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
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (debouncedSearch.trim() === "") {
      setUsers(initialUsers);
      setPage(1);
      setHasMore(initialUsers.length === 50);
    } else {
      handleSearch(debouncedSearch);
    }
  }, [debouncedSearch, handleSearch, initialUsers]);

  // --- Infinite Scroll Handler ---
  const loadMoreUsers = useCallback(async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    try {
      const result = await getExploreUsers(page, debouncedSearch);
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
  }, [page, debouncedSearch, isLoading, hasMore]);

  // --- Trigger Load More when in view ---
  useEffect(() => {
    if (inView && hasMore && !isLoading) {
      loadMoreUsers();
    }
  }, [inView, hasMore, isLoading, loadMoreUsers]);

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 space-y-10">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900">
          Explore Creators
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Discover developers and creators across the platform.
        </p>
      </div>

      {/* Search Bar Container */}
      <div className="mb-8">
        <div className="relative max-w-md">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            type="text"
            placeholder="Search by username..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-9 py-2.5 text-sm
                 bg-gray-50 border border-gray-200
                 rounded-xl
                 focus:outline-none focus:ring-4 focus:ring-indigo-500/10
                 focus:border-indigo-500
                 transition"
          />

          {search && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Grid List */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {users.map((user) => (
          <Link
            key={user.id}
            href={`/profile/${user.id}`}
            className="group bg-white border border-gray-200
                 rounded-2xl p-4
                 hover:border-indigo-200 hover:shadow-md
                 transition"
          >
            <div className="flex flex-col items-center text-center">
              <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-gray-100 mb-3">
                {user.avatar ? (
                  <Image
                    src={user.avatar}
                    alt={user.username}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <User size={20} />
                  </div>
                )}
              </div>

              <p className="text-sm font-medium text-gray-900 truncate w-full">
                @{user.username}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {/* Loading & Status Sensor */}
      <div ref={ref} className="py-10 flex justify-center">
        {isLoading && (
          <Loader2 className="animate-spin text-indigo-500" size={22} />
        )}

        {!hasMore && users.length > 0 && (
          <p className="text-xs text-gray-400">You’ve reached the end</p>
        )}

        {!isLoading && users.length === 0 && (
          <div className="text-center text-sm text-gray-500">
            No creators found for "{debouncedSearch}"
          </div>
        )}
      </div>
    </div>
  );
};

export default ExploreUsersClient;
