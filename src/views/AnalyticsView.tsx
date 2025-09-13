import { useTasks } from "../context/TasksContext";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Bar,
  LineChart,
  Line,
} from "recharts";
import type { Task } from "../context/TasksContext";

// helper: format date YYYY-MM-DD
const formatDate = (d: Date) => d.toISOString().split("T")[0];

// helper: tính hạn thực tế từ officialDeadline + avgDelay (fallback 15p)
const getRealDeadline = (task: Task) => {
  if (!task.officialDeadline) return undefined;
  const avgDelay = 15;
  const deadlineMs = new Date(task.officialDeadline).getTime();
  return new Date(deadlineMs - avgDelay * 60_000).toISOString();
};

export default function AnalyticsView() {
  const { tasks } = useTasks();

  // --- Pie chart: Completed vs Pending
  const doneCount = tasks.filter((t) => t.done).length;
  const notDoneCount = tasks.length - doneCount;

  const pieData = [
    { name: "Completed", value: doneCount },
    { name: "Pending", value: notDoneCount },
  ];
  const COLORS = ["#4ade80", "#f87171"];

  // --- Bar chart: tasks by deadline (official or real)
  const tasksByDate: Record<string, number> = {};
  tasks.forEach((t) => {
    const off = t.officialDeadline
      ? formatDate(new Date(t.officialDeadline))
      : undefined;
    const real = t.realDeadline
      ? formatDate(new Date(t.realDeadline))
      : getRealDeadline(t);

    const d = off || real;
    if (d) tasksByDate[d] = (tasksByDate[d] || 0) + 1;
  });
  const barData = Object.entries(tasksByDate).map(([date, count]) => ({
    date,
    count,
  }));

  // --- Line chart: productivity (doneAt > officialDeadline)
  const doneByDate: Record<string, number> = {};
  tasks.forEach((t) => {
    if (t.done) {
      const when = t.doneAt
        ? formatDate(new Date(t.doneAt))
        : t.officialDeadline
        ? formatDate(new Date(t.officialDeadline))
        : undefined;
      if (when) doneByDate[when] = (doneByDate[when] || 0) + 1;
    }
  });
  const productivityData = Object.entries(doneByDate).map(([date, count]) => ({
    date,
    count,
  }));

  // --- Bar chart: best work hours
  const hours: Record<number, number> = {};
  tasks.forEach((t) => {
    if (t.done) {
      const when = t.doneAt
        ? new Date(t.doneAt)
        : t.officialDeadline
        ? new Date(t.officialDeadline)
        : null;
      if (when) {
        const h = when.getHours();
        hours[h] = (hours[h] || 0) + 1;
      }
    }
  });
  const hoursData = Array.from({ length: 24 }, (_, h) => ({
    hour: `${h}:00`,
    count: hours[h] || 0,
  }));

  return (
    <div>
      <h2>📊 Analytics</h2>

      <div style={{ display: "flex", gap: "40px", flexWrap: "wrap" }}>
        {/* Pie Chart */}
        <div style={{ width: 300, height: 300 }}>
          <h3>Task Status</h3>
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                dataKey="value"
                label
              >
                {pieData.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Tasks by Deadline */}
        <div style={{ width: 400, height: 300 }}>
          <h3>Tasks by Deadline</h3>
          <ResponsiveContainer>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#60a5fa" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Productivity Over Time */}
        <div style={{ width: 400, height: 300 }}>
          <h3>Productivity Over Time</h3>
          <ResponsiveContainer>
            <LineChart data={productivityData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#22c55e" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Best Work Hours */}
        <div style={{ width: 500, height: 300 }}>
          <h3>Best Work Hours</h3>
          <ResponsiveContainer>
            <BarChart data={hoursData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#f59e0b" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
