interface Props {
  value: number;
  onChange: (v: number) => void;
}

export function IntensitySlider({ value, onChange }: Props) {
  return (
    <fieldset style={{ marginBottom: "1rem" }}>
      <label>
        Intensity: <strong>{value}</strong> / 10
        <input
          type="range"
          min={1}
          max={10}
          value={value}
          onInput={(e) => onChange(Number((e.target as HTMLInputElement).value))}
        />
      </label>
    </fieldset>
  );
}
