import { THEME_KEY } from "../utils/config.js";

const _setTheme = (t) => {
  document.documentElement.setAttribute("data-theme", t);
};

const _currentTheme = () =>
  document.documentElement.getAttribute("data-theme") || "light";

export const applyTheme = () => {
  let stored = null;
  try {
    stored = localStorage.getItem(THEME_KEY);
  } catch (_e) {}
  if (stored === "light" || stored === "dark") {
    _setTheme(stored);
    return;
  }
  try {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    _setTheme(mq.matches ? "dark" : "light");
    const onChange = (e) => {
      try {
        if (localStorage.getItem(THEME_KEY)) return;
      } catch (_e2) {}
      _setTheme(e.matches ? "dark" : "light");
    };
    if (mq.addEventListener) mq.addEventListener("change", onChange);
    else if (mq.addListener) mq.addListener(onChange);
  } catch (_e) {
    _setTheme("light");
  }
};

export function injectThemeToggle() {
  const btn = document.getElementById("ade-theme-toggle");
  if (!btn) return;
  btn.addEventListener("click", () => {
    const next = _currentTheme() === "dark" ? "light" : "dark";
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch (_e) {}
    _setTheme(next);
  });
}
