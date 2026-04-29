import { TYPES, TYPE_LABELS } from "../utils/config.js";
import { escape, authorMarkup, renderAvatar } from "../ui/render.js";
import { parseUrl } from "../utils/url.js";
import { loadStore, rawUrl } from "../utils/api.js";
import { itemsAll } from "../utils/items.js";
import { renderItemCard } from "../ui/cards.js";
import { wireFilter } from "../ui/filter.js";
import { wireCopyButtons } from "../ui/copy.js";

const _resolveRepoImage = (img, loc, tree) => {
  if (!img) return "";
  if (/^https?:\/\/|^data:|^\/\//i.test(img)) return img;
  return rawUrl(loc, tree, img.replace(/^\.?\/+/, ""));
};

const _renderHead = (loc, pkg, tree) => {
  const avatar = renderAvatar({
    src: _resolveRepoImage(pkg["repo-image"], loc, tree),
    label: pkg.name || loc.path,
    sizeClass: "ade-store-img",
  });
  return (
    '<div class="ade-store-head">' +
    '<div class="ade-store-head-media">' +
    avatar +
    '<div class="ade-store-head-content">' +
    '<h2 class="title is-4 mb-1">' +
    escape(pkg.name || loc.path) +
    "</h2>" +
    '<p class="subtitle is-6 has-text-grey mb-2">' +
    '<a href="' +
    escape(loc.webUrl) +
    '" target="_blank" rel="noopener">' +
    escape(loc.displayUrl) +
    "</a>" +
    (pkg.author ? " &middot; " + authorMarkup(pkg.author) : "") +
    "</p>" +
    '<p class="has-text-grey-light mb-3">' +
    escape(pkg.description || "") +
    "</p>" +
    "</div>" +
    "</div>" +
    '<div class="field has-addons mb-0 ade-store-git">' +
    '<p class="control"><span class="button is-small is-static">git</span></p>' +
    '<p class="control is-expanded"><input class="input is-small" type="text" readonly value="' +
    escape(loc.gitUrl) +
    '" onclick="this.select()"></p>' +
    '<p class="control"><button type="button" class="button is-small" data-copy="' +
    escape(loc.gitUrl) +
    '">Copy</button></p>' +
    "</div>" +
    "</div>"
  );
};

const _renderTabs = (tabs, items, pkg) => {
  const typesPresent = TYPES.filter(
    (t) => Array.isArray(pkg[t]) && pkg[t].length
  );
  let html =
    '<button type="button" class="button is-small ade-tab is-link" data-kind="all" aria-pressed="true">All (' +
    items.length +
    ")</button>";
  typesPresent.forEach((t) => {
    html +=
      '<button type="button" class="button is-small ade-tab" data-kind="' +
      t +
      '" aria-pressed="false">' +
      escape(TYPE_LABELS[t]) +
      " (" +
      pkg[t].length +
      ")</button>";
  });
  tabs.innerHTML = html;
};

const _wireTabs = (tabs, paint) => {
  Array.prototype.forEach.call(tabs.querySelectorAll(".ade-tab"), (b) => {
    b.addEventListener("click", () => {
      Array.prototype.forEach.call(tabs.querySelectorAll(".ade-tab"), (x) => {
        x.setAttribute("aria-pressed", "false");
        x.classList.remove("is-link");
      });
      b.setAttribute("aria-pressed", "true");
      b.classList.add("is-link");
      paint(b.getAttribute("data-kind"));
    });
  });
};

export const renderStore = async () => {
  const params = new URLSearchParams(location.search);
  const loc = await parseUrl(params.get("repo"));
  const head = document.getElementById("ade-store-head");
  const grid = document.getElementById("ade-items");
  const tabs = document.getElementById("ade-tabs");
  const err = document.getElementById("ade-error");
  if (!loc) {
    head.innerHTML = "";
    err.hidden = false;
    err.textContent = "Missing or invalid ?repo= parameter.";
    return;
  }
  document.title = loc.displayUrl + " — Awesome degoog extensions";
  const data = await loadStore(loc);
  if (!data) {
    head.innerHTML = "";
    err.hidden = false;
    err.innerHTML =
      "Could not load <code>" +
      escape(loc.displayUrl) +
      "</code>. Repo may be private or missing a root <code>package.json</code>.";
    return;
  }
  head.innerHTML = _renderHead(loc, data.pkg, data.tree);
  const items = itemsAll(data.pkg);
  if (!items.length) {
    grid.innerHTML =
      '<div class="column"><div class="notification">This store has no items yet.</div></div>';
    wireCopyButtons();
    return;
  }
  _renderTabs(tabs, items, data.pkg);
  const paint = (kind) => {
    const subset =
      kind === "all" ? items : items.filter((it) => it._kind === kind);
    grid.innerHTML = subset
      .map((it) => renderItemCard(loc, data.tree, it))
      .join("");
    const f = document.getElementById("ade-filter");
    if (f && f.value) f.dispatchEvent(new Event("input"));
  };
  paint("all");
  _wireTabs(tabs, paint);
  wireFilter("ade-filter", "ade-items");
  wireCopyButtons();
};
