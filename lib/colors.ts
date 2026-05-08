import type { MuscleGroup } from "./types";

export const muscleColors: Record<MuscleGroup, string> = {
  Chest: "#FF5630",
  Back: "#3B82F6",
  Shoulders: "#F59E0B",
  Biceps: "#A855F7",
  Triceps: "#EC4899",
  Forearms: "#8B5CF6",
  Quads: "#10B981",
  Hamstrings: "#14B8A6",
  Glutes: "#F43F5E",
  Calves: "#06B6D4",
  Abs: "#EAB308",
  Obliques: "#FACC15",
  Traps: "#6366F1",
  Lats: "#0EA5E9",
  Cardio: "#22C55E",
  "Full Body": "#F97316",
};

export const rankTiers = [
  { name: "Rookie", min: 0, color: "#9AA0B4" },
  { name: "Iron", min: 5_000, color: "#A7A5A1" },
  { name: "Bronze", min: 15_000, color: "#CD7F32" },
  { name: "Silver", min: 35_000, color: "#C0C0C0" },
  { name: "Gold", min: 70_000, color: "#F5C04A" },
  { name: "Platinum", min: 150_000, color: "#7AD3F0" },
  { name: "Diamond", min: 300_000, color: "#5BC0EB" },
  { name: "Mythic", min: 600_000, color: "#FF5630" },
];

export function rankFromVolume(monthlyVolumeKg: number) {
  let current = rankTiers[0];
  for (const t of rankTiers) if (monthlyVolumeKg >= t.min) current = t;
  return current;
}
