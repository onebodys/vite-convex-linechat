import { internalMutation } from "../_generated/server";

const clampSummary = (value: string | null | undefined, max = 140) => {
  if (!value) {
    return undefined;
  }
  return value.length > max ? value.slice(0, max) : value;
};

type LegacyMessage = {
  text?: string;
  errorMessage?: string;
  retryCount?: number;
  nextRetryAt?: number;
  lastAttemptAt?: number;
};

export const migrateRichMessaging = internalMutation({
  args: {},
  handler: async (ctx) => {
    let migratedMessages = 0;
    let patchedEvents = 0;
    let patchedStates = 0;
    const now = Date.now();

    for await (const message of ctx.db.query("messages")) {
      const patch: Record<string, unknown> = {};
      const legacy = message as typeof message & LegacyMessage;

      if (!message.content) {
        const text = legacy.text ?? "";
        patch.content = {
          kind: "text" as const,
          text,
        };
        patch.updatedAt = message.updatedAt ?? message.createdAt ?? now;
        migratedMessages += 1;
      } else if (!message.updatedAt) {
        patch.updatedAt = message.createdAt ?? now;
      }

      if ("text" in legacy) {
        patch.text = undefined;
      }

      if ("errorMessage" in legacy) {
        patch.errorMessage = undefined;
      }

      if ("retryCount" in legacy) {
        patch.retryCount = undefined;
      }

      if ("nextRetryAt" in legacy) {
        patch.nextRetryAt = undefined;
      }

      if ("lastAttemptAt" in legacy) {
        patch.lastAttemptAt = undefined;
      }

      if (Object.keys(patch).length > 0) {
        await ctx.db.patch(message._id, patch);
      }
    }

    for await (const event of ctx.db.query("lineEvents")) {
      if (!event.source) {
        await ctx.db.patch(event._id, { source: "webhook" as const });
        patchedEvents += 1;
      }
    }

    for await (const state of ctx.db.query("lineUserStates")) {
      const patch: Record<string, unknown> = {};

      if (!state.lastMessageSummary && (state as { lastMessageText?: string }).lastMessageText) {
        const summary = clampSummary((state as { lastMessageText?: string }).lastMessageText);
        patch.lastMessageSummary = summary;
        patch.lastMessagePreviewType = summary ? ("text" as const) : undefined;
      }

      if ((state as { lastMessageText?: string }).lastMessageText !== undefined) {
        patch.lastMessageText = undefined;
      }

      if (Object.keys(patch).length > 0) {
        await ctx.db.patch(state._id, patch);
        patchedStates += 1;
      }
    }

    return {
      migratedMessages,
      patchedEvents,
      patchedStates,
      migratedAt: now,
    } as const;
  },
});
