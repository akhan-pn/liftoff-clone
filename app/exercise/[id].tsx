import {
  View,
  Text,
  ScrollView,
  Pressable,
  Dimensions,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useStore } from "@/lib/store";
import { EXERCISE_BY_ID } from "@/lib/exercises";
import { LinearGradient } from "expo-linear-gradient";
import { MuscleTag } from "@/components/MuscleTag";
import { LineChart, ChartPoint } from "@/components/LineChart";
import { Card } from "@/components/Card";
import { muscleColors } from "@/lib/colors";
import { estimate1RM } from "@/lib/prs";
import { format } from "date-fns";

export default function ExerciseDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const ex = id ? EXERCISE_BY_ID[id] : undefined;
  const sessions = useStore((s) => s.sessions);
  const pr = useStore((s) => s.prs[id ?? ""]);
  const unit = useStore((s) => s.unit);
  const win = Dimensions.get("window");

  if (!ex) {
    return (
      <View
        style={{ flex: 1, backgroundColor: "#06070D", paddingTop: 80, padding: 20 }}
      >
        <Text className="text-white">Exercise not found.</Text>
      </View>
    );
  }

  const points: ChartPoint[] = [];
  for (const s of [...sessions].sort((a, b) => a.startedAt - b.startedAt)) {
    for (const e of s.exercises) {
      if (e.exerciseId !== id) continue;
      const best = e.sets
        .filter((x) => !x.isWarmup)
        .reduce(
          (m, x) => Math.max(m, estimate1RM(x.weight, x.reps)),
          0
        );
      if (best > 0) points.push({ x: s.startedAt, y: best });
    }
  }

  function fmtW(kg: number) {
    return unit === "lb"
      ? `${Math.round(kg * 2.20462)} lb`
      : `${Math.round(kg)} kg`;
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#06070D" }}
      contentContainerStyle={{ paddingBottom: 60 }}
    >
      <LinearGradient
        colors={[muscleColors[ex.muscle] + "AA", "#06070D"]}
        style={{ paddingTop: 56, paddingHorizontal: 20, paddingBottom: 24 }}
      >
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Text className="text-white/80">← Back</Text>
        </Pressable>
        <Text className="text-white text-3xl font-black mt-2">{ex.name}</Text>
        <View className="flex-row gap-2 mt-2">
          <MuscleTag muscle={ex.muscle} />
          <View className="bg-ink-700 border border-ink-400 rounded-full px-2.5 py-0.5">
            <Text className="text-ink-100 text-[10px] font-bold uppercase tracking-wider">
              {ex.equipment}
            </Text>
          </View>
          <View className="bg-ink-700 border border-ink-400 rounded-full px-2.5 py-0.5">
            <Text className="text-ink-100 text-[10px] font-bold uppercase tracking-wider">
              {ex.category}
            </Text>
          </View>
        </View>
      </LinearGradient>

      <View className="px-5 mt-6 gap-3">
        {pr ? (
          <Card>
            <Text className="text-gold text-xs font-bold uppercase tracking-widest mb-2">
              Personal record
            </Text>
            <View className="flex-row justify-between items-end">
              <View>
                <Text className="text-white font-black text-3xl">
                  {fmtW(pr.weightKg)} × {pr.reps}
                </Text>
                <Text className="text-ink-200 mt-1">
                  Set {format(pr.setAt, "MMM d, yyyy")}
                </Text>
              </View>
              <View className="items-end">
                <Text className="text-ink-200 text-[10px] uppercase font-bold tracking-widest">
                  e1RM
                </Text>
                <Text className="text-white font-black text-2xl">
                  {fmtW(pr.e1RM)}
                </Text>
              </View>
            </View>
          </Card>
        ) : (
          <Card>
            <Text className="text-ink-200 text-center">
              No PR set yet — log a working set to seed the chart.
            </Text>
          </Card>
        )}

        {points.length >= 1 && (
          <Card>
            <Text className="text-ink-200 text-xs font-bold uppercase tracking-widest mb-2">
              e1RM progression
            </Text>
            <LineChart
              data={points}
              width={win.width - 80}
              height={180}
              color={muscleColors[ex.muscle]}
            />
          </Card>
        )}

        <Card>
          <Text className="text-ink-200 text-xs font-bold uppercase tracking-widest mb-2">
            Recent sets
          </Text>
          <View className="gap-2">
            {sessions
              .flatMap((s) =>
                s.exercises
                  .filter((e) => e.exerciseId === id)
                  .flatMap((e) =>
                    e.sets.map((set) => ({
                      ...set,
                      sessionDate: s.startedAt,
                    }))
                  )
              )
              .sort((a, b) => b.completedAt - a.completedAt)
              .slice(0, 12)
              .map((s) => (
                <View
                  key={s.id}
                  className="flex-row justify-between items-center py-2 border-b border-ink-500"
                >
                  <Text className="text-ink-100 text-xs">
                    {format(s.completedAt, "MMM d")}
                  </Text>
                  <Text
                    className={`font-bold ${
                      s.isPR ? "text-gold" : "text-white"
                    }`}
                  >
                    {fmtW(s.weight)} × {s.reps}
                    {s.isWarmup ? " (W)" : ""}
                  </Text>
                </View>
              ))}
            {points.length === 0 && (
              <Text className="text-ink-200 text-center py-4">
                No sets yet.
              </Text>
            )}
          </View>
        </Card>
      </View>
    </ScrollView>
  );
}
