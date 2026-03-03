import type { UrgeEntry, SiteVisit, ActivityEvent } from "../../shared/types";
import { EMOTIONS } from "../../shared/emotions";

interface Props {
  urges: UrgeEntry[];
  visits: SiteVisit[];
}

export function ActivityFeed({ urges, visits }: Props) {
  const events: ActivityEvent[] = [
    ...urges.map((entry): ActivityEvent => ({ kind: "urge", entry })),
    ...visits.map((visit): ActivityEvent => ({ kind: "visit", visit })),
  ];

  events.sort((a, b) => {
    const timeA = a.kind === "urge" ? a.entry.timestamp : a.visit.startTime;
    const timeB = b.kind === "urge" ? b.entry.timestamp : b.visit.startTime;
    return timeB - timeA;
  });

  if (events.length === 0) {
    return <p>No activity in the last 48 hours.</p>;
  }

  return (
    <div>
      <small>{events.length} events in the last 48h</small>

      {events.map((event) => {
        if (event.kind === "urge") {
          const { entry } = event;
          const emo = EMOTIONS.find((e) => e.category === entry.emotionCategory);
          return (
            <article key={`urge-${entry.id}`} style={{ padding: "0.75rem 1rem", marginBottom: "0.5rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <span>
                  <small style={{ color: "var(--pico-muted-color)", marginRight: "0.5rem" }}>URGE</small>
                  <strong>{entry.blockedHost}</strong>
                </span>
                <small>{getTimeAgo(entry.timestamp)}</small>
              </div>
              <div style={{ marginTop: "0.35rem" }}>
                {emo?.emoji} {emo?.label}
                <span style={{ marginLeft: "0.5rem", color: "var(--pico-muted-color)" }}>
                  ({entry.intensity}/10)
                </span>
              </div>
            </article>
          );
        }

        const { visit } = event;
        return (
          <article key={`visit-${visit.id}`} style={{ padding: "0.75rem 1rem", marginBottom: "0.5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <span>
                <small style={{ color: "var(--pico-muted-color)", marginRight: "0.5rem" }}>VISIT</small>
                <strong>{visit.host}</strong>
              </span>
              <small>{getTimeAgo(visit.startTime)}</small>
            </div>
            <div style={{ marginTop: "0.35rem", color: "var(--pico-muted-color)" }}>
              {visit.endTime === null ? "In progress..." : formatDuration(visit.durationMs)}
            </div>
          </article>
        );
      })}
    </div>
  );
}

function formatDuration(ms: number): string {
  const totalSecs = Math.floor(ms / 1000);
  const mins = Math.floor(totalSecs / 60);
  const secs = totalSecs % 60;
  if (mins === 0) return `${secs}s`;
  return `${mins}m ${secs}s`;
}

function getTimeAgo(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
