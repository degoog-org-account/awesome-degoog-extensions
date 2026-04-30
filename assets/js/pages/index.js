import { loadStore, rawUrl } from "../utils/api.js";
import { parseUrl } from "../utils/url.js";
import { itemsAll } from "../utils/items.js";
import { escape, renderAvatar } from "../ui/render.js";
import { tmpl, loadTmpl } from "../utils/tmpl.js";

const _nav = () => document.getElementById("ade-nav");

const _skelId = (i) => "ade-nav-skel-" + i;

async function _insertSkel(i) {
  const nav = _nav();
  if (!nav) return;
  const skelTpl = await loadTmpl("sidebar/nav-item-skel.html");
  const div = document.createElement("div");
  div.id = _skelId(i);
  div.innerHTML = skelTpl;
  nav.appendChild(div);
}

function _replaceSkel(i, html) {
  const el = document.getElementById(_skelId(i));
  if (!el) return;
  el.outerHTML = html;
}

export async function loadSidebar(inputs, onStoreLoadedFn) {
  await Promise.all(inputs.map((_u, i) => _insertSkel(i)));
  await Promise.all(
    inputs.map(async (raw, i) => {
      const loc = await parseUrl(raw);
      if (!loc) {
        _replaceSkel(i, "");
        return;
      }
      const data = await loadStore(loc);
      if (!data) {
        _replaceSkel(i, "");
        return;
      }
      const navItemTpl = await loadTmpl("sidebar/nav-item.html");
      const storeName = escape(data.pkg.name || loc.path);
      const href = "#repo=" + encodeURIComponent(raw);
      const repoImg = (() => {
        const img = data.pkg["repo-image"];
        if (!img) return "";
        if (/^https?:\/\/|^data:|^\/\//i.test(img)) return img;
        return rawUrl(loc, data.tree, img.replace(/^\.?\/+/, ""));
      })();
      const avatarHtml = await renderAvatar({
        src: repoImg,
        label: data.pkg.name || loc.path,
        sizeClass: "ade-nav-img",
      });
      const html = tmpl(navItemTpl, {
        href,
        repo: escape(String(raw)),
        name: storeName,
        path: escape(loc.displayUrl),
        avatar: avatarHtml,
      });
      _replaceSkel(i, html);
      const items = itemsAll(data.pkg);
      onStoreLoadedFn(raw, data.pkg.name || loc.path, items);
    }),
  );
}

export function setActiveNav(repoInput) {
  document.querySelectorAll(".ade-nav-item").forEach((el) => {
    el.classList.remove("ade-nav-active");
  });
  if (!repoInput) return;
  const target = document.querySelector(
    '.ade-nav-item[data-repo="' + CSS.escape(String(repoInput)) + '"]',
  );
  if (target) target.classList.add("ade-nav-active");
}
