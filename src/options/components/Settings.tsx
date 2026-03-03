import type { Settings as SettingsType } from "../../shared/types";

interface Props {
  settings: SettingsType;
  onUpdate: (patch: Partial<SettingsType>) => void;
}

export function Settings({ settings, onUpdate }: Props) {
  return (
    <div>
      <fieldset>
        <label>
          Delay duration (seconds)
          <input
            type="number"
            min={5}
            max={300}
            value={settings.delaySecs}
            onInput={(e) => onUpdate({ delaySecs: Number((e.target as HTMLInputElement).value) })}
          />
        </label>
      </fieldset>

      <fieldset>
        <label>
          <input
            type="checkbox"
            role="switch"
            checked={settings.delayCancel}
            onChange={(e) => onUpdate({ delayCancel: (e.target as HTMLInputElement).checked })}
          />
          Cancel countdown if you switch away
        </label>
      </fieldset>

      <fieldset>
        <label>
          <input
            type="checkbox"
            role="switch"
            checked={settings.delayAutoLoad}
            onChange={(e) => onUpdate({ delayAutoLoad: (e.target as HTMLInputElement).checked })}
          />
          Auto-load site after countdown
        </label>
      </fieldset>

      <fieldset>
        <label>
          Allowed browse time (minutes)
          <input
            type="number"
            min={1}
            max={30}
            value={settings.allowedBrowseMins}
            onInput={(e) => onUpdate({ allowedBrowseMins: Number((e.target as HTMLInputElement).value) })}
          />
          <small>After this time, navigating on the site will prompt you again.</small>
        </label>
      </fieldset>
    </div>
  );
}
