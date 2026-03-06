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
  const [selectedCategory, setSelectedCategory] = useState("");

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

    if (value) params.set("visibility", value);
    else params.delete("visibility");

    router.push(`?${params.toString()}`);
  };

  const toggleMenu = (id: string) => {
    setMenuOpen(menuOpen === id ? null : id);
  };

  const handleCreatePost = () => {
    router.push("/create-post");
  };

  const categories = Object.values(Category);

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 space-y-10">

      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900">
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
      </header>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Posts */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md hover:-translate-y-0.5 transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-black text-gray-900 tabular-nums">
                {pagination.totalPosts}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">Total Posts</p>
            </div>

            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
              <FileText className="w-5 h-5 text-[#5865F2]" />
            </div>
          </div>
        </div>

        {/* Likes */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md hover:-translate-y-0.5 transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-black text-gray-900 tabular-nums">
                {posts.reduce((sum, p) => sum + (p._count?.likes || 0), 0)}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">Total Likes</p>
            </div>

            <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center">
              <Heart className="w-5 h-5 text-red-600" />
            </div>
          </div>
        </div>

        {/* Comments */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md hover:-translate-y-0.5 transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-black text-gray-900 tabular-nums">
                {posts.reduce((sum, p) => sum + (p._count?.comments || 0), 0)}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">Total Comments</p>
            </div>

            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Saved */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md hover:-translate-y-0.5 transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-black text-gray-900 tabular-nums">
                {posts.reduce((sum, p) => sum + (p._count?.savedBy || 0), 0)}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">Saved By</p>
            </div>

            <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
              <Bookmark className="w-5 h-5 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters + Controls */}
      <section className="space-y-6">

        {/* Controls */}
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6">

          {/* Category */}
          <div className="flex items-center gap-4">

            <div className="relative w-72">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

              <select
                value={selectedCategory}
                onChange={(e) => handleCategoryFilter(e.target.value)}
                className="w-full pl-11 pr-10 py-3 bg-white border border-gray-200 rounded-2xl text-sm text-gray-700 shadow-sm focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 appearance-none"
              >
                <option value="">All Categories</option>

                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {selectedCategory && (
              <div className="flex items-center gap-2 bg-indigo-50 text-indigo-600 text-xs px-3 py-1.5 rounded-full">
                {selectedCategory}

                <button onClick={() => handleCategoryFilter("")}>
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* View Toggle */}
          <div className="flex items-center gap-4">

            <div className="flex bg-gray-100 rounded-2xl p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`px-4 py-2 rounded-xl text-sm flex items-center gap-2 ${
                  viewMode === "grid"
                    ? "bg-white shadow text-indigo-600"
                    : "text-gray-500"
                }`}
              >
                <Grid size={16} />
                Grid
              </button>

              <button
                onClick={() => setViewMode("list")}
                className={`px-4 py-2 rounded-xl text-sm flex items-center gap-2 ${
                  viewMode === "list"
                    ? "bg-white shadow text-indigo-600"
                    : "text-gray-500"
                }`}
              >
                <List size={16} />
                List
              </button>
            </div>

            <button
              onClick={() => fetchPosts(currentPage, selectedCategory)}
              disabled={loading}
            >
              <RefreshCw
                className={`w-5 h-5 ${loading ? "animate-spin" : ""}`}
              />
            </button>

          </div>
        </div>

        {/* Visibility Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          {["", "PUBLIC", "PRIVATE", "FOLLOWERS", "DRAFT"].map((type) => (
            <button
              key={type || "ALL"}
              onClick={() => handleVisibilityFilter(type)}
              className={`px-3 py-1.5 text-xs rounded-full border transition ${
                visibility === type
                  ? "bg-[#5865F2] text-white border-[#5865F2]"
                  : "bg-white text-gray-600 border-gray-200 hover:border-[#5865F2] hover:text-[#5865F2]"
              }`}
            >
              {type || "ALL"}
            </button>
          ))}
        </div>
      </section>

      {/* Content */}
      {posts.length === 0 ? (
        <div className="bg-white rounded-2xl border p-12 text-center">
          <FileText className="w-10 h-10 text-gray-400 mx-auto mb-4" />

          <h3 className="text-xl font-semibold">No snippets found</h3>

          <p className="text-gray-600 mb-6">
            Start sharing your snippets with the community.
          </p>

          <Button onClick={handleCreatePost}>
            <Plus className="w-4 h-4 mr-1" />
            Create Snippet
          </Button>
        </div>
      ) : (
        <div
          className={
            viewMode === "grid"
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              : "flex flex-col gap-4"
          }
        >
          {posts.map((post) => (
            <Snippet
              key={post.id}
              post={post}
              menuOpen={menuOpen}
              toggleMenu={toggleMenu}
              currentUserId={currentUserId}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between pt-8 border-t">

          <p className="text-sm text-gray-600">
            Page {pagination.currentPage} of {pagination.totalPages}
          </p>

          <div className="flex items-center gap-2">

            <Button
              onClick={() => goToPage(pagination.currentPage - 1)}
              disabled={!pagination.hasPrevPage}
              variant="outline"
              size="sm"
            >
              <ChevronLeft size={16} />
            </Button>

            <Button
              onClick={() => goToPage(pagination.currentPage + 1)}
              disabled={!pagination.hasNextPage}
              variant="outline"
              size="sm"
            >
              <ChevronRight size={16} />
            </Button>

          </div>
        </div>
      )}
    </div>
  );
};

export default MyPostComponent;