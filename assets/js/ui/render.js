import { TYPE_SINGULAR } from "../utils/config.js";

export const escape = (s) => {
  const d = document.createElement("div");
  d.textContent = s == null ? "" : String(s);
  return d.innerHTML;
};

export const stripGit = (s) => s.replace(/\.git$/i, "").replace(/\/+$/, "");

export const hasFile = (treePaths, p) => treePaths.indexOf(p) >= 0;

export const typeTag = (kind) => {
  const t = TYPE_SINGULAR[kind] || kind;
  return (
    '<span class="tag is-rounded ade-tag-' +
    escape(t) +
    '">' +
    escape(t) +
    "</span>"
  );
};

export const authorMarkup = (author) => {
  if (!author) return "";
  if (typeof author === "string")
    return '<span class="has-text-grey">by ' + escape(author) + "</span>";
  const name = escape(author.name || "");
  if (author.url) {
    return (
      '<span class="has-text-grey">by <a href="' +
      escape(author.url) +
      '" target="_blank" rel="noopener">' +
      name +
      "</a></span>"
    );
  }
  return '<span class="has-text-grey">by ' + name + "</span>";
};

export const hostBadge = (host) =>
  '<span class="tag is-light is-small ade-host-badge">' +
  escape(host) +
  "</span>";

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

export const renderAvatar = ({ src, label, sizeClass }) => {
  const letter = _firstLetter(label);
  const hue = _hashHue(label || "");
  const inner = src
    ? '<img src="' +
    escape(src) +
    '" alt="" loading="lazy" onerror="this.remove()">'
    : "";
  return (
    '<span class="ade-avatar ' +
    sizeClass +
    '" style="--ade-h:' +
    hue +
    '" data-letter="' +
    escape(letter) +
    '">' +
    inner +
    "</span>"
  );
};
