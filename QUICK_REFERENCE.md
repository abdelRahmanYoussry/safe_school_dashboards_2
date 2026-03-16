# Session Management - Quick Reference

## What Was Implemented

### Phase 1: Session Expiry Modal ✅
When a user gets a 401 Unauthorized response:
- Instead of redirecting immediately
- A modal appears with message: "Your session has expired due to inactivity"
- User clicks OK → redirected to login
- No other options available (prevents accidental dismissal)

**Component:** `client/src/components/SessionExpiredModal.tsx`

### Phase 2: Form Auto-Save ✅
As users fill out forms:
- Data is automatically saved to localStorage every 10 seconds
- If session expires, data is NOT lost
- After re-login, users can restore their form data
- No sensitive information is auto-saved

**Hook:** `client/src/hooks/use-auto-save.ts`

**Usage:**
```tsx
// In any form component:
useAutoSave(formData, { key: "form-name", interval: 10000 });

// On mount, restore:
const saved = getAutoSaveData("form-name");

// After submit, clear:
clearAutoSaveData("form-name");
```

### Phase 3: Auto Token Refresh ✅
Behind the scenes:
- Access tokens auto-refresh every 13 minutes (expire at 15 min)
- Keeps users logged in indefinitely if they're using the app
- Refresh token expires after 1-30 days (depending on "Remember Me")
- If user browsers multiple tabs, token refresh syncs automatically

**Manager:** `client/src/lib/authSessionManager.ts`

---

## Updated Files

### New Components
- `components/SessionExpiredModal.tsx` - 401 Modal UI

### New Hooks
- `hooks/use-auto-save.ts` - Form auto-save

### New Utilities
- `lib/authSessionManager.ts` - Token management
- `lib/queryClient.ts` - Updated with event-based 401 handling

### Updated Components
- `hooks/use-auth.tsx` - Integrated auth session manager
- `App.tsx` - Added SessionExpiredModal to router

### Documentation
- `SESSION_MANAGEMENT_IMPLEMENTATION.md` - Complete guide
- `FORM_AUTOSAVE_GUIDE.ts` - Code examples

---

## How It Works Together

```
User Login
    ↓
AuthProvider initializes authSessionManager
    ↓
Access & Refresh tokens stored in sessionStorage
    ↓
Auto-refresh loop starts (every 13 minutes)
    ↓
┌─────────────────────────────────────────┐
│ User makes API request                   │
├─────────────────────────────────────────┤
│ scopedFetch adds auth token to header    │
│ Server validates token                   │
│ ├─ Valid → Returns data (200)           │
│ └─ Expired → Returns 401                │
└─────────────────────────────────────────┘
    ↓
On 401 Response:
    ├─ queryClient detects 401
    ├─ Emits session-expired event
    ├─ Router shows SessionExpiredModal
    ├─ User clicks OK
    └─ Redirected to login

Form Data Protection:
    ├─ useAutoSave saves form data every 10s
    ├─ Data persists in localStorage after logout
    ├─ After re-login, data can be restored
    └─ User continues from where they left off
```

---

## For Developers Using This System

### Add Auto-Save to a New Form

```tsx
import { useAutoSave, getAutoSaveData, clearAutoSaveData } from "@/hooks/use-auto-save";

export function MyForm() {
  const [data, setData] = useState({ ...initialData });

  // 1. Enable auto-save
  useAutoSave(data, { key: "my-form-key", interval: 10000 });

  // 2. Restore on mount
  useEffect(() => {
    const saved = getAutoSaveData("my-form-key");
    if (saved) setData(saved);
  }, []);

  // 3. Handle submission
  const handleSubmit = async () => {
    // ... submit logic
    if (success) clearAutoSaveData("my-form-key");
  };

  return (
    // ... form JSX
  );
}
```

### Check Auth Session Status

```tsx
import { useAuth } from "@/hooks/use-auth";

export function MyComponent() {
  const { user, isSessionExpired } = useAuth();

  if (isSessionExpired) {
    // This is handled by SessionExpiredModal automatically
    // But you can use this state if needed for custom logic
  }

  return <div>Hello {user?.name}</div>;
}
```

### Manually Check Token Status

