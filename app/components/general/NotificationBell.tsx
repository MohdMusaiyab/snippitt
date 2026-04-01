"use client";
import Link from "next/link";
import { Bell } from "lucide-react";
import { useEffect, useRef } from "react";
import { useNotifications } from "@/context/NotificationsContext";

export default function NotificationBell() {
  const { unreadCount, markAllRead } = useNotifications();

  // Track whether the user is currently on the notifications page.
  // We call markAllRead once the hook has loaded real data (unreadCount > 0
  // means fetchNotifications has completed), but only if the bell is being
  // rendered as part of a /notifications route visit.
  const hasMarked = useRef(false);

  useEffect(() => {
    // Only auto-mark when navigating TO the notifications page via this bell.
    // The NotificationsPage itself also calls markAllRead() on mount,
    // which handles the in-page case. This effect is a safety net for when
    // the bell re-renders after navigation.
    return () => {
      // On unmount of bell (i.e. leaving the page) — no action needed.
      hasMarked.current = false;
    };
  }, []);

  return (
    <Link
      href="/notifications"
      onClick={() => {
        // FIX: Call markAllRead on click — at this point the hook has real
        // data loaded (SSE has connected and fetchNotifications has run),
        // so unreadCount is accurate and the guard inside markAllRead works.
        markAllRead();
      }}
      className="relative p-2 rounded-full text-gray-700 hover:bg-gray-100 transition-all"
      aria-label="Notifications"
    >
      <Bell className="w-6 h-6" />
      {unreadCount > 0 && (
        <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-extrabold rounded-full flex items-center justify-center px-1 leading-none">
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}
    </Link>
  );
}