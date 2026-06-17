import { randomUUID } from "crypto";
import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import type { AuditReport } from "@/lib/types";

const DATA_DIR = path.join(process.cwd(), ".data");
const STORE_PATH = path.join(DATA_DIR, "audits.json");

type StoreShape = Record<string, AuditReport>;

async function readStore(): Promise<StoreShape> {
  try {
    const raw = await readFile(STORE_PATH, "utf8");
    return JSON.parse(raw) as StoreShape;
  } catch {
    return {};
  }
}

async function writeStore(store: StoreShape) {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(STORE_PATH, JSON.stringify(store, null, 2), "utf8");
}

export async function createFileAudit(report: AuditReport): Promise<AuditReport> {
  const store = await readStore();
  store[report.id] = report;
  await writeStore(store);
  return report;
}

export async function updateFileAudit(report: AuditReport): Promise<AuditReport> {
  const store = await readStore();
  store[report.id] = report;
  await writeStore(store);
  return report;
}

export async function getFileAudit(id: string): Promise<AuditReport | null> {
  const store = await readStore();
  return store[id] ?? null;
}

export function newAuditId() {
  return randomUUID();
}
