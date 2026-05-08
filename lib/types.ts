export type MuscleGroup =
  | "Chest"
  | "Back"
  | "Shoulders"
  | "Biceps"
  | "Triceps"
  | "Forearms"
  | "Quads"
  | "Hamstrings"
  | "Glutes"
  | "Calves"
  | "Abs"
  | "Obliques"
  | "Traps"
  | "Lats"
  | "Cardio"
  | "Full Body";

export type Equipment =
  | "Barbell"
  | "Dumbbell"
  | "Cable"
  | "Machine"
  | "Bodyweight"
  | "Smith"
  | "Kettlebell"
  | "Band"
  | "EZ Bar"
  | "Trap Bar"
  | "Other";

export type Category = "Strength" | "Cardio" | "Mobility" | "Plyo";

export interface Exercise {
  id: string;
  name: string;
  muscle: MuscleGroup;
  secondary?: MuscleGroup[];
  equipment: Equipment;
  category: Category;
  isCompound?: boolean;
}

export interface RoutineExercise {
  exerciseId: string;
  targetSets: number;
  targetReps: string; // e.g. "8-10" or "5"
  restSeconds: number;
  notes?: string;
}

export interface Routine {
  id: string;
  name: string;
  emoji?: string;
  description?: string;
  exercises: RoutineExercise[];
  createdAt: number;
  updatedAt: number;
}

export interface SetLog {
  id: string;
  weight: number; // kg
  reps: number;
  rpe?: number;
  isWarmup?: boolean;
  isPR?: boolean;
  completedAt: number;
}

export interface ExerciseLog {
  exerciseId: string;
  sets: SetLog[];
  notes?: string;
}

export interface Session {
  id: string;
  routineId?: string;
  routineName: string;
  startedAt: number;
  endedAt?: number;
  exercises: ExerciseLog[];
  totalVolumeKg: number; // computed at end
  durationSec: number;
  prCount: number;
}

export interface PR {
  exerciseId: string;
  exerciseName: string;
  weightKg: number;
  reps: number;
  e1RM: number; // estimated 1RM
  setAt: number;
  sessionId: string;
}

export interface LeaderboardUser {
  id: string;
  name: string;
  avatar: string; // initials
  weeklyVolumeKg: number;
  monthlyVolumeKg: number;
  streak: number;
  rank: string; // tier name
  isMe?: boolean;
}

export type Unit = "kg" | "lb";
