// utils/recommendTasksAI.ts
export default async function recommendTasksAI(mood: string, tasks: any[]) {
  const r = await fetch("/api/ai-recommend", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mood, tasks }),
  });

  if (!r.ok) {
    throw new Error("AI recommend API failed");
  }

  return await r.json(); 
  // { recommended: string[], reason: string }
}
