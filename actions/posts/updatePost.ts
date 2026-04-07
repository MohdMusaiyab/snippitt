// actions/posts/updatePost.ts
"use server";

import { z } from "zod";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-providers";
import type { Post } from "@/schemas/post";
import { Category, Visibility } from "@/app/generated/prisma/enums";
import {
  processUploadLink,
  safeExtractKey,
  moveFileToTrash,
  safeGetSignedUrl,
  sanitizeS3Url,
} from "@/lib/aws_s3";

// Schema for image data in update
const UpdateImageSchema = z.object({
  url: z.string(),
  description: z.string().optional().default(""),
  isCover: z.boolean().default(false),
  existingImageId: z.string().optional(),
});

// Schema for update post
const UpdatePostSchema = z.object({
  id: z.string(),
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  category: z.nativeEnum(Category),
  tags: z.array(z.string().min(1)).min(1).max(10),
  visibility: z.nativeEnum(Visibility),
  isDraft: z.boolean().default(false),
  images: z.array(UpdateImageSchema).max(10),
});

export type UpdatePostInput = z.infer<typeof UpdatePostSchema>;

export async function updatePost(input: UpdatePostInput) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id)
      return { success: false, message: "Unauthorized", code: "UNAUTHORIZED" };

    const validatedData = UpdatePostSchema.parse(input);
    const {
      id: postId,
      title,
      description,
      tags,
      category,
      visibility,
      images: incomingImages,
      isDraft,
    } = validatedData;
    const userId = session.user.id;

    const existingPost = await prisma.post.findUnique({
      where: { id: postId, userId },
      include: {
        images: {
          select: { id: true, url: true, description: true, isCover: true },
        },
      },
    });

    if (!existingPost)
      return {
        success: false,
        message: "Post not found or access denied",
        code: "POST_NOT_FOUND",
      };

    // ─────────────────────────────────────────────────────────────────────────
    // Image Categorization — ID-first strategy (robust against URL format variance)
    //
    // The client sends back existing images with `existingImageId` set.
    // New uploads don't have `existingImageId`.
    //
    // Using IDs as the source of truth is far more reliable than comparing
    // URLs (which can be signed, unsigned, have different query params, etc.)
    // ─────────────────────────────────────────────────────────────────────────

    // Set of existing image IDs that the client wants to KEEP
    const incomingExistingIds = new Set(
      incomingImages
        .filter((img) => img.existingImageId)
        .map((img) => img.existingImageId!),
    );

    // Images the user removed (in DB but not in incoming list)
    const deletedImages = existingPost.images.filter(
      (img) => !incomingExistingIds.has(img.id),
    );

    // New images to upload (no existingImageId → fresh temp/ uploads)
    const newImages = incomingImages.filter((img) => !img.existingImageId);

    // Existing images to update (metadata like isCover, description)
    const updatedImages = incomingImages.filter((img) => img.existingImageId);

    // ─────────────────────────────────────────────────────────────────────────
    // All heavy async work BEFORE the DB transaction
    // ─────────────────────────────────────────────────────────────────────────

    // 1. Process new images: move from temp/ → uploads/ (permanent)
    const processedNewImages = await Promise.all(
      newImages.map(async (img) => {
        try {
          const finalUrl = await processUploadLink(img.url);
          if (!finalUrl) {
            throw new Error(
              `processUploadLink returned null for URL: ${img.url}`,
            );
          }
          return { ...img, url: finalUrl };
        } catch (error: any) {
          if (error.message === "SOURCE_MISSING") {
            console.error(`New image missing from S3: ${img.url}`);
            throw new Error(
              "One of your uploads is missing. Please remove it and try again.",
            );
          }
          throw error;
        }
      }),
    );

    // 2. Soft-delete removed images from S3 (fire-and-forget — DB update proceeds regardless)
    await Promise.allSettled(
      deletedImages.map((img) => moveFileToTrash(img.url)),
    );

    // 3. Upsert tags outside the transaction (avoids long-running tx)
    const tagRecords = await Promise.all(
      tags.map((tagName) =>
        prisma.tag.upsert({
          where: { name: tagName.toLowerCase() },
          update: {},
          create: { name: tagName.toLowerCase() },
        }),
      ),
    );

    // ─────────────────────────────────────────────────────────────────────────
    // DB Transaction — only fast writes, no S3 calls inside
    // ─────────────────────────────────────────────────────────────────────────
    const updatedPost = await prisma.$transaction(async (tx) => {
      // Delete removed images from DB
      if (deletedImages.length > 0) {
        await tx.image.deleteMany({
          where: { postId, id: { in: deletedImages.map((img) => img.id) } },
        });
      }

      // Reset all cover flags (we'll set them correctly below)
      await tx.image.updateMany({ where: { postId }, data: { isCover: false } });

      // Update post core fields
      await tx.post.update({
        where: { id: postId, userId },
        data: { title, description, category, visibility, isDraft, updatedAt: new Date() },
      });

      // Replace tags
      await tx.postTag.deleteMany({ where: { postId } });
      await tx.postTag.createMany({
        data: tagRecords.map((tag) => ({ postId, tagId: tag.id })),
      });

      // Create new images
      if (processedNewImages.length > 0) {
        await tx.image.createMany({
          data: processedNewImages.map((img) => ({
            url: img.url, // Clean permanent URL (no ?X-Amz-Signature)
            description: img.description,
            postId,
            isCover: img.isCover,
          })),
        });
      }

      // Update existing images (metadata only — url never changes for existing images)
      for (const img of updatedImages) {
        const existing = existingPost.images.find(
          (ex) => ex.id === img.existingImageId,
        );
        if (existing) {
          await tx.image.update({
            where: { id: existing.id },
            data: { description: img.description, isCover: img.isCover },
          });
        }
      }

      return tx.post.findUnique({
        where: { id: postId },
        include: {
          images: { orderBy: { createdAt: "asc" } },
          tags: { include: { tag: true } },
          _count: { select: { likes: true, comments: true, savedBy: true } },
          likes: { where: { userId }, select: { userId: true } },
          savedBy: { where: { userId }, select: { userId: true } },
        },
      });
    });

    if (!updatedPost)
      return {
        success: false,
        message: "Failed to update post",
        code: "UPDATE_FAILED",
      };

    // ─────────────────────────────────────────────────────────────────────────
    // Build response — sign all image URLs for immediate display
    // safeGetSignedUrl handles missing files gracefully (returns null, no crash)
    // ─────────────────────────────────────────────────────────────────────────
    const transformedPost: Post = {
      id: updatedPost.id,
      title: updatedPost.title,
      description: updatedPost.description,
      category: updatedPost.category,
      visibility: updatedPost.visibility as "PUBLIC" | "PRIVATE" | "FOLLOWERS",
      isDraft: updatedPost.isDraft,
      createdAt: updatedPost.createdAt,
      updatedAt: updatedPost.updatedAt,
      user: {
        id: updatedPost.userId,
        username: session.user.username || "",
      },
      tags: updatedPost.tags.map((t) => t.tag.name),
      _count: {
        likes: updatedPost._count.likes,
        comments: updatedPost._count.comments,
        savedBy: updatedPost._count.savedBy,
      },
      isLiked: updatedPost.likes.length > 0,
      isSaved: updatedPost.savedBy.length > 0,
      linkTo: `/explore/posts/${updatedPost.id}`,
      images: [],
    };

    if (updatedPost.images.length > 0) {
      transformedPost.images = await Promise.all(
        updatedPost.images.map(async (img) => {
          const signedUrl = await safeGetSignedUrl(img.url);
          return {
            id: img.id,
            url: signedUrl ?? img.url, // Fallback to raw URL if signing fails
            description: img.description,
            isCover: img.isCover,
            createdAt: img.createdAt,
            updatedAt: img.updatedAt,
          };
        }),
      );

      const coverImage = transformedPost.images.find((img) => img.isCover);
      transformedPost.coverImage = coverImage?.url || null;
    } else {
      transformedPost.images = [];
      transformedPost.coverImage = null;
    }

    return {
      success: true,
      message: isDraft ? "Draft saved successfully" : "Post updated successfully",
      data: transformedPost,
    };
  } catch (error) {
    console.error("Post update error:", error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: "Validation failed",
        code: "VALIDATION_ERROR",
      };
    }

    // Surface upload-specific errors to the user
    if (error instanceof Error && error.message.includes("missing")) {
      return {
        success: false,
        message: error.message,
        code: "UPLOAD_MISSING",
      };
    }

    return {
      success: false,
      message: "An error occurred while updating the post",
      code: "UPDATE_POST_FAILED",
    };
  }
}
