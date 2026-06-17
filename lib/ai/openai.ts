import OpenAI from "openai";

const SYSTEM_PROMPT =
  "You help local consumers discover service businesses. Respond with JSON only using this shape: {\"businesses\": [\"Business Name 1\", \"Business Name 2\"]}. Include up to 5 real or plausible local business names based on your knowledge. No markdown.";

export async function queryOpenAI(prompt: string): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured");
  }

  const client = new OpenAI({ apiKey });
  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.2,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: prompt },
    ],
  });

  return response.choices[0]?.message?.content ?? "";
}
