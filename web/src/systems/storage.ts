export function safeGetJSON<T = Record<string, unknown>>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function safeSetJSON(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore
  }
}

export function safeGetNumber(key: string, fallback = 0) {
  try {
    const n = Number(localStorage.getItem(key));
    return Number.isFinite(n) ? n : fallback;
  } catch {
    return fallback;
  }
}

export function safeGetString(key: string, fallback = "") {
  try {
    const v = localStorage.getItem(key);
    return typeof v === "string" ? v : fallback;
  } catch {
    return fallback;
  }
}

export function safeSetString(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // ignore
  }
}

export function safeRemoveKeys(keys: string[]) {
  try {
    for (const key of keys) localStorage.removeItem(key);
  } catch {
    // ignore
  }
}
