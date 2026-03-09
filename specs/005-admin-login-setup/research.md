# Research: Admin Login System

## Decision: Authentication Strategy
**Choice**: Session-based authentication using `passport` and `express-session`.

**Rationale**:
- Fits well with the current Express backend.
- Simplifies "Stay logged in" (session persistence) and "Logout" (session destruction).
- Avoids the complexity of JWT refresh tokens and client-side storage security (cookies are managed by the browser).

**Alternatives Considered**:
- **JWT (Stateless)**: Rejected because it requires manual management of token expiration and refresh logic on the client side, which is more prone to security slips for this scope.

## Decision: Password Hashing
**Choice**: Node.js built-in `crypto` module with `scrypt`.

**Rationale**:
- Secure and recommended for password hashing.
- Zero extra dependencies (already in Node.js).
- Consistent with modern standards.

## Decision: Frontend Auth Management
**Choice**: `AuthContext` + `useAuth` hook using TanStack Query.

**Rationale**:
- `useQuery` for fetching the current user (`/api/user`) handles caching and loading states cleanly.
- `useMutation` for login/logout provides built-in success/error handling.
- Context makes user data accessible globally (needed for role-based UI in the Sidebar/Header).

## Technical Context Updates
- **New Dependencies**: `passport`, `passport-local`, `express-session`, `types/passport`, `types/passport-local`, `types/express-session`.
- **Target Routes**:
  - `POST /api/login`: Authenticate and start session.
  - `POST /api/logout`: Destroy session.
  - `GET /api/user`: Get current authenticated user info.
