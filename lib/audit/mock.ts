import type { AuditInput } from "@/lib/types";

export function hasAnyAiKey() {
  if (process.env.ANSWERSPOT_DEMO_MODE === "true") return false;
  return Boolean(process.env.OPENAI_API_KEY || process.env.GEMINI_API_KEY);
}

export function buildMockPipeline(input: AuditInput) {
  const competitors = [
    `${input.city} Premier ${input.category}`,
    `Northside ${input.category} Co.`,
    `Trusted ${input.category} Pros`,
    `${input.state} Best ${input.category}`,
  ];

  const mentioned = input.businessName.length % 2 === 0;

  return {
    visibilityScore: mentioned ? 62 : 18,
    visibilityLabel: mentioned ? "Emerging" : "Invisible",
    summary: mentioned
      ? `${input.businessName} appears in some AI answers for ${input.city}, ${input.state}, but competitors still outrank you.`
      : `${input.businessName} is largely invisible in AI-driven local discovery for ${input.city}, ${input.state}.`,
    platformResults: [
      {
        platform: "openai" as const,
        query: `Who are the top 5 ${input.category} businesses in ${input.city}, ${input.state}?`,
        rawResponse: JSON.stringify({ businesses: competitors }),
        businesses: competitors,
        userMentioned: mentioned,
        userPosition: mentioned ? 3 : null,
        available: true,
      },
      {
        platform: "gemini" as const,
        query: `Who are the top 5 ${input.category} businesses in ${input.city}, ${input.state}?`,
        rawResponse: JSON.stringify({ businesses: competitors.slice(0, 3) }),
        businesses: competitors.slice(0, 3),
        userMentioned: false,
        userPosition: null,
        available: true,
      },
    ],
    competitors: competitors.map((name, index) => ({
      name,
      mentions: index < 2 ? 2 : 1,
    })),
    recommendations: [
      {
        priority: 1 as const,
        title: "You are missing from one or more AI platforms",
        description:
          "Complete your Google Business Profile and collect recent reviews so AI models can verify your business.",
        metricTarget: "Target 50+ Google reviews in the next 90 days",
      },
      {
        priority: 2 as const,
        title: "Add LocalBusiness schema markup",
        description:
          "Add structured data with business name, address, phone, and service area on your website.",
        metricTarget: "Deploy schema on homepage + contact page",
      },
    ],
  };
}
