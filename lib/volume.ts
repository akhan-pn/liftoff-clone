import {
  startOfWeek,
  startOfDay,
  isSameDay,
  isSameWeek,
  differenceInCalendarDays,
  startOfMonth,
} from "date-fns";
import type { Session } from "./types";

export function setVolume(weight: number, reps: number) {
  return Math.max(0, weight) * Math.max(0, reps);
}

export function sessionVolume(s: Session): number {
  return s.exercises.reduce(
    (acc, ex) =>
      acc +
      ex.sets.reduce(
        (a, st) => (st.isWarmup ? a : a + setVolume(st.weight, st.reps)),
        0
      ),
    0
  );
}

export function weeklyVolume(sessions: Session[], now = new Date()): number {
  return sessions
    .filter((s) => isSameWeek(s.startedAt, now, { weekStartsOn: 1 }))
    .reduce((a, s) => a + s.totalVolumeKg, 0);
}

export function monthlyVolume(sessions: Session[], now = new Date()): number {
  const monthStart = startOfMonth(now).getTime();
  return sessions
    .filter((s) => s.startedAt >= monthStart)
    .reduce((a, s) => a + s.totalVolumeKg, 0);
}

export function currentStreak(sessions: Session[], now = new Date()): number {
  if (sessions.length === 0) return 0;
  const days = new Set(
    sessions.map((s) => startOfDay(s.startedAt).getTime())
  );
  let streak = 0;
  let cursor = startOfDay(now).getTime();
  // Allow today to be missed; start counting from yesterday if today empty.
  if (!days.has(cursor)) cursor = startOfDay(now).getTime() - 86_400_000;
  while (days.has(cursor)) {
    streak++;
    cursor -= 86_400_000;
  }
  return streak;
}

export function trainingDaysThisWeek(
  sessions: Session[],
  now = new Date()
): number {
  const start = startOfWeek(now, { weekStartsOn: 1 }).getTime();
  const days = new Set<number>();
  for (const s of sessions) {
    if (s.startedAt >= start) days.add(startOfDay(s.startedAt).getTime());
  }
  return days.size;
}

export function lastWorkoutDays(
  sessions: Session[],
  now = new Date()
): number | null {
  if (sessions.length === 0) return null;
  const last = Math.max(...sessions.map((s) => s.startedAt));
  return differenceInCalendarDays(now, last);
}

export function isToday(ts: number, now = new Date()) {
  return isSameDay(ts, now);
}
