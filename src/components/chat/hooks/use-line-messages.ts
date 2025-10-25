import { useQuery } from "convex/react";
import { useMemo } from "react";
import { api } from "../../../../convex/_generated/api";
import type { TimelineEntry } from "../types";

/**
 * @description Convexのタイムライン用クエリを購読し、UIが扱いやすい形で返すフック。
 */
export function useLineMessages(lineUserId: string | null) {
  const messages = useQuery(
    api.line.messages.listTimelineByLineUser,
    lineUserId ? { lineUserId, limit: 200 } : "skip",
  );

  const normalized = useMemo<TimelineEntry[]>(() => {
    if (!messages) {
      return [];
    }
    return messages as TimelineEntry[];
  }, [messages]);

  return {
    messages: normalized,
    isLoading: !!lineUserId && messages === undefined,
  } as const;
}
