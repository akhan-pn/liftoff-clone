// Estimated 1RM (Epley formula). Treats reps == 1 as the lift itself.
export function estimate1RM(weight: number, reps: number): number {
  if (reps <= 0 || weight <= 0) return 0;
  if (reps === 1) return weight;
  return weight * (1 + reps / 30);
}

export function bestE1RM(sets: { weight: number; reps: number }[]): number {
  return sets.reduce((m, s) => Math.max(m, estimate1RM(s.weight, s.reps)), 0);
}

export function isSetPR(
  weight: number,
  reps: number,
  prevBestE1RM: number
): boolean {
  if (weight <= 0 || reps <= 0) return false;
  return estimate1RM(weight, reps) > prevBestE1RM + 0.01;
}
