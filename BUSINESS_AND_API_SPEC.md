# Safe School Dashboard - Complete Business & API Specification

## 1. BUSINESS OVERVIEW

### What is Safe School?
Safe School is a **Multi-Tenant SaaS Platform** that provides secure student pickup management systems for schools. It helps schools manage safe and efficient student pickups by:
- Tracking authorized parent/guardian pickups using geofencing
- Managing driver/staff credentials and authorizations
- Monitoring student safety and pickup compliance
- Providing real-time alerts and incident reporting
- Creating audit trails for accountability

### Target Users
- **Super Admin** (SaaS Owner): Manages all schools across the platform, monitors system health, manages subscription plans, handles billing
- **School Admins** (Tenant Admins): Manage their individual school's data, staff, students, parents
- **School Staff**: Verify pickups, check in/out students, view authorized pickups
- **Parents/Guardians**: Request pickups, receive notifications, provide authorization

### Revenue Model
- **Subscription Plans** based on school size (max students, max staff)
- **Tiered Pricing**: Basic, Premium, Enterprise plans
- **Per-School Monthly Billing**

---

## 2. SUPER ADMIN DASHBOARD FEATURES

### 2.1 Global Dashboard Overview
**Purpose**: Real-time pulse of the entire SaaS platform

**Key Metrics Displayed**:
- Total Schools (count)
- Total Users across all schools (count)
- Active Pickups Today (count)
- Total Students (count)
- Total Parents (count)
- Total Staff (count)
- Safety Incidents Today (count)
- System Health (percentage)

**Charts**:
- School Growth Over Time (line chart - schools added per month)
- User Registrations Per Day (bar chart)
- Pickup Requests Per Day (area chart)
- Safety Reports Trend (line chart - incidents over time)

**Recent Activity Tables**:
- Recent Schools (last 10 schools created)
- Recent Safety Reports (last 5 critical incidents)
- Recent Support Tickets (last 5 open tickets)

---

### 2.2 School Management (`/schools`)
**Purpose**: CRUD operations for all schools on the platform

**Features**:
- View all schools in a data table
- Create new school
- Edit school details
- Delete school (soft delete / deactivate)
- Activate / Deactivate school
- View detailed school analytics

**School Data Fields**:
- School ID (auto-generated)
- School Name (required)
- Address (required)
- City (required)
- Latitude & Longitude (for mapping)
- Geofence Radius (in meters - default 500m)
- Subscription Plan (Basic/Premium/Enterprise)
- Status (active, inactive, suspended)
- Avatar/Logo (optional)
- Created Date (timestamp)

**Table Columns Display**:
- School Name
- City
- Total Users
- Total Students
- Active Pickups (today)
- Subscription Plan
- Status (badge)
- Actions (View, Edit, Delete, Suspend)

---

### 2.3 School Details Page (`/schools/:id`)
**Purpose**: Deep dive into individual school analytics and performance

**Sections**:
1. **School Overview**
   - Basic info (name, address, contact)
   - Subscription tier
   - Account status
   - Days active on platform

2. **Usage Analytics**
   - Total API calls this month
   - Daily active users
   - Storage usage
   - Feature usage breakdown

3. **User Statistics**
   - Total admin count
   - Total staff count
   - Total parent count
   - User growth trend

4. **Pickup Analytics**
   - Total pickups this month
   - Average pickup duration
   - Peak pickup times
   - Successful vs failed pickups

5. **Safety Reports**
   - Critical incidents this month
   - Severity breakdown
   - Resolved vs open reports

6. **Staff Breakdown**
   - Total active staff
   - Staff by role
   - Recent staff additions

**Charts**:
- Pickup Timeline (hourly distribution)
- Users by Role (pie chart)
- Student Count by Grade (bar chart)
- System Usage Activity (line chart - hourly)

---

### 2.4 Subscription Plans Management (`/plans`)
**Purpose**: Define and manage pricing tiers for schools

**Features**:
- Create new subscription plan
- Edit existing plan
- Delete plan
- View all plans

**Plan Fields**:
- Plan Name (e.g., "Basic", "Premium", "Enterprise")
- Max Students (limit)
- Max Staff (limit)
- Monthly Price (in cents, e.g., 9900 = $99.00)
- Features List (array of feature strings)
  - Example: ["Standard Pickups", "Basic Reporting", "Email Alerts"]
  - Premium: ["Advanced Geofencing", "Priority Support", "Custom Analytics", "API Access"]
  - Enterprise: ["Dedicated Support", "Custom Integrations", "Advanced Security"]

