import { escape } from "./render.js";
import { rawUrl } from "../utils/api.js";

export const renderMarkdown = (md, loc, tree, extPath) => {
  if (!window.marked) return escape(md);
  const renderer = new window.marked.Renderer();
  const origImage = renderer.image.bind(renderer);
  renderer.image = (href, title, text) => {
    let resolved = href;
    if (resolved && !/^https?:|^data:|^\/\//i.test(resolved)) {
      const clean = resolved.replace(/^\.\/+/, "");
      resolved = rawUrl(loc, tree, extPath + "/" + clean);
    }
    return origImage(resolved, title, text);
  };
  const origLink = renderer.link.bind(renderer);
  renderer.link = (href, title, text) => {
    let resolved = href;
    if (
      resolved &&
      !/^https?:|^mailto:|^#|^\/\//i.test(resolved) &&
      !resolved.startsWith("/")
    ) {
      const clean = resolved.replace(/^\.\/+/, "");
      resolved = loc.webUrl + "/blob/HEAD/" + extPath + "/" + clean;
    }
    const html = origLink(resolved, title, text);
    return html.replace(
      /^<a /,
      '<a target="_blank" rel="noopener noreferrer" '
    );
  };
  return window.marked.parse(md, {
    gfm: true,
    breaks: false,
    renderer,
  });
};
