import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  NEXTAUTH_SECRET: z.string().min(1),
  NEXTAUTH_URL: z.string().url(),
  SALT_ROUNDS: z.preprocess((val) => Number(val), z.number().int().positive()),
  
  // Email
  EMAIL_USER: z.string().email(),
  EMAIL_PASSWORD: z.string().min(1),
  EMAIL_FROM: z.string().email(),
  EMAIL_SECURE: z.preprocess((val) => val === "true" || val === true, z.boolean()),
  
  // Google Auth
  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_SECRET: z.string().min(1),
  
  // AWS
  AWS_ACCESS_KEY_ID: z.string().min(1),
  AWS_SECRET_ACCESS_KEY: z.string().min(1),
  AWS_REGION: z.string().min(1),
  AWS_S3_BUCKET_NAME: z.string().min(1),
  
  // Public
  NEXT_PUBLIC_APP_URL: z.string().url(),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error("❌ Invalid environment variables:");
  console.error(JSON.stringify(_env.error.format(), null, 2));
  
  // In production, we might want to throw an actual error to stop the build or start
  // In development, it's nice to see the logs
  if (process.env.NODE_ENV === "production") {
    throw new Error("Invalid environment variables. Check the logs above.");
  }
}

export const env = _env.success ? _env.data : ({} as z.infer<typeof envSchema>);
