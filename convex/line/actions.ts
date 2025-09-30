"use node";

import crypto from "node:crypto";
import { v } from "convex/values";
import { internalAction } from "../_generated/server";

type VerificationResult = { valid: true } | { valid: false };

function getChannelSecret(): string {
  const secret = process.env.LINE_CHANNEL_SECRET;
  if (!secret) {
    throw new Error("Missing LINE_CHANNEL_SECRET env var");
  }
  return secret;
}

function computeSignature(secret: string, body: string): Buffer {
  const signature = crypto.createHmac("sha256", secret).update(body, "utf8").digest("base64");
  return Buffer.from(signature, "base64");
}

function isSignatureValid(secret: string, body: string, signature: string): boolean {
  if (!signature) {
    return false;
  }
  const expected = computeSignature(secret, body);
  const received = Buffer.from(signature, "base64");
  if (expected.length !== received.length) {
    return false;
  }
  return crypto.timingSafeEqual(expected, received);
}

export const verifyWebhookSignature = internalAction({
  args: {
    body: v.string(),
    signature: v.string(),
  },
  handler: async (_ctx, { body, signature }): Promise<VerificationResult> => {
    const secret = getChannelSecret();
    const valid = isSignatureValid(secret, body, signature);
    return valid ? { valid: true } : { valid: false };
  },
});

export const verifyAndParseWebhook = internalAction({
  args: {
    body: v.string(),
    signature: v.string(),
  },
  handler: async (_ctx, { body, signature }) => {
    const secret = getChannelSecret();
    const valid = isSignatureValid(secret, body, signature);
    if (!valid) {
      return { valid: false as const };
    }

    try {
      const payload = JSON.parse(body);
      return { valid: true as const, payload };
    } catch (error) {
      const reason = error instanceof Error ? error.message : "Unknown error";
      throw new Error(`Failed to parse webhook body: ${reason}`);
    }
  },
});
