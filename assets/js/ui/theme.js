import { THEME_KEY } from "../utils/config.js";

const SUN_SVG =
  '<svg class="ade-theme-icon ade-theme-icon-sun" viewBox="0 0 24 24" aria-hidden="true">' +
  '<circle cx="12" cy="12" r="4" fill="currentColor"/>' +
  '<g stroke="currentColor" stroke-width="2" stroke-linecap="round">' +
  '<line x1="12" y1="2" x2="12" y2="5"/>' +
  '<line x1="12" y1="19" x2="12" y2="22"/>' +
  '<line x1="2" y1="12" x2="5" y2="12"/>' +
  '<line x1="19" y1="12" x2="22" y2="12"/>' +
  '<line x1="4.5" y1="4.5" x2="6.6" y2="6.6"/>' +
  '<line x1="17.4" y1="17.4" x2="19.5" y2="19.5"/>' +
  '<line x1="4.5" y1="19.5" x2="6.6" y2="17.4"/>' +
  '<line x1="17.4" y1="6.6" x2="19.5" y2="4.5"/>' +
  "</g></svg>";

const MOON_SVG =
  '<svg class="ade-theme-icon ade-theme-icon-moon" viewBox="0 0 24 24" aria-hidden="true">' +
  '<path fill="currentColor" d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>' +
  "</svg>";

const _setTheme = (t) => {
  document.documentElement.setAttribute("data-theme", t);
};

const _currentTheme = () =>
  document.documentElement.getAttribute("data-theme") || "light";

export const applyTheme = () => {
  let stored = null;
  try {
    stored = localStorage.getItem(THEME_KEY);
  } catch (_e) { }
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
      } catch (_e2) { }
      _setTheme(e.matches ? "dark" : "light");
    };
    if (mq.addEventListener) mq.addEventListener("change", onChange);
    else if (mq.addListener) mq.addListener(onChange);
  } catch (_e) {
    _setTheme("light");
  }
};

export const injectThemeToggle = () => {
  if (document.getElementById("ade-theme-toggle")) return;
  const btn = document.createElement("button");
  btn.id = "ade-theme-toggle";
  btn.type = "button";
  btn.className = "ade-theme-toggle";
  btn.setAttribute("aria-label", "Toggle dark mode");
  btn.setAttribute("title", "Toggle dark mode");
  btn.innerHTML = SUN_SVG + MOON_SVG;
  btn.addEventListener("click", () => {
    const next = _currentTheme() === "dark" ? "light" : "dark";
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch (_e) { }
    _setTheme(next);
  });
  document.body.appendChild(btn);
};
