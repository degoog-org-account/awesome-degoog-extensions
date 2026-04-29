import { stripGit } from "../ui/render.js";
import { resolveFetcher } from "./fetchers.js";

export const parseUrl = async (raw) => {
  if (!raw) return null;
  let s = String(raw).trim();
  if (!/^[a-z]+:\/\//i.test(s)) {
    if (/^[a-z0-9._-]+\/[a-z0-9._-]+$/i.test(s)) {
      s = "https://github.com/" + s;
    } else {
      return null;
    }
  }
  let u;
  try {
    u = new URL(s);
  } catch (_e) {
    return null;
  }
  const hostname = u.hostname.toLowerCase();
  const path = stripGit(u.pathname.replace(/^\/+|\/+$/g, ""));
  if (!path) return null;
  const fetcher = await resolveFetcher(hostname);
  if (!fetcher) return null;
  const built = fetcher.buildLoc(path);
  return {
    input: raw,
    slug: hostname + ":" + path,
    path,
    hostname,
    host: fetcher.host,
    label: fetcher.label,
    ...built,
  };
};
