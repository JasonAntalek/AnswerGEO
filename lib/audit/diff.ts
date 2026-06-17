import type { AuditDiff, AuditReport, Platform, PlatformDiff } from "@/lib/types";

function competitorNames(report: AuditReport): Set<string> {
  return new Set(report.competitors.map((entry) => entry.name.toLowerCase()));
}

function platformDiff(
  platform: Platform,
  previous: AuditReport,
  current: AuditReport,
): PlatformDiff {
  const prev = previous.platformResults.find((result) => result.platform === platform);
  const curr = current.platformResults.find((result) => result.platform === platform);

  return {
    platform,
    previousMentioned: prev?.userMentioned ?? false,
    currentMentioned: curr?.userMentioned ?? false,
    previousPosition: prev?.userPosition ?? null,
    currentPosition: curr?.userPosition ?? null,
  };
}

export function buildAuditDiff(
  previous: AuditReport | null,
  current: AuditReport,
): AuditDiff {
  if (!previous) {
    return {
      previousAuditId: null,
      currentAuditId: current.id,
      scoreDelta: null,
      previousScore: null,
      currentScore: current.visibilityScore,
      platformChanges: [],
      newCompetitors: current.competitors.map((entry) => entry.name),
      droppedCompetitors: [],
      daysBetween: null,
    };
  }

  const prevCompetitors = competitorNames(previous);
  const currCompetitors = competitorNames(current);

  const newCompetitors = current.competitors
    .map((entry) => entry.name)
    .filter((name) => !prevCompetitors.has(name.toLowerCase()));

  const droppedCompetitors = previous.competitors
    .map((entry) => entry.name)
    .filter((name) => !currCompetitors.has(name.toLowerCase()));

  const previousDate = new Date(previous.createdAt).getTime();
  const currentDate = new Date(current.createdAt).getTime();
  const daysBetween = Math.round((currentDate - previousDate) / (1000 * 60 * 60 * 24));

  const previousScore = previous.visibilityScore ?? 0;
  const currentScore = current.visibilityScore ?? 0;

  return {
    previousAuditId: previous.id,
    currentAuditId: current.id,
    scoreDelta: currentScore - previousScore,
    previousScore,
    currentScore,
    platformChanges: [
      platformDiff("openai", previous, current),
      platformDiff("gemini", previous, current),
    ],
    newCompetitors,
    droppedCompetitors,
    daysBetween,
  };
}
