import Link from "next/link";
import Image from "next/image";
import { Post } from "@/schemas/post";
import { Visibility } from "@/schemas/post";
import { VisibilityTag } from "./VisibilityTags";
import { Edit, Trash, Share, MessageCircle, Ellipsis } from "lucide-react";
import LikeButton from "./LikeButton";
import AddCollectionButton from "./AddCollectionButton";
import ToggleSaveButton from "./ToggleSaveButton";

const DEFAULT_COVER_IMAGE = "/assets/default.svg";

interface SnippetProps {
  post: Post;
  menuOpen: string | null;
  toggleMenu: (id: string) => void;
  showActions?: boolean;
  currentUserId?: string;
  variant?: "default" | "compact";
}

const Snippet = ({
  post,
  menuOpen,
  toggleMenu,
  showActions = true,
  currentUserId,
  variant = "default",
}: SnippetProps) => {
  function timeAgo(date: string | Date): string {
    const inputDate = new Date(date);
    if (isNaN(inputDate.getTime())) return "";

    const now = new Date().getTime();

    const seconds = Math.floor((now - inputDate.getTime()) / 1000);
    if (seconds < 5) return "Just now";
    if (seconds < 60) return `${seconds}s`;

    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;

    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d`;

    const weeks = Math.floor(days / 7);
    if (weeks < 4) return `${weeks}w`;

    const months = Math.floor(days / 30);
    if (months < 12) return `${months}mo`;

    const years = Math.floor(days / 365);
    return `${years}y`;
  }

  const handleCardClick = () => {
    const link = post.linkTo || `/posts/${post.id}`;
    window.open(link, "_blank");
  };

  const isCurrentUsersPost = currentUserId === post.user.id;

  if (variant === "compact") {
    return (
      <div
        className="relative bg-white border border-gray-100 rounded-xl 
hover:border-gray-200 hover:shadow-sm transition-all cursor-pointer 
flex flex-col sm:flex-row gap-4 p-4 group"
        onClick={handleCardClick}
      >
        {/* Top-right menu button */}
        {showActions && (
          <div
            className="absolute top-3 right-3 z-20"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative">
              <button
                onClick={() => toggleMenu(post.id)}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 transition"
              >
                <Ellipsis size={16} className="text-gray-500" />
              </button>

              {menuOpen === post.id && (
                <div className="absolute right-0 mt-2 w-44 bg-white rounded-lg shadow-lg border border-gray-200 py-1">
                  <AddCollectionButton postId={post.id} userId={post.user.id} />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Thumbnail */}
        <div className="relative w-full sm:w-36 h-48 sm:h-24 rounded-lg overflow-hidden flex-shrink-0">
          <Image
            src={post.coverImage || DEFAULT_COVER_IMAGE}
            alt="Cover"
            fill
            className="object-cover"
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 flex flex-col justify-between sm:pr-8">
          {/* Title + Description */}
          <div>
            <Link href={`/posts/${post.id}`} className="font-semibold text-gray-900 truncate group-hover:text-primary transition">
              {post.title}
            </Link>

            <p className="text-sm text-gray-500 line-clamp-2 mt-1">
              {post.description}
            </p>
          </div>

          {/* Engagement Row */}
          <div
            className="flex items-center justify-between mt-3 text-xs text-gray-500"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Left side: meta */}
            <span>{timeAgo(post.createdAt)}</span>

            {/* Right side: stats */}
            <div className="flex items-center gap-2">
              {/* Like */}
              <LikeButton
                postId={post.id}
                initialIsLiked={post.isLiked}
                initialLikeCount={post._count.likes}
              />

              {/* Comments */}
              <div className="flex items-center">
                <div className="w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center transition hover:bg-white hover:shadow-md">
                  <MessageCircle
                    size={18}
                    strokeWidth={2}
                    className="stroke-gray-500 hover:stroke-primary transition"
                  />
                </div>

                <span className="text-xs tabular-nums text-gray-500">
                  {post._count.comments}
                </span>
              </div>

              {/* Saved */}
              <ToggleSaveButton
                postId={post.id}
                initialIsSaved={post.isSaved}
                initialSaveCount={post._count.savedBy}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      key={post.id}
      className="group bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md overflow-hidden transition-shadow cursor-pointer"
      onClick={handleCardClick}
    >
      {/* Cover Image */}
      <div className="relative w-full aspect-[16/9]">
        <Image
          src={post.coverImage || DEFAULT_COVER_IMAGE}
          alt="Cover"
          fill
          className="object-cover"
          priority
          unoptimized={true} // ← Add this
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />

        {/* Top-right Buttons */}
        {showActions && (
          <div className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition">
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleMenu(post.id);
                }}
                className="w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white hover:shadow-md"
                aria-label="More options"
                aria-haspopup="true"
                aria-expanded={menuOpen === post.id}
              >
                <Ellipsis size={18} color="#4b5563" />
              </button>

              {menuOpen === post.id && (
                <div
                  className="absolute right-0 mt-2 w-44 bg-white rounded-lg shadow-lg border border-gray-200 z-30 py-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  <AddCollectionButton postId={post.id} userId={post.user.id} />

                  {isCurrentUsersPost && (
                    <>
                      <Link
                        href={`/post/${post.id}/edit`}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-primary/10 hover:text-primary transition"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Edit size={16} className="mr-2" />
                        Edit
                      </Link>

                      <button
                        className="flex items-center w-full px-4 py-2 text-sm text-red-500 hover:bg-primary/10 hover:text-primary transition"
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                      >
                        <Trash size={16} className="mr-2" />
                        Delete
                      </button>
                    </>
                  )}

                  <button
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-primary/10 hover:text-primary transition"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Share size={16} className="mr-2" />
                    Share
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        {/* User Info */}
        <div className="flex items-center gap-3 mb-3">
          <Link
            href={`/profile/${post.user.id}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-8 h-8 bg-primary/20 overflow-hidden rounded-full">
              {post.user.avatar ? (
                <Image
                  src={post.user.avatar}
                  alt={post.user.username}
                  className="w-full h-full object-cover"
                  width={32}
                  unoptimized={true}
                  height={32}
                />
              ) : (
                <span className="w-full h-full flex items-center justify-center text-sm font-semibold text-gray-700">
                  {post.user.username.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
          </Link>
          <div>
            <Link
              href={`/profile/${post.user.id}`}
              onClick={(e) => e.stopPropagation()}
            >
              <h4 className="font-semibold text-gray-900 hover:text-primary transition">
                {post.user.username}
              </h4>
            </Link>
            <p className="text-xs text-gray-500">{timeAgo(post.createdAt)}</p>
          </div>
        </div>

        {/* Post Title & Description */}
        <Link
          href={post.linkTo || `/post/${post.id}`}
          onClick={(e) => e.stopPropagation()}
        >
          <h3 className="font-semibold text-gray-900 mb-1 hover:text-primary transition line-clamp-1">
            {post.title}
          </h3>
        </Link>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {post.description}
        </p>

        {/* Footer - Visibility & Stats */}
        <div className="flex items-center justify-between">
          <VisibilityTag visibility={post.visibility as Visibility} />

          {post.isDraft && (
            <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
              Draft
            </span>
          )}

          <div
            className="flex items-center gap-2 text-sm text-zinc-400"
            onClick={(e) => e.stopPropagation()}
          >
            <LikeButton
              postId={post.id}
              initialIsLiked={post.isLiked}
              initialLikeCount={post._count.likes}
            />

            <div className="flex items-center">
              <div className="w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center transition hover:bg-white hover:shadow-md">
                <MessageCircle
                  size={18}
                  strokeWidth={2}
                  className="stroke-gray-500 hover:stroke-primary transition"
                />
              </div>

              <span className="text-xs tabular-nums text-gray-500">
                {post._count.comments}
              </span>
            </div>

            <ToggleSaveButton
              postId={post.id}
              initialIsSaved={post.isSaved}
              initialSaveCount={post._count.savedBy}
            />
          </div>
        </div>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {post.tags.slice(0, 3).map((tag) => (
              <Link
                key={tag}
                href={{
                  pathname: "/explore/posts",
                  query: { tag },
                }}
                onClick={(e) => e.stopPropagation()}
                className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition"
              >
                {tag}
              </Link>
            ))}

            {post.tags.length > 3 && (
              <span className="px-2 py-1 text-xs text-gray-400">
                +{post.tags.length - 3} more
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Snippet;
