import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { setupAuth } from "./auth";
import multer from "multer";
import FormDataNode from "form-data";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3000";

// multer: store uploads in memory so we can forward the file buffer to the backend
const upload = multer({ storage: multer.memoryStorage() });

async function proxyToBackend(req: any, method: string, path: string, body?: any) {
  const sessionData = req.session as any;
  const token = sessionData?.accessToken;

  const headers: Record<string, string> = {
    Accept: "application/json",
  };

  if (token) headers["Authorization"] = `Bearer ${token}`;

  // Pass through cache headers from client to backend
  if (req.headers["if-none-match"]) {
    headers["If-None-Match"] = req.headers["if-none-match"];
  }
  if (req.headers["if-modified-since"]) {
    headers["If-Modified-Since"] = req.headers["if-modified-since"];
  }

  // Append query parameters if they exist
  const query = new URLSearchParams(req.query).toString();
  const url = `${BACKEND_URL}${path}${query ? `?${query}` : ""}`;

  const fetchOptions: RequestInit = {
    method,
    headers,
    body: (method !== "GET" && method !== "HEAD" && body !== undefined) ? JSON.stringify(body) : undefined
  };

  return fetch(url, fetchOptions);
}

/**
 * Wraps a route handler so that if the DB is unavailable or the query throws,
 * the endpoint returns a graceful fallback instead of a 500.
 * @param fallback - value to return when an error occurs
 */
