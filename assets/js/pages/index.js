import { parseUrl } from "../utils/url.js";
import { fetchStores, loadStore } from "../utils/api.js";
import {
  renderStoreCard,
  renderBrokenCard,
  renderSkeletonCard,
} from "../ui/cards.js";
import { wireFilter } from "../ui/filter.js";
import { wireRefresh } from "../ui/refresh.js";

const _slotHtml = (i) =>
  '<div class="column is-one-third-desktop is-half-tablet" data-slot="' +
  i +
  '">' +
  renderSkeletonCard() +
  "</div>";

const _renderSlot = async (grid, raw, i) => {
  const slot = grid.querySelector('[data-slot="' + i + '"]');
  if (!slot) return;
  const loc = await parseUrl(raw);
  if (!loc) {
    slot.innerHTML = renderBrokenCard(
      String(raw),
      "Unsupported host. Add a fetcher in ./js/utils/fetchers.js to support it."
    );
    return;
  }
  const data = await loadStore(loc);
  if (!data) {
    slot.innerHTML = renderBrokenCard(
      loc.displayUrl,
      "Repo unreachable, private, or missing root package.json."
    );
    return;
  }
  slot.innerHTML = renderStoreCard(data.loc, data.pkg, data.tree);
};

export const renderIndex = async () => {
  const grid = document.getElementById("ade-stores");
  wireRefresh(document.getElementById("ade-refresh"));
  const inputs = await fetchStores();
  if (!inputs.length) {
    grid.innerHTML =
      '<div class="column"><div class="notification is-warning is-light">No stores listed yet. Be the first &mdash; open a PR adding one to <code>stores.json</code>.</div></div>';
    grid.setAttribute("aria-busy", "false");
    return;
  }
  grid.innerHTML = inputs.map((_raw, i) => _slotHtml(i)).join("");
  grid.setAttribute("aria-busy", "false");
  await Promise.all(inputs.map((raw, i) => _renderSlot(grid, raw, i)));
  wireFilter("ade-filter", "ade-stores");
};
