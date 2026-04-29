import { CACHE_PREFIX, CACHE_TTL_MS } from "./config.js";

const _now = () => Date.now();

export const cacheGet = (key, ttlMs) => {
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed.t !== "number") return null;
    const ttl = typeof ttlMs === "number" ? ttlMs : CACHE_TTL_MS;
    if (_now() - parsed.t > ttl) return null;
    return parsed.v;
  } catch (_e) {
    return null;
  }
};

export const cacheSet = (key, value) => {
  try {
    localStorage.setItem(
      CACHE_PREFIX + key,
      JSON.stringify({ t: _now(), v: value })
    );
  } catch (_e) { }
};

export const cacheClearAll = () => {
  try {
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.indexOf(CACHE_PREFIX) === 0) keys.push(k);
    }
    keys.forEach((k) => localStorage.removeItem(k));
  } catch (_e) { }
};
