export const TASK_STATUS_VISUAL = {
  TODO: {
    label: "Todo",
    color: "#6b7280",
  },
  IN_PROGRESS: {
    label: "In Progress",
    color: "#3b82f6",
  },
  DONE: {
    label: "Done",
    color: "#22c55e",
  },
} as const;

export const TASK_PRIORITY_VISUAL = {
  LOW: {
    label: "Low",
    color: "#6b7280",
  },
  MEDIUM: {
    label: "Medium",
    color: "#f59e0b",
  },
  HIGH: {
    label: "High",
    color: "#ef4444",
  },
} as const;

export type TaskStatusVisualKey = keyof typeof TASK_STATUS_VISUAL;
export type TaskPriorityVisualKey = keyof typeof TASK_PRIORITY_VISUAL;
