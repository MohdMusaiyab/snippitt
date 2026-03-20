"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Collection } from "@/types";
import {
  FileText,
  ChevronRight,
  Folder,
  Edit,
  Ellipsis,
  Clock,
} from "lucide-react";
import { VisibilityTag } from "../general/VisibilityTags";
import DeleteCollectionButton from "./DeleteCollectionButton";
import ShareActionButton from "../general/ShareActionButton";
import { env } from "@/lib/env";

const DEFAULT_COVER_IMAGE = "/assets/defaultcollectioncover.svg";

function getTimeAgo(date: string | Date): string {
  const inputDate = new Date(date);
  if (isNaN(inputDate.getTime())) return "";
  const seconds = Math.floor((Date.now() - inputDate.getTime()) / 1000);

  if (seconds < 5) return "Just now";
  if (seconds < 60) return `${seconds}s`;

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;

  const days = Math.floor(hours / 24);
  return days < 7 ? `${days}d` : inputDate.toLocaleDateString();
}

interface CollectionsProps {
  collections: Collection[];
  variant?: "grid" | "list";
  isOwner?: boolean;
  showActions?: boolean;
}

export const Collections = ({
  collections,
  variant = "grid",
  isOwner = false,
  showActions = true,
}: CollectionsProps) => {
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  const toggleMenu = (id: string) => {
    setMenuOpen((prev) => (prev === id ? null : id));
  };

  if (!collections?.length) {
    return (
      <div className="rounded-xl border border-gray-200 bg-gray-50 p-16 text-center">
        <Folder className="mx-auto mb-4 text-gray-300" size={40} />
        <h3 className="text-lg font-semibold text-gray-900 mb-1">
          No Collections Yet
        </h3>
        <p className="text-sm text-gray-500 mb-6">
          Start organizing your snippets by creating your first collection.
        </p>

        <Link
          href="/collections/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-full text-sm font-semibold hover:bg-primary/90 transition"
        >
          Create Collection
          <ChevronRight size={16} />
        </Link>
      </div>
    );
  }

  return (
    <div
      className={
        variant === "grid"
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          : "flex flex-col gap-4"
      }
    >
      {collections.map((collection) => {
        const postCount = collection._count?.posts ?? 0;
        const timeLabel = getTimeAgo(collection.createdAt);

        if (variant === "grid") {
          return (
            <div
              key={collection.id}
              className="group bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md overflow-hidden transition-shadow cursor-pointer"
              onClick={() =>
                window.open(`/collections/${collection.id}`, "_blank")
              }
            >
              {/* Cover */}
              <div className="relative w-full aspect-[16/9]">
                <Image
                  src={collection.coverImage || DEFAULT_COVER_IMAGE}
                  alt={collection.name}
                  fill
                  className="object-cover"
                  unoptimized
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />

                {/* Top Right Menu */}
                {showActions && (
                  <div className="absolute top-3 right-3 z-10 transition">
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleMenu(collection.id);
                        }}
                        className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white hover:shadow-md"
                      >
                        <Ellipsis size={18} color="#4b5563" />
                      </button>

                      {menuOpen === collection.id && (
                        <div
                          className="absolute right-0 mt-2 w-44 bg-white rounded-lg shadow-lg border border-gray-200 z-30 py-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {isOwner && (
                            <>
                              <Link
                                href={`/collections/${collection.id}/edit`}
                                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-primary/10 hover:text-primary"
                              >
                                <Edit size={16} className="mr-2" />
                                Edit
                              </Link>

                              <DeleteCollectionButton
                                collectionId={collection.id}
                              />
                            </>
                          )}

                          <ShareActionButton
                            id={collection.id}
                            title={collection.name}
                            url={`${env.NEXT_PUBLIC_APP_URL}/posts/${collection.id}`}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-5">
                {/* User */}
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <div className="relative w-8 h-8 rounded-full overflow-hidden border border-gray-100 bg-gray-50">
                      {collection.user?.avatar ? (
                        <Image
                          src={collection.user.avatar}
                          alt={collection.user.username}
                          fill
                          unoptimized
                          className="object-cover"
                        />
                      ) : (
                        <span className="bg-indigo-50 w-full h-full flex items-center justify-center text-sm font-bold text-indigo-600">
                          {collection.user?.username?.[0]?.toUpperCase()}
                        </span>
                      )}
                    </div>

                    <Link
                      href={`/profile/${collection.user.id}`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <p className="text-sm font-medium text-gray-700 hover:text-indigo-600 transition">
                        {collection.user.username}
                      </p>
                    </Link>
                  </div>

                  <div className="flex items-center text-[11px] text-gray-400 gap-1">
                    <Clock size={12} />
                    {timeLabel}
                  </div>
                </div>

                {/* Title */}
                <h3 className="font-bold text-gray-900 mb-1 hover:text-primary transition line-clamp-1">
                  {collection.name}
                </h3>

                {/* Description */}
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {collection.description || "No description provided."}
                </p>

                {/* Footer */}
                <div className="flex items-center justify-between">
                  <VisibilityTag visibility={collection.visibility} />

                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <FileText size={16} />
                    <span className="text-xs">{postCount}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        }

        // LIST VARIANT

        return (
          <Link
            key={collection.id}
            href={`/collections/${collection.id}`}
            className="flex items-center gap-5 rounded-xl border border-gray-200 bg-white p-4 hover:shadow-md transition"
          >
            <div className="relative h-20 w-20 rounded-lg overflow-hidden">
              <Image
                src={collection.coverImage || DEFAULT_COVER_IMAGE}
                alt={collection.name}
                fill
                className="object-cover"
                unoptimized
              />
            </div>

            <div className="flex-1 min-w-0">
              <h4 className="text-base font-semibold text-gray-900 truncate">
                {collection.name}
              </h4>

              <p className="text-sm text-gray-500 truncate">
                {collection.description || "No description"}
              </p>

              <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                <VisibilityTag visibility={collection.visibility} />
                <span>{timeLabel}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-gray-500">
              <FileText size={16} />
              <span className="text-sm">{postCount}</span>
              <ChevronRight size={18} />
            </div>
          </Link>
        );
      })}
    </div>
  );
};
