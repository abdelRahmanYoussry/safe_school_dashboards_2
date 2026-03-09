# Data Model: Admin Login System

## Entities

### User
Represents an authenticated person (Super Admin or School Admin).

| Field | Type | Description | Constraints |
|-------|------|-------------|-------------|
| `id` | Serial | Primary Key | Not Null |
| `email` | Text | Unique identifier | Not Null, Unique |
| `password` | Text | Hashed password (scrypt) | Not Null |
| `role` | Text | User role | 'super_admin' or 'school_admin' |
| `school_id` | Integer | Associated school | Nullable (null for Super Admin) |
| `createdAt` | Timestamp| Creation time | Default Now |

## Relationships
- **User -> School**: Many-to-one (optional). A `school_admin` belongs to one school. A `super_admin` has no school association.
- **Audit Log -> User**: One-to-many. Logs track which user performed an action.

## Validation Rules
- **Email**: Must be a valid email format.
- **Password**: Minimum 8 characters.
- **Role**: Must be either `super_admin` or `school_admin`.
- **School ID**: Required if role is `school_admin`. Must be `null` if role is `super_admin`.