**Plan Pricing Examples**:
- Basic: $99/month - 500 students, 50 staff
- Premium: $299/month - 2000 students, 200 staff
- Enterprise: Custom pricing

---

### 2.5 Platform Analytics (`/analytics`)
**Purpose**: Comprehensive platform-wide metrics and trends

**Charts**:
1. **Total Pickups Across Platform** (area chart)
   - Daily pickup volume trend
   - Shows seasonality (weekday vs weekend)

2. **Active Users Per Day** (line chart)
   - Daily active users trend
   - Shows platform growth

3. **Pickup Duration Analytics** (distribution/histogram)
   - Average duration: X minutes
   - Fastest pickup: Y minutes
   - Slowest pickup: Z minutes

4. **System Usage by Role** (stacked bar chart)
   - Admin actions
   - Staff actions
   - Parent actions
   - Viewing by percentage

5. **School Activity Heatmap** (calendar heatmap)
   - Shows which days have most activity
   - Color intensity = activity level

---

### 2.6 Safety Monitoring (`/safety-reports`)
**Purpose**: Track and manage safety incidents across all schools

**Table Columns**:
- School Name
- Report Type (e.g., "Unrecognized Vehicle", "Late Pickup", "Unauthorized Access")
- Reported By (user name)
- Severity (badge: low, medium, high, critical)
- Date (timestamp)
- Status (open, resolved, investigating)

**Filters**:
- By School
- By Date Range
- By Severity Level

**Features**:
- View detailed incident report
- Change status
- Add notes/comments
- Assign to investigator

---

### 2.7 Support Ticket System (`/tickets`)
**Purpose**: Handle school admin support requests

**School Admins Can**:
- Create support ticket
- Attach images to ticket
- Describe issue with title and description
- Track ticket status

**Super Admin Can**:
- View all tickets from all schools
- Reply to tickets
- Change ticket status (open → in_progress → closed)
- Close/resolve tickets

**Ticket Fields**:
- Ticket ID
- School (which school submitted)
- Title (e.g., "Cannot add new teacher")
- Description (detailed issue)
- Status (open, in_progress, closed)
- Created Date
- Last Updated Date
- Reply/Thread (messages)
- Attachments (images/files)

---

### 2.8 System Audit Logs (`/audit-logs`)
**Purpose**: Track all administrative actions for compliance and security

**Table Columns**:
- User (who performed action)
- Action (what they did)
- School (which school was affected)
- Timestamp (when)
- IP Address (optional)
- Details (JSON details of what changed)

**Sample Actions**:
- "Created Premium Plan"
- "Suspended School Account"
- "Updated school geofence radius"
- "Deleted 5 expired staff accounts"
- "Changed subscription tier"

**Use Cases**:
- Security auditing
- Compliance reporting (GDPR, FERPA)
- Troubleshooting
- User activity tracking

---

### 2.9 Global Map View (`/map`)
**Purpose**: Visual representation of all schools and real-time activity

**Features**:
- Interactive SVG/Map canvas showing all schools
- School markers with color coding
  - Green = Active
  - Gray = Inactive
  - Red = Suspended
- Geofence circles around each school
- Pulsing indicators for schools with active pickups
- Hover tooltips showing:
  - School name
  - Total users
  - Active pickups count
- Zoom in/out controls
- Legend showing what colors mean

**Data Displayed**:
- School count at top
- Total active pickups at top
- Real-time update of active pickups per school

---

## 3. COMPLETE API SPECIFICATION

### 3.1 Dashboard Statistics Endpoints

#### GET /api/stats/dashboard
**Purpose**: Get all dashboard metrics for the overview page

**Response** (200 OK):
```json
{
  "totalSchools": 124,
  "totalUsers": 45200,
  "activePickups": 342,
  "totalStudents": 32000,
  "totalParents": 12000,
  "totalStaff": 1200,
  "safetyIncidents": 2,
  "systemHealth": 99.9
}
```

---

#### GET /api/stats/analytics
**Purpose**: Get analytics data for all charts on Dashboard

