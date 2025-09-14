import {
  createContext,
  useContext,
  useState,
  useEffect,
} from "react";

import type { ReactNode } from "react";
import recommendTasksAI from "../untils/recommendTasksAI";

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

  // 🆕 AI recommend
  recommendedTasks: Task[];
  reason: string;
  fetchRecommendedTasks: (mood: string) => Promise<void>;

  // 🆗 giữ local suggest (fallback)
  suggestTasksForMood: (mood: string) => Task[];
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

  const [recommendedTasks, setRecommendedTasks] = useState<Task[]>([]);
  const [reason, setReason] = useState("");

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
              doneAt: !task.done ? new Date().toISOString() : undefined,
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

  // ======================
  // 🆕 Gọi AI để recommend
  // ======================
  const fetchRecommendedTasks = async (mood: string) => {
    try {
      const result = await recommendTasksAI(mood, tasks);
      const map = new Map(tasks.map((t) => [t.id, t]));

      const ordered = result.recommended
        .map((id: string) => map.get(id))
        .filter(Boolean) as Task[];

      setRecommendedTasks(ordered);
      setReason(result.reason || "");
    } catch (err) {
      console.error("AI recommend error", err);
      setRecommendedTasks([]);
      setReason("AI recommend failed");
    }
  };

  // ======================
  // Local fallback
  // ======================
  const suggestTasksForMood = (mood: string): Task[] => {
    if (!tasks.length) return [];

    switch (mood) {
      case "lazy":
        return tasks.filter((t) => !t.done && (t.estimatedMinutes || 0) <= 30);
      case "focus":
        return tasks.filter((t) => !t.done && (t.estimatedMinutes || 0) > 60);
      case "stress":
        return tasks.filter(
          (t) =>
            !t.done &&
            t.officialDeadline &&
            new Date(t.officialDeadline).getTime() - Date.now() <
              2 * 60 * 60 * 1000
        );
      default:
        return tasks.filter((t) => !t.done);
    }
  };

  return (
    <TasksContext.Provider
      value={{
        tasks,
        addTask,
        toggleTask,
        removeTask,
        updateTask,
        recommendedTasks,
        reason,
        fetchRecommendedTasks,
        suggestTasksForMood,
      }}
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
