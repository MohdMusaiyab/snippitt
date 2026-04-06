"use server";
import { getSession } from "@/lib/auth";
import {
  processUploadLink,
  safeGetSignedUrl,
  moveFileToTrash,
} from "@/lib/aws_s3";
import prisma from "@/lib/prisma";
import { updateUserSchema } from "@/schemas/user";

export async function getBasicUserDetails() {
  const session = await getSession();

  if (!session) {
    return {
      success: false,
      error: {
        message: "Unauthorized access",
        code: "UNAUTHORIZED",
      },
    };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.id },
      select: {
        id: true,
        email: true,
        username: true,
        bio: true,
        phone: true,
        avatar: true,
        isActive: true,
      },
    });

    if (!user) {
      return {
        success: false,
        error: {
          message: "User not found",
          code: "NOT_FOUND",
        },
      };
    }

    // Use safeGetSignedUrl — handles Google OAuth avatars & missing S3 files gracefully
    const signedAvatar = await safeGetSignedUrl(user.avatar);

    return {
      success: true,
      data: { ...user, avatar: signedAvatar },
      message: "User details fetched successfully",
      code: "SUCCESS",
    };
  } catch (error) {
    console.error("getBasicUserDetails error:", error);
    return {
      success: false,
      error: {
        message: "Internal server error",
        code: "SERVER_ERROR",
      },
    };
  }
}

export async function updateUserAvatar(tempUrl: string) {
  const session = await getSession();

  if (!session) {
    return {
      success: false,
      error: { message: "Unauthorized", code: "UNAUTHORIZED" },
    };
  }

  if (!tempUrl) {
    return {
      success: false,
      error: { message: "No avatar image provided", code: "NO_AVATAR" },
    };
  }

  try {
    // 1. Move from temp/ → uploads/ and get clean permanent URL
    //    processUploadLink returns the permanent URL (no ?X-Amz-Signature suffix)
    //    This is what gets stored in the DB.
    const permanentUrl = await processUploadLink(tempUrl);

    if (!permanentUrl) {
      return {
        success: false,
        error: { message: "Failed to process avatar", code: "PROCESS_FAILED" },
      };
    }

    // 2. Fetch current avatar so we can trash the old one
    const currentUser = await prisma.user.findUnique({
      where: { id: session.id },
      select: { avatar: true },
    });

    // 3. Store the clean permanent URL (NOT the signed URL) in the database
    await prisma.user.update({
      where: { id: session.id },
      data: { avatar: permanentUrl },
    });

    // 4. Soft-delete old avatar (fire-and-forget — never blocks the response)
    if (currentUser?.avatar) {
      moveFileToTrash(currentUser.avatar).catch((e) =>
        console.error("updateUserAvatar: Failed to trash old avatar:", e),
      );
    }

    // 5. Generate a fresh signed URL for immediate client display
    //    This expires in 1hr but that's fine — re-fetching will get a fresh one.
    const signedAvatarUrl = await safeGetSignedUrl(permanentUrl);

    return {
      success: true,
      message: "Avatar updated successfully",
      code: "SUCCESS",
      data: { avatar: signedAvatarUrl },
    };
  } catch (error: any) {
    if (error.message === "SOURCE_MISSING") {
      return {
        success: false,
        error: {
          message: "Upload failed — the image was not found. Please try again.",
          code: "SOURCE_MISSING",
        },
      };
    }
    console.error("updateUserAvatar error:", error);
    return {
      success: false,
      error: { message: "Internal server error", code: "SERVER_ERROR" },
    };
  }
}

export async function updateBasicUserInfo(formData: unknown) {
  const session = await getSession();

  if (!session?.id) {
    return {
      success: false,
      error: { message: "Unauthorized", code: "UNAUTHORIZED" },
    };
  }

  const parsed = updateUserSchema.safeParse(formData);

  if (!parsed.success) {
    return {
      success: false,
      error: {
        message: "Invalid input",
        code: "VALIDATION_ERROR",
        issues: parsed.error.flatten(),
      },
    };
  }

  const { username, email, bio, phone, deactivateAccount } = parsed.data;

  try {
    const updatedUser = await prisma.user.update({
      where: { id: session.id },
      data: {
        username,
        email,
        bio,
        phone,
        isActive: deactivateAccount ?? false,
      },
    });

    return {
      success: true,
      code: "SUCCESS",
      message: "Profile updated successfully",
      data: {
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        bio: updatedUser.bio,
        phone: updatedUser.phone,
        avatar: updatedUser.avatar,
        isActive: updatedUser.isActive,
      },
    };
  } catch (error) {
    console.error("updateBasicUserInfo error:", error);
    return {
      success: false,
      error: { message: "Internal server error", code: "SERVER_ERROR" },
    };
  }
}
