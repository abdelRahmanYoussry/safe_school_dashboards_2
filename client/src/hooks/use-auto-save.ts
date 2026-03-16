/**
 * Auto-save hook for form data
 * Saves form state to localStorage periodically to prevent data loss on session expiry
 */

import { useEffect, useRef } from "react";

interface UseAutoSaveOptions {
  key: string; // localStorage key
  interval?: number; // milliseconds between saves (default: 10s)
  enabled?: boolean; // whether auto-save is enabled (default: true)
}

/**
 * Hook to auto-save form data
 * Usage:
 *   const [formData, setFormData] = useState({});
 *   useAutoSave({ key: "school-form", data: formData });
 *   
 *   // On mount, restore from auto-save
 *   useEffect(() => {
 *     const saved = getAutoSaveData("school-form");
 *     if (saved) setFormData(saved);
 *   }, []);
 */
export function useAutoSave<T>(
  data: T,
  { key, interval = 10000, enabled = true }: UseAutoSaveOptions
) {
  const lastSaveRef = useRef<T | null>(null);

  useEffect(() => {
    if (!enabled || !data) return;

    // Only save if data has changed
    if (JSON.stringify(lastSaveRef.current) === JSON.stringify(data)) {
      return;
    }

    const timer = setTimeout(() => {
      try {
        localStorage.setItem(`autosave_${key}`, JSON.stringify(data));
        lastSaveRef.current = data;
      } catch (error) {
        console.error(`Failed to auto-save form data for ${key}:`, error);
      }
    }, interval);

    return () => clearTimeout(timer);
  }, [data, key, interval, enabled]);
}

/**
 * Retrieve auto-saved data from localStorage
 */
export function getAutoSaveData<T>(key: string): T | null {
  try {
    const stored = localStorage.getItem(`autosave_${key}`);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error(`Failed to retrieve auto-save data for ${key}:`, error);
    return null;
  }
}

/**
 * Clear auto-saved data
 */
export function clearAutoSaveData(key: string) {
  try {
    localStorage.removeItem(`autosave_${key}`);
  } catch (error) {
    console.error(`Failed to clear auto-save data for ${key}:`, error);
  }
}
