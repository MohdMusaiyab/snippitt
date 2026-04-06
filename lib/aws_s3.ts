// lib/aws-s3.ts
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

export interface PresignedUrlResponse {
  uploadUrl: string;
  key: string;
  fileUrl: string;
}

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

  return {
    uploadUrl,
    key,
    fileUrl,
  };
}

/**
 * Checks if a file exists in S3 using HeadObject
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
    if (error.name === "NotFound" || error.$metadata?.httpStatusCode === 404) {
      return false;
    }
    throw error;
  }
}

// export async function changeFileVisibility(oldKey: string): Promise<string> {
//   // 1. If it's already an upload key, don't try to move it!
//   if (oldKey.startsWith("uploads/")) {
//     return `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${oldKey}`;
//   }

//   const fileName = oldKey.split("/").pop()!;
//   const newKey = `uploads/${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${fileName}`;

//   try {
//     await s3Client.send(
//       new CopyObjectCommand({
//         Bucket: BUCKET_NAME,
//         CopySource: encodeURI(`${BUCKET_NAME}/${oldKey}`), // Always encode!
//         Key: newKey,
//       }),
//     );

//     await deleteFile(oldKey);
//     return `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${newKey}`;
//   } catch (error: any) {
//     // 2. If the file is missing, it likely moved in a previous (failed) attempt
//     if (error.Code === "NoSuchKey" || error.$metadata?.httpStatusCode === 404) {
//       console.warn(
//         "File already moved or missing. Checking if it exists in destination...",
//       );
//       // Logic: If we can't find it in temp, we assume it's either gone or already handled.
//       // You can return a special string or handle it gracefully in the caller.
//       throw new Error("SOURCE_MISSING");
//     }
//     throw error;
//   }
// }
export async function changeFileVisibility(oldKey: string): Promise<string> {
  // 1. Guard: If it's already an upload key, just return the full URL
  if (oldKey.startsWith("uploads/")) {
    return `https://${BUCKET_NAME}.s3.${env.AWS_REGION}.amazonaws.com/${oldKey}`;
  }

  // 2. STRICTOR CHECK: Verify the source file actually exists before we try anything
  const exists = await checkFileExists(oldKey);
  if (!exists) {
    console.error(`Attempted to move non-existent S3 file: ${oldKey}`);
    throw new Error("SOURCE_MISSING");
  }

  const fileName = oldKey.split("/").pop()!;
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).slice(2, 8);

  const newKey = `uploads/${timestamp}-${randomSuffix}-${fileName}`;
  const trashKey = `trash/${timestamp}-${fileName}`;

  try {
    // 3. Copy to Permanent Location (uploads/)
    await s3Client.send(
      new CopyObjectCommand({
        Bucket: BUCKET_NAME,
        CopySource: encodeURI(`${BUCKET_NAME}/${oldKey}`),
        Key: newKey,
      }),
    );

    // 4. Copy to Safety Location (trash/)
    // This allows us to recover files if the DB transaction fails later
    await s3Client.send(
      new CopyObjectCommand({
        Bucket: BUCKET_NAME,
        CopySource: encodeURI(`${BUCKET_NAME}/${oldKey}`),
        Key: trashKey,
      }),
    );

    // 5. Delete from Temp
    await deleteFile(oldKey);

    return `https://${BUCKET_NAME}.s3.${env.AWS_REGION}.amazonaws.com/${newKey}`;
  } catch (error: any) {
    // 6. Handle Retry Logic if it disappeared between check and copy (rare race condition)
    if (error.Code === "NoSuchKey" || error.$metadata?.httpStatusCode === 404) {
      throw new Error("SOURCE_MISSING");
    }
    throw error;
  }
}

/**
 * Helper to move existing files to trash instead of permanent deletion.
 * Gracefully handles non-S3 URLs or missing files.
 */