```tsx
import { authSessionManager } from "@/lib/authSessionManager";

// Get current tokens
const tokens = authSessionManager.getTokens();
console.log("Access Token Valid Until:", tokens?.expiresAt);

// Manually refresh
authSessionManager.refreshTokenNow();

// Subscribe to changes
const unsubscribe = authSessionManager.onSessionExpired(() => {
  console.log("Session expired!");
});
```

---

## Common Scenarios

### Scenario 1: User Fills Form for 30 Minutes
✓ Every 10 seconds, form auto-saves  
✓ Every 13 minutes, token auto-refreshes  
✓ User experience: Seamless, no interruptions  
✓ Data safety: Saved both in memory AND localStorage

### Scenario 2: User Fills Form Then Leaves Browser for 1 Day
✓ Form data remains in localStorage (auto-saved)  
✓ Access token expires (15 minutes) - but user not using app  
✓ Refresh token expires (1 day without Remember Me)  
✓ User returns, makes API call → 401 Unauthorized  
✓ Modal appears → User clicks OK → Logs in again  
✓ Form data available for restoration

### Scenario 3: Session Hijacker Gets Token
✓ Token valid for only 15 minutes max  
✓ After 15 minutes: Token invalid, attacker locked out  
✓ Legitimate user: Auto-refresh keeps them logged in continuously

### Scenario 4: Multiple Browser Tabs Open
✓ Both tabs share same sessionStorage  
✓ One tab refreshes token → affects both  
✓ 401 in one tab shows modal in one tab only  
✓ Other tabs continue working (have new token)

---

## Testing Checklist

- [ ] Login works and tokens are stored
- [ ] Visit DevTools → Application → Session Storage → see auth_tokens
- [ ] Wait 13 minutes, verify tokens refresh automatically
- [ ] Make API request, see Authorization header in Network tab
- [ ] Simulate 401 by manually invalidating token
- [ ] Verify SessionExpiredModal appears
- [ ] Click OK and verify redirect to login
- [ ] Fill a form, wait 30+ seconds, refresh page
- [ ] Verify form data is restored from auto-save
- [ ] Submit form and verify auto-save data is cleared
- [ ] Switch between browser tabs, verify tokens sync
- [ ] Test with "Remember Me" ON and OFF

---

## Troubleshooting

| Problem | Solution |
|---------|-----------|
| Modal doesn't appear on 401 | Check that AuthProvider initializes authSessionManager in useEffect |
| Tokens not being stored | Verify loginMutation calls authSessionManager.setTokens() |
| Auto-save not working | Check useAutoSave hook is called, and interval is reasonable |
| Token refresh failing | Check /api/refresh endpoint exists on backend and is accessible |
| Form data not restoring | Verify getAutoSaveData() called on component mount |
| Session expires immediately | Check refresh token validity, not expired on backend |

---

## Key Files to Know

1. **Authentication Flow:**
   - `hooks/use-auth.tsx` - Auth context & provider
   - `lib/authSessionManager.ts` - Token lifecycle

2. **API Integration:**
   - `lib/queryClient.ts` - React Query setup & 401 handling
   - This is where Authorization header is added

3. **UI Components:**
   - `components/SessionExpiredModal.tsx` - Modal display
   - `App.tsx` - Modal integration into router

4. **Form Data Protection:**
   - `hooks/use-auto-save.ts` - Auto-save hook
   - Use this in any form that needs data protection

---

## Important: Database/Backend Requirements

The backend already has everything needed:
- ✅ Access Token: JWT expiring in 15 minutes
- ✅ Refresh Token: Database entry with expiry
- ✅ `/api/refresh` endpoint: Returns new token pair
- ✅ `/api/dashboard-login` endpoint: Returns tokens on login

No backend changes required for this implementation.

---

## Next Steps

1. **Deploy:** Push these changes to staging
2. **Test:** Verify all scenarios work
3. **Train:** Inform team about new session handling
4. **Monitor:** Watch for 401 errors in production
5. **Iterate:** Gather user feedback on modal UX

---

## Questions?

Refer to `SESSION_MANAGEMENT_IMPLEMENTATION.md` for complete documentation.
