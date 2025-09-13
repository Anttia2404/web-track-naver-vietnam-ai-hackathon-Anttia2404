import { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { useTasks } from "../context/TasksContext";

// format date thành YYYY-MM-DD (ổn định, không bị dịch timezone)
const formatDate = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

// chuẩn hóa deadline sang YYYY-MM-DD để dễ so sánh
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
  //  Tính hạn thực tế (realDeadline)
  // =========================
  const getRealDeadline = (t: any) => {
    if (!t.officialDeadline) return undefined;

    // Nếu task có delay trung bình thì tính
    const avgDelay = t.avgDelay || 15; // fallback 15 phút
    const deadlineMs = new Date(t.officialDeadline).getTime();
    return new Date(deadlineMs - avgDelay * 60_000).toISOString();
  };

  // Lọc task cho ngày đã chọn (so cả officialDeadline và realDeadline)
  const tasksForDay = tasks.filter((t) => {
    const off = normalizeDeadline(t.officialDeadline);
    const real = normalizeDeadline(getRealDeadline(t));
    return off === selectedDate || real === selectedDate;
  });

  // Đếm số task theo ngày (ưu tiên officialDeadline, fallback realDeadline)
  const tasksByDate: Record<string, number> = {};
  tasks.forEach((t) => {
    const off = normalizeDeadline(t.officialDeadline);
    const real = normalizeDeadline(getRealDeadline(t));
    const d = off || real;
    if (d) tasksByDate[d] = (tasksByDate[d] || 0) + 1;
  });

  return (
    <div>
      <h2>📅 Calendar</h2>

      <Calendar
        value={date}
        onChange={(value) => setDate(value as Date)}
        tileContent={({ date }) => {
          const d = formatDate(date);
          const count = tasksByDate[d] || 0;

          if (count > 0) {
            return (
              <div style={{ textAlign: "center", marginTop: 2 }}>
                {count > 1 ? (
                  <span style={{ color: "red", fontWeight: "bold" }}>
                    {count}
                  </span>
                ) : (
                  <span style={{ color: "green" }}>•</span>
                )}
              </div>
            );
          }
          return null;
        }}
      />

      <h3 style={{ marginTop: 20 }}>
        Tasks for {selectedDate} ({tasksForDay.length})
      </h3>
      <ul>
        {tasksForDay.length > 0 ? (
          tasksForDay.map((task) => {
            const realDeadline = getRealDeadline(task);

            return (
              <li key={task.id} style={{ marginBottom: 10 }}>
                <strong>{task.title}</strong> {task.done && "✅ Done"}
                <div style={{ fontSize: "0.9em", marginLeft: 8 }}>
                  {/* Hạn thực tế */}
                  {realDeadline && (
                    <div style={{ color: "green" }}>
                      ⏱ Hạn thực tế:{" "}
                      {new Date(realDeadline).toLocaleString()}
                    </div>
                  )}

                  {/* Hạn chính thức */}
                  {task.officialDeadline && (
                    <div style={{ color: "red" }}>
                      📌 Hạn chính thức:{" "}
                      {new Date(task.officialDeadline).toLocaleString()}
                    </div>
                  )}
                </div>
              </li>
            );
          })
        ) : (
          <p>No tasks for this day.</p>
        )}
      </ul>
    </div>
  );
}
