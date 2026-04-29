import { STORES_URL } from "./config.js";
import { cacheGet, cacheSet } from "./cache.js";
import { getFetcherForLoc } from "./fetchers.js";

export const rawUrl = (loc, tree, path) => {
  const f = getFetcherForLoc(loc);
  return f ? f.rawUrl(loc, tree, path) : "";
};

export const sourceUrl = (loc, tree, extPath) => {
  const f = getFetcherForLoc(loc);
  return f ? f.sourceUrl(loc, tree, extPath) : loc.webUrl;
};

export const getTree = async (loc) => {
  const key = "tree:" + loc.slug;
  const cached = cacheGet(key);
  if (cached && cached.paths && cached.paths.length) return cached;
  const f = getFetcherForLoc(loc);
  if (!f) return null;
  const t = await f.getTree(loc);
  if (t) cacheSet(key, t);
  return t;
};

export const fetchJSON = async (loc, tree, path) => {
  const key = "json:" + loc.slug + ":" + path;
  const cached = cacheGet(key);
  if (cached !== null) return cached;
  try {
    const r = await fetch(rawUrl(loc, tree, path));
    if (!r.ok) return null;
    const json = await r.json();
    cacheSet(key, json);
    return json;
  } catch (_e) {
    return null;
  }
};

export const fetchText = async (loc, tree, path) => {
  const key = "text:" + loc.slug + ":" + path;
  const cached = cacheGet(key);
  if (cached !== null) return cached;
  try {
    const r = await fetch(rawUrl(loc, tree, path));
    if (!r.ok) return null;
    const text = await r.text();
    cacheSet(key, text);
    return text;
  } catch (_e) {
    return null;
  }
};

export const fetchStores = async () => {
  const cached = cacheGet("stores");
  if (Array.isArray(cached)) return cached;
  try {
    const r = await fetch(STORES_URL, { cache: "default" });
    if (!r.ok) return [];
    const list = await r.json();
    if (Array.isArray(list)) {
      cacheSet("stores", list);
      return list;
    }
    return [];
  } catch (_e) {
    return [];
  }
};

export const loadStore = async (loc) => {
  const tree = await getTree(loc);
  if (!tree) return null;
  const pkg = await fetchJSON(loc, tree, "package.json");
  if (!pkg) return null;
  return { loc, pkg, tree };
};
