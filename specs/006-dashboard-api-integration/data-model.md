# Data Model: Dashboard API Integration

Based on `shared/schema.ts` and `shared/routes.ts`, the following entities are utilized by the dashboard integration.

## Entities

### School
Represents a registered institution.
- `id` (serial, primary key)
- `name` (text, required)
- `address`, `city` (text, required)
- `latitude`, `longitude` (double precision, required)
- `geofenceRadius` (integer, required)
- `planId` (integer, references Plan.id)
- `status` (text: 'active', 'inactive', 'suspended' - default 'active')
- `avatar` (text, optional)
- `totalUsers`, `totalStudents`, `activePickups` (integer, default 0)
- `createdAt` (timestamp)

### SubscriptionPlan (Plan)
Tiered access level for schools.
- `id` (serial, primary key)
- `name` (text, required)
- `maxStudents`, `maxStaff` (integer, required)
- `monthlyPrice` (integer, in cents, required)
- `features` (json, array of strings, required)

### AuditLog
Record of administrative actions.
- `id` (serial, primary key)
- `userId` (integer, optional)
- `action` (text, required)
- `schoolId` (integer, references School.id)
- `createdAt` (timestamp)

### SafetyReport (Incident)
Safety event recorded at school premises.
- `id` (serial, primary key)
- `schoolId` (integer, references School.id)
- `reportType` (text, required)
- `reportedBy` (text, required)
- `severity` (text: 'low', 'medium', 'high', 'critical')
- `status` (text: 'open', 'resolved' - default 'open')
- `createdAt` (timestamp)

### SupportTicket
Tickets submitted by schools to Super Admin.
- `id` (serial, primary key)
- `schoolId` (integer, references School.id)
- `title`, `description` (text, required)
- `status` (text: 'open', 'in_progress', 'closed' - default 'open')
- `createdAt` (timestamp)

## Validation Rules
- All DTO inputs for creations/updates (e.g., `insertSchoolSchema`, `insertPlanSchema`) are validated using Zod against the Drizzle schema.
- ID and CreatedAt fields are omitted during creation payloads.

## Missing Models (Gap Analysis)
- `Safety Analytics / Trends`: The backend schema explicitly lacks a normalized table for pre-aggregated "Safety Trends" (used in Analytics.tsx). It relies on `/api/stats/analytics` which returns aggregated arrays (`safetyTrend`, `schoolGrowth`, etc.).
