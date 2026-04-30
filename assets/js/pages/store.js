import { TYPES, TYPE_LABELS } from "../utils/config.js";
import { escape, authorMarkup, renderAvatar } from "../ui/render.js";
import { typeTag } from "../ui/render.js";
import { parseUrl } from "../utils/url.js";
import { loadStore, rawUrl } from "../utils/api.js";
import { itemsAll } from "../utils/items.js";
import { wireCopyButtons } from "../ui/copy.js";
import { tmpl, loadTmpl } from "../utils/tmpl.js";

const _resolveRepoImage = (img, loc, tree) => {
  if (!img) return "";
  if (/^https?:\/\/|^data:|^\/\//i.test(img)) return img;
  return rawUrl(loc, tree, img.replace(/^\.?\/+/, ""));
};

const _renderHeader = async (loc, pkg, tree) => {
  const avatar = await renderAvatar({
    src: _resolveRepoImage(pkg["repo-image"], loc, tree),
    label: pkg.name || loc.path,
    sizeClass: "ade-store-img",
  });
  const authorHtml = pkg.author ? " &middot; " + authorMarkup(pkg.author) : "";
  const tpl = await loadTmpl("store/header.html");
  return tmpl(tpl, {
    avatar,
    name: escape(pkg.name || loc.path),
    webUrl: escape(loc.webUrl),
    displayUrl: escape(loc.displayUrl),
    authorHtml,
    description: escape(pkg.description || ""),
    gitUrl: escape(loc.gitUrl),
  });
};

const _renderItemRow = async (loc, item) => {
  const href =
    "#repo=" +
    encodeURIComponent(loc.input) +
    "&ext=" +
    encodeURIComponent(item.path);
  const versionTagHtml = item.version
    ? tmpl(await loadTmpl("common/version-tag.html"), {
        version: escape("v" + item.version),
      })
    : "";
  const authorHtml = item.author ? authorMarkup(item.author) : "";
  const tpl = await loadTmpl("store/item-row.html");
  return tmpl(tpl, {
    href: escape(href),
    name: escape(item.name || item.path),
    typeTag: await typeTag(item._kind),
    versionTag: versionTagHtml,
    description: escape(item.description || ""),
    authorHtml,
  });
};

const _renderItemList = async (loc, items) => {
  if (!items.length) return "<p>No items in this category.</p>";
  const rows = await Promise.all(items.map((it) => _renderItemRow(loc, it)));
  return '<ul class="ade-item-list">' + rows.join("") + "</ul>";
};

const _renderTabs = (typesPresent, items, pkg, activeKind) => {
  const allActive = activeKind === "all" ? " ade-tab-active" : "";
  let html =
    '<button type="button" class="ade-tab' +
    allActive +
    '" data-kind="all">All (' +
    items.length +
    ")</button>";
  typesPresent.forEach((t) => {
    const active = activeKind === t ? " ade-tab-active" : "";
    html +=
      '<button type="button" class="ade-tab' +
      active +
      '" data-kind="' +
      t +
      '">' +
      escape(TYPE_LABELS[t]) +
      " (" +
      pkg[t].length +
      ")</button>";
  });
  return html;
};

export async function renderStoreView(containerEl, repoInput) {
  containerEl.innerHTML = "<p>Loading...</p>";
  const loc = await parseUrl(repoInput);
  const errorTpl = await loadTmpl("common/error.html");
  if (!loc) {
    containerEl.innerHTML = tmpl(errorTpl, {
      message: "Missing or invalid repo parameter.",
    });
    return;
  }
  document.title = loc.displayUrl + " — Awesome degoog extensions";
  const data = await loadStore(loc);
  if (!data) {
    containerEl.innerHTML = tmpl(errorTpl, {
      message:
        "Could not load " +
        escape(loc.displayUrl) +
        ". Repo may be private or missing a root package.json.",
    });
    return;
  }
  const items = itemsAll(data.pkg);
  const typesPresent = TYPES.filter(
    (t) => Array.isArray(data.pkg[t]) && data.pkg[t].length,
  );
  let activeKind = "all";

  function _wireTabs() {
    containerEl.querySelectorAll(".ade-tab").forEach((btn) => {
      if (btn._adeTabWired) return;
      btn._adeTabWired = true;
      btn.addEventListener("click", () =>
        _paint(btn.getAttribute("data-kind")),
      );
    });
  }

  async function _paint(kind) {
    activeKind = kind;
    const subset =
      kind === "all" ? items : items.filter((it) => it._kind === kind);
    const tabsEl = containerEl.querySelector("#ade-store-tabs");
    if (tabsEl)
      tabsEl.innerHTML = _renderTabs(typesPresent, items, data.pkg, activeKind);
    const listEl = containerEl.querySelector("#ade-store-list");
    if (listEl) listEl.innerHTML = await _renderItemList(loc, subset);
    const filterEl = containerEl.querySelector("#ade-store-filter");
    if (filterEl && filterEl.value) filterEl.dispatchEvent(new Event("input"));
    _wireTabs();
    wireCopyButtons();
  }

  function _wireFilter() {
    const filterEl = containerEl.querySelector("#ade-store-filter");
    if (!filterEl) return;
    filterEl.addEventListener("input", () => {
      const q = filterEl.value.trim().toLowerCase();
      const listEl = containerEl.querySelector("#ade-store-list");
      if (!listEl) return;
      Array.prototype.forEach.call(
        listEl.querySelectorAll(".ade-item-row"),
        (row) => {
          const hay = (row.textContent || "").toLowerCase();
          row.style.display = !q || hay.indexOf(q) >= 0 ? "" : "none";
        },
      );
    });
  }

  containerEl.innerHTML =
    (await _renderHeader(loc, data.pkg, data.tree)) +
    '<div class="ade-store-controls">' +
    '<input id="ade-store-filter" class="ade-input" type="search" placeholder="Filter items..." autocomplete="off">' +
    "</div>" +
    '<div id="ade-store-tabs" class="ade-tabs">' +
    _renderTabs(typesPresent, items, data.pkg, activeKind) +
    "</div>" +
    '<div id="ade-store-list">' +
    (await _renderItemList(loc, items)) +
    "</div>";

  _wireTabs();
  _wireFilter();
  wireCopyButtons();
}
