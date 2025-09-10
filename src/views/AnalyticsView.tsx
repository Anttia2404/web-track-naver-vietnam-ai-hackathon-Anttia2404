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

  // Đếm số task theo deadline (theo ngày)
  const tasksByDate: Record<string, number> = {};
  tasks.forEach((t) => {
    if (t.deadline) {
      tasksByDate[t.deadline] = (tasksByDate[t.deadline] || 0) + 1;
    }
  });
  const barData = Object.entries(tasksByDate).map(([date, count]) => ({
    date,
    count,
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
      </div>
    </div>
  );
}
