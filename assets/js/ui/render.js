import { TYPE_SINGULAR } from "../utils/config.js";
import { tmpl, loadTmpl } from "../utils/tmpl.js";

export const escape = (s) => {
  const d = document.createElement("div");
  d.textContent = s == null ? "" : String(s);
  return d.innerHTML;
};

export const stripGit = (s) => s.replace(/\.git$/i, "").replace(/\/+$/, "");

export const hasFile = (treePaths, p) => treePaths.indexOf(p) >= 0;

export const typeTag = async (kind) => {
  const t = TYPE_SINGULAR[kind] || kind;
  const tpl = await loadTmpl("common/type-tag.html");
  return tmpl(tpl, { type: escape(t) });
};

export const authorMarkup = (author) => {
  if (!author) return "";
  if (typeof author === "string")
    return '<span class="ade-author">by ' + escape(author) + "</span>";
  const name = escape(author.name || "");
  if (author.url) {
    return (
      '<span class="ade-author">by <a href="' +
      escape(author.url) +
      '" target="_blank" rel="noopener">' +
      name +
      "</a></span>"
    );
  }
  return '<span class="ade-author">by ' + name + "</span>";
};

export const hostBadge = (host) =>
  '<span class="ade-host-badge">' + escape(host) + "</span>";

const _hashHue = (s) => {
  let h = 0;
  const str = s || "";
  for (let i = 0; i < str.length; i++) {
    h = (h * 31 + str.charCodeAt(i)) >>> 0;
  }
  return h % 360;
};

const _firstLetter = (s) => {
  const t = (s || "").trim();
  if (!t) return "?";
  const ch = t.charAt(0).toUpperCase();
  return /[A-Z0-9]/.test(ch) ? ch : "?";
};

export const renderAvatar = async ({ src, label, sizeClass }) => {
  const letter = _firstLetter(label);
  const hue = _hashHue(label || "");
  const inner = src
    ? '<img src="' +
      escape(src) +
      '" alt="" loading="lazy" onerror="this.remove()">'
    : "";
  const tpl = await loadTmpl("common/avatar.html");
  return tmpl(tpl, {
    sizeClass: escape(sizeClass || ""),
    hue: String(hue),
    letter: escape(letter),
    inner,
  });
};
