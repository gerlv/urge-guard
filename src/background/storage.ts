import type { Settings, UrgeEntry, SiteVisit, ActivityEvent } from "../shared/types";
import { DEFAULT_SETTINGS, STORAGE_KEYS, ACTIVITY_WINDOW_MS } from "../shared/constants";

export async function getSettings(): Promise<Settings> {
  const result = await browser.storage.local.get(STORAGE_KEYS.settings);
  return { ...DEFAULT_SETTINGS, ...(result[STORAGE_KEYS.settings] as Partial<Settings>) };
}

export async function saveSettings(settings: Settings): Promise<void> {
  await browser.storage.local.set({ [STORAGE_KEYS.settings]: settings });
}

export async function getUrgeLog(): Promise<UrgeEntry[]> {
  const result = await browser.storage.local.get(STORAGE_KEYS.urgeLog);
  return (result[STORAGE_KEYS.urgeLog] as UrgeEntry[]) ?? [];
}

export async function addUrgeEntry(entry: UrgeEntry): Promise<void> {
  const log = await getUrgeLog();
  log.push(entry);
  await browser.storage.local.set({ [STORAGE_KEYS.urgeLog]: log });
}

export async function clearUrgeLog(): Promise<void> {
  await browser.storage.local.set({ [STORAGE_KEYS.urgeLog]: [] });
}

// --- Site visits ---

export async function getSiteVisits(): Promise<SiteVisit[]> {
  const result = await browser.storage.local.get(STORAGE_KEYS.siteVisits);
  return (result[STORAGE_KEYS.siteVisits] as SiteVisit[]) ?? [];
}

export async function addSiteVisit(visit: SiteVisit): Promise<void> {
  const visits = await getSiteVisits();
  visits.push(visit);
  await browser.storage.local.set({ [STORAGE_KEYS.siteVisits]: visits });
}

export async function finalizeSiteVisit(id: string, endTime: number, durationMs: number): Promise<void> {
  const visits = await getSiteVisits();
  const visit = visits.find((v) => v.id === id);
  if (visit) {
    visit.endTime = endTime;
    visit.durationMs = durationMs;
    await browser.storage.local.set({ [STORAGE_KEYS.siteVisits]: visits });
  }
}

export async function pruneSiteVisits(): Promise<void> {
  const visits = await getSiteVisits();
  const cutoff = Date.now() - ACTIVITY_WINDOW_MS;
  const pruned = visits.filter((v) => v.startTime >= cutoff);
  if (pruned.length !== visits.length) {
    await browser.storage.local.set({ [STORAGE_KEYS.siteVisits]: pruned });
  }
}

export async function finalizeStaleVisits(): Promise<void> {
  const visits = await getSiteVisits();
  let changed = false;
  const now = Date.now();
  for (const visit of visits) {
    if (visit.endTime === null) {
      visit.endTime = visit.startTime;
      visit.durationMs = now - visit.startTime;
      changed = true;
    }
  }
  if (changed) {
    await browser.storage.local.set({ [STORAGE_KEYS.siteVisits]: visits });
  }
}

export async function getRecentActivity(): Promise<ActivityEvent[]> {
  const cutoff = Date.now() - ACTIVITY_WINDOW_MS;
  const [urges, visits] = await Promise.all([getUrgeLog(), getSiteVisits()]);

  const events: ActivityEvent[] = [];
  for (const entry of urges) {
    if (entry.timestamp >= cutoff) {
      events.push({ kind: "urge", entry });
    }
  }
  for (const visit of visits) {
    if (visit.startTime >= cutoff) {
      events.push({ kind: "visit", visit });
    }
  }

  events.sort((a, b) => {
    const timeA = a.kind === "urge" ? a.entry.timestamp : a.visit.startTime;
    const timeB = b.kind === "urge" ? b.entry.timestamp : b.visit.startTime;
    return timeB - timeA;
  });

  return events;
}
