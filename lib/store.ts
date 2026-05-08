import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type {
  Routine,
  RoutineExercise,
  Session,
  ExerciseLog,
  SetLog,
  PR,
  Unit,
} from "./types";
import { sessionVolume, currentStreak, weeklyVolume } from "./volume";
import { estimate1RM, isSetPR } from "./prs";
import { EXERCISE_BY_ID } from "./exercises";

let _id = 0;
function makeId(prefix = "id") {
  _id += 1;
  return `${prefix}_${Date.now().toString(36)}_${_id.toString(36)}`;
}

export interface ActiveSession {
  id: string;
  routineId?: string;
  routineName: string;
  startedAt: number;
  exercises: ExerciseLog[];
  currentExerciseIdx: number;
  // Just-set PR queue, drained by UI for celebrations
  pendingCelebrations: { exerciseName: string; weight: number; reps: number }[];
  restEndsAt?: number;
  restDurationSec?: number;
}

interface PersistedShape {
  unit: Unit;
  bodyweightKg: number;
  username: string;
  avatarColor: string;
  routines: Routine[];
  sessions: Session[];
  prs: Record<string, PR>; // best per exercise
  activeSession: ActiveSession | null;
  hasOnboarded: boolean;
}

interface Actions {
  setUnit: (u: Unit) => void;
  setUsername: (s: string) => void;
  setBodyweight: (n: number) => void;
  finishOnboarding: () => void;

  createRoutine: (name: string, emoji?: string) => string;
  updateRoutine: (id: string, patch: Partial<Routine>) => void;
  deleteRoutine: (id: string) => void;
  addExerciseToRoutine: (routineId: string, ex: RoutineExercise) => void;
  removeExerciseFromRoutine: (routineId: string, exerciseId: string) => void;
  reorderRoutineExercise: (routineId: string, from: number, to: number) => void;

  startWorkout: (routineId?: string) => void;
  startEmptyWorkout: () => void;
  logSet: (
    exerciseId: string,
    weight: number,
    reps: number,
    isWarmup?: boolean
  ) => { isPR: boolean };
  removeSet: (exerciseId: string, setId: string) => void;
  toggleWarmup: (exerciseId: string, setId: string) => void;
  setActiveExerciseIdx: (idx: number) => void;
  startRest: (seconds: number) => void;
  cancelRest: () => void;
  drainCelebration: () => void;
  finishWorkout: () => string | null; // returns sessionId
  cancelWorkout: () => void;
  addExerciseToActive: (exerciseId: string) => void;

  resetAll: () => void;
}

const seedRoutines = (): Routine[] => {
  const now = Date.now();
  return [
    {
      id: "starter-push",
      name: "Push Day",
      emoji: "💪",
      description: "Chest / Shoulders / Triceps",
      createdAt: now,
      updatedAt: now,
      exercises: [
        {
          exerciseId: "barbell-bench-press",
          targetSets: 4,
          targetReps: "5-8",
          restSeconds: 180,
        },
        {
          exerciseId: "incline-dumbbell-bench-press",
          targetSets: 3,
          targetReps: "8-10",
          restSeconds: 120,
        },
        {
          exerciseId: "overhead-press",
          targetSets: 3,
          targetReps: "6-8",
          restSeconds: 150,
        },
        {
          exerciseId: "dumbbell-lateral-raise",
          targetSets: 3,
          targetReps: "12-15",
          restSeconds: 60,
        },
        {
          exerciseId: "tricep-pushdown-rope",
          targetSets: 3,
          targetReps: "10-12",
          restSeconds: 60,
        },
      ],
    },
    {
      id: "starter-pull",
      name: "Pull Day",
      emoji: "🪝",
      description: "Back / Biceps",
      createdAt: now,
      updatedAt: now,
      exercises: [
        {
          exerciseId: "deadlift",
          targetSets: 3,
          targetReps: "3-5",
          restSeconds: 240,
        },
        {
          exerciseId: "weighted-pull-up",
          targetSets: 4,
          targetReps: "5-8",
          restSeconds: 150,
        },
        {
          exerciseId: "bent-over-barbell-row",
          targetSets: 3,
          targetReps: "8-10",
          restSeconds: 120,
        },
        {
          exerciseId: "lat-pulldown",
          targetSets: 3,
          targetReps: "10-12",
          restSeconds: 90,
        },
        {
          exerciseId: "barbell-curl",
          targetSets: 3,
          targetReps: "8-10",
          restSeconds: 60,
        },
        {
          exerciseId: "hammer-curl",
          targetSets: 3,
          targetReps: "10-12",
          restSeconds: 60,
        },
      ],
    },
    {
      id: "starter-legs",
      name: "Leg Day",
      emoji: "🦵",
      description: "Quads / Hamstrings / Glutes",
      createdAt: now,
      updatedAt: now,
      exercises: [
        {
          exerciseId: "back-squat",
          targetSets: 4,
          targetReps: "5-8",
          restSeconds: 240,
        },
        {
          exerciseId: "romanian-deadlift",
          targetSets: 3,
          targetReps: "8-10",
          restSeconds: 150,
        },
        {
          exerciseId: "bulgarian-split-squat",
          targetSets: 3,
          targetReps: "8-10",
          restSeconds: 120,
        },
        {
          exerciseId: "leg-press",
          targetSets: 3,
          targetReps: "10-12",
          restSeconds: 120,
        },
        {
          exerciseId: "lying-leg-curl",
          targetSets: 3,
          targetReps: "10-12",
          restSeconds: 90,
        },
        {
          exerciseId: "standing-calf-raise-machine",
          targetSets: 4,
          targetReps: "12-15",
          restSeconds: 60,
        },
      ],
    },
  ];
};

