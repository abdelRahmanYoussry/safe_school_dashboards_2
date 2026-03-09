# Feature Specification: Admin Login System

**Feature Branch**: `005-admin-login-setup`  
**Created**: 2026-03-09  
**Status**: Draft  
**Input**: User description: "add login page before the home page which is open and this home page u will make teh design and the api intgeration according for what we have this login page will be for super admin dashboard and for admin dashboard u can make 2 apges or use the same page login will be email and pass"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Secure Super Admin Access (Priority: P1)

As a Super Admin, I want to log into the system using my email and password so that I can manage all schools, plans, and system-wide analytics.

**Why this priority**: Core security requirement. Without authentication, the entire system is exposed to unauthorized access.

**Independent Test**: Can be tested by visiting the root URL, being redirected to `/login`, entering Super Admin credentials, and verifying access to the global dashboard.

**Acceptance Scenarios**:

1. **Given** an unauthenticated visitor tries to access `/`, **When** the page loads, **Then** they are redirected to `/login`.
2. **Given** a user on the `/login` page, **When** they enter valid Super Admin credentials, **Then** they are redirected to the Super Admin Dashboard.
3. **Given** a user on the `/login` page, **When** they enter invalid credentials, **Then** an error message "Invalid email or password" is displayed.

---

### User Story 2 - School Admin Dashboard Access (Priority: P1)

As a School Admin, I want to log into the system using my email and password so that I can manage my specific school's safety reports, tickets, and student pickup operations.

**Why this priority**: Essential for multi-tenant isolation. Admins must reach their specific dashboard context upon login.

**Independent Test**: Can be tested by entering School Admin credentials at `/login` and verifying they land on a dashboard scoped to their school.

**Acceptance Scenarios**:

1. **Given** a user on the `/login` page, **When** they enter valid School Admin credentials, **Then** they are redirected to the Admin Dashboard (scoped to their school).
2. **Given** a logged-in School Admin, **When** they try to access Super Admin specific routes (like global schools list), **Then** access is denied or they are redirected back to their dashboard.

---

### User Story 3 - Session Persistence and Logout (Priority: P2)

As a user, I want to stay logged in across browser refreshes and be able to log out securely so that my session is protected and convenient.

**Why this priority**: Basic usability and security expectation for any SaaS platform.

**Independent Test**: Log in, refresh the page (verify still logged in), click logout, then try to navigate back to `/` (verify redirected to `/login`).

**Acceptance Scenarios**:

1. **Given** a logged-in user, **When** they refresh the browser, **Then** they remain on their dashboard without needing to re-login.
2. **Given** a logged-in user, **When** they click "Logout", **Then** their session is cleared and they are redirected to the `/login` page.

---

### Edge Cases

- **Expired Session**: What happens when a user's session expires while they are mid-task? The system should redirect to login on the next API call failure (401).
- **Network Failure**: How does the login handle API timeouts? A clear "Connection error, please try again" should be shown.
- **Empty Fields**: Attempting to click "Login" with empty email/password should show immediate validation warnings.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a dedicated `/login` route accessible to unauthenticated users.
- **FR-002**: System MUST protect all dashboard routes (`/`, `/schools`, `/analytics`, etc.) with an authentication guard.
- **FR-003**: System MUST identify the user role (Super Admin vs. School Admin) upon successful authentication.
- **FR-004**: System MUST store the authentication token (JWT or Session Cookie) securely and include it in subsequent API requests.
- **FR-005**: System MUST provide a consistent design for the login page that matches the platform's brand aesthetic.
- **FR-006**: Login form MUST validate email format before submission.

### Key Entities *(include if feature involves data)*

- **User**: Represents a person with access to the system. Attributes: Email, Password (hashed), Role (Super Admin, School Admin), School ID (nullable).
- **Session**: Represents an active authenticated state. Attributes: Token, Expire Date.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of unauthenticated attempts to access dashboard routes result in a redirect to the `/login` page.
- **SC-002**: Login completion (from landing on `/login` to seeing the dashboard) takes less than 3 seconds on a standard 4G connection.
- **SC-003**: Zero sensitive data (like school lists or reports) is visible to a user before they have successfully logged in.
- **SC-004**: User session survives browser closing/reopening if "Remember Me" (or default persistence) is active.
