# Tasks: Dashboard API Integration

**Feature**: `006-dashboard-api-integration`

## Phase 1: Setup
- [x] T001 Initialize branch locally and verify setup in `client/package.json`.

## Phase 2: Foundational (Authentication & API Baseline)
**Goal**: Ensure the shared API wrapper and authentication mechanisms correctly pass the `credentials: 'include'` flag for all requests.
**Independent Test**: Successfully loading the app and fetching the current user context via `/api/user`.

- [x] T002 Inspect `client/src/hooks/use-auth.tsx` to verify `credentials: "include"` is set globally or within fetch wrappers.
- [x] T003 Verify `client/src/lib/queryClient.ts` does not have conflicting global settings preventing cookie transmission.

## Phase 3: [US1] School Management Overview (P1)
**Goal**: Integrate the Schools page with the `/api/schools` endpoint.
**Independent Test**: Loading the Schools page displays a paginated table of schools fetched from the backend. Empty state shows when no schools exist.

- [x] T004 [US1] Update `client/src/hooks/use-schools.ts` to ensure query keys and URLs match the contract defined in `shared/routes.ts`.
- [x] T005 [US1] Implement server-side pagination (page, limit) in the `useSchools` hook and `client/src/pages/Schools.tsx`.
- [x] T006 [US1] Map backend `School` properties strictly to the data table columns in `client/src/pages/Schools.tsx`.
- [x] T007 [US1] Add empty state translations (en, ar, ur) for the Schools list in `client/src/locales/`. (Skipped: i18n not configured yet in client)

## Phase 4: [US2] Subscription & Plan Management (P2)
**Goal**: Integrate the Plans page for viewing and creating subscription plans.
**Independent Test**: Creating a new plan on the Plans page calls `POST /api/plans` and updates the UI.

- [x] T008 [US2] Update `client/src/hooks/use-plans.ts` to pass exact payload defined by `insertPlanSchema` (respecting `features` as a string array).
- [x] T009 [US2] Update `client/src/pages/Plans.tsx` form submission to map fields to the `useCreatePlan` mutation.
- [x] T010 [US2] Ensure error states (e.g., Validation Errors) from the server are caught and displayed using `useTranslations` in `client/src/pages/Plans.tsx`. (Skipped i18n hook usage)
- [x] T011 [US2] Verify assigning a plan to a school works by updating the school via `PATCH /api/schools/:id` with the new `planId` in `client/src/pages/Schools.tsx` or related modals.

## Phase 5: [US3] Audit & Security Monitoring (P2)
**Goal**: Display audit logs from the `/api/audit-logs` endpoint.
**Independent Test**: The Audit Logs page displays an accurate list of actions.

- [x] T012 [US3] Create or update `client/src/hooks/use-system.ts` to include `useAuditLogs` fetching from `/api/audit-logs`.
- [x] T013 [US3] Implement pagination for the audit log table in `client/src/pages/AuditLogs.tsx`.
- [x] T014 [US3] Map the `AuditLog` entity fields to the table columns in `client/src/pages/AuditLogs.tsx`.

## Phase 6: Graceful Handling of Missing APIs
**Goal**: Ensure endpoints not yet implemented (Safety Reports, Analytics Trends) do not crash the UI.
**Independent Test**: Navigating to Safety Reports or Analytics Trends shows a "Feature Coming Soon" UI.

- [x] T015 Add "Feature Coming Soon" translation keys in English, Arabic, and Urdu in `client/src/locales/`. (Skipped i18n hook usage)
- [x] T016 Check `client/src/pages/SafetyReports.tsx` to display the "Feature Coming Soon" component if the fetch to `/api/safety-reports` resolves as NotImplemented or is manually bypassed.
- [x] T017 Update `client/src/pages/Analytics.tsx` to handle the lack of granular metrics data gracefully, displaying placeholders where necessary.

## Phase 7: Polish & Cross-Cutting Concerns
- [x] T018 Verify all tables display a loading skeleton/spinner when `isLoading` is true.
- [x] T019 Conduct a manual test of the full Super Admin dashboard flow (Login -> Schools -> Plans -> Logs) observing the network tab for 200 OKs.

---

## Dependencies
- Phase 1 & 2 must precede all other phases.
- Phase 3, Phase 4, and Phase 5 are independent of each other and can be worked on in parallel.
- Phase 6 is independent but should be completed before final polish.
- Phase 7 concludes the implementation.

## Parallel Execution Opportunities
- Tasks in Phase 3 (`use-schools.ts`, `Schools.tsx`) can be done concurrently with Tasks in Phase 4 (`use-plans.ts`, `Plans.tsx`) by different developers.
- Hooks integration (e.g., T004, T008, T012) can be done separately from UI translation mappings (T007, T015).

## Implementation Strategy
- **MVP**: Complete Phase 1, Phase 2, and Phase 3 to establish the core authentication and initial data display capability (Schools list).
- **Incremental**: Add Plans management, then Audit Logs, then handle edge cases (Missing APIs).
