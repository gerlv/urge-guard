import type { Message, BlockInfo, Settings, StatusInfo, UrgeEntry, ActivityEvent, SiteVisit } from "./types";

type ResponseMap = {
  getBlockInfo: BlockInfo | null;
  delayComplete: void;
  getSettings: Settings;
  saveSettings: void;
  getUrgeLog: UrgeEntry[];
  clearUrgeLog: void;
  getStatus: StatusInfo;
  getRecentActivity: ActivityEvent[];
  getSiteVisits: SiteVisit[];
};

export function sendMessage<T extends Message["type"]>(
  msg: Extract<Message, { type: T }>
): Promise<ResponseMap[T]> {
  return browser.runtime.sendMessage(msg);
}
