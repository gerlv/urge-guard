import type { UrgeEntry, SiteVisit, EmotionCategory } from "../../shared/types";
import { EMOTIONS } from "../../shared/emotions";

interface Props {
  entries: UrgeEntry[];
  visits?: SiteVisit[];
}

export function WeeklyReflection({ entries, visits = [] }: Props) {
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const recent = entries.filter((e) => e.timestamp >= weekAgo);

  if (recent.length < 2) {
    return <p>Not enough data yet. Keep using Urge Guard and insights will appear here after a few days.</p>;
  }

  // Top emotions
  const emotionCounts = new Map<EmotionCategory, number>();
  for (const e of recent) {
    emotionCounts.set(e.emotionCategory, (emotionCounts.get(e.emotionCategory) ?? 0) + 1);
  }
  const topEmotions = [...emotionCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  // Top sites
  const siteCounts = new Map<string, number>();
  for (const e of recent) {
    siteCounts.set(e.blockedHost, (siteCounts.get(e.blockedHost) ?? 0) + 1);
  }
  const topSites = [...siteCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Average intensity
  const avgIntensity = recent.reduce((sum, e) => sum + e.intensity, 0) / recent.length;

  // Max count for bar scaling
  const maxEmoCount = Math.max(...topEmotions.map(([, c]) => c));
  const maxSiteCount = Math.max(...topSites.map(([, c]) => c));

  return (
    <div>
      <h4>This Week ({recent.length} urges)</h4>

      <h5>Top Emotions</h5>
      {topEmotions.map(([cat, count]) => {
        const emo = EMOTIONS.find((e) => e.category === cat);
        const pct = (count / maxEmoCount) * 100;
        return (
          <div key={cat} style={{ marginBottom: "0.5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.2rem" }}>
              <span>{emo?.emoji} {emo?.label}</span>
              <small>{count}</small>
            </div>
            <div
              style={{
                height: "8px",
                borderRadius: "4px",
                background: "var(--pico-secondary-background)",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${pct}%`,
                  borderRadius: "4px",
                  background: "var(--pico-primary)",
                  transition: "width 0.3s",
                }}
              />
            </div>
          </div>
        );
      })}

      <h5 style={{ marginTop: "1.5rem" }}>Top Sites</h5>
      {topSites.map(([host, count]) => {
        const pct = (count / maxSiteCount) * 100;
        return (
          <div key={host} style={{ marginBottom: "0.5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.2rem" }}>
              <span>{host}</span>
              <small>{count}</small>
            </div>
            <div
              style={{
                height: "8px",
                borderRadius: "4px",
                background: "var(--pico-secondary-background)",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${pct}%`,
                  borderRadius: "4px",
                  background: "var(--pico-contrast)",
                  transition: "width 0.3s",
                }}
              />
            </div>
          </div>
        );
      })}

      <h5 style={{ marginTop: "1.5rem" }}>Average Intensity</h5>
      <p style={{ fontSize: "1.5rem" }}>
        <strong>{avgIntensity.toFixed(1)}</strong> <small>/ 10</small>
      </p>

      {(() => {
        const recentVisits = visits.filter((v) => v.startTime >= weekAgo && v.endTime !== null);
        if (recentVisits.length === 0) return null;

        const hostTotals = new Map<string, number>();
        for (const v of recentVisits) {
          hostTotals.set(v.host, (hostTotals.get(v.host) ?? 0) + v.durationMs);
        }
        const sorted = [...hostTotals.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
        const maxMs = Math.max(...sorted.map(([, ms]) => ms));

        const totalMs = recentVisits.reduce((sum, v) => sum + v.durationMs, 0);
        const avgDailyMs = totalMs / 7;

        return (
          <>
            <h5 style={{ marginTop: "1.5rem" }}>Time Spent</h5>
            {sorted.map(([host, ms]) => {
              const pct = (ms / maxMs) * 100;
              return (
                <div key={host} style={{ marginBottom: "0.5rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.2rem" }}>
                    <span>{host}</span>
                    <small>{formatDuration(ms)}</small>
                  </div>
                  <div
                    style={{
                      height: "8px",
                      borderRadius: "4px",
                      background: "var(--pico-secondary-background)",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${pct}%`,
                        borderRadius: "4px",
                        background: "var(--pico-del-color)",
                        transition: "width 0.3s",
                      }}
                    />
                  </div>
                </div>
              );
            })}
            <p style={{ marginTop: "0.5rem", fontSize: "0.9rem", color: "var(--pico-muted-color)" }}>
              Avg daily: {formatDuration(avgDailyMs)}
            </p>
          </>
        );
      })()}
    </div>
  );
}

function formatDuration(ms: number): string {
  const totalSecs = Math.floor(ms / 1000);
  const mins = Math.floor(totalSecs / 60);
  const secs = totalSecs % 60;
  if (mins === 0) return `${secs}s`;
  const hours = Math.floor(mins / 60);
  if (hours === 0) return `${mins}m ${secs}s`;
  return `${hours}h ${mins % 60}m`;
}
