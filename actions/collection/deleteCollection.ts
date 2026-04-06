"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-providers";
import { safeExtractKey, moveFileToTrash } from "@/lib/aws_s3";
import { revalidatePath } from "next/cache";

export async function deleteCollection(collectionId: string) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return {
        success: false,
        error: { message: "Unauthorized", code: "UNAUTHORIZED" },
      };
    }

    // 1. Find the collection AND its cover image URL
    const collection = await prisma.collection.findUnique({
      where: { id: collectionId },
      select: { userId: true, coverImage: true },
    });

    if (!collection) {
      return {
        success: false,
        error: { message: "Collection not found", code: "NOT_FOUND" },
      };
    }

    // 2. Verify Ownership
    if (collection.userId !== session.user.id) {
      return {
        success: false,
        error: { message: "Forbidden", code: "FORBIDDEN" },
      };
    }

    // 3. Delete from Database first (cascade handles related records)
    await prisma.collection.delete({ where: { id: collectionId } });

    // 4. Clear Cache
    revalidatePath("/dashboard/collections");
    revalidatePath(`/profile/${session.user.id}/collections`);

    // 5. Async S3 cleanup — fire-and-forget, never blocks the response
    //    Uses safeExtractKey (returns null instead of throwing on bad URLs)
    //    and moveFileToTrash (gracefully handles missing files)
    if (collection.coverImage) {
      const key = safeExtractKey(collection.coverImage);
      if (key && key.startsWith("uploads/")) {
        moveFileToTrash(collection.coverImage).catch((e) =>
          console.error("deleteCollection: S3 cleanup failed:", e),
        );
      }
    }

    return {
      success: true,
      message: "Collection deleted successfully",
      code: "SUCCESS",
    };
  } catch (error) {
    console.error("deleteCollection error:", error);
    return {
      success: false,
      error: { message: "Internal server error", code: "SERVER_ERROR" },
    };
  }
}
