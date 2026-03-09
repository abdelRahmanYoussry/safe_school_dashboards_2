import { pgTable, text, serial, integer, timestamp, doublePrecision, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// plans
export const plans = pgTable("plans", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  maxStudents: integer("max_students").notNull(),
  maxStaff: integer("max_staff").notNull(),
  monthlyPrice: integer("monthly_price").notNull(), // in cents
  features: json("features").notNull(), // array of strings
});

// schools
export const schools = pgTable("schools", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  address: text("address").notNull(),
  city: text("city").notNull(),
  latitude: doublePrecision("latitude").notNull(),
  longitude: doublePrecision("longitude").notNull(),
  geofenceRadius: integer("geofence_radius").notNull(),
  planId: integer("plan_id").references(() => plans.id),
  status: text("status").notNull().default('active'), // active, inactive, suspended
  avatar: text("avatar"),
  totalUsers: integer("total_users").notNull().default(0),
  totalStudents: integer("total_students").notNull().default(0),
  activePickups: integer("active_pickups").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// safety_reports
export const safetyReports = pgTable("safety_reports", {
  id: serial("id").primaryKey(),
  schoolId: integer("school_id").references(() => schools.id),
  reportType: text("report_type").notNull(),
  reportedBy: text("reported_by").notNull(),
  severity: text("severity").notNull(), // low, medium, high, critical
  status: text("status").notNull().default('open'), // open, resolved
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

export const insertPlanSchema = createInsertSchema(plans).omit({ id: true });
export const insertSchoolSchema = createInsertSchema(schools).omit({ id: true, createdAt: true });
export const insertSafetyReportSchema = createInsertSchema(safetyReports).omit({ id: true, createdAt: true });
export const insertSupportTicketSchema = createInsertSchema(supportTickets).omit({ id: true, createdAt: true });
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });

// Exports
export type Plan = typeof plans.$inferSelect;
export type School = typeof schools.$inferSelect;
export type SafetyReport = typeof safetyReports.$inferSelect;
export type SupportTicket = typeof supportTickets.$inferSelect;
export type AuditLog = typeof auditLogs.$inferSelect;
export type User = typeof users.$inferSelect;

export type InsertPlan = z.infer<typeof insertPlanSchema>;
export type InsertSchool = z.infer<typeof insertSchoolSchema>;
export type InsertSafetyReport = z.infer<typeof insertSafetyReportSchema>;
export type InsertSupportTicket = z.infer<typeof insertSupportTicketSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;
