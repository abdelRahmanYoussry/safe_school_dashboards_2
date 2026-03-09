# Additional APIs Needed for Full Production System

## Overview
This document outlines the ADDITIONAL APIs needed beyond the core Super Admin Dashboard to create a complete, production-ready Safe School SaaS platform.

---

## SECTION 1: SCHOOL ADMIN APIs (Tenant-Level)

### 1.1 School Account Management

#### POST /api/schools/:schoolId/admin/profile
**Purpose**: School admin updates their profile

**Request Body**:
```json
{
  "firstName": "John",
  "lastName": "Smith",
  "email": "john@school.edu",
  "phone": "+1-555-0123",
  "jobTitle": "Principal"
}
```

**Response** (200 OK):
```json
{
  "id": "admin-1",
  "schoolId": 1,
  "firstName": "John",
  "lastName": "Smith",
  "email": "john@school.edu",
  "phone": "+1-555-0123",
  "jobTitle": "Principal"
}
```

---

#### GET /api/schools/:schoolId/billing
**Purpose**: School admin views their billing & subscription info

**Response** (200 OK):
```json
{
  "schoolId": 1,
  "currentPlan": "Premium",
  "monthlyPrice": 29900,
  "billingCycle": "Jan 15 - Feb 15",
  "nextBillingDate": "2025-01-15",
  "paymentMethod": "Visa ending in 4242",
  "invoices": [
    {
      "id": "inv-001",
      "date": "2024-12-15",
      "amount": 29900,
      "status": "paid",
      "pdfUrl": "..."
    }
  ],
  "usage": {
    "studentsUsed": 380,
    "studentsLimit": 2000,
    "staffUsed": 45,
    "staffLimit": 200
  }
}
```

---

#### PATCH /api/schools/:schoolId/upgrade-plan
**Purpose**: School admin upgrades their subscription plan

**Request Body**:
```json
{
  "newPlanId": 3,
  "billingDate": "immediate" // or "nextCycle"
}
```

**Response** (200 OK):
```json
{
  "schoolId": 1,
  "previousPlan": "Premium",
  "newPlan": "Enterprise",
  "effectiveDate": "2024-12-15T00:00:00Z",
  "newMonthlyPrice": 99900,
  "proRatedAmount": 2400 // Amount owed/credited
}
```

---

### 1.2 School Staff Management

#### GET /api/schools/:schoolId/staff
**Purpose**: Get all staff members for a school

**Query Params**:
- `role` (optional): Filter by role (admin, teacher, office_staff, security)
- `status` (optional): Filter by status (active, inactive)

**Response** (200 OK):
```json
[
  {
    "id": "staff-1",
    "schoolId": 1,
    "firstName": "Sarah",
    "lastName": "Johnson",
    "email": "sarah@school.edu",
    "role": "teacher",
    "phoneNumber": "+1-555-0456",
    "status": "active",
    "createdAt": "2024-01-10T10:00:00Z",
    "lastActive": "2024-12-15T14:30:00Z"
  }
]
```

---

#### POST /api/schools/:schoolId/staff
**Purpose**: Add new staff member

**Request Body**:
```json
{
  "firstName": "Mike",
  "lastName": "Davis",
  "email": "mike@school.edu",
  "role": "security",
  "phoneNumber": "+1-555-0789"
}
```

**Response** (201 Created):
```json
{
  "id": "staff-2",
  "schoolId": 1,
  "firstName": "Mike",
  "lastName": "Davis",
  "email": "mike@school.edu",
  "role": "security",
  "phoneNumber": "+1-555-0789",
  "status": "active",
  "createdAt": "2024-12-15T15:00:00Z"
}
```

---

#### DELETE /api/schools/:schoolId/staff/:staffId
**Purpose**: Remove staff member

**Response** (204 No Content)

---

### 1.3 School Students Management

#### GET /api/schools/:schoolId/students
**Purpose**: Get all students in a school

**Query Params**:
- `grade` (optional): Filter by grade
- `status` (optional): Filter by status (active, graduated, transferred)

**Response** (200 OK):
```json
[
  {
    "id": "student-1",
    "schoolId": 1,
    "firstName": "Emma",
    "lastName": "Wilson",
    "grade": "5",
    "dateOfBirth": "2013-05-15",
    "status": "active",
    "primaryAuthorizedParent": "parent-1",
    "authorizedPickupPersons": ["parent-1", "parent-2"],
    "medicalNotes": "Peanut allergy",
    "createdAt": "2024-01-20T10:00:00Z"
  }
]
```

