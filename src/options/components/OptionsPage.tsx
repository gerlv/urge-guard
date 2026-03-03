import { useState, useEffect, useCallback } from "preact/hooks";
import type { Settings as SettingsType, UrgeEntry, SiteVisit, ActivityEvent } from "../../shared/types";
import { DEFAULT_SETTINGS } from "../../shared/constants";
import { sendMessage } from "../../shared/messaging";
import { SiteList } from "./SiteList";
import { Settings } from "./Settings";
import { UrgeLog } from "./UrgeLog";
import { WeeklyReflection } from "./WeeklyReflection";
import { ActivityFeed } from "./ActivityFeed";

type Tab = "sites" | "settings" | "log" | "activity" | "insights";

export function OptionsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("sites");
  const [settings, setSettings] = useState<SettingsType>(DEFAULT_SETTINGS);
  const [urgeLog, setUrgeLog] = useState<UrgeEntry[]>([]);
  const [activityUrges, setActivityUrges] = useState<UrgeEntry[]>([]);
  const [activityVisits, setActivityVisits] = useState<SiteVisit[]>([]);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    sendMessage({ type: "getSettings" }).then(setSettings);
    sendMessage({ type: "getUrgeLog" }).then(setUrgeLog);
    sendMessage({ type: "getRecentActivity" }).then((events) => {
      const urges: UrgeEntry[] = [];
      const visits: SiteVisit[] = [];
      for (const e of events) {
        if (e.kind === "urge") urges.push(e.entry);
        else visits.push(e.visit);
      }
      setActivityUrges(urges);
      setActivityVisits(visits);
    });
  }, []);

  const handleUpdate = useCallback(
    (patch: Partial<SettingsType>) => {
      setSettings((prev) => ({ ...prev, ...patch }));
      setSaved(false);
    },
    []
  );

  const handleSave = useCallback(async () => {
    await sendMessage({ type: "saveSettings", settings });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }, [settings]);

  const handleClearLog = useCallback(async () => {
    await sendMessage({ type: "clearUrgeLog" });
    setUrgeLog([]);
  }, []);

  const tabs: { id: Tab; label: string }[] = [
    { id: "sites", label: "Sites" },
    { id: "settings", label: "Settings" },
    { id: "log", label: "Urge Log" },
    { id: "activity", label: "Activity" },
    { id: "insights", label: "Insights" },
  ];

  return (
    <main class="container" style={{ maxWidth: "720px", paddingTop: "1.5rem" }}>
      <h1>Urge Guard</h1>

      <nav>
        <ul>
          {tabs.map((tab) => (
            <li key={tab.id}>
              <a
                href="#"
                class={activeTab === tab.id ? "" : "secondary"}
                onClick={(e) => {
                  e.preventDefault();
                  setActiveTab(tab.id);
                }}
              >
                {tab.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <section>
        {activeTab === "sites" && <SiteList settings={settings} onUpdate={handleUpdate} />}
        {activeTab === "settings" && <Settings settings={settings} onUpdate={handleUpdate} />}
        {activeTab === "log" && <UrgeLog entries={urgeLog} onClear={handleClearLog} />}
        {activeTab === "activity" && <ActivityFeed urges={activityUrges} visits={activityVisits} />}
        {activeTab === "insights" && <WeeklyReflection entries={urgeLog} visits={activityVisits} />}
      </section>

      {(activeTab === "sites" || activeTab === "settings") && (
        <footer style={{ marginTop: "1rem" }}>
          <button onClick={handleSave}>
            {saved ? "Saved!" : "Save"}
          </button>
        </footer>
      )}
    </main>
  );
}
