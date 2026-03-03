import type { EmotionCategory } from "../../shared/types";
import { EMOTIONS } from "../../shared/emotions";

interface Props {
  selected: EmotionCategory;
  selectedFlavor?: string;
  onSelect: (cat: EmotionCategory) => void;
  onSelectFlavor: (flavor: string | undefined) => void;
}

export function EmotionPicker({ selected, selectedFlavor, onSelect, onSelectFlavor }: Props) {
  const activeDef = EMOTIONS.find((e) => e.category === selected);

  return (
    <div>
      {/* Category buttons */}
      <div
        role="group"
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "0.5rem",
          justifyContent: "center",
          marginBottom: "1rem",
        }}
      >
        {EMOTIONS.map((emo) => (
          <button
            key={emo.category}
            type="button"
            class={emo.category === selected ? "" : "outline"}
            style={{ flex: "0 0 auto", padding: "0.5rem 0.75rem", fontSize: "0.9rem" }}
            onClick={() => {
              onSelect(emo.category);
              onSelectFlavor(undefined);
            }}
          >
            {emo.emoji} {emo.label}
          </button>
        ))}
      </div>

      {/* Flavor chips */}
      {activeDef && (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "0.35rem",
            justifyContent: "center",
            marginBottom: "1rem",
          }}
        >
          {activeDef.flavors.map((flavor) => (
            <button
              key={flavor}
              type="button"
              class={flavor === selectedFlavor ? "secondary" : "outline secondary"}
              style={{ padding: "0.25rem 0.6rem", fontSize: "0.8rem" }}
              onClick={() => onSelectFlavor(flavor === selectedFlavor ? undefined : flavor)}
            >
              {flavor}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
