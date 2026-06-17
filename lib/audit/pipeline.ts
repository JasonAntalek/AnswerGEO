import { queryGemini } from "@/lib/ai/gemini";
import { queryOpenAI } from "@/lib/ai/openai";
import { findBusinessPosition } from "@/lib/audit/business-matcher";
import { buildMockPipeline, hasAnyAiKey } from "@/lib/audit/mock";
import { generateAuditQueries } from "@/lib/audit/query-generator";
import {
  buildSummary,
  generateRecommendations,
} from "@/lib/audit/recommendations";
import { parseBusinessesFromResponse } from "@/lib/audit/response-parser";
import {
  buildCompetitorLeaderboard,
  calculateVisibilityScore,
  getVisibilityLabel,
} from "@/lib/audit/scoring";
import type {
  AuditInput,
  AuditReport,
  Platform,
  PlatformResult,
} from "@/lib/types";

async function runPlatformQuery(
  platform: Platform,
  query: string,
  businessName: string,
): Promise<PlatformResult> {
  try {
    const rawResponse =
      platform === "openai" ? await queryOpenAI(query) : await queryGemini(query);
    const businesses = parseBusinessesFromResponse(rawResponse);
    const match = findBusinessPosition(businesses, businessName);

    return {
      platform,
      query,
      rawResponse,
      businesses,
      userMentioned: match.mentioned,
      userPosition: match.position,
      available: true,
    };
  } catch (error) {
    return {
      platform,
      query,
      rawResponse: "",
      businesses: [],
      userMentioned: false,
      userPosition: null,
      available: false,
      error: error instanceof Error ? error.message : "Platform query failed",
    };
  }
}

export async function runAuditPipeline(input: AuditInput) {
  if (!hasAnyAiKey()) {
    return buildMockPipeline(input);
  }

  const queries = generateAuditQueries(input.category, input.city, input.state);
  const primaryQuery = queries[0];

  const [openaiResult, geminiResult] = await Promise.all([
    runPlatformQuery("openai", primaryQuery, input.businessName),
    runPlatformQuery("gemini", primaryQuery, input.businessName),
  ]);

  const platformResults = [openaiResult, geminiResult];

  if (platformResults.every((result) => !result.available)) {
    return buildMockPipeline(input);
  }

  const visibilityScore = calculateVisibilityScore(platformResults);
  const competitors = buildCompetitorLeaderboard(platformResults).filter(
    (entry) => entry.name.toLowerCase() !== input.businessName.toLowerCase(),
  );
  const recommendations = generateRecommendations(
    input.businessName,
    platformResults,
    competitors,
  );
  const summary = buildSummary(
    input.businessName,
    input.city,
    input.state,
    visibilityScore,
    platformResults,
  );

  return {
    visibilityScore,
    visibilityLabel: getVisibilityLabel(visibilityScore),
    summary,
    platformResults,
    competitors,
    recommendations,
  };
}

export function toAuditReport(
  id: string,
  input: AuditInput,
  status: AuditReport["status"],
  createdAt: string,
  pipeline?: Awaited<ReturnType<typeof runAuditPipeline>>,
  errorMessage?: string,
): AuditReport {
  return {
    id,
    businessName: input.businessName,
    city: input.city,
    state: input.state,
    category: input.category,
    status,
    visibilityScore: pipeline?.visibilityScore ?? null,
    visibilityLabel: pipeline?.visibilityLabel ?? "Pending",
    summary: pipeline?.summary ?? "Audit in progress...",
    platformResults: pipeline?.platformResults ?? [],
    competitors: pipeline?.competitors ?? [],
    recommendations: pipeline?.recommendations ?? [],
    createdAt,
    errorMessage,
  };
}
