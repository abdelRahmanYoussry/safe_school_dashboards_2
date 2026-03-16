# Form Auto-Save Usage Guide

**Phase 2: Prevent Data Loss Implementation**

This guide shows how to integrate auto-save functionality in your forms to prevent data loss when sessions expire.

---

## Example 1: Simple Form Component with Auto-Save

```tsx
import { useState, useEffect } from "react";
import { useAutoSave, getAutoSaveData, clearAutoSaveData } from "@/hooks/use-auto-save";

interface SchoolFormData {
  name: string;
  email: string;
  phone: string;
  address: string;
}

export function SchoolForm() {
  const [formData, setFormData] = useState<SchoolFormData>({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  // Auto-save form every 10 seconds
  useAutoSave(formData, {
    key: "school-form",
    interval: 10000, // 10 seconds
    enabled: true,
  });

  // On mount, restore from auto-save if exists
  useEffect(() => {
    const savedData = getAutoSaveData<SchoolFormData>("school-form");
    if (savedData) {
      setFormData(savedData);
      // Optionally show a toast: "Form restored from auto-save"
    }
  }, []);

  const handleChange = (field: keyof SchoolFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch("/api/schools", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        // Clear auto-save on successful submission
        clearAutoSaveData("school-form");
      }
    } catch (error) {
      console.error("Submit error:", error);
    }
  };

  return (
    <div className="space-y-4">
      <input
        type="text"
        placeholder="School Name"
        value={formData.name}
        onChange={(e) => handleChange("name", e.target.value)}
      />
      <input
        type="email"
        placeholder="Email"
        value={formData.email}
        onChange={(e) => handleChange("email", e.target.value)}
      />
      <textarea
        placeholder="Address"
        value={formData.address}
        onChange={(e) => handleChange("address", e.target.value)}
      />
      <button onClick={handleSubmit}>Save School</button>
    </div>
  );
}
```

---

## Example 2: Using with Form Validation

```tsx
import { useForm } from "react-hook-form";
import { useAutoSave, getAutoSaveData, clearAutoSaveData } from "@/hooks/use-auto-save";

interface StudentFormData {
  firstName: string;
  lastName: string;
  grade: number;
}

export function StudentForm() {
  const { register, handleSubmit, watch, setValue } = useForm<StudentFormData>({
    defaultValues: {
      firstName: "",
      lastName: "",
      grade: 1,
    },
  });

  const formData = watch();

  // Auto-save whenever form data changes
  useAutoSave(formData, {
    key: "student-form",
    interval: 5000, // 5 seconds
  });

  // Restore on mount
  useEffect(() => {
    const saved = getAutoSaveData<StudentFormData>("student-form");
    if (saved) {
      Object.keys(saved).forEach((key) => {
        setValue(key as keyof StudentFormData, saved[key as keyof StudentFormData]);
      });
    }
  }, [setValue]);

  const onSubmit = async (data: StudentFormData) => {
    try {
      const response = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        clearAutoSaveData("student-form");
      }
    } catch (error) {
      console.error("Submit error:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register("firstName")} placeholder="First Name" />
      <input {...register("lastName")} placeholder="Last Name" />
      <select {...register("grade", { valueAsNumber: true })}>
        <option value={1}>Grade 1</option>
        <option value={2}>Grade 2</option>
      </select>
      <button type="submit">Create Student</button>
    </form>
  );
}
```

---

## Example 3: Multiple Forms with Different Auto-Save Keys

```tsx
export function AdminDashboard() {
  return (
    <div className="space-y-8">
      <section>
        <h2>Create School</h2>
        <SchoolForm />
      </section>

      <section>
        <h2>Add Student</h2>
        <StudentForm />
      </section>

      {/* Each form has its own auto-save key */}
    </div>
  );
}
```

---

## Key Points

### 1. AUTO-SAVE BEHAVIOR:
- Automatically saves form data to localStorage every N milliseconds
- Only saves if data has changed (prevents unnecessary writes)
- Works in background, doesn't block user input

### 2. DATA RECOVERY:
- On component mount, check for auto-saved data
- Populate form with recovered data
- User sees their previously entered data

### 3. CLEANUP:
- Clear auto-save after successful form submission
- User doesn't see stale data on next visit
- Use `clearAutoSaveData("key-name")`

### 4. SECURITY NOTES:
- localStorage is stored client-side only
- **No sensitive data** like passwords should be auto-saved
- Data persists across browser sessions
- Cleared when user clears browser cache

---

## API Reference

### `useAutoSave(data, options)`

Automatically saves data to localStorage with debouncing.

**Parameters:**
- `data` (T): The data to auto-save
- `options.key` (string): localStorage key for storing data
- `options.interval` (number, default: 10000): Save interval in milliseconds
- `options.enabled` (boolean, default: true): Enable/disable auto-save

**Example:**
```ts
useAutoSave(formData, { 
  key: "my-form", 
  interval: 5000 
});
```

---

### `getAutoSaveData<T>(key: string): T | null`

Retrieves auto-saved data from localStorage.

**Parameters:**
- `key` (string): The localStorage key

**Returns:** Parsed data or null if not found

**Example:**
```ts
const saved = getAutoSaveData<MyFormData>("my-form");
if (saved) {
  formData.update(saved);
}
```

---

### `clearAutoSaveData(key: string)`

Deletes auto-saved data from localStorage.

**Parameters:**
- `key` (string): The localStorage key to clear

**Example:**
```ts
clearAutoSaveData("my-form"); // After successful submission
```

---

## Best Practices

1. **Choose Unique Keys:** Use descriptive, unique keys for each form
   ```ts
   "school-creation-form"  // ✓ Good
   "form"                  // ✗ Too generic
   ```

2. **Set Appropriate Intervals:** Balance between save frequency and performance
   ```ts
   5000    // ✓ Reasonable for frequently-updated forms
   10000   // ✓ Default, works for most cases
   1000    // ✗ Too frequent, impacts performance
   ```

3. **Always Clean Up:** Clear auto-save data after successful submission
   ```ts
   if (submitSuccess) {
     clearAutoSaveData("my-form");
   }
   ```

4. **Handle Edge Cases:** Check for saved data on mount
   ```ts
   useEffect(() => {
     const saved = getAutoSaveData("my-form");
     if (saved) {
       setFormData(prev => ({ ...prev, ...saved }));
     }
   }, []);
   ```

5. **Don't Save Sensitive Data:** Exclude passwords, tokens, SSNs
   ```ts
   // ✗ Don't auto-save:
   // - Passwords
   // - Credit card numbers
   // - Social security numbers
   // - API keys
   // - Authorization tokens
   
   // ✓ Do auto-save:
   // - Names, emails
   // - Addresses
   // - Phone numbers
   // - Form selections
   ```

---

## Troubleshooting

### Data not saving?
- Check that `useAutoSave` hook is called in render
- Verify localStorage is enabled in browser
- Check browser console for errors

### Data not restoring?
- Verify `getAutoSaveData` is called in useEffect
- Check that key matches the save key
- Check localStorage hasn't been cleared

### Performance issues?
- Increase `interval` value (default 10000ms is good)
- Ensure form object isn't too large
- Use React.memo on parent components if needed

---

## Integration with Session Management

When a session expires:
1. Auto-saved form data remains in localStorage
2. User logs out and sees session expired modal
3. User logs back in
4. User navigates to the same form
5. `getAutoSaveData()` retrieves the saved data
6. User can continue where they left off

This integration provides a seamless user experience even when sessions expire unexpectedly.
