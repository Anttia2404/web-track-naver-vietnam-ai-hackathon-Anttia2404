// api/ai-summary.ts
import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).send("Method not allowed");
  const { tasks } = req.body; // tasks: [{ id, title, officialDeadline, estimatedMinutes }, ...]

  if (!tasks || !Array.isArray(tasks)) return res.status(400).json({ error: "tasks required" });

  // build prompt (tiếng Việt) — yêu cầu output JSON để dễ parse
  const prompt = `Bạn là một trợ lý quản lý công việc. 
Dưới đây là danh sách công việc (mỗi dòng: title | officialDeadline | estimatedMinutes phút):
${tasks
    .map(
      (t: any, i: number) =>
        `${i + 1}. ${t.title} | ${t.officialDeadline || "no-deadline"} | ${t.estimatedMinutes || 0}`
    )
    .join("\n")}
Hãy trả về **JSON** (chỉ JSON) có các trường:
- countImportant: số công việc "quan trọng" (deadline trong hôm nay hoặc deadline trước 18:00 cùng ngày)
- totalMinutes: tổng estimatedMinutes của những công việc quan trọng
- totalHours: tổngMinutes quy ra giờ (số thập phân 1 chữ số)
- topRecommendation: tiêu đề 1 task nên làm trước (string)
- shortSummary: một câu tóm tắt bằng tiếng Việt (string).
Trả chính xác JSON, không kèm lời bình.`;

  try {
    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini", // hoặc model bạn có access
        messages: [
          { role: "system", content: "Bạn là trợ lý tóm tắt công việc bằng tiếng Việt." },
          { role: "user", content: prompt },
        ],
        max_tokens: 400,
        temperature: 0.2,
      }),
    });

    const data = await r.json();
    const text = data?.choices?.[0]?.message?.content ?? data?.choices?.[0]?.text ?? "";

    // thử parse JSON
    try {
      const json = JSON.parse(text);
      return res.status(200).json(json);
    } catch (err) {
      // nếu AI trả text không strict JSON thì fallback trả summary text
      return res.status(200).json({ summary: text });
    }
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ error: "OpenAI request failed", detail: err.message });
  }
}
