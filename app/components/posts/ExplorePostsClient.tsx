"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Loader2, X } from "lucide-react";
import Snippet from "@/app/components/general/Snippitt";
import Dropdown from "../general/Dropdown";
import { getExplorePosts } from "@/actions/posts/explore";
import { Category } from "@/app/generated/prisma/enums";
import type { Post } from "@/schemas/post";
import Button from "@/app/components/Button";

interface ExploreProps {
  initialPosts: Post[];
  initialPagination:
    | { total: number; pages: number; currentPage: number }
    | undefined;
  initialTag?: string;
  currentUserId: string | undefined;
}

const PostSkeleton = () => (
  <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm animate-pulse">
    <div className="h-48 bg-gray-100 w-full" />
    <div className="p-5 space-y-3">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-gray-100 rounded-full" />
        <div className="space-y-1.5 flex-1">
          <div className="h-2.5 bg-gray-100 rounded w-24" />
          <div className="h-2 bg-gray-100 rounded w-16" />
        </div>
      </div>
      <div className="h-4 bg-gray-100 rounded w-3/4" />
      <div className="h-3 bg-gray-100 rounded w-full" />
      <div className="h-3 bg-gray-100 rounded w-2/3" />
    </div>
  </div>
);

const ExplorePostsClient = ({
  initialPosts,
  initialPagination,
  initialTag,
  currentUserId,
}: ExploreProps) => {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(initialPagination?.currentPage || 1);
  const [hasMore, setHasMore] = useState(
    initialPagination
      ? initialPagination.currentPage < initialPagination.pages
      : false,
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [selectedTag, setSelectedTag] = useState(initialTag || "");
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const isFirstRender = useRef(true);
  const categoryRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        categoryRef.current &&
        !categoryRef.current.contains(e.target as Node)
      ) {
        setShowCategoryDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const fetchPosts = useCallback(
    async (
      pageNum: number,
      search: string,
      category: string,
      tag: string,
      isAppend = false,
    ) => {
      try {
        if (isAppend) setLoadingMore(true);
        else setLoading(true);
        const result = await getExplorePosts({
          page: pageNum,
          perPage: 9,
          search,
          category: category || undefined,
          tag: tag || undefined,
        });
        if (result.success && result.data) {
          setPosts((prev) =>
            isAppend ? [...prev, ...result.data!.posts] : result.data!.posts,
          );
          setHasMore(
            result.data.pagination.currentPage < result.data.pagination.pages,
          );
        }
      } catch (error) {
        console.error("Fetch Error:", error);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [],
  );

  const handleSearchChange = (val: string) => {
    setSearchInput(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setSearchTerm(val);
      setPage(1);
    }, 500);
  };

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    fetchPosts(1, searchTerm, selectedCategory, selectedTag, false);
  }, [searchTerm, selectedCategory, selectedTag, fetchPosts]);

  useEffect(() => {
    if (page > (initialPagination?.currentPage || 1)) {
      fetchPosts(page, searchTerm, selectedCategory, selectedTag, true);
    }
  }, [page]);

  const toggleMenu = (id: string) => setMenuOpen(menuOpen === id ? null : id);

  const hasActiveFilters = searchInput || selectedCategory || selectedTag;

  const clearFilters = () => {
    setSearchInput("");
    setSearchTerm("");
    setSelectedCategory("");
    setSelectedTag("");
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Header */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900">
              Explore Posts
            </h1>
          </div>
          <p className="text-sm text-gray-400">
            Discover posts from the community
          </p>
        </div>

        {/* Search + Filter bar */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
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

          {/* Category dropdown */}
          <Dropdown
            options={Object.values(Category).map((cat) => ({
              label: cat.replace(/_/g, " "),
              value: cat,
            }))}
            value={selectedCategory}
            onChange={(val) => {
              setSelectedCategory(val);
              setPage(1);
            }}
            placeholder="All Categories"
            allLabel="All Categories"
          />
        </div>

        {/* Active filters row */}
        {hasActiveFilters && (
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100 flex-wrap">
            <span className="text-xs font-medium text-gray-400">Active:</span>
            {searchInput && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-lg text-xs font-medium">
                "{searchInput}"
                <button onClick={() => handleSearchChange("")}>
                  <X size={10} />
                </button>
              </span>
            )}
            {selectedCategory && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-lg text-xs font-medium">
                {selectedCategory.replace(/_/g, " ")}
                <button
                  onClick={() => {
                    setSelectedCategory("");
                    setPage(1);
                  }}
                >
                  <X size={10} />
                </button>
              </span>
            )}
            {selectedTag && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-lg text-xs font-medium">
                #{selectedTag}
                <button
                  onClick={() => {
                    setSelectedTag("");
                    setPage(1);
                  }}
                >
                  <X size={10} />
                </button>
              </span>
            )}
            <button
              onClick={clearFilters}
              className="text-xs font-medium text-gray-400 hover:text-red-500 transition-colors ml-auto"
            >
              Clear all
            </button>
          </div>
        )}

        {/* Grid */}
        {loading && page === 1 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => (
              <PostSkeleton key={i} />
            ))}
          </div>
        ) : posts.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              <AnimatePresence mode="popLayout">
                {posts.map((post) => (
                  <motion.div
                    key={post.id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.18 }}
                  >
                    <Snippet
                      post={post}
                      menuOpen={menuOpen}
                      currentUserId={currentUserId}
                      toggleMenu={toggleMenu}
                      showActions={true}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {hasMore && (
              <div className="pt-4 flex justify-center">
                <Button
                  onClick={() => setPage((p) => p + 1)}
                  variant="primary"
                  size="md"
                  disabled={loadingMore}
                  className="rounded-xl shadow-sm shadow-indigo-200 min-w-[160px]"
                  icon={
                    loadingMore ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : undefined
                  }
                >
                  {loadingMore ? "Loading…" : "Load more"}
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-12 text-center">
            <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto">
              <Search size={22} className="text-gray-300" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-700">No posts found</p>
              <p className="text-xs text-gray-400 mt-0.5">
                Try adjusting your search or filters
              </p>
            </div>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExplorePostsClient;