---

#### POST /api/schools/:schoolId/students
**Purpose**: Add new student

**Request Body**:
```json
{
  "firstName": "Liam",
  "lastName": "Brown",
  "grade": "3",
  "dateOfBirth": "2015-08-10",
  "parentIds": ["parent-1", "parent-2"],
  "medicalNotes": "Asthma - carries inhaler"
}
```

**Response** (201 Created):
```json
{
  "id": "student-2",
  "schoolId": 1,
  "firstName": "Liam",
  "lastName": "Brown",
  "grade": "3",
  "dateOfBirth": "2015-08-10",
  "status": "active",
  "primaryAuthorizedParent": "parent-1",
  "authorizedPickupPersons": ["parent-1", "parent-2"],
  "medicalNotes": "Asthma - carries inhaler",
  "createdAt": "2024-12-15T15:30:00Z"
}
```

---

### 1.4 School Parents/Guardians Management

#### GET /api/schools/:schoolId/parents
**Purpose**: Get all parents/guardians in a school

**Response** (200 OK):
```json
[
  {
    "id": "parent-1",
    "schoolId": 1,
    "firstName": "Robert",
    "lastName": "Wilson",
    "relationship": "father",
    "email": "robert.wilson@email.com",
    "phoneNumber": "+1-555-0111",
    "vehicleInfo": {
      "make": "Toyota",
      "model": "Camry",
      "color": "Silver",
      "licensePlate": "ABC123"
    },
    "status": "active",
    "authorizedChildren": ["student-1"],
    "createdAt": "2024-01-20T10:00:00Z"
  }
]
```

---

#### POST /api/schools/:schoolId/parents
**Purpose**: Add new parent/guardian

**Request Body**:
```json
{
  "firstName": "Jennifer",
  "lastName": "Smith",
  "relationship": "mother",
  "email": "jennifer.smith@email.com",
  "phoneNumber": "+1-555-0222",
  "vehicleInfo": {
    "make": "Honda",
    "model": "CR-V",
    "color": "Black",
    "licensePlate": "XYZ789"
  },
  "authorizedChildren": ["student-1"]
}
```

**Response** (201 Created):
```json
{
  "id": "parent-2",
  "schoolId": 1,
  "firstName": "Jennifer",
  "lastName": "Smith",
  "relationship": "mother",
  "email": "jennifer.smith@email.com",
  "phoneNumber": "+1-555-0222",
  "vehicleInfo": {...},
  "status": "active",
  "authorizedChildren": ["student-1"],
  "createdAt": "2024-12-15T16:00:00Z"
}
```

---

### 1.5 Pickup Management

#### GET /api/schools/:schoolId/pickups/today
**Purpose**: Get all pickups scheduled for today

**Response** (200 OK):
```json
{
  "date": "2024-12-15",
  "totalScheduled": 45,
  "totalCompleted": 12,
  "totalPending": 33,
  "pickups": [
    {
      "id": "pickup-1",
      "studentId": "student-1",
      "studentName": "Emma Wilson",
      "authorizedParentId": "parent-1",
      "parentName": "Robert Wilson",
      "licensePlate": "ABC123",
      "scheduledTime": "15:00",
      "actualTime": "15:05",
      "status": "completed",
      "notes": "Student was ready on time"
    },
    {
      "id": "pickup-2",
      "studentId": "student-2",
      "studentName": "Liam Brown",
      "authorizedParentId": "parent-1",
      "parentName": "Robert Wilson",
      "licensePlate": "ABC123",
      "scheduledTime": "15:15",
      "actualTime": null,
      "status": "pending",
      "notes": ""
    }
  ]
}
```

---

#### POST /api/schools/:schoolId/pickups
**Purpose**: Record a pickup completion (staff marks student as picked up)

**Request Body**:
```json
{
  "studentId": "student-1",
  "parentId": "parent-1",
  "actualTime": "2024-12-15T15:05:00Z",
  "vehicleIdentified": true,
  "licensePlate": "ABC123",
  "notes": "Student was waiting at gate"
}
```

