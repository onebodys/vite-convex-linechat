import type { Doc } from "../_generated/dataModel";
import { createMessageSummary, messageSummaryMaxLength } from "../lib/message_model";

const BASE_BACKOFF_MS = 30_000;
const MAX_BACKOFF_MS = 5 * 60_000;

const legacyTextContent = (text?: string) =>
  ({
    kind: "text",
    text: text ?? "",
  }) as const;

/**
 * @description Convexスケジューラが利用する指数バックオフ計算。試行回数に応じて再試行までの遅延を決定する。
 */
export function computeNextRetry(attempts: number, now: number) {
  const exponent = Math.max(attempts - 1, 0);
  const delay = Math.min(BASE_BACKOFF_MS * 2 ** exponent, MAX_BACKOFF_MS);
  return now + delay;
}

/**
 * @description 送信メッセージドキュメントからテキスト本文を安全に抽出する。レガシーデータでcontentが欠損していても対応する。
 */
export function ensureOutgoingTextContent(message: Doc<"messages">) {
  const legacy = (message as unknown as { text?: string }).text;
  const content = message.content ?? legacyTextContent(legacy);
  if (content.kind !== "text") {
    throw new Error("Outgoing message is not text content");
  }
  const normalized = content.text ?? "";
  return {
    text: normalized,
    content: {
      kind: "text" as const,
      text: normalized,
    },
  };
}

/**
 * @description ログ表示やUIステータス用にテキスト本文を要約する。
 */
export function summarizeTextBody(text: string) {
  return createMessageSummary(legacyTextContent(text));
}

/**
 * @description 任意のメッセージcontentから要約文字列を取得する。空の場合は既定のラベルを返す。
 */
export function summarizeMessageContent(content: Doc<"messages">["content"], fallback?: string) {
  return createMessageSummary(content, fallback);
}

export const messageSummaryLimit = messageSummaryMaxLength;
