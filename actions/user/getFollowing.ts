"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-providers";
import { extractKeyFromUrl, generatePresignedViewUrl } from "@/lib/aws_s3";

async function getSignedAvatar(url: string | null | undefined) {
  if (!url) return null;
  const isExternal =
    url.includes("googleusercontent.com") ||
    (url.includes("http") && !url.includes("amazonaws.com"));
  if (isExternal) return url;

  try {
    const key = extractKeyFromUrl(url);
    return await generatePresignedViewUrl(key);
  } catch {
    return url;
  }
}

export async function getFollowingList(
  profileId: string,
  page: number = 1,
  limit: number = 10,
  search: string = "",
) {
  try {
    const session = await getServerSession(authOptions);
    const currentUserId = session?.user?.id;
    const skip = (page - 1) * limit;

    const where: any = {
      followerId: profileId,
    };

    if (search) {
      where.following = {
        username: {
          contains: search,
          mode: "insensitive",
        },
      };
    }

    const followingData = await prisma.follow.findMany({
      where,
      include: {
        following: {
          select: {
            id: true,
            username: true,
            avatar: true,
            bio: true,
            _count: {
              select: {
                followers: true,
                followings: true,
              },
            },
            followers: currentUserId
              ? {
                  where: { followerId: currentUserId },
                  select: { followerId: true },
                }
              : false,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit + 1,
    });

    const hasMore = followingData.length > limit;
    const records = hasMore ? followingData.slice(0, limit) : followingData;

    // 2. Transform data for the UI
    const users = await Promise.all(
      records.map(async (record) => {
        const user = record.following;
        const signedAvatar = await getSignedAvatar(user.avatar);

        return {
          id: user.id,
          username: user.username,
          avatar: signedAvatar,
          bio: user.bio,
          followerCount: user._count.followers,
          followingCount: user._count.followings,
          isFollowing: currentUserId
            ? (user.followers?.length ?? 0) > 0
            : false,
          isMe: currentUserId === user.id,
        };
      }),
    );

    return { success: true, data: users, hasMore };
  } catch (error) {
    console.error("getFollowingList Error:", error);
    return { success: false, message: "Failed to load following list" };
  }
}
