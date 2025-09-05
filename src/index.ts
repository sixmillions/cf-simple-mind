import { Hono } from "hono";
import { cors } from "hono/cors";
import apiAuth from "./api/apiAuth";
import apiMind from "./api/apiMind";
import apiTrigger from "./api/apiTrigger";
import apiDemo from "./api/apiDemo";
import apiHistory from "./api/apiHistory";
import { scheduled } from "./mindScheduled";

const app = new Hono<{ Bindings: CloudflareBindings }>();

app.use("*", cors());

// https://hono.dev/docs/api/routing#grouping-without-changing-base
app.route("/api", apiAuth);
app.route("/api", apiMind);
app.route("/api", apiTrigger);
app.route("/api", apiDemo);
app.route("/api", apiHistory);

export default {
  fetch: app.fetch,
  scheduled,
};