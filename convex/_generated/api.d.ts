/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as http from "../http.js";
import type * as line_actions from "../line/actions.js";
import type * as line_content from "../line/content.js";
import type * as line_events from "../line/events.js";
import type * as line_message_deliveries from "../line/message_deliveries.js";
import type * as line_message_delivery from "../line/message_delivery.js";
import type * as line_messages from "../line/messages.js";
import type * as line_messaging_client from "../line/messaging_client.js";
import type * as line_tasks from "../line/tasks.js";
import type * as line_users from "../line/users.js";
import type * as line_webhook from "../line/webhook.js";
import type * as maintenance_migrations from "../maintenance/migrations.js";
import type * as scheduler from "../scheduler.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  http: typeof http;
  "line/actions": typeof line_actions;
  "line/content": typeof line_content;
  "line/events": typeof line_events;
  "line/message_deliveries": typeof line_message_deliveries;
  "line/message_delivery": typeof line_message_delivery;
  "line/messages": typeof line_messages;
  "line/messaging_client": typeof line_messaging_client;
  "line/tasks": typeof line_tasks;
  "line/users": typeof line_users;
  "line/webhook": typeof line_webhook;
  "maintenance/migrations": typeof maintenance_migrations;
  scheduler: typeof scheduler;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
