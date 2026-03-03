import type { Settings } from "../../shared/types";

interface Props {
  settings: Settings;
  onUpdate: (patch: Partial<Settings>) => void;
}

export function SiteList({ settings, onUpdate }: Props) {
  return (
    <div>
      <p>
        Enter one site pattern per line. Use <code>*</code> as wildcard.
        Prefix with <code>+</code> to allow as exception, <code>#</code> for comments.
      </p>
      <textarea
        rows={12}
        placeholder={"reddit.com\nnews.ycombinator.com\ntwitter.com\n# This is a comment\n+reddit.com/r/programming"}
        value={settings.sites}
        onInput={(e) => onUpdate({ sites: (e.target as HTMLTextAreaElement).value })}
        style={{ fontFamily: "monospace", fontSize: "0.9rem" }}
      />
    </div>
  );
}
