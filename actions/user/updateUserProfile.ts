"use server";

import { z } from "zod";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-providers";
import { revalidatePath } from "next/cache";
import { 
  safeExtractKey, 
  moveFileToTrash, 
  processUploadLink,
  getSignedImageUrl,
  sanitizeS3Url,
} from "@/lib/aws_s3";

// Validation Schema
const UpdateProfileSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters").max(20).optional(),
  email: z.string().email("Invalid email address").optional(),
  bio: z.string().max(500, "Bio is too long").optional(),
  phoneNumber: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number").optional().or(z.literal("")),
  avatar: z.string().optional(), // This will be the S3 URL
});

export async function updateUserProfile(input: z.infer<typeof UpdateProfileSchema>) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, message: "Unauthorized", code: "UNAUTHORIZED" };
    }

    const userId = session.user.id;
    const validatedData = UpdateProfileSchema.parse(input);

    // 1. Fetch current user to compare changes
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!currentUser) {
      return { success: false, message: "User not found" };
    }

    const updatePayload: any = { ...validatedData };

    // 2. Check Username Uniqueness
    if (validatedData.username && validatedData.username !== currentUser.username) {
      const existingUser = await prisma.user.findUnique({
        where: { username: validatedData.username },
      });
      if (existingUser) {
        return { success: false, message: "Username is already taken", code: "USERNAME_TAKEN" };
      }
    }

    // 3. Check Email Uniqueness & Reset Verification
    if (validatedData.email && validatedData.email !== currentUser.email) {
      const existingEmail = await prisma.user.findUnique({
        where: { email: validatedData.email },
      });
      if (existingEmail) {
        return { success: false, message: "Email is already in use", code: "EMAIL_TAKEN" };
      }
      // Reset verification if email changed
      updatePayload.emailVerified = null;
    }

    // 4. Handle Avatar Processing
    if (validatedData.avatar && sanitizeS3Url(validatedData.avatar) !== sanitizeS3Url(currentUser.avatar)) {
      try {
        // Unified processor handles move from temp and sanitization
        const permanentUrl = await processUploadLink(validatedData.avatar);
        updatePayload.avatar = permanentUrl;

        // Safely handle old avatar cleanup using the hardened trash helper
        if (currentUser.avatar) {
          await moveFileToTrash(currentUser.avatar);
        }
      } catch (error: any) {
        console.error("Avatar processing error:", error);
        // If the file is missing from S3, we block the update to prevent a broken avatar
        if (error.message === "SOURCE_MISSING") {
          console.error("Avatar source missing from S3, blocking update");
          throw new Error("Your avatar upload failed. Please try uploading it again.");
        }
        throw error;
      }
    }

    // 5. Update Database
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updatePayload,
    });

    revalidatePath(`/profile/${userId}`);
    revalidatePath("/settings/profile");

    // 6. Return Signed URL for immediate frontend display
    let finalAvatar = updatedUser.avatar;
    if (finalAvatar) {
      try {
        const key = safeExtractKey(finalAvatar);
        if (key) {
          finalAvatar = await getSignedImageUrl(key);
        }
      } catch (e) {
        console.error("Failed to sign updated avatar:", e);
      }
    }

    return {
      success: true,
      message: "Profile updated successfully",
      data: {
        username: updatedUser.username,
        email: updatedUser.email,
        emailVerified: !!updatedUser.emailVerified,
        avatar: finalAvatar, // Return signed URL
      }
    };

  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, message: error.issues[0].message, code: "VALIDATION_ERROR" };
    }
    console.error("Profile Update Error:", error);
    return { success: false, message: "An unexpected error occurred" };
  }
}