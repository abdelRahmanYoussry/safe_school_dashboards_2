# Dashboard Development Rules

Dashboards are built using Next.js.
Scopes: Super Admin Dashboard vs School Admin Dashboard. **Never mix scopes**.

---

# Super Admin Dashboard Features
- **School Management**: CRUD operations.
- **Subscription Management**: CRUD plans, assign schools.
- **Global Analytics**: Totals, stats, usage metrics.
- **Support Center**: Manage tickets from schools.

---

# School Admin Dashboard Features
- **Academic Structure**: Grades, gates, exit times.
- **Transportation**: Vehicle types/colors, buses, drivers.
- **User Management**: Students, staff (Teacher, Security, General).
- **Invitation Codes**: Generate, expiration, analytics.
- **Monitoring**: Pickup logs, safety reports, broadcast notifications.
- **Support**: Send tickets to Super Admin.

---

# UI Guidelines
- Sidebar navigation
- Role-based menu visibility
- Real-time notifications
- Search and filters
- Pagination for large tables

---

# Analytics Widgets
- **Super Admin**: Total schools/users, daily pickups, safety reports, usage rate.
- **School Admin**: Today's pickups, pending delegations, safety alerts, recent activities.

---

# Security Rules
- All requests require JWT.
- Actions must validate permissions.
- **Critical**: School Admin must never access another school's data.

---

# UI Performance Rules
- Tables must support: Pagination, Sorting, Filtering.
- Heavy queries must use server-side pagination.

---

# Multi-Language Support (i18n)
- **Required Languages**: English (en), Arabic (ar), Urdu (ur).
- **No Static Strings**: All text displayed in the UI MUST be fetched from translation files (`messages/*.json`) using `useTranslations` or similar i18n hooks.
- **RTL Support**: Layouts must automatically adjust for Arabic and Urdu (Direction: RTL). Use Tailwind logical properties (e.g., `ps-4`, `pe-4`) instead of directional ones (`pl-4`, `pr-4`) where appropriate.
