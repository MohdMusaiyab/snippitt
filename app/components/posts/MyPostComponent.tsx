"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Snippet from "@/app/components/general/Snippitt";
import { getMyPosts } from "@/actions/posts/getMyPosts";
import Button from "@/app/components/Button";
import { Category } from "@/app/generated/prisma/enums";
import {
  ChevronLeft,
  ChevronRight,
  Grid,
  List,
  Filter,
  Plus,
  RefreshCw,
  FileText,
  MessageCircle,
  Bookmark,
  Heart,
  X,
} from "lucide-react";
import type { Post } from "@/schemas/post";

const MyPostComponent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const [posts, setPosts] = useState<Post[]>([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    perPage: 10,
    totalPages: 0,
    totalPosts: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [currentUserId, setCurrentUserId] = useState("");
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  const currentPage = parseInt(searchParams.get("page") || "1");
  const category = searchParams.get("category") || "";
  const visibility = searchParams.get("visibility") || "";

  const fetchPosts = useCallback(
    async (
      page: number,
      categoryFilter: string = "",
      visibilityFilter: string = "",
    ) => {
      try {
        setLoading(true);
        const result = await getMyPosts({
          page,
          perPage: 10,
          category: categoryFilter,
          visibility: visibilityFilter as any,
        });

        if (result.success && result.data) {
          setPosts(result.data.posts);
          setPagination(result.data.pagination);
          setCurrentUserId(result.data.currentUserId);
        }
      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
        setLoading(false);
        if (initialLoading) setInitialLoading(false);
      }
    },
    [initialLoading],
  );

  useEffect(() => {
    fetchPosts(currentPage, category, visibility);
  }, [currentPage, category, visibility, fetchPosts]);

  const goToPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    if (selectedCategory) params.set("category", selectedCategory);
    router.push(`?${params.toString()}`);
  };

  const handleCategoryFilter = (category: string) => {
    const params = new URLSearchParams();
    params.set("page", "1");
    if (category) {
      params.set("category", category);
      setSelectedCategory(category);
    } else {
      params.delete("category");
      setSelectedCategory("");
    }
    router.push(`?${params.toString()}`);
  };

  const handleVisibilityFilter = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());

    params.set("page", "1");

    if (value) {
      params.set("visibility", value);
    } else {
      params.delete("visibility");
    }

    router.push(`?${params.toString()}`);
  };

  const toggleMenu = (id: string) => {
    setMenuOpen(menuOpen === id ? null : id);
  };

  const handleCreatePost = () => {
    router.push("/create-post");
  };

  const categories = Object.values(Category);

  if (initialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="relative inline-block">
            <div className="w-16 h-16 border-4 border-[#5865F2]/20 rounded-full"></div>
            <div className="w-16 h-16 border-4 border-[#5865F2] border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
          </div>
          <p className="mt-4 text-gray-600 font-medium">
            Loading your posts...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between items-start justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900 break-words">
                My Snippets
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Manage your content, visibility, and performance
              </p>
            </div>

            <Link href="/create-post" className="w-full sm:w-auto">
              <Button
                variant="primary"
                size="md"
                className="flex items-center justify-center gap-1 w-full sm:w-auto"
              >
                <Plus size={16} />
                New Post
              </Button>
            </Link>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-black text-gray-900 tabular-nums">
                    {pagination.totalPosts}
                  </p>
                  <p className="text-xs text-gray-500 font-medium mt-0.5">
                    Total Posts
                  </p>
                </div>
                <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
                  <FileText className="w-5 h-5 text-[#5865F2]" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-black text-gray-900 tabular-nums">
                    {posts.reduce(
                      (sum, post) => sum + (post._count?.likes || 0),
                      0,
                    )}
                  </p>
                  <p className="text-xs text-gray-500 font-medium mt-0.5">
                    Total Likes
                  </p>
                </div>
                <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center">
                  <Heart className="w-5 h-5 text-red-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-black text-gray-900 tabular-nums">
                    {posts.reduce(
                      (sum, post) => sum + (post._count?.comments || 0),
                      0,
                    )}
                  </p>
                  <p className="text-xs text-gray-500 font-medium mt-0.5">
                    Total Comments
                  </p>
                </div>
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-black text-gray-900 tabular-nums">
                    {posts.reduce(
                      (sum, post) => sum + (post._count?.savedBy || 0),
                      0,
                    )}
                  </p>
                  <p className="text-xs text-gray-500 font-medium mt-0.5">
                    Saved By
                  </p>
                </div>
                <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
                  <Bookmark className="w-5 h-5 text-purple-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Controls Bar */}
          <div className="relative mb-6">
            <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6">
              {/* LEFT SIDE */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 w-full xl:w-auto">
                {/* Category Filter */}
                <div className="relative w-full sm:w-72">
                  <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />

                  <select
                    value={selectedCategory}
                    onChange={(e) => handleCategoryFilter(e.target.value)}
                    className="w-full pl-11 pr-10 py-3 bg-white border border-gray-200 rounded-2xl text-sm text-gray-700
                       shadow-sm transition-all duration-200
                       focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500
                       hover:border-gray-300 appearance-none"
                  >
                    <option value="">All Categories</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>

                  {/* Dropdown arrow */}
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                    ▾
                  </div>
                </div>

                {/* Active Filter Badge */}
                {selectedCategory && (
                  <div className="flex items-center gap-2 bg-indigo-50 text-indigo-600 text-xs font-medium px-3 py-1.5 rounded-full">
                    {selectedCategory}
                    <button
                      onClick={() => handleCategoryFilter("")}
                      className="hover:text-red-500 transition"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* RIGHT SIDE */}
              <div className="flex items-center justify-between sm:justify-end gap-5">
                {/* Segmented View Toggle */}
                <div className="relative flex bg-gray-100/80 backdrop-blur rounded-2xl p-1 shadow-inner">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`relative z-10 flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200
              ${
                viewMode === "grid"
                  ? "bg-white shadow text-indigo-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
                  >
                    <Grid className="w-4 h-4" />
                    <span className="hidden sm:inline">Grid</span>
                  </button>

                  <button
                    onClick={() => setViewMode("list")}
                    className={`relative z-10 flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200
              ${
                viewMode === "list"
                  ? "bg-white shadow text-indigo-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
                  >
                    <List className="w-4 h-4" />
                    <span className="hidden sm:inline">List</span>
                  </button>
                </div>

                {/* Divider */}
                <div className="hidden sm:block w-px h-7 bg-gray-200" />

                {/* Refresh */}
                <button
                  onClick={() => fetchPosts(currentPage, selectedCategory)}
                  disabled={loading}
                  className="flex items-center gap-2 rounded-2xl text-sm font-medium
                     hover:border-indigo-400 hover:text-indigo-600
                     transition-all duration-200 disabled:opacity-50"
                >
                  <RefreshCw
                    className={`w-5 h-5 ${loading ? "animate-spin" : ""}`}
                  />
                </button>
              </div>
            </div>
          </div>
          {/* visibility filters */}
          <div className="flex items-center gap-2 flex-wrap mb-6">
            {["", "PUBLIC", "PRIVATE", "FOLLOWERS", "DRAFT"].map((type) => (
              <button
                key={type || "ALL"}
                onClick={() => handleVisibilityFilter(type)}
                className={`px-3 py-1.5 text-xs font-medium rounded-full border transition ${
                  visibility === type
                    ? "bg-[#5865F2] text-white border-[#5865F2]"
                    : "bg-white text-gray-600 border-gray-200 hover:border-[#5865F2] hover:text-[#5865F2]"
                }`}
              >
                {type || "ALL"}
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        {posts.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FileText className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No snippets found
            </h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Start sharing your code snippets or projects with the community.
            </p>
            <Button
              onClick={handleCreatePost}
              variant="primary"
              size="lg"
              icon={<Plus className="w-5 h-5" />}
            >
              Create Your First Snippet
            </Button>
          </div>
        ) : (
          <div className="relative">
            {loading && (
              <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] z-10 flex items-center justify-center rounded-xl" />
            )}

            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                  : "flex flex-col gap-4"
              }
            >
              {posts.map((post) => (
                <div
                  key={post.id}
                  className={
                    viewMode === "list"
                      ? "bg-white rounded-xl border border-gray-100 p-2"
                      : ""
                  }
                >
                  <Snippet
                    post={post}
                    menuOpen={menuOpen}
                    toggleMenu={toggleMenu}
                    currentUserId={currentUserId}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pagination Section */}
        {pagination.totalPages > 1 && (
          <div className="mt-10 pt-8 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-600">
              Showing{" "}
              <span className="font-medium">
                {(pagination.currentPage - 1) * pagination.perPage + 1}
              </span>{" "}
              to{" "}
              <span className="font-medium">
                {Math.min(
                  pagination.currentPage * pagination.perPage,
                  pagination.totalPosts,
                )}
              </span>{" "}
              of <span className="font-medium">{pagination.totalPosts}</span>{" "}
              snippets
            </p>

            <div className="flex items-center gap-2">
              <Button
                onClick={() => goToPage(pagination.currentPage - 1)}
                disabled={!pagination.hasPrevPage || loading}
                variant="outline"
                size="sm"
                icon={<ChevronLeft className="w-4 h-4" />}
              >
                Prev
              </Button>

              <div className="hidden sm:flex items-center gap-1">
                {Array.from(
                  { length: Math.min(5, pagination.totalPages) },
                  (_, i) => {
                    const pageNum = i + 1; // Simplified for brevity, same as your logic
                    return (
                      <button
                        key={pageNum}
                        onClick={() => goToPage(pageNum)}
                        className={`w-9 h-9 rounded-lg text-sm font-medium transition ${
                          pagination.currentPage === pageNum
                            ? "bg-[#5865F2] text-white"
                            : "bg-white border border-gray-200 text-gray-700 hover:border-[#5865F2] hover:text-[#5865F2]"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  },
                )}
              </div>

              <Button
                onClick={() => goToPage(pagination.currentPage + 1)}
                disabled={!pagination.hasNextPage || loading}
                variant="outline"
                size="sm"
                icon={<ChevronRight className="w-4 h-4" />}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyPostComponent;
