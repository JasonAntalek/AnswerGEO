interface ParsedBusinessResponse {
  businesses: string[];
}

function extractFromJson(text: string): string[] | null {
  try {
    const parsed = JSON.parse(text) as ParsedBusinessResponse;
    if (Array.isArray(parsed.businesses)) {
      return parsed.businesses
        .map((name) => String(name).trim())
        .filter(Boolean)
        .slice(0, 10);
    }
  } catch {
    return null;
  }
  return null;
}

function extractFromText(text: string): string[] {
  const lines = text.split("\n");
  const businesses: string[] = [];

  for (const line of lines) {
    const cleaned = line
      .replace(/^\s*[\d]+[.)]\s*/, "")
      .replace(/^\s*[-*•]\s*/, "")
      .replace(/\*\*/g, "")
      .trim();

    if (!cleaned || cleaned.length < 3) continue;
    if (/^(why|because|note|here|the following)/i.test(cleaned)) continue;

    const name = cleaned.split(/[–—:-]/)[0]?.trim();
    if (name && name.length >= 3 && name.length <= 80) {
      businesses.push(name);
    }
  }

  return [...new Set(businesses)].slice(0, 10);
}

export function parseBusinessesFromResponse(text: string): string[] {
  const fromJson = extractFromJson(text);
  if (fromJson && fromJson.length > 0) {
    return fromJson;
  }

  return extractFromText(text);
}
