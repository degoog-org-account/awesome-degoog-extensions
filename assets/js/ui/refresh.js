import { REFRESH_KEY, REFRESH_COOLDOWN_MS } from "../utils/config.js";
import { cacheClearAll } from "../utils/cache.js";

const _getLast = () => {
  try {
    const v = localStorage.getItem(REFRESH_KEY);
    const n = v ? parseInt(v, 10) : 0;
    return Number.isFinite(n) ? n : 0;
  } catch (_e) {
    return 0;
  }
};

const _setLast = (t) => {
  try {
    localStorage.setItem(REFRESH_KEY, String(t));
  } catch (_e) {}
};

const _remaining = () =>
  Math.max(0, REFRESH_COOLDOWN_MS - (Date.now() - _getLast()));

export const wireRefresh = (btn) => {
  if (!btn) return;
  const baseLabel = '<i class="fa-solid fa-rotate"></i>';
  let timer = null;
  const tick = () => {
    const ms = _remaining();
    if (ms > 0) {
      btn.disabled = true;
      btn.innerHTML = baseLabel + " (" + Math.ceil(ms / 1000) + "s)";
      btn.setAttribute(
        "title",
        "Cool down to avoid hitting upstream API rate limits.",
      );
      timer = setTimeout(tick, 1000);
    } else {
      btn.disabled = false;
      btn.innerHTML = baseLabel;
      btn.removeAttribute("title");
      timer = null;
    }
  };
  btn.addEventListener("click", () => {
    if (_remaining() > 0) return;
    _setLast(Date.now());
    cacheClearAll();
    location.reload();
  });
  tick();
  window.addEventListener("beforeunload", () => {
    if (timer) clearTimeout(timer);
  });
};
