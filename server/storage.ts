import { db } from "./db";
import {
  type Plan, type School, type SafetyReport, type SupportTicket, type AuditLog, type User,
  type InsertPlan, type InsertSchool, type InsertSafetyReport, type InsertSupportTicket, type InsertUser
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

  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
}

export class MemStorage implements IStorage {
  private plans: Map<number, Plan>;
  private schools: Map<number, School>;
  private safetyReports: Map<number, SafetyReport>;
  private supportTickets: Map<number, SupportTicket>;
  private auditLogs: Map<number, AuditLog>;
  private users: Map<number, User>;
  private currentIds: { [key: string]: number };

  constructor() {
    this.plans = new Map();
    this.schools = new Map();
    this.safetyReports = new Map();
    this.supportTickets = new Map();
    this.auditLogs = new Map();
    this.users = new Map();
    this.currentIds = { plans: 1, schools: 1, reports: 1, tickets: 1, logs: 1, users: 1 };

    this.seed();
  }

  private seed() {
    // ... (rest of the seed implementation remains the same)
    const plans: InsertPlan[] = [
      { name: "Basic", maxStudents: 500, maxStaff: 50, monthlyPrice: 4900, features: ["Standard Support", "Basic Analytics"] },
      { name: "Pro", maxStudents: 2000, maxStaff: 200, monthlyPrice: 9900, features: ["Priority Support", "Advanced Analytics", "Geofencing"] },
      { name: "Enterprise", maxStudents: 10000, maxStaff: 1000, monthlyPrice: 24900, features: ["24/7 Support", "Custom Integration", "Unlimited Features"] }
    ];

    plans.forEach(p => this.createPlan(p));

    const schools: InsertSchool[] = [
      { name: "Greenwood International", address: "123 Educational Dr", city: "Dubai", latitude: 25.2048, longitude: 55.2708, geofenceRadius: 200, status: "active", avatar: "https://images.unsplash.com/photo-1546410531-bb4caa1b424d", planId: 2, totalUsers: 1200, totalStudents: 800, activePickups: 45 },
      { name: "Horizon Academy", address: "456 Learning Way", city: "Abu Dhabi", latitude: 24.4539, longitude: 54.3773, geofenceRadius: 150, status: "active", avatar: "https://images.unsplash.com/photo-1592285777402-2107d3e02022", planId: 1, totalUsers: 600, totalStudents: 450, activePickups: 12 },
      { name: "Desert Rose School", address: "789 Knowledge St", city: "Sharjah", latitude: 25.3463, longitude: 55.4209, geofenceRadius: 300, status: "suspended", avatar: "https://images.unsplash.com/photo-1523050335392-9bc5015f2108", planId: 3, totalUsers: 5000, totalStudents: 3200, activePickups: 0 }
    ];

    schools.forEach(s => this.createSchool(s));
  }

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
    return Array.from(this.plans.values());
  }

  async createPlan(plan: InsertPlan): Promise<Plan> {
    const id = this.currentIds.plans++;
    const created: Plan = { ...plan, id, features: plan.features as any };
    this.plans.set(id, created);
    return created;
  }

  async updatePlan(id: number, updates: Partial<InsertPlan>): Promise<Plan> {
    const existing = this.plans.get(id);
    if (!existing) throw new Error("Plan not found");
    const updated = { ...existing, ...updates };
    this.plans.set(id, updated);
    return updated;
  }

  async deletePlan(id: number): Promise<void> {
    this.plans.delete(id);
  }

  async getSchools(): Promise<School[]> {
    return Array.from(this.schools.values());
  }

  async getSchool(id: number): Promise<School | undefined> {
    return this.schools.get(id);
  }

  async createSchool(school: InsertSchool): Promise<School> {
    const id = this.currentIds.schools++;
    const created: School = {
      ...school,
      id,
      createdAt: new Date(),
      avatar: school.avatar || null,
      planId: school.planId || null,
      status: school.status || 'active'
    } as School;
    this.schools.set(id, created);
    return created;
  }

  async updateSchool(id: number, updates: Partial<InsertSchool>): Promise<School> {
    const existing = this.schools.get(id);
    if (!existing) throw new Error("School not found");
    const updated = { ...existing, ...updates };
    this.schools.set(id, updated);
    return updated;
  }

  async deleteSchool(id: number): Promise<void> {
    this.schools.delete(id);
  }

  async getSafetyReports(): Promise<SafetyReport[]> {
    return Array.from(this.safetyReports.values());
  }

  async getTickets(): Promise<SupportTicket[]> {
    return Array.from(this.supportTickets.values());
  }

  async updateTicket(id: number, updates: Partial<InsertSupportTicket>): Promise<SupportTicket> {
    const existing = this.supportTickets.get(id);
    if (!existing) throw new Error("Ticket not found");
    const updated = { ...existing, ...updates };
    this.supportTickets.set(id, updated);
    return updated;
  }

  async getAuditLogs(): Promise<AuditLog[]> {
    return Array.from(this.auditLogs.values());
  }

  // Users
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(u => u.email === email);
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = this.currentIds.users++;
    const created: User = {
      ...user,
      id,
      createdAt: new Date(),
      schoolId: user.schoolId || null,
      role: user.role as "super_admin" | "school_admin"
    } as User;
    this.users.set(id, created);
    return created;
  }
}

export const storage = new MemStorage();

