import type { PersistenceMode } from "../types";

// Safe storage helpers — never throw in private mode / SSR / disabled storage.

const getStore = (mode: PersistenceMode): Storage | null => {
  if (mode === "none") return null;
  if (typeof window === "undefined") return null;
  try {
    return mode === "local" ? window.localStorage : window.sessionStorage;
  } catch {
    return null;
  }
};

export function readJSON<T>(mode: PersistenceMode, key: string): T | null {
  const store = getStore(mode);
  if (!store) return null;
  try {
    const raw = store.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export function writeJSON(mode: PersistenceMode, key: string, value: unknown): void {
  const store = getStore(mode);
  if (!store) return;
  try {
    store.setItem(key, JSON.stringify(value));
  } catch {
    /* quota / private mode — ignore, persistence is best-effort */
  }
}

export function remove(mode: PersistenceMode, key: string): void {
  const store = getStore(mode);
  if (!store) return;
  try {
    store.removeItem(key);
  } catch {
    /* ignore */
  }
}
