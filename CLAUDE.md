# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build Commands

```bash
npm run build        # Type-check (tsc) then bundle (vite)
npm run dev          # Watch mode (vite build --watch)
npm run preview      # Run in Firefox Developer Edition via web-ext
```

Package for distribution:
```bash
npx web-ext build -s dist --overwrite-dest
```

No linter or test runner is configured.

## Loading in Firefox

1. `about:debugging#/runtime/this-firefox` → "Load Temporary Add-on..."
2. Select `dist/manifest.json`
3. After rebuilding, click "Reload" next to the extension

## Architecture

Firefox extension (Manifest V3) built with Preact, TypeScript, Vite, and Pico CSS.

**Four entry points** compiled by Vite into `dist/`:
- `background.ts` — service worker, runs persistently
- `delay.html` — shown when a blocked site is visited (countdown + emotion form)
- `options.html` — full settings page (tabbed: Sites, Settings, Urge Log, Activity, Insights)
- `popup.html` — browser action popup (quick status)

### Core flow

1. `background/matcher.ts` compiles user's site list into block/allow RegExps
2. `webNavigation.onBeforeNavigate` checks every navigation against the matcher
3. Blocked URLs redirect to the delay page with `?tabId=N`
4. Delay page shows countdown, collects emotion data, sends `delayComplete` message
5. Background saves the `UrgeEntry`, creates a `SiteVisit` record, sets a time-limited allowance (`allowedUntil`), then redirects to the original URL
6. Visit tracking ends when user switches tabs, closes tab, navigates away, or browser loses focus
7. On startup, `finalizeStaleVisits()` closes any visits left open from a previous session

### Key state

- `tabs` Map in background.ts — per-tab in-memory state (blocked URL, allowed host, active visit, expiry time)
- `browser.storage.local` — persistent storage for settings, urge log, and site visits (keys defined in `constants.ts`)

### Shared module (`src/shared/`)

All type definitions, constants, and messaging live here. The `Message` union type and `ResponseMap` enforce type-safe communication between UI pages and the background worker via `sendMessage()`.

### Styling

Pico CSS (classless, auto dark mode via `prefers-color-scheme`). Do NOT set `data-theme` on `<html>` — Pico v2's dark mode selector is `:root:not([data-theme])`, so adding `data-theme="auto"` breaks it.

Vite `base` is set to `"./"` so all asset paths in built HTML are relative — required for extension context where absolute `/` paths don't resolve correctly.
