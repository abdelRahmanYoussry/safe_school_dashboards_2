# API Contract: Authentication

## Login
**Endpoint**: `POST /api/login`
**Description**: Authenticate user and establish session.

### Request
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `email` | String | Yes | User's email |
| `password` | String | Yes | User's password |

### Response (200 OK)
```json
{
  "id": 1,
  "email": "admin@school.com",
  "role": "super_admin",
  "schoolId": null
}
```

### Error Responses
- **401 Unauthorized**: `{ "message": "Invalid email or password" }`
- **400 Bad Request**: `{ "message": "Missing email or password" }`

---

## Logout
**Endpoint**: `POST /api/logout`
**Description**: Destroy the current session.

### Request
No body required.

### Response (204 No Content)
Successfully logged out.

---

## Get Current User
**Endpoint**: `GET /api/user`
**Description**: Retrieve the profile of the currently logged-in user.

### Response (200 OK)
```json
{
  "id": 1,
  "email": "admin@school.com",
  "role": "super_admin",
  "schoolId": null
}
```

### Response (401 Unauthorized)
`{ "message": "Not authenticated" }`
