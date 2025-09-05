import { DingTalkMessage } from '../types';

// https://oapi.dingtalk.com/robot/send?access_token=f8e6a9e9506bee4d843068323008bda5e3c5193babd40923ea6c68c9fb48fb65
const sendDingMsg = async (ding: DingTalkMessage) => {
  const response = await fetch(ding.webhook, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      actionCard: {
        title: `Reminder: ${ding.title}`,
        text: `## Reminder Details
- **Title**: ${ding.title}
- **Description**: ${ding.description}
- **Scheduled Time**: ${ding.time}

---

> This is an automated reminder sent by the subscription reminder system.`,
        btnOrientation: "0",
        singleTitle: "取消提醒",
        singleURL: `https://mind.sixmillions.cn/api/close/${ding.id}?token=${ding.token}`,
      },
      msgtype: "actionCard",
    }),
  });
  return await response.json();
};

export { sendDingMsg };
