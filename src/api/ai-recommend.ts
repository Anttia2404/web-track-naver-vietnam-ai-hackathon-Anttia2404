import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST")
    return res.status(405).send("Method not allowed");

  const { tasks, mood } = req.body;

  console.log("🟢 Incoming request body:", req.body);

  if (!tasks || !Array.isArray(tasks) || !mood) {
    return res.status(400).json({ error: "tasks and mood required" });
  }

  const prompt = `Bạn là trợ lý sắp xếp công việc theo mood "${mood}".
Danh sách task (id | title | officialDeadline | estimatedMinutes):
${tasks
    .map(
      (t: any) =>
        `${t.id} | ${t.title} | ${t.officialDeadline || "no-deadline"} | ${
          t.estimatedMinutes || 0
        }`
    )
    .join("\n")}

⚠️ Chỉ trả về JSON hợp lệ, không thêm bất kỳ chữ nào ngoài JSON.

Format JSON:
{
  "recommended": ["id1", "id2", ...],
  "reason": "một câu ngắn giải thích tiêu chí"
}`;

  try {
    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "Bạn là trợ lý ưu tiên công việc." },
          { role: "user", content: prompt },
        ],
        max_tokens: 400,
        temperature: 0.6,
      }),
    });

    const data = await r.json();
    const text =
      data?.choices?.[0]?.message?.content ??
      data?.choices?.[0]?.text ??
      "";

    console.log("🔍 AI raw response:", text);

    try {
      const match = text.match(/\{[\s\S]*\}/);
      if (!match) throw new Error("No JSON found in AI response");

      const json = JSON.parse(match[0]);
      return res.status(200).json(json);
    } catch (err) {
      console.error("❌ JSON parse error:", err);
      return res.status(200).json({
        recommended: [],
        reason: "AI recommend failed",
        raw: text,
      });
    }
  } catch (err: any) {
    console.error("❌ OpenAI API error:", err);
    return res
      .status(500)
      .json({ error: "OpenAI request failed", detail: err.message });
  }
}
