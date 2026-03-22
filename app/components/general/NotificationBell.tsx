// app/components/notifications/NotificationBell.tsx
"use client";
import { Suspense } from "react";
import { useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Bell, Heart, MessageCircle, UserPlus, Loader2, Check } from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";

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

function notificationMessage(type: string, username: string, postTitle?: string) {
  switch (type) {
    case "LIKE":
      return (
        <span>
          <span className="font-semibold text-gray-900">@{username}</span>
          <span className="text-gray-500"> liked your post </span>
          {postTitle && (
            <span className="font-medium text-gray-700 line-clamp-1">&ldquo;{postTitle}&rdquo;</span>
          )}
        </span>
      );
    case "COMMENT":
      return (
        <span>
          <span className="font-semibold text-gray-900">@{username}</span>
          <span className="text-gray-500"> commented on </span>
          {postTitle && (
            <span className="font-medium text-gray-700">&ldquo;{postTitle}&rdquo;</span>
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
    case "LIKE":    return "bg-red-500";
    case "COMMENT": return "bg-indigo-500";
    case "FOLLOW":  return "bg-emerald-500";
    default:        return "bg-gray-400";
  }
}

function notificationHref(type: string, postId?: string | null, actorId?: string) {
  if (type === "FOLLOW" && actorId) return `/profile/${actorId}`;
  if (postId) return `/posts/${postId}`;
  return "#";
}

export default function NotificationBell() {
  const {
    notifications,
    unreadCount,
    isOpen,
    isLoading,
    openDropdown,
    closeDropdown,
  } = useNotifications();

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        closeDropdown();
      }
    };
    if (isOpen) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen, closeDropdown]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") closeDropdown(); };
    if (isOpen) window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, closeDropdown]);

  return (
    <div className="relative" ref={dropdownRef}>

      {/* Bell button */}
      <button
        onClick={isOpen ? closeDropdown : openDropdown}
        className={`relative p-2 rounded-full transition-all
          ${isOpen
            ? "bg-indigo-50 text-indigo-600"
            : "text-gray-700 hover:bg-gray-100"
          }`}
        aria-label="Notifications"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-extrabold rounded-full flex items-center justify-center px-1 leading-none">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-2xl border border-gray-200 shadow-xl z-50 overflow-hidden">

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Bell size={15} className="text-gray-400" />
              <span className="text-sm font-extrabold text-gray-900 uppercase tracking-wider">
                Notifications
              </span>
            </div>
            {notifications.some((n) => n.isRead === false) === false && notifications.length > 0 && (
              <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                <Check size={10} /> All caught up
              </span>
            )}
          </div>

          {/* Content */}
          <div className="max-h-[420px] overflow-y-auto">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 size={20} className="animate-spin text-gray-300" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-16 text-center space-y-3">
                <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto">
                  <Bell size={20} className="text-gray-300" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-700">No notifications yet</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    We&apos;ll let you know when something happens
                  </p>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {notifications.map((n) => (
                  <Link
                    key={n.id}
                    href={notificationHref(n.type, n.postId, n.actor.id)}
                    onClick={closeDropdown}
                    className={`flex items-start gap-3 px-4 py-3.5 hover:bg-gray-50 transition-colors
                      ${!n.isRead ? "bg-indigo-50/40" : ""}`}
                  >
                    {/* Avatar + type icon */}
                    <div className="relative flex-shrink-0 mt-0.5">
                      <div className="w-9 h-9 rounded-xl overflow-hidden bg-indigo-50">
                        {n.actor.avatar ? (
                          <Image
                            src={n.actor.avatar}
                            alt={n.actor.username}
                            width={36}
                            height={36}
                            className="object-cover w-full h-full"
                            unoptimized
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-sm font-extrabold text-indigo-400">
                            {n.actor.username[0].toUpperCase()}
                          </div>
                        )}
                      </div>
                      {/* Type badge */}
                      <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center ${notificationIconBg(n.type)}`}>
                        {notificationIcon(n.type)}
                      </div>
                    </div>

                    {/* Message */}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs leading-relaxed">
                        {notificationMessage(n.type, n.actor.username, n.post?.title)}
                      </p>
                      <p className="text-[11px] text-gray-400 mt-1">
                        {timeAgo(n.createdAt)}
                      </p>
                    </div>

                    {/* Unread dot */}
                    {!n.isRead && (
                      <div className="w-2 h-2 rounded-full bg-indigo-500 flex-shrink-0 mt-1.5" />
                    )}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="border-t border-gray-100 px-4 py-3">
              <Link
                href="/notifications"
                onClick={closeDropdown}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
              >
                View all notifications →
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}