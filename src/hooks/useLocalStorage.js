import { useEffect, useState } from 'react';

/**
 * Generic `useState` that mirrors its value to localStorage under `key`.
 * Fails silently if storage is unavailable (private browsing, quota, SSR).
 */
export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const stored = window.localStorage.getItem(key);
      return stored !== null ? JSON.parse(stored) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // storage unavailable — the app still works, it just won't persist
    }
  }, [key, value]);

  return [value, setValue];
}
