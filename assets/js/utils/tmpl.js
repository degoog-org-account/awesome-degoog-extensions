const _cache = new Map();

export const tmpl = (templateStr, data) =>
  templateStr.replace(/\{\{\s*([\w-]+)\s*\}\}/g, (_m, key) =>
    data[key] != null ? data[key] : "",
  );

export const loadTmpl = async (path) => {
  if (_cache.has(path)) return _cache.get(path);
  const res = await fetch("assets/templates/" + path);
  const text = await res.text();
  _cache.set(path, text);
  return text;
};
