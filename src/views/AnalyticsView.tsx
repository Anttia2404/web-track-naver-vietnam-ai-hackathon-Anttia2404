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

export default function AnalyticsView() {
  const { tasks } = useTasks();

  const doneCount = tasks.filter((t) => t.done).length;
  const notDoneCount = tasks.length - doneCount;

  const pieData = [
    { name: "Completed", value: doneCount },
    { name: "Pending", value: notDoneCount },
  ];
  const COLORS = ["#4ade80", "#f87171"];

  // --- Tasks by Deadline (gom theo ngày)
  const tasksByDate: Record<string, number> = {};
  tasks.forEach((t) => {
    if (t.deadline) {
      const day = new Date(t.deadline).toISOString().split("T")[0]; // YYYY-MM-DD
      tasksByDate[day] = (tasksByDate[day] || 0) + 1;
    }
  });
  const barData = Object.entries(tasksByDate).map(([date, count]) => ({
    date,
    count,
  }));

  // --- Productivity model: task completed per day
  const doneByDate: Record<string, number> = {};
  tasks.forEach((t) => {
    if (t.done && t.deadline) {
      const day = new Date(t.deadline).toISOString().split("T")[0];
      doneByDate[day] = (doneByDate[day] || 0) + 1;
    }
  });
  const productivityData = Object.entries(doneByDate).map(([date, count]) => ({
    date,
    count,
  }));

  // --- Best work hours: giờ hoàn thành task
  const hours: Record<number, number> = {};
  tasks.forEach((t) => {
    if (t.done && t.deadline) {
      const hour = new Date(t.deadline).getHours();
      hours[hour] = (hours[hour] || 0) + 1;
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
                  <Cell
                    key={index}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Bar Chart */}
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

        {/* Productivity Line Chart */}
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
