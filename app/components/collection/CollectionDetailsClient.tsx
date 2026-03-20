"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Edit2,
  Ellipsis,
  Plus,
  Globe,
  Lock,
  Users,
  Calendar,
  ImageIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { format } from "date-fns";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import Snippet from "@/app/components/general/Snippitt";
import Link from "next/link";
import DeleteCollectionButton from "./DeleteCollectionButton";
import ShareActionButton from "../general/ShareActionButton";
import Button from "../Button";
import { env } from "@/lib/env";

const VisibilityBadge = ({ visibility }: { visibility: string }) => {
  const map: Record<
    string,
    { icon: React.ReactNode; label: string; cls: string }
  > = {
    PUBLIC: {
      icon: <Globe size={10} />,
      label: "Public",
      cls: "bg-emerald-50 text-emerald-600 border-emerald-100",
    },
    PRIVATE: {
      icon: <Lock size={10} />,
      label: "Private",
      cls: "bg-gray-100 text-gray-500 border-gray-200",
    },
    FOLLOWERS: {
      icon: <Users size={10} />,
      label: "Followers",
      cls: "bg-indigo-50 text-indigo-600 border-indigo-100",
    },
  };
  const v = map[visibility] ?? map.PRIVATE;
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider ${v.cls}`}
    >
      {v.icon}
      {v.label}
    </span>
  );
};

const CollectionDetailsClient = ({
  collection,
  snippets,
  currentUserId,
  isOwner,
  pagination = { currentPage: 1, pages: 1, total: 0 },
}: any) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showActions, setShowAction] = useState(false);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const formattedDate = format(new Date(collection.createdAt), "MMM dd, yyyy");
  const actionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (actionRef.current && !actionRef.current.contains(e.target as Node))
        setShowAction(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Collection header card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Cover image or gradient banner */}
          <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-gray-100">
            <Link
              href={`/profile/${collection.user.id}`}
              className="flex items-center gap-3 group"
            >
              <div className="relative h-9 w-9 rounded-full overflow-hidden border border-gray-100 bg-gray-50 flex-shrink-0 group-hover:ring-2 group-hover:ring-indigo-500 group-hover:ring-offset-1 transition-all">
                {collection.user.avatar ? (
                  <Image
                    src={collection.user.avatar}
                    alt={collection.user.username}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="h-full w-full bg-indigo-50 flex items-center justify-center font-bold text-indigo-600 text-sm">
                    {collection.user.username[0].toUpperCase()}
                  </div>
                )}
              </div>
              <div>
                <p className="text-sm font-bold text-gray-800 group-hover:text-indigo-600 transition-colors">
                  @{collection.user.username}
                </p>
                <p className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5">
                  <Calendar size={9} />
                  {formattedDate || "—"}
                </p>
              </div>
            </Link>

            {/* Actions menu */}
            <div className="relative" ref={actionRef}>
              <button
                onClick={() => setShowAction((o) => !o)}
                className="w-8 h-8 rounded-xl bg-gray-50 hover:bg-gray-100 flex items-center justify-center transition-all"
              >
                <Ellipsis size={16} className="text-gray-500" />
              </button>
              {showActions && (
                <div
                  className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-20"
                  onClick={(e) => e.stopPropagation()}
                >
                  {isOwner && (
                    <>
                      <Link
                        href={`/collections/${collection.id}/edit`}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition"
                      >
                        <Edit2 size={14} className="mr-2" /> Edit
                      </Link>
                      <DeleteCollectionButton collectionId={collection.id} />
                    </>
                  )}
                  <ShareActionButton
                    id={collection.id}
                    title={collection.name}
                    url={`${env.NEXT_PUBLIC_APP_URL}/collections/${collection.id}`}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Info section */}
          <div className="px-5 py-4 space-y-3 border-b border-gray-100">
            <div className="flex items-center gap-2 flex-wrap">
              <VisibilityBadge visibility={collection.visibility} />
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-gray-900 leading-snug">
              {collection.name}
            </h1>
            {collection.description && (
              <p className="text-sm text-gray-500 leading-relaxed">
                {collection.description}
              </p>
            )}
          </div>

          {/* Stats row */}
          <div className="px-5 sm:px-8 py-3.5 flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-extrabold text-gray-900 tabular-nums">
                {snippets.length}
              </span>
              <span className="text-xs font-medium text-gray-400">
                {snippets.length === 1 ? "snippet" : "snippets"}
              </span>
            </div>
          </div>
        </div>

        {/* Snippets grid */}
        {snippets.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {snippets.map((post: any) => (
              <Snippet
                key={post.id}
                post={post}
                currentUserId={currentUserId}
                showActions={true}
                menuOpen={menuOpen}
                toggleMenu={setMenuOpen}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-16 text-center space-y-3">
            <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto">
              <ImageIcon size={22} className="text-gray-300" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-700">No snippets yet</p>
              {isOwner && (
                <>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Start exploring and add some snippets to this collection.
                  </p>
                  <Link href="/explore/posts" className="inline-block mt-4">
                    <Button variant="primary" size="md">
                      <Plus className="w-4 h-4 mr-1" /> Explore Snippets
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-500 font-medium">
              Page{" "}
              <span className="text-gray-900 font-bold">
                {pagination.currentPage}
              </span>{" "}
              of{" "}
              <span className="text-gray-900 font-bold">
                {pagination.pages}
              </span>
            </p>

            <div className="flex items-center gap-2">
              <Button
                onClick={() => {
                  const params = new URLSearchParams(searchParams.toString());
                  params.set("page", (pagination.currentPage - 1).toString());
                  router.push(`?${params.toString()}`);
                }}
                disabled={pagination.currentPage === 1}
                variant="outline"
                size="sm"
                className="rounded-xl"
              >
                <ChevronLeft size={16} />
              </Button>

              <Button
                onClick={() => {
                  const params = new URLSearchParams(searchParams.toString());
                  params.set("page", (pagination.currentPage + 1).toString());
                  router.push(`?${params.toString()}`);
                }}
                disabled={pagination.currentPage === pagination.pages}
                variant="outline"
                size="sm"
                className="rounded-xl"
              >
                <ChevronRight size={16} />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CollectionDetailsClient;
