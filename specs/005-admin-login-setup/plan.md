# Implementation Plan: Admin Login System

**Branch**: `005-admin-login-setup` | **Date**: 2026-03-09 | **Spec**: [spec.md](file:///C:/Users/agrma/Desktop/Algoriza/vibe%20coding/School-Admin-Hub/specs/005-admin-login-setup/spec.md)
**Input**: Feature specification from `/specs/005-admin-login-setup/spec.md`

## Summary
Implement a secure multi-tenant authentication system using **Passport.js** and **Express Sessions**. This feature adds a `users` table, backend auth routes, a centralized `AuthContext` on the frontend, and a high-quality Login page with automatic redirection for unauthenticated users.

## Technical Context

**Language/Version**: TypeScript / Node.js 20.19.27  
**Primary Dependencies**: React 18, Express 5, Drizzle ORM, Passport 0.7, express-session 1.18  
**Storage**: PostgreSQL (via Drizzle)  
**Testing**: Manual Browser Verification + API request validation  
**Target Platform**: Web (Vite/React)
**Project Type**: Full-stack Web Application  
**Performance Goals**: Login response < 500ms, Page load matching current dashboard standards  
**Constraints**: Multi-tenant isolation (School Admin must only see their school data)  
**Scale/Scope**: ~2 roles initially (Super Admin, School Admin)

## Constitution Check

| Principle | Status | Implementation Detail |
|-----------|--------|-----------------------|
| Multi-Tenant Isolation | ✅ PASS | `school_id` added to `users` table; session tracks role/ID |
| Universal Accessibility & I18n | ✅ PASS | All strings in Login page will be managed through translation files |
| API First Architecture | ✅ PASS | New auth routes added to `shared/routes.ts` contracts |

## Proposed Changes

### [MODIFY] [schema.ts](file:///C:/Users/agrma/Desktop/Algoriza/vibe%20coding/School-Admin-Hub/shared/schema.ts)
- Add `users` table with `email`, `password` (hashed), `role`, and `school_id`.
- Export `insertUserSchema` and `User` types.

### [MODIFY] [routes.ts](file:///C:/Users/agrma/Desktop/Algoriza/vibe%20coding/School-Admin-Hub/shared/routes.ts)
- Add `api.auth.login`, `api.auth.logout`, and `api.auth.user` contract definitions.

### [NEW] [auth.ts](file:///C:/Users/agrma/Desktop/Algoriza/vibe%20coding/School-Admin-Hub/server/auth.ts)
- Implement `setupAuth` function to configure `passport` and `express-session`.
- Add local strategy for email/password validation using `crypto.scrypt`.
- Provide helper middleware `ensureAuthenticated`.

### [MODIFY] [routes.ts](file:///C:/Users/agrma/Desktop/Algoriza/vibe%20coding/School-Admin-Hub/server/routes.ts)
- Register auth routes: `/api/login`, `/api/logout`, `/api/user`.
- Ensure all other `/api/*` routes check for authentication.

### [NEW] [use-auth.tsx](file:///C:/Users/agrma/Desktop/Algoriza/vibe%20coding/School-Admin-Hub/client/src/hooks/use-auth.tsx)
- Create `AuthProvider` and `useAuth` hook using `@tanstack/react-query`.
- Manage user loading, login, and logout mutation states.

### [NEW] [LoginPage.tsx](file:///C:/Users/agrma/Desktop/Algoriza/vibe%20coding/School-Admin-Hub/client/src/pages/LoginPage.tsx)
- Implement a premium, responsive login form with brand-aligned aesthetics.
- Handle form submission, validation errors, and loading states.

### [MODIFY] [App.tsx](file:///C:/Users/agrma/Desktop/Algoriza/vibe%20coding/School-Admin-Hub/client/src/App.tsx)
- Wrap application in `AuthProvider`.
- Update `Router` to include `/login` and wrap dashboard routes in a protected boundary.

## Verification Plan

### Manual Verification
1. **Redirect Check**: Navigate to [http://localhost:5000/](http://localhost:5000/) in the browser. Verify automatic redirect to `/login`.
2. **Invalid Login**: Enter "test@test.com" and "wrongpass". Verify "Invalid email or password" toast appears.
3. **Success Login**: Enter valid credentials (to be seeded). Verify redirection to Dashboard and correct user name/role mapping in the UI.
4. **Logout**: Click Logout button. Verify session is destroyed and redirect to `/login`.
5. **Session Persistence**: Login, refresh page. Verify user remains authenticated.
