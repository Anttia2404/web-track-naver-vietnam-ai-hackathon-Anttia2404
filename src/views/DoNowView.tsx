import { useState, useEffect } from "react";
import { useTasks } from "../context/TasksContext";

interface MetaData {
  start?: number;
  estimate?: number; // phút
  actual?: number;   // phút
}

export default function DoNowView() {
  const { tasks, addTask, toggleTask, removeTask } = useTasks();
  const [title, setTitle] = useState("");
  const [officialDeadline, setOfficialDeadline] = useState("");
  const [estimate, setEstimate] = useState<number>(30);
  const [history, setHistory] = useState<Record<string, number>>({});
  const [meta, setMeta] = useState<Record<string, MetaData>>({});
  const [sortedTasks, setSortedTasks] = useState(tasks);

  // =========================
  //  Thói quen trễ
  // =========================
  function getAverageDelay(): number {
    const delays: number[] = [];
    for (const id in meta) {
      const m = meta[id];
      if (m.start && m.actual) {
        const delay = m.actual - (m.estimate || 0);
        if (delay > 0) delays.push(delay);
      }
    }
    if (delays.length === 0) return 15; // mặc định 15 phút
    return Math.round(delays.reduce((a, b) => a + b, 0) / delays.length);
  }

  // AI sort: officialDeadline + postpone history
  useEffect(() => {
    const now = Date.now();
    const sorted = [...tasks].sort((a, b) => {
      const aDeadline = a.officialDeadline
        ? new Date(a.officialDeadline).getTime()
        : Infinity;
      const bDeadline = b.officialDeadline
        ? new Date(b.officialDeadline).getTime()
        : Infinity;

      const aUrgency = a.officialDeadline
        ? Math.max(1, (aDeadline - now) / (1000 * 60 * 60))
        : 99999;
      const bUrgency = b.officialDeadline
        ? Math.max(1, (bDeadline - now) / (1000 * 60 * 60))
        : 99999;

      const aScore = (1 / aUrgency) * 100 + (history[a.id] || 0) * 10;
      const bScore = (1 / bUrgency) * 100 + (history[b.id] || 0) * 10;

      return bScore - aScore;
    });
    setSortedTasks(sorted);
  }, [tasks, history]);

  // Thêm task
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newId = String(Date.now());
    addTask(title, officialDeadline || undefined, estimate, newId);

    setMeta((prev) => ({
      ...prev,
      [newId]: {
        start: Date.now(),
        estimate,
      },
    }));

    setTitle("");
    setOfficialDeadline("");
    setEstimate(30);
  };

  // reset history khi rời view
  useEffect(() => {
    return () => setHistory({});
  }, []);

  // Toggle task
  const handleToggle = (id: string) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;

    if (!task.done) {
      const m = meta[id];
      if (m && m.start) {
        const actualMinutes = Math.round((Date.now() - m.start) / 60000);
        setMeta((prev) => ({
          ...prev,
          [id]: { ...prev[id], actual: actualMinutes },
        }));
      }
    } else {
      setHistory((prev) => ({
        ...prev,
        [id]: (prev[id] || 0) + 1,
      }));
      setMeta((prev) => ({
        ...prev,
        [id]: { ...prev[id], actual: undefined },
      }));
    }

    toggleTask(id);
  };

  // =========================
  //  Notification
  // =========================
  useEffect(() => {
    if (Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const avgDelay = getAverageDelay();

      tasks.forEach((t) => {
        if (!t.officialDeadline || t.done) return;

        const deadlineMs = new Date(t.officialDeadline).getTime();
        const effectiveDeadline = deadlineMs - avgDelay * 60_000;

        if (now >= effectiveDeadline && now < deadlineMs) {
          new Notification("⏰ Bắt đầu ngay kẻo trễ!", {
            body: `Task: ${t.title}\nDeadline: ${new Date(
              t.officialDeadline
            ).toLocaleTimeString()}\nThói quen trễ: ~${avgDelay} phút`,
          });
        }
      });
    }, 60_000);

    return () => clearInterval(interval);
  }, [tasks, meta]);

  return (
    <div>
      <h2>📌 Do Now (AI prioritized + Time Tracking + Reminder)</h2>

      <form onSubmit={handleSubmit} style={{ marginBottom: 20 }}>
        <input
          type="text"
          placeholder="Task title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{ marginRight: 10 }}
        />
        <input
          type="datetime-local"
          value={officialDeadline}
          onChange={(e) => setOfficialDeadline(e.target.value)}
          style={{ marginRight: 10 }}
        />
        <input
          type="number"
          min={1}
          value={estimate}
          onChange={(e) => setEstimate(Number(e.target.value))}
          style={{ width: 80, marginRight: 10 }}
          placeholder="min"
        />
        <button type="submit">Add Task</button>
        <button
          type="button"
          onClick={() => setHistory({})}
          style={{ marginLeft: 10 }}
        >
          Reset
        </button>
      </form>

      <ul>
        {sortedTasks.map((task) => {
          const m = meta[task.id];
          const avgDelay = getAverageDelay();

          return (
            <li key={task.id} style={{ marginBottom: 8 }}>
              <span
                style={{
                  textDecoration: task.done ? "line-through" : "none",
                  marginRight: 10,
                }}
              >
                {task.title}
                {task.officialDeadline && (
                  <small style={{ marginLeft: 6, color: "#888" }}>
                    🕒 chính thức:{" "}
                    {new Date(task.officialDeadline).toLocaleString()}
                  </small>
                )}
                {task.realDeadline && (
                  <small style={{ marginLeft: 6, color: "red" }}>
                    ⏳ thực tế: {new Date(task.realDeadline).toLocaleString()}
                  </small>
                )}
                {history[task.id] > 0 && (
                  <small style={{ marginLeft: 6, color: "orange" }}>
                    (postponed {history[task.id]}x)
                  </small>
                )}
                {m?.estimate && (
                  <small style={{ marginLeft: 6, color: "blue" }}>
                    est: {m.estimate}m
                  </small>
                )}
                {m?.actual !== undefined && (
                  <small style={{ marginLeft: 6, color: "green" }}>
                    actual: {m.actual}m
                  </small>
                )}
              </span>
              <button onClick={() => handleToggle(task.id)}>
                {task.done ? "Undo" : "Done"}
              </button>
              <button
                onClick={() => removeTask(task.id)}
                style={{ marginLeft: 6, color: "red" }}
              >
                Delete
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
