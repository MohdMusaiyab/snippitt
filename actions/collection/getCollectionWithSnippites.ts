"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-providers";
import { safeGetSignedUrl } from "@/lib/aws_s3";
import { Post } from "@/schemas/post";

interface GetCollectionParams {
  collectionId: string;
  page?: number;
  perPage?: number;
}

export async function getCollectionWithSnippets({
  collectionId,
  page = 1,
  perPage = 12,
}: GetCollectionParams) {
  try {
    const skip = (page - 1) * perPage;
    const session = await getServerSession(authOptions);
    const currentUserId = session?.user?.id;

    // 1. Fetch the Collection
    const collection = await prisma.collection.findUnique({
      where: { id: collectionId },
      include: {
        user: {
          select: { id: true, username: true, avatar: true },
        },
        _count: {
          select: { posts: true },
        },
      },
    });

    if (!collection) {
      return {
        success: false,
        message: "Collection not found",
        code: "NOT_FOUND",
      };
    }

    const isOwner = currentUserId === collection.userId;

    // 2. Determine Relationship (for visibility filtering)
    let isFollowing = false;
    if (currentUserId && !isOwner) {
      const follow = await prisma.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId: currentUserId,
            followingId: collection.userId,
          },
        },
      });
      isFollowing = !!follow;
    }

    // 3. Visibility Filter for snippets
    const snippetVisibilityFilter = isOwner
      ? {}
      : {
          isDraft: false,
          OR: [
            { visibility: "PUBLIC" as any },
            ...(isFollowing ? [{ visibility: "FOLLOWERS" as any }] : []),
          ],
        };

    const whereClause = {
      collections: { some: { id: collectionId } },
      ...snippetVisibilityFilter,
    };

    // 4. Fetch snippets and total count in parallel
    const [rawPosts, totalSnippets] = await Promise.all([
      prisma.post.findMany({
        where: whereClause,
        include: {
          user: { select: { id: true, username: true, avatar: true } },
          images: { where: { isCover: true }, take: 1 },
          tags: { include: { tag: true } },
          _count: { select: { likes: true, comments: true, savedBy: true } },
          likes: currentUserId
            ? { where: { userId: currentUserId }, select: { userId: true } }
            : false,
          savedBy: currentUserId
            ? { where: { userId: currentUserId }, select: { userId: true } }
            : false,
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: perPage,
      }),
      prisma.post.count({ where: whereClause }),
    ]);

    // 5. Sign all URLs in parallel — safeGetSignedUrl handles:
    //    • External URLs (Google avatars) → returned as-is
    //    • Missing S3 files → returns null (no crash)
    //    • Expired/malformed URLs → returns null (no crash)
    const [signedCollectionCover, signedOwnerAvatar] = await Promise.all([
      safeGetSignedUrl(collection.coverImage),
      safeGetSignedUrl(collection.user.avatar),
    ]);

    // 6. Transform and sign all snippets + their author avatars in parallel
    const snippets: Post[] = await Promise.all(
      rawPosts.map(async (p) => {
        const coverUrl = p.images[0]?.url ?? null;

        // Sign cover and author avatar in parallel for each snippet
        const [signedPostCover, signedAuthorAvatar] = await Promise.all([
          safeGetSignedUrl(coverUrl),
          safeGetSignedUrl(p.user.avatar),
        ]);

        return {
          ...p,
          visibility: p.visibility as any,
          coverImage: signedPostCover,
          user: {
            ...p.user,
            avatar: signedAuthorAvatar,
          },
          images: p.images.map((img) => ({
            ...img,
            url: signedPostCover ?? img.url,
          })),
          tags: p.tags.map((t) => t.tag.name),
          isLiked: currentUserId ? p.likes.length > 0 : false,
          isSaved: currentUserId ? p.savedBy.length > 0 : false,
          linkTo: `/posts/${p.id}`,
        };
      }),
    );

    return {
      success: true,
      data: {
        collection: {
          ...collection,
          coverImage: signedCollectionCover,
          user: {
            ...collection.user,
            avatar: signedOwnerAvatar,
          },
          _count: { posts: collection._count.posts },
        },
        snippets,
        isOwner,
        currentUserId: currentUserId || null,
        pagination: {
          total: totalSnippets,
          pages: Math.ceil(totalSnippets / perPage),
          currentPage: page,
        },
      },
    };
  } catch (error) {
    console.error("getCollectionWithSnippets Error:", error);
    return { success: false, message: "Internal server error" };
  }
}
