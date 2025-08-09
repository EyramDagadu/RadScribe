import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const reports = pgTable("reports", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  patientName: text("patient_name").notNull(),
  patientAge: integer("patient_age").notNull(),
  patientGender: text("patient_gender").notNull(),
  modality: text("modality").notNull(),
  clinicalIndication: text("clinical_indication").notNull(),
  transcript: text("transcript"),
  formattedContent: text("formatted_content"),
  reportDate: timestamp("report_date").defaultNow(),
  metadata: jsonb("metadata"),
});

export const settings = pgTable("settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: text("user_id").notNull(),
  openaiApiKey: text("openai_api_key"),
  fontSize: integer("font_size").default(14),
  theme: text("theme").default("light"),
});

export const insertReportSchema = createInsertSchema(reports).omit({
  id: true,
  reportDate: true,
});

export const insertSettingsSchema = createInsertSchema(settings).omit({
  id: true,
});

export type InsertReport = z.infer<typeof insertReportSchema>;
export type Report = typeof reports.$inferSelect;
export type InsertSettings = z.infer<typeof insertSettingsSchema>;
export type Settings = typeof settings.$inferSelect;

// Client-side types for local storage
export interface LocalReport {
  id: string;
  patientName: string;
  patientAge: number;
  patientGender: string;
  modality: string;
  clinicalIndication: string;
  transcript?: string;
  formattedContent?: string;
  reportDate: string;
  metadata?: any;
}

export interface LocalSettings {
  openaiApiKey?: string;
  fontSize: number;
  theme: string;
}
