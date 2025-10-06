import { z } from "zod/v4";

const envSchema = z.looseObject({
  LINE_CHANNEL_SECRET: z.string().min(1, { error: "LINE_CHANNEL_SECRET must be defined" }),
  LINE_CHANNEL_ACCESS_TOKEN: z
    .string()
    .min(1, { error: "LINE_CHANNEL_ACCESS_TOKEN must be defined" }),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  const issues = parsedEnv.error.issues.map((issue) => issue.message).join("\n - ");
  throw new Error(`Invalid environment variables:\n - ${issues}`);
}

export const env = parsedEnv.data;
