"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  Heart,
  MessageCircle,
  UserPlus,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import { useNotifications } from "@/context/NotificationsContext";

function timeAgo(date: Date | string): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  return new Date(date).toLocaleDateString();
}

function notificationMessage(
  type: string,
  username: string,
  postTitle?: string,
) {
  switch (type) {
    case "LIKE":
      return (
        <span>
          <span className="font-semibold text-gray-900">@{username}</span>
          <span className="text-gray-500"> liked your post </span>
          {postTitle && (
            <span className="font-medium text-gray-700 line-clamp-1">
              &ldquo;{postTitle}&rdquo;
            </span>
          )}
        </span>
      );
    case "COMMENT":
      return (
        <span>
          <span className="font-semibold text-gray-900">@{username}</span>
          <span className="text-gray-500"> commented on </span>
          {postTitle && (
            <span className="font-medium text-gray-700">
              &ldquo;{postTitle}&rdquo;
            </span>
          )}
        </span>
      );
    case "FOLLOW":
      return (
        <span>
          <span className="font-semibold text-gray-900">@{username}</span>
          <span className="text-gray-500"> started following you</span>
        </span>
      );
    default:
      return null;
  }
}

function notificationIcon(type: string) {
  switch (type) {
    case "LIKE":
      return <Heart size={11} className="text-white" />;
    case "COMMENT":
      return <MessageCircle size={11} className="text-white" />;
    case "FOLLOW":
      return <UserPlus size={11} className="text-white" />;
    default:
      return null;
  }
}

function notificationIconBg(type: string) {
  switch (type) {
    case "LIKE":
      return "bg-red-500";
    case "COMMENT":
      return "bg-indigo-500";
    case "FOLLOW":
      return "bg-emerald-500";
    default:
      return "bg-gray-400";
  }
}

function notificationHref(
  type: string,
  postId?: string | null,
  actorId?: string,
) {
  if (type === "FOLLOW" && actorId) return `/profile/${actorId}`;
  if (postId) return `/posts/${postId}`;
  return "#";
}

export default function NotificationsPage() {
  const router = useRouter();
  const { notifications, isLoading, markAllRead } = useNotifications();

  // FIX: markAllRead is now safe to call here because it reads live state
  // via functional updater inside the shared context — not a stale closure.
  useEffect(() => {
    markAllRead();
  }, [markAllRead]);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-10 bg-gray-50 border-b border-gray-100 px-4 pt-10 pb-3 mb-5 sm:mb-10 flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="p-1.5 rounded-full hover:bg-gray-100 transition-colors text-gray-500"
          aria-label="Go back"
        >
          <ArrowLeft size={18} />
        </button>

        <div className="flex items-center gap-2 flex-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900">
            Notifications
          </h1>
        </div>
      </header>

      <main className="w-full mx-auto">
        {isLoading ? (
          <div className="flex justify-center py-24">
            <Loader2 size={22} className="animate-spin text-gray-300" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 px-6 text-center">
            <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
              <Bell size={22} className="text-gray-300" />
            </div>
            <p className="text-sm font-bold text-gray-700">
              No notifications yet
            </p>
            <p className="text-xs text-gray-400 mt-1">
              We&apos;ll let you know when something happens.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 bg-white sm:mt-4 sm:mx-4 rounded-xl sm:rounded-2xl sm:border sm:border-gray-100 sm:overflow-hidden">
            {notifications.map((n) => (
              <Link
                key={n.id}
                href={notificationHref(n.type, n.postId, n.actor.id)}
                className={`flex items-start gap-3 px-4 py-4 hover:bg-gray-50 active:bg-gray-100 transition-colors
                  ${!n.isRead ? "bg-indigo-50/40" : ""}`}
              >
                {/* Avatar + badge */}
                <div className="relative flex-shrink-0 mt-0.5">
                  <div className="w-10 h-10 rounded-xl overflow-hidden bg-indigo-50">
                    {n.actor.avatar ? (
                      <Image
                        src={n.actor.avatar}
                        alt={n.actor.username}
                        width={40}
                        height={40}
                        className="object-cover w-full h-full"
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-sm font-extrabold text-indigo-400">
                        {n.actor.username[0].toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div
                    className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center ${notificationIconBg(n.type)}`}
                  >
                    {notificationIcon(n.type)}
                  </div>
                </div>

                {/* Message */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs leading-relaxed">
                    {notificationMessage(
                      n.type,
                      n.actor.username,
                      n.post?.title,
                    )}
                  </p>
                  <p className="text-[11px] text-gray-400 mt-1">
                    {timeAgo(n.createdAt)}
                  </p>
                </div>

                {/* Unread dot — cleared immediately via shared state */}
                {!n.isRead && (
                  <div className="w-2 h-2 rounded-full bg-indigo-500 flex-shrink-0 mt-1.5" />
                )}
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}