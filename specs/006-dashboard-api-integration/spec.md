# Feature Specification: Dashboard API Integration

**Feature Branch**: `006-dashboard-api-integration` (Manual initialization on `005-admin-login-setup`)  
**Created**: 2026-03-09  
**Status**: Draft  
**Input**: Integrated all APIs to link the dashboard with existing APIs according to gap analysis. Fit current UI with APIs.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - School Management Overview (Priority: P1)

As a Super Admin, I want to see a list of all registered schools with their key metrics so I can monitor system growth and healthy school activity.

**Why this priority**: Core value of the Super Admin dashboard; required for basic oversight.

**Independent Test**: Can be tested by loading the Schools page and verifying it displays data from the `/dashboard/admin/schools` endpoint.

**Acceptance Scenarios**:

1. **Given** schools exist in the database, **When** I navigate to the Schools page, **Then** I see a paginated table showing school names, student counts, and status fetched from the API.
2. **Given** no schools exist, **When** I navigate to the Schools page, **Then** I see an empty state message.

---

### User Story 2 - Subscription & Plan Management (Priority: P2)

As a Super Admin, I want to manage subscription plans and assign them to schools so I can control access and billing tiers.

**Why this priority**: Essential for business operations and monetization management.

**Independent Test**: Can be tested by creating a new plan on the Plans page and verifying it appears in the list via `/subscription-plans`.

**Acceptance Scenarios**:

1. **Given** I am on the Plans page, **When** I create a new subscription plan, **Then** the `POST /subscription-plans` API is called and the UI refreshes to show the new plan.
2. **Given** a school exists, **When** I assign a plan to it, **Then** the `POST /subscription-plans/assign` API is called with the correct IDs.

---

### User Story 3 - Audit & Security Monitoring (Priority: P2)

As a Super Admin, I want to review global audit logs to ensure security compliance and investigate administrative actions across all schools.

**Why this priority**: Required for security and operational transparency.

**Independent Test**: Can be tested by performing an action (like updating a school) and verifying it appears in the Audit Logs page.

**Acceptance Scenarios**:

1. **Given** administrative actions have occurred, **When** I view the Audit Logs page, **Then** I see a list of actions with user IDs and timestamps from the `/dashboard/admin/audit-logs` endpoint.

---

### Edge Cases

- **Slow API responses**: UI components should display skeleton loaders or spinners while fetching data.
- **Unauthorized access**: If a session expires or token is invalid, the system should redirect to the Login page.
- **Missing Data (Missing Endpoints)**: For UI sections mapping to missing endpoints (e.g., Safety Trends), the UI should show a "Feature Coming Soon" or informative placeholder until the backend is updated.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST map all current UI pages to their respective API endpoints as defined in the mapping table.
- **FR-002**: System MUST use the existing `useAuth` hook and API client (Orval) to perform requests.
- **FR-003**: System MUST handle pagination for school lists and audit logs as supported by the backend.
- **FR-004**: System MUST display error messages when API requests fail (e.g., 500 Internal Server Error).
- **FR-005**: System MUST provide visual feedback (loaders) during active data fetching.

### UI to API Mapping Table

| UI Page (`client/src/pages/`) | Primary API Endpoint | Methods Used | Status (Gap Analysis) |
|---|---|---|---|
| `LoginPage.tsx` | `/auth/dashboard-login` | `POST` | ✅ Present |
| `Schools.tsx` | `/dashboard/admin/schools` | `GET` | ✅ Present |
| `SchoolDetails.tsx` | `/schools/{id}`, `/schools/{id}/stats` | `GET` | ✅ Present |
| `Plans.tsx` | `/subscription-plans` | `GET`, `POST`, `PATCH`, `DELETE` | ✅ Present |
| `AuditLogs.tsx` | `/dashboard/admin/audit-logs` | `GET` | ✅ Present |
| `Analytics.tsx` | `/schools/{id}/stats` | `GET` | ✅ Present |
| `SafetyReports.tsx` | `/schools/:id/incidents` | `GET` | ❌ Missing |
| `Analytics.tsx` (Trends) | Safety analytics endpoint | `GET` | ❌ Missing |

### Key Entities *(include if feature involves data)*

- **School**: Represents a registered institution (id, name, contact info, status).
- **SubscriptionPlan**: Tiered access level for schools (id, name, price, feature set).
- **AuditLog**: Record of administrative actions (timestamp, actor, action type, target).
- **Incident**: Safety event recorded at school premises (id, schoolId, type, severity, description).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of "Present" status endpoints from the mapping table are linked to their respective UI components.
- **SC-002**: Page load time for data-driven pages (Schools, Plans) is under 2 seconds (excluding network latency).
- **SC-003**: Zero console errors during navigation between pages under normal operating conditions.
- **SC-004**: All forms (Login, Create Plan) successfully submit data to the backend and handle success/error states gracefully.
