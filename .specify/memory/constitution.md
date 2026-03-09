<!-- 
<SyncImpactReport>
- Version change: 1.1.0 -> 1.2.0
- List of modified principles: Refactored constitution to reference specialized memory files for Architecture, API Guidelines, and Dashboard Rules.
- Added sections: Reference to architecture.md, api-guidelines.md, and dashboard-rules.md.
- Removed sections: Moved detailed technical blocks to separate files for better maintainability.
- Templates requiring updates:
  - .specify/templates/plan-template.md (Reflects new memory structure)
</SyncImpactReport>
-->

# Safe School System Constitution

## 1. System Purpose
Safe School is a Multi-Tenant SaaS platform designed to ensure secure student pickup, transportation management, delegation tracking, and school safety operations.

## 2. Core Principles

### I. Multi-Tenant Isolation
Strict isolation per school. Every table must include `school_id`. Tenant filtering is mandatory at the query level.

### II. RBAC + Permission Architecture
Hybrid RBAC + Permission system. Validations must occur at every endpoint based on permissions, not just roles.

### III. Universal Accessibility & I18n
The system must support **English, Arabic, and Urdu**. Static strings in the UI are strictly prohibited; all text must be managed via translation files. RTL layout must be supported.

### IV. Feature-Driven Development
The system is built feature-by-feature (schema, service, controller, DTO, guard, documentation, tests). Never build modules at once.

### IV. API First Architecture
API is the source of truth. Dashboards and Mobile apps are consumers. Refers to [API Guidelines](file:///c:/Users/agrma/Desktop/Algoriza/vibe%20coding/School-Admin-Hub/.specify/memory/api-guidelines.md).

## 3. Specialized Guides
For detailed technical and operational requirements, refer to the following memory files:

- **[System Architecture](file:///c:/Users/agrma/Desktop/Algoriza/vibe%20coding/School-Admin-Hub/.specify/memory/architecture.md)**: Tech stack, domains, entities, state machines, and scaling plans.
- **[API Design Guidelines](file:///c:/Users/agrma/Desktop/Algoriza/vibe%20coding/School-Admin-Hub/.specify/memory/api-guidelines.md)**: REST standards, response formats, pagination, and validation rules.
- **[Dashboard Development Rules](file:///c:/Users/agrma/Desktop/Algoriza/vibe%20coding/School-Admin-Hub/.specify/memory/dashboard-rules.md)**: Feature sets, UI performance, and security rules for admin dashboards.

## Governance
- **Coding Rules**: Clean architecture, transaction safety, feature-based commits.
- **Amendments**: Require documentation, version increments, and sync impact reports.

**Version**: 1.3.0 | **Ratified**: 2026-03-06 | **Last Amended**: 2026-03-07
