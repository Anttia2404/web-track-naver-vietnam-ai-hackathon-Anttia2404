import { useEffect } from "react";
import { useTasks } from "../context/TasksContext";

/**
 * Hook toàn cục để gửi thông báo "bắt đầu ngay kẻo trễ"
 * - Dựa trên officialDeadline và thói quen trễ trung bình (avgDelay)
 * - Mỗi task chỉ thông báo 1 lần
 */
export default function useTaskNotifications() {
  const { tasks } = useTasks();

  useEffect(() => {
    // Yêu cầu quyền thông báo nếu chưa có
    if (Notification.permission !== "granted") {
      Notification.requestPermission();
    }

    // Lưu task đã thông báo để tránh spam
    const notifiedTasks: Record<string, boolean> = {};

    const interval = setInterval(() => {
      const now = Date.now() +  60_000;
      const avgDelay = 0; // Thời gian trễ trung bình (phút), có thể thay bằng logic thực tế

      tasks.forEach((t) => {
        if (!t.officialDeadline || t.done) return;

        const deadlineMs = new Date(t.officialDeadline).getTime();
        const effectiveDeadline = deadlineMs - avgDelay * 60_000;

        if (now >= effectiveDeadline && now < deadlineMs && !notifiedTasks[t.id]) {
          new Notification("⏰ Bắt đầu ngay kẻo trễ!", {
            body: `Task: ${t.title}\nDeadline: ${new Date(
              t.officialDeadline
            ).toLocaleTimeString()}\nThói quen trễ: ~${avgDelay} phút`,
          });
          notifiedTasks[t.id] = true;
        }
      });
    }, 5_000); // check mỗi phút

    return () => clearInterval(interval);
  }, [tasks]);
}
