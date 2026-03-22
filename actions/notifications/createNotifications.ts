"use server";

import prisma from "@/lib/prisma";
import { sendToUser } from "@/lib/notificationConncetions"; // ← store, not route
import { NotificationType } from "@/app/generated/prisma/enums";

interface CreateNotificationInput {
  type: NotificationType;
  actorId: string;
  userId: string;
  postId?: string;
}

export async function createNotification({
  type,
  actorId,
  userId,
  postId,
}: CreateNotificationInput) {
  if (actorId === userId) return;

  try {
    const actor = await prisma.user.findUnique({
      where: { id: actorId },
      select: { id: true, username: true, avatar: true },
    });
    if (!actor) return;

    const notification = await prisma.notification.create({
      data: { type, actorId, userId, postId },
    });

    sendToUser(userId, {
      type: "notification",
      notification: {
        id: notification.id,
        type: notification.type,
        createdAt: notification.createdAt,
        isRead: false,
        actor,
        postId: postId || null,
      },
    });
  } catch (error) {
    console.error("createNotification error:", error);
  }
}