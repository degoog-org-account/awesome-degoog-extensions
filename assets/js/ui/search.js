import { tmpl, loadTmpl } from "../utils/tmpl.js";
import { escape } from "./render.js";
import { typeTag } from "./render.js";

const _index = [];

export function indexStore(storeInput, storeName, items) {
  items.forEach((item) => {
    _index.push({ storeInput, storeName, item });
  });
}

const _matchesQuery = (entry, q) => {
  const haystack = [
    entry.item.name || "",
    entry.item.description || "",
    entry.storeName,
    typeof entry.item.author === "string"
      ? entry.item.author
      : (entry.item.author && entry.item.author.name) || "",
  ]
    .join(" ")
    .toLowerCase();
  return haystack.indexOf(q) >= 0;
};

const _buildResults = async (query) => {
  const [headerTpl, groupTpl, rowTpl] = await Promise.all([
    loadTmpl("search/header.html"),
    loadTmpl("search/group.html"),
    loadTmpl("search/row.html"),
  ]);
  const q = query.toLowerCase();
  const matched = _index.filter((e) => _matchesQuery(e, q));
  const byStore = new Map();
  matched.forEach((e) => {
    if (!byStore.has(e.storeInput)) byStore.set(e.storeInput, []);
    byStore.get(e.storeInput).push(e);
  });
  if (!byStore.size) return "<p>No results.</p>";
  let html = tmpl(headerTpl, { query: escape(query) });
  await Promise.all(
    Array.from(byStore.entries()).map(async ([storeInput, entries]) => {
      const storeName = entries[0].storeName;
      const rows = (
        await Promise.all(
          entries.map(async (e) => {
            const href =
              "#repo=" +
              encodeURIComponent(storeInput) +
              "&ext=" +
              encodeURIComponent(e.item.path);
            return tmpl(rowTpl, {
              href: escape(href),
              name: escape(e.item.name || e.item.path),
              typeTag: await typeTag(e.item._kind),
              description: escape(e.item.description || ""),
            });
          })
        )
      ).join("");
      html += tmpl(groupTpl, {
        storeName: escape(storeName),
        rows,
      });
    })
  );
  return html;
};

export function wireSearch(inputEl, mainEl, onClearFn) {
  if (!inputEl) return;
  inputEl.addEventListener("input", async () => {
    const q = inputEl.value.trim();
    if (!q) {
      onClearFn();
      return;
    }
    mainEl.innerHTML = await _buildResults(q);
  });
}
