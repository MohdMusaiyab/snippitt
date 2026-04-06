// actions/posts/getMyPosts.ts
"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-providers";

import type { Post } from "@/schemas/post";
import { safeGetSignedUrl } from "@/lib/aws_s3";

interface GetMyPostsOptions {
  page?: number;
  perPage?: number;
  category?: string;
  visibility?: "PUBLIC" | "PRIVATE" | "FOLLOWERS" | "DRAFT";
  search?: string;
  sort?: "asc" | "desc";
}

export async function getMyPosts(options: GetMyPostsOptions = {}): Promise<{
  success: boolean;
  message: string;
  code?: string;
  data?: {
    posts: Post[];
    pagination: {
      currentPage: number;
      perPage: number;
      totalPages: number;
      totalPosts: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
    currentUserId: string;
  };
}> {
  const session = await getServerSession(authOptions);
  try {
    if (!session?.user?.id) {
      return {
        success: false,
        message: "You must be logged in to view your posts",
        code: "UNAUTHORIZED",
      };
    }

    const userId = session.user.id;
    const perPage = options.perPage || 10;
    const page = options.page || 1;
    const skip = (page - 1) * perPage;

    // Build where clause — owners see ALL their posts (private, public, followers, drafts)
    const whereClause: any = { userId };

    if (options.category) {
      whereClause.category = options.category;
    }

    if (options.visibility) {
      if (options.visibility === "DRAFT") {
        whereClause.isDraft = true;
      } else {
        whereClause.visibility = options.visibility;
        whereClause.isDraft = false;
      }
    }

    if (options.search) {
      whereClause.OR = [
        { title: { contains: options.search, mode: "insensitive" } },
        { description: { contains: options.search, mode: "insensitive" } },
      ];
    }

    // Fetch posts and count in parallel
    const [posts, totalPosts] = await Promise.all([
      prisma.post.findMany({
        where: whereClause,
        include: {
          user: {
            select: { id: true, username: true, avatar: true },
          },
          images: {
            where: { isCover: true },
            take: 1,
          },
          tags: { include: { tag: true } },
          _count: {
            select: { likes: true, comments: true, savedBy: true },
          },
          likes: { where: { userId }, select: { userId: true } },
          savedBy: { where: { userId }, select: { userId: true } },
        },
        orderBy: { createdAt: options.sort || "desc" },
        take: perPage,
        skip,
      }),
      prisma.post.count({ where: whereClause }),
    ]);

    // Sign all URLs in parallel across all posts
    // safeGetSignedUrl handles Google avatars, missing S3 files, malformed URLs
    const postsWithSignedUrls = await Promise.all(
      posts.map(async (post) => {
        const [signedCoverImageUrl, signedUserAvatar] = await Promise.all([
          safeGetSignedUrl(post.images[0]?.url ?? null),
          safeGetSignedUrl(post.user.avatar),
        ]);

        return {
          id: post.id,
          title: post.title,
          description: post.description,
          category: post.category,
          visibility: post.visibility as "PUBLIC" | "PRIVATE" | "FOLLOWERS",
          isDraft: post.isDraft,
          createdAt: post.createdAt,
          updatedAt: post.updatedAt,
          user: {
            ...post.user,
            avatar: signedUserAvatar,
          },
          coverImage: signedCoverImageUrl,
          images: post.images.map((img) => ({
            id: img.id,
            url: signedCoverImageUrl ?? img.url,
            description: null,
            isCover: img.isCover,
            createdAt: post.createdAt,
            updatedAt: post.updatedAt,
          })),
          tags: post.tags.map((t) => t.tag.name),
          _count: post._count,
          isLiked: post.likes.length > 0,
          isSaved: post.savedBy.length > 0,
          linkTo: `/posts/${post.id}`,
        };
      }),
    );

    const totalPages = Math.ceil(totalPosts / perPage);

    return {
      success: true,
      message: "Posts retrieved successfully",
      data: {
        posts: postsWithSignedUrls,
        pagination: {
          currentPage: page,
          perPage,
          totalPages,
          totalPosts,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
        currentUserId: userId,
      },
    };
  } catch (error) {
    console.error("getMyPosts Error:", error);
    return {
      success: false,
      message: "An error occurred while fetching your posts",
      code: "FETCH_MY_POSTS_FAILED",
      data: {
        posts: [],
        pagination: {
          currentPage: 1,
          perPage: 10,
          totalPages: 0,
          totalPosts: 0,
          hasNextPage: false,
          hasPrevPage: false,
        },
        currentUserId: "",
      },
    };
  }
}

// Optional: Function to get post counts by category
export async function getMyPostsStats() {
  const session = await getServerSession(authOptions);
  try {
    if (!session?.user?.id) {
      return { success: false, message: "Unauthorized", code: "UNAUTHORIZED" };
    }

    const userId = session.user.id;

    const stats = await prisma.post.groupBy({
      by: ["category"],
      where: { userId, isDraft: false },
      _count: { _all: true },
    });

    return {
      success: true,
      message: "Post stats retrieved successfully",
      data: stats,
    };
  } catch (error) {
    console.error("Error fetching post stats:", error);
    return {
      success: false,
      message: "Failed to fetch post statistics",
      code: "FETCH_STATS_FAILED",
    };
  }
}
