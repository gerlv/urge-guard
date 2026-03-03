export type EmotionCategory =
  | "avoidance"
  | "fear"
  | "boredom"
  | "frustration"
  | "fatigue"
  | "shame"
  | "freeze";

export interface UrgeEntry {
  id: string;
  timestamp: number;
  blockedURL: string;
  blockedHost: string;
  emotionCategory: EmotionCategory;
  emotionFlavor?: string;
  intensity: number;
  note?: string;
  completed: boolean;
}

export interface Settings {
  sites: string;
  delaySecs: number;
  delayCancel: boolean;
  delayAutoLoad: boolean;
  allowedBrowseMins: number;
}

export interface SiteVisit {
  id: string;
  startTime: number;
  endTime: number | null;
  durationMs: number;
  url: string;
  host: string;
  tabId: number;
  urgeEntryId: string;
}

export type ActivityEvent =
  | { kind: "urge"; entry: UrgeEntry }
  | { kind: "visit"; visit: SiteVisit };

// Messages from delay page → background
export type Message =
  | { type: "getBlockInfo"; tabId: number }
  | { type: "delayComplete"; tabId: number; entry: Omit<UrgeEntry, "id" | "timestamp"> }
  | { type: "getSettings" }
  | { type: "saveSettings"; settings: Settings }
  | { type: "getUrgeLog" }
  | { type: "clearUrgeLog" }
  | { type: "getStatus" }
  | { type: "getRecentActivity" }
  | { type: "getSiteVisits" };

export interface BlockInfo {
  blockedURL: string;
  blockedHost: string;
  delaySecs: number;
  delayCancel: boolean;
  delayAutoLoad: boolean;
}

export interface StatusInfo {
  siteCount: number;
  recentUrges: UrgeEntry[];
  recentActivity: ActivityEvent[];
}