function withFallback<T>(handler: () => Promise<T>, fallback: T) {
  return async (req: any, res: any) => {
    try {
      const result = await handler();
      res.json(result);
    } catch (err: any) {
      const isDatabaseError =
        err?.message?.includes("DATABASE_URL") ||
        err?.code === "ECONNREFUSED" ||
        err?.code === "ENOTFOUND" ||
        err?.code === "57P01" || // admin_shutdown
        err?.code === "3D000" || // invalid_catalog_name
        err?.code === "42P01";   // undefined_table / table does not exist

      if (isDatabaseError) {
        console.warn(`[DB] Endpoint unavailable (returning empty): ${err.message}`);
        return res.json(fallback);
      }
      // Re-throw non-DB errors so the global handler catches them
      throw err;
    }
  };
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  console.log("[BFF] registerRoutes called");

  setupAuth(app);

  // Dashboard Stats - Proxy to real backend
  app.get(api.stats.dashboard.path, async (req, res) => {
    try {
      const backendRes = await proxyToBackend(req, "GET", "/safeschool/stats/dashboard");
      
      if (backendRes.status === 304) return res.status(304).end();

      const data = await backendRes.json() as any;
      if (!backendRes.ok) {
        return res.status(backendRes.status).json(data);
      }
      res.json(data.data || data);
    } catch (err: any) {
      console.warn("[stats] dashboard proxy error:", err.message);
      res.status(500).json({ message: "Failed to reach backend" });
    }
  });

  // Analytics Stats - Proxy to real backend
  app.get(api.stats.analytics.path, async (req, res) => {
    try {
      const backendRes = await proxyToBackend(req, "GET", "/safeschool/stats/analytics");

      if (backendRes.status === 304) return res.status(304).end();

      const data = await backendRes.json() as any;
      if (!backendRes.ok) {
        return res.status(backendRes.status).json(data);
      }
      res.json(data.data || data);
    } catch (err: any) {
      console.warn("[stats] analytics proxy error:", err.message);
      res.status(500).json({ message: "Failed to reach backend" });
    }
  });

  app.get(api.stats.safetyAnalytics.path, async (req, res) => {
    const schoolId = req.query.schoolId as string;
    try {
      const analytics = await storage.getSafetyAnalytics(schoolId);
      res.json(analytics);
    } catch (err: any) {
      console.warn(`[DB] safetyAnalytics unavailable: ${err.message}`);
      res.json({ totalIncidents: 0, bySeverity: {}, bySchool: [] });
    }
  });

  // Plans – proxied to real backend at /safeschool/subscription-plans
  app.get(api.plans.list.path, async (req, res) => {
    try {
      const backendRes = await proxyToBackend(req, "GET", "/safeschool/subscription-plans");
      
      if (backendRes.status === 304) return res.status(304).end();

      const data = await backendRes.json() as any;
      if (!backendRes.ok) {
        return res.status(backendRes.status).json(data);
      }
      res.json(data.data || []);
    } catch (err: any) {
      console.warn("[plans] GET proxy error:", err.message);
      res.status(500).json({ message: "Failed to reach backend" });
    }
  });

  app.post(api.plans.create.path, async (req, res) => {
    try {
      console.log("[plans] Proxying body:", req.body);
      const backendRes = await proxyToBackend(req, "POST", "/safeschool/subscription-plans", req.body);
      const data = await backendRes.json() as any;
      if (!backendRes.ok) {
        console.error("[plans] POST proxy error data:", data);
        return res.status(backendRes.status).json({ message: data?.message || "Failed to create plan" });
      }
      res.status(201).json(data.data);
    } catch (err) {
      console.error("[plans] POST proxy error:", err);
      res.status(500).json({ message: "Failed to reach backend" });
    }
  });

  app.patch(api.plans.update.path, async (req, res) => {
    try {
      const id = req.params.id;
      const backendRes = await proxyToBackend(req, "PATCH", `/safeschool/subscription-plans/${id}`, req.body);
      const data = await backendRes.json() as any;
      if (!backendRes.ok) {
        return res.status(backendRes.status).json({ message: data?.message || "Failed to update plan" });
      }
      res.json(data.data);
    } catch (err) {
      console.error("[plans] PATCH proxy error:", err);
      res.status(500).json({ message: "Failed to reach backend" });
    }
  });

  app.delete(api.plans.delete.path, async (req, res) => {
    try {
      const id = req.params.id;
      const backendRes = await proxyToBackend(req, "DELETE", `/safeschool/subscription-plans/${id}`);
      if (!backendRes.ok) {
        const data = await backendRes.json() as any;
        return res.status(backendRes.status).json({ message: data?.message || "Failed to delete plan" });
      }
      res.status(204).end();
    } catch (err: any) {
      console.error("[plans] DELETE proxy error:", err.message);
      res.status(500).json({ message: "Failed to reach backend" });
    }
  });

  // Schools
  app.get(api.schools.list.path, async (req, res) => {
    try {
      const backendRes = await proxyToBackend(req, "GET", "/safeschool/schools");

      if (backendRes.status === 304) return res.status(304).end();

      const data = await backendRes.json() as any;
      if (!backendRes.ok) {
        return res.status(backendRes.status).json(data);
      }
      res.json(data.data || []);
    } catch (err: any) {
      console.warn("[schools] GET list proxy error:", err.message);
      res.status(500).json({ message: "Failed to reach backend" });
    }
  });

  app.get(api.schools.get.path, async (req, res) => {
    try {
      const id = req.params.id;
      const backendRes = await proxyToBackend(req, "GET", `/safeschool/schools/${id}`);

      if (backendRes.status === 304) return res.status(304).end();

      const data = await backendRes.json() as any;
      if (!backendRes.ok) {
        return res.status(backendRes.status).json(data);
      }
      res.json(data.data);
    } catch (err: any) {
      console.warn("[schools] GET proxy error:", err.message);
      res.status(500).json({ message: "Failed to reach backend" });
    }
  });

  app.post(api.schools.create.path, upload.single("logo"), async (req, res) => {
    try {
      const sessionData = req.session as any;
      const token = sessionData?.accessToken;

      const url = `${BACKEND_URL}/safeschool/schools`;

      console.log("[schools] === START school creation proxy ===");
      console.log("[schools] Backend URL:", url);
      console.log("[schools] Parsed body:", JSON.stringify(req.body, null, 2));
      console.log("[schools] File present:", !!req.file);

      // Use the form-data package which has a proper submit() method
      const fd = new FormDataNode();

      // Recursive function to flatten nested objects into bracket notation
      const appendRecursive = (obj: any, prefix = "") => {
        for (const [key, value] of Object.entries(obj || {})) {
          const fullKey = prefix ? `${prefix}[${key}]` : key;
          if (value !== undefined && value !== null) {
            if (typeof value === "object" && !Buffer.isBuffer(value)) {
              appendRecursive(value, fullKey);
            } else {
              fd.append(fullKey, String(value));
            }
          }
        }
      };

      appendRecursive(req.body);

      // Append the logo file if present
      if (req.file) {
        fd.append("logo", req.file.buffer, {
          filename: req.file.originalname,
          contentType: req.file.mimetype
        });
        console.log("[schools] Appended logo file:", req.file.originalname, req.file.size);
      }

      // Use form-data's submit() which properly pipes the stream
      const parsedUrl = new URL(url);
      const submitOptions: any = {
        protocol: parsedUrl.protocol,
        hostname: parsedUrl.hostname,
        port: parsedUrl.port,
        path: parsedUrl.pathname,
        method: "POST",
        headers: {
          Accept: "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      };

      console.log("[schools] Submitting to backend via form-data submit()...");

      const backendResponse = await new Promise<{ statusCode: number; body: string }>((resolve, reject) => {
        fd.submit(submitOptions, (err, response) => {
          if (err) {
            console.error("[schools] form-data submit error:", err);
            return reject(err);
          }

          let body = "";
          response.on("data", (chunk: Buffer) => {
            body += chunk.toString();
          });
          response.on("end", () => {
            console.log("[schools] Backend responded with status:", response.statusCode);
            resolve({ statusCode: response.statusCode || 500, body });
          });
          response.on("error", (e: Error) => {
            console.error("[schools] Response stream error:", e);
            reject(e);
          });
        });
      });

      console.log("[schools] Response body:", backendResponse.body.substring(0, 500));

      const data = JSON.parse(backendResponse.body);

      if (backendResponse.statusCode >= 400) {
        console.error("[schools] POST backend error:", data);
        return res.status(backendResponse.statusCode).json({
          message: Array.isArray(data?.message) ? data.message.join(", ") : (data?.message || "Failed to create school")
        });
      }
      res.status(201).json(data);
      console.log("[schools] === END school creation proxy (success) ===");
    } catch (err) {
      console.error("[schools] POST proxy error:", err);
      res.status(500).json({ message: "BFF_PROXY_HIT_ERROR: " + (err as Error).message });
    }
  });

  app.patch(api.schools.update.path, async (req, res) => {
    try {
      const id = req.params.id;
      const backendRes = await proxyToBackend(req, "PATCH", `/safeschool/schools/${id}`, req.body);
      const data = await backendRes.json() as any;
      if (!backendRes.ok) {
        return res.status(backendRes.status).json({ message: data?.message || "Failed to update school" });
      }
      res.json(data.data);
    } catch (err) {
      console.error("[schools] PATCH proxy error:", err);
      res.status(500).json({ message: "Failed to reach backend" });
    }
  });

  app.delete(api.schools.delete.path, async (req, res) => {
    try {
      const id = req.params.id;
      const backendRes = await proxyToBackend(req, "DELETE", `/safeschool/schools/${id}`);
      if (!backendRes.ok) {
        const data = await backendRes.json() as any;
        return res.status(backendRes.status).json({ message: data?.message || "Failed to delete school" });
      }
      res.status(204).end();
    } catch (err: any) {
      console.error("[schools] DELETE proxy error:", err.message);
      res.status(500).json({ message: "Failed to reach backend" });
    }
  });

  // Subscriptions
  app.post(api.subscriptions.assign.path, async (req, res) => {
    try {
      const backendRes = await proxyToBackend(req, "POST", "/safeschool/subscription-plans/assign", req.body);
      const data = await backendRes.json() as any;
      if (!backendRes.ok) {
        return res.status(backendRes.status).json({ message: data?.message || "Failed to assign subscription" });
      }
      res.status(201).json(data);
    } catch (err) {
      console.error("[subscriptions] POST assign proxy error:", err);
      res.status(500).json({ message: "Failed to reach backend" });
    }
  });

  app.get(api.schools.incidents.list.path, async (req, res) => {
    try {
      const id = req.params.id;
      const backendRes = await proxyToBackend(req, "GET", `/safeschool/schools/${id}/incidents`);

      if (backendRes.status === 304) return res.status(304).end();

      const data = await backendRes.json() as any;
      if (!backendRes.ok) {
        return res.status(backendRes.status).json(data);
      }
      res.json(data.data || []);
    } catch (err: any) {
      console.warn("[schools] GET incidents proxy error:", err.message);
      res.status(500).json({ message: "Failed to reach backend" });
    }
  });

  app.post(api.schools.incidents.create.path, async (req, res) => {
    try {
      const id = req.params.id;
      const backendRes = await proxyToBackend(req, "POST", `/safeschool/schools/${id}/incidents`, req.body);
      const data = await backendRes.json() as any;
      if (!backendRes.ok) {
        return res.status(backendRes.status).json({ message: data?.message || "Failed to report incident" });
      }
      res.status(201).json(data.data);
    } catch (err) {
      console.error("[schools] POST incident proxy error:", err);
      res.status(500).json({ message: "Failed to reach backend" });
    }
  });

  // Safety Reports
  app.get(api.safetyReports.list.path, withFallback(
    () => storage.getSafetyReports(),
    []
  ));

  // Support Tickets
  app.get(api.tickets.list.path, withFallback(
    () => storage.getTickets(),
    []
  ));

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
  app.get(api.auditLogs.list.path, withFallback(
    () => storage.getAuditLogs(),
    []
  ));

  // Admin Proxy Routes
  app.get(api.admin.stats.path, async (req, res) => {
    try {
      const backendRes = await proxyToBackend(req, "GET", "/safeschool/dashboard/school/stats");
      const data = await backendRes.json() as any;
      res.status(backendRes.status).json(data.data || data);
    } catch (err: any) {
      res.status(500).json({ message: "BFF_PROXY_ERROR: " + err.message });
    }
  });

  app.get(api.admin.students.path, async (req, res) => {
    try {
      const backendRes = await proxyToBackend(req, "GET", "/safeschool/dashboard/school/students");
      const data = await backendRes.json() as any;
      res.status(backendRes.status).json(data);
    } catch (err: any) {
      res.status(500).json({ message: "BFF_PROXY_ERROR: " + err.message });
    }
  });

  app.get(api.admin.parents.path, async (req, res) => {
    try {
      const backendRes = await proxyToBackend(req, "GET", "/safeschool/dashboard/school/parents");
      const data = await backendRes.json() as any;
      res.status(backendRes.status).json(data);
    } catch (err: any) {
      res.status(500).json({ message: "BFF_PROXY_ERROR: " + err.message });
    }
  });

  app.get(api.admin.delegates.path, async (req, res) => {
    try {
      const backendRes = await proxyToBackend(req, "GET", "/safeschool/dashboard/school/delegates");
      const data = await backendRes.json() as any;
      res.status(backendRes.status).json(data);
    } catch (err: any) {
      res.status(500).json({ message: "BFF_PROXY_ERROR: " + err.message });
    }
  });

  app.get(api.admin.delegateRequests.path, async (req, res) => {
    try {
      const backendRes = await proxyToBackend(req, "GET", "/safeschool/dashboard/school/delegate-requests");
      const data = await backendRes.json() as any;
      res.status(backendRes.status).json(data);
    } catch (err: any) {
      res.status(500).json({ message: "BFF_PROXY_ERROR: " + err.message });
    }
  });

  app.get(api.admin.staff.path, async (req, res) => {
    try {
      const backendRes = await proxyToBackend(req, "GET", "/safeschool/dashboard/school/staff");
      const data = await backendRes.json() as any;
      res.status(backendRes.status).json(data);
    } catch (err: any) {
      res.status(500).json({ message: "BFF_PROXY_ERROR: " + err.message });
    }
  });

  app.get(api.admin.drivers.path, async (req, res) => {
    try {
      const backendRes = await proxyToBackend(req, "GET", "/safeschool/dashboard/school/drivers");
      const data = await backendRes.json() as any;
      res.status(backendRes.status).json(data);
    } catch (err: any) {
      res.status(500).json({ message: "BFF_PROXY_ERROR: " + err.message });
    }
  });

  app.get(api.admin.buses.path, async (req, res) => {
    try {
      const backendRes = await proxyToBackend(req, "GET", "/safeschool/dashboard/school/buses");
      const data = await backendRes.json() as any;
      res.status(backendRes.status).json(data);
    } catch (err: any) {
      res.status(500).json({ message: "BFF_PROXY_ERROR: " + err.message });
    }
  });

  app.get(api.admin.invitationCodes.path, async (req, res) => {
    try {
      const backendRes = await proxyToBackend(req, "GET", "/safeschool/dashboard/school/invitation-codes");
      const data = await backendRes.json() as any;
      res.status(backendRes.status).json(data);
    } catch (err: any) {
      res.status(500).json({ message: "BFF_PROXY_ERROR: " + err.message });
    }
  });

  app.get(api.admin.pickupActive.path, async (req, res) => {
    try {
      const backendRes = await proxyToBackend(req, "GET", "/safeschool/dashboard/school/pickups/active");
      const data = await backendRes.json() as any;
      res.status(backendRes.status).json(data.data || data);
    } catch (err: any) {
      res.status(500).json({ message: "BFF_PROXY_ERROR: " + err.message });
    }
  });

  // Super Admin — Global Listings
  app.get(api.super.users.path, async (req, res) => {
    try {
      const backendRes = await proxyToBackend(req, "GET", "/safeschool/dashboard/admin/users");
      const data = await backendRes.json() as any;
      res.status(backendRes.status).json(data.data !== undefined ? data : data);
    } catch (err: any) {
      res.status(500).json({ message: "BFF_PROXY_ERROR: " + err.message });
    }
  });

  app.get(api.super.students.path, async (req, res) => {
    try {
      const backendRes = await proxyToBackend(req, "GET", "/safeschool/dashboard/admin/students");
      const data = await backendRes.json() as any;
      res.status(backendRes.status).json(data);
    } catch (err: any) {
      res.status(500).json({ message: "BFF_PROXY_ERROR: " + err.message });
    }
  });

  app.get(api.super.staff.path, async (req, res) => {
    try {
      const backendRes = await proxyToBackend(req, "GET", "/safeschool/dashboard/admin/staff");
      const data = await backendRes.json() as any;
      res.status(backendRes.status).json(data);
    } catch (err: any) {
      res.status(500).json({ message: "BFF_PROXY_ERROR: " + err.message });
    }
  });

  return httpServer;
}