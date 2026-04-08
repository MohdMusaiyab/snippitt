// lib/aws_s3.ts
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  CopyObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env } from "./env";

const s3Client = new S3Client({
  region: env.AWS_REGION,
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
  },
});

const BUCKET_NAME = env.AWS_S3_BUCKET_NAME;

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

export interface PresignedUrlResponse {
  uploadUrl: string;
  key: string;
  fileUrl: string;
}

// ─────────────────────────────────────────────
// Presigned Upload URL (client → S3 direct upload)
// ─────────────────────────────────────────────

export async function generatePresignedUrl(
  fileName: string,
  fileType: string,
  userId: string,
): Promise<PresignedUrlResponse> {
  const timestamp = Date.now();
  const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
  const key = `temp/${userId}/${timestamp}-${sanitizedFileName}`;

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    ContentType: fileType,
  });

  const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
  const fileUrl = `https://${BUCKET_NAME}.s3.${env.AWS_REGION}.amazonaws.com/${key}`;

  return { uploadUrl, key, fileUrl };
}

// ─────────────────────────────────────────────
// URL Helpers
// ─────────────────────────────────────────────

/**
 * Returns true if the URL is from an external provider (Google, GitHub, etc.)
 * and should NOT be treated as an S3 key or re-signed.
 */
export function isExternalUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  return (
    url.includes("googleusercontent.com") ||
    url.includes("githubusercontent.com") ||
    url.includes("github.com") ||
    // HTTP URL that isn't our S3 bucket
    (url.startsWith("http") && !url.includes("amazonaws.com"))
  );
}

/**
 * Unified S3 URL Sanitizer.
 * Removes query parameters (?X-Amz-...) to get the clean permanent URL.
 * Safe for null/undefined inputs.
 */
