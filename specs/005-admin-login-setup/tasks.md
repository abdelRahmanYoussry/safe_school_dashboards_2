# Tasks: Admin Login System

**Input**: Design documents from `/specs/005-admin-login-setup/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Manual browser verification is prioritized per the implementation plan.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and dependencies

- [x] T001 Install auth dependencies: `npm install passport passport-local express-session connect-pg-simple`
- [x] T002 Install auth type definitions: `npm install -D @types/passport @types/passport-local @types/express-session @types/connect-pg-simple`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure for authentication and user management

- [x] T003 Update `shared/schema.ts` to include the `users` table per `data-model.md`
- [x] T004 [SKIP] Run `npm run db:push` (Pivoted to MemStorage due to local DB unavailability)
- [x] T005 [P] Implement `server/auth.ts` for passport configuration, local strategy, and `scrypt` hashing
- [x] T006 [P] Create `client/src/hooks/use-auth.tsx` with `AuthProvider` and `useAuth` hook using TanStack Query
- [x] T007 Register auth routes (`/api/login`, `/api/logout`, `/api/user`) in `server/routes.ts`

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Super Admin Access (Priority: P1) 🎯 MVP

**Goal**: Enable Super Admins to log in and access the global dashboard

**Independent Test**: Navigate to `/login`, enter Super Admin credentials, and verify redirect to `/` (Dashboard).

### Implementation for User Story 1

- [x] T008 [P] [US1] Create foundational `LoginPage` UI component in `client/src/pages/LoginPage.tsx`
- [x] T009 [US1] Add `/login` route and `AuthProvider` wrapper to `client/src/App.tsx`
- [x] T010 [US1] Wrap dashboard routes in `App.tsx` with a protected route component or conditional redirect
- [x] T011 [US1] Seed a default Super Admin user in `server/routes.ts` (inside `seedDatabase`)
- [ ] T012 [US1] Verify Super Admin login flow and redirection to global dashboard

**Checkpoint**: Super Admin login is functional and independently testable

---

## Phase 4: User Story 2 - School Admin Access (Priority: P1)

**Goal**: Enable School Admins to log in and be redirected to their school context

**Independent Test**: Log in with School Admin credentials and verify landing on the Admin Dashboard.

### Implementation for User Story 2

- [x] T013 [US2] Update `seedDatabase` in `server/routes.ts` to include a School Admin user linked to a school
- [x] T014 [US2] Implement role-based redirection logic in `LoginPage.tsx` (redirect `school_admin` to appropriate dashboard view)
- [x] T015 [US2] Update Sidebar/Header in `client/src/components/layout/AppLayout` to reflect current user role and school info

**Checkpoint**: Both Super Admin and School Admin roles work independently

---

## Phase 5: User Story 3 - Session & Logout (Priority: P2)

**Goal**: Maintain session across refreshes and allow secure logout

**Independent Test**: Log in, refresh page (verify still in), then logout and verify redirect to `/login`.

### Implementation for User Story 3

- [x] T016 [P] [US3] Add a "Logout" button to the user profile menu in `AppLayout` (or Header)
- [x] T017 [US3] Implement logout mutation call using the `useAuth` hook
- [x] T018 [US3] Verify session persistence on browser refresh across both roles

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: UX improvements and final validation

- [ ] T019 [P] Add success/error toasts for login and logout actions
- [ ] T020 Run full `quickstart.md` validation checklist
- [ ] T021 Final code cleanup and documentation update in `README.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies
- **Foundational (Phase 2)**: Depends on Phase 1
- **User Stories (Phase 3+)**: All depend on Phase 2 completion
- **Polish (Phase 6)**: Depends on all user stories

### Parallel Opportunities

- T005, T006, and T008 can be worked on in parallel.
- Once the foundational hooks (T006) and routes (T007) are ready, UI and logic can proceed.

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Setup and Foundational phases.
2. Complete User Story 1 implementation.
3. **VALIDATE**: Ensure Super Admin can log in and routes are protected.
4. Continue to User Story 2 and 3 sequentially.
