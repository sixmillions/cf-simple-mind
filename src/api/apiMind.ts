import { Hono } from "hono";
import { bearerAuth } from "hono/bearer-auth";
import { Mind } from "../types";

const app = new Hono<{ Bindings: CloudflareBindings }>();

app.use(
  "/mind/*",
  bearerAuth({
    verifyToken: async (token, c) => {
      return token === c.env.TOKEN;
    },
  })
);

// /api/close/xxx?token=sss
app.get("/close/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const token = c.req.query("token");

    if (token !== c.env.CLOSE_TOKEN) {
      return c.json({ success: false, msg: "Invalid token" }, 401);
    }

    // Get existing minds
    const existingMinds = await c.env.subscribe_mind.get("mind");
    if (!existingMinds) {
      return c.json({ success: false, msg: "Mind not found" }, 404);
    }

    const minds = JSON.parse(existingMinds);

    // Check if mind exists
    if (!minds[id]) {
      return c.json({ success: false, msg: "Mind not found" }, 404);
    }

    // Update mind
    minds[id].enabled = false;
    minds[id].updatedAt = new Date().toISOString();

    // Save to KV
    await c.env.subscribe_mind.put("mind", JSON.stringify(minds));

    return c.json({ success: true, msg: "已关闭提醒" });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return c.json(
      { success: false, msg: "Failed to close mind: " + errorMessage },
      500
    );
  }
});

// Get all minds
app.get("/mind", async (c) => {
  try {
    const minds = await c.env.subscribe_mind.get("mind");
    if (minds) {
      return c.json({ success: true, data: JSON.parse(minds) });
    }
    return c.json({ success: true, data: {} });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return c.json(
      { success: false, msg: "Failed to get minds: " + errorMessage },
      500
    );
  }
});

// Get a specific mind by ID
app.get("/mind/:id", async (c) => {
  try {
    const id = c.req.param("id");

    // Get existing minds
    const existingMinds = await c.env.subscribe_mind.get("mind");
    if (!existingMinds) {
      return c.json({ success: false, msg: "Mind not found" }, 404);
    }

    const minds = JSON.parse(existingMinds);

    // Check if mind exists
    if (!minds[id]) {
      return c.json({ success: false, msg: "Mind not found" }, 404);
    }

    return c.json({ success: true, data: minds[id] });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return c.json(
      { success: false, msg: "Failed to get mind: " + errorMessage },
      500
    );
  }
});

// Create a new mind
app.post("/mind", async (c) => {
  try {
    const body = await c.req.json();
    const { title, description, time, trigger, enabled } = body;

    // Validate required fields
    if (!title || !time) {
      return c.json(
        { success: false, msg: "Title and time are required" },
        400
      );
    }

    // Get existing minds
    let minds: Record<string, any> = {};
    const existingMinds = await c.env.subscribe_mind.get("mind");
    if (existingMinds) {
      minds = JSON.parse(existingMinds);
    }

    // Generate new ID using timestamp + random number to simulate UUID
    const newId =
      Date.now().toString() + Math.random().toString(36).substring(2, 10);

    // Create new mind object
    const newMind = {
      id: newId,
      title,
      description: description || "",
      time,
      trigger: trigger || [],
      enabled: enabled !== undefined ? enabled : true, // default to true
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Add to minds
    minds[newId.toString()] = newMind;

    // Save to KV
    await c.env.subscribe_mind.put("mind", JSON.stringify(minds));

    return c.json({ success: true, data: newMind });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return c.json(
      { success: false, msg: "Failed to create mind: " + errorMessage },
      500
    );
  }
});

// Update a mind
app.put("/mind/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    const { title, description, time, trigger, enabled } = body;

    // Get existing minds
    const existingMinds = await c.env.subscribe_mind.get("mind");
    if (!existingMinds) {
      return c.json({ success: false, msg: "Mind not found" }, 404);
    }

    const minds = JSON.parse(existingMinds);

    // Check if mind exists
    if (!minds[id]) {
      return c.json({ success: false, msg: "Mind not found" }, 404);
    }

    // Update mind
    minds[id] = {
      ...minds[id],
      title: title || minds[id].title,
      description:
        description !== undefined ? description : minds[id].description,
      time: time || minds[id].time,
      trigger: trigger || minds[id].trigger,
      enabled: enabled !== undefined ? enabled : minds[id].enabled,
      updatedAt: new Date().toISOString(),
    };

    // Save to KV
    await c.env.subscribe_mind.put("mind", JSON.stringify(minds));

    return c.json({ success: true, data: minds[id] });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return c.json(
      { success: false, msg: "Failed to update mind: " + errorMessage },
      500
    );
  }
});

// Delete a mind
app.delete("/mind/:id", async (c) => {
  try {
    const id = c.req.param("id");

    // Get existing minds
    const existingMinds = await c.env.subscribe_mind.get("mind");
    if (!existingMinds) {
      return c.json({ success: false, msg: "Mind not found" }, 404);
    }

    const minds = JSON.parse(existingMinds);

    // Check if mind exists
    if (!minds[id]) {
      return c.json({ success: false, msg: "Mind not found" }, 404);
    }

    // Delete mind
    delete minds[id];

    // Save to KV
    await c.env.subscribe_mind.put("mind", JSON.stringify(minds));

    return c.json({ success: true, msg: "Mind deleted successfully" });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return c.json(
      { success: false, msg: "Failed to delete mind: " + errorMessage },
      500
    );
  }
});

export default app;
