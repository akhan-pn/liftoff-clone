import {
  View,
  Text,
  ScrollView,
  Dimensions,
  Pressable,
} from "react-native";
import { useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import { Card } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import { LineChart, ChartPoint } from "@/components/LineChart";
import { BarChart, Bar } from "@/components/BarChart";
import { MUSCLE_GROUPS, EXERCISE_BY_ID } from "@/lib/exercises";
import { muscleColors } from "@/lib/colors";
import { startOfWeek, format, addDays, isSameDay } from "date-fns";
import type { MuscleGroup } from "@/lib/types";
import { router } from "expo-router";

export default function ProgressTab() {
  const sessions = useStore((s) => s.sessions);
  const prs = useStore((s) => s.prs);
  const unit = useStore((s) => s.unit);
  const [muscle, setMuscle] = useState<MuscleGroup | "All">("All");

  const win = Dimensions.get("window");

  // Weekly volume bars (last 7 days)
  const weekBars: Bar[] = useMemo(() => {
    const start = startOfWeek(new Date(), { weekStartsOn: 1 });
    const days = Array.from({ length: 7 }, (_, i) => addDays(start, i));
    return days.map((d) => ({
      label: format(d, "EEEEE"),
      value: sessions
        .filter((s) => isSameDay(s.startedAt, d))
        .reduce((a, s) => a + s.totalVolumeKg, 0),
      color: "#FF5630",
    }));
  }, [sessions]);

  // Per-muscle volume over last N sessions, then choose chart per muscle
  const perMusclePoints: Record<MuscleGroup, ChartPoint[]> = useMemo(() => {
    const map = {} as Record<MuscleGroup, ChartPoint[]>;
    const sortedAsc = [...sessions].sort((a, b) => a.startedAt - b.startedAt);
    for (const s of sortedAsc) {
      const byMuscle = {} as Record<MuscleGroup, number>;
      for (const ex of s.exercises) {
        const def = EXERCISE_BY_ID[ex.exerciseId];
        if (!def) continue;
        const vol = ex.sets.reduce(
          (a, st) => (st.isWarmup ? a : a + st.weight * st.reps),
          0
        );
        byMuscle[def.muscle] = (byMuscle[def.muscle] ?? 0) + vol;
      }
      for (const m of Object.keys(byMuscle) as MuscleGroup[]) {
        if (!map[m]) map[m] = [];
        map[m].push({ x: s.startedAt, y: byMuscle[m] });
      }
    }
    return map;
  }, [sessions]);

  function fmtVol(kg: number) {
    if (unit === "lb") {
      const lb = kg * 2.20462;
      return lb >= 1000 ? `${(lb / 1000).toFixed(1)}k lb` : `${Math.round(lb)} lb`;
    }
    return kg >= 1000 ? `${(kg / 1000).toFixed(1)}k kg` : `${Math.round(kg)} kg`;
  }

  function fmtWeight(kg: number) {
    if (unit === "lb") return `${Math.round(kg * 2.20462)} lb`;
    return `${Math.round(kg)} kg`;
  }

  const totalSessions = sessions.length;
  const prList = Object.values(prs).sort((a, b) => b.setAt - a.setAt);

  const visibleMuscles =
    muscle === "All"
      ? (Object.keys(perMusclePoints) as MuscleGroup[]).sort(
          (a, b) =>
            (perMusclePoints[b].length || 0) - (perMusclePoints[a].length || 0)
        )
      : [muscle];

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 120, paddingTop: 64 }}>
      <View className="px-5">
        <Text className="text-white text-4xl font-black">Progress</Text>
        <Text className="text-ink-200 mt-1">
          {totalSessions} session{totalSessions === 1 ? "" : "s"} logged
        </Text>
      </View>

      {totalSessions === 0 ? (
        <EmptyState
          icon="📈"
          title="Lift to unlock charts"
          body="Log a session and we'll start drawing your strength curve."
          cta="Start a workout"
          onPress={() => router.push("/(tabs)")}
        />
      ) : (
        <>
          <View className="px-5 mt-6">
            <Text className="text-ink-200 text-xs font-bold uppercase tracking-widest mb-3">
              This week's volume
            </Text>
            <Card>
              <BarChart bars={weekBars} width={win.width - 80} height={140} />
              <Text className="text-ink-200 text-center mt-3 text-xs">
                Total: {fmtVol(weekBars.reduce((a, b) => a + b.value, 0))}
              </Text>
            </Card>
          </View>

          <View className="px-5 mt-8">
            <Text className="text-ink-200 text-xs font-bold uppercase tracking-widest mb-3">
              Per muscle group
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingRight: 20, gap: 8 }}
            >
              {(["All", ...MUSCLE_GROUPS] as const).map((m) => (
                <Pressable
                  key={m}
                  onPress={() => setMuscle(m as any)}
                  className={`px-3 py-2 rounded-full border ${
                    muscle === m
                      ? "bg-accent/20 border-accent"
                      : "bg-ink-700 border-ink-500"
                  }`}
                >
                  <Text
                    className={`text-xs font-bold uppercase tracking-wider ${
                      muscle === m ? "text-accent" : "text-ink-100"
                    }`}
                  >
                    {m}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>

            <View className="gap-3 mt-4">
              {visibleMuscles.length === 0 && (
                <Card>
                  <Text className="text-ink-200 text-center">
                    No data for {muscle} yet.
                  </Text>
                </Card>
              )}
              {visibleMuscles.map((m) => {
                const pts = perMusclePoints[m] ?? [];
                const last = pts[pts.length - 1]?.y ?? 0;
                return (
                  <Card key={m}>
                    <View className="flex-row justify-between items-start mb-3">
                      <View>
                        <Text
                          className="text-base font-black uppercase tracking-wider"
                          style={{ color: muscleColors[m] }}
                        >
                          {m}
                        </Text>
                        <Text className="text-ink-200 text-xs">
                          {pts.length} session{pts.length === 1 ? "" : "s"}
                        </Text>
                      </View>
                      <Text className="text-white font-black">
                        {fmtVol(last)}
                      </Text>
                    </View>
                    <LineChart
                      data={pts}
                      width={win.width - 80}
                      height={120}
                      color={muscleColors[m]}
                    />
                  </Card>
                );
              })}
            </View>
          </View>

          <View className="px-5 mt-8">
            <Text className="text-ink-200 text-xs font-bold uppercase tracking-widest mb-3">
              Personal records
            </Text>
            {prList.length === 0 ? (
              <Card>
                <Text className="text-ink-200 text-center">
                  No PRs yet — get to work.
                </Text>
              </Card>
            ) : (
              <View className="gap-3">
                {prList.slice(0, 8).map((pr) => (
                  <Pressable
                    key={pr.exerciseId}
                    onPress={() => router.push(`/exercise/${pr.exerciseId}`)}
                  >
                    <Card>
                      <View className="flex-row justify-between items-center">
                        <View className="flex-1">
                          <Text className="text-white font-black text-base">
                            {pr.exerciseName}
                          </Text>
                          <Text className="text-ink-200 text-xs mt-0.5">
                            e1RM • {format(pr.setAt, "MMM d")}
                          </Text>
                        </View>
                        <View className="items-end">
                          <Text className="text-gold font-black text-lg">
                            {fmtWeight(pr.e1RM)}
                          </Text>
                          <Text className="text-ink-100 text-xs">
                            {fmtWeight(pr.weightKg)} × {pr.reps}
                          </Text>
                        </View>
                      </View>
                    </Card>
                  </Pressable>
                ))}
              </View>
            )}
          </View>
        </>
      )}
    </ScrollView>
  );
}
