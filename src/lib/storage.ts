import { useState, useEffect, type Dispatch, type SetStateAction } from "react";

// Persists a piece of state to localStorage under a namespaced key, so
// calculator inputs survive closing and reopening the app.
export function usePersistentState(
  key: string,
  defaultValue: string
): [string, Dispatch<SetStateAction<string>>] {
  const fullKey = `mhe-toolkit:${key}`;
  const [state, setState] = useState<string>(() => {
    try {
      const stored = window.localStorage.getItem(fullKey);
      return stored !== null ? stored : defaultValue;
    } catch {
      return defaultValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(fullKey, state);
    } catch {
      // localStorage unavailable (private browsing, etc.) — fail silently,
      // the calculator still works, it just won't remember inputs.
    }
  }, [fullKey, state]);

  return [state, setState];
}

// Same as usePersistentState but for arrays/objects (JSON-encoded), used for
// the per-gapper speed list which changes length as gapper count changes.
export function usePersistentJSON<T>(key: string, defaultValue: T): [T, Dispatch<SetStateAction<T>>] {
  const fullKey = `mhe-toolkit:${key}`;
  const [state, setState] = useState<T>(() => {
    try {
      const stored = window.localStorage.getItem(fullKey);
      return stored !== null ? (JSON.parse(stored) as T) : defaultValue;
    } catch {
      return defaultValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(fullKey, JSON.stringify(state));
    } catch {
      // ignore
    }
  }, [fullKey, state]);

  return [state, setState];
}
