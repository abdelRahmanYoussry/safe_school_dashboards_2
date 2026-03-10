# Frontend: School Creation API Integration

## Overview
This document describes how the frontend sends school creation requests to the NestJS backend.

---

## Endpoint Details

### URL
```
POST /safeschool/schools
```

### Authentication
```
Authorization: Bearer {token}
```
(Session token is automatically converted to Bearer token by the BFF proxy)

---

## Request Format

### Content-Type
```
multipart/form-data; boundary=----WebKitFormBoundary...
```

### Payload Structure

The frontend sends **FormData** with the following fields:

#### Required Fields
| Field | Type | Format | Example |
|-------|------|--------|---------|
| `name` | string | Plain text | "Springfield Elementary" |
| `admin[name]` | string | Bracket notation | "John Doe" |
| `admin[email]` | string | Bracket notation | "john@school.com" |
| `admin[password]` | string | Bracket notation | "SecurePass123" |
| `admin[phone]` | string | Bracket notation | "01234567890" |

#### Optional Fields
| Field | Type | Format | Example |
|-------|------|--------|---------|
| `logo` | File | Binary file | school-logo.png (image/*) |
| `address` | string | Plain text | "123 Main Street" |
| `lat` | string | Numeric string | "12.6" |
| `lng` | string | Numeric string | "30.21" |
| `geofenceRadius` | string | Numeric string | "100" |

---

## Example Requests

### Full Request (With Logo)
```
FormData:
  name: "Springfield Elementary"
  logo: <File: school-logo.png, type: image/png, size: 45678>
  admin[name]: "John Doe"
  admin[email]: "john@school.com"
  admin[password]: "SecurePass123"
  admin[phone]: "01234567890"
  address: "123 Main Street"
  lat: "12.6"
  lng: "30.21"
  geofenceRadius: "100"

Headers:
  Content-Type: multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  Accept: application/json
```

### Minimal Request (Without Logo)
```
FormData:
  name: "Springfield Elementary"
  admin[name]: "John Doe"
  admin[email]: "john@school.com"
  admin[password]: "SecurePass123"
  admin[phone]: "01234567890"

Headers:
  Content-Type: multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  Accept: application/json
```

---

## Backend Requirements

### 1. Accept Multipart Form Data
The endpoint must accept `Content-Type: multipart/form-data`:

```typescript
@Post()
@UseInterceptors(FileInterceptor('logo'))
async createSchool(
  @Body() createSchoolDto: CreateSchoolDto,
  @UploadedFile() logo?: Express.Multer.File
) {
  // Implementation
}
```

### 2. Parse Nested Admin Object
The backend must parse bracket notation `admin[field]` into a nested object:

**Received:**
```
admin[name]: "John Doe"
admin[email]: "john@school.com"
admin[password]: "SecurePass123"
admin[phone]: "01234567890"
```

**Expected DTO Structure:**
```typescript
class CreateSchoolAdminDto {
  name: string;
  email: string;
  password: string;
  phone: string;
}

class CreateSchoolDto {
  @IsNotEmpty()
  name: string;

  @ValidateNested()
  @Type(() => CreateSchoolAdminDto)
  admin: CreateSchoolAdminDto;

  @IsOptional()
  address?: string;

  @IsOptional()
  @Type(() => Number)
  lat?: number;

  @IsOptional()
  @Type(() => Number)
  lng?: number;

  @IsOptional()
  @Type(() => Number)
  geofenceRadius?: number;
}
```

### 3. Handle Optional Logo
- Logo file may or may not be included in the request
- If missing, use a default logo or leave `logoUrl` empty/null
- If present, save to `/uploads/` directory and generate URL

### 4. Type Conversions
Convert string values to appropriate types:
- `lat`: string → number
- `lng`: string → number  
- `geofenceRadius`: string → number

---

## Expected Response Format

### Success Response (201 Created)
```json
{
  "message": "School created successfully",
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "Springfield Elementary",
    "logoUrl": "/uploads/1234567890-school-logo.png",
    "address": "123 Main Street",
    "lat": 12.6,
    "lng": 30.21,
    "geofenceRadius": 100,
    "createdAt": "2026-03-10T14:30:00.000Z",
    "updatedAt": "2026-03-10T14:30:00.000Z"
  }
}
```

### Error Response (400 Bad Request)
```json
{
  "message": "name should not be empty"
}
```

or for multiple validation errors:

```json
{
  "message": [
    "name should not be empty",
    "admin email must be a valid email",
    "admin password must be at least 6 characters"
  ]
}
```

### Error Response (401 Unauthorized)
```json
{
  "message": "Unauthorized"
}
```

---

## Implementation Flow

### Frontend → BFF Proxy → Backend

1. **User submits form**
   - Frontend creates `FormData` object
   - Appends all fields including file
   - Sends POST request to `/api/schools`

2. **BFF Proxy processes request**
   - Intercepts multipart request using `multer`
   - Parses file and body fields
   - Reconstructs `FormData` with bracket notation
   - Forwards to backend at `/safeschool/schools`

3. **Backend processes request**
   - Receives multipart data
   - Parses bracket notation into nested objects
   - Validates using class-validator
   - Saves logo file (if present)
   - Creates school record
   - Creates admin user record
   - Returns success response

4. **Frontend displays result**
   - Success: Shows toast, closes dialog, refreshes list
   - Error: Shows error message in toast, keeps dialog open

---

## Validation Rules

### Expected by Frontend
- `name`: Required, non-empty string
- `logo`: Optional, image file (image/*)
- `admin[name]`: Required, non-empty string
- `admin[email]`: Required, valid email format
- `admin[password]`: Required, minimum 6 characters
- `admin[phone]`: Required, minimum 10 characters
- `address`: Optional string
- `lat`: Optional number
- `lng`: Optional number
- `geofenceRadius`: Optional number, between 50-5000

### Backend Should Validate
- All required fields are present
- Email format is valid
- Password meets security requirements
- Phone number format is valid (Saudi format preferred)
- Geofence radius is within acceptable range
- Logo file type is image (if provided)
- Logo file size is reasonable (e.g., < 5MB)

---

## Error Handling

### Frontend Toast Notifications

**Validation Errors:**
```typescript
toast({ 
  title: "Creation Failed", 
  description: "name should not be empty", 
  variant: "destructive" 
});
```

**Network Errors:**
```typescript
toast({ 
  title: "Creation Failed", 
  description: "Failed to reach backend", 
  variant: "destructive" 
});
```

**Success:**
```typescript
toast({ 
  title: "Success", 
  description: "School created successfully." 
});
```

---

## Technical Notes

### Why Bracket Notation?
- NestJS with `FileInterceptor` automatically parses `admin[field]` syntax into nested objects
- Standard Express multipart parsing behavior
- No custom transformers needed on backend

### Why Strings for Numbers?
- HTML form inputs return string values
- FormData serializes all values as strings
- Backend should use `@Type(() => Number)` decorator for auto-conversion

### File Upload Handling
- Frontend uses `<input type="file" accept="image/*">`
- BFF proxy uses `multer.memoryStorage()` to buffer file
- File is forwarded to backend as part of multipart FormData
- Backend should save file and return URL in response

### Content-Type Boundary
- Automatically generated by `form-data` package
- Must be preserved when forwarding from BFF to backend
- Backend must respect the boundary for proper parsing

---

## Testing Examples

### Using cURL
```bash
curl -X POST http://localhost:3000/safeschool/schools \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "name=Test School" \
  -F "logo=@/path/to/logo.png" \
  -F "admin[name]=John Doe" \
  -F "admin[email]=john@test.com" \
  -F "admin[password]=password123" \
  -F "admin[phone]=0123456789" \
  -F "address=123 Test St" \
  -F "lat=24.7136" \
  -F "lng=46.6753" \
  -F "geofenceRadius=200"
```

### Using Postman
1. Set method to POST
2. URL: `http://localhost:3000/safeschool/schools`
3. Headers: `Authorization: Bearer YOUR_TOKEN`
4. Body: Select "form-data"
5. Add fields:
   - `name` (text): "Test School"
   - `logo` (file): Select image file
   - `admin[name]` (text): "John Doe"
   - `admin[email]` (text): "john@test.com"
   - `admin[password]` (text): "password123"
   - `admin[phone]` (text): "0123456789"
   - `address` (text): "123 Test St"
   - `lat` (text): "24.7136"
   - `lng` (text): "46.6753"
   - `geofenceRadius` (text): "200"

---

## Troubleshooting

### "name should not be empty" Error
- **Cause**: Backend cannot parse the `name` field
- **Check**: Ensure multipart boundary is correct
- **Fix**: Verify `Content-Type` header includes boundary

### "Unexpected end of form" Error
- **Cause**: Incomplete multipart data stream
- **Check**: BFF proxy properly buffers FormData before sending
- **Fix**: Convert form-data stream to complete buffer (current implementation)

### "Cannot convert object to primitive value" Error
- **Cause**: Incompatible Buffer/Blob handling
- **Check**: Using Node.js-compatible `form-data` package
- **Fix**: Use `form-data` npm package, not built-in FormData

---

## BFF Proxy Implementation Reference

Location: `server/routes.ts`

```typescript
import FormDataNode from "form-data";
import multer from "multer";

const upload = multer({ storage: multer.memoryStorage() });

app.post(api.schools.create.path, upload.single("logo"), async (req, res) => {
  // Reconstruct FormData using form-data package
  const fd = new FormDataNode();

  // Flatten nested objects into bracket notation
  const appendRecursive = (obj: any, prefix = "") => {
    for (const [key, value] of Object.entries(obj || {})) {
      const fullKey = prefix ? `${prefix}[${key}]` : key;
      if (value !== undefined && value !== null) {
        if (typeof value === "object" && !Buffer.isBuffer(value)) {
          appendRecursive(value, fullKey);
        } else {
          fd.append(fullKey, String(value));
        }
      }
    }
  };

  appendRecursive(req.body);

  // Append logo file if present
  if (req.file) {
    fd.append("logo", req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype
    });
  }

  // Convert to buffer for fetch
  const formBuffer = await new Promise<Buffer>((resolve, reject) => {
    const chunks: Buffer[] = [];
    fd.on('data', (chunk: Buffer) => chunks.push(chunk));
    fd.on('end', () => resolve(Buffer.concat(chunks)));
    fd.on('error', reject);
  });

  // Forward to backend
  const formHeaders = fd.getHeaders();
  const backendRes = await fetch(BACKEND_URL + "/safeschool/schools", {
    method: "POST",
    headers: { ...authHeaders, ...formHeaders },
    body: new Uint8Array(formBuffer.buffer, formBuffer.byteOffset, formBuffer.byteLength)
  });
});
```

---

## Status: ✅ Ready for Integration

The frontend is fully implemented and tested. Backend should:
1. Accept multipart/form-data
2. Parse bracket notation for nested admin object
3. Handle optional logo file
4. Return appropriate success/error responses

Last Updated: March 10, 2026
