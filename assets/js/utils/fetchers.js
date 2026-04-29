import { cacheGet, cacheSet } from "./cache.js";
import { DETECT_TTL_MS } from "./config.js";

const _flattenJsdelivr = (node, prefix, out) => {
  if (!node || !Array.isArray(node.files)) return out;
  node.files.forEach((f) => {
    const p = prefix ? prefix + "/" + f.name : f.name;
    if (f.type === "directory") _flattenJsdelivr(f, p, out);
    else out.push(p);
  });
  return out;
};

const _jsdelivrTree = async (path) => {
  const refs = ["latest", "main", "master"];
  for (const ref of refs) {
    try {
      const r = await fetch(
        "https://data.jsdelivr.com/v1/packages/gh/" + path + "@" + ref,
        { headers: { accept: "application/json" } }
      );
      if (!r.ok) continue;
      const data = await r.json();
      const paths = _flattenJsdelivr(data, "", []);
      if (paths.length) return { paths, ref, sha: null };
    } catch (_e) { }
  }
  return null;
};

const _githubApiTree = async (path) => {
  try {
    const r = await fetch(
      "https://api.github.com/repos/" +
      path +
      "/git/trees/HEAD?recursive=1",
      { headers: { accept: "application/vnd.github+json" } }
    );
    if (!r.ok) return null;
    const data = await r.json();
    const paths = (data.tree || [])
      .filter((e) => e.type === "blob")
      .map((e) => e.path);
    if (!paths.length) return null;
    return { paths, ref: "HEAD", sha: data.sha || null };
  } catch (_e) {
    return null;
  }
};

const github = {
  host: "github",
  label: "GitHub",
  matches: (hostname) =>
    hostname === "github.com" || hostname === "www.github.com",
  buildLoc: (path) => ({
    webUrl: "https://github.com/" + path,
    gitUrl: "https://github.com/" + path + ".git",
    displayUrl: "github.com/" + path,
  }),
  getTree: async (loc) =>
    (await _jsdelivrTree(loc.path)) || (await _githubApiTree(loc.path)),
  rawUrl: (loc, tree, path) =>
    "https://cdn.jsdelivr.net/gh/" +
    loc.path +
    "@" +
    ((tree && tree.ref) || "HEAD") +
    "/" +
    path.replace(/^\/+/, ""),
  sourceUrl: (loc, _tree, extPath) =>
    loc.webUrl + "/tree/HEAD/" + extPath,
};

const _giteaTreeAt = async (apiBase, path, ref) => {
  try {
    const r = await fetch(
      apiBase +
        "/api/v1/repos/" +
        path +
        "/git/trees/" +
        encodeURIComponent(ref) +
        "?recursive=true&per_page=10000"
    );
    if (!r.ok) return null;
    const data = await r.json();
    if (!Array.isArray(data.tree)) return null;
    const paths = data.tree
      .filter((e) => e.type === "blob")
      .map((e) => e.path);
    return paths.length ? { paths, sha: data.sha || null } : null;
  } catch (_e) {
    return null;
  }
};

const _giteaTree = async (apiBase, path) => {
  const metaP = fetch(apiBase + "/api/v1/repos/" + path)
    .then((r) => (r.ok ? r.json() : null))
    .catch(() => null);
  const headTreeP = _giteaTreeAt(apiBase, path, "HEAD");
  const [meta, headTree] = await Promise.all([metaP, headTreeP]);
  const branch = (meta && meta.default_branch) || "main";
  if (headTree) return { ...headTree, ref: branch };
  for (const ref of ["main", "master"].filter((r) => r !== branch)) {
    const t = await _giteaTreeAt(apiBase, path, ref);
    if (t) return { ...t, ref };
  }
  return null;
};

const _makeGiteaFetcher = (hostname, host, label) => {
  const apiBase = "https://" + hostname;
  return {
    host,
    label: label || "Gitea (" + hostname + ")",
    matches: (h) => h === hostname,
    buildLoc: (path) => ({
      webUrl: "https://" + hostname + "/" + path,
      gitUrl: "https://" + hostname + "/" + path + ".git",
      displayUrl: hostname + "/" + path,
    }),
    getTree: (loc) => _giteaTree(apiBase, loc.path),
    rawUrl: (loc, tree, path) =>
      apiBase +
      "/api/v1/repos/" +
      loc.path +
      "/raw/" +
      path.replace(/^\/+/, "") +
      (tree && tree.ref ? "?ref=" + encodeURIComponent(tree.ref) : ""),
    sourceUrl: (loc, tree, extPath) =>
      "https://" +
      hostname +
      "/" +
      loc.path +
      "/src/branch/" +
      ((tree && tree.ref) || "HEAD") +
      "/" +
      extPath,
  };
};

