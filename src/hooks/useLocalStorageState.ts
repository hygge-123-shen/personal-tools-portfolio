import { useState, type Dispatch, type SetStateAction } from "react";

export function useLocalStorageState<T>(
  key: string,
  initialValue: T | (() => T),
): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(key);
      if (stored !== null) return JSON.parse(stored) as T;
    } catch {
      // Use the in-memory default if browser storage is unavailable or malformed.
    }
    return typeof initialValue === "function"
      ? (initialValue as () => T)()
      : initialValue;
  });

  const persist: Dispatch<SetStateAction<T>> = (action) => {
    setValue((previous) => {
      const next =
        typeof action === "function"
          ? (action as (previous: T) => T)(previous)
          : action;
      try {
        localStorage.setItem(key, JSON.stringify(next));
      } catch {
        // The active session still works when storage is blocked or full.
      }
      return next;
    });
  };

  return [value, persist];
}