**Response** (200 OK):
```json
{
  "schoolGrowth": [
    { "name": "Jan", "value": 40 },
    { "name": "Feb", "value": 65 },
    { "name": "Mar", "value": 85 },
    { "name": "Apr", "value": 100 },
    { "name": "May", "value": 124 }
  ],
  "userRegistrations": [
    { "name": "Mon", "value": 120 },
    { "name": "Tue", "value": 150 },
    { "name": "Wed", "value": 180 },
    { "name": "Thu", "value": 140 },
    { "name": "Fri", "value": 200 }
  ],
  "pickupRequests": [
    { "name": "14:00", "value": 50 },
    { "name": "14:30", "value": 150 },
    { "name": "15:00", "value": 800 },
    { "name": "15:30", "value": 300 },
    { "name": "16:00", "value": 50 }
  ],
  "safetyTrend": [
    { "name": "Week 1", "value": 5 },
    { "name": "Week 2", "value": 3 },
    { "name": "Week 3", "value": 4 },
    { "name": "Week 4", "value": 2 }
  ]
}
```

---

### 3.2 Schools Endpoints

#### GET /api/schools
**Purpose**: List all schools

**Query Params**:
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `search` (optional): Search by school name
- `status` (optional): Filter by status (active, inactive, suspended)

**Response** (200 OK):
```json
[
  {
    "id": 1,
    "name": "Lincoln Elementary",
    "address": "123 Main St",
    "city": "Springfield",
    "latitude": 39.7817,
    "longitude": -89.6501,
    "geofenceRadius": 500,
    "planId": 1,
    "status": "active",
    "avatar": "url...",
    "totalUsers": 450,
    "totalStudents": 400,
    "activePickups": 12,
    "createdAt": "2024-01-15T10:30:00Z"
  }
]
```

---

#### GET /api/schools/:id
**Purpose**: Get detailed info for a specific school

**Response** (200 OK):
```json
{
  "id": 1,
  "name": "Lincoln Elementary",
  "address": "123 Main St",
  "city": "Springfield",
  "latitude": 39.7817,
  "longitude": -89.6501,
  "geofenceRadius": 500,
  "planId": 1,
  "status": "active",
  "avatar": "url...",
  "totalUsers": 450,
  "totalStudents": 400,
  "activePickups": 12,
  "createdAt": "2024-01-15T10:30:00Z"
}
```

**Error Responses**:
- 404: School not found

---

#### POST /api/schools
**Purpose**: Create a new school

**Request Body**:
```json
{
  "name": "New Middle School",
  "address": "456 Oak Ave",
  "city": "Shelbyville",
  "latitude": 39.8817,
  "longitude": -89.7501,
  "geofenceRadius": 1000,
  "planId": 2,
  "status": "active",
  "avatar": "url..."
}
```

**Response** (201 Created):
```json
{
  "id": 125,
  "name": "New Middle School",
  "address": "456 Oak Ave",
  "city": "Shelbyville",
  "latitude": 39.8817,
  "longitude": -89.7501,
  "geofenceRadius": 1000,
  "planId": 2,
  "status": "active",
  "avatar": "url...",
  "totalUsers": 0,
  "totalStudents": 0,
  "activePickups": 0,
  "createdAt": "2024-12-15T10:30:00Z"
}
```

---

#### PATCH /api/schools/:id
**Purpose**: Update school details

**Request Body** (partial - only fields to update):
```json
{
  "name": "Updated Name",
  "status": "suspended",
  "geofenceRadius": 750,
  "planId": 3
}
```

**Response** (200 OK):
```json
{
  "id": 1,
  "name": "Updated Name",
  ...
}
```

---

#### DELETE /api/schools/:id
**Purpose**: Delete/remove a school

**Response** (204 No Content)

---

### 3.3 Plans Endpoints

#### GET /api/plans
**Purpose**: List all subscription plans

**Response** (200 OK):
```json
[
  {
    "id": 1,
    "name": "Basic Plan",
    "maxStudents": 500,
    "maxStaff": 50,
    "monthlyPrice": 9900,
    "features": ["Standard Pickups", "Basic Reporting"]
  },
  {
    "id": 2,
    "name": "Premium Plan",
    "maxStudents": 2000,
    "maxStaff": 200,
    "monthlyPrice": 29900,
    "features": ["Advanced Geofencing", "Priority Support", "Custom Analytics"]
  }
]
```

---

#### POST /api/plans
**Purpose**: Create a new subscription plan

**Request Body**:
```json
{
  "name": "Enterprise Plan",
  "maxStudents": 10000,
  "maxStaff": 1000,
  "monthlyPrice": 99900,
  "features": ["Dedicated Support", "Custom Integrations", "Advanced Security"]
}
```

