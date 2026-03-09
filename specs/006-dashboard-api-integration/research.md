# Research: Dashboard API Integration

Based on the [feature specification](file:///C:/Users/agrma/Desktop/Algoriza/vibe%20coding/School-Admin-Hub/specs/006-dashboard-api-integration/spec.md), [Implementation Plan](file:///C:/Users/agrma/Desktop/Algoriza/vibe%20coding/School-Admin-Hub/specs/006-dashboard-api-integration/plan.md), and [API Guidelines](file:///C:/Users/agrma/Desktop/Algoriza/vibe%20coding/School-Admin-Hub/.specify/memory/api-guidelines.md), here are findings resolving initially unclear parameters and defining the integration approach.

## 1. Testing Framework (NEEDS CLARIFICATION)
- **Decision**: Manual Browser Testing + React Query Devtools.
- **Rationale**: The project uses `Vite` + `React` + `Tailwind` + `React Query` (`package.json`). No dedicated frontend test framework (Jest/Cypress/Playwright) is installed in `devDependencies`. We will rely on running the dev server and manually verifying the UI flows (Login, Schools list, Plans) as per the Independent Tests outlined in the spec.
- **Alternatives considered**: Setting up Vitest/Playwright, but that falls outside the immediate scope of integrating the UI with the *existing* setup.

## 2. API Client / Orval Usage (NEEDS CLARIFICATION)
- **Decision**: Continue using `fetch` with `React Query` as currently implemented in `client/src/hooks/`.
- **Rationale**: The spec mentions "System MUST use the existing `useAuth` hook and API client (Orval) to perform requests." However, searching the codebase reveals Orval is *not* installed or configured. Instead, existing hooks (`use-schools.ts`, `use-system.ts`) use standard `fetch` heavily integrated with `@tanstack/react-query`. We will align with the existing `fetch` + `React Query` pattern to ensure consistency and avoid a disruptive client migration.
- **Alternatives considered**: Installing and configuring Orval, but this would rewrite all existing hooks.

## 3. Handling Missing Endpoints
- **Decision**: Implement graceful degradation with "Feature Coming Soon" placeholders.
- **Rationale**: The spec explicitly requires: "For UI sections mapping to missing endpoints (e.g., Safety Trends), the UI should show a 'Feature Coming Soon' or informative placeholder until the backend is updated."

## 4. Pagination Standard
- **Decision**: Implement server-side pagination passing `page` and `limit` query parameters.
- **Rationale**: Dictated by `api-guidelines.md`: `GET /students?page=1&limit=20`, expecting a `meta` object with `total` pages/items. This aligns with standard React Query pagination patterns (e.g., using `keepPreviousData`).

## 5. Security & Multi-Tenant Rules
- **Decision**: Ensure all `fetch` calls send authorization. 
- **Rationale**: Current hooks use `{ credentials: "include" }`, meaning session cookies are used rather than `Authorization: Bearer TOKEN`. As this is a unified app (`server` directory adjacent to `client` serving APIs), cookie-based auth handles this securely without exposing JWTs to JS.

## Conclusion & Readiness
All "NEEDS CLARIFICATION" points from the Technical Context are resolved. We will proceed to Phase 1 (Data Model & Contracts).
