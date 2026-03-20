"use client";

import React, { useState, useTransition } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Snippet from "@/app/components/general/Snippitt";
import Button from "@/app/components/Button";
import Dropdown from "@/app/components/general/Dropdown";
import { Category } from "@/app/generated/prisma/enums";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  FileText,
  Search,
} from "lucide-react";

interface MyPostComponentProps {
  initialData: any;
  filters: {
    currentPage: number;
    category: string;
    visibility: string;
    search?: string;
    sort?: string;
  };
}

const MyPostComponent = ({ initialData, filters }: MyPostComponentProps) => {
  const {
    currentPage,
    category,
    visibility,
    search = "",
    sort = "desc",
  } = filters;
  const [searchInput, setSearchInput] = useState(search);
  const searchParams = useSearchParams();
  const router = useRouter();

  // Use transition to show a loading state during server re-fetches
  const [isPending, startTransition] = useTransition();

  const posts = initialData?.posts || [];
  const pagination = initialData?.pagination || {};
  const currentUserId = initialData?.currentUserId || "";

  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

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
      {/* 1. Header + CTA*/}
      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900">
            My Snippets
          </h1>
          <p className="text-sm text-gray-500">
            Manage your content and track performance
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
              <Dropdown
                options={Object.values(Category).map((cat) => ({
                  label: cat.replace(/_/g, " "),
                  value: cat,
                }))}
                value={category}
                onChange={(value) => updateFilters({ category: value })}
                placeholder="All Categories"
                allLabel="All Categories"
              />

              <Dropdown
              options={[
                { label: "Oldest", value: "asc" },
              ]}
              value={sort}
              onChange={(value) => updateFilters({ sort: value })}
              placeholder="Newest"
              allLabel="Newest"
              />
          </div>
        </div>

        <div className="flex items-center overflow-x-auto no-scrollbar py-1 flex-wrap">
          {["", "PUBLIC", "PRIVATE", "FOLLOWERS", "DRAFT"].map((type) => {
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

      {/* 3. Content Rendering */}
      {posts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-12 text-center">
          <FileText className="w-10 h-10 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold">No snippets found</h3>
          <p className="text-gray-600 mb-6">
            Start sharing your snippets with the community.
          </p>
          <Button onClick={() => router.push("/create-post")}>
            <Plus className="w-4 h-4 mr-1" /> Create Snippet
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

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between pt-8 border-t">
          <p className="text-sm text-gray-600">
            Page {pagination.currentPage} of {pagination.totalPages}
          </p>
          <div className="flex items-center gap-2">
            <Button
              onClick={() =>
                updateFilters({ page: (pagination.currentPage - 1).toString() })
              }
              disabled={!pagination.hasPrevPage || isPending}
              variant="outline"
              size="sm"
            >
              <ChevronLeft size={16} />
            </Button>
            <Button
              onClick={() =>
                updateFilters({ page: (pagination.currentPage + 1).toString() })
              }
              disabled={!pagination.hasNextPage || isPending}
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

const StatCard = ({ value, label, icon, color, bg }: any) => (
  <div className="bg-white p-4 rounded-2xl border border-gray-100 flex items-center gap-4 transition-all hover:border-indigo-100">
    <div className={`p-2.5 ${bg} ${color} rounded-xl`}>{icon}</div>
    <div>
      <p className="text-xl font-bold text-gray-900 tabular-nums">{value}</p>
      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
        {label}
      </p>
    </div>
  </div>
);

export default MyPostComponent;
