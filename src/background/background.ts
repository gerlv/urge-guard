import type { Settings, UrgeEntry, SiteVisit, Message, BlockInfo, StatusInfo } from "../shared/types";
import { compileSiteList, shouldBlock, type CompiledMatcher } from "./matcher";
import {
  getSettings, saveSettings, getUrgeLog, addUrgeEntry, clearUrgeLog,
  getSiteVisits, addSiteVisit, finalizeSiteVisit, getRecentActivity, pruneSiteVisits,
  finalizeStaleVisits,
} from "./storage";

const DELAY_PAGE_URL = browser.runtime.getURL("src/delay/delay.html");

// --- State ---

let settings: Settings;
let matcher: CompiledMatcher = { blockRe: null, allowRe: null };

interface TabInfo {
  blockedURL?: string;
  blockedHost?: string;
  allowedHost?: string | null;
  allowedUntil?: number;
  activeVisitId?: string;
  visitStartTime?: number;
  urgeEntryId?: string;
}

const tabs = new Map<number, TabInfo>();

// --- Init ---

async function init() {
  settings = await getSettings();
  matcher = compileSiteList(settings.sites);
  finalizeStaleVisits();
  pruneSiteVisits();
  console.log("[Urge Guard] Initialized", {
    siteCount: settings.sites.split(/\s+/).filter((s) => s && !s.startsWith("#")).length,
  });
}

init();

// --- Storage change listener ---

browser.storage.onChanged.addListener((changes, area) => {
  if (area === "local" && changes.settings) {
    settings = { ...settings, ...(changes.settings.newValue as Partial<Settings>) };
    matcher = compileSiteList(settings.sites);
    console.log("[Urge Guard] Settings updated, recompiled matcher");
  }
});

// --- Navigation listener ---

browser.webNavigation.onBeforeNavigate.addListener((details) => {
  if (details.frameId !== 0) return; // only top-level frames

  const url = details.url;
  const tabId = details.tabId;

  // Don't block our own pages
  if (url.startsWith(DELAY_PAGE_URL)) return;

  // Check if this tab has an allowed host
  const tab = tabs.get(tabId);

  // End visit if navigating to a different host
  if (tab?.activeVisitId) {
    try {
      const host = new URL(url).hostname;
      if (!isSameHost(host, tab.allowedHost ?? "")) {
        endVisit(tabId);
      }
    } catch {
      endVisit(tabId);
    }
  }

  if (tab?.allowedHost) {
    try {
      const host = new URL(url).hostname;
      if (isSameHost(host, tab.allowedHost)) {
        // Check if the browsing window has expired
        if (tab.allowedUntil && Date.now() > tab.allowedUntil) {
          // Time's up — end any active visit and clear allowance
          if (tab.activeVisitId) endVisit(tabId);
          tab.allowedHost = null;
          tab.allowedUntil = undefined;
          // Fall through to block check below
        } else {
          return; // still within allowed window
        }
      }
    } catch {
      // invalid URL, let it pass
      return;
    }
  }

  if (!shouldBlock(url, matcher)) return;

  // Extract host for tracking
  let host = "";
  try {
    host = new URL(url).hostname;
  } catch {
    // pass
  }

  // Store block info for this tab
  tabs.set(tabId, { blockedURL: url, blockedHost: host });

  // Redirect to delay page
  const delayURL = `${DELAY_PAGE_URL}?tabId=${tabId}`;
  browser.tabs.update(tabId, { url: delayURL });
});

// --- Tab cleanup ---

browser.tabs.onRemoved.addListener((tabId) => {
  const tab = tabs.get(tabId);
  if (tab?.activeVisitId) {
    endVisit(tabId);
  }
  tabs.delete(tabId);
});

// End visit when switching away from a tab
browser.tabs.onActivated.addListener((activeInfo) => {
  for (const [tabId, tab] of tabs) {
    if (tabId !== activeInfo.tabId && tab.activeVisitId) {
      endVisit(tabId);
    }
  }
});

