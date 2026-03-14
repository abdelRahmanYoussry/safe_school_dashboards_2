# School Admin Dashboard — Implementation Plan

## Goal

Build the School Admin Dashboard inside the existing **School-Admin-Hub** project on a **new branch** (`feature/admin-dashboard`), in a **separate `client/src/admin/` folder**. The dashboard lets school admins manage students, staff, pickups, transportation, activities, safety reports, invitation codes, notifications, tickets, and settings. The login page should redirect to the correct dashboard based on user role (`SUPER_ADMIN` → super admin, `SCHOOL_ADMIN` → admin dashboard).

---

## Analysis Summary — What Already Exists

### Backend APIs (already usable by SCHOOL_ADMIN)

| PRD Feature | Existing Endpoint(s) | Status |
|---|---|---|
| **Login** | `POST /auth/dashboard-login` (returns role) | ✅ Ready |
| **Dashboard stats** | `GET /dashboard/school/stats` | ✅ Ready |
| **Student CRUD** | `POST/GET/PATCH/DELETE /students/admin[/:id]` | ✅ Ready |
| **Staff CRUD** | `GET/PATCH/DELETE /staff[/:id]` | ✅ Ready |
| **Pickup pipeline** | `GET /pickup/active/:schoolId`, `GET /dashboard/school/pickups/active`, `GET /pickup/logs` | ✅ Ready |
| **Buses/Transport** | `POST/GET/PATCH/DELETE /school-bus[/:id]` | ✅ Ready |
| **Gates** | `POST/GET/PATCH/DELETE /gates[/:id]` | ✅ Ready |
| **Grades** | `POST/GET/PATCH/DELETE /grades[/:id]` | ✅ Ready |
| **Activities** | `GET /activities` (TEACHER/PARENT only) | ⚠️ Needs SCHOOL_ADMIN role |
| **Invitation Codes** | `POST /invitation-codes/generate`, `GET /invitation-codes`, `PATCH /:id/deactivate` | ✅ Ready |
| **Safety Reports** | `POST/GET /schools/:id/incidents` | ⚠️ No school-admin scoped list |
| **Vehicle types** | `GET /vehicle-types`, etc. | ✅ Ready |
| **Vehicle colors** | `GET /vehicle-colors`, etc. | ✅ Ready |
| **Notifications** | [notifications.service.ts](file:///c:/Users/agrma/Desktop/Algoriza/vibe%20coding/safe_school_backend/src/notifications/notifications.service.ts) exists, **no controller** | ❌ Missing |
| **Tickets** | No model, no module | ❌ Missing |
| **Parents list** | No admin endpoint | ❌ Missing |
| **Delegates list** | `GET /students/delegates/pending` (parent only) | ❌ Missing for admin |

---

## User Review Required

> [!IMPORTANT]
> **Tickets module**: Currently there is no `SupportTicket` model in Prisma schema. We need to add a new model and run a migration. This modifies the database schema.

> [!IMPORTANT]  
> **Scope of Phase 1**: This plan is very large. I recommend we **start with Phase 1 only** (backend API gaps + new branch + admin folder structure), then continue with the UI pages in subsequent conversations. Would you like the full plan built in one go, or do you prefer we go phase-by-phase?

> [!WARNING]
> The activities controller currently only allows `TEACHER` and `PARENT` roles. We'll need to add `SCHOOL_ADMIN` to the role guards for read-only access, or add a separate admin endpoint.

---

## Proposed Changes

### Phase 1: Backend API Additions

---

#### [NEW] Tickets Module

##### Prisma Schema Changes
#### [MODIFY] [schema.prisma](file:///c:/Users/agrma/Desktop/Algoriza/vibe%20coding/safe_school_backend/prisma/schema.prisma)

Add two new models:

```prisma
model SupportTicket {
  id          String         @id @default(cuid())
  schoolId    String
  userId      String
  title       String
  description String
  status      TicketStatus   @default(OPEN)
  attachments String[]
  createdAt   DateTime       @default(now())
  updatedAt   DateTime       @updatedAt
  school      School         @relation(fields: [schoolId], references: [id])
  user        User           @relation(fields: [userId], references: [id])
  replies     TicketReply[]

  @@index([schoolId])
  @@index([status])
}

model TicketReply {
  id        String        @id @default(cuid())
  ticketId  String
  userId    String
  body      String
  createdAt DateTime      @default(now())
  ticket    SupportTicket @relation(fields: [ticketId], references: [id], onDelete: Cascade)
  user      User          @relation(fields: [userId], references: [id])
}

enum TicketStatus {
  OPEN
  IN_PROGRESS
  CLOSED
}
```

Also add relations to [School](file:///c:/Users/agrma/Desktop/Algoriza/vibe%20coding/safe_school_backend/src/dashboard/dashboard.controller.ts#26-35) and `User` models.

##### [NEW] Tickets Module Files
- `src/tickets/tickets.module.ts`
- `src/tickets/tickets.controller.ts`
- `src/tickets/tickets.service.ts`
- `src/tickets/dto/create-ticket.dto.ts`
- `src/tickets/dto/update-ticket.dto.ts`
- `src/tickets/dto/list-tickets-query.dto.ts`

**Endpoints:**
- `POST /tickets` — SCHOOL_ADMIN creates a support ticket
- `GET /tickets` — Lists tickets (SCHOOL_ADMIN scoped to own school, SUPER_ADMIN sees all)
- `GET /tickets/:id` — Get ticket detail with replies
- `PATCH /tickets/:id` — Update status, add reply (both roles)

---

#### Notifications Controller

##### [NEW] [notifications.controller.ts](file:///c:/Users/agrma/Desktop/Algoriza/vibe%20coding/safe_school_backend/src/notifications/notifications.controller.ts)

Add REST endpoints for broadcast notifications:

- `POST /notifications/broadcast` — SCHOOL_ADMIN sends broadcast to school
- `GET /notifications/school` — SCHOOL_ADMIN lists broadcasts for their school

---

#### Safety Reports for School Admin

##### [MODIFY] [dashboard.controller.ts](file:///c:/Users/agrma/Desktop/Algoriza/vibe%20coding/safe_school_backend/src/dashboard/dashboard.controller.ts)

Add endpoint:
- `GET /dashboard/school/safety-reports` — SCHOOL_ADMIN lists safety reports for their school
- `PATCH /dashboard/school/safety-reports/:id/resolve` — Mark as resolved

---

#### Parents & Delegates List

##### [MODIFY] [dashboard.controller.ts](file:///c:/Users/agrma/Desktop/Algoriza/vibe%20coding/safe_school_backend/src/dashboard/dashboard.controller.ts)

Add endpoints:
- `GET /dashboard/school/parents` — SCHOOL_ADMIN lists parents in their school
- `GET /dashboard/school/delegates` — SCHOOL_ADMIN lists delegates in their school

---

#### Activities Admin Access

##### [MODIFY] [activities.controller.ts](file:///c:/Users/agrma/Desktop/Algoriza/vibe%20coding/safe_school_backend/src/activities/activities.controller.ts)

Add `SCHOOL_ADMIN` to the `@Roles()` for [findAll](file:///c:/Users/agrma/Desktop/Algoriza/vibe%20coding/safe_school_backend/src/students/students.controller.ts#124-127) and [findOne](file:///c:/Users/agrma/Desktop/Algoriza/vibe%20coding/safe_school_backend/src/students/students.controller.ts#228-231) methods (read-only admin access).

---

### Phase 2: Frontend — Admin Dashboard

All new files go inside `client/src/admin/` to keep separated from the super admin dashboard.

---

#### Folder Structure

```
client/src/admin/
├── AdminApp.tsx            # Admin router + layout
├── components/
│   ├── AdminLayout.tsx     # Sidebar nav + header
│   ├── AdminSidebar.tsx    # Sidebar with menu items
│   └── PickupKanban.tsx    # Kanban board component
├── pages/
│   ├── AdminDashboard.tsx  # Overview cards + pickup board
│   ├── Students.tsx        # Student CRUD table
│   ├── Staff.tsx           # Staff management
│   ├── PickupPipeline.tsx  # Kanban pickup view
│   ├── Transportation.tsx  # Bus/vehicle management
│   ├── Activities.tsx      # View activities feed
│   ├── SafetyReports.tsx   # Incident list + creation
│   ├── InvitationCodes.tsx # Code generation/management
│   ├── Notifications.tsx   # Send broadcasts
│   ├── Tickets.tsx         # Support tickets
│   └── Settings.tsx        # School settings
├── hooks/
│   └── use-admin-api.ts    # API hooks for admin endpoints
└── lib/
    └── admin-api.ts        # API client functions
```

---

#### [MODIFY] [App.tsx](file:///c:/Users/agrma/Desktop/Algoriza/vibe%20coding/School-Admin-Hub/client/src/App.tsx)

Update the login flow:
- After login, check `user.role`
- If `SUPER_ADMIN` → render existing super admin dashboard
- If `SCHOOL_ADMIN` → render `AdminApp` with admin routes

---

#### Design System

The admin dashboard will use the **same design philosophy** as the super admin dashboard:
- Minimal, thin typography
- Soft glass UI (glassmorphism)
- Same color palette and component library (shadcn/ui)
- Dark/light mode support

---

### Phase 3: Integration

Connect all admin pages to backend APIs using the existing `@tanstack/react-query` setup.

---

## Verification Plan

### Automated Tests

1. **Backend — Existing tests**:
   ```
   cd safe_school_backend
   npm run test
   ```
   This will run existing unit tests to ensure no regressions.

2. **Backend — Build check**:  
   ```
   cd safe_school_backend
   npx tsc --noEmit
   ```
   Verify TypeScript compilation succeeds with new modules added.

3. **Frontend — Build check**:  
   ```
   cd School-Admin-Hub
   npx vite build
   ```
   Verify the frontend compiles without errors.

### Manual Verification

1. **Login redirect**: Log in with a SCHOOL_ADMIN email/password and confirm you land on the admin dashboard (not super admin).
2. **Log in as SUPER_ADMIN** and confirm you still land on the super admin dashboard.
3. **Navigate all admin sidebar links** and confirm each page renders without errors.
4. **Test at least one CRUD flow** (e.g., go to Students page, verify list loads, try add/edit/delete).
5. **Open browser dev tools Network tab** to confirm API calls use correct endpoints and return data.

> [!NOTE]
> Full end-to-end testing requires a running backend with seeded data. Please confirm if and how we should seed test data.
