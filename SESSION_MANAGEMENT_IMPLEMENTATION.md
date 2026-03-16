# Session Management Implementation Guide

## Overview

This document describes the complete 3-phase implementation for handling session expiry and unauthorized (401) responses in the Safe School Admin Dashboard.

**Implementation Date:** March 16, 2026  
**Status:** ✅ All 3 Phases Complete

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     Session Management Flow                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  [User Logs In] ──→ [Tokens Stored in SessionStorage]            │
│       ↓                         ↓                                 │
│  [Auto-Refresh Loop Starts]    [Token Added to Every Request]   │
│  (every 13 minutes)            (Authorization header)            │
│       ↓                                                           │
│  [Every 13 minutes: Try to get new token pair]                  │
│       ↓                                                           │
│  ┌─────────────────────────────────────────────┐                │
│  │ Refresh Success?                             │                │
│  ├─────────────────────────────────────────────┤                │
│  │ YES ──→ Store new tokens, continue          │                │
│  │ NO  ──→ 401 Response                        │                │
│  └─────────────────────────────────────────────┘                │
│       ↓                                                           │
│  [On 401 Error]                                                 │
│       ↓                                                           │
│  [Emit session-expired event]                                   │
│       ↓                                                           │
│  [Show SessionExpiredModal] ──→ [User clicks OK]                │
│       ↓                                                           │
│  [Clear tokens, redirect to login]                              │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Phase 1: Session Expiry Modal (UI Handling)

### Files Modified/Created:
- ✅ `client/src/components/SessionExpiredModal.tsx` (NEW)
- ✅ `client/src/lib/queryClient.ts` (MODIFIED)
- ✅ `client/src/App.tsx` (MODIFIED)

### Implementation Details:

#### SessionExpiredModal Component
**Purpose:** Display user-friendly modal when session expires

**Key Features:**
- Modal with alert icon
- "Your session has expired due to inactivity" message
- Single "OK" button (no other options)
- Prevents closing by clicking outside
- Clears auth data and redirects to login on OK

**File:** `client/src/components/SessionExpiredModal.tsx`

```tsx
// Modal displays when auth context's isSessionExpired = true
<SessionExpiredModal isOpen={isSessionExpired} onClose={() => {...}} />
```

#### Event-Based Error Handling
**Purpose:** Emit events instead of redirecting immediately

**Key Change in queryClient:**
```ts
// OLD: window.location.href = '/login'
// NEW: dispatchSessionExpired()  // Emit event

// This allows the modal to handle the UX instead of a hard redirect
```

**Benefits:**
- Smooth modal transition
- No jarring page redirects
- Event can be caught by multiple listeners if needed
- Decoupled from routing logic

---

## Phase 2: Auto-Save for Forms (Prevent Data Loss)

### Files Created:
- ✅ `client/src/hooks/use-auto-save.ts` (NEW)
- ✅ `client/src/FORM_AUTOSAVE_GUIDE.ts` (NEW - Examples)

### Implementation Details:

#### useAutoSave Hook
**Purpose:** Periodically save form data to localStorage

**Key Features:**
- Auto-saves every 10 seconds (configurable)
- Only saves when data changes
- Runs in background without blocking UI
- Works with any form state

**Usage Example:**
```tsx
const [formData, setFormData] = useState({...});

// Auto-save every 10 seconds
useAutoSave(formData, {
  key: "school-form",
  interval: 10000,
  enabled: true,
});

// On mount, restore from auto-save
useEffect(() => {
  const saved = getAutoSaveData("school-form");
  if (saved) setFormData(saved);
}, []);

// After successful submission, clear auto-save
clearAutoSaveData("school-form");
```

#### Storage Strategy
- **Storage:** localStorage (sessionStorage would clear on tab close)
- **Key Format:** `autosave_{formKey}`
- **Data:** JSON stringified form object
- **Persistence:** Until user clears browser cache or logs out

#### Workflow:
1. User starts filling a form
2. Hook auto-saves to localStorage every 10 seconds
3. **Scenario A (Form Submitted):**
   - User submits successfully
   - Auto-save data is cleared
4. **Scenario B (Session Expires):**
   - User gets session expired modal
   - Session expires, user logs in again
   - User navigates back to the form
   - Auto-saved data is restored
   - User continues from where they left off

---

## Phase 3: Auto Token Refresh (Keep Session Alive)

### Files Created:
- ✅ `client/src/lib/authSessionManager.ts` (NEW)
- ✅ `client/src/hooks/use-auth.tsx` (MODIFIED)

### Implementation Details:

#### AuthSessionManager Class
**Purpose:** Manage token lifecycle and automatic refresh

