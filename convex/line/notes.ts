import { v } from "convex/values";
import { mutation, query } from "../_generated/server";

const MAX_NOTE_LENGTH = 300;
const MAX_NOTES_PER_USER = 20;

export const listByLineUser = query({
  args: { lineUserId: v.string() },
  handler: async (ctx, { lineUserId }) => {
    return ctx.db
      .query("lineUserNotes")
      .withIndex("byLineUserIdCreatedAt", (q) => q.eq("lineUserId", lineUserId))
      .order("desc")
      .take(MAX_NOTES_PER_USER);
  },
});

export const create = mutation({
  args: { lineUserId: v.string(), body: v.string() },
  handler: async (ctx, { lineUserId, body }) => {
    const trimmed = body.trim();

    if (trimmed.length === 0) {
      throw new Error("ノートの内容を入力してください。");
    }
    if (trimmed.length > MAX_NOTE_LENGTH) {
      throw new Error("ノートは300文字以内で入力してください。");
    }

    const existingNotes = await ctx.db
      .query("lineUserNotes")
      .withIndex("byLineUserIdCreatedAt", (q) => q.eq("lineUserId", lineUserId))
      .order("desc")
      .take(MAX_NOTES_PER_USER);

    if (existingNotes.length >= MAX_NOTES_PER_USER) {
      throw new Error("ノートは20件までです。不要なノートを削除してください。");
    }

    const now = Date.now();
    const noteId = await ctx.db.insert("lineUserNotes", {
      lineUserId,
      body: trimmed,
      createdAt: now,
      updatedAt: now,
    });

    return noteId;
  },
});

export const remove = mutation({
  args: { noteId: v.id("lineUserNotes") },
  handler: async (ctx, { noteId }) => {
    await ctx.db.delete(noteId);
  },
});
