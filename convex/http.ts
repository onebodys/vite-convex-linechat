import { httpRouter } from "convex/server";
import { webhook } from "./line/webhook";

const http = httpRouter();

http.route({
  path: "/line/webhook",
  method: "POST",
  handler: webhook,
});
export default http;