export function sanitizeS3Url(url: string | null | undefined): string {
  if (!url) return "";
  try {
    const [baseUrl] = url.split(/[?#]/);
    return baseUrl;
  } catch {
    return url;
  }
}

/**
 * Checks if a URL points to a video file based on common extensions.
 */
export function isVideoUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  return /\.(mp4|webm|mov|avi|mkv|3gp)$/i.test(url.split(/[?#]/)[0]);
}

/**
 * Returns a URL optimized for the MediaRenderer.
 * For videos, it appends #t=0.1 to help browsers render the first frame as a thumbnail.
 */
export function getMediaUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  const isVideo = isVideoUrl(url);
  if (isVideo && !url.includes("#t=")) {
    return `${url}#t=0.1`;
  }
  return url;
}

/**
 * Safely extracts an S3 key from a full URL.
 * Returns null if the URL is malformed or cannot be parsed.
 * Prefer this over extractKeyFromUrl() wherever a crash is unacceptable.
 */
export function safeExtractKey(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const urlObj = new URL(url);
    // Extract key from pathname (removing leading slash)
    const fullPath = urlObj.pathname.substring(1);
    const [key] = fullPath.split(/[?#]/);

    // Warn if hostname doesn't look like our bucket (optional but useful for debugging)
    const expectedPrefix = `${BUCKET_NAME}.s3`;
    if (
      !urlObj.hostname.includes(expectedPrefix) &&
      !urlObj.hostname.includes("amazonaws.com")
    ) {
      console.warn(
        `safeExtractKey: URL domain mismatch: ${urlObj.hostname}`,
      );
    }

    return key || null;
  } catch {
    // If it's already a raw key (not a full URL), return it if it looks valid
    if (url.includes("/") && !url.includes("://")) {
      return url.split(/[?#]/)[0];
    }
    return null;
  }
}

/**
 * Legacy wrapper — throws if key cannot be extracted.
 * Use safeExtractKey() in new code.
 */
export function extractKeyFromUrl(url: string): string {
  const key = safeExtractKey(url);
  if (!key) throw new Error("INVALID_S3_URL");
  return key;
}

// ─────────────────────────────────────────────
// S3 File Existence Check
// ─────────────────────────────────────────────

/**
 * Checks if a file exists in S3 using HeadObject.
 * Returns false (not throws) for 404 / NoSuchKey.
 */
export async function checkFileExists(key: string): Promise<boolean> {
  try {
    await s3Client.send(
      new HeadObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
      }),
    );
    return true;
  } catch (error: any) {
    if (
      error.name === "NotFound" ||
      error.name === "NoSuchKey" ||
      error.$metadata?.httpStatusCode === 404
    ) {
      return false;
    }
    throw error; // Re-throw unexpected errors
  }
}

// ─────────────────────────────────────────────
// Signed View URLs (reading files)
// ─────────────────────────────────────────────

/**
 * Generates a presigned GET URL for viewing a private S3 object.
 * Expires in 1 hour.
 */
export async function generatePresignedViewUrl(key: string): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  return getSignedUrl(s3Client, command, { expiresIn: 60 * 60 });
}

/** Modern alias */
export const getSignedImageUrl = generatePresignedViewUrl;

/**
 * THE SAFE, UNIVERSAL URL SIGNER — use this everywhere.
 *
 * - External URLs (Google, GitHub avatars) → returned as-is.
 * - S3 URLs → key extracted and signed.
 * - Missing/malformed/gone-from-S3 → returns null (never throws).
 *
 * When this returns null, the UI should show a placeholder/fallback image.
 */
export async function safeGetSignedUrl(
  url: string | null | undefined,
): Promise<string | null> {
  if (!url) return null;

  // External OAuth avatars (Google, GitHub) don't need signing
  if (isExternalUrl(url)) return url;

  try {
    const key = safeExtractKey(url);
    if (!key) {
      console.warn(`safeGetSignedUrl: Could not extract S3 key from: ${url}`);
      return null;
    }
    return await generatePresignedViewUrl(key);
  } catch (error) {
    // This catches: missing files, network issues, invalid keys, etc.
    // We log it but NEVER crash the page — let the UI show a fallback.
    console.warn(
      `safeGetSignedUrl: Could not sign URL (file may be missing from S3): ${url}`,
      error,
    );
    return null;
  }
}

// ─────────────────────────────────────────────
// File Lifecycle Management
// ─────────────────────────────────────────────

/**
 * Moves a file from temp/ to uploads/ (makes it permanent).
 *
 * Operation order (important for atomicity):
 *   1. Verify the source exists — fail fast, no wasted API calls.
 *   2. Copy to permanent key (uploads/).
 *   3. Delete from temp/ — ONLY after copy succeeds.
 *
 * If already in uploads/, returns the permanent URL immediately (idempotent).
 */
export async function changeFileVisibility(oldKey: string): Promise<string> {
  // Idempotency guard: already permanent
  if (oldKey.startsWith("uploads/")) {
    return `https://${BUCKET_NAME}.s3.${env.AWS_REGION}.amazonaws.com/${oldKey}`;
  }

  // Fail fast: verify the source file exists before attempting any copy
  const exists = await checkFileExists(oldKey);
  if (!exists) {
    console.error(`changeFileVisibility: Source file missing in S3: ${oldKey}`);
    throw new Error("SOURCE_MISSING");
  }

  const fileName = oldKey.split("/").pop()!;
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).slice(2, 8);
  const newKey = `uploads/${timestamp}-${randomSuffix}-${fileName}`;

  try {
    // Step 1: Copy to permanent location
    await s3Client.send(
      new CopyObjectCommand({
        Bucket: BUCKET_NAME,
        CopySource: encodeURI(`${BUCKET_NAME}/${oldKey}`),
        Key: newKey,
      }),
    );

    // Step 2: Delete from temp — only after the copy succeeds
    await deleteFile(oldKey);

    return `https://${BUCKET_NAME}.s3.${env.AWS_REGION}.amazonaws.com/${newKey}`;
  } catch (error: any) {
    // Handle race condition where file disappeared between the check and the copy
    if (
      error.Code === "NoSuchKey" ||
      error.$metadata?.httpStatusCode === 404
    ) {
      throw new Error("SOURCE_MISSING");
    }
    throw error;
  }
}

/**
 * Soft-deletes a file by moving it to trash/ instead of hard-deleting.
 * Gracefully handles: non-S3 URLs, missing files, malformed keys.
 * Never throws — safe for fire-and-forget cleanup.
 */
export async function moveFileToTrash(urlOrKey: string): Promise<void> {
  try {
    const key = urlOrKey.includes("://")
      ? safeExtractKey(urlOrKey)
      : urlOrKey;

    if (!key) {
      console.warn(`moveFileToTrash: Skipping — cannot extract key from: ${urlOrKey}`);
      return;
    }

    // Skip external URLs (Google avatars, etc.)
    if (isExternalUrl(urlOrKey)) {
      return;
    }

    const exists = await checkFileExists(key);
    if (!exists) {
      console.warn(`moveFileToTrash: File not found in S3 (already deleted?): ${key}`);
      return; // Already gone — not an error
    }

    const fileName = key.split("/").pop()!;
    const trashKey = `trash/${Date.now()}-${fileName}`;

    await s3Client.send(
      new CopyObjectCommand({
        Bucket: BUCKET_NAME,
        CopySource: encodeURI(`${BUCKET_NAME}/${key}`),
        Key: trashKey,
      }),
    );

    await deleteFile(key);
  } catch (error) {
    // Never crash the caller — cleanup failures are logged, not fatal
    console.error("moveFileToTrash: Soft delete failed:", error);
  }
}

/**
 * Hard-deletes a file from S3 by key.
 * Use moveFileToTrash() for user-initiated deletions (recoverable).
 * Use this only for truly temporary/orphaned files.
 */
export async function deleteFile(key: string): Promise<void> {
  await s3Client.send(
    new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    }),
  );
}

