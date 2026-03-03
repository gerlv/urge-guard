interface Props {
  value: string;
  onChange: (v: string) => void;
  onFocusChange?: (focused: boolean) => void;
}

export function NoteInput({ value, onChange, onFocusChange }: Props) {
  return (
    <fieldset>
      <label>
        What were you doing before, or about to do?
        <textarea
          rows={2}
          placeholder="e.g. avoiding writing that email, procrastinating on a task..."
          value={value}
          onInput={(e) => onChange((e.target as HTMLTextAreaElement).value)}
          onFocus={() => onFocusChange?.(true)}
          onBlur={() => onFocusChange?.(false)}
          style={{ resize: "vertical" }}
        />
      </label>
    </fieldset>
  );
}
