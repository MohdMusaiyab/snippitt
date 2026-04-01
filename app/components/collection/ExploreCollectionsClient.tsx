"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Search, Loader2, FolderOpen, X, Layers } from "lucide-react";
import { useInView } from "react-intersection-observer";
import { getExploreCollections } from "@/actions/collection/exploreCollections";
import { useDebounce } from "@/hooks/use-debounce";
import { Collections as CollectionCard } from "@/app/components/collection/Collection";

const ExploreCollectionsClient = ({ initialData, currentUserId }: { initialData: any[], currentUserId: string | null }) => {
  const [items, setItems] = useState(initialData);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [hasMore, setHasMore] = useState(initialData.length === 12);
  const [isLoading, setIsLoading] = useState(false);

  const debouncedSearch = useDebounce(search, 500);
  const { ref, inView } = useInView();
  const isFirstRender = useRef(true);

  const handleSearchChange = (val: string) => {
    setSearchInput(val);
    setSearch(val);
  };

  const handleSearch = useCallback(async (query: string) => {
    setIsLoading(true);
    try {
      const res = await getExploreCollections(0, query);
      if (res.success) {
        setItems(res.data);
        setPage(1);
        setHasMore(res.hasMore || false);
      }
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
      setItems(initialData);
      setPage(1);
      setHasMore(initialData.length === 12);
      return;
    }
    handleSearch(debouncedSearch);
  }, [debouncedSearch, handleSearch, initialData]);

  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore) return;
    setIsLoading(true);
    const res = await getExploreCollections(page, debouncedSearch);
    if (res.success && res.data.length > 0) {
      setItems((prev) => [...prev, ...res.data]);
      setPage((p) => p + 1);
      setHasMore(res.hasMore || false);
    } else {
      setHasMore(false);
    }
    setIsLoading(false);
  }, [page, debouncedSearch, isLoading, hasMore]);

  useEffect(() => {
    if (inView && hasMore && !isLoading) loadMore();
  }, [inView, hasMore, isLoading, loadMore]);

  const hasActiveFilters = !!searchInput;

  const clearFilters = () => {
    setSearchInput("");
    setSearch("");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Header */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900">
              Explore Collections
            </h1>
          </div>
          <p className="text-sm text-gray-400">
            Discover collections from the community
          </p>
        </div>

        {/* Search bar */}
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
            <button
              onClick={clearFilters}
              className="text-xs font-medium text-gray-400 hover:text-red-500 transition-colors ml-auto"
            >
              Clear all
            </button>
          </div>
        )}

        {/* Grid */}
        {isLoading && items.length === 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm animate-pulse"
              >
                <div className="h-40 bg-gray-100 w-full" />
                <div className="p-4 space-y-2.5">
                  <div className="h-4 bg-gray-100 rounded w-2/3" />
                  <div className="h-3 bg-gray-100 rounded w-full" />
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : items.length > 0 ? (
          <CollectionCard collections={items} variant="grid" currentUserId={currentUserId} />
        ) : (
          <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-16 text-center space-y-3">
            <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto">
              <FolderOpen size={22} className="text-gray-300" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-700">
                No collections found
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                {searchInput
                  ? `No results for "${searchInput}"`
                  : "Check back later for new collections"}
              </p>
            </div>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
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
          {isLoading && items.length > 0 && (
            <Loader2 size={18} className="animate-spin text-gray-300" />
          )}
          {!hasMore && items.length > 0 && (
            <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">
              End of results
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExploreCollectionsClient;