**Response** (201 Created):
```json
{
  "id": "pickup-1",
  "schoolId": 1,
  "studentId": "student-1",
  "parentId": "parent-1",
  "actualTime": "2024-12-15T15:05:00Z",
  "status": "completed",
  "vehicleIdentified": true,
  "licensePlate": "ABC123",
  "notes": "Student was waiting at gate"
}
```

---

### 1.6 School Reports & Analytics

#### GET /api/schools/:schoolId/analytics/pickups
**Purpose**: Get pickup analytics for a school

**Query Params**:
- `dateFrom`: Start date
- `dateTo`: End date

**Response** (200 OK):
```json
{
  "schoolId": 1,
  "period": {
    "from": "2024-12-01",
    "to": "2024-12-31"
  },
  "summary": {
    "totalPickups": 450,
    "averagePickupsPerDay": 18,
    "latePickups": 12,
    "unauthorizedAttempts": 2,
    "averagePickupDuration": "8 minutes"
  },
  "trends": [
    {
      "date": "2024-12-01",
      "pickups": 18,
      "avgDuration": 7.5
    }
  ],
  "peakTimes": [
    {
      "time": "15:00",
      "frequency": 45
    }
  ]
}
```

---

#### GET /api/schools/:schoolId/analytics/safety
**Purpose**: Get safety analytics for a school

**Response** (200 OK):
```json
{
  "schoolId": 1,
  "period": "last_30_days",
  "incidents": {
    "unrecognizedVehicles": 2,
    "unauthorized_access_attempts": 1,
    "late_pickups": 12,
    "missing_students": 0
  },
  "timeline": [
    {
      "date": "2024-12-14",
      "incident": "Unrecognized vehicle - license checked",
      "severity": "low",
      "resolved": true
    }
  ]
}
```

---

## SECTION 2: PARENT/GUARDIAN APIs

### 2.1 Parent Authentication

#### POST /api/auth/parent/register
**Purpose**: Parent creates account

**Request Body**:
```json
{
  "firstName": "Robert",
  "lastName": "Wilson",
  "email": "robert.wilson@email.com",
  "password": "SecurePass123!",
  "phoneNumber": "+1-555-0111"
}
```

**Response** (201 Created):
```json
{
  "id": "parent-1",
  "firstName": "Robert",
  "lastName": "Wilson",
  "email": "robert.wilson@email.com",
  "token": "jwt_token_here"
}
```

---

#### POST /api/auth/parent/login
**Purpose**: Parent logs in

**Request Body**:
```json
{
  "email": "robert.wilson@email.com",
  "password": "SecurePass123!"
}
```

**Response** (200 OK):
```json
{
  "token": "jwt_token_here",
  "user": {
    "id": "parent-1",
    "firstName": "Robert",
    "lastName": "Wilson",
    "email": "robert.wilson@email.com"
  }
}
```

---

### 2.2 Parent Pickup Requests

#### GET /api/parents/:parentId/children
**Purpose**: Get all children associated with this parent

**Response** (200 OK):
```json
[
  {
    "id": "student-1",
    "firstName": "Emma",
    "lastName": "Wilson",
    "grade": "5",
    "school": {
      "id": 1,
      "name": "Lincoln Elementary"
    },
    "status": "active"
  }
]
```

---

#### POST /api/parents/:parentId/pickup-requests
**Purpose**: Parent requests pickup for a child

**Request Body**:
```json
{
  "studentId": "student-1",
  "requestedTime": "2024-12-15T15:00:00Z",
  "estimatedArrivalTime": "2024-12-15T15:10:00Z",
  "driverInfo": {
    "name": "Robert Wilson",
    "vehicleInfo": {
      "make": "Toyota",
      "model": "Camry",
      "color": "Silver",
      "licensePlate": "ABC123"
    }
  }
}
```

**Response** (201 Created):
```json
{
  "id": "request-1",
  "studentId": "student-1",
  "parentId": "parent-1",
  "requestedTime": "2024-12-15T15:00:00Z",
  "estimatedArrivalTime": "2024-12-15T15:10:00Z",
  "status": "pending",
  "approvalStatus": "pending",
  "createdAt": "2024-12-15T14:58:00Z"
}
```

---

#### GET /api/parents/:parentId/pickup-requests
**Purpose**: Get all pickup requests for a parent

**Query Params**:
- `status` (optional): pending, approved, completed, cancelled
- `dateFrom` (optional)
- `dateTo` (optional)

