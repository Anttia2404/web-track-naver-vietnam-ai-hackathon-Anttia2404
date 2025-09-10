import { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { useTasks } from "../context/TasksContext";

export default function CalendarView() {
  const { tasks } = useTasks();
  const [date, setDate] = useState<Date>(new Date());

  // lọc task theo ngày đã chọn
  const selectedDate = date.toISOString().split("T")[0]; // YYYY-MM-DD
  const tasksForDay = tasks.filter((t) => t.deadline === selectedDate);

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
              {task.title} {task.done && "✅"}
            </li>
          ))
        ) : (
          <p>No tasks for this day.</p>
        )}
      </ul>
    </div>
  );
}
