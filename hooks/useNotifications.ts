"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { getNotifications, markAllNotificationsRead } from "@/actions/notifications/getNotifications";

interface NotificationItem {
  id: string;
  type: "LIKE" | "COMMENT" | "FOLLOW";
  isRead: boolean;
  createdAt: Date;
  postId: string | null;
  actor: { id: string; username: string; avatar: string | null };
  post: { id: string; title: string } | null;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);

  // Fetch initial notifications
  const fetchNotifications = useCallback(async () => {
    setIsLoading(true);
    const result = await getNotifications();
    if (result.success) {
      setNotifications(result.data as NotificationItem[]);
      setUnreadCount(result.unreadCount || 0);
    }
    setIsLoading(false);
  }, []);

  // Connect to SSE stream
useEffect(() => {
  const eventSource = new EventSource("/api/notifications/stream");
  eventSourceRef.current = eventSource;

  eventSource.onmessage = (event) => {
      // console.log("SSE message received:", event.data);

    const data = JSON.parse(event.data);

    // Wait for SSE to confirm connection THEN fetch initial data
    if (data.type === "connected") {
      fetchNotifications(); // ← moved here, not on mount
      return;
    }

    if (data.type === "notification") {
      setNotifications((prev) => [data.notification, ...prev]);
      setUnreadCount((prev) => prev + 1);
    }
  };

  eventSource.onerror = (error) => {
    // console.log("SSE error:", error);
    eventSource.close();
    setTimeout(() => {
      const newSource = new EventSource("/api/notifications/stream");
      eventSourceRef.current = newSource;
      // Re-fetch after reconnect too
      newSource.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === "connected") fetchNotifications();
      };
    }, 3000);
  };

  return () => eventSource.close();
}, [fetchNotifications]);

  const markAllRead = useCallback(async () => {
  if (unreadCount === 0) return;
  setUnreadCount(0);
  setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  await markAllNotificationsRead(); // fire and forget
}, [unreadCount]);

  return {
    notifications,
    unreadCount,
    isOpen,
    isLoading,
    markAllRead,
  };
}