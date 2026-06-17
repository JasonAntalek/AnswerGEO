import type { PlatformResult } from "@/lib/types";

export function getVisibilityLabel(score: number): string {
  if (score >= 75) return "Competitive";
  if (score >= 40) return "Emerging";
  return "Invisible";
}

export function calculateVisibilityScore(results: PlatformResult[]): number {
  const available = results.filter((result) => result.available);
  if (available.length === 0) return 0;

  let total = 0;

  for (const result of available) {
    if (!result.userMentioned) {
      total += 10;
      continue;
    }

    const position = result.userPosition ?? 5;
    const positionScore = Math.max(0, 100 - (position - 1) * 20);
    total += positionScore;
  }

  return Math.round(total / available.length);
}

export function buildCompetitorLeaderboard(results: PlatformResult[]) {
  const counts = new Map<string, number>();

  for (const result of results) {
    for (const business of result.businesses) {
      const key = business.trim();
      if (!key) continue;
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
  }

  return [...counts.entries()]
    .map(([name, mentions]) => ({ name, mentions }))
    .sort((a, b) => b.mentions - a.mentions)
    .slice(0, 5);
}
