export function formatTimestamp(timestamp: number | null | undefined) {
  if (!timestamp) {
    return "";
  }

  const date = new Date(timestamp);
  const now = new Date();
  const sameDay =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();

  if (sameDay) {
    return date.toLocaleTimeString("ja-JP", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  }

  const msInDay = 24 * 60 * 60 * 1000;
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startOfTarget = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  const diffDays = Math.floor((startOfToday - startOfTarget) / msInDay);

  if (diffDays === 1) {
    return "昨日";
  }

  if (diffDays < 7) {
    return date.toLocaleDateString("ja-JP", { weekday: "long" });
  }

  return date.toLocaleDateString("ja-JP", { month: "numeric", day: "numeric" });
}
