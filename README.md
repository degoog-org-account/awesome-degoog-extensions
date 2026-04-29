# Awesome degoog extensions

A quick showcase of community store repositories for [degoog](https://github.com/fccview/degoog).

## Submitting a store

1. Build a degoog store repo following the [store docs](https://github.com/fccview/degoog/blob/main/docs/store.html)
2. Open a PR adding the repo URL (e.g. `"https://github.com/owner/repo"`) to [stores.json](./stores.json).

That's it, you've done your part, your store will be reviewed and if it adheres to good old common sense it'll likely be approved.
Stores with avatar/screenshots and well thought out descriptions will have a higher chance of being approved.

## Supported hosts

GitHub, Codeberg, and GitLab.com are supported out of the box.

Self-hosted **Gitea** and **Forgejo** instances work without any code changes, the site detects them automatically by probing `/api/v1/version` on first encounter (the result is cached for 7 days). 

The instance just needs to expose its API publicly with CORS (default Gitea/Forgejo config does).

To add support for a different git host (sourcehut, BitBucket, etc.), open a PR adding a fetcher to [`assets/js/utils/fetchers.js`](./assets/js/utils/fetchers.js). A fetcher is a small object with these fields:

- `host` — short identifier (e.g. `"github"`)
- `label` — human-readable name
- `matches(hostname)` — returns true for hostnames this fetcher handles
- `buildLoc(path)` — returns `{ webUrl, gitUrl, displayUrl }`
- `getTree(loc)` — returns `{ paths, ref, sha }` for the repo tree
- `rawUrl(loc, tree, path)` — returns a **CORS-enabled** URL for fetching a file
- `sourceUrl(loc, tree, extPath)` — returns a URL to view the folder on the host

Append it to the `FETCHERS` array. The endpoints you point at must allow `Access-Control-Allow-Origin: *` (the site is plain static HTML on GitHub Pages — no proxy).