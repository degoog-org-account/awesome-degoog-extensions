import { TYPES, TYPE_SINGULAR, IMG_EXT } from "./config.js";

export const itemsAll = (pkg) => {
  const out = [];
  TYPES.forEach((t) => {
    if (!Array.isArray(pkg[t])) return;
    pkg[t].forEach((it) => {
      out.push({ _kind: t, _type: TYPE_SINGULAR[t], ...it });
    });
  });
  return out;
};

export const findItem = (pkg, path) => {
  const items = itemsAll(pkg);
  const norm = path.replace(/^\/+|\/+$/g, "");
  return items.find((it) => it.path === norm) || null;
};

export const firstScreenshot = (treePaths, extPath) => {
  const prefix = extPath.replace(/\/+$/, "") + "/screenshots/";
  for (let i = 0; i < treePaths.length; i++) {
    if (treePaths[i].indexOf(prefix) === 0 && IMG_EXT.test(treePaths[i]))
      return treePaths[i];
  }
  return null;
};

export const findScreenshots = (treePaths, extPath) => {
  const prefix = extPath.replace(/\/+$/, "") + "/screenshots/";
  return treePaths
    .filter((p) => p.indexOf(prefix) === 0 && IMG_EXT.test(p))
    .sort();
};
