# Implementation Plan: Dashboard API Integration

**Branch**: `006-dashboard-api-integration` | **Date**: 2026-03-09 | **Spec**: [specs/006-dashboard-api-integration/spec.md](file:///C:/Users/agrma/Desktop/Algoriza/vibe%20coding/School-Admin-Hub/specs/006-dashboard-api-integration/spec.md)
**Input**: Feature specification from `/specs/006-dashboard-api-integration/spec.md`

## Summary

Integrate the Super Admin dashboard UI with existing backend APIs to display real data. The primary objective is to link the present APIs (Schools, Subscription Plans, Audit Logs) to their respective pages, handle pagination and error states, and gracefully handle currently missing APIs (Safety Reports, Analytics Trends) with placeholders.

## Technical Context

**Language/Version**: TypeScript / Next.js
**Primary Dependencies**: React, Tailwind, API client (to be clarified)
**Storage**: N/A (Frontend dashboard integration)
**Testing**: NEEDS CLARIFICATION (What frontend testing framework is configured?)
**Target Platform**: Web Browser
**Project Type**: Web Application (Dashboard)
**Performance Goals**: Page load time < 2s for data-driven pages
**Constraints**: Must support i18n (English, Arabic, Urdu), handle missing APIs gracefully, and enforce Super Admin access.
**Scale/Scope**: Super Admin Dashboard UI

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Multi-Tenant Isolation**: N/A directly for this task, as Super Admin bypasses tenant filtering, but API calls must use correct authorization.
- **RBAC + Permission Architecture**: UI must respect Super Admin scope and fetch data accordingly using `useAuth`.
- **Universal Accessibility & I18n**: *CRITICAL*. All new UI text (loaders, error messages, empty states) MUST be added to English, Arabic, and Urdu translation files. No static strings. RTL layout via Tailwind logical properties is required.
- **API First Architecture**: The UI acts as a consumer matching the exact OpenAPI/Swagger specifications.
- **Performance**: Tables must implement pagination for large datasets (Schools, Audit Logs).

## Project Structure

### Documentation (this feature)

```text
specs/006-dashboard-api-integration/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output (generated later)
```

### Source Code (repository root)

```text
client/
├── src/
│   ├── components/      # Loaders, error boundaries, empty states
│   ├── pages/           # Schools.tsx, Plans.tsx, AuditLogs.tsx, SafetyReports.tsx, Analytics.tsx
│   ├── hooks/           # useAuth
│   └── locales/         # i18n translation files (en, ar, ur)
```

**Structure Decision**: The project is a React web application (client folder). We will operate primarily in `client/src/pages` for integration, `client/src/components` for reused UI elements, and the `client` configuration for API clients.

## Complexity Tracking

*(No constitution violations noted yet)*
