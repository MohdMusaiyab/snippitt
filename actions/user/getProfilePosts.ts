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

export async function getProfilePosts({ profileId, skip = 0, take = 5 }: { profileId: string; skip?: number; take?: number; }) {
  try {
    const session = await getServerSession(authOptions);
    const currentUserId = session?.user?.id;
    const isOwner = currentUserId === profileId;

    const user = await prisma.user.findUnique({
      where: { id: profileId },
      select: {
        followers: currentUserId
          ? { where: { followerId: currentUserId }, select: { followerId: true } }
          : false,
      },
    });

    if (!user) {
      return { success: false, message: "User not found", data: [] };
    }

    const isFollowing = user.followers && user.followers.length > 0;

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

    const rawPosts = await prisma.post.findMany({
      where: { userId: profileId, ...visibilityFilter },
      include: {
        user: { select: { id: true, username: true, avatar: true } },
        images: { where: { isCover: true }, take: 1 },
        tags: { include: { tag: true } },
        _count: { select: { likes: true, comments: true, savedBy: true } },
        likes: currentUserId ? { where: { userId: currentUserId } } : false,
        savedBy: currentUserId ? { where: { userId: currentUserId } } : false,
      },
      orderBy: { createdAt: "desc" },
      skip,
      take,
    });

    const posts = await Promise.all(
      rawPosts.map(async (p) => {
        const cover = p.images[0];
        const signedCoverUrl = await getValidImageUrl(cover?.url);
        const signedAuthorAvatar = await getValidImageUrl(p.user.avatar);

        return {
          ...p,
          visibility: p.visibility as any,
          coverImage: signedCoverUrl,
          user: { ...p.user, avatar: signedAuthorAvatar },
          tags: p.tags.map((t) => t.tag.name),
          isLiked: currentUserId ? p.likes.length > 0 : false,
          isSaved: currentUserId ? p.savedBy.length > 0 : false,
          linkTo: `/post/${p.id}`,
        };
      })
    );

    return { success: true, data: posts };
  } catch (error) {
    console.error("getProfilePosts Error:", error);
    return { success: false, message: "Failed to load posts", data: [] };
  }
}
