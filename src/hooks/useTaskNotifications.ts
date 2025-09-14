import { useEffect } from "react";
import { useTasks } from "../context/TasksContext";

export default function useTaskNotifications() {
  const { tasks } = useTasks();

  useEffect(() => {
    if (Notification.permission !== "granted") {
      Notification.requestPermission();
    }

    const interval = setInterval(() => {
      const now = Date.now();
      const avgDelay = 15; // có thể thay bằng giá trị thật nếu cần

      tasks.forEach((t) => {
        if (!t.officialDeadline || t.done) return;

        const deadlineMs = new Date(t.officialDeadline).getTime();
        const effectiveDeadline = deadlineMs - avgDelay * 60_000;

        if (now >= effectiveDeadline) {
          console.log("🔁 Nhắc lại:", t.title);
          new Notification("⏰ Bắt đầu ngay kẻo trễ!", {
            body: `Task: ${t.title}\nDeadline: ${new Date(
              t.officialDeadline
            ).toLocaleTimeString()}`,
          });
        }
      });
    }, 60_000); //Số thời gian nhác lại

    return () => clearInterval(interval);
  }, [tasks]);
}
