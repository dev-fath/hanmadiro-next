import { z } from "zod";

const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),

  // NextAuth
  NEXTAUTH_URL: z.string().url("NEXTAUTH_URL must be a valid URL"),
  NEXTAUTH_SECRET: z.string().min(32, "NEXTAUTH_SECRET must be at least 32 characters"),

  // Firebase Admin SDK
  FIREBASE_PROJECT_ID: z.string().min(1, "FIREBASE_PROJECT_ID is required"),
  FIREBASE_PRIVATE_KEY: z.string().min(1, "FIREBASE_PRIVATE_KEY is required"),
  FIREBASE_CLIENT_EMAIL: z.string().email("FIREBASE_CLIENT_EMAIL must be a valid email"),

  // Cron API Key
  CRON_API_KEY: z.string().min(1, "CRON_API_KEY is required"),

  // Environment
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
});

export type Env = z.infer<typeof envSchema>;

let validatedEnv: Env | null = null;

export function validateEnv(): Env {
  if (validatedEnv) {
    return validatedEnv;
  }

  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    const errors = result.error.errors.map((err) => `${err.path.join(".")}: ${err.message}`).join("\n");
    throw new Error(`Environment validation failed:\n${errors}`);
  }

  validatedEnv = result.data;
  return validatedEnv;
}

export function getEnv(): Env {
  return validateEnv();
}

