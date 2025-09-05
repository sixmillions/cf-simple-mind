import { Mind } from "./types";
import { sendDingMsg } from "./trigger/dingTalkRobt";
import { sendEmail } from "./trigger/sendEmail";

// 记录历史记录的辅助函数
async function recordHistory(
  env: CloudflareBindings,
  mind: any,
  triggerKey: string,
  status: string
): Promise<void> {
  try {
    const historyStr = await env.subscribe_mind.get("history");
    let history = historyStr ? JSON.parse(historyStr) : { his_list: [] };

    // 将状态标准化为 success 或 fail
    const normalizedStatus = status === "success" ? "success" : "fail";

    const historyRecord = {
      id: mind.id,
      title: mind.title,
      executionTime: new Date().toISOString(),
      status: normalizedStatus,
      trigger: triggerKey,
    };

    history.his_list.unshift(historyRecord);

    // 保持历史记录最多20条
    if (history.his_list.length > 20) {
      history.his_list = history.his_list.slice(0, 20);
    }

    await env.subscribe_mind.put("history", JSON.stringify(history));
    console.log(
      `History recorded for mind: ${mind.title}, trigger: ${triggerKey}, status: ${normalizedStatus}`
    );
  } catch (error) {
    console.error(
      `Failed to record history for mind ${mind.title}, trigger: ${triggerKey}:`,
      error
    );
  }
}

export async function scheduled(
  controller: ScheduledController,
  env: CloudflareBindings,
  ctx: ExecutionContext
): Promise<void> {
  try {
    // 使用上海时区时间进行比较
    const now = new Date();
    // 创建上海时区的日期对象
    const shanghaiNow = new Date(
      now.toLocaleString("zh-CN", { timeZone: "Asia/Shanghai" })
    );
    const advanceHours = env.ADVANCE_H ? parseInt(env.ADVANCE_H) : 3;
    const shanghaiAdvanceHoursLater = new Date(
      shanghaiNow.getTime() + advanceHours * 60 * 60 * 1000
    );

    console.log(
      "===> UTC now: %s, timezone: %s, Shanghai now: %s, Shanghai %sh later: %s",
      now.toISOString(),
      Intl.DateTimeFormat().resolvedOptions().timeZone,
      shanghaiNow.toISOString(),
      advanceHours,
      shanghaiAdvanceHoursLater.toISOString()
    );

    // 1. 获取所有 minds
    const mindsStr = await env.subscribe_mind.get("mind");
    if (!mindsStr) {
      console.log("No minds found");
      return;
    }

    const minds = JSON.parse(mindsStr);
    let mindsModified = false;

    // 2. 筛选出3小时内到期的 mind (使用上海时间进行比较)
    const dueMinds = Object.values(minds).filter((mind: any) => {
      const mindTime = new Date(mind.time);
      // 如果当前mind提醒时间已过，自动将enable设置为false
      if (mind.enabled && mindTime < shanghaiNow) {
        mind.enabled = false;
        mindsModified = true;
      }
      return (
        mind.enabled &&
        mindTime >= shanghaiNow &&
        mindTime <= shanghaiAdvanceHoursLater
      );
    });

    if (mindsModified) {
      await env.subscribe_mind.put("mind", JSON.stringify(minds));
      console.log("Disabled past minds.");
    }

    console.log(
      `Found ${dueMinds.length} minds due within ${advanceHours} hours`
    );

    if (dueMinds.length === 0) {
      return;
    }

    // 3. 获取所有 triggers 配置
    const triggersStr = await env.subscribe_mind.get("trigger");
    const triggers = triggersStr ? JSON.parse(triggersStr) : {};

    // 4. 为每个到期的 mind 执行对应的 trigger
    for (const mind of dueMinds) {
      const typedMind = mind as Mind;
      try {
        console.log(`Processing mind: ${typedMind.title}`);

        // 执行每个 trigger 并记录执行结果
        for (const triggerKey of typedMind.trigger) {
          const triggerConfig = triggers[triggerKey];
          if (!triggerConfig) {
            console.warn(`Trigger config not found for key: ${triggerKey}`);
            // 记录失败的历史记录
            await recordHistory(env, typedMind, triggerKey, "fail");
            continue;
          }

          // 根据 trigger 类型执行不同的操作并记录结果
          if (triggerConfig.type === "email") {
            try {
              await sendEmail({
                id: typedMind.id,
                to: triggerConfig.to,
                title: typedMind.title,
                description: typedMind.description,
                time: typedMind.time,
                token: env.CLOSE_TOKEN,
              });
              console.log(
                `Email sent for mind: ${typedMind.title}, trigger: ${triggerKey}`
              );
              // 记录成功的历史记录
              await recordHistory(env, typedMind, triggerKey, "success");
            } catch (emailError) {
              console.error(
                `Failed to send email for mind ${typedMind.title}, trigger: ${triggerKey}:`,
                emailError
              );
              // 记录失败的历史记录
              await recordHistory(env, typedMind, triggerKey, "fail");
            }
          } else if (triggerConfig.type === "dingtalk") {
            try {
              await sendDingMsg({
                id: typedMind.id,
                webhook: triggerConfig.webhook,
                title: typedMind.title,
                description: typedMind.description,
                time: typedMind.time,
                token: env.CLOSE_TOKEN,
              });
              console.log(
                `DingTalk message sent for mind: ${typedMind.title}, trigger: ${triggerKey}`
              );
              // 记录成功的历史记录
              await recordHistory(env, typedMind, triggerKey, "success");
            } catch (dingtalkError) {
              console.error(
                `Failed to send DingTalk message for mind ${typedMind.title}, trigger: ${triggerKey}:`,
                dingtalkError
              );
              // 记录失败的历史记录
              await recordHistory(env, typedMind, triggerKey, "fail");
            }
          }
        }

        console.log(`All triggers processed for mind: ${typedMind.title}`);
      } catch (error) {
        console.error(`Failed to process mind ${typedMind.title}:`, error);
      }
    }
  } catch (error: any) {
    console.error("Scheduled task error:", error);
    // 记录调度任务失败的历史记录
    try {
      // 获取所有 minds 来记录错误
      const mindsStr = await env.subscribe_mind.get("mind");
      if (mindsStr) {
        const minds = JSON.parse(mindsStr);
        // 为每个 mind 的每个 trigger 记录失败
        for (const mind of Object.values(minds)) {
          const typedMind = mind as Mind;
          for (const triggerKey of typedMind.trigger) {
            await recordHistory(env, typedMind, triggerKey, "fail");
          }
        }
      }
    } catch (historyError) {
      console.error("Failed to record scheduled task error:", historyError);
    }
  }
}
