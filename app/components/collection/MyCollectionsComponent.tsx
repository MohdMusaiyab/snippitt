"use client";

import { useState, useTransition } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Collections } from "@/app/components/collection/Collection";
import { FolderHeart, ChevronLeft, ChevronRight } from "lucide-react";
import Button from "@/app/components/Button";

interface MyCollectionsComponentProps {
  initialData: any;
  filters: { currentPage: number; visibility: string };
}

const MyCollectionsComponent = ({ initialData, filters }: MyCollectionsComponentProps) => {
  const { visibility } = filters;
  const searchParams = useSearchParams();
  const router = useRouter();

  const [isPending, startTransition] = useTransition();
  const collections = initialData?.collections || [];
  const pagination = initialData?.pagination || { currentPage: 1, pages: 0, total: 0 };
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
    <div className={`max-w-7xl mx-auto px-6 py-10 space-y-10 transition-opacity ${isPending ? "opacity-60" : "opacity-100"}`}>

      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900">
            My Collections
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Organize and manage your saved snippets
          </p>
        </div>
      </header>

      {/* Visibility Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        {["", "PUBLIC", "PRIVATE", "FOLLOWERS", "DRAFT"].map((type) => (
          <button
            key={type || "ALL"}
            onClick={() => updateFilters({ visibility: type || null })}
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

      {/* Content */}
      {collections.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-primary/50 p-12 text-center">
          <FolderHeart className="w-10 h-10 text-gray-400 mx-auto mb-4" />

          <h3 className="text-xl font-semibold">No collections yet</h3>

          <p className="text-gray-600 m-2">
            Create collections to organize your favorite snippets.
          </p>

          <Button
          variant="primary" size="md">
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
              onClick={() => updateFilters({ page: (pagination.currentPage - 1).toString() })}
              disabled={pagination.currentPage === 1}
              variant="outline"
              size="sm"
            >
              <ChevronLeft size={16} />
            </Button>

            <Button
              onClick={() => updateFilters({ page: (pagination.currentPage + 1).toString() })}
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