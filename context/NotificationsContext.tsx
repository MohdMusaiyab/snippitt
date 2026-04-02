"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
  ReactNode,
} from "react";
import {
  getNotifications,
  markAllNotificationsRead,
} from "@/actions/notifications/getNotifications";

interface NotificationItem {
  id: string;
  type: "LIKE" | "COMMENT" | "FOLLOW";
  isRead: boolean;
  createdAt: Date;
  postId: string | null;
  actor: { id: string; username: string; avatar: string | null };
  post: { id: string; title: string } | null;
}

interface NotificationsContextValue {
  notifications: NotificationItem[];
  unreadCount: number;
  isLoading: boolean;
  markAllRead: () => Promise<void>;
}

const NotificationsContext = createContext<NotificationsContextValue | null>(
  null,
);

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);
  // Ref mirrors unreadCount so markAllRead can read the live value
  // without being recreated every time the count changes.
  const unreadCountRef = useRef(0);
  useEffect(() => {
    unreadCountRef.current = unreadCount;
  }, [unreadCount]);

  const fetchNotifications = useCallback(async () => {
    setIsLoading(true);
    const result = await getNotifications();
    if (result.success) {
      setNotifications(result.data as NotificationItem[]);
      setUnreadCount(result.unreadCount || 0);
    }
    setIsLoading(false);
  }, []);

  const connectSSE = useCallback(() => {
    const eventSource = new EventSource("/api/notifications/stream");
    eventSourceRef.current = eventSource;

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === "connected") {
        fetchNotifications();
        return;
      }

      if (data.type === "notification") {
        setNotifications((prev) => [data.notification, ...prev]);
        setUnreadCount((prev) => prev + 1);
      }
    };

    eventSource.onerror = () => {
      eventSource.close();
      setTimeout(connectSSE, 3000);
    };

    return eventSource;
  }, [fetchNotifications]);

  useEffect(() => {
    const source = connectSSE();
    return () => source.close();
  }, [connectSSE]);

  const markAllRead = useCallback(async () => {
    // Read live value from ref — no stale closure, no re-creation on count change
    if (unreadCountRef.current === 0) return;

    // Optimistic UI update — both setters called in normal async flow,
    // never inside a setState updater (which runs during render)
    setUnreadCount(0);
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));

    // Server action fired AFTER state updates, outside any updater function
    await markAllNotificationsRead();
  }, []);

  return (
    <NotificationsContext.Provider
      value={{ notifications, unreadCount, isLoading, markAllRead }}
    >
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext);
  if (!ctx) {
    throw new Error(
      "useNotifications must be used inside <NotificationsProvider>",
    );
  }
  return ctx;
}