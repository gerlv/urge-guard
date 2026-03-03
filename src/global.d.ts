// Firefox WebExtension `browser.*` global namespace
// Uses types from @types/webextension-polyfill
import type { Browser } from "webextension-polyfill";

declare global {
  const browser: Browser;
}
