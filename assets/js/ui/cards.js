import { TYPES, TYPE_LABELS, TYPE_SINGULAR } from "../utils/config.js";
import {
  escape,
  typeTag,
  authorMarkup,
  hostBadge,
  renderAvatar,
} from "./render.js";
import { rawUrl } from "../utils/api.js";
import { firstScreenshot } from "../utils/items.js";

const _resolveRepoImage = (img, loc, tree) => {
  if (!img) return "";
  if (/^https?:\/\/|^data:|^\/\//i.test(img)) return img;
  return rawUrl(loc, tree, img.replace(/^\.?\/+/, ""));
};

const _countTags = (pkg) =>
  TYPES.map((t) => {
    const n = Array.isArray(pkg[t]) ? pkg[t].length : 0;
    if (!n) return "";
    return (
      '<span class="tag is-rounded ade-tag-' +
      escape(TYPE_SINGULAR[t]) +
      '">' +
      n +
      " " +
      escape(TYPE_LABELS[t].toLowerCase()) +
      "</span>"
    );
  })
    .filter(Boolean)
    .join(" ");

export const renderStoreCard = (loc, pkg, tree) => {
  const href = "store.html?repo=" + encodeURIComponent(loc.input);
  const avatar = renderAvatar({
    src: _resolveRepoImage(pkg["repo-image"], loc, tree),
    label: pkg.name || loc.path,
    sizeClass: "ade-card-img",
  });
  return (
    '<a class="ade-card-link" href="' +
    href +
    '">' +
    '<div class="card ade-card">' +
    '<div class="card-content">' +
    '<div class="media mb-3">' +
    '<div class="media-left">' +
    avatar +
    "</div>" +
    '<div class="media-content">' +
    '<p class="title is-6 mb-1">' +
    escape(pkg.name || loc.path) +
    "</p>" +
    '<p class="subtitle is-7 has-text-grey mb-0">' +
    hostBadge(loc.host) +
    " " +
    escape(loc.path) +
    (pkg.author ? " &middot; " + authorMarkup(pkg.author) : "") +
    "</p>" +
    "</div>" +
    "</div>" +
    '<p class="has-text-grey-light">' +
    escape(pkg.description || "") +
    "</p>" +
    '<div class="ade-card-meta tags">' +
    _countTags(pkg) +
    "</div>" +
    "</div>" +
    "</div>" +
    "</a>"
  );
};

export const renderSkeletonCard = () =>
  '<div class="card ade-card ade-card-skeleton">' +
  '<div class="card-content">' +
  '<div class="media mb-3">' +
  '<div class="media-left">' +
  '<div class="ade-skeleton-block ade-card-img"></div>' +
  "</div>" +
  '<div class="media-content" style="overflow:hidden">' +
  '<p class="ade-skeleton-line" style="width:72%;height:14px;margin-bottom:8px"></p>' +
  '<p class="ade-skeleton-line ade-skeleton-line-short" style="height:11px"></p>' +
  "</div>" +
  "</div>" +
  '<p class="ade-skeleton-line" style="height:11px"></p>' +
  '<p class="ade-skeleton-line ade-skeleton-line-short" style="height:11px;margin-bottom:0"></p>' +
  '<div class="ade-card-meta tags" style="padding-top:12px">' +
  '<span class="ade-skeleton-block" style="width:72px;height:22px;border-radius:999px;display:inline-block"></span>' +
  '<span class="ade-skeleton-block" style="width:60px;height:22px;border-radius:999px;display:inline-block;margin-left:4px"></span>' +
  "</div>" +
  "</div>" +
  "</div>";

export const renderBrokenCard = (input, msg) =>
  '<div class="card ade-card ade-card-broken">' +
  '<div class="card-content">' +
  '<p class="title is-6">' +
  escape(input) +
  "</p>" +
  '<p class="has-text-grey">' +
  escape(msg || "Store unavailable.") +
  "</p>" +
  "</div>" +
  "</div>";

export const renderItemCard = (loc, tree, item) => {
  const href =
    "extension.html?repo=" +
    encodeURIComponent(loc.input) +
    "&path=" +
    encodeURIComponent(item.path);
  const typeLabel = item.type
    ? '<span class="tag is-light">' + escape(item.type) + "</span>"
    : "";
  const shotPath = firstScreenshot(tree.paths, item.path);
  const imgBlock = shotPath
    ? '<div class="card-image"><figure class="image ade-thumb"><img src="' +
    escape(rawUrl(loc, tree, shotPath)) +
    '" alt="" loading="lazy" onerror="this.parentNode.parentNode.style.display=\'none\'"></figure></div>'
    : "";
  return (
    '<div class="column is-one-third-desktop is-half-tablet">' +
    '<a class="ade-card-link" href="' +
    href +
    '">' +
    '<div class="card ade-card">' +
    imgBlock +
    '<div class="card-content">' +
    '<div class="is-flex is-justify-content-space-between is-align-items-flex-start mb-2" style="gap:8px">' +
    '<p class="title is-6 mb-0">' +
    escape(item.name || item.path) +
    "</p>" +
    typeTag(item._kind) +
    "</div>" +
    '<p class="has-text-grey-light">' +
    escape(item.description || "") +
    "</p>" +
    '<div class="ade-card-meta tags">' +
    (item.version
      ? '<span class="tag is-rounded">v' + escape(item.version) + "</span> "
      : "") +
    typeLabel +
    "</div>" +
    "</div>" +
    "</div>" +
    "</a>" +
    "</div>"
  );
};
