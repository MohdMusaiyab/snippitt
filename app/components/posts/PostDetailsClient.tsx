"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import {
  Calendar,
  MessageCircle,
  Ellipsis,
  Edit2,
  Globe,
  Lock,
  Users,
  Hash,
  Maximize2,
  X,
  ChevronLeft,
  ChevronRight,
  Video,
  Image as ImageIcon,
  RefreshCw,
  Loader2,
} from "lucide-react";

import LikeButton from "@/app/components/general/LikeButton";
import ToggleSaveButton from "@/app/components/general/ToggleSaveButton";
import CommentSection from "../comment/CommentSection";
import AddCollectionButton from "../general/AddCollectionButton";
import DeleteSnippitButton from "../general/DeleteSnippitButton";
import ShareActionButton from "../general/ShareActionButton";
import { env } from "@/lib/env";

const DEFAULT_IMAGE = "/assets/default.svg";

/** Returns a valid img src — falls back to default for null, undefined, or empty string. */
const safeSrc = (url: string | null | undefined) =>
  url && url.trim() !== "" ? url : DEFAULT_IMAGE;

/** Detects if URL is a video based on file extension (ignores query params) */
const isVideoUrl = (url: string | null | undefined): boolean => {
  if (!url) return false;
  const cleanUrl = url.split("?")[0];
  return /\.(mp4|webm|avi|mov|mkv|flv)$/i.test(cleanUrl);
};

/** Detects if URL is an image based on file extension */
const isImageUrl = (url: string | null | undefined): boolean => {
  if (!url) return false;
  const cleanUrl = url.split("?")[0];
  return /\.(jpg|jpeg|png|gif|webp|svg|bmp)$/i.test(cleanUrl);
};

