import { applyTheme, injectThemeToggle } from "./ui/theme.js";
import { fetchStores } from "./utils/api.js";
import { wireRefresh } from "./ui/refresh.js";
import { loadSidebar, setActiveNav } from "./pages/index.js";
import { renderStoreView } from "./pages/store.js";
import { renderExtensionView } from "./pages/extension.js";
import { wireSearch, indexStore } from "./ui/search.js";
import { wireLightbox } from "./ui/slider.js";
import { loadTmpl, tmpl } from "./utils/tmpl.js";

const _parseHash = () => {
  const hash = location.hash.replace(/^#/, "");
  const params = new URLSearchParams(hash);
  return {
    repo: params.get("repo") || "",
    ext: params.get("ext") || "",
  };
};

const _mainEl = () => document.getElementById("ade-main");

function _closeSidebar() {
  const sidebar = document.querySelector(".ade-sidebar");
  const backdrop = document.getElementById("ade-backdrop");
  if (sidebar) sidebar.classList.remove("ade-sidebar-open");
  if (backdrop) backdrop.style.display = "none";
}

async function _renderWelcome() {
  const el = _mainEl();
  if (!el) return;
  const tpl = await loadTmpl("welcome.html");
  el.innerHTML = tmpl(tpl, {});
  try {
    const r = await fetch(
      "https://raw.githubusercontent.com/degoog-org/awesome-degoog-extensions/main/README.md",
    );
    if (!r.ok) return;
    const md = await r.text();
    const readmeEl = el.querySelector(".ade-welcome-readme");
    if (!readmeEl) return;
    readmeEl.innerHTML = window.marked
      ? window.marked.parse(md, { gfm: true, breaks: false })
      : md.replace(/&/g, "&amp;").replace(/</g, "&lt;");
    readmeEl.querySelectorAll("a[href]").forEach((a) => {
      if (/^https?:/i.test(a.getAttribute("href") || "")) {
        a.setAttribute("target", "_blank");
        a.setAttribute("rel", "noopener noreferrer");
      }
    });
  } catch (err) {
    console.warn("welcome README render failed:", err);
  }
}

async function navigate() {
  const { repo, ext } = _parseHash();
  const el = _mainEl();
  if (!el) return;
  setActiveNav(repo || null);
  if (!repo) {
    await _renderWelcome();
    return;
  }
  if (ext) {
    await renderExtensionView(el, repo, ext);
  } else {
    await renderStoreView(el, repo);
  }
}

async function boot() {
  applyTheme();
  injectThemeToggle();
  wireLightbox();

  const refreshBtn = document.getElementById("ade-refresh");
  if (refreshBtn) wireRefresh(refreshBtn);

  const inputs = await fetchStores();

  const searchEl = document.getElementById("ade-search");
  wireSearch(searchEl, _mainEl(), () => {
    if (searchEl) searchEl.value = "";
    navigate();
  });

  window.addEventListener("hashchange", () => {
    if (searchEl) searchEl.value = "";
    _closeSidebar();
    navigate();
  });

  const burgerBtn = document.getElementById("ade-burger");
  const backdrop = document.getElementById("ade-backdrop");
  if (burgerBtn) {
    burgerBtn.addEventListener("click", () => {
      const sidebar = document.querySelector(".ade-sidebar");
      if (!sidebar) return;
      const opening = !sidebar.classList.contains("ade-sidebar-open");
      sidebar.classList.toggle("ade-sidebar-open");
      if (backdrop) backdrop.style.display = opening ? "block" : "none";
    });
  }
  if (backdrop) backdrop.addEventListener("click", _closeSidebar);

  document.addEventListener("click", (e) => {
    if (!e.target.closest(".ade-nav-item")) return;
    _closeSidebar();
  });

  await loadSidebar(inputs, (storeInput, storeName, items) => {
    indexStore(storeInput, storeName, items);
  });

  await navigate();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot);
} else {
  boot();
}
