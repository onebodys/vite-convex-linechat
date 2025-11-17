import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";

export function useLineNotes(lineUserId: string | null) {
  const notes = useQuery(api.line.notes.listByLineUser, lineUserId ? { lineUserId } : "skip");

  return {
    notes: notes ?? [],
    isLoading: !!lineUserId && notes === undefined,
  } as const;
}
