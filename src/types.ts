// Mind data structure
export interface Mind {
  id: string;
  title: string;
  description: string;
  time: string;
  trigger: string[];
  createdAt: string;
  updatedAt: string;
}

// Trigger configurations
export interface EmailTriggerConfig {
  type: 'email';
  to: string;
}

export interface DingTalkTriggerConfig {
  type: 'dingtalk';
  webhook: string;
}

export type TriggerConfig = EmailTriggerConfig | DingTalkTriggerConfig;

// History record
export interface HistoryRecord {
  id: string;
  title: string;
  executionTime: string;
  status: string;
  trigger?: string;
}

export interface History {
  his_list: HistoryRecord[];
}

// Mail information for email trigger
export interface MailInfo {
  id: string;
  to: string;
  title: string;
  description: string;
  time: string;
  token: string;
}

// DingTalk message structure
export interface DingTalkMessage {
  id: string;
  webhook: string;
  title: string;
  description: string;
  time: string;
  token: string;
}