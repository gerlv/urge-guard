# Urge Guard

A Firefox extension for mindful site blocking with emotion tracking. Instead of hard-blocking websites, Urge Guard introduces a brief pause that prompts you to reflect on *why* you're reaching for a distraction — then lets you continue if you choose to.

All data stays local in your browser. No accounts, no telemetry, no external services.

## How It Works

1. **You add sites** you want to be mindful about (e.g., `reddit.com`, `twitter.com`)
2. **When you visit one**, Urge Guard intercepts the navigation and shows a countdown page
3. **During the countdown**, you're asked to identify what you're feeling and what you were doing before
4. **After the timer**, you can continue to the site — your visit duration is tracked
5. **After a configurable window** (default 5 minutes), navigating on the site prompts you again

## Features

### Mindful Delay
- Configurable countdown timer (5–300 seconds, default 20s)
- Canvas-based circular progress indicator
- Optional auto-redirect after countdown completes
- If you're still writing a note when the timer ends, the redirect waits for you

### Emotion Tracking
Seven emotion categories, each with four nuanced "flavors":

| Emoji | Category     | Flavors                                              |
|-------|-------------|------------------------------------------------------|
| `🙈`  | Avoidance   | procrastination, escapism, distraction-seeking, numbing |
| `😰`  | Fear        | dread, anxiety, overwhelm, performance anxiety        |
| `😐`  | Boredom     | restlessness, under-stimulation, impatience, monotony |
| `😤`  | Frustration | irritation, stuck, anger, helplessness                |
| `😴`  | Fatigue     | mental exhaustion, decision fatigue, burnout, brain fog |
| `😔`  | Shame       | inadequacy, imposter syndrome, guilt, self-doubt      |
| `🧊`  | Freeze      | paralysis, blank mind, dissociation, shutdown         |

Plus an intensity slider (1–10) and a free-form note field ("What were you doing before, or about to do?").

### Visit Duration Tracking
- Records how long you spend on a site after completing the countdown
- Each focused tab segment is tracked as a separate visit
- Visits end automatically when you switch tabs, close the tab, or the browser loses focus

### 48-Hour Activity Feed
A unified timeline of urges and site visits from the last 48 hours, showing:
- Urge events: host, emotion, intensity, time ago
- Visit events: host, duration, time ago (or "In progress...")

### Weekly Insights
- **Top emotions**: Which feelings drive your urges most
- **Top sites**: Which sites you're drawn to most
- **Average intensity**: Your typical urge strength
- **Time spent**: Per-host duration bars with daily average

### Site Pattern Matching
Flexible pattern syntax for your block list:

```
# Block entire domains (includes subdomains)
reddit.com
twitter.com

# Wildcards
*.example.com
news.ycombinator.com/newest*

# Allow exceptions (prefix with +)
+reddit.com/r/programming
+reddit.com/r/firefox

# Comments
# This line is ignored
```

### Configurable Settings
| Setting                  | Default | Description                                              |
|--------------------------|---------|----------------------------------------------------------|
| Delay duration           | 20s     | How long the countdown lasts (5–300s)                    |
| Cancel on switch-away    | On      | Resets countdown if you leave the delay page              |
| Auto-load site           | On      | Automatically navigate to the site after countdown       |
| Allowed browse time      | 5 min   | Free browsing window before re-prompting (1–30 min)      |

## Architecture

```
src/
├── background/
│   ├── background.ts    # Event listeners, tab state, message handler
│   ├── matcher.ts       # URL pattern → RegExp compiler
│   └── storage.ts       # browser.storage.local wrappers
├── shared/
│   ├── types.ts         # TypeScript interfaces & message types
│   ├── constants.ts     # Default settings, storage keys
│   ├── messaging.ts     # Type-safe sendMessage helper
│   └── emotions.ts      # Emotion category definitions
├── delay/
│   ├── delay.tsx         # Entry point
│   └── components/
│       ├── DelayPage.tsx      # Main delay page logic
│       ├── Countdown.tsx      # Canvas circular timer
│       ├── EmotionPicker.tsx  # Emotion category + flavor grid
│       ├── IntensitySlider.tsx
│       └── NoteInput.tsx
├── options/
│   ├── options.tsx       # Entry point
│   └── components/
│       ├── OptionsPage.tsx     # Tabbed settings page
│       ├── SiteList.tsx        # Site pattern editor
│       ├── Settings.tsx        # Configuration controls
│       ├── UrgeLog.tsx         # Full urge history
│       ├── ActivityFeed.tsx    # 48h activity timeline
│       └── WeeklyReflection.tsx # Weekly insights dashboard
└── popup/
    ├── popup.tsx          # Entry point
    └── components/
        └── Popup.tsx      # Quick-glance status popup
```

## Tech Stack

- **Preact** — lightweight UI rendering
- **TypeScript** — type-safe codebase
- **Vite** — build tooling with multi-entry support
- **Pico CSS** — minimal classless styling with auto dark mode
- **WebExtension Manifest V3** — modern browser extension API

## Development

### Prerequisites

- Node.js (18+)
- npm
- Firefox (109+ for desktop, 113+ for Android)

### Setup

```bash
cd urge-guard
npm install
```

### Build

```bash
npm run build
```

Output goes to `dist/`.

### Load in Firefox (development)

1. Navigate to `about:debugging#/runtime/this-firefox`
2. Click **"Load Temporary Add-on..."**
3. Select `urge-guard/dist/manifest.json`

After code changes, run `npm run build` again and click **Reload** next to the extension.

### Package for distribution

```bash
npm run build
npx web-ext build -s dist --overwrite-dest
```

Output: `web-ext-artifacts/urge_guard-{version}.zip`

## Browser Compatibility

| Platform         | Minimum Version | Status      |
|-----------------|-----------------|-------------|
| Firefox Desktop  | 109             | Supported   |
| Firefox Android  | 113             | Supported   |

## Permissions

| Permission       | Why                                                    |
|-----------------|--------------------------------------------------------|
| `storage`        | Persist settings, urge log, and visit data locally     |
| `webNavigation`  | Intercept navigation to blocked sites                  |
| `tabs`           | Redirect to delay page and track active tab changes    |

## Data & Privacy

- All data is stored locally in `browser.storage.local`
- No data leaves your browser
- No analytics, tracking, or external network requests
- Clear your urge log anytime from the Urge Log tab

## License

MIT
