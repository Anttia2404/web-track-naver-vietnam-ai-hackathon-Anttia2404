import {
  createContext,
  useContext,
  useState,
  useEffect,
} from "react";

import type { ReactNode } from "react";

// ======================
// Task model
// ======================
export interface Task {
  id: string;
  title: string;
  done: boolean;
  officialDeadline?: string;   // hạn chính thức
  realDeadline?: string;       // hạn thực tế (đã trừ estimate + delay)
  estimatedMinutes?: number;   // thời gian dự kiến (phút)
  doneAt?: string;             // thời điểm hoàn thành
}

interface TasksContextType {
  tasks: Task[];
  addTask: (
    title: string,
    officialDeadline?: string,
    estimatedMinutes?: number,
    id?: string
  ) => void;
  toggleTask: (id: string) => void;
  removeTask: (id: string) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
}

// ======================
// Context
// ======================
const TasksContext = createContext<TasksContextType | undefined>(undefined);

export function TasksProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem("tasks");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  // ======================
  // Add task
  // ======================
  const addTask = (
    title: string,
    officialDeadline?: string,
    estimatedMinutes: number = 30,
    id?: string
  ) => {
    let realDeadline: string | undefined;

    if (officialDeadline) {
      const od = new Date(officialDeadline).getTime();
      const defaultDelay = 15; // mặc định trễ 15 phút
      realDeadline = new Date(
        od - (estimatedMinutes + defaultDelay) * 60_000
      ).toISOString();
    }

    const newTask: Task = {
      id: id || String(Date.now()),
      title,
      done: false,
      officialDeadline,
      realDeadline,
      estimatedMinutes,
    };

    setTasks((prev) => [...prev, newTask]);
  };

  // ======================
  // Toggle task
  // ======================
  const toggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id
          ? {
              ...task,
              done: !task.done,
              doneAt: !task.done ? new Date().toISOString() : undefined, // set khi done, xóa khi undo
            }
          : task
      )
    );
  };

  // ======================
  // Remove task
  // ======================
  const removeTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  // ======================
  // Update task
  // ======================
  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;

        const updated = { ...t, ...updates };

        // Nếu có thay đổi officialDeadline hoặc estimatedMinutes → tính lại realDeadline
        if (updated.officialDeadline && updated.estimatedMinutes) {
          const od = new Date(updated.officialDeadline).getTime();
          const defaultDelay = 15;
          updated.realDeadline = new Date(
            od - (updated.estimatedMinutes + defaultDelay) * 60_000
          ).toISOString();
        }

        return updated;
      })
    );
  };

  return (
    <TasksContext.Provider
      value={{ tasks, addTask, toggleTask, removeTask, updateTask }}
    >
      {children}
    </TasksContext.Provider>
  );
}

export function useTasks() {
  const context = useContext(TasksContext);
  if (!context) throw new Error("useTasks must be used within TasksProvider");
  return context;
}
