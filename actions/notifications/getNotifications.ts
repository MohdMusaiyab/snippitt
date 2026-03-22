"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-providers";
import { extractKeyFromUrl, generatePresignedViewUrl } from "@/lib/aws_s3";

async function getValidImageUrl(url: string | null | undefined) {
  if (!url) return null;
  const isExternal =
    url.includes("googleusercontent.com") ||
    (url.includes("http") && !url.includes("amazonaws.com"));
  if (isExternal) return url;
  try {
    const key = extractKeyFromUrl(url);
    return await generatePresignedViewUrl(key);
  } catch { return url; }
}

export async function getNotifications() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false, data: [] };

  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: session.user.id },
      include: {
        actor: { select: { id: true, username: true, avatar: true } },
        post: { select: { id: true, title: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    const signed = await Promise.all(
      notifications.map(async (n) => ({
        ...n,
        actor: {
          ...n.actor,
          avatar: await getValidImageUrl(n.actor.avatar),
        },
      }))
    );

    const unreadCount = notifications.filter((n) => !n.isRead).length;

    return { success: true, data: signed, unreadCount };
  } catch (error) {
    console.error("getNotifications error:", error);
    return { success: false, data: [], unreadCount: 0 };
  }
}

export async function markAllNotificationsRead() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false };

  try {
    await prisma.notification.updateMany({
      where: { userId: session.user.id, isRead: false },
      data: { isRead: true },
    });
    return { success: true };
  } catch (error) {
    console.error("markAllNotificationsRead error:", error);
    return { success: false };
  }
}