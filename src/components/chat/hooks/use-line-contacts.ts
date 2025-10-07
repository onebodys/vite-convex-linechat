import { useQuery } from "convex/react";
import { useMemo } from "react";
import { api } from "../../../../convex/_generated/api";
import { type LineUserSummary, lineUserSummarySchema } from "../../../../shared/line-user";
import type { Contact } from "../mock-data";
import { mapLineUserToContact } from "../utils";

export function useLineContacts(limit = 50) {
  const lineUsers = useQuery(api.line.users.list, { limit, includeBlocked: false });

  const validatedUsers = useMemo(() => {
    if (!lineUsers) {
      return undefined;
    }

    const valid: LineUserSummary[] = [];

    for (const entry of lineUsers) {
      const result = lineUserSummarySchema.safeParse(entry);
      if (result.success) {
        valid.push(result.data);
      } else {
        console.warn("Invalid LINE user entry", result.error.flatten());
      }
    }

    return valid;
  }, [lineUsers]);

  const contacts = useMemo(() => {
    if (!validatedUsers) {
      return undefined;
    }
    return validatedUsers.map<Contact>((user) => mapLineUserToContact(user));
  }, [validatedUsers]);

  return {
    contacts,
    isLoading: lineUsers === undefined,
  } as const;
}
