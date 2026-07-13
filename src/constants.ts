import type { Priority, Status, TaskStatus } from "./types";

export const STORAGE_KEY = "model-dev-board.projects.v1";
export const STORAGE_VERSION = 1;

export const statusLabel: Record<Status, string> = {
  active: "开发中",
  paused: "企划中",
  blocked: "阻塞",
  done: "已量产",
};

export const taskStatusLabel: Record<TaskStatus, string> = {
  todo: "待处理",
  doing: "作业中",
  blocked: "阻塞",
  done: "已完成",
};

export const priorityLabel: Record<Priority, string> = {
  low: "低",
  medium: "中",
  high: "高",
  urgent: "紧急",
};

export const taskStatusFlow: TaskStatus[] = ["todo", "doing", "done"];

export const projectStatusOptions: Array<{ value: Status; label: string }> = [
  { value: "active", label: statusLabel.active },
  { value: "paused", label: statusLabel.paused },
  { value: "done", label: statusLabel.done },
];
