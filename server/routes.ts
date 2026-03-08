import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { db } from "./db";
import { safetyReports, supportTickets, auditLogs } from "@shared/schema";

async function seedDatabase() {
  const existingPlans = await storage.getPlans();
  if (existingPlans.length === 0) {
    const basicPlan = await storage.createPlan({
      name: "Basic Plan",
      maxStudents: 500,
      maxStaff: 50,
      monthlyPrice: 9900,
      features: ["Standard Pickups", "Basic Reporting"]
    });
    
    const premiumPlan = await storage.createPlan({
      name: "Premium Plan",
      maxStudents: 2000,
      maxStaff: 200,
      monthlyPrice: 29900,
      features: ["Advanced Geofencing", "Priority Support", "Custom Analytics"]
    });

    const school1 = await storage.createSchool({
      name: "Lincoln Elementary",
      address: "123 Main St",
      city: "Springfield",
      latitude: 39.7817,
      longitude: -89.6501,
      geofenceRadius: 500,
      planId: basicPlan.id,
      status: "active",
      totalUsers: 450,
      totalStudents: 400,
      activePickups: 12
    });

    const school2 = await storage.createSchool({
      name: "Washington High",
      address: "456 Oak Ave",
      city: "Shelbyville",
      latitude: 39.8817,
      longitude: -89.7501,
      geofenceRadius: 1000,
      planId: premiumPlan.id,
      status: "active",
      totalUsers: 2100,
      totalStudents: 1800,
      activePickups: 45
    });

    await db.insert(safetyReports).values([
      { schoolId: school1.id, reportType: "Unrecognized Vehicle", reportedBy: "Jane Doe", severity: "medium", status: "open" },
      { schoolId: school2.id, reportType: "Late Pickup", reportedBy: "John Smith", severity: "low", status: "resolved" }
    ]);

    await db.insert(supportTickets).values([
      { schoolId: school1.id, title: "Cannot add new teacher", description: "Getting an error when trying to add Mrs. Davis.", status: "open" },
      { schoolId: school2.id, title: "App crashing on iOS", description: "Parents reporting app crashes during pickup.", status: "in_progress" }
    ]);

    await db.insert(auditLogs).values([
      { action: "Created Premium Plan", userId: 1, schoolId: null },
      { action: "Suspended Account", userId: 1, schoolId: school1.id }
    ]);
  }
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  seedDatabase().catch(console.error);

  // Dashboard Stats
  app.get(api.stats.dashboard.path, async (req, res) => {
    const stats = await storage.getDashboardStats();
    res.json(stats);
  });

  app.get(api.stats.analytics.path, async (req, res) => {
    const analytics = await storage.getAnalytics();
    res.json(analytics);
  });

  // Plans
  app.get(api.plans.list.path, async (req, res) => {
    const plans = await storage.getPlans();
    res.json(plans);
  });

  app.post(api.plans.create.path, async (req, res) => {
    try {
      const input = api.plans.create.input.parse(req.body);
      const plan = await storage.createPlan(input);
      res.status(201).json(plan);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.patch(api.plans.update.path, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const input = api.plans.update.input.parse(req.body);
      const plan = await storage.updatePlan(id, input);
      res.json(plan);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.delete(api.plans.delete.path, async (req, res) => {
    const id = parseInt(req.params.id);
    await storage.deletePlan(id);
    res.status(204).end();
  });

  // Schools
  app.get(api.schools.list.path, async (req, res) => {
    const schoolsList = await storage.getSchools();
    res.json(schoolsList);
  });

  app.get(api.schools.get.path, async (req, res) => {
    const id = parseInt(req.params.id);
    const school = await storage.getSchool(id);
    if (!school) return res.status(404).json({ message: "School not found" });
    res.json(school);
  });

  app.post(api.schools.create.path, async (req, res) => {
    try {
      const input = api.schools.create.input.parse(req.body);
      const school = await storage.createSchool(input);
      res.status(201).json(school);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.patch(api.schools.update.path, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const input = api.schools.update.input.parse(req.body);
      const school = await storage.updateSchool(id, input);
      res.json(school);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.delete(api.schools.delete.path, async (req, res) => {
    const id = parseInt(req.params.id);
    await storage.deleteSchool(id);
    res.status(204).end();
  });

  // Safety Reports
  app.get(api.safetyReports.list.path, async (req, res) => {
    const reports = await storage.getSafetyReports();
    res.json(reports);
  });

  // Support Tickets
  app.get(api.tickets.list.path, async (req, res) => {
    const ticketsList = await storage.getTickets();
    res.json(ticketsList);
  });

  app.patch(api.tickets.update.path, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const input = api.tickets.update.input.parse(req.body);
      const ticket = await storage.updateTicket(id, input);
      res.json(ticket);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  // Audit Logs
  app.get(api.auditLogs.list.path, async (req, res) => {
    const logs = await storage.getAuditLogs();
    res.json(logs);
  });

  return httpServer;
}