// actions/posts/explore.ts
"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-providers";
import { safeGetSignedUrl } from "@/lib/aws_s3";
import type { Post } from "@/schemas/post";

interface ExploreOptions {
  page?: number;
  perPage?: number;
  search?: string;
  category?: string;
  tag?: string;
}

export async function getExplorePosts(options: any = {}) {
  const session = await getServerSession(authOptions);
  try {
    const userId = session?.user?.id;

    const page = options.page || 1;
    const perPage = options.perPage || 10;
    const skip = (page - 1) * perPage;
    const search = options.search?.trim();

    // Visibility Filter — only public posts, or followers-only posts if viewer follows the author
    const visibilityFilter = {
      OR: [
        { visibility: "PUBLIC" as any },
        ...(userId
          ? [
              {
                AND: [
                  { visibility: "FOLLOWERS" as any },
                  {
                    user: {
                      followers: { some: { followerId: userId } },
                    },
                  },
                ],
              },
            ]
          : []),
      ],
    };

    const whereClause: any = {
      isDraft: false,
      ...visibilityFilter,
      ...(search && {
        OR: [
          { title: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ],
      }),
      ...(options.category && { category: options.category }),
    };

    const [posts, totalPosts] = await Promise.all([
      prisma.post.findMany({
        where: whereClause,
        include: {
          user: { select: { id: true, username: true, avatar: true } },
          images: { where: { isCover: true }, take: 1 },
          tags: { include: { tag: true } },
          _count: { select: { likes: true, comments: true, savedBy: true } },
          likes: userId
            ? { where: { userId }, select: { userId: true } }
            : false,
          savedBy: userId
            ? { where: { userId }, select: { userId: true } }
            : false,
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: perPage,
      }),
      prisma.post.count({ where: whereClause }),
    ]);

    // Sign all URLs in parallel per post
    // safeGetSignedUrl handles Google avatars, missing S3 files, malformed URLs
    const transformedPosts: Post[] = await Promise.all(
      posts.map(async (post) => {
        if (!post.user) {
          throw new Error(`Post ${post.id} is missing an author.`);
        }

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
            id: post.user.id,
            username: post.user.username,
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
          _count: {
            likes: post._count.likes,
            comments: post._count.comments,
            savedBy: post._count.savedBy,
          },
          isLiked: userId ? post.likes.length > 0 : false,
          isSaved: userId ? post.savedBy.length > 0 : false,
          linkTo: `/post/${post.id}`,
        };
      }),
    );

    return {
      success: true,
      data: {
        posts: transformedPosts,
        pagination: {
          total: totalPosts,
          pages: Math.ceil(totalPosts / perPage),
          currentPage: page,
        },
        currentUserId: userId || "",
      },
    };
  } catch (error) {
    console.error("Explore Fetch Error:", error);
    return {
      success: false,
      message: "An error occurred while fetching posts",
    };
  }
}
