"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-providers";
import { revalidatePath } from "next/cache";
import {
  safeExtractKey,
  processUploadLink,
  moveFileToTrash,
  getSignedImageUrl,
  sanitizeS3Url,
} from "@/lib/aws_s3";
import { z } from "zod";

const UpdateCollectionSchema = z.object({
  collectionId: z.string(),
  name: z.string().min(1, "Name is required").max(50),
  description: z.string().max(200).optional(),
  visibility: z.enum(["PUBLIC", "PRIVATE", "FOLLOWERS"]),
  coverImage: z.string().nullable().optional(),
});

export async function updateCollection(
  input: z.infer<typeof UpdateCollectionSchema>,
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, message: "Unauthorized" };
    }

    const userId = session.user.id;
    const { collectionId, ...data } = UpdateCollectionSchema.parse(input);

    // 1. Verify Ownership
    const existingCollection = await prisma.collection.findUnique({
      where: { id: collectionId },
    });

    if (!existingCollection) {
      return { success: false, message: "Collection not found" };
    }

    if (existingCollection.userId !== userId) {
      return {
        success: false,
        message: "You do not have permission to edit this collection",
      };
    }

    const updatePayload: any = {
      name: data.name,
      description: data.description,
      visibility: data.visibility,
    };

    // 2. Handle Cover Image S3 Logic
    if (data.coverImage && sanitizeS3Url(data.coverImage) !== sanitizeS3Url(existingCollection.coverImage)) {
      try {
        // Unified processor handles moved from temp, skipping non-S3, and sanitization
        const permanentUrl = await processUploadLink(data.coverImage);
        updatePayload.coverImage = permanentUrl;

        // Safely handle old cover image cleanup using the hardened trash helper
        if (existingCollection.coverImage) {
          await moveFileToTrash(existingCollection.coverImage);
        }
      } catch (error: any) {
        if (error.message === "SOURCE_MISSING") {
          console.error("Cover image missing from S3, blocking update to prevent broken link");
          throw new Error("The selected cover image is missing. Please try uploading it again.");
        }
        throw error;
      }
    }

    // 3. Update Database
    const updated = await prisma.collection.update({
      where: { id: collectionId },
      data: updatePayload,
    });

    // 4. Revalidate cache
    revalidatePath(`/explore/collections/${collectionId}`);
    revalidatePath(`/collections`);
    revalidatePath(`/profile/${userId}/collections`);

    // 5. Sign the cover image for immediate frontend display
    if (updated.coverImage) {
      try {
        const key = safeExtractKey(updated.coverImage);
        if (key) {
          updated.coverImage = await getSignedImageUrl(key);
        }
      } catch (e) {
        console.error("Failed to sign collection cover image:", e);
      }
    }

    return {
      success: true,
      message: "Collection updated successfully",
      data: updated,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("Validation Error:", error.issues);
      return { success: false, message: error.issues[0].message };
    }
    console.error("updateCollection Error:", error);
    return { success: false, message: "An unexpected error occurred" };
  }
}