**Response** (200 OK):
```json
[
  {
    "id": "request-1",
    "studentId": "student-1",
    "studentName": "Emma Wilson",
    "requestedTime": "2024-12-15T15:00:00Z",
    "estimatedArrivalTime": "2024-12-15T15:10:00Z",
    "status": "completed",
    "approvalStatus": "approved",
    "actualPickupTime": "2024-12-15T15:08:00Z",
    "staffVerified": true,
    "verifiedBy": "Sarah Johnson"
  }
]
```

---

### 2.3 Parent Notifications

#### GET /api/parents/:parentId/notifications
**Purpose**: Get notifications for parent

**Response** (200 OK):
```json
[
  {
    "id": "notif-1",
    "type": "pickup_completed",
    "title": "Emma picked up",
    "message": "Emma Wilson was picked up at 15:08 by Robert Wilson",
    "timestamp": "2024-12-15T15:08:00Z",
    "read": false
  },
  {
    "id": "notif-2",
    "type": "safety_alert",
    "title": "Unusual pickup attempt",
    "message": "An unrecognized vehicle attempted pickup. Staff verified parent identity.",
    "timestamp": "2024-12-15T14:30:00Z",
    "read": true
  }
]
```

---

#### PATCH /api/parents/:parentId/notifications/:notificationId/read
**Purpose**: Mark notification as read

**Response** (200 OK):
```json
{
  "id": "notif-1",
  "read": true
}
```

---

## SECTION 3: STAFF/SECURITY APIs

### 3.1 Staff Authentication

#### POST /api/auth/staff/login
**Purpose**: Staff member logs in

**Request Body**:
```json
{
  "email": "sarah@school.edu",
  "password": "StaffPass123!",
  "schoolId": 1
}
```

**Response** (200 OK):
```json
{
  "token": "jwt_token_here",
  "user": {
    "id": "staff-1",
    "firstName": "Sarah",
    "lastName": "Johnson",
    "role": "teacher",
    "schoolId": 1
  }
}
```

---

### 3.2 Staff Pickup Verification

#### GET /api/schools/:schoolId/staff/:staffId/pending-pickups
**Purpose**: Get all pending pickups that need verification

**Response** (200 OK):
```json
{
  "schoolId": 1,
  "staffId": "staff-1",
  "pendingPickups": [
    {
      "id": "pickup-2",
      "studentId": "student-2",
      "studentName": "Liam Brown",
      "grade": "3",
      "parentName": "Robert Wilson",
      "vehicleInfo": {
        "make": "Toyota",
        "model": "Camry",
        "licensePlate": "ABC123"
      },
      "requestTime": "2024-12-15T15:08:00Z",
      "estimatedArrival": "2024-12-15T15:15:00Z"
    }
  ]
}
```

---

#### POST /api/schools/:schoolId/verify-pickup
**Purpose**: Staff verifies and completes a pickup

**Request Body**:
```json
{
  "pickupId": "pickup-2",
  "studentId": "student-2",
  "parentId": "parent-1",
  "verificationStatus": "approved",
  "identityVerified": true,
  "vehicleVerified": true,
  "licensePlateMatched": true,
  "notes": "Parent ID checked, vehicle matches registration"
}
```

**Response** (200 OK):
```json
{
  "id": "pickup-2",
  "status": "completed",
  "verifiedAt": "2024-12-15T15:15:00Z",
  "verifiedBy": "Sarah Johnson",
  "verificationDetails": {
    "identityVerified": true,
    "vehicleVerified": true,
    "licensePlateMatched": true
  }
}
```

---

### 3.3 Staff Incident Reporting

#### POST /api/schools/:schoolId/incidents
**Purpose**: Staff reports a safety incident

**Request Body**:
```json
{
  "incidentType": "unrecognized_vehicle",
  "severity": "medium",
  "description": "Unknown vehicle attempted to pick up student. License plate checked. Vehicle owner called.",
  "studentInvolved": "student-1",
  "witnesses": "3 staff members",
  "actionTaken": "Vehicle information logged, parents notified",
  "attachments": ["photo_url_1", "photo_url_2"]
}
```

**Response** (201 Created):
```json
{
  "id": "incident-1",
  "schoolId": 1,
  "incidentType": "unrecognized_vehicle",
  "severity": "medium",
  "status": "open",
  "reportedBy": "Sarah Johnson",
  "createdAt": "2024-12-15T14:30:00Z"
}
```

