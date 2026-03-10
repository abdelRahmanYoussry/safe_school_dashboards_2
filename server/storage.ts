import { db } from "./db";
import * as schema from "@shared/schema";
import {
  type Plan, type School, type SafetyReport, type SupportTicket, type AuditLog, type User,
  type InsertPlan, type InsertSchool, type InsertSafetyReport, type InsertSupportTicket, type InsertUser
} from "@shared/schema";
import { eq, sql } from "drizzle-orm";

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
  getIncidents(schoolId: number): Promise<SafetyReport[]>;
  createIncident(schoolId: number, data: { title: string, body: string, severity: string }): Promise<SafetyReport>;
  getSafetyAnalytics(schoolId?: string): Promise<any>;

  // Tickets
  getTickets(): Promise<SupportTicket[]>;
  updateTicket(id: number, updates: Partial<InsertSupportTicket>): Promise<SupportTicket>;

  // Audit Logs
  getAuditLogs(filters?: { userId?: number, action?: string, dateFrom?: string, dateTo?: string }): Promise<AuditLog[]>;

  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
}

export class DatabaseStorage implements IStorage {
  private get db() {
    if (!db) {
      throw new Error("DATABASE_URL is not configured. Please set it in your .env file.");
    }
    return db;
  }

  async getDashboardStats() {
    const [allSchools] = await this.db.select({ count: sql<number>`count(*)` }).from(schema.schools);
    const [allUsers] = await this.db.select({ count: sql<number>`count(*)` }).from(schema.users);
    const [allStudents] = await this.db.select({ total: sql<number>`sum(total_students)` }).from(schema.schools);
    const [incidents] = await this.db.select({ count: sql<number>`count(*)` }).from(schema.safetyReports);

    return {
      totalSchools: Number(allSchools.count),
      totalUsers: Number(allUsers.count),
      activePickups: 0,
      totalStudents: Number(allStudents.total || 0),
      totalParents: 0,
      totalStaff: 0,
      safetyIncidents: Number(incidents.count),
      systemHealth: 99.9
    };
  }

  async getAnalytics() {
    return {
      schoolGrowth: [],
      userRegistrations: [],
      pickupRequests: [],
      safetyTrend: []
    };
  }

  async getSafetyAnalytics(schoolId?: string) {
    let query = this.db.select({
      severity: schema.safetyReports.severity,
      count: sql<number>`count(*)`
    }).from(schema.safetyReports).groupBy(schema.safetyReports.severity);

    if (schoolId) {
      query = query.where(eq(schema.safetyReports.schoolId, parseInt(schoolId))) as any;
    }

    const severityStats = await query;
    const bySeverity = severityStats.reduce((acc: any, curr) => {
      acc[curr.severity] = Number(curr.count);
      return acc;
    }, {});

    let totalIncidentsQuery = this.db.select({ count: sql<number>`count(*)` }).from(schema.safetyReports);
    if (schoolId) {
      totalIncidentsQuery = totalIncidentsQuery.where(eq(schema.safetyReports.schoolId, parseInt(schoolId))) as any;
    }
    const [totalIncidents] = await totalIncidentsQuery;

    return {
      totalIncidents: Number(totalIncidents.count),
      bySeverity,
      bySchool: []
    };
  }

  async getPlans(): Promise<Plan[]> {
    return await this.db.select().from(schema.plans) as Plan[];
  }

  async createPlan(plan: InsertPlan): Promise<Plan> {
    const id = (plan as any).id || Math.random().toString(36).substring(2, 11);
    const [created] = await this.db.insert(schema.plans).values({ ...plan, id }).returning();
    return created as Plan;
  }

  async updatePlan(id: string | number, updates: Partial<InsertPlan>): Promise<Plan> {
    const [updated] = await this.db.update(schema.plans).set(updates).where(eq(schema.plans.id, String(id))).returning();
    return updated as Plan;
  }

  async deletePlan(id: string | number): Promise<void> {
    await this.db.delete(schema.plans).where(eq(schema.plans.id, String(id)));
  }

  async getSchools(): Promise<School[]> {
    return await this.db.select().from(schema.schools);
  }

  async getSchool(id: string | number): Promise<School | undefined> {
    const [school] = await this.db.select().from(schema.schools).where(eq(schema.schools.id, String(id)));
    return school;
  }

  async createSchool(school: InsertSchool): Promise<School> {
    const id = (school as any).id || Math.random().toString(36).substring(2, 11);
    const [created] = await this.db.insert(schema.schools).values({ ...school, id }).returning();
    return created;
  }

  async updateSchool(id: string | number, updates: Partial<InsertSchool>): Promise<School> {
    const [updated] = await this.db.update(schema.schools).set(updates).where(eq(schema.schools.id, String(id))).returning();
    return updated;
  }

  async deleteSchool(id: string | number): Promise<void> {
    await this.db.delete(schema.schools).where(eq(schema.schools.id, String(id)));
  }

  async getSafetyReports(): Promise<SafetyReport[]> {
    return await this.db.select().from(schema.safetyReports);
  }

  async getIncidents(schoolId: number): Promise<SafetyReport[]> {
    return await this.db.select().from(schema.safetyReports).where(eq(schema.safetyReports.schoolId, schoolId));
  }

  async createIncident(schoolId: number, data: { title: string, body: string, severity: string }): Promise<SafetyReport> {
    const [created] = await this.db.insert(schema.safetyReports).values({
      ...data,
      schoolId,
      status: 'open'
    }).returning();
    return created;
  }

  async getTickets(): Promise<SupportTicket[]> {
    return await this.db.select().from(schema.supportTickets);
  }

  async updateTicket(id: number, updates: Partial<InsertSupportTicket>): Promise<SupportTicket> {
    const [updated] = await this.db.update(schema.supportTickets).set(updates).where(eq(schema.supportTickets.id, id)).returning();
    return updated;
  }

  async getAuditLogs(filters?: { userId?: number, action?: string, dateFrom?: string, dateTo?: string }): Promise<AuditLog[]> {
    let query = this.db.select().from(schema.auditLogs).$dynamic();

    if (filters?.userId) {
      query = query.where(eq(schema.auditLogs.userId, filters.userId));
    }
    if (filters?.action) {
      query = query.where(eq(schema.auditLogs.action, filters.action));
    }

    return await query;
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await this.db.select().from(schema.users).where(eq(schema.users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await this.db.select().from(schema.users).where(eq(schema.users.email, email));
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [created] = await this.db.insert(schema.users).values(user as any).returning();
    return created;
  }
}

export const storage = new DatabaseStorage();
