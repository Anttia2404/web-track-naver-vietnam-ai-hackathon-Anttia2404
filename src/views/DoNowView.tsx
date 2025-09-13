import { useState, useEffect } from "react";
import { useTasks } from "../context/TasksContext";
import "../index.css"

interface MetaData {
  start?: number;
  actual?: number;   // phút
}

export default function DoNowView() {
  const { tasks, addTask, toggleTask, removeTask } = useTasks();
  const [title, setTitle] = useState("");
  const [officialDeadline, setOfficialDeadline] = useState("");
  const [estimatedMinutes, setEstimatedMinutes] = useState<number | "">(""); // 👈 cho phép rỗng để placeholder hiện
  const [history, setHistory] = useState<Record<string, number>>({});
  const [meta, setMeta] = useState<Record<string, MetaData>>({});
  const [sortedTasks, setSortedTasks] = useState(tasks);

  // =========================
  //  Average delay
  // =========================
  function getAverageDelay(): number {
    const delays: number[] = [];
    for (const id in meta) {
      const m = meta[id];
      const t = tasks.find((task) => task.id === id);
      if (m.start && m.actual && t?.estimatedMinutes) {
        const delay = m.actual - t.estimatedMinutes;
        if (delay > 0) delays.push(delay);
      }
    }
    if (delays.length === 0) return 15;
    return Math.round(delays.reduce((a, b) => a + b, 0) / delays.length);
  }

  // =========================
  //  Sort tasks
  // =========================
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

  // =========================
  //  Add task
  // =========================
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newId = String(Date.now());
    addTask(
      title,
      officialDeadline || undefined,
      estimatedMinutes === "" ? 30 : estimatedMinutes, // 👈 nếu trống thì mặc định 30
      newId
    );

    setMeta((prev) => ({
      ...prev,
      [newId]: {
        start: Date.now(),
      },
    }));

    setTitle("");
    setOfficialDeadline("");
    setEstimatedMinutes(""); // 👈 reset để hiện placeholder lại
  };

  useEffect(() => {
    return () => setHistory({});
  }, []);

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
    <div className="gradient-background">
      <div className="do-now-container">
        <h2 style = {{display: "flex", justifyContent: "center"}}>Do Now</h2>
        <form onSubmit={handleSubmit} className="task-form">
          <input
            type="text"
            placeholder="Tiêu đề công việc..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <input
            type="datetime-local"
            value={officialDeadline}
            onChange={(e) => setOfficialDeadline(e.target.value)}
          />
          <input
            type="number"
            min={1}
            value={estimatedMinutes}
            onChange={(e) =>
              setEstimatedMinutes(
                e.target.value === "" ? "" : Number(e.target.value)
              )
            }
            placeholder="Thời gian thực hiện (phút)..." // 👈 placeholder rõ nghĩa
          />
          <button type="submit">Thêm nhiệm vụ</button>
          {/* <button
            type="button"
            onClick={() => setHistory({})}
            className="reset-btn"
          >
            Reset postponed
          </button> khi nào cần reset lại */}
        </form>

        <ul className="task-list">
          {sortedTasks.map((task) => {
            const m = meta[task.id];
            return (
              <li key={task.id} className="task-item">
                <span className={task.done ? "done" : ""}>
                  {task.title}
                  {task.officialDeadline && (
                    <small className="official">
                      chính thức:{" "}
                      {new Date(task.officialDeadline).toLocaleString()}
                    </small>
                  )}
                  {task.realDeadline && (
                    <small className="real">
                      thực tế:{" "}
                      {new Date(task.realDeadline).toLocaleString()}
                    </small>
                  )}
                  {history[task.id] > 0 && (
                    <small className="postponed">
                      (postponed {history[task.id]}x)
                    </small>
                  )}
                  {task.estimatedMinutes && (
                    <small className="est">
                      est: {task.estimatedMinutes}m
                    </small>
                  )}
                  {m?.actual !== undefined && (
                    <small className="actual">actual: {m.actual}m</small>
                  )}
                </span>

                {/* 👇 bọc 2 nút vào đây */}
                <div className="task-actions">
                  <button
                    onClick={() => handleToggle(task.id)}
                    style={{ marginRight: 10, padding: 5 }}
                    className="done-btn"
                  >
                    {task.done ? "Hoàn tác" : "Hoàn thành"}
                  </button>
                  <button
                    onClick={() => removeTask(task.id)}
                    className="delete-btn"
                    style={{ padding: 5 }}
                  >
                    Xóa
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
