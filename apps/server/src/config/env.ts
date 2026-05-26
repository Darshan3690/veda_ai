import { z } from "zod";

const EnvSchema = z.object({
  GEMINI_API_KEY: z.string().optional(),
  GEMINI_MODEL: z.string().optional(),
  MONGODB_URI: z.string().optional(),
  REDIS_URL: z.string().optional(),
  WEB_URL: z.string().optional(),
  PORT: z.string().optional(),
});

export const env = EnvSchema.parse(process.env);

export function getServerConfig() {
  return {
    geminiKey: env.GEMINI_API_KEY,
    geminiModel: env.GEMINI_MODEL || "gemini-flash-latest",
    mongoUri: env.MONGODB_URI,
    redisUrl: env.REDIS_URL || "redis://127.0.0.1:6379",
    webUrl: env.WEB_URL || "http://localhost:3000",
    port: Number(env.PORT || 4000),
  };
}
