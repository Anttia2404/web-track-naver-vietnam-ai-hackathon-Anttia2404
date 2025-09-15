import { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { useTasks } from "../context/TasksContext";

const formatDate = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const normalizeDeadline = (deadline?: string | Date) => {
  if (!deadline) return "";

  if (deadline instanceof Date) return formatDate(deadline);

  if (typeof deadline === "string") {
    if (deadline.includes("T")) return deadline.split("T")[0];
    return deadline;
  }

  return "";
};

export default function CalendarView() {
  const { tasks } = useTasks();
  const [date, setDate] = useState<Date>(new Date());

  const selectedDate = formatDate(date);

  // =========================
  //  Calculate real deadline
  // =========================
  const getRealDeadline = (t: any) => {
    if (!t.officialDeadline) return undefined;
    const avgDelay = t.avgDelay || 15; 
    const deadlineMs = new Date(t.officialDeadline).getTime();
    return new Date(deadlineMs - avgDelay * 60_000).toISOString();
  };

  const tasksForDay = tasks.filter((t) => {
    const off = normalizeDeadline(t.officialDeadline);
    const real = normalizeDeadline(getRealDeadline(t));
    return off === selectedDate || real === selectedDate;
  });

  const tasksByDate: Record<string, number> = {};
  tasks.forEach((t) => {
    const off = normalizeDeadline(t.officialDeadline);
    const real = normalizeDeadline(getRealDeadline(t));
    const d = off || real;
    if (d) tasksByDate[d] = (tasksByDate[d] || 0) + 1;
  });

  return (
    <div className="gradient-background">
      <div className="calendar-container">
        <div className="calendar-panel">
          <h2 className="calender-h2" style={{ margin: 0 }}>Calendar</h2>
          <Calendar
            value={date}
            onChange={(value) => setDate(value as Date)}
            tileContent={({ date }) => {
              const d = formatDate(date);
              const count = tasksByDate[d] || 0;

              return (
                <div style={{ textAlign: "center", marginTop: 2, minHeight: 16 }}>
                  {count > 1 ? (
                    <span style={{ color: "red", fontWeight: "bold" }}>{count}</span>
                  ) : count === 1 ? (
                    <span style={{ color: "green" }}>•</span>
                  ) : (
                    <span style={{ opacity: 0 }}>0</span> 
                  )}
                </div>
              );
            }}
          />
        </div>

        <div className="task-panel">
          <h3>
            Tasks for {selectedDate} ({tasksForDay.length})
          </h3>
          <ul className="task-list-calender">
            {tasksForDay.length > 0 ? (
              tasksForDay.map((task) => {
                const realDeadline = getRealDeadline(task);
                return (
                  <li key={task.id} style={{ marginBottom: 10 }}>
                    <strong>{task.title}</strong> {task.done && "✅ Completed"}
                    <div style={{ fontSize: "0.9em", marginLeft: 8 }}>
                      {realDeadline && (
                        <div style={{ color: "green" }}>
                          Real deadline:{" "}
                          {new Date(realDeadline).toLocaleString()}
                        </div>
                      )}
                      {task.officialDeadline && (
                        <div style={{ color: "red" }}>
                          Official deadline:{" "}
                          {new Date(task.officialDeadline).toLocaleString()}
                        </div>
                      )}
                    </div>
                  </li>
                );
              })
            ) : (
              <p style={{ display: "flex", justifyContent: "center" }}>
                No tasks for today.
              </p>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
