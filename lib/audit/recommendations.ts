import type { PlatformResult, Recommendation } from "@/lib/types";

export function generateRecommendations(
  businessName: string,
  results: PlatformResult[],
  competitors: Array<{ name: string; mentions: number }>,
): Recommendation[] {
  const recs: Recommendation[] = [];
  const available = results.filter((result) => result.available);
  const mentionedOnAny = available.some((result) => result.userMentioned);
  const topCompetitor = competitors[0]?.name ?? "local leaders";

  if (!mentionedOnAny) {
    recs.push({
      priority: 1,
      title: "You are missing from AI recommendations",
      description:
        "AI assistants are recommending competitors instead of your business. Start by completing your Google Business Profile and collecting recent reviews.",
      metricTarget: "Target 50+ Google reviews in the next 90 days",
    });
  }

  if (available.some((result) => !result.userMentioned)) {
    recs.push({
      priority: 1,
      title: "Claim high-trust citation sources",
      description:
        "List your business on Yelp, BBB, Angi, and industry directories so AI models can verify your business details.",
      metricTarget: "Claim 5 citation profiles this month",
    });
  }

  if (mentionedOnAny && available.some((result) => (result.userPosition ?? 99) > 2)) {
    recs.push({
      priority: 2,
      title: "Improve recommendation rank",
      description: `You appear in AI answers, but ${topCompetitor} is mentioned more often. Publish localized service pages and gather fresh reviews to move up.`,
      metricTarget: "Add 10 new reviews in 60 days",
    });
  }

  recs.push({
    priority: 2,
    title: "Add LocalBusiness schema markup",
    description:
      "Add structured data to your website with business name, address, phone, hours, and service area so AI systems can parse your details reliably.",
    metricTarget: "Deploy schema on homepage + contact page",
  });

  recs.push({
    priority: 3,
    title: "Monitor weekly AI visibility shifts",
    description:
      "AI recommendations change as competitors earn reviews and citations. Re-run this audit weekly to catch new entrants early.",
    metricTarget: "Schedule a weekly check every Monday",
  });

  return recs
    .slice(0, 5)
    .sort((a, b) => a.priority - b.priority);
}

export function buildSummary(
  businessName: string,
  city: string,
  state: string,
  score: number,
  results: PlatformResult[],
): string {
  const label = score >= 75 ? "competitive" : score >= 40 ? "emerging" : "largely invisible";
  const mentionedPlatforms = results
    .filter((result) => result.available && result.userMentioned)
    .map((result) => (result.platform === "openai" ? "ChatGPT" : "Gemini"));

  if (mentionedPlatforms.length === 0) {
    return `${businessName} appears ${label} in AI-driven local discovery for ${city}, ${state}. Neither ChatGPT nor Gemini currently recommends your business when customers search for your category.`;
  }

  return `${businessName} has ${label} AI visibility in ${city}, ${state}. You were mentioned on ${mentionedPlatforms.join(" and ")}. Focus on the fixes below to improve rank and consistency.`;
}