**Response** (201 Created):
```json
{
  "id": 3,
  "name": "Enterprise Plan",
  "maxStudents": 10000,
  "maxStaff": 1000,
  "monthlyPrice": 99900,
  "features": ["Dedicated Support", "Custom Integrations", "Advanced Security"]
}
```

---

#### PATCH /api/plans/:id
**Purpose**: Update a subscription plan

**Request Body** (partial):
```json
{
  "monthlyPrice": 34900,
  "maxStudents": 2500
}
```

**Response** (200 OK):
```json
{
  "id": 2,
  "name": "Premium Plan",
  "maxStudents": 2500,
  "maxStaff": 200,
  "monthlyPrice": 34900,
  "features": [...]
}
```

---

#### DELETE /api/plans/:id
**Purpose**: Delete a subscription plan

**Response** (204 No Content)

---

### 3.4 Safety Reports Endpoints

#### GET /api/safety-reports
**Purpose**: List all safety reports across all schools

**Query Params**:
- `schoolId` (optional): Filter by school
- `severity` (optional): Filter by severity (low, medium, high, critical)
- `status` (optional): Filter by status (open, resolved)
- `dateFrom` (optional): Filter reports from date
- `dateTo` (optional): Filter reports to date

**Response** (200 OK):
```json
[
  {
    "id": 1,
    "schoolId": 1,
    "reportType": "Unrecognized Vehicle",
    "reportedBy": "Jane Doe",
    "severity": "medium",
    "status": "open",
    "createdAt": "2024-12-15T14:30:00Z"
  }
]
```

---

### 3.5 Support Tickets Endpoints

#### GET /api/tickets
**Purpose**: List all support tickets from all schools

**Query Params**:
- `schoolId` (optional): Filter by school
- `status` (optional): Filter by status (open, in_progress, closed)
- `page` (optional): Pagination

**Response** (200 OK):
```json
[
  {
    "id": 1,
    "schoolId": 1,
    "title": "Cannot add new teacher",
    "description": "Getting an error when trying to add Mrs. Davis.",
    "status": "open",
    "createdAt": "2024-12-15T10:00:00Z"
  }
]
```

---

#### PATCH /api/tickets/:id
**Purpose**: Update ticket status or add reply

**Request Body**:
```json
{
  "status": "in_progress",
  "reply": "We're looking into this now..."
}
```

**Response** (200 OK):
```json
{
  "id": 1,
  "schoolId": 1,
  "title": "Cannot add new teacher",
  "description": "Getting an error when trying to add Mrs. Davis.",
  "status": "in_progress",
  "createdAt": "2024-12-15T10:00:00Z"
}
```

---

### 3.6 Audit Logs Endpoints

#### GET /api/audit-logs
**Purpose**: List all audit logs

**Query Params**:
- `schoolId` (optional): Filter by school
- `userId` (optional): Filter by user
- `action` (optional): Filter by action type
- `dateFrom` (optional): Filter from date
- `dateTo` (optional): Filter to date

**Response** (200 OK):
```json
[
  {
    "id": 1,
    "userId": 1,
    "action": "Created Premium Plan",
    "schoolId": null,
    "createdAt": "2024-12-15T09:30:00Z"
  },
  {
    "id": 2,
    "userId": 1,
    "action": "Suspended School Account",
    "schoolId": 1,
    "createdAt": "2024-12-15T10:00:00Z"
  }
]
```

---

## 4. DATA MODELS

### School
```
id: integer (primary key)
name: string
address: string
city: string
latitude: float
longitude: float
geofenceRadius: integer (meters)
planId: integer (foreign key to plans)
status: enum (active, inactive, suspended)
avatar: string (url)
totalUsers: integer
totalStudents: integer
activePickups: integer
createdAt: timestamp
```

### Plan
```
id: integer (primary key)
name: string
maxStudents: integer
maxStaff: integer
monthlyPrice: integer (cents)
features: json array (strings)
```

### SafetyReport
```
id: integer (primary key)
schoolId: integer (foreign key)
reportType: string
reportedBy: string
severity: enum (low, medium, high, critical)
status: enum (open, resolved, investigating)
createdAt: timestamp
```

### SupportTicket
```
id: integer (primary key)
schoolId: integer (foreign key)
title: string
description: string
status: enum (open, in_progress, closed)
createdAt: timestamp
lastUpdatedAt: timestamp
```

