import type { UrgeEntry } from "../../shared/types";
import { EMOTIONS } from "../../shared/emotions";

interface Props {
  entries: UrgeEntry[];
  onClear: () => void;
}

export function UrgeLog({ entries, onClear }: Props) {
  if (entries.length === 0) {
    return <p>No urges logged yet. They'll appear here after you encounter a blocked site.</p>;
  }

  const sorted = [...entries].reverse();

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <small>{entries.length} entries</small>
        <button class="outline secondary" style={{ fontSize: "0.8rem", padding: "0.25rem 0.75rem" }} onClick={onClear}>
          Clear log
        </button>
      </div>

      {sorted.map((entry) => {
        const emo = EMOTIONS.find((e) => e.category === entry.emotionCategory);
        const date = new Date(entry.timestamp);
        return (
          <article key={entry.id} style={{ padding: "0.75rem 1rem", marginBottom: "0.5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <strong>{entry.blockedHost}</strong>
              <small>{date.toLocaleDateString()} {date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</small>
            </div>
            <div style={{ marginTop: "0.35rem" }}>
              {emo?.emoji} {emo?.label}
              {entry.emotionFlavor && <span> — {entry.emotionFlavor}</span>}
              <span style={{ marginLeft: "0.5rem", color: "var(--pico-muted-color)" }}>
                ({entry.intensity}/10)
              </span>
            </div>
            {entry.note && (
              <p style={{ marginTop: "0.35rem", marginBottom: 0, fontStyle: "italic", fontSize: "0.9rem" }}>
                "{entry.note}"
              </p>
            )}
          </article>
        );
      })}
    </div>
  );
}
