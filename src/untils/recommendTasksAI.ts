// utils/recommendTasksAI.ts
// src/untils/recommendTasksAI.ts
export default async function recommendTasksAI(mood: string, tasks: any[]) {
  const res = await fetch("/api/ai-recommend", {
    method: "POST", // ✅ phải là POST
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      tasks,
      mood,
    }),
  });

  if (!res.ok) {
    throw new Error(`AI recommend API failed: ${res.status}`);
  }

  return res.json();
}
