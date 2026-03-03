import type { EmotionCategory } from "./types";

export interface EmotionDef {
  category: EmotionCategory;
  label: string;
  emoji: string;
  flavors: string[];
}

export const EMOTIONS: EmotionDef[] = [
  {
    category: "avoidance",
    label: "Avoidance",
    emoji: "🙈",
    flavors: ["procrastination", "escapism", "distraction-seeking", "numbing"],
  },
  {
    category: "fear",
    label: "Fear",
    emoji: "😰",
    flavors: ["dread", "anxiety", "overwhelm", "performance anxiety"],
  },
  {
    category: "boredom",
    label: "Boredom",
    emoji: "😐",
    flavors: ["restlessness", "under-stimulation", "impatience", "monotony"],
  },
  {
    category: "frustration",
    label: "Frustration",
    emoji: "😤",
    flavors: ["irritation", "stuck", "anger", "helplessness"],
  },
  {
    category: "fatigue",
    label: "Fatigue",
    emoji: "😴",
    flavors: ["mental exhaustion", "decision fatigue", "burnout", "brain fog"],
  },
  {
    category: "shame",
    label: "Shame",
    emoji: "😔",
    flavors: ["inadequacy", "imposter syndrome", "guilt", "self-doubt"],
  },
  {
    category: "freeze",
    label: "Freeze",
    emoji: "🧊",
    flavors: ["paralysis", "blank mind", "dissociation", "shutdown"],
  },
];