/* Visibility badge */
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
    DRAFT: {
      icon: <Edit2 size={10} />,
      label: "Draft",
      cls: "bg-yellow-50 text-yellow-600 border-yellow-100",
    },
  };
  const v = map[visibility] ?? map.PRIVATE;
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider ${v.cls}`}
    >
      {v.icon}
      {v.label}
    </span>
  );
};

/* Video component with loading state and fallback */
const VideoPlayer = ({
  src,
  className,
}: {
  src: string;
  className?: string;
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  if (hasError || !src) {
    return (
      <div
        className={`${className} bg-gray-100 flex flex-col items-center justify-center gap-2`}
      >
        <Video size={24} className="text-gray-400" />
        <p className="text-xs text-gray-500">Video unavailable</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      {isLoading && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center z-10">
          <Loader2 size={24} className="animate-spin text-gray-400" />
        </div>
      )}
      <video
        src={src}
        muted
        preload="metadata"
        className={`${className} ${isLoading ? "opacity-0" : "opacity-100"} transition-opacity duration-200`}
        onLoadedData={() => setIsLoading(false)}
        onError={() => {
          setHasError(true);
          setIsLoading(false);
        }}
      />
    </div>
  );
};

/* Media item with proper video/image handling */
const MediaItem = ({
  img,
  idx,
  onExpand,
}: {
  img: any;
  idx: number;
  onExpand: (idx: number) => void;
}) => {
  const isVideo = isVideoUrl(img.url);
  const [imgError, setImgError] = useState(false);

  const handleExpand = () => {
    if (!img.url) return;
    onExpand(idx);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div
        onClick={handleExpand}
        className={`relative w-full overflow-hidden bg-gray-50 ${
          img.url ? "cursor-zoom-in group" : "cursor-default"
        }`}
      >
        {!img.url ? (
          // No URL fallback
          <div className="w-full h-56 sm:h-72 bg-gray-100 flex flex-col items-center justify-center gap-2">
            <ImageIcon size={32} className="text-gray-300" />
            <p className="text-sm text-gray-400">No media available</p>
          </div>
        ) : isVideo ? (
          // Video with loading state
          <VideoPlayer
            src={img.url}
            className="w-full h-56 sm:h-72 object-cover"
          />
        ) : (
          // Image with error fallback
          <Image
            src={imgError ? DEFAULT_IMAGE : safeSrc(img.url)}
            alt={img.description || `Media ${idx + 1}`}
            width={1200}
            height={800}
            className="w-full h-56 sm:h-72 object-cover transition-transform duration-200 group-hover:scale-105"
            priority={idx === 0}
            unoptimized
            onError={() => setImgError(true)}
          />
        )}

        {/* Overlay elements - only show if URL exists */}
        {img.url && (
          <>
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-200 flex items-end justify-end p-3">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 backdrop-blur-sm rounded-xl p-2">
                <Maximize2 size={14} className="text-white" />
              </div>
            </div>
            {isVideo && (
              <div className="absolute top-3 left-3 bg-black/50 backdrop-blur-sm rounded-lg px-2 py-1 flex items-center gap-1.5">
                <Video size={11} className="text-white" />
                <span className="text-[10px] font-bold text-white uppercase tracking-wide">
                  Video
                </span>
              </div>
            )}
            <div className="absolute top-3 right-3 bg-black/40 backdrop-blur-sm rounded-lg px-2 py-1">
              <span className="text-[10px] font-bold text-white/80 tabular-nums">
                {idx + 1}
              </span>
            </div>
          </>
        )}
      </div>

      {img.description ? (
        <div className="px-4 py-3.5">
          <p className="text-sm text-gray-600 leading-relaxed">
            {img.description}
          </p>
        </div>
      ) : (
        <div className="px-4 py-3 border-t border-gray-50">
          <p className="text-xs text-gray-300 italic">No description</p>
        </div>
      )}
    </div>
  );
};

/* Preview Modal with fixed keyboard handler and proper cleanup */
const PreviewModal = ({
  images,
  initialIndex,
  onClose,
}: {
  images: any[];
  initialIndex: number;
  onClose: () => void;
}) => {
  const [current, setCurrent] = useState(initialIndex);
  const [error, setError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [videoError, setVideoError] = useState(false);

  // Stable callbacks with useCallback
  const prev = useCallback(() => {
    setError(false);
    setVideoError(false);
    setIsLoading(true);
    setCurrent((i) => (i - 1 + images.length) % images.length);
  }, [images.length]);

  const next = useCallback(() => {
    setError(false);
    setVideoError(false);
    setIsLoading(true);
    setCurrent((i) => (i + 1) % images.length);
  }, [images.length]);

  // Reset states when current changes
  useEffect(() => {
    setError(false);
    setVideoError(false);
    setIsLoading(true);
  }, [current]);

  // Fixed keyboard event listener with proper cleanup and stable dependencies
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowLeft") {
        prev();
      } else if (e.key === "ArrowRight") {
        next();
      }
    };

    window.addEventListener("keydown", handler);
    return () => {
      window.removeEventListener("keydown", handler);
    };
  }, [onClose, prev, next]); // Dependencies are now stable

  const img = images[current];
  const isVideo = isVideoUrl(img?.url);
  const hasValidUrl = img?.url && img.url.trim() !== "";

  const handleMediaLoad = () => {
    setIsLoading(false);
  };

  const handleMediaError = () => {
    if (isVideo) {
      setVideoError(true);
    } else {
      setError(true);
    }
    setIsLoading(false);
  };

  const handleRetry = () => {
    setError(false);
    setVideoError(false);
    setIsLoading(true);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="relative max-w-5xl w-full flex flex-col gap-3"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center justify-start gap-3">
            <span className="text-xs font-medium text-white/50 tabular-nums whitespace-nowrap">
              {current + 1} / {images.length}
            </span>
            {img?.description && (
              <p className="text-xs text-white/60 truncate max-w-xs">
                {img.description}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all"
            aria-label="Close"
          >
            <X size={15} />
          </button>
        </div>

        {/* Main content */}
        <div className="rounded-2xl overflow-hidden bg-black flex items-center justify-center min-h-[300px] relative">
          {/* Loading state */}
          {isLoading && hasValidUrl && !error && !videoError && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
              <Loader2 size={32} className="animate-spin text-white" />
            </div>
          )}

          {/* Error state */}
          {error || videoError || !hasValidUrl ? (
            <div className="p-10 text-center space-y-3">
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mx-auto">
                <ImageIcon size={22} className="text-white/40" />
              </div>
              <p className="text-sm font-bold text-white/70">
                {!hasValidUrl ? "No media available" : "Failed to load preview"}
              </p>
              {hasValidUrl && (
                <button
                  onClick={handleRetry}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-white/50 hover:text-white/80 bg-white/10 hover:bg-white/15 px-3 py-1.5 rounded-lg transition-all"
                >
                  <RefreshCw size={11} /> Try again
                </button>
              )}
            </div>
          ) : isVideo ? (
            <video
              src={img.url}
              controls
              autoPlay
              className="max-h-[80vh] w-full"
              onLoadedData={handleMediaLoad}
              onError={handleMediaError}
            />
          ) : (
            <img
              src={safeSrc(img.url)}
              alt={img?.description || ""}
              className="max-h-[80vh] w-auto object-contain"
              onLoad={handleMediaLoad}
              onError={handleMediaError}
            />
          )}

          {/* Navigation arrows */}
          {images.length > 1 &&
            !isLoading &&
            !error &&
            !videoError &&
            hasValidUrl && (
              <>
                <button
                  onClick={prev}
                  className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-black/40 hover:bg-black/60 text-white transition-all backdrop-blur-sm"
                  aria-label="Previous"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  onClick={next}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-black/40 hover:bg-black/60 text-white transition-all backdrop-blur-sm"
                  aria-label="Next"
                >
                  <ChevronRight size={18} />
                </button>
              </>
            )}
        </div>

        {/* Thumbnails */}
        {images.length > 1 && !error && (
          <div className="flex gap-2 overflow-x-auto pb-1 justify-center">
            {images.map((im, i) => {
              const isCurrentVideo = isVideoUrl(im.url);
              return (
                <button
                  key={im.id || i}
                  onClick={() => {
                    setError(false);
                    setVideoError(false);
                    setIsLoading(true);
                    setCurrent(i);
                  }}
                  className={`relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all ${
                    i === current
                      ? "border-white"
                      : "border-transparent opacity-50 hover:opacity-80"
                  }`}
                >
                  {isCurrentVideo ? (
                    <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                      <Video size={14} className="text-white/60" />
                    </div>
                  ) : (
                    <img
                      src={safeSrc(im.url)}
                      alt=""
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = DEFAULT_IMAGE;
                      }}
                      className="w-full h-full object-cover"
                    />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

const PostDetailClient = ({ post, currentUserId }: any) => {
  const router = useRouter();
  const [commentCount, setCommentCount] = useState<number>(
    post._count.comments || 0,
  );
  const [formattedDate, setFormattedDate] = useState<string>("");
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const isOwner = currentUserId === post.user.id;

  // Format date on mount and when post.createdAt changes
  useEffect(() => {
    if (post.createdAt) {
      const date = format(new Date(post.createdAt), "MMM dd, yyyy");
      setFormattedDate(date);
    }
  }, [post.createdAt]);

  // Fixed click outside handler with proper cleanup
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handler);
    return () => {
      document.removeEventListener("mousedown", handler);
    };
  }, []); // Empty dependency array - only set up once

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
          {/* Post info header */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            {/* Author row */}
            <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-gray-100">
              <Link
                href={`/profile/${post.user.id}`}
                className="flex items-center gap-3 group"
              >
                <div className="relative h-9 w-9 rounded-full overflow-hidden border border-gray-100 bg-gray-50 flex-shrink-0 group-hover:ring-2 group-hover:ring-indigo-500 group-hover:ring-offset-1 transition-all">
                  {post.user.avatar ? (
                    <Image
                      src={post.user.avatar}
                      alt={post.user.username}
                      fill
                      className="object-cover"
                      unoptimized
                      onError={(e) => {
                        // Hide broken image, show fallback
                        const target = e.target as HTMLImageElement;
                        target.style.display = "none";
                        const parent = target.parentElement;
                        if (
                          parent &&
                          !parent.querySelector(".avatar-fallback")
                        ) {
                          const fallback = document.createElement("div");
                          fallback.className =
                            "avatar-fallback h-full w-full bg-indigo-50 flex items-center justify-center font-bold text-indigo-600 text-sm";
                          fallback.textContent =
                            post.user.username[0].toUpperCase();
                          parent.appendChild(fallback);
                        }
                      }}
                    />
                  ) : (
                    <div className="h-full w-full bg-indigo-50 flex items-center justify-center font-bold text-indigo-600 text-sm">
                      {post.user.username[0].toUpperCase()}
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-800 group-hover:text-indigo-600 transition-colors">
                    @{post.user.username}
                  </p>
                  <p className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5">
                    <Calendar size={9} />
                    {formattedDate || "—"}
                  </p>
                </div>
              </Link>

              {/* Actions menu */}
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setMenuOpen((o) => !o)}
                  className="w-8 h-8 rounded-xl bg-gray-50 hover:bg-gray-100 flex items-center justify-center transition-all"
                  aria-label="More options"
                >
                  <Ellipsis size={16} className="text-gray-500" />
                </button>
                {menuOpen && (
                  <div
                    className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-20"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <AddCollectionButton
                      postId={post.id}
                      userId={post.user.id}
                    />
                    {isOwner && (
                      <>
                        <Link
                          href={`/posts/${post.id}/edit`}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition"
                        >
                          <Edit2 size={14} className="mr-2" /> Edit
                        </Link>
                        <DeleteSnippitButton postId={post.id} />
                      </>
                    )}
                    {!post.isDraft && (
                      <ShareActionButton
                        id={post.id}
                        title={post.title}
                        url={`${env.NEXT_PUBLIC_APP_URL}/posts/${post.id}`}
                      />
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Title, category, visibility, description, tags */}
            <div className="px-5 py-4 space-y-3 border-b border-gray-100">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-500 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100">
                  {post.category}
                </span>
                <VisibilityBadge visibility={post.visibility} />
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-gray-900 leading-snug">
                {post.title}
              </h1>
              {post.description && (
                <p className="text-sm text-gray-500 leading-relaxed">
                  {post.description}
                </p>
              )}
            </div>

            {/* Tags + interaction bar */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-5 py-3.5">
              {post.tags?.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {post.tags.map((tag: string) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 text-sm font-medium text-gray-500 bg-gray-100 hover:bg-gray-200 px-2.5 py-1 rounded-lg transition-colors cursor-default"
                    >
                      <Hash size={9} className="opacity-50" />
                      {tag}
                    </span>
                  ))}
                </div>
              ) : (
                <div />
              )}

              {/* Interactions */}
              <div className="flex items-center gap-3 flex-shrink-0">
                <LikeButton
                  postId={post.id}
                  initialIsLiked={post.isLiked}
                  initialLikeCount={post._count.likes}
                />
                <Link
                  href={`/posts/${post.id}#comments`}
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-1"
                >
                  <MessageCircle
                    size={18}
                    strokeWidth={2}
                    className="stroke-gray-500 hover:stroke-indigo-600 transition"
                  />
                  <span className="text-xs tabular-nums text-gray-500">
                    {commentCount}
                  </span>
                </Link>
                <ToggleSaveButton
                  postId={post.id}
                  initialIsSaved={post.isSaved}
                  initialSaveCount={post._count.savedBy}
                />
              </div>
            </div>
          </div>

          {/* 2-col grid: media + comments */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Media */}
            <div className="lg:col-span-7 order-first lg:order-first space-y-4">
              {post.images.length > 0 ? (
                post.images.map((img: any, idx: number) => (
                  <MediaItem
                    key={img.id || idx}
                    img={img}
                    idx={idx}
                    onExpand={(i) => setPreviewIndex(i)}
                  />
                ))
              ) : (
                <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-16 text-center">
                  <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <ImageIcon size={22} className="text-gray-300" />
                  </div>
                  <p className="text-sm font-bold text-gray-400">
                    No media attached
                  </p>
                </div>
              )}
            </div>

            {/* Comments */}
            <div className="lg:col-span-5 order-last lg:order-last">
              <div className="lg:sticky lg:top-6">
                <div
                  id="comments"
                  className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden"
                >
                  <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100">
                    <MessageCircle size={14} className="text-gray-400" />
                    <span className="text-sm font-bold text-gray-800">
                      Comments
                    </span>
                    <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full ml-auto">
                      {commentCount}
                    </span>
                  </div>
                  <div className="p-5">
                    <CommentSection
                      postId={post.id}
                      postOwnerId={post.user.id}
                      currentUserId={currentUserId}
                      onCountChange={(delta: number) =>
                        setCommentCount((prev) => prev + delta)
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {previewIndex !== null && (
        <PreviewModal
          images={post.images}
          initialIndex={previewIndex}
          onClose={() => setPreviewIndex(null)}
        />
      )}
    </>
  );
};

export default PostDetailClient;
