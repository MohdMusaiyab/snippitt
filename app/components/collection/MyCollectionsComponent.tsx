"use client";

import { useState, useTransition } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Collections } from "@/app/components/collection/Collection";
import {
  FolderHeart,
  ChevronLeft,
  ChevronRight,
  X,
  Filter,
  Plus,
  Search,
} from "lucide-react";
import Button from "@/app/components/Button";

interface MyCollectionsComponentProps {
  initialData: any;
  filters: {
    currentPage: number;
    visibility: string;
    search?: string;
    sort?: string;
  };
}

const MyCollectionsComponent = ({
  initialData,
  filters,
}: MyCollectionsComponentProps) => {
  const { visibility, search = "", sort = "desc" } = filters;
  const [searchInput, setSearchInput] = useState(search);
  const searchParams = useSearchParams();
  const router = useRouter();

  const [isPending, startTransition] = useTransition();
  const collections = initialData?.collections || [];
  const pagination = initialData?.pagination || {
    currentPage: 1,
    pages: 0,
    total: 0,
  };
  const isOwner = initialData?.isOwner || false;

  // Helper to update URL and trigger Server Component re-fetch
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

  return (
    <div
      className={`max-w-7xl mx-auto px-6 py-10 space-y-10 transition-opacity ${isPending ? "opacity-60" : "opacity-100"}`}
    >
      {/* 1. Header + CTA */}
      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900">
            My Collections
          </h1>
          <p className="text-sm text-gray-500">
            Organize your favorite snippets into collections for easy access.
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

        {/* Visibility Filters */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-1">
          {["", "PUBLIC", "PRIVATE", "FOLLOWERS"].map((type) => {
            const isActive = (visibility || "") === type;
            return (
              <button
                key={type || "ALL"}
                onClick={() => updateFilters({ visibility: type || null })}
                className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all ${
                  isActive
                    ? "bg-primary text-white"
                    : "text-gray-500 hover:bg-gray-100"
                }`}
              >
                {type || "ALL"}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      {collections.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-12 text-center">
          <FolderHeart className="w-10 h-10 text-gray-400 mx-auto mb-4" />

          <h3 className="text-xl font-semibold">No collections yet</h3>

          <p className="text-gray-600 m-2">
            Create collections to organize your favorite snippets.
          </p>

          <Button variant="primary" size="md">
            <Link href="/explore/posts" className="flex items-center gap-2">
              Explore Posts
            </Link>
          </Button>
        </div>
      ) : (
        <Collections
          collections={collections}
          variant="grid"
          isOwner={isOwner}
        />
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-between pt-8 border-t">
          <p className="text-sm text-gray-600">
            Page {pagination.currentPage} of {pagination.pages}
          </p>

          <div className="flex items-center gap-2">
            <Button
              onClick={() =>
                updateFilters({ page: (pagination.currentPage - 1).toString() })
              }
              disabled={pagination.currentPage === 1}
              variant="outline"
              size="sm"
            >
              <ChevronLeft size={16} />
            </Button>

            <Button
              onClick={() =>
                updateFilters({ page: (pagination.currentPage + 1).toString() })
              }
              disabled={pagination.currentPage === pagination.pages}
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

export default MyCollectionsComponent;
