export type Platform = "openai" | "gemini";

export type AuditStatus = "pending" | "running" | "complete" | "failed";

export interface AuditInput {
  businessName: string;
  city: string;
  state: string;
  category: string;
  email?: string;
}

export interface AuditContext {
  userId?: string;
  businessId?: string;
  runNumber?: number;
}

export interface PlatformResult {
  platform: Platform;
  query: string;
  rawResponse: string;
  businesses: string[];
  userMentioned: boolean;
  userPosition: number | null;
  available: boolean;
  error?: string;
}

export interface Recommendation {
  priority: 1 | 2 | 3;
  title: string;
  description: string;
  metricTarget?: string;
}

export interface AuditReport {
  id: string;
  businessName: string;
  city: string;
  state: string;
  category: string;
  status: AuditStatus;
  visibilityScore: number | null;
  visibilityLabel: string;
  summary: string;
  platformResults: PlatformResult[];
  competitors: Array<{ name: string; mentions: number }>;
  recommendations: Recommendation[];
  createdAt: string;
  errorMessage?: string;
  userId?: string | null;
  businessId?: string | null;
  runNumber?: number;
}

export interface TrackedBusiness {
  id: string;
  businessName: string;
  city: string;
  state: string;
  category: string;
  lastAuditedAt: string | null;
  latestScore: number | null;
  auditCount: number;
  createdAt: string;
}

export interface AuditHistoryItem {
  id: string;
  runNumber: number;
  visibilityScore: number | null;
  createdAt: string;
  status: AuditStatus;
}

export interface PlatformDiff {
  platform: Platform;
  previousMentioned: boolean;
  currentMentioned: boolean;
  previousPosition: number | null;
  currentPosition: number | null;
}

export interface AuditDiff {
  previousAuditId: string | null;
  currentAuditId: string;
  scoreDelta: number | null;
  previousScore: number | null;
  currentScore: number | null;
  platformChanges: PlatformDiff[];
  newCompetitors: string[];
  droppedCompetitors: string[];
  daysBetween: number | null;
}
