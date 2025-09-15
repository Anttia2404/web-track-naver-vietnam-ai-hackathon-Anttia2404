import { useState, useEffect, useMemo } from "react";
import { useTasks } from "../context/TasksContext";
import "../index.css";

interface MetaData {
  start?: number;
  actual?: number; 
}

export default function DoNowView() {
  const {
    tasks,
    addTask,
    toggleTask,
    removeTask,
    suggestTasksForMood,
    recommendedTasks,
    reason,
    fetchRecommendedTasks,
  } = useTasks();

  const [title, setTitle] = useState("");
  const [officialDeadline, setOfficialDeadline] = useState("");
  const [estimatedMinutes, setEstimatedMinutes] = useState<number | "">("");
  const [history, setHistory] = useState<Record<string, number>>({});
  const [meta, setMeta] = useState<Record<string, MetaData>>({});
  const [sortedTasks, setSortedTasks] = useState(tasks);

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "pending" | "done"
  >("all");

  const [mood, setMood] = useState("all");

  useEffect(() => {
    if (mood !== "all") {
      fetchRecommendedTasks(mood);
    }
  }, [mood, fetchRecommendedTasks]);

  const [page, setPage] = useState(1);
  const pageSize = 10;

  const handleStart = (id: string) => {
    setMeta((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        start: Date.now(),
      },
    }));
  };

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newId = String(Date.now());
    addTask(
      title,
      officialDeadline || undefined,
      estimatedMinutes === "" ? 30 : estimatedMinutes,
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
    setEstimatedMinutes("");
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
          new Notification("⏰ Start now before it's too late!", {
            body: `Task: ${t.title}\nDeadline: ${new Date(
              t.officialDeadline
            ).toLocaleTimeString()}\nAvg delay: ~${avgDelay} mins`,
          });
        }
      });
    }, 60_000);

    return () => clearInterval(interval);
  }, [tasks, meta]);

  const visibleTasks = useMemo(() => {
    let baseList =
      mood !== "all"
        ? recommendedTasks.length > 0
          ? recommendedTasks
          : suggestTasksForMood(mood)
        : sortedTasks;

    const filtered = baseList.filter((t) => {
      const matchTitle = t.title
        .toLowerCase()
        .includes(search.toLowerCase());
      const matchStatus =
        filterStatus === "all" ||
        (filterStatus === "done" && t.done) ||
        (filterStatus === "pending" && !t.done);

      return matchTitle && matchStatus;
    });

    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [sortedTasks, mood, recommendedTasks, search, filterStatus, page]);

  return (
    <div className="gradient-background">
      <div className="do-now-container">
        <h2 style={{ display: "flex", justifyContent: "center" }}>Do Now</h2>
        {mood !== "all" && reason && (
          <p style={{ textAlign: "center", fontStyle: "italic" }}>
            🤖 AI Suggestion ({mood}): {reason}
          </p>
        )}
        <form onSubmit={handleSubmit} className="task-form">
          <input
            type="text"
            placeholder="Task title..."
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
            placeholder="Estimated time (mins)..."
          />
          <button type="submit">Add Task</button>
        </form>
        <div
          className="filter-bar"
          style={{ display: "flex", gap: "8px", margin: "12px 0" }}
        >
          <input
            type="text"
            placeholder="Search task..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ flex: 1, padding: "6px" }}
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            style={{ padding: "6px" }}
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="done">Done</option>
          </select>
          <select
            value={mood}
            onChange={(e) => setMood(e.target.value)}
            style={{ padding: "6px" }}
          >
            <option value="all">Mood: Any</option>
            <option value="lazy">😴 Lazy</option>
            <option value="focus">🎯 Focus</option>
            <option value="stress">😰 Stressed</option>
          </select>
        </div>
        <ul className="task-list">
          {visibleTasks.map((task) => {
            const m = meta[task.id];
            return (
              <li key={task.id} className="task-item">
                <span className={task.done ? "done" : ""}>
                  {task.title}
                  {task.officialDeadline && (
                    <small className="official">
                      deadline: {new Date(task.officialDeadline).toLocaleString()}
                    </small>
                  )}
                  {task.estimatedMinutes && (
                    <small className="est">est: {task.estimatedMinutes}m</small>
                  )}
                  {m?.actual !== undefined && (
                    <small className="actual">actual: {m.actual}m</small>
                  )}
                </span>

                <div className="task-actions">
                  {!task.done && (
                    <button
                      onClick={() => handleStart(task.id)}
                      style={{ marginRight: 10, padding: 5 }}
                      className="start-btn"
                    >
                      Start
                    </button>
                  )}

                  <button
                    onClick={() => handleToggle(task.id)}
                    style={{ marginRight: 10, padding: 5 }}
                    className="done-btn"
                  >
                    {task.done ? "Undo" : "Complete"}
                  </button>

                  <button
                    onClick={() => removeTask(task.id)}
                    className="delete-btn"
                    style={{ padding: 5 }}
                  >
                    Delete
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "8px",
            marginTop: "12px",
          }}
        >
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </button>
          <span>Page {page}</span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={visibleTasks.length < pageSize}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
