/**
 * 必須の環境変数チェック
 */
const requiredKeys = ["LINE_CHANNEL_SECRET", "LINE_CHANNEL_ACCESS_TOKEN"] as const;

type RequiredKey = (typeof requiredKeys)[number];

type EnvShape = Record<RequiredKey, string>;

const missingKeys: RequiredKey[] = [];
const envValues: Partial<EnvShape> = {};

for (const key of requiredKeys) {
  const value = process.env[key];
  if (!value) {
    missingKeys.push(key);
    continue;
  }
  envValues[key] = value;
}

if (missingKeys.length > 0) {
  throw new Error(
    `Missing environment variables: ${missingKeys.join(", ")}. ` +
      "Please set them before starting the Convex functions.",
  );
}

export const env = envValues as EnvShape;
