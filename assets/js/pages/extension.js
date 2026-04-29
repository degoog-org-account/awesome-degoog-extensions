import { escape, hasFile, typeTag, authorMarkup } from "../ui/render.js";
import { parseUrl } from "../utils/url.js";
import { loadStore, fetchJSON, fetchText, rawUrl, sourceUrl } from "../utils/api.js";
import { findItem, findScreenshots } from "../utils/items.js";
import { renderMarkdown } from "../ui/markdown.js";
import { initSlider, wireLightbox } from "../ui/slider.js";

const _renderCrumbs = (crumbs, loc, data, item, extPath) => {
  crumbs.innerHTML =
    '<div class="is-flex is-align-items-center" style="gap: 8px">' +
    '<a class="has-text-grey is-flex is-align-items-center" style="gap: 8px" href="index.html"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 19l-7-7 7-7"></path></svg>All stores</a> &rsaquo; ' +
    '<a class="has-text-grey" href="store.html?repo=' +
    encodeURIComponent(loc.input) +
    '">' +
    escape(data.pkg.name || loc.path) +
    "</a> &rsaquo; <span>" +
    escape(item.name || extPath) +
    "</span>" +
    "</div>";
};

const _renderHead = (head, loc, tree, item, extPath, author) => {
  const depsHtml =
    Array.isArray(item.dependencies) && item.dependencies.length
      ? '<p class="mt-3 has-text-grey is-size-7">Dependencies: ' +
      item.dependencies
        .map((d) => "<code>" + escape(d) + "</code>")
        .join(", ") +
      "</p>"
      : "";
  head.innerHTML =
    '<h1 class="title is-3 mb-2">' +
    escape(item.name || extPath) +
    "</h1>" +
    '<p class="subtitle is-6 has-text-grey mb-2">' +
    typeTag(item._kind) +
    (item.type
      ? ' <span class="tag is-light">' + escape(item.type) + "</span>"
      : "") +
    (item.version
      ? ' <span class="tag is-rounded">v' + escape(item.version) + "</span>"
      : "") +
    (author ? " &middot; " + authorMarkup(author) : "") +
    "</p>" +
    '<p class="content mb-0">' +
    escape(item.description || "") +
    "</p>" +
    '<p class="is-size-7 mt-2"><a target="_blank" rel="noopener" href="' +
    escape(sourceUrl(loc, tree, extPath)) +
    '">View source &rarr;</a></p>' +
    depsHtml;
};

const _resolveReadmePath = (treePaths, extPath) => {
  const candidates = [
    extPath + "/README.md",
    extPath + "/readme.md",
    extPath + "/README.MD",
  ];
  return candidates.find((p) => hasFile(treePaths, p)) || null;
};

const _renderReadme = async (readme, noReadme, data, loc, extPath) => {
  const readmePath = _resolveReadmePath(data.tree.paths, extPath);
  if (!readmePath) {
    noReadme.hidden = false;
    return;
  }
  const md = await fetchText(loc, data.tree, readmePath);
  if (!md) {
    noReadme.hidden = false;
    return;
  }
  readme.hidden = false;
  readme.innerHTML = renderMarkdown(md, loc, data.tree, extPath);
  readme.querySelectorAll("a[href]").forEach((a) => {
    const h = a.getAttribute("href") || "";
    if (/^https?:/i.test(h)) {
      a.setAttribute("target", "_blank");
      a.setAttribute("rel", "noopener noreferrer");
    }
  });
};

const _resolveAuthor = async (data, loc, extPath) => {
  const authorPath = extPath + "/author.json";
  if (!hasFile(data.tree.paths, authorPath)) return data.pkg.author;
  const override = await fetchJSON(loc, data.tree, authorPath);
  return override || data.pkg.author;
};

export const renderExtension = async () => {
  const params = new URLSearchParams(location.search);
  const loc = await parseUrl(params.get("repo"));
  const extPath = (params.get("path") || "").replace(/^\/+|\/+$/g, "");
  const head = document.getElementById("ade-ext-head");
  const crumbs = document.getElementById("ade-crumbs");
  const shots = document.getElementById("ade-screenshots");
  const readme = document.getElementById("ade-readme");
  const noReadme = document.getElementById("ade-no-readme");
  const err = document.getElementById("ade-error");
  if (!loc || !extPath) {
    head.innerHTML = "";
    err.hidden = false;
    err.textContent = "Missing or invalid ?repo= and ?path= parameters.";
    return;
  }
  const data = await loadStore(loc);
  if (!data) {
    head.innerHTML = "";
    err.hidden = false;
    err.innerHTML =
      "Could not load store <code>" + escape(loc.displayUrl) + "</code>.";
    return;
  }
  const item = findItem(data.pkg, extPath);
  if (!item) {
    head.innerHTML = "";
    err.hidden = false;
    err.innerHTML =
      "Extension <code>" +
      escape(extPath) +
      "</code> not found in <code>package.json</code>.";
    return;
  }
  document.title = (item.name || extPath) + " — Awesome degoog extensions";
  _renderCrumbs(crumbs, loc, data, item, extPath);
  const author = await _resolveAuthor(data, loc, extPath);
  _renderHead(head, loc, data.tree, item, extPath, author);

  const screenshots = findScreenshots(data.tree.paths, extPath);
  if (screenshots.length) {
    const urls = screenshots.map((p) => rawUrl(loc, data.tree, p));
    initSlider(shots, urls);
    wireLightbox();
  }
  await _renderReadme(readme, noReadme, data, loc, extPath);
};
