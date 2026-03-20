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
  } catch (error) {
    console.error("S3 Signing failed for URL:", url);
    return url;
  }
}

export async function getProfileCollections({ profileId, skip = 0, take = 5 }: { profileId: string; skip?: number; take?: number; }) {
  try {
    const session = await getServerSession(authOptions);
    const currentUserId = session?.user?.id;
    const isOwner = currentUserId === profileId;

    const user = await prisma.user.findUnique({
      where: { id: profileId },
      select: {
        followings: currentUserId
          ? { where: { followerId: currentUserId }, select: { followerId: true } }
          : false,
      },
    });

    if (!user) {
      return { success: false, message: "User not found", data: [] };
    }

    const isFollowing = user.followings && user.followings.length > 0;

    const visibilityFilter = {
      isDraft: false,
      ...(isOwner
        ? {}
        : {
          OR: [
            { visibility: "PUBLIC" as any },
            ...(isFollowing ? [{ visibility: "FOLLOWERS" as any }] : []),
          ],
        }),
    };

    const rawCollections = await prisma.collection.findMany({
      where: { userId: profileId, ...visibilityFilter },
      include: {
        _count: { select: { posts: true } },
        user: { select: { id: true, username: true, avatar: true } },
      },
      orderBy: { updatedAt: "desc" },
      skip,
      take,
    });

    const collections = await Promise.all(
      rawCollections.map(async (c) => {
        const signedCollectionCover = await getValidImageUrl(c.coverImage);
        const signedCollectionAuthorAvatar = await getValidImageUrl(c.user.avatar);

        return {
          ...c,
          visibility: c.visibility as any,
          coverImage: signedCollectionCover,
          user: { ...c.user, avatar: signedCollectionAuthorAvatar },
          _count: { posts: c._count.posts },
        };
      })
    );

    return { success: true, data: collections };
  } catch (error) {
    console.error("getProfileCollections Error:", error);
    return { success: false, message: "Failed to load collections", data: [] };
  }
}
