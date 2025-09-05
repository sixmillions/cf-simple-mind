import { Hono } from "hono";
import { bearerAuth } from "hono/bearer-auth";
import { TriggerConfig } from "../types";

const app = new Hono<{ Bindings: CloudflareBindings }>();

app.use(
  "/*",
  bearerAuth({
    verifyToken: async (token, c) => {
      return token === c.env.TOKEN
    },
  })
);

// Get all triggers
app.get("/trigger", async (c) => {
  try {
    const triggers = await c.env.subscribe_mind.get("trigger");
    if (triggers) {
      return c.json({ success: true, data: JSON.parse(triggers) });
    }
    return c.json({ success: true, data: {} });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return c.json(
      { success: false, msg: "Failed to get triggers: " + errorMessage },
      500
    );
  }
});

// Create or update a trigger
app.post("/trigger", async (c) => {
  try {
    const body = await c.req.json();
    const { key, config } = body;

    // Validate required fields
    if (!key || !config) {
      return c.json(
        { success: false, msg: "Key and config are required" },
        400
      );
    }

    // Get existing triggers
    let triggers: Record<string, any> = {};
    const existingTriggers = await c.env.subscribe_mind.get("trigger");
    if (existingTriggers) {
      triggers = JSON.parse(existingTriggers);
    }

    // Add or update trigger
    triggers[key] = config;

    // Save to KV
    await c.env.subscribe_mind.put("trigger", JSON.stringify(triggers));

    return c.json({ success: true, data: { key, config } });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return c.json(
      {
        success: false,
        msg: "Failed to create/update trigger: " + errorMessage,
      },
      500
    );
  }
});

// Delete a trigger
app.delete("/trigger/:key", async (c) => {
  try {
    const key = c.req.param("key");

    // Get existing triggers
    const existingTriggers = await c.env.subscribe_mind.get("trigger");
    if (!existingTriggers) {
      return c.json({ success: false, msg: "Trigger not found" }, 404);
    }

    const triggers: Record<string, any> = JSON.parse(existingTriggers);

    // Check if trigger exists
    if (!triggers[key]) {
      return c.json({ success: false, msg: "Trigger not found" }, 404);
    }

    // Delete trigger
    delete triggers[key];

    // Save to KV
    await c.env.subscribe_mind.put("trigger", JSON.stringify(triggers));

    return c.json({ success: true, msg: "Trigger deleted successfully" });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return c.json(
      { success: false, msg: "Failed to delete trigger: " + errorMessage },
      500
    );
  }
});

export default app;
