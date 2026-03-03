import type { Settings } from "./types";

export const DEFAULT_SETTINGS: Settings = {
  sites: "",
  delaySecs: 20,
  delayCancel: true,
  delayAutoLoad: true,
  allowedBrowseMins: 5,
};

export const STORAGE_KEYS = {
  settings: "settings",
  urgeLog: "urgeLog",
  siteVisits: "siteVisits",
} as const;

export const ACTIVITY_WINDOW_MS = 48 * 60 * 60 * 1000;
