# Dashboard API Contracts

The dashboard consumes the following internally-defined API contracts provided by the backend (NestJS/Express in `server/`). These contracts dictate the data expected by the frontend UI components.

## 1. Authentication & Session
**Endpoint**: `/api/login` (POST)
**UI Origin**: `client/src/pages/auth/LoginPage.tsx`
**Contract**:
- **Req**: `{ email, password }`
- **Res**: 
  ```json
  {
    "id": 1,
    "email": "superadmin@safeschool.com",
    "role": "super_admin",
    "schoolId": null
  }
  ```
- **Auth**: Re-establishes session cookie.

## 2. Schools Data
**Endpoint**: `/api/schools` (GET)
**UI Origin**: `client/src/pages/Schools.tsx`
**Contract**:
- **Query Params**: `page`, `limit` (For pagination - TBD on backend if pagination is implemented)
- **Res**: Array of `School` objects (`[{ id, name, status, planId, totalStudents, ... }]`)
- **Auth**: Requires valid session cookie (Super Admin).

**Endpoint**: `/api/schools/:id` (PATCH)
**UI Origin**: `client/src/pages/Schools.tsx` (Status Toggle / Edit)
**Contract**:
- **Req**: Partial `School` object (e.g., `{ status: 'suspended' }`)
- **Res**: Updated `School` object

## 3. Subscription Plans
**Endpoint**: `/api/plans` (GET)
**UI Origin**: `client/src/pages/Plans.tsx`
**Contract**:
- **Res**: Array of `Plan` objects (`[{ id, name, monthlyPrice, features, maxStudents, ... }]`)

**Endpoint**: `/api/plans` (POST)
**UI Origin**: `client/src/pages/Plans.tsx` (Create Plan Modal)
**Contract**:
- **Req**: Omit ID. `{ name: string, maxStudents: number, maxStaff: number, monthlyPrice: number, features: string[] }`
- **Res**: Created `Plan` object.

## 4. Audit Logs
**Endpoint**: `/api/audit-logs` (GET)
**UI Origin**: `client/src/pages/AuditLogs.tsx`
**Contract**:
- **Query Params**: `page`, `limit`
- **Res**: Array of `AuditLog` objects

## 5. Dashboard Analytics
**Endpoint**: `/api/stats/dashboard` (GET)
**UI Origin**: `client/src/pages/Dashboard.tsx`
**Contract**:
- **Res**: `{ totalSchools, totalUsers, activePickups, safetyIncidents, ... }`

**Endpoint**: `/api/stats/analytics` (GET)
**UI Origin**: `client/src/pages/Analytics.tsx`
**Contract**:
- **Res**: `{ schoolGrowth: [], safetyTrend: [], ... }`

## 6. Missing Endpoints (To be handled gracefully on UI)
- `/api/safety-reports` (GET): Intended for `SafetyReports.tsx`, currently tracked in `schema.ts`/`routes.ts` but UI mapping expects `/schools/:id/incidents`. UI must handle this gap.
