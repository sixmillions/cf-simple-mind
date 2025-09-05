import { Hono } from "hono";
import { sendEmail } from "../trigger/sendEmail";
import { sendDingMsg } from "../trigger/dingTalkRobt";

const app = new Hono<{ Bindings: CloudflareBindings }>();

app.get("/mail", async (c) => {
  await sendEmail({
    to: "liubw95@gmail.com",
    title: "域名到期",
    description: "续订",
    time: "2025-09-09 12:00",
  });
  return c.json({ success: true });
});

app.get("/ding", async (c) => {
  await sendDingMsg({
    webhook:
      "https://oapi.dingtalk.com/robot/send?access_token=f8e6a9e9506bee4d843068323008bda5e3c5193babd40923ea6c68c9fb48fb65",
    title: "域名到期",
    description: "续订",
    time: "2025-09-09 12:00",
  });
  return c.json({ success: true });
});

export default app;
