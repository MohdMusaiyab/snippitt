// actions/posts/getPost.ts
"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-providers";
import { safeGetSignedUrl } from "@/lib/aws_s3";
import type { Post } from "@/schemas/post";

interface GetPostOptions {
  includeSignedUrls?: boolean;
}

export async function getPost(
  postId: string,
  options: GetPostOptions = { includeSignedUrls: true },
): Promise<{
  success: boolean;
  message: string;
  code?: string;
  data?: Post;
}> {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return {
        success: false,
        message: "Authentication required",
        code: "UNAUTHORIZED",
      };
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return {
        success: false,
        message: "User account not found",
        code: "USER_NOT_FOUND",
      };
    }

    const post = await prisma.post.findUnique({
      where: { id: postId, userId: user.id },
      include: {
        user: {
          select: { id: true, username: true, avatar: true },
        },
        images: { orderBy: { createdAt: "asc" } },
        tags: { include: { tag: true } },
        _count: {
          select: { likes: true, comments: true, savedBy: true },
        },
        likes: { where: { userId: user.id }, select: { userId: true } },
        savedBy: { where: { userId: user.id }, select: { userId: true } },
      },
    });

    if (!post) {
      return {
        success: false,
        message: "Post not found or access denied",
        code: "POST_NOT_FOUND",
      };
    }

    // Build base transformed post (raw URLs first)
    const transformedPost: Post = {
      id: post.id,
      title: post.title,
      description: post.description,
      category: post.category,
      visibility: post.visibility as "PUBLIC" | "PRIVATE" | "FOLLOWERS",
      isDraft: post.isDraft,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      user: {
        id: post.user.id,
        username: post.user.username,
        avatar: post.user.avatar,
      },
      images: post.images.map((img) => ({
        id: img.id,
        url: img.url,
        description: img.description,
        isCover: img.isCover,
        createdAt: img.createdAt,
        updatedAt: img.updatedAt,
      })),
      tags: post.tags.map((t) => t.tag.name),
      _count: {
        likes: post._count.likes,
        comments: post._count.comments,
        savedBy: post._count.savedBy,
      },
      isLiked: post.likes.length > 0,
      isSaved: post.savedBy.length > 0,
      linkTo: `/posts/${post.id}`,
    };

    if (options.includeSignedUrls) {
      // Sign all image URLs and the author avatar in parallel
      // safeGetSignedUrl handles:
      //   • Google/GitHub OAuth avatars → returned as-is
      //   • S3 files missing (deleted/corrupted) → returns null, never crashes
      //   • Malformed URLs → returns null gracefully
      const [signedAvatar, ...signedImages] = await Promise.all([
        safeGetSignedUrl(post.user.avatar),
        ...post.images.map(async (img) => {
          const signedUrl = await safeGetSignedUrl(img.url);
          return {
            id: img.id,
            url: signedUrl ?? img.url, // Fallback: show raw URL rather than nothing
            description: img.description,
            isCover: img.isCover,
            createdAt: img.createdAt,
            updatedAt: img.updatedAt,
          };
        }),
      ]);

      transformedPost.user.avatar = signedAvatar;
      transformedPost.images = signedImages;

      // Set coverImage from the already-signed images list
      const cover = transformedPost.images.find((img) => img.isCover);
      transformedPost.coverImage = cover?.url || null;
    } else {
      // No signing — find coverImage from raw DB URLs
      const cover = post.images.find((img) => img.isCover);
      transformedPost.coverImage = cover?.url || null;
    }

    return {
      success: true,
      message: "Post retrieved successfully",
      data: transformedPost,
    };
  } catch (error) {
    console.error("Post Fetch Error:", error);
    return {
      success: false,
      message: "An unexpected error occurred while fetching the post",
      code: "INTERNAL_SERVER_ERROR",
    };
  }
}