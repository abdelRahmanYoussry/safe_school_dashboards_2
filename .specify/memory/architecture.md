# Safe School System Architecture

## System Type
Multi-Tenant SaaS Platform

**Primary Goal**: Secure student pickup and school safety management.

**Architecture Style**: Modular Monolith designed for future Microservices extraction.

---

# Core Technology Stack

### Backend
• Framework: NestJS
• ORM: Prisma
• Database: PostgreSQL
• Auth: OTP + JWT
• Realtime: WebSocket
• Cache: Redis (optional)

### Mobile
• Flutter

### Dashboards
• Next.js
• TypeScript
• Tailwind

### Infrastructure
• Cloud: AWS / Oracle
• Storage: S3 compatible
• Notifications: Firebase FCM

---

# Multi Tenant Design
Each school represents a tenant.

**Rule**: Every table MUST include `school_id`.
**Except**:
• `subscription_plans`
• `global_config`
• `super_admin` tables

Queries must enforce tenant filtering.
*Example*: `SELECT * FROM students WHERE school_id = current_user.school_id`
Super Admin bypasses tenant filtering.

---

# Core Domains
System is divided into:
- Authentication
- School Management
- User Management
- Transportation
- Pickup Engine
- Delegation Engine
- Tracking Engine
- Notification Engine
- Safety Reports
- Ticket System

Each domain must expose APIs.

---

# Database Core Entities
- schools, users, students, grades
- vehicles, vehicle_colors, buses, drivers
- delegations, pickups, pickup_tracking, handover_verifications
- safety_reports, tickets, notifications, audit_logs

---

# Pickup State Machine
Strict states:
`CREATED` → `ARRIVED` → `CHILD_PREPARING` → `SECURITY_VERIFICATION` → `HANDED_TO_PARENT` / `HANDED_TO_DELEGATE` → `DELIVERED`
Invalid transitions must be rejected.

---

# Tracking Engine
Applies only for delegate pickup.

**Rules**:
- Location update every 30 seconds.
- Tracking starts after: `HANDED_TO_DELEGATE`
- Tracking stops after: `DELIVERED`
- If no update for 5 minutes: Trigger safety alert.

---

# Security Rules
- OTP login
- JWT tokens (+ Refresh tokens)
- DTO validation
- RBAC permission guards
- Rate limiting

---

# Event Driven Components
Triggering events:
- Pickup status changed
- Delegation accepted
- Student handed to delegate
- Safety report created
- Emergency broadcast
*These events trigger notifications.*

---

# Scalability Plan
Future microservices: Notification, Tracking, Reporting, Authentication.
