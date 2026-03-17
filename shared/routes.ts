import { z } from 'zod';
import { insertPlanSchema, insertSchoolSchema, assignSubscriptionSchema, insertSafetyReportSchema, insertSupportTicketSchema, plans, schools, safetyReports, supportTickets, auditLogs, type Plan } from './schema';

export const errorSchemas = {
  validation: z.object({ message: z.string(), field: z.string().optional() }),
  notFound: z.object({ message: z.string() }),
  internal: z.object({ message: z.string() }),
};

export const api = {
  stats: {
    dashboard: {
      method: 'GET' as const,
      path: '/api/stats/dashboard' as const,
      responses: {
        200: z.object({
          totalSchools: z.number(),
          totalUsers: z.number(),
          activePickups: z.number(),
          totalStudents: z.number(),
          totalParents: z.number(),
          totalStaff: z.number(),
          safetyIncidents: z.number(),
          systemHealth: z.number(),
          schools: z.object({ total: z.number(), active: z.number(), inactive: z.number() }),
          users: z.object({ total: z.number(), active: z.number(), inactive: z.number() }),
          students: z.object({ total: z.number(), active: z.number(), inactive: z.number() }),
          parents: z.object({ total: z.number(), active: z.number(), inactive: z.number() }),
          staff: z.object({ total: z.number(), active: z.number(), inactive: z.number() })
        })
      }
    },
    analytics: {
      method: 'GET' as const,
      path: '/api/stats/analytics' as const,
      responses: {
        200: z.object({
          schoolGrowth: z.array(z.object({ name: z.string(), value: z.number() })),
          userRegistrations: z.array(z.object({ name: z.string(), value: z.number() })),
          pickupRequests: z.array(z.object({ name: z.string(), value: z.number() })),
          safetyTrend: z.array(z.object({ name: z.string(), value: z.number() }))
        })
      }
    },
    safetyAnalytics: {
      method: 'GET' as const,
      path: '/api/stats/safety-analytics' as const,
      responses: {
        200: z.object({
          totalIncidents: z.number(),
          bySeverity: z.record(z.string(), z.number()),
          bySchool: z.array(z.object({
            schoolId: z.string(),
            schoolName: z.string(),
            incidentCount: z.number()
          }))
        })
      }
    }
  },
  schools: {
    list: {
      method: 'GET' as const,
      path: '/api/schools' as const,
      responses: { 
        200: z.object({
          items: z.array(z.custom<typeof schools.$inferSelect & { plan?: string, planName?: string, planId?: string, adminName?: string, adminEmail?: string, adminPhone?: string }>()),
          total: z.number(),
          page: z.number(),
          limit: z.number(),
          totalPages: z.number()
        })
      }
    },
    get: {
      method: 'GET' as const,
      path: '/api/schools/:id' as const,
      responses: { 200: z.custom<any>(), 404: errorSchemas.notFound }
    },
    create: {
      method: 'POST' as const,
      path: '/api/schools' as const,
      input: insertSchoolSchema,
      responses: { 201: z.custom<typeof schools.$inferSelect>(), 400: errorSchemas.validation }
    },
    update: {
      method: 'PATCH' as const,
      path: '/api/schools/:id' as const,
      input: insertSchoolSchema.partial().extend({
        adminName: z.string().optional(),
        adminEmail: z.string().email().optional(),
        adminPhone: z.string().optional(),
        adminPassword: z.string().optional(),
        planId: z.string().optional(),
      }),
      responses: { 200: z.custom<typeof schools.$inferSelect>(), 400: errorSchemas.validation, 404: errorSchemas.notFound }
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/schools/:id' as const,
      responses: { 204: z.void(), 404: errorSchemas.notFound }
    },
    stats: {
      method: 'GET' as const,
      path: '/api/schools/:id/stats' as const,
      responses: { 
        200: z.object({
          studentCount: z.number(),
          teacherCount: z.number(),
          guardCount: z.number(),
          activeSessions: z.number(),
          currentPlan: z.object({
            id: z.string(),
            name: z.string(),
            endDate: z.string().nullable(),
            isActive: z.boolean(),
          }).nullable()
        }),
        404: errorSchemas.notFound
      }
    },
    incidents: {
      list: {
        method: 'GET' as const,
        path: '/api/schools/:id/incidents' as const,
        responses: { 200: z.array(z.custom<typeof safetyReports.$inferSelect>()) }
      },
      create: {
        method: 'POST' as const,
        path: '/api/schools/:id/incidents' as const,
        input: z.object({
          title: z.string(),
          body: z.string(),
          severity: z.string(),
        }),
        responses: { 201: z.custom<typeof safetyReports.$inferSelect>(), 400: errorSchemas.validation }
      }
    }
  },
  subscriptions: {
    assign: {
      method: 'POST' as const,
      path: '/api/subscriptions/assign' as const,
      input: assignSubscriptionSchema,
      responses: {
        201: z.object({
          message: z.string(),
          data: z.any()
        }),
        400: errorSchemas.validation
      }
    }
  },
  plans: {
    list: {
      method: 'GET' as const,
      path: '/api/plans' as const,
      responses: { 200: z.array(z.custom<Plan>()) }
    },
    create: {
      method: 'POST' as const,
      path: '/api/plans' as const,
      input: insertPlanSchema,
      responses: { 201: z.custom<Plan>(), 400: errorSchemas.validation }
    },
    update: {
      method: 'PATCH' as const,
      path: '/api/plans/:id' as const,
      input: insertPlanSchema.partial(),
      responses: { 200: z.custom<Plan>(), 400: errorSchemas.validation, 404: errorSchemas.notFound }
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/plans/:id' as const,
      responses: { 204: z.void(), 404: errorSchemas.notFound }
    }
  },
  safetyReports: {
    list: {
      method: 'GET' as const,
      path: '/api/safety-reports' as const,
      responses: { 200: z.array(z.custom<typeof safetyReports.$inferSelect>()) }
    }
  },
  tickets: {
    list: {
      method: 'GET' as const,
      path: '/api/tickets' as const,
      responses: { 200: z.array(z.custom<typeof supportTickets.$inferSelect>()) }
    },
    update: {
      method: 'PATCH' as const,
      path: '/api/tickets/:id' as const,
      input: insertSupportTicketSchema.partial(),
      responses: { 200: z.custom<typeof supportTickets.$inferSelect>(), 400: errorSchemas.validation, 404: errorSchemas.notFound }
    }
  },
  auditLogs: {
    list: {
      method: 'GET' as const,
      path: '/api/audit-logs' as const,
      responses: { 
        200: z.object({
          items: z.array(z.custom<typeof auditLogs.$inferSelect>()),
          total: z.number(),
          page: z.number(),
          limit: z.number(),
          totalPages: z.number()
        })
      }
    }
  },
  admin: {
    stats: {
      method: 'GET' as const,
      path: '/api/admin/stats' as const,
      responses: { 200: z.any() }
    },
    students: {
      method: 'GET' as const,
      path: '/api/admin/students' as const,
      responses: { 200: z.any() }
    },
    parents: {
      method: 'GET' as const,
      path: '/api/admin/parents' as const,
      responses: { 200: z.any() }
    },
    delegates: {
      method: 'GET' as const,
      path: '/api/admin/delegates' as const,
      responses: { 200: z.any() }
    },
    delegateRequests: {
      method: 'GET' as const,
      path: '/api/admin/delegate-requests' as const,
      responses: { 200: z.any() }
    },
    staff: {
      method: 'GET' as const,
      path: '/api/admin/staff' as const,
      responses: { 200: z.any() }
    },
    drivers: {
      method: 'GET' as const,
      path: '/api/admin/drivers' as const,
      responses: { 200: z.any() }
    },
    buses: {
      method: 'GET' as const,
      path: '/api/admin/buses' as const,
      responses: { 200: z.any() }
    },
    invitationCodes: {
      method: 'GET' as const,
      path: '/api/admin/invitation-codes' as const,
      responses: { 200: z.any() }
    },
    pickupActive: {
      method: 'GET' as const,
      path: '/api/admin/pickup/active' as const,
      responses: { 200: z.any() }
    }
  },
  super: {
    users: {
      method: 'GET' as const,
      path: '/api/super/users' as const,
      responses: { 200: z.any() }
    },
    students: {
      method: 'GET' as const,
      path: '/api/super/students' as const,
      responses: { 200: z.any() }
    },
    staff: {
      method: 'GET' as const,
      path: '/api/super/staff' as const,
      responses: { 200: z.any() }
    }
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