const codeberg = _makeGiteaFetcher("codeberg.org", "codeberg", "Codeberg");

const _gitlabTree = async (path) => {
  const enc = encodeURIComponent(path);
  let defaultBranch = null;
  try {
    const r = await fetch("https://gitlab.com/api/v4/projects/" + enc);
    if (r.ok) {
      const meta = await r.json();
      if (meta && meta.default_branch) defaultBranch = meta.default_branch;
    }
  } catch (_e) { }
  const refs = defaultBranch ? [defaultBranch] : ["main", "master"];
  for (const ref of refs) {
    const paths = [];
    let page = 1;
    let ok = false;
    while (page < 20) {
      try {
        const r = await fetch(
          "https://gitlab.com/api/v4/projects/" +
          enc +
          "/repository/tree?recursive=true&per_page=100&ref=" +
          encodeURIComponent(ref) +
          "&page=" +
          page
        );
        if (!r.ok) break;
        const data = await r.json();
        if (!Array.isArray(data) || !data.length) break;
        ok = true;
        data.forEach((e) => {
          if (e.type === "blob") paths.push(e.path);
        });
        if (data.length < 100) break;
        page++;
      } catch (_e) {
        break;
      }
    }
    if (ok && paths.length) return { paths, ref, sha: null };
  }
  return null;
};

const gitlab = {
  host: "gitlab",
  label: "GitLab",
  matches: (hostname) => hostname === "gitlab.com",
  buildLoc: (path) => ({
    webUrl: "https://gitlab.com/" + path,
    gitUrl: "https://gitlab.com/" + path + ".git",
    displayUrl: "gitlab.com/" + path,
  }),
  getTree: (loc) => _gitlabTree(loc.path),
  rawUrl: (loc, tree, path) => {
    const enc = encodeURIComponent(loc.path);
    const file = encodeURIComponent(path.replace(/^\/+/, ""));
    const ref = (tree && tree.ref) || "HEAD";
    return (
      "https://gitlab.com/api/v4/projects/" +
      enc +
      "/repository/files/" +
      file +
      "/raw?ref=" +
      encodeURIComponent(ref)
    );
  },
  sourceUrl: (loc, tree, extPath) =>
    loc.webUrl + "/-/tree/" + ((tree && tree.ref) || "HEAD") + "/" + extPath,
};

export const FETCHERS = [github, codeberg, gitlab];

const _giteaDynamicFetchers = new Map();

const _detectGitea = async (hostname) => {
  const cacheKey = "detect:" + hostname;
  const cached = cacheGet(cacheKey, DETECT_TTL_MS);
  if (cached === "gitea") return true;
  if (cached === "none") return false;
  try {
    const r = await fetch("https://" + hostname + "/api/v1/version", {
      headers: { accept: "application/json" },
    });
    if (r.ok) {
      const data = await r.json();
      if (data && typeof data.version === "string") {
        cacheSet(cacheKey, "gitea");
        return true;
      }
    }
  } catch (_e) { }
  cacheSet(cacheKey, "none");
  return false;
};

const _getDynamicGitea = (hostname) => {
  if (_giteaDynamicFetchers.has(hostname))
    return _giteaDynamicFetchers.get(hostname);
  const f = _makeGiteaFetcher(hostname, "gitea");
  _giteaDynamicFetchers.set(hostname, f);
  return f;
};

export const findFetcherByHostname = (hostname) => {
  const known = FETCHERS.find((f) => f.matches(hostname));
  if (known) return known;
  if (_giteaDynamicFetchers.has(hostname))
    return _giteaDynamicFetchers.get(hostname);
  const cached = cacheGet("detect:" + hostname, DETECT_TTL_MS);
  if (cached === "gitea") return _getDynamicGitea(hostname);
  return null;
};

export const resolveFetcher = async (hostname) => {
  const known = findFetcherByHostname(hostname);
  if (known) return known;
  if (await _detectGitea(hostname)) return _getDynamicGitea(hostname);
  return null;
};

export const getFetcherForLoc = (loc) => findFetcherByHostname(loc.hostname);