// ─────────────────────────────────────────────
// Unified Upload Processor
// ─────────────────────────────────────────────

/**
 * The main entry point for processing an uploaded URL after form submission.
 *
 * - If temp/ URL → moves to uploads/ (permanent), returns clean URL.
 * - If already uploads/ or external → returns sanitized URL as-is.
 * - If null/empty → returns null.
 * - If file is missing from S3 → throws Error("SOURCE_MISSING").
 *
 * This is the ONLY function callers should use to "commit" an upload.
 */
export async function processUploadLink(
  url: string | null | undefined,
): Promise<string | null> {
  if (!url) return null;

  const key = safeExtractKey(url);

  // Non-S3 or malformed URL → return sanitized version as-is
  if (!key) return sanitizeS3Url(url);

  // Temp upload → move to permanent storage
  if (key.startsWith("temp/")) {
    try {
      return await changeFileVisibility(key);
    } catch (error: any) {
      if (error.message === "SOURCE_MISSING") {
        console.error(
          `processUploadLink: Temp file is missing in S3 — upload may have failed: ${url}`,
        );
        throw error; // Let the caller decide how to handle a broken upload
      }
      throw error;
    }
  }

  // Already permanent key or unknown S3 path → just sanitize and return
  return sanitizeS3Url(url);
}

// ─────────────────────────────────────────────
// Bulk Helpers (for post/collection queries)
// ─────────────────────────────────────────────

type PostWithImages = {
  id: string;
  coverImage: string | null;
  images: { url: string }[];
};

/**
 * Signs all image URLs in a list of posts in parallel.
 * Uses safeGetSignedUrl so missing files degrade gracefully.
 */
export async function enhancePostsWithSignedUrls(posts: PostWithImages[]) {
  return Promise.all(
    posts.map(async (post) => {
      if (post.coverImage) {
        post.coverImage = await safeGetSignedUrl(post.coverImage);
      }

      post.images = await Promise.all(
        post.images.map(async (img) => {
          const signedUrl = await safeGetSignedUrl(img.url);
          return { ...img, url: signedUrl ?? img.url };
        }),
      );

      return post;
    }),
  );
}

// ─────────────────────────────────────────────
// Legacy / Compat
// ─────────────────────────────────────────────

/** @deprecated Use safeExtractKey() in new code */
export function generateFinalKey(
  _userId: string,
  _postId: string,
  fileName: string,
): string {
  const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
  const randomSuffix = Math.random().toString(36).slice(2, 8);
  return `uploads/${randomSuffix}-${sanitizedFileName}`;
}
