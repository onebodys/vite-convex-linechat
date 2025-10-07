import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { formatTimestamp } from "./datetime";

describe("formatTimestamp", () => {
  const systemTime = new Date("2025-10-07T20:00:00+09:00");

  beforeAll(() => {
    vi.useFakeTimers();
    vi.setSystemTime(systemTime);
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  it("returns empty string when timestamp is nullish", () => {
    expect(formatTimestamp(undefined)).toBe("");
    expect(formatTimestamp(null)).toBe("");
  });

  it("formats same-day timestamps with 24-hour time", () => {
    const timestamp = new Date("2025-10-07T18:06:00+09:00").getTime();
    expect(formatTimestamp(timestamp)).toBe("18:06");
  });

  it("returns '昨日' for timestamps from yesterday", () => {
    const timestamp = new Date("2025-10-06T21:30:00+09:00").getTime();
    expect(formatTimestamp(timestamp)).toBe("昨日");
  });

  it("returns weekday for timestamps within the last week", () => {
    const timestamp = new Date("2025-10-04T09:00:00+09:00").getTime();
    expect(formatTimestamp(timestamp)).toBe("土曜日");
  });

  it("returns month/day for timestamps older than a week", () => {
    const timestamp = new Date("2025-09-26T10:00:00+09:00").getTime();
    expect(formatTimestamp(timestamp)).toBe("9/26");
  });
});
