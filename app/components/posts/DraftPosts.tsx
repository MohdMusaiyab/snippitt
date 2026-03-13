"use client";
import React, { useState, useTransition } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  FileText,
  Plus,
  Search,
  Filter,
  X,
} from "lucide-react";
import Snippet from "@/app/components/general/Snippitt";
import Button from "@/app/components/Button";
import { Category } from "@/app/generated/prisma/enums";

interface DraftPostsProps {
  initialData: any;
  filters: {
    currentPage: number;
    category: string;
    search?: string;
    sort?: string;
  };
}

const DraftPosts = ({ initialData, filters }: DraftPostsProps) => {
  const { currentPage, category, search = "", sort = "desc" } = filters;
  const [searchInput, setSearchInput] = useState(search);
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isPending, startTransition] = useTransition();

  const posts = initialData?.posts || [];
  const pagination = initialData?.pagination || { pages: 0 };
  const currentUserId = initialData?.currentUserId || "";

  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  const updateFilters = (newParams: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(newParams).forEach(([key, value]) => {
      if (value) params.set(key, value);
      else params.delete(key);
    });

    // Always reset to page 1 when changing filters (unless specifically navigating pages)
    if (!newParams.page) params.set("page", "1");

    startTransition(() => {
      router.push(`?${params.toString()}`);
    });
  };

  const handleRefresh = () => {
    startTransition(() => {
      router.refresh();
    });
  };

  const categories = Object.values(Category);

  return (
    <div
      className={`max-w-7xl mx-auto px-6 py-10 space-y-10 transition-opacity ${isPending ? "opacity-60" : "opacity-100"}`}
    >
      {/* 1. Header + CTA*/}
      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900">
            Drafts
          </h1>
          <p className="text-sm text-gray-500">
            Your drafts are published as private posts. You can make changes and publish them anytime or keep them as drafts.
          </p>
        </div>

        <Link href="/create-post">
          <Button
            variant="primary"
            size="md"
            className="flex items-center gap-2 w-full sm:w-auto whitespace-nowrap rounded-xl shadow-sm shadow-indigo-200"
          >
            <Plus size={18} />
            <span>New Post</span>
          </Button>
        </Link>
      </header>

      {/* 2. Search + Filters + Sorting */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
          <div className="relative group flex-1 lg:w-72">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#5865F2] transition-colors"
            />
            <input
              type="text"
              placeholder="Search..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" && updateFilters({ search: searchInput })
              }
              className="w-full pl-10 pr-10 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/2 focus:border-[#5865F2] transition-all outline-none"
            />
          </div>
          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:flex-none">
              <select
                value={category}
                onChange={(e) => updateFilters({ category: e.target.value })}
                className="w-full sm:w-auto pl-3 pr-8 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-600 hover:text-gray-900 appearance-none cursor-pointer outline-none"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 hover:text-gray-900">
                <ChevronRight size={14} className="rotate-90" />
              </div>
            </div>

            <div className="relative flex-1 sm:flex-none">
              <select
                value={sort}
                onChange={(e) => updateFilters({ sort: e.target.value })}
                className="w-full sm:w-auto pl-3 pr-8 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-600 hover:text-gray-900 appearance-none cursor-pointer outline-none"
              >
                <option value="desc">Sort: Newest</option>

                <option value="asc">Sort: Oldest</option>
              </select>

              <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 hover:text-gray-900">
                <ChevronRight size={14} className="rotate-90" />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* 3. Content Rendering */}
      {posts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-primary/50 p-12 text-center">
          <FileText className="w-10 h-10 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold">No drafts yet</h3>
          <p className="text-gray-600 mb-6">
            Start creating posts and they will appear here as drafts until you
            publish them.
          </p>
          <Button onClick={() => router.push("/create-post")}>
            Create Post
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post: any) => (
            <Snippet
              key={post.id}
              post={post}
              menuOpen={menuOpen}
              toggleMenu={setMenuOpen}
              currentUserId={currentUserId}
            />
          ))}
        </div>
      )}

      {pagination.pages > 1 && (
        <div className="flex justify-between items-center mt-10">
          <Button
            variant="outline"
            size="sm"
            disabled={!pagination.hasNextPage || isPending}
            onClick={() =>
              updateFilters({ page: (pagination.currentPage - 1).toString() })
            }
          >
            <ChevronLeft size={16} />
          </Button>

          <p>
            Page {currentPage} of {pagination.pages}
          </p>

          <Button
            variant="outline"
            size="sm"
            disabled={!pagination.hasPrevPage || isPending}
            onClick={() =>
              updateFilters({ page: (pagination.currentPage + 1).toString() })
            }
          >
            <ChevronRight size={16} />
          </Button>
        </div>
      )}
    </div>
  );
};

export default DraftPosts;
