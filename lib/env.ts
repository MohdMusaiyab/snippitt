import { z } from "zod";

const serverSchema = z.object({
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
});

const clientSchema = z.object({
  // Public
  NEXT_PUBLIC_APP_URL: z.string().url(),
});

// We must destructure process.env so Webpack can inline the variables effectively on the client side.
const processEnv = {
  DATABASE_URL: process.env.DATABASE_URL,
  NODE_ENV: process.env.NODE_ENV,
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  SALT_ROUNDS: process.env.SALT_ROUNDS,
  EMAIL_USER: process.env.EMAIL_USER,
  EMAIL_PASSWORD: process.env.EMAIL_PASSWORD,
  EMAIL_FROM: process.env.EMAIL_FROM,
  EMAIL_SECURE: process.env.EMAIL_SECURE,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
  AWS_REGION: process.env.AWS_REGION,
  AWS_S3_BUCKET_NAME: process.env.AWS_S3_BUCKET_NAME,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
};

const isServer = typeof window === "undefined";

const parsed = isServer 
  ? serverSchema.merge(clientSchema).safeParse(processEnv)
  : clientSchema.safeParse({
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    });

if (!parsed.success) {
  console.error("❌ Invalid environment variables:");
  console.error(JSON.stringify(parsed.error.format(), null, 2));
  
  if (process.env.NODE_ENV === "production" && isServer) {
    throw new Error("Invalid environment variables. Check the logs above.");
  }
}

export const env = parsed.success 
  ? (parsed.data as z.infer<typeof serverSchema> & z.infer<typeof clientSchema>) 
  : (processEnv as unknown as z.infer<typeof serverSchema> & z.infer<typeof clientSchema>);
