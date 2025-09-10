import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";

export type Task = {
  id: number;
  title: string;
  deadline?: string;
  done: boolean;
};

type TasksContextType = {
  tasks: Task[];
  addTask: (title: string, deadline?: string) => void;
  toggleTask: (id: number) => void;
  removeTask: (id: number) => void;
};

const TasksContext = createContext<TasksContextType | undefined>(undefined);

export function TasksProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>(() => {
    // load từ localStorage khi app khởi động
    const saved = localStorage.getItem("tasks");
    return saved ? JSON.parse(saved) : [];
  });

  // lưu vào localStorage khi tasks thay đổi
  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  const addTask = (title: string, deadline?: string) => {
    setTasks((prev) => [
      ...prev,
      { id: Date.now(), title, deadline, done: false },
    ]);
  };

  const toggleTask = (id: number) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    );
  };

  const removeTask = (id: number) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <TasksContext.Provider value={{ tasks, addTask, toggleTask, removeTask }}>
      {children}
    </TasksContext.Provider>
  );
}

export function useTasks() {
  const ctx = useContext(TasksContext);
  if (!ctx) throw new Error("useTasks must be used within a TasksProvider");
  return ctx;
}