---

## SECTION 4: SYSTEM & INFRASTRUCTURE APIs

### 4.1 Authentication & Authorization

#### POST /api/auth/login (Super Admin)
**Purpose**: Super admin login

**Request Body**:
```json
{
  "email": "admin@safeschool.com",
  "password": "AdminPass123!"
}
```

**Response** (200 OK):
```json
{
  "token": "jwt_token_here",
  "user": {
    "id": "admin-1",
    "email": "admin@safeschool.com",
    "role": "super_admin"
  }
}
```

---

#### POST /api/auth/logout
**Purpose**: Logout (invalidate token)

**Response** (200 OK):
```json
{
  "message": "Successfully logged out"
}
```

---

#### POST /api/auth/refresh-token
**Purpose**: Refresh JWT token

**Response** (200 OK):
```json
{
  "token": "new_jwt_token_here"
}
```

---

### 4.2 User Management (Super Admin)

#### GET /api/admin/users
**Purpose**: List all users in system (super admin only)

**Query Params**:
- `role` (optional): super_admin, school_admin, staff, parent
- `status` (optional): active, inactive

**Response** (200 OK):
```json
[
  {
    "id": "user-1",
    "email": "admin@safeschool.com",
    "role": "super_admin",
    "status": "active",
    "lastLogin": "2024-12-15T10:00:00Z"
  }
]
```

---

#### POST /api/admin/users
**Purpose**: Create new admin user

**Request Body**:
```json
{
  "email": "newadmin@safeschool.com",
  "password": "Password123!",
  "role": "super_admin",
  "firstName": "Admin",
  "lastName": "User"
}
```

**Response** (201 Created):
```json
{
  "id": "user-2",
  "email": "newadmin@safeschool.com",
  "role": "super_admin",
  "status": "active"
}
```

---

### 4.3 System Configuration

#### GET /api/admin/system-config
**Purpose**: Get system configuration settings

**Response** (200 OK):
```json
{
  "appName": "Safe School",
  "version": "1.0.0",
  "timezone": "America/Chicago",
  "defaultLanguage": "en",
  "emailNotificationsEnabled": true,
  "smsNotificationsEnabled": true,
  "maintenanceMode": false,
  "maxUploadSize": 10485760,
  "sessionTimeout": 3600,
  "passwordPolicy": {
    "minLength": 8,
    "requireNumbers": true,
    "requireSpecialChars": true,
    "expiryDays": 90
  }
}
```

---

#### PATCH /api/admin/system-config
**Purpose**: Update system configuration

**Request Body** (partial):
```json
{
  "timezone": "America/New_York",
  "maintenanceMode": false
}
```

**Response** (200 OK):
```json
{
  "timezone": "America/New_York",
  "maintenanceMode": false
}
```

---

### 4.4 System Monitoring

#### GET /api/admin/health
**Purpose**: Check system health status

**Response** (200 OK):
```json
{
  "status": "healthy",
  "database": "connected",
  "api": "operational",
  "uptime": "45 days",
  "responseTime": "45ms",
  "errorRate": 0.01,
  "activeSessions": 234
}
```

---

#### GET /api/admin/logs
**Purpose**: Get system logs

**Query Params**:
- `level` (optional): ERROR, WARN, INFO, DEBUG
- `service` (optional): which service
- `limit` (optional): number of logs to return

**Response** (200 OK):
```json
[
  {
    "timestamp": "2024-12-15T15:30:00Z",
    "level": "ERROR",
    "service": "auth",
    "message": "Failed login attempt for user@email.com",
    "details": "Invalid password"
  }
]
```

---

### 4.5 Webhooks (for integrations)

#### POST /api/webhooks/subscribe
**Purpose**: Subscribe to system events

**Request Body**:
```json
{
  "event": "school.created|pickup.completed|incident.reported|payment.received",
  "webhookUrl": "https://your-server.com/webhook",
  "secret": "webhook_secret_key"
}
```

**Response** (201 Created):
```json
{
  "id": "webhook-1",
  "event": "school.created",
  "webhookUrl": "https://your-server.com/webhook",
  "active": true,
  "createdAt": "2024-12-15T15:35:00Z"
}
```

---

#### GET /api/webhooks
**Purpose**: List all active webhooks

