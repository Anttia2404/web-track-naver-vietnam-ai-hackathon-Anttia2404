import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";

// context/TasksContext.tsx
export interface Task {
  id: string;
  title: string;
  done: boolean;
  deadline?: string;          // deadline do user đặt
  officialDeadline?: string;  // deadline chính thức (nếu có)
  estimate?: number;          // thời gian ước lượng
}


interface TasksContextType {
  tasks: Task[];
  addTask: (
    title: string,
    deadline?: string,
    id?: string,
    estimate?: number,
    officialDeadline?: string
  ) => void;
  toggleTask: (id: string) => void;
  removeTask: (id: string) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
}

const TasksContext = createContext<TasksContextType | undefined>(undefined);

export function TasksProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem("tasks");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  const addTask = (title: string, deadline?: string, id?: string, estimate?: number) => {
  const newTask: Task = {
    id: id || String(Date.now()),
    title,
    deadline,
    officialDeadline: deadline, // gán lúc tạo
    done: false,
    estimate,
  };
  setTasks((prev) => [...prev, newTask]);
  };


  const toggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    );
  };

  const removeTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
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