### AuditLog
```
id: integer (primary key)
userId: integer (optional)
action: string
schoolId: integer (optional, foreign key)
createdAt: timestamp
```

---

## 5. KEY WORKFLOWS

### Workflow 1: Adding a New School
1. Super Admin clicks "Create School" button
2. Form opens with school details
3. Admin fills: name, address, city, lat/long, geofence radius, selects plan
4. Frontend validates form data
5. POST /api/schools request sent with school data
6. Backend validates, creates school in database
7. Returns new school object with ID
8. UI updates school list and dashboard stats
9. Success toast notification shown

### Workflow 2: Monitoring School Health
1. Super Admin opens School Details page for a school
2. Frontend fetches school stats via multiple API calls
3. Charts and metrics populate showing:
   - Usage patterns
   - User growth
   - Pickup trends
   - Safety incidents
4. Super Admin can drill down into specific areas
5. Can take action (suspend school, change plan, etc.)

### Workflow 3: Handling Support Ticket
1. School admin submits support ticket
2. Ticket appears in Super Admin's /tickets page
3. Super Admin reads ticket, adds notes/reply
4. Calls PATCH /api/tickets/:id to update status
5. School admin gets notification of reply
6. When resolved, Super Admin closes ticket
7. Audit log records action

### Workflow 4: Responding to Safety Incident
1. Safety report created by school staff
2. Super Admin sees in /safety-reports
3. Can filter by severity to prioritize critical incidents
4. Reviews report details
5. Investigates through audit logs
6. Updates status (resolved/investigating)
7. May contact school via support ticket

### Workflow 5: Planning Growth
1. Super Admin reviews /analytics page
2. Sees growth trends, user registrations, pickup patterns
3. Uses data to forecast server needs
4. May adjust plan pricing based on usage
5. Plans for new features based on usage patterns

---

## 6. INTEGRATION POINTS

### External Systems to Integrate (Future)
1. **Payment Processing** (Stripe)
   - Charge monthly subscription fees
   - Handle failed payments
   - Manage invoices

2. **Email Service** (SendGrid/AWS SES)
   - Send support ticket replies
   - Send safety alerts
   - Send system notifications

3. **SMS Service** (Twilio)
   - Send critical alerts via SMS
   - Send verification codes

4. **Map Service** (Google Maps/Mapbox)
   - Get coordinates from addresses
   - Display interactive maps
   - Calculate geofence overlaps

5. **Analytics** (Mixpanel/Segment)
   - Track user behavior
   - Monitor system performance
   - Generate usage reports

---

## 7. AUTHENTICATION & AUTHORIZATION

### Super Admin Authentication
- Email/Password login OR OAuth (GitHub/Google)
- Session-based or JWT token
- Multi-factor authentication (2FA) recommended

### Permissions
- Super Admin: Full access to all endpoints
- School Admin: Access only to their school's data
- Staff: Read-only access to pickup data
- Parent: Limited access to their child's pickup status

---

## 8. SCALABILITY CONSIDERATIONS

### Database
- Use read replicas for analytics queries
- Index on (schoolId, createdAt) for filtering
- Archive old logs (> 1 year) to separate table

### Frontend
- Virtual scrolling for large tables (1000+ rows)
- Lazy load charts and metrics
- Cache frequently accessed data with React Query

### Backend
- Implement rate limiting per school
- Cache dashboard stats (5 min TTL)
- Use background jobs for heavy analytics
- WebSocket for real-time updates (optional)

---

## 9. COMPLIANCE & SECURITY

### Data Protection
- Encrypt sensitive data at rest
- Use HTTPS/TLS for all connections
- Implement GDPR data deletion workflows
- FERPA compliance for student data

### Audit
- Log all admin actions (already in audit logs)
- Track data access
- Maintain 7-year audit trail (regulatory requirement)

### Backups
- Daily automated backups
- 30-day backup retention
- Test restore procedures monthly

---

## 10. DEPLOYMENT CHECKLIST

- [ ] Database migrations tested
- [ ] All endpoints tested with real data
- [ ] Error handling implemented
- [ ] Rate limiting configured
- [ ] SSL certificates installed
- [ ] API documentation generated
- [ ] Load testing performed
- [ ] Security audit completed
- [ ] Backup systems tested
- [ ] Monitoring and alerting configured
