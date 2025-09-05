import { Hono } from "hono";

const app = new Hono<{ Bindings: CloudflareBindings }>();

app.get("/auth/:token", (c) => {
  const token = c.req.param("token");
  if (c.env.TOKEN === token) {
    return c.json({ success: true, msg: "login success" });
  }
  return c.json({ success: false, msg: "login fail" }, 403);
});

export default app