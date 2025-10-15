import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.interval("retryFailedMessages", { minutes: 1 }, internal.line.tasks.retryFailedMessages, {});

export default crons;
