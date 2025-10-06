import { v } from "convex/values";
import { type LineUserSummary, lineUserSummarySchema } from "../../shared/line-user";
import { query } from "../_generated/server";

export const list = query({
  args: {
    limit: v.optional(v.number()),
    includeBlocked: v.optional(v.boolean()),
  },
  handler: async (ctx, args): Promise<LineUserSummary[]> => {
    const limit = Math.min(Math.max(args.limit ?? 50, 1), 200);
    const includeBlocked = args.includeBlocked ?? false;

    const summaries: LineUserSummary[] = [];

    const iterator = ctx.db.query("lineUserStates").withIndex("byUpdatedAt").order("desc");

    for await (const state of iterator) {
      if (!includeBlocked && state.relationshipStatus === "blocked") {
        continue;
      }

      const summary: LineUserSummary = lineUserSummarySchema.parse({
        lineUserId: state.lineUserId,
        displayName: state.displayName ?? null,
        pictureUrl: state.pictureUrl ?? null,
        statusMessage: state.statusMessage ?? null,
        lastEventType: state.lastEventType ?? null,
        lastEventAt: state.lastEventAt ?? null,
        relationshipStatus: state.relationshipStatus,
        channelMode: state.channelMode,
        lastFollowedAt: state.lastFollowedAt ?? null,
        lastUnblockedAt: state.lastUnblockedAt ?? null,
        blockedAt: state.blockedAt ?? null,
        updatedAt: state.updatedAt,
        isRedelivery: state.isRedelivery ?? null,
      });

      summaries.push(summary);

      if (summaries.length >= limit) {
        break;
      }
    }

    return summaries;
  },
});
