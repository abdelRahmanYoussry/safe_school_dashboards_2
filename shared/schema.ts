import { pgTable, text, serial, integer, timestamp, doublePrecision, json, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// plans
export const plans = pgTable("plans", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  price: doublePrecision("price").notNull(),
  maxStudents: integer("max_students").notNull(),
  maxStaff: integer("max_staff").notNull(),
  durationDays: integer("duration_days").notNull(),
  features: json("features").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// schools
export const schools = pgTable("schools", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  address: text("address").notNull(),
  lat: doublePrecision("lat").notNull(),
  lng: doublePrecision("lng").notNull(),
  geofenceRadius: integer("geofence_radius").notNull(),
  planId: text("plan_id").references(() => plans.id),
  isActive: boolean("is_active").notNull().default(true),
  logoUrl: text("logo_url"),
  schoolOtp: text("school_otp"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// safety_reports
export const safetyReports = pgTable("safety_reports", {
  id: serial("id").primaryKey(),
  schoolId: integer("school_id").references(() => schools.id),
  title: text("title").notNull(),
  body: text("body").notNull(),
  severity: text("severity").notNull(), // LOW, MEDIUM, HIGH, CRITICAL
  status: text("status").notNull().default('open'), // open, resolved
  authorId: integer("author_id").references(() => users.id),
  resolvedAt: timestamp("resolved_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// support_tickets
export const supportTickets = pgTable("support_tickets", {
  id: serial("id").primaryKey(),
  schoolId: integer("school_id").references(() => schools.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  status: text("status").notNull().default('open'), // open, in_progress, closed
  createdAt: timestamp("created_at").defaultNow(),
});

// audit_logs
export const auditLogs = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id"),
  action: text("action").notNull(),
  schoolId: integer("school_id").references(() => schools.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// users
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().$type<'super_admin' | 'school_admin'>(),
  schoolId: integer("school_id").references(() => schools.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertPlanSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  price: z.number().positive(),
  maxStudents: z.number().int().positive(),
  maxStaff: z.number().int().positive(),
  durationDays: z.number().int().positive(),
  features: z.object({
    hasBusTracking: z.boolean().optional(),
    maxSms: z.number().optional(),
    hasAnalytics: z.boolean().optional(),
  }).optional().default({}),
  isActive: z.boolean().optional().default(true),
});
export const insertSchoolAdminSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  password: z.string().min(6),
  phone: z.string().min(10)
});

export const insertSchoolSchema = z.object({
  name: z.string(),
  address: z.string(),
  lat: z.number(),
  lng: z.number(),
  geofenceRadius: z.number().min(50).max(5000),
  logoUrl: z.string().url().optional().or(z.literal("")),
  isActive: z.boolean().optional(),
  admin: insertSchoolAdminSchema
});

export const assignSubscriptionSchema = z.object({
  schoolId: z.string(),
  planId: z.string(),
  startDate: z.string().optional()
});

export const insertSafetyReportSchema = createInsertSchema(safetyReports).omit({ id: true, createdAt: true });
export const insertSupportTicketSchema = createInsertSchema(supportTickets).omit({ id: true, createdAt: true });
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });

// Exports
// Plan type is defined manually above to match the external API response
export type School = typeof schools.$inferSelect;
export type SafetyReport = typeof safetyReports.$inferSelect;
export type SupportTicket = typeof supportTickets.$inferSelect;
export type AuditLog = typeof auditLogs.$inferSelect;
export type User = typeof users.$inferSelect;

export type InsertPlan = z.infer<typeof insertPlanSchema>;
export type Plan = {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  maxStudents: number;
  maxStaff: number;
  durationDays: number;
  features: { hasBusTracking?: boolean; maxSms?: number; hasAnalytics?: boolean };
  isActive: boolean;
  createdAt?: string | null;
  updatedAt?: string | null;
};
export type InsertSchool = z.infer<typeof insertSchoolSchema>;
export type InsertSchoolAdmin = z.infer<typeof insertSchoolAdminSchema>;
export type AssignSubscription = z.infer<typeof assignSubscriptionSchema>;
export type InsertSafetyReport = z.infer<typeof insertSafetyReportSchema>;
export type InsertSupportTicket = z.infer<typeof insertSupportTicketSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;
