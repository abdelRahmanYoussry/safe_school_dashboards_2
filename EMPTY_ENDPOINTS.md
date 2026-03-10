# Empty Endpoints Documentation

These endpoints currently return empty data (`[]` or zeros) because your database is not yet populated. You can add data to these tables to see the dashboard come to life.

## 1. Subcription Plans
**Endpoint:** `GET /api/plans`
**Table:** `plans`

| Field | Type | Description |
|---|---|---|
| `name` | String | Name of the plan (e.g., "Silver", "Gold") |
| `maxStudents` | Integer | Max students allowed |
| `maxStaff` | Integer | Max staff allowed |
| `monthlyPrice` | Integer | Price in cents (e.g., 5000 for $50.00) |
| `features` | JSON Array | List of strings (e.g., `["Safety Tracking", "Parent App"]`) |

### Example Entry (POST /api/plans)
```json
{
  "name": "Gold Tier",
  "maxStudents": 500,
  "maxStaff": 50,
  "monthlyPrice": 9900,
  "features": ["Advanced Safety", "Priority Support", "Unlimited Pickups"]
}
```

---

## 2. Schools
**Endpoint:** `GET /api/schools`
**Table:** `schools`

| Field | Type | Description |
|---|---|---|
| `name` | String | School name |
| `address` | String | Full address |
| `city` | String | City |
| `latitude` | Double | GPS Latitude |
| `longitude` | Double | GPS Longitude |
| `geofenceRadius` | Integer | Radius in meters |
| `planId` | Integer | ID of a row from `plans` table |
| `status` | String | "active", "inactive", or "suspended" |

### Example Entry (POST /api/schools)
```json
{
  "name": "Future Academy",
  "address": "123 Education St",
  "city": "Dubai",
  "latitude": 25.2048,
  "longitude": 55.2708,
  "geofenceRadius": 200,
  "status": "active"
}
```

---

## 3. Support Tickets
**Endpoint:** `GET /api/tickets`
**Table:** `support_tickets`

| Field | Type | Description |
|---|---|---|
| `schoolId` | Integer | Reference to school ID |
| `title` | String | Ticket subject |
| `description` | String | Full issue details |
| `status` | String | "open", "in_progress", or "closed" |

---

## 4. Safety Reports
**Endpoint:** `GET /api/safety-reports`
**Table:** `safety_reports`

| Field | Type | Description |
|---|---|---|
| `schoolId` | Integer | Reference to school ID |
| `title` | String | Incident title |
| `body` | String | Detailed description |
| `severity` | String | "LOW", "MEDIUM", "HIGH", "CRITICAL" |
| `status` | String | "open" or "resolved" |

---

## 5. Audit Logs
**Endpoint:** `GET /api/audit-logs`
**Table:** `audit_logs`

| Field | Type | Description |
|---|---|---|
| `userId` | Integer | User who performed action |
| `action` | String | Description of action |
| `schoolId` | Integer | Related school |