const initialState: PersistedShape = {
  unit: "kg",
  bodyweightKg: 80,
  username: "Lifter",
  avatarColor: "#FF5630",
  routines: seedRoutines(),
  sessions: [],
  prs: {},
  activeSession: null,
  hasOnboarded: false,
};

export const useStore = create<PersistedShape & Actions>()(
  persist(
    (set, get) => ({
      ...initialState,

      setUnit: (u) => set({ unit: u }),
      setUsername: (s) => set({ username: s || "Lifter" }),
      setBodyweight: (n) => set({ bodyweightKg: Math.max(0, n) }),
      finishOnboarding: () => set({ hasOnboarded: true }),

      createRoutine: (name, emoji) => {
        const id = makeId("r");
        const now = Date.now();
        set((s) => ({
          routines: [
            ...s.routines,
            {
              id,
              name: name || "Untitled Routine",
              emoji,
              exercises: [],
              createdAt: now,
              updatedAt: now,
            },
          ],
        }));
        return id;
      },
      updateRoutine: (id, patch) =>
        set((s) => ({
          routines: s.routines.map((r) =>
            r.id === id ? { ...r, ...patch, updatedAt: Date.now() } : r
          ),
        })),
      deleteRoutine: (id) =>
        set((s) => ({ routines: s.routines.filter((r) => r.id !== id) })),
      addExerciseToRoutine: (routineId, ex) =>
        set((s) => ({
          routines: s.routines.map((r) =>
            r.id === routineId
              ? {
                  ...r,
                  exercises: [...r.exercises, ex],
                  updatedAt: Date.now(),
                }
              : r
          ),
        })),
      removeExerciseFromRoutine: (routineId, exerciseId) =>
        set((s) => ({
          routines: s.routines.map((r) =>
            r.id === routineId
              ? {
                  ...r,
                  exercises: r.exercises.filter(
                    (e) => e.exerciseId !== exerciseId
                  ),
                  updatedAt: Date.now(),
                }
              : r
          ),
        })),
      reorderRoutineExercise: (routineId, from, to) =>
        set((s) => ({
          routines: s.routines.map((r) => {
            if (r.id !== routineId) return r;
            const arr = [...r.exercises];
            const [moved] = arr.splice(from, 1);
            arr.splice(to, 0, moved);
            return { ...r, exercises: arr, updatedAt: Date.now() };
          }),
        })),

      startWorkout: (routineId) => {
        const r = get().routines.find((x) => x.id === routineId);
        const exercises: ExerciseLog[] = (r?.exercises ?? []).map((re) => ({
          exerciseId: re.exerciseId,
          sets: [],
        }));
        set({
          activeSession: {
            id: makeId("s"),
            routineId,
            routineName: r?.name ?? "Quick Workout",
            startedAt: Date.now(),
            exercises,
            currentExerciseIdx: 0,
            pendingCelebrations: [],
          },
        });
      },
      startEmptyWorkout: () =>
        set({
          activeSession: {
            id: makeId("s"),
            routineName: "Quick Workout",
            startedAt: Date.now(),
            exercises: [],
            currentExerciseIdx: 0,
            pendingCelebrations: [],
          },
        }),

      addExerciseToActive: (exerciseId) =>
        set((s) => {
          if (!s.activeSession) return {};
          const exists = s.activeSession.exercises.find(
            (e) => e.exerciseId === exerciseId
          );
          if (exists) return {};
          const exercises = [
            ...s.activeSession.exercises,
            { exerciseId, sets: [] as SetLog[] },
          ];
          return {
            activeSession: {
              ...s.activeSession,
              exercises,
              currentExerciseIdx: exercises.length - 1,
            },
          };
        }),

      logSet: (exerciseId, weight, reps, isWarmup = false) => {
        const ex = EXERCISE_BY_ID[exerciseId];
        const prevPR = get().prs[exerciseId]?.e1RM ?? 0;
        const isPR = !isWarmup && isSetPR(weight, reps, prevPR);
        const setEntry: SetLog = {
          id: makeId("set"),
          weight,
          reps,
          isWarmup,
          isPR,
          completedAt: Date.now(),
        };
        set((s) => {
          if (!s.activeSession) return {};
          const exercises = [...s.activeSession.exercises];
          const idx = exercises.findIndex(
            (e) => e.exerciseId === exerciseId
          );
          if (idx === -1) {
            exercises.push({ exerciseId, sets: [setEntry] });
          } else {
            exercises[idx] = {
              ...exercises[idx],
              sets: [...exercises[idx].sets, setEntry],
            };
          }
          const nextPRs = { ...s.prs };
          if (isPR && ex) {
            nextPRs[exerciseId] = {
              exerciseId,
              exerciseName: ex.name,
              weightKg: weight,
              reps,
              e1RM: estimate1RM(weight, reps),
              setAt: Date.now(),
              sessionId: s.activeSession.id,
            };
          }
          const pendingCelebrations = isPR && ex
            ? [
                ...s.activeSession.pendingCelebrations,
                { exerciseName: ex.name, weight, reps },
              ]
            : s.activeSession.pendingCelebrations;
          return {
            activeSession: {
              ...s.activeSession,
              exercises,
              pendingCelebrations,
            },
            prs: nextPRs,
          };
        });
        return { isPR };
      },

      removeSet: (exerciseId, setId) =>
        set((s) => {
          if (!s.activeSession) return {};
          return {
            activeSession: {
              ...s.activeSession,
              exercises: s.activeSession.exercises.map((e) =>
                e.exerciseId === exerciseId
                  ? { ...e, sets: e.sets.filter((x) => x.id !== setId) }
                  : e
              ),
            },
          };
        }),

      toggleWarmup: (exerciseId, setId) =>
        set((s) => {
          if (!s.activeSession) return {};
          return {
            activeSession: {
              ...s.activeSession,
              exercises: s.activeSession.exercises.map((e) =>
                e.exerciseId === exerciseId
                  ? {
                      ...e,
                      sets: e.sets.map((x) =>
                        x.id === setId ? { ...x, isWarmup: !x.isWarmup } : x
                      ),
                    }
                  : e
              ),
            },
          };
        }),

      setActiveExerciseIdx: (idx) =>
        set((s) =>
          s.activeSession
            ? {
                activeSession: { ...s.activeSession, currentExerciseIdx: idx },
              }
            : {}
        ),

      startRest: (seconds) =>
        set((s) =>
          s.activeSession
            ? {
                activeSession: {
                  ...s.activeSession,
                  restEndsAt: Date.now() + seconds * 1000,
                  restDurationSec: seconds,
                },
              }
            : {}
        ),
      cancelRest: () =>
        set((s) =>
          s.activeSession
            ? {
                activeSession: {
                  ...s.activeSession,
                  restEndsAt: undefined,
                  restDurationSec: undefined,
                },
              }
            : {}
        ),
      drainCelebration: () =>
        set((s) =>
          s.activeSession
            ? {
                activeSession: {
                  ...s.activeSession,
                  pendingCelebrations:
                    s.activeSession.pendingCelebrations.slice(1),
                },
              }
            : {}
        ),

      finishWorkout: () => {
        const s = get();
        const a = s.activeSession;
        if (!a) return null;
        const endedAt = Date.now();
        const cleaned = a.exercises.filter((e) => e.sets.length > 0);
        if (cleaned.length === 0) {
          set({ activeSession: null });
          return null;
        }
        const session: Session = {
          id: a.id,
          routineId: a.routineId,
          routineName: a.routineName,
          startedAt: a.startedAt,
          endedAt,
          exercises: cleaned,
          totalVolumeKg: 0,
          durationSec: Math.max(1, Math.round((endedAt - a.startedAt) / 1000)),
          prCount: cleaned.reduce(
            (acc, ex) => acc + ex.sets.filter((st) => st.isPR).length,
            0
          ),
        };
        session.totalVolumeKg = sessionVolume(session);
        set({
          sessions: [session, ...s.sessions],
          activeSession: null,
        });
        return session.id;
      },
      cancelWorkout: () => set({ activeSession: null }),

      resetAll: () => set({ ...initialState, hasOnboarded: true }),
    }),
    {
      name: "liftoff-store-v1",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({
        unit: s.unit,
        bodyweightKg: s.bodyweightKg,
        username: s.username,
        avatarColor: s.avatarColor,
        routines: s.routines,
        sessions: s.sessions,
        prs: s.prs,
        hasOnboarded: s.hasOnboarded,
        // intentionally omit activeSession to avoid stale "in-progress" state on relaunch
      }),
    }
  )
);

// Convenience selectors
export const useStreak = () =>
  useStore((s) => currentStreak(s.sessions));
export const useWeeklyVolume = () =>
  useStore((s) => weeklyVolume(s.sessions));
