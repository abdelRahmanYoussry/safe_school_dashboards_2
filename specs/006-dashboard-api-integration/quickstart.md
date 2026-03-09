# Dashboard API Integration - Quickstart

This document provides a quick reference for developers working on the `006-dashboard-api-integration` feature branch.

## Getting Started

1. **Install Dependencies**: Run `npm install` from the repository root.
2. **Setup Environment**: Ensure your `.env` file is configured with necessary database credentials (the project uses PostgreSQL).
3. **Start Development Server**:
   ```bash
   npm run dev
   ```
   This command starts the Vite development server for the frontend (`client/`) concurrently with the backend API server (`server/`) using `tsx`.

## Key Files to Modify

The integration focuses on the React components in the `client/src/pages/` directory:

- `Schools.tsx`: Map table data to the `useSchools()` hook. Add pagination inputs. Add `en/ar/ur` translations for any new strings.
- `Plans.tsx`: Map table and creation modal to `usePlans()` and `useCreatePlan()` hooks.
- `AuditLogs.tsx`: Use `useQuery` to fetch from `/api/audit-logs` mapping to `AuditLog[]`.
- `Analytics.tsx`: Handle the missing endpoints gap according to the spec (display "Feature Coming Soon"). Use `useTranslations` for the placeholder text.
- `SafetyReports.tsx`: Similar missing endpoint handling as Analytics.

## Development Rules

1. **No Static Strings**: All text in the UI must use `useTranslations("FeatureName")` utilizing the locales in `client/src/locales/`.
2. **Graceful Loading**: Show loading spinners or skeletons while `isLoading` from React Query is `true`.
3. **Error Boundaries**: If `isError` is true, display a user-friendly error message fetched from translation files.
4. **Data Verification**: Confirm data updates in the UI by using the React Query Devtools or observing network requests in the browser console.
