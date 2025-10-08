import { useQuery } from "convex/react";
import { useMemo } from "react";
import { api } from "../../../../convex/_generated/api";
import type { Doc } from "../../../../convex/_generated/dataModel";

export function useLineMessages(lineUserId: string | null) {
  const messages = useQuery(
    api.line.messages.listByLineUser,
    lineUserId ? { lineUserId, limit: 200 } : "skip",
  );

  const normalized = useMemo(() => {
    if (!messages) {
      return [];
    }
    return messages as Doc<"messages">[];
  }, [messages]);

  return {
    messages: normalized,
    isLoading: !!lineUserId && messages === undefined,
  } as const;
}
