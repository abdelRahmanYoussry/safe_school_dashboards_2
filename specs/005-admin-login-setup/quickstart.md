# Quickstart: Admin Login System

## 1. Schema Update
Modify `shared/schema.ts` to include the `users` table and run the migration/db-push if necessary.

## 2. Backend Implementation
1. Install dependencies: `npm install passport passport-local express-session`.
2. Configure passport strategy in `server/routes.ts` or a separate `server/auth.ts`.
3. Implement `POST /api/login`, `POST /api/logout`, and `GET /api/user`.

## 3. Frontend Implementation
1. Create `client/src/hooks/use-auth.tsx` with `AuthContext` and `AuthProvider`.
2. Protect layout routes in `App.tsx` using a route guard.
3. Create the `LoginPage` component and add it to the router.

## 4. Verification
1. Attempt to access `/` without logging in (should redirect to `/login`).
2. Log in with Super Admin credentials.
3. Verify redirection to Dashboard.
4. Log out and verify redirection back to `/login`.
