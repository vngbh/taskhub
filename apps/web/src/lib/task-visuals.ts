export const TASK_STATUS_VISUAL = {
  TODO: {
    label: "Todo",
    color: "#a5b4fc",
  },
  IN_PROGRESS: {
    label: "In Progress",
    color: "#93c5fd",
  },
  DONE: {
    label: "Done",
    color: "#6ee7b7",
  },
} as const;

export const TASK_PRIORITY_VISUAL = {
  LOW: {
    label: "Low",
    color: "#94a3b8",
  },
  MEDIUM: {
    label: "Medium",
    color: "#fcd34d",
  },
  HIGH: {
    label: "High",
    color: "#f9a8d4",
  },
} as const;

export type TaskStatusVisualKey = keyof typeof TASK_STATUS_VISUAL;
export type TaskPriorityVisualKey = keyof typeof TASK_PRIORITY_VISUAL;
