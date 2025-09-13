import { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { useTasks } from "../context/TasksContext";

// format date theo local thành YYYY-MM-DD (ổn định, không bị dịch timezone)
const formatDate = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

// chuẩn hóa deadline của task sang YYYY-MM-DD để dễ so sánh
const normalizeDeadline = (deadline: any) => {
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

  const selectedDate = formatDate(date); // YYYY-MM-DD theo local
  const tasksForDay = tasks.filter(
    (t) =>
      normalizeDeadline(t.deadline) === selectedDate ||
      normalizeDeadline(t.officialDeadline) === selectedDate
  );

  // Đếm số task theo ngày (ưu tiên officialDeadline, fallback deadline)
  const tasksByDate: Record<string, number> = {};
  tasks.forEach((t) => {
    const d =
      normalizeDeadline(t.officialDeadline) || normalizeDeadline(t.deadline);
    if (d) tasksByDate[d] = (tasksByDate[d] || 0) + 1;
  });

  return (
    <div>
      <h2>📅 Calendar</h2>

      {/* Lịch có đánh dấu trùng hạn */}
      <Calendar
        value={date}
        onChange={(value) => setDate(value as Date)}
        tileContent={({ date }) => {
          const d = formatDate(date);
          const count = tasksByDate[d] || 0;

          // nếu có task thì hiện chấm, nếu >1 thì ghi số lượng
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
          tasksForDay.map((task) => (
            <li key={task.id} style={{ marginBottom: 10 }}>
              <strong>{task.title}</strong> {task.done && "✅ Done"}
              <div style={{ fontSize: "0.9em", color: "#555", marginLeft: 8 }}>
                {task.deadline && (
                  <div>⏱ Hạn thực tế: {new Date(task.deadline).toLocaleString()}</div>
                )}
                {task.officialDeadline && (
                  <div>
                    📌 Hạn chính thức:{" "}
                    {new Date(task.officialDeadline).toLocaleString()}
                  </div>
                )}
              </div>
            </li>
          ))
        ) : (
          <p>No tasks for this day.</p>
        )}
      </ul>
    </div>
  );
}