// End all active visits when browser loses focus
browser.windows.onFocusChanged.addListener((windowId) => {
  if (windowId === browser.windows.WINDOW_ID_NONE) {
    for (const [tabId, tab] of tabs) {
      if (tab.activeVisitId) {
        endVisit(tabId);
      }
    }
  }
});

// --- Message handler ---

browser.runtime.onMessage.addListener(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (msg: any, _sender: any): any => {
    const m = msg as Message;
    switch (m.type) {
      case "getBlockInfo": {
        const tab = tabs.get(m.tabId);
        if (!tab?.blockedURL) return Promise.resolve(null);
        return Promise.resolve({
          blockedURL: tab.blockedURL,
          blockedHost: tab.blockedHost ?? "",
          delaySecs: settings.delaySecs,
          delayCancel: settings.delayCancel,
          delayAutoLoad: settings.delayAutoLoad,
        });
      }

      case "delayComplete": {
        const tab = tabs.get(m.tabId);
        if (!tab?.blockedURL) return Promise.resolve();

        // Save urge entry
        const entry: UrgeEntry = {
          id: crypto.randomUUID(),
          timestamp: Date.now(),
          ...m.entry,
        };
        const savePromise = addUrgeEntry(entry);

        // Create site visit record
        const visitId = crypto.randomUUID();
        const now = Date.now();
        const visit: SiteVisit = {
          id: visitId,
          startTime: now,
          endTime: null,
          durationMs: 0,
          url: tab.blockedURL,
          host: tab.blockedHost ?? "",
          tabId: m.tabId,
          urgeEntryId: entry.id,
        };
        const visitPromise = addSiteVisit(visit);

        // Allow this host for a limited time and track visit
        tabs.set(m.tabId, {
          ...tab,
          allowedHost: tab.blockedHost,
          allowedUntil: now + settings.allowedBrowseMins * 60 * 1000,
          activeVisitId: visitId,
          visitStartTime: now,
          urgeEntryId: entry.id,
        });

        // Auto-load if enabled
        if (settings.delayAutoLoad && tab.blockedURL) {
          Promise.all([savePromise, visitPromise]).then(() => {
            browser.tabs.update(m.tabId, { url: tab.blockedURL });
          });
        }

        return Promise.all([savePromise, visitPromise]).then(() => undefined);
      }

      case "getSettings":
        return getSettings();

      case "saveSettings":
        return saveSettings(m.settings);

      case "getUrgeLog":
        return getUrgeLog();

      case "clearUrgeLog":
        return clearUrgeLog();

      case "getStatus":
        return Promise.all([getUrgeLog(), getRecentActivity()]).then(([log, activity]) => {
          const siteCount = settings.sites
            .split(/\s+/)
            .filter((s) => s && !s.startsWith("#") && !s.startsWith("+")).length;
          const recentUrges = log.slice(-5).reverse();
          const recentActivity = activity.slice(0, 5);
          return { siteCount, recentUrges, recentActivity } satisfies StatusInfo;
        });

      case "getRecentActivity":
        return getRecentActivity();

      case "getSiteVisits":
        return getSiteVisits();

      default:
        return undefined;
    }
  }
);

// --- Visit tracking ---

function endVisit(tabId: number): void {
  const tab = tabs.get(tabId);
  if (!tab?.activeVisitId || !tab.visitStartTime) return;

  const now = Date.now();
  const durationMs = now - tab.visitStartTime;
  finalizeSiteVisit(tab.activeVisitId, now, durationMs);

  tab.activeVisitId = undefined;
  tab.visitStartTime = undefined;
  tab.urgeEntryId = undefined;
}

// --- Helpers ---

function isSameHost(a: string, b: string): boolean {
  const bare = (h: string) => h.replace(/^www\./, "");
  return bare(a) === bare(b);
}
