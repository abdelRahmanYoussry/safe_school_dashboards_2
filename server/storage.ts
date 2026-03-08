import { db } from "./db";
import {
  plans, schools, safetyReports, supportTickets, auditLogs,
  type Plan, type School, type SafetyReport, type SupportTicket, type AuditLog,
  type InsertPlan, type InsertSchool, type InsertSafetyReport, type InsertSupportTicket
} from "@shared/schema";
import { eq } from "drizzle-orm";

export interface IStorage {
  // Stats
  getDashboardStats(): Promise<any>;
  getAnalytics(): Promise<any>;

  // Plans
  getPlans(): Promise<Plan[]>;
  createPlan(plan: InsertPlan): Promise<Plan>;
  updatePlan(id: number, updates: Partial<InsertPlan>): Promise<Plan>;
  deletePlan(id: number): Promise<void>;

  // Schools
  getSchools(): Promise<School[]>;
  getSchool(id: number): Promise<School | undefined>;
  createSchool(school: InsertSchool): Promise<School>;
  updateSchool(id: number, updates: Partial<InsertSchool>): Promise<School>;
  deleteSchool(id: number): Promise<void>;

  // Safety Reports
  getSafetyReports(): Promise<SafetyReport[]>;

  // Tickets
  getTickets(): Promise<SupportTicket[]>;
  updateTicket(id: number, updates: Partial<InsertSupportTicket>): Promise<SupportTicket>;

  // Audit Logs
  getAuditLogs(): Promise<AuditLog[]>;
}

export class DatabaseStorage implements IStorage {
  async getDashboardStats() {
    return {
      totalSchools: 124,
      totalUsers: 45200,
      activePickups: 342,
      totalStudents: 32000,
      totalParents: 12000,
      totalStaff: 1200,
      safetyIncidents: 2,
      systemHealth: 99.9
    };
  }

  async getAnalytics() {
    return {
      schoolGrowth: [
        { name: "Jan", value: 40 },
        { name: "Feb", value: 65 },
        { name: "Mar", value: 85 },
        { name: "Apr", value: 100 },
        { name: "May", value: 124 }
      ],
      userRegistrations: [
        { name: "Mon", value: 120 },
        { name: "Tue", value: 150 },
        { name: "Wed", value: 180 },
        { name: "Thu", value: 140 },
        { name: "Fri", value: 200 }
      ],
      pickupRequests: [
        { name: "14:00", value: 50 },
        { name: "14:30", value: 150 },
        { name: "15:00", value: 800 },
        { name: "15:30", value: 300 },
        { name: "16:00", value: 50 }
      ],
      safetyTrend: [
        { name: "Week 1", value: 5 },
        { name: "Week 2", value: 3 },
        { name: "Week 3", value: 4 },
        { name: "Week 4", value: 2 }
      ]
    };
  }

  async getPlans(): Promise<Plan[]> {
    return await db.select().from(plans);
  }

  async createPlan(plan: InsertPlan): Promise<Plan> {
    const [created] = await db.insert(plans).values(plan).returning();
    return created;
  }

  async updatePlan(id: number, updates: Partial<InsertPlan>): Promise<Plan> {
    const [updated] = await db.update(plans).set(updates).where(eq(plans.id, id)).returning();
    return updated;
  }

  async deletePlan(id: number): Promise<void> {
    await db.delete(plans).where(eq(plans.id, id));
  }

  async getSchools(): Promise<School[]> {
    return await db.select().from(schools);
  }

  async getSchool(id: number): Promise<School | undefined> {
    const [school] = await db.select().from(schools).where(eq(schools.id, id));
    return school;
  }

  async createSchool(school: InsertSchool): Promise<School> {
    const [created] = await db.insert(schools).values(school).returning();
    return created;
  }

  async updateSchool(id: number, updates: Partial<InsertSchool>): Promise<School> {
    const [updated] = await db.update(schools).set(updates).where(eq(schools.id, id)).returning();
    return updated;
  }

  async deleteSchool(id: number): Promise<void> {
    await db.delete(schools).where(eq(schools.id, id));
  }

  async getSafetyReports(): Promise<SafetyReport[]> {
    return await db.select().from(safetyReports);
  }

  async getTickets(): Promise<SupportTicket[]> {
    return await db.select().from(supportTickets);
  }

  async updateTicket(id: number, updates: Partial<InsertSupportTicket>): Promise<SupportTicket> {
    const [updated] = await db.update(supportTickets).set(updates).where(eq(supportTickets.id, id)).returning();
    return updated;
  }

  async getAuditLogs(): Promise<AuditLog[]> {
    return await db.select().from(auditLogs);
  }
}

export const storage = new DatabaseStorage();