**Key Features:**
- **Token Storage:** sessionStorage (cleared on browser close for security)
- **Auto-Refresh Interval:** Every 13 minutes
- **Expiry Protection:** Access tokens expire at 15 minutes, refresh at 13 minutes
- **Session Visibility:** Immediately refresh if user returns to tab
- **Event System:** Notify listeners of token changes and session expiry

**Token Flow:**

```
Access Token Lifetime:     [Created] ←─────→ [15 min] ← Expires
                           ↑                   ↑
                           └─── [13 min] ← Auto-refresh triggered

Refresh Token:             [Created] ←──────────→ [1-30 days] ← Expires
                                                   (depends on remember-me)
```

**API Calls:**
1. **Login:**
   ```ts
   POST /api/dashboard-login
   Response: { access_token, refresh_token, user }
   // Stored in sessionStorage
   ```

2. **Auto-Refresh (every 13 min):**
   ```ts
   POST /api/refresh
   Body: { refreshToken: "..." }
   Response: { access_token, refresh_token }
   // New tokens replace old ones
   ```

3. **On 401 Response:**
   - Emit session-expired event
   - Clear tokens
   - Show modal
   - User clicks OK → redirect to login

#### Tab Visibility Detection
- If user switches tabs and comes back, immediately refresh token
- Prevents token expiry while user is actively using the app

#### Integration Points:
1. **AuthProvider:** Initializes authSessionManager on mount
2. **scopedFetch:** Adds Authorization header to all API calls
3. **Login Mutation:** Stores new tokens in authSessionManager
4. **Logout Mutation:** Clears tokens from authSessionManager
5. **Router:** Shows SessionExpiredModal when session expires

---

## Complete Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                       │
│  USER LOGS IN                                                        │
│  ├─ Credentials sent to /api/dashboard-login                       │
│  ├─ Backend validates and returns access_token, refresh_token      │
│  ├─ Frontend stores in sessionStorage                              │
│  └─ authSessionManager.setTokens() called                          │
│                                                                      │
│  ⏰ BEGINS: Auto-refresh every 13 minutes                           │
│  ├─ Calls /api/refresh with refreshToken                          │
│  ├─ Gets new token pair                                           │
│  └─ Updates sessionStorage                                        │
│                                                                      │
│  👤 USER MAKES API CALL                                            │
│  ├─ scopedFetch() adds Authorization header                       │
│  ├─ Backend validates JWT signature                               │
│  ├─ If valid: Returns data (200)                                 │
│  └─ If expired: Returns 401                                       │
│                                                                      │
│  ❌ WHEN 401 RECEIVED                                              │
│  ├─ throwIfResNotOk() detects 401                                │
│  ├─ dispatchSessionExpired() emits event                          │
│  ├─ AuthProvider catches event                                    │
│  ├─ Sets isSessionExpired = true                                 │
│  └─ Router shows SessionExpiredModal                              │
│                                                                      │
│  ✋ USER CLICKS OK ON MODAL                                        │
│  ├─ handleOk() called                                             │
│  ├─ localStorage cleared                                          │
│  ├─ sessionStorage cleared                                        │
│  ├─ Auto-refresh loop stopped                                    │
│  ├─ Redirect to /login or /admin/login                          │
│  └─ User enters credentials again                                │
│                                                                      │
│  📦 FORM DATA NOT LOST                                            │
│  ├─ While filling form, useAutoSave() runs                       │
│  ├─ Form data periodically saved to localStorage                 │
│  ├─ On session expiry, data persists in localStorage             │
│  ├─ After re-login, form component restores data                │
│  └─ User continues from where they left off                      │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Timing Details

### Access Token
- **Issued at:** Login
- **Expires at:** 15 minutes
- **Auto-refresh:** 13 minutes (before expiry)
- **Used for:** All API requests

### Refresh Token
- **Issued at:** Login
- **Expires at:** 
  - 1 day if "Remember Me" is OFF
  - 30 days if "Remember Me" is ON
- **Used for:** Getting new access token pair
- **Storage:** sessionStorage (cleared on browser close)

### Session Preservation
- If user keeps using the app: Auto-refresh keeps session alive indefinitely
- If user leaves for >1 day (without Remember Me): Session expires, must re-login
- If user closes browser: sessionStorage cleared, must re-login on next visit
- If user has form data: Auto-save in localStorage means data survives session expiry

---

## Testing Scenarios

### Scenario 1: Normal Usage
1. User logs in
2. Performs actions normally
3. Every 13 minutes: Auto token refresh happens silently
4. User doesn't see any interruption

**Verification:**
- Check browser DevTools → Application → Session Storage
- See `auth_tokens` object getting updated every 13 minutes

