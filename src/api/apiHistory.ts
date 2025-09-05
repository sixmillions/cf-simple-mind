import { Hono } from "hono";
import { bearerAuth } from "hono/bearer-auth";
import { History, HistoryRecord } from "../types";

const app = new Hono<{ Bindings: CloudflareBindings }>();

app.use(
  "/*",
  bearerAuth({
    verifyToken: async (token, c) => {
      return token === c.env.TOKEN;
    },
  })
);

// Get all execute mind history
app.get("/history", async (c) => {
  try {
    const history = await c.env.subscribe_mind.get("history");
    if (history) {
      return c.json({ success: true, data: JSON.parse(history) });
    }
    return c.json({ success: true, data: { his_list: [] } });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return c.json(
      { success: false, msg: "Failed to get history: " + errorMessage },
      500
    );
  }
});

// Add a new execution record to history
app.post("/history", async (c) => {
  try {
    const body = await c.req.json();
    const { id, title, executionTime, status } = body;

    // Validate required fields
    if (!id || !title || !executionTime || !status) {
      return c.json(
        { success: false, msg: "id, title, executionTime, and status are required" },
        400
      );
    }

    // Get existing history
    let history: { his_list: any[] } = { his_list: [] };
    const existingHistory = await c.env.subscribe_mind.get("history");
    if (existingHistory) {
      history = JSON.parse(existingHistory);
    }

    // Create new history record
    const newRecord = {
      id,
      title,
      executionTime,
      status
    };

    // Add to history list
    history.his_list.unshift(newRecord);

    // Keep only the last 10 records
    if (history.his_list.length > 10) {
      history.his_list = history.his_list.slice(0, 10);
    }

    // Save to KV
    await c.env.subscribe_mind.put("history", JSON.stringify(history));

    return c.json({ success: true, data: history });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return c.json(
      { success: false, msg: "Failed to add history record: " + errorMessage },
      500
    );
  }
});

// Clear all execution history
app.delete("/history", async (c) => {
  try {
    // Save empty history to KV
    await c.env.subscribe_mind.put("history", JSON.stringify({ his_list: [] }));
    return c.json({ success: true, msg: "History cleared successfully" });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return c.json(
      { success: false, msg: "Failed to clear history: " + errorMessage },
      500
    );
  }
});

export default app;