**Response** (200 OK):
```json
[
  {
    "id": "webhook-1",
    "event": "school.created",
    "webhookUrl": "https://your-server.com/webhook",
    "active": true,
    "failureCount": 0
  }
]
```

---

### 4.6 Email & Notifications

#### POST /api/notifications/send-email
**Purpose**: Send email notification (internal use)

**Request Body**:
```json
{
  "to": "school@email.com",
  "templateId": "school_alert",
  "subject": "Important: Safety Incident Report",
  "variables": {
    "schoolName": "Lincoln Elementary",
    "incidentType": "Unrecognized Vehicle",
    "severity": "Medium"
  }
}
```

**Response** (202 Accepted):
```json
{
  "messageId": "email-123",
  "status": "queued",
  "sentAt": "2024-12-15T15:36:00Z"
}
```

---

#### POST /api/notifications/send-sms
**Purpose**: Send SMS notification (internal use)

**Request Body**:
```json
{
  "to": "+1-555-0123",
  "message": "Your child Emma has been picked up. Parent: Robert Wilson",
  "type": "pickup_notification"
}
```

**Response** (202 Accepted):
```json
{
  "messageId": "sms-456",
  "status": "queued",
  "sentAt": "2024-12-15T15:37:00Z"
}
```

---

## SECTION 5: REAL-TIME APIs (WebSocket)

### 5.1 WebSocket Connection

**Connect to**: `wss://api.safeschool.com/ws?token=jwt_token&schoolId=1`

**Events School Admin Can Send**:
```
- {type: "ping"} - Keep connection alive
- {type: "subscribe", channel: "pickups"} - Subscribe to pickup updates
- {type: "subscribe", channel: "incidents"} - Subscribe to incident alerts
```

**Events Server Broadcasts**:
```
- {type: "pickup_started", data: {...}}
- {type: "pickup_completed", data: {...}}
- {type: "incident_reported", data: {...}}
- {type: "user_online", data: {...}}
- {type: "system_alert", data: {...}}
```

---

## SECTION 6: FILE UPLOAD APIs

### 6.1 Upload Avatar/Logo

#### POST /api/schools/:schoolId/upload-avatar
**Purpose**: Upload school avatar/logo

**Content-Type**: multipart/form-data

**Form Data**:
- `file`: Image file (PNG, JPG, WebP - max 5MB)

**Response** (200 OK):
```json
{
  "url": "https://cdn.safeschool.com/avatars/school-1-xyz.png",
  "size": 125000,
  "filename": "school-logo.png"
}
```

---

### 6.2 Upload Incident Evidence

#### POST /api/schools/:schoolId/incidents/:incidentId/upload-evidence
**Purpose**: Upload photos/videos as evidence

**Form Data**:
- `files[]`: Image/video files (max 50MB total)

**Response** (200 OK):
```json
{
  "files": [
    {
      "url": "https://cdn.safeschool.com/evidence/incident-1-photo1.jpg",
      "type": "image",
      "size": 2500000
    }
  ]
}
```

---

## SUMMARY

### Total API Endpoints by Category

1. **Dashboard & Stats**: 2 endpoints
2. **Schools**: 5 endpoints
3. **Plans**: 4 endpoints
4. **Safety Reports**: 1 endpoint
5. **Support Tickets**: 2 endpoints
6. **Audit Logs**: 1 endpoint
7. **School Admin APIs**: 20+ endpoints
8. **Parent APIs**: 8+ endpoints
9. **Staff APIs**: 5+ endpoints
10. **System Admin APIs**: 15+ endpoints
11. **Authentication**: 4 endpoints
12. **Real-Time (WebSocket)**: 2-way communication
13. **File Upload**: 2 endpoints

**TOTAL: ~70+ API endpoints for full production system**

### Priority Implementation Order

1. **Phase 1** (MVP - Currently Built):
   - Dashboard stats
   - Schools CRUD
   - Plans CRUD
   - Safety reports
   - Support tickets
   - Audit logs

2. **Phase 2** (School Admin Features):
   - Staff management
   - Student management
   - Parent/guardian management
   - Pickup management
   - School analytics

3. **Phase 3** (Parent & Staff Features):
   - Parent authentication & pickup requests
   - Staff authentication & verification
   - Incident reporting
   - Notifications

4. **Phase 4** (Advanced & Integrations):
   - Payment processing (Stripe)
   - Email/SMS notifications
   - WebSocket real-time updates
   - File uploads
   - Webhook system