export async function moveFileToTrash(urlOrKey: string): Promise<void> {
  try {
    const key = urlOrKey.includes("://") ? safeExtractKey(urlOrKey) : urlOrKey;
    if (!key) {
      console.warn(`Skipping trash for non-S3 or malformed URL: ${urlOrKey}`);
      return;
    }

    const exists = await checkFileExists(key);
    if (!exists) {
      console.warn(`Attempted to trash non-existent S3 file: ${key}`);
      return;
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
    console.error("Soft delete to trash failed:", error);
  }
}
export async function deleteFile(key: string): Promise<void> {
  const deleteCommand = new DeleteObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  await s3Client.send(deleteCommand);
}

export function generateFinalKey(
  _userId: string, // Not needed anymore (kept for backward compatibility)
  _postId: string, // Not needed anymore
  fileName: string, // Original filename
  // // Optional (unused in new structure)
): string {
  const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
  const randomSuffix = Math.random().toString(36).slice(2, 8); // Avoid collisions
  return `uploads/${randomSuffix}-${sanitizedFileName}`;
}
/**
 * Unified S3 URL Sanitizer
 * Removes query parameters and ensuring consistent formatting.
 * Safe for null/undefined inputs.
 */
export function sanitizeS3Url(url: string | null | undefined): string {
  if (!url) return "";
  try {
    // If it's a full URL, split at '?' or '#'
    const [baseUrl] = url.split(/[?#]/);
    return baseUrl;
  } catch {
    return url;
  }
}

/**
 * Safely extracts an S3 key from a URL.
 * Returns null if the URL is malformed or doesn't belong to our bucket.
 */
export function safeExtractKey(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const urlObj = new URL(url);
    // Extract key from pathname (removing leading slash)
    const fullPath = urlObj.pathname.substring(1);
    const [key] = fullPath.split(/[?#]/);

    // Basic validation: Is it ours? (Optional but recommended)
    const expectedPrefix = `${BUCKET_NAME}.s3`;
    if (!urlObj.hostname.includes(expectedPrefix) && !urlObj.hostname.includes("amazonaws.com")) {
       // Log warning but allow if it looks like a relative path or custom domain
       console.warn(`URL domain mismatch for S3 key extraction: ${urlObj.hostname}`);
    }

    return key || null;
  } catch (error) {
    // If it's already a key (not a URL), return as is if it looks like a path
    if (url.includes("/") && !url.includes("://")) {
      return url.split(/[?#]/)[0];
    }
    return null;
  }
}

/**
 * Legacy wrapper for compatibility
 */
export function extractKeyFromUrl(url: string): string {
  const key = safeExtractKey(url);
  if (!key) throw new Error("INVALID_S3_URL");
  return key;
}

//Utitlity function to get Images with presigned URLs
export async function generatePresignedViewUrl(key: string): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  const signedUrl = await getSignedUrl(s3Client, command, {
    expiresIn: 60 * 60, // 1 hour
  });

  return signedUrl;
}

/**
 * Modern alias for generatePresignedViewUrl
 */
export const getSignedImageUrl = generatePresignedViewUrl;
type PostWithImages = {
  id: string;
  coverImage: string | null;
  images: { url: string }[];
};
export async function enhancePostsWithSignedUrls(posts: PostWithImages[]) {
  return Promise.all(
    posts.map(async (post) => {
      if (post.coverImage) {
        const coverKey = safeExtractKey(post.coverImage);
        if (coverKey) {
          post.coverImage = await generatePresignedViewUrl(coverKey);
        }
      }

      post.images = await Promise.all(
        post.images.map(async (img) => {
          const key = safeExtractKey(img.url);
          if (key) {
            const signedUrl = await generatePresignedViewUrl(key);
            return { ...img, url: signedUrl };
          }
          return img; // Return original if not an S3 key
        }),
      );

      return post;
    }),
  );
}

/**
 * Unified Upload Processor
 * Handles the transition from temp to permanent storage.
 * Gracefully ignores non-S3/legacy URLs.
 */
export async function processUploadLink(url: string | null | undefined): Promise<string | null> {
  if (!url) return null;
  
  const key = safeExtractKey(url);
  // If we can't extract a key, it's either an external URL or malformed. 
  // Return sanitized version of the original.
  if (!key) return sanitizeS3Url(url);

  // If it's a temp upload, move to permanent
  if (key.startsWith("temp/")) {
    try {
      return await changeFileVisibility(key);
    } catch (error: any) {
      if (error.message === "SOURCE_MISSING") {
         // Log and re-throw so the caller knows the upload is actually broken
         console.error(`PROCESS_UPLOAD_FAILED: Temp file missing in S3: ${url}`);
         throw error;
      }
      throw error;
    }
  }

  // Already permanent or unknown S3 path, return sanitized URL
  return sanitizeS3Url(url);
}
