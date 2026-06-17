import { GoogleGenerativeAI } from "@google/generative-ai";

const SYSTEM_PROMPT =
  "You help local consumers discover service businesses. Respond with JSON only using this shape: {\"businesses\": [\"Business Name 1\", \"Business Name 2\"]}. Include up to 5 real or plausible local business names based on your knowledge. No markdown.";

export async function queryGemini(prompt: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    generationConfig: {
      temperature: 0.2,
      responseMimeType: "application/json",
    },
  });

  const result = await model.generateContent([
    { text: SYSTEM_PROMPT },
    { text: prompt },
  ]);

  return result.response.text();
}
