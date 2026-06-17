import { relations } from "drizzle-orm";
import {
  boolean,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const auditStatusEnum = pgEnum("audit_status", [
  "pending",
  "running",
  "complete",
  "failed",
]);

export const platformEnum = pgEnum("platform", ["openai", "gemini"]);

export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey(),
  email: text("email").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const businesses = pgTable("businesses", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => profiles.id, { onDelete: "cascade" }),
  businessName: text("business_name").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  category: text("category").notNull(),
  lastAuditedAt: timestamp("last_audited_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const audits = pgTable("audits", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => profiles.id, { onDelete: "set null" }),
  businessId: uuid("business_id").references(() => businesses.id, {
    onDelete: "set null",
  }),
  runNumber: integer("run_number").notNull().default(1),
  businessName: text("business_name").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  category: text("category").notNull(),
  email: text("email"),
  status: auditStatusEnum("status").notNull().default("pending"),
  visibilityScore: integer("visibility_score"),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const auditResults = pgTable("audit_results", {
  id: uuid("id").primaryKey().defaultRandom(),
  auditId: uuid("audit_id")
    .notNull()
    .references(() => audits.id, { onDelete: "cascade" }),
  platform: platformEnum("platform").notNull(),
  query: text("query").notNull(),
  rawResponse: text("raw_response").notNull(),
  businesses: jsonb("businesses").$type<string[]>().notNull().default([]),
  userMentioned: boolean("user_mentioned").notNull().default(false),
  userPosition: integer("user_position"),
});

export const recommendations = pgTable("recommendations", {
  id: uuid("id").primaryKey().defaultRandom(),
  auditId: uuid("audit_id")
    .notNull()
    .references(() => audits.id, { onDelete: "cascade" }),
  priority: integer("priority").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  metricTarget: text("metric_target"),
});

export const profilesRelations = relations(profiles, ({ many }) => ({
  businesses: many(businesses),
  audits: many(audits),
}));

export const businessesRelations = relations(businesses, ({ one, many }) => ({
  user: one(profiles, {
    fields: [businesses.userId],
    references: [profiles.id],
  }),
  audits: many(audits),
}));

export const auditsRelations = relations(audits, ({ one, many }) => ({
  user: one(profiles, {
    fields: [audits.userId],
    references: [profiles.id],
  }),
  business: one(businesses, {
    fields: [audits.businessId],
    references: [businesses.id],
  }),
  auditResults: many(auditResults),
  recommendations: many(recommendations),
}));

export const auditResultsRelations = relations(auditResults, ({ one }) => ({
  audit: one(audits, {
    fields: [auditResults.auditId],
    references: [audits.id],
  }),
}));

export const recommendationsRelations = relations(recommendations, ({ one }) => ({
  audit: one(audits, {
    fields: [recommendations.auditId],
    references: [audits.id],
  }),
}));