### Scenario 2: Session Expires
1. User logs in with "Remember Me" OFF
2. Leaves for >1 day
3. Returns to app
4. Makes API request
5. Refresh token is expired (>1 day)
6. Auto-refresh fails with 401
7. Session expired modal appears
8. User clicks OK and is redirected to login

### Scenario 3: Token Expiry with 401
1. User logs in
2. Somehow access token gets invalidated (unlikely, but possible)
3. Next API call returns 401
4. Modal appears immediately
5. User clicks OK
6. Redirected to login

### Scenario 4: Form Data Survival
1. User logs in
2. Navigates to create school form
3. Fills out half the form
4. Auto-save has saved the data to localStorage
5. Session expires (refresh token > 1 day old)
6. User gets modal, clicks OK
7. User logs back in
8. User navigates to create school form again
9. Form data is auto-restored
10. User continues filling and submits

---

## Configuration

### Token Refresh Interval
**File:** `client/src/lib/authSessionManager.ts`

```ts
const TOKEN_REFRESH_INTERVAL = 13 * 60 * 1000; // 13 minutes
```

To change: Modify this constant. Recommend keeping at 13 min for 15 min expiry.

### Access Token Expiry (Backend)
**File:** `safe_school_backend/src/auth/auth.module.ts`

```ts
signOptions: { expiresIn: '15m' }
```

To change: Modify this value on backend. Must update TOKEN_REFRESH_INTERVAL accordingly on frontend.

### Auto-Save Interval
**File:** When using hook, pass in options:

```ts
useAutoSave(formData, {
  key: "form-key",
  interval: 10000, // 10 seconds - can change
})
```

---

## Security Considerations

### Token Storage
- ✅ Using **sessionStorage** (not localStorage) for immediate tokens
- ✅ sessionStorage cleared when browser/tab closes
- ✅ No tokens in cookies (prevents XSS via cookies)
- ✅ Credentials: include (allows server to use session cookies)

### Auto-Save
- ⚠️ **Do NOT** auto-save sensitive data (passwords, credit cards)
- ✅ Safe to auto-save: Form inputs, selections, addresses, names
- ✅ Data is client-side only, not sent to server until form submission

### CSRF Protection
- ✅ All POST/PUT/DELETE requests still use credentials: include
- ✅ Server can set same-site cookies for CSRF protection
- ✅ Authorization header used for XHR/fetch requests

### Session Hijacking
- ✅ 15 min access token window limits exposure
- ✅ Auto-refresh keeps legitimate users in session
- ✅ Stolen token only valid for 15 min max
- ✅ Refresh token stored securely in sessionStorage

---

## Files Summary

### New Files
1. `client/src/components/SessionExpiredModal.tsx` - Modal UI
2. `client/src/lib/authSessionManager.ts` - Token lifecycle manager
3. `client/src/hooks/use-auto-save.ts` - Form data auto-save hook
4. `client/src/FORM_AUTOSAVE_GUIDE.ts` - Usage examples

### Modified Files
1. `client/src/lib/queryClient.ts` - Event-based 401 handling
2. `client/src/hooks/use-auth.tsx` - AuthProvider + session setup
3. `client/src/App.tsx` - SessionExpiredModal integration

### Backend Files
- No changes needed (refresh endpoint already exists)
- `safe_school_backend/src/auth/auth.controller.ts` - Has /api/refresh endpoint

---

## Deployment Checklist

- [ ] All files created and modified
- [ ] No TypeScript errors
- [ ] Tested auth flow locally
- [ ] Tested 401 response handling
- [ ] Tested form auto-save
- [ ] Verified token refresh calls
- [ ] Tested modal appearance and OK button
- [ ] Deployed to staging
- [ ] Verified in production

---

## Future Enhancements

1. **Offline Detection:** Detect when network is down, don't show session expired
2. **Grace Period:** Give 1 minute after session expires before forcing logout
3. **Activity Detection:** Only refresh if user has been active
4. **Multi-Tab Sync:** Broadcast token refresh to other tabs
5. **Notification System:** Show "Session expires in 5 minutes" warning (user requested it later)
6. **Analytics:** Track how often sessions are extended, users logging out

---

## Support & Troubleshooting

### Issue: Modal appears immediately on login
**Cause:** Tokens not being stored correctly  
**Fix:** Check authSessionManager.setTokens() is called after login

### Issue: Page keeps showing 401
**Cause:** Token refresh failing persistently  
**Fix:** Check /api/refresh endpoint is accessible and returning valid tokens

### Issue: Form data not restoring
**Cause:** localStorage clear, wrong key name  
**Fix:** Check getAutoSaveData() is called on mount, key matches

### Issue: Auto-refresh not working
**Cause:** authSessionManager.init() not called  
**Fix:** Ensure AuthProvider initializes manager in useEffect on mount
