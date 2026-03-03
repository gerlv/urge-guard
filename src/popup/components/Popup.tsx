import { useState, useEffect } from "preact/hooks";
import type { StatusInfo } from "../../shared/types";
import { sendMessage } from "../../shared/messaging";
import { EMOTIONS } from "../../shared/emotions";

export function Popup() {
  const [status, setStatus] = useState<StatusInfo | null>(null);

  useEffect(() => {
    sendMessage({ type: "getStatus" }).then(setStatus);
  }, []);

  if (!status) {
    return (
      <main class="container" style={{ width: "320px", padding: "1rem" }}>
        <p aria-busy="true">Loading...</p>
      </main>
    );
  }

  return (
    <main class="container" style={{ width: "320px", padding: "1rem" }}>
      <hgroup>
        <h3>Urge Guard</h3>
        <p>{status.siteCount} site{status.siteCount !== 1 ? "s" : ""} blocked</p>
      </hgroup>

      {status.recentActivity.length > 0 ? (
        <>
          <h4 style={{ fontSize: "0.9rem", marginBottom: "0.5rem" }}>Recent activity</h4>
          {status.recentActivity.map((event) => {
            if (event.kind === "urge") {
              const { entry } = event;
              const emo = EMOTIONS.find((e) => e.category === entry.emotionCategory);
              return (
                <div key={`u-${entry.id}`} style={{ marginBottom: "0.5rem", fontSize: "0.85rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>{emo?.emoji} {entry.blockedHost}</span>
                    <small>{getTimeAgo(entry.timestamp)}</small>
                  </div>
                </div>
              );
            }
            const { visit } = event;
            return (
              <div key={`v-${visit.id}`} style={{ marginBottom: "0.5rem", fontSize: "0.85rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>{visit.host}</span>
                  <small>
                    {visit.endTime === null ? "In progress..." : formatDuration(visit.durationMs)}
                    {" · "}{getTimeAgo(visit.startTime)}
                  </small>
                </div>
              </div>
            );
          })}
        </>
      ) : (
        <p style={{ fontSize: "0.85rem" }}>No activity yet.</p>
      )}

      <hr />
      <a
        href="#"
        onClick={(e) => {
          e.preventDefault();
          browser.runtime.openOptionsPage();
        }}
        style={{ fontSize: "0.85rem" }}
      >
        Open settings
      </a>
    </main>
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
