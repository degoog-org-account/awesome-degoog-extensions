export const CACHE_TTL_MS = 60 * 60 * 1000;
export const DETECT_TTL_MS = 7 * 24 * 60 * 60 * 1000;
export const CACHE_PREFIX = "ade:v1:";
export const STORES_URL = "stores.json";
export const THEME_KEY = "ade:theme";
export const REFRESH_KEY = "ade:lastRefresh";
export const REFRESH_COOLDOWN_MS = 30 * 1000;

export const TYPES = ["plugins", "themes", "engines", "transports"];

export const TYPE_LABELS = {
  plugins: "Plugins",
  themes: "Themes",
  engines: "Engines",
  transports: "Transports",
};

export const TYPE_SINGULAR = {
  plugins: "plugin",
  themes: "theme",
  engines: "engine",
  transports: "transport",
};

export const IMG_EXT = /\.(png|jpe?g|gif|webp|avif|svg)$/i;
