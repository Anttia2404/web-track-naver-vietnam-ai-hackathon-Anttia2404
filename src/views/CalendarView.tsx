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

  // nếu đã là Date object
  if (deadline instanceof Date) return formatDate(deadline);

  // nếu là string ISO (vd "2025-09-11T..."), lấy phần trước "T"
  if (typeof deadline === "string") {
    if (deadline.includes("T")) return deadline.split("T")[0];
    // nếu đã ở dạng "YYYY-MM-DD", trả về luôn
    // nếu là format khác (vd "11/09/2025") bạn cần parse thêm
    return deadline;
  }

  return "";
};

export default function CalendarView() {
  const { tasks } = useTasks();
  const [date, setDate] = useState<Date>(new Date());

  const selectedDate = formatDate(date); // YYYY-MM-DD theo local
  const tasksForDay = tasks.filter((t) => normalizeDeadline(t.deadline) === selectedDate);

  return (
    <div>
      <h2>📅 Calendar</h2>

      {/* Lịch */}
      <Calendar value={date} onChange={(value) => setDate(value as Date)} />

      <h3 style={{ marginTop: 20 }}>
        Tasks for {selectedDate} ({tasksForDay.length})
      </h3>
      <ul>
        {tasksForDay.length > 0 ? (
          tasksForDay.map((task) => (
            <li key={task.id}>
              {task.title} {task.done && "✅ Done"}
            </li>
          ))
        ) : (
          <p>No tasks for this day.</p>
        )}
      </ul>
    </div>
  );
}
