# API Design Guidelines

All backend APIs must follow these rules.

---

# Base API Structure
`/api/v1/`
*Examples*: `/api/v1/schools`, `/api/v1/students`, `/api/v1/pickups`

---

# REST Rules
- **GET**: Retrieve data
- **POST**: Create resource
- **PUT**: Update resource
- **DELETE**: Remove resource

---

# Response Format
**Success Response**
```json
{
  "success": true,
  "data": {},
  "message": "optional"
}
```

**Error Response**
```json
{
  "success": false,
  "error": "ERROR_CODE",
  "message": "Human readable message"
}
```

---

# Pagination Standard
`GET /students?page=1&limit=20`

**Response**
```json
{
 "data": [],
 "meta": {
   "page": 1,
   "limit": 20,
   "total": 200
 }
}
```

---

# Authentication
All protected APIs require JWT.
**Header**: `Authorization: Bearer TOKEN`

---

# Role Permissions
Permissions must be validated on every endpoint.
*Examples*:
- `create_school` → `SUPER_ADMIN`
- `create_student` → `SCHOOL_ADMIN`
- `verify_pickup` → `SECURITY`
- `create_activity` → `TEACHER`

---

# DTO Validation
Every endpoint must validate input. No raw request body allowed.
- email/phone format
- string length
- required fields

---

# API Documentation
Swagger documentation is mandatory. Must include summary, request body, response schema, and permission required.

---

# Error Codes
Standard codes: `INVALID_TOKEN`, `PERMISSION_DENIED`, `TENANT_ACCESS_DENIED`, `RESOURCE_NOT_FOUND`, `VALIDATION_ERROR`.

---

# Audit Logging
Mandatory for: Create/Delete school, User creation, Pickup verification, Delegation approval, Safety report creation.
