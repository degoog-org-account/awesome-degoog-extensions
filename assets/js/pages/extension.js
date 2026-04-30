import { escape, hasFile, typeTag, authorMarkup } from "../ui/render.js";
import { parseUrl } from "../utils/url.js";
import { loadStore, fetchJSON, fetchText, rawUrl, sourceUrl } from "../utils/api.js";
import { findItem, findScreenshots } from "../utils/items.js";
import { renderMarkdown } from "../ui/markdown.js";
import { initSlider } from "../ui/slider.js";
import { tmpl, loadTmpl } from "../utils/tmpl.js";

const _resolveReadmePath = (treePaths, extPath) => {
  const candidates = [
    extPath + "/README.md",
    extPath + "/readme.md",
    extPath + "/README.MD",
  ];
  return candidates.find((p) => hasFile(treePaths, p)) || null;
};

const _resolveAuthor = async (data, loc, extPath) => {
  const authorPath = extPath + "/author.json";
  if (!hasFile(data.tree.paths, authorPath)) return data.pkg.author;
  const override = await fetchJSON(loc, data.tree, authorPath);
  return override || data.pkg.author;
};

export async function renderExtensionView(containerEl, repoInput, extPath) {
  containerEl.innerHTML = "<p>Loading...</p>";
  const loc = await parseUrl(repoInput);
  const cleanPath = (extPath || "").replace(/^\/+|\/+$/g, "");
  const errorTpl = await loadTmpl("common/error.html");
  if (!loc || !cleanPath) {
    containerEl.innerHTML = tmpl(errorTpl, {
      message: "Missing or invalid repo and ext parameters.",
    });
    return;
  }
  const data = await loadStore(loc);
  if (!data) {
    containerEl.innerHTML = tmpl(errorTpl, {
      message: "Could not load store " + escape(loc.displayUrl) + ".",
    });
    return;
  }
  const item = findItem(data.pkg, cleanPath);
  if (!item) {
    containerEl.innerHTML = tmpl(errorTpl, {
      message:
        "Extension " +
        escape(cleanPath) +
        " not found in package.json.",
    });
    return;
  }
  document.title = (item.name || cleanPath) + " — Awesome degoog extensions";

  const storeHref =
    "#repo=" + encodeURIComponent(repoInput);
  const crumbsTpl = await loadTmpl("extension/crumbs.html");
  const crumbsHtml = tmpl(crumbsTpl, {
    storeHref: escape(storeHref),
    storeName: escape(data.pkg.name || loc.path),
    extName: escape(item.name || cleanPath),
  });

  const author = await _resolveAuthor(data, loc, cleanPath);
  const versionTagHtml = item.version
    ? tmpl(await loadTmpl("common/version-tag.html"), { version: escape("v" + item.version) })
    : "";
  const authorHtml = author ? " &middot; " + authorMarkup(author) : "";
  const depsHtml =
    Array.isArray(item.dependencies) && item.dependencies.length
      ? '<p class="ade-ext-deps">Dependencies: ' +
        item.dependencies
          .map((d) => "<code>" + escape(d) + "</code>")
          .join(", ") +
        "</p>"
      : "";

  const extHeaderTpl = await loadTmpl("extension/header.html");
  const extHeaderHtml = tmpl(extHeaderTpl, {
    name: escape(item.name || cleanPath),
    typeTag: await typeTag(item._kind),
    versionTag: versionTagHtml,
    authorHtml,
    sourceUrl: escape(sourceUrl(loc, data.tree, cleanPath)),
    description: escape(item.description || ""),
    depsHtml,
  });

  containerEl.innerHTML =
    crumbsHtml +
    '<div class="ade-ext-head">' +
    extHeaderHtml +
    "</div>" +
    '<section id="ade-screenshots" aria-label="Screenshots" hidden></section>' +
    '<section id="ade-readme" class="ade-readme" aria-label="README" hidden></section>' +
    '<p id="ade-no-readme" class="ade-no-readme" hidden>No <code>README.md</code> for this extension.</p>';

  const shots = containerEl.querySelector("#ade-screenshots");
  const readme = containerEl.querySelector("#ade-readme");
  const noReadme = containerEl.querySelector("#ade-no-readme");

  const screenshots = findScreenshots(data.tree.paths, cleanPath);
  if (screenshots.length) {
    const urls = screenshots.map((p) => rawUrl(loc, data.tree, p));
    initSlider(shots, urls);
  }

  const readmePath = _resolveReadmePath(data.tree.paths, cleanPath);
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
  readme.innerHTML = renderMarkdown(md, loc, data.tree, cleanPath);
  readme.querySelectorAll("a[href]").forEach((a) => {
    const h = a.getAttribute("href") || "";
    if (/^https?:/i.test(h)) {
      a.setAttribute("target", "_blank");
      a.setAttribute("rel", "noopener noreferrer");
    }
  });
}
