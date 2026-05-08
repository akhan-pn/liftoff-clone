import {
  View,
  Text,
  ScrollView,
  Pressable,
  Dimensions,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useStore } from "@/lib/store";
import { EXERCISE_BY_ID } from "@/lib/exercises";
import { LinearGradient } from "expo-linear-gradient";
import { MuscleTag } from "@/components/MuscleTag";
import { format } from "date-fns";
import Svg, { Path, Circle } from "react-native-svg";

export default function Summary() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const session = useStore((s) => s.sessions.find((x) => x.id === id));
  const unit = useStore((s) => s.unit);
  const win = Dimensions.get("window");

  if (!session) {
    return (
      <View
        style={{ flex: 1, backgroundColor: "#06070D", paddingTop: 80 }}
      >
        <Text className="text-white text-center">Session not found.</Text>
      </View>
    );
  }

  function fmtVol(kg: number) {
    if (unit === "lb") {
      const lb = kg * 2.20462;
      return lb >= 1000
        ? `${(lb / 1000).toFixed(1)}k lb`
        : `${Math.round(lb)} lb`;
    }
    return kg >= 1000
      ? `${(kg / 1000).toFixed(1)}k kg`
      : `${Math.round(kg)} kg`;
  }
  function fmtW(kg: number) {
    return unit === "lb"
      ? `${Math.round(kg * 2.20462)}`
      : `${Math.round(kg)}`;
  }

  const totalSets = session.exercises.reduce(
    (a, e) => a + e.sets.length,
    0
  );

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#06070D" }}
      contentContainerStyle={{ paddingBottom: 60 }}
    >
      <LinearGradient
        colors={["#FF5630", "#06070D"]}
        style={{ paddingTop: 64, paddingHorizontal: 20, paddingBottom: 32 }}
      >
        <Text className="text-white/70 text-xs uppercase font-black tracking-widest">
          Workout complete
        </Text>
        <Text className="text-white text-4xl font-black mt-1">
          {session.routineName}
        </Text>
        <Text className="text-white/80 mt-1">
          {format(session.startedAt, "EEEE, MMMM d • h:mm a")}
        </Text>

        <View className="flex-row gap-3 mt-6">
          <Stat label="Volume" value={fmtVol(session.totalVolumeKg)} />
          <Stat
            label="Time"
            value={`${Math.round(session.durationSec / 60)}m`}
          />
          <Stat label="Sets" value={String(totalSets)} />
          <Stat label="PRs" value={String(session.prCount)} />
        </View>
      </LinearGradient>

      <View className="px-5 mt-6">
        <Text className="text-ink-200 text-xs font-bold uppercase tracking-widest mb-3">
          Lifts
        </Text>
        <View className="gap-3">
          {session.exercises.map((ex) => {
            const def = EXERCISE_BY_ID[ex.exerciseId];
            if (!def) return null;
            const top = ex.sets
              .filter((s) => !s.isWarmup)
              .reduce<typeof ex.sets[number] | undefined>(
                (best, s) =>
                  !best || s.weight * s.reps > best.weight * best.reps
                    ? s
                    : best,
                undefined
              );
            const vol = ex.sets.reduce(
              (a, s) => (s.isWarmup ? a : a + s.weight * s.reps),
              0
            );
            const hasPR = ex.sets.some((s) => s.isPR);
            return (
              <View
                key={ex.exerciseId}
                className="bg-ink-700 border border-ink-500 rounded-2xl p-4"
              >
                <View className="flex-row justify-between items-start">
                  <View className="flex-1">
                    <View className="flex-row items-center gap-2">
                      <Text className="text-white font-black">
                        {def.name}
                      </Text>
                      {hasPR && (
                        <View className="bg-gold rounded-full px-1.5">
                          <Text className="text-ink-900 font-black text-[10px]">
                            PR
                          </Text>
                        </View>
                      )}
                    </View>
                    <View className="flex-row gap-2 mt-1.5">
                      <MuscleTag muscle={def.muscle} />
                    </View>
                  </View>
                  <View className="items-end">
                    <Text className="text-white font-black">
                      {fmtVol(vol)}
                    </Text>
                    {top && (
                      <Text className="text-ink-100 text-xs">
                        Top {fmtW(top.weight)}
                        {unit} × {top.reps}
                      </Text>
                    )}
                  </View>
                </View>

                <View className="flex-row flex-wrap gap-1 mt-3">
                  {ex.sets.map((s, i) => (
                    <View
                      key={s.id}
                      className={`px-2 py-1 rounded-lg border ${
                        s.isPR
                          ? "border-gold bg-gold/15"
                          : s.isWarmup
                          ? "border-ink-400 bg-ink-600"
                          : "border-ink-400 bg-ink-600"
                      }`}
                    >
                      <Text
                        className={`text-[11px] font-bold ${
                          s.isPR ? "text-gold" : "text-white"
                        }`}
                      >
                        {fmtW(s.weight)}
                        {unit} × {s.reps}
                        {s.isWarmup ? " W" : ""}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            );
          })}
        </View>
      </View>

      <Pressable
        onPress={() => router.replace("/(tabs)")}
        className="mx-5 mt-8 py-4 bg-accent rounded-2xl items-center"
      >
        <Text className="text-white font-black uppercase tracking-widest">
          Done
        </Text>
      </Pressable>
    </ScrollView>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-1">
      <Text className="text-white/60 text-[10px] uppercase font-bold tracking-widest">
        {label}
      </Text>
      <Text className="text-white font-black text-xl mt-0.5">{value}</Text>
    </View>
  );
}
