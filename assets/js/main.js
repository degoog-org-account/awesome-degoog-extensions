import { applyTheme, injectThemeToggle } from "./ui/theme.js";
import { renderIndex } from "./pages/index.js";
import { renderStore } from "./pages/store.js";
import { renderExtension } from "./pages/extension.js";

const PAGES = {
  index: renderIndex,
  store: renderStore,
  extension: renderExtension,
};

const boot = () => {
  applyTheme();
  injectThemeToggle();
  const page = document.body.getAttribute("data-page");
  const render = PAGES[page];
  if (render) render();
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot);
} else {
  boot();
}
