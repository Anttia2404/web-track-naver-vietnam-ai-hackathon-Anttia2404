import { useState } from "react";
import { useTasks } from "../context/TasksContext";

export default function DoNowView() {
  const { tasks, addTask, toggleTask, removeTask } = useTasks();
  const [title, setTitle] = useState("");
  const [deadline, setDeadline] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    addTask(title, deadline || undefined);
    setTitle("");
    setDeadline("");
  };

  return (
    <div>
      <h2>📌 Do Now</h2>

      {/* Form thêm task */}
      <form onSubmit={handleSubmit} style={{ marginBottom: 20 }}>
        <input
          type="text"
          placeholder="Task title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{ marginRight: 10 }}
        />
        <input
          type="date"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          style={{ marginRight: 10 }}
        />
        <button type="submit">Add Task</button>
      </form>

      {/* Danh sách task */}
      <ul>
        {tasks.map((task) => (
          <li key={task.id} style={{ marginBottom: 8 }}>
            <span
              style={{
                textDecoration: task.done ? "line-through" : "none",
                marginRight: 10,
              }}
            >
              {task.title}
              {task.deadline && (
                <small style={{ marginLeft: 6, color: "#888" }}>
                  (due {task.deadline})
                </small>
              )}
            </span>
            <button onClick={() => toggleTask(task.id)}>
              {task.done ? "Undo" : "Done"}
            </button>
            <button
              onClick={() => removeTask(task.id)}
              style={{ marginLeft: 6, color: "red" }}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
