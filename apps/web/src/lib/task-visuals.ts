export const TASK_STATUS_VISUAL = {
  TODO: {
    label: "Todo",
    color: "#a39e98",
  },
  IN_PROGRESS: {
    label: "In Progress",
    color: "#0075de",
  },
  DONE: {
    label: "Done",
    color: "#1aae39",
  },
} as const;

export const TASK_PRIORITY_VISUAL = {
  LOW: {
    label: "Low",
    color: "#94a3b8",
  },
  MEDIUM: {
    label: "Medium",
    color: "#dd5b00",
  },
  HIGH: {
    label: "High",
    color: "#e03131",
  },
} as const;

export type TaskStatusVisualKey = keyof typeof TASK_STATUS_VISUAL;
export type TaskPriorityVisualKey = keyof typeof TASK_PRIORITY_VISUAL;
