import { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useStore } from "@/lib/store";
import { EXERCISE_BY_ID } from "@/lib/exercises";
import { MuscleTag } from "@/components/MuscleTag";
import { RestTimer } from "@/components/RestTimer";
import { PRCelebration } from "@/components/PRCelebration";
import { SetEntryRow } from "@/components/SetRow";
import { EmptyState } from "@/components/EmptyState";
import * as Haptics from "expo-haptics";

function fmtElapsed(ms: number) {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const sec = s % 60;
  if (m >= 60) {
    const h = Math.floor(m / 60);
    return `${h}h ${m % 60}m`;
  }
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

export default function ActiveWorkout() {
  const session = useStore((s) => s.activeSession);
  const unit = useStore((s) => s.unit);
  const prs = useStore((s) => s.prs);
  const routines = useStore((s) => s.routines);
  const logSet = useStore((s) => s.logSet);
  const removeSet = useStore((s) => s.removeSet);
  const toggleWarmup = useStore((s) => s.toggleWarmup);
  const startRest = useStore((s) => s.startRest);
  const updateRoutine = useStore((s) => s.updateRoutine);
  const finish = useStore((s) => s.finishWorkout);
  const cancel = useStore((s) => s.cancelWorkout);

  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  if (!session) {
    return (
      <View
        style={{ flex: 1, backgroundColor: "#06070D", paddingTop: 80 }}
      >
        <EmptyState
          icon="🏋️"
          title="No active workout"
          body="Start one from your routine list."
          cta="Back home"
          onPress={() => router.replace("/(tabs)")}
        />
      </View>
    );
  }

  const elapsed = now - session.startedAt;
  const totalVol = session.exercises.reduce(
    (a, e) =>
      a +
      e.sets.reduce(
        (b, s) => (s.isWarmup ? b : b + s.weight * s.reps),
        0
      ),
    0
  );
  const totalSets = session.exercises.reduce(
    (a, e) => a + e.sets.length,
    0
  );

  function fmtVol(kg: number) {
    if (unit === "lb") {
      const lb = kg * 2.20462;
      return lb >= 1000 ? `${(lb / 1000).toFixed(1)}k lb` : `${Math.round(lb)} lb`;
    }
    return kg >= 1000 ? `${(kg / 1000).toFixed(1)}k kg` : `${Math.round(kg)} kg`;
  }

  function handleLog(
    exerciseId: string,
    weight: number,
    reps: number,
    isWarmup: boolean,
    restSeconds: number
  ) {
    const result = logSet(exerciseId, weight, reps, isWarmup);
    if (!isWarmup && restSeconds > 0) {
      startRest(restSeconds);
    }
    if (result.isPR) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }

  function handleFinish() {
    Alert.alert(
      "Finish workout?",
      `${totalSets} set${totalSets === 1 ? "" : "s"}, ${fmtVol(totalVol)} of volume.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Finish",
          onPress: () => {
            const id = finish();
            if (id) {
              router.replace({ pathname: "/workout/summary/[id]", params: { id } });
            } else {
              router.replace("/(tabs)");
            }
          },
        },
      ]
    );
  }

  function handleCancel() {
    Alert.alert("Discard workout?", "All logged sets will be lost.", [
      { text: "Keep lifting", style: "cancel" },
      {
        text: "Discard",
        style: "destructive",
        onPress: () => {
          cancel();
          router.replace("/(tabs)");
        },
      },
    ]);
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={{ flex: 1, backgroundColor: "#06070D" }}>
        <PRCelebration />

        <LinearGradient
          colors={["#FF5630", "#B92C12"]}
          style={{
            paddingTop: 56,
            paddingHorizontal: 20,
            paddingBottom: 16,
          }}
        >
          <View className="flex-row justify-between items-center mb-2">
            <Pressable onPress={handleCancel} hitSlop={12}>
              <Text className="text-white/80 text-base">Discard</Text>
            </Pressable>
            <Text className="text-white font-black uppercase tracking-widest text-xs">
              Live
            </Text>
            <Pressable onPress={handleFinish} hitSlop={12}>
              <Text className="text-white font-black text-base">Finish</Text>
            </Pressable>
          </View>
          <Text className="text-white text-2xl font-black mt-1">
            {session.routineName}
          </Text>
          <View className="flex-row gap-4 mt-3">
            <Text className="text-white/90 font-black text-lg">
              {fmtElapsed(elapsed)}
            </Text>
            <Text className="text-white/90 font-bold">{totalSets} sets</Text>
            <Text className="text-white/90 font-bold">{fmtVol(totalVol)}</Text>
          </View>
        </LinearGradient>

        {session.restEndsAt ? (
          <View className="px-5 pt-3">
            <RestTimer />
          </View>
        ) : null}

        <ScrollView
          contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
        >
          {session.exercises.length === 0 && (
            <EmptyState
              icon="➕"
              title="Pick your first lift"
              body="Empty workout — add exercises as you go."
              cta="Add exercise"
              onPress={() =>
                router.push({
                  pathname: "/routine/pick-exercise",
                  params: { mode: "active" },
                })
              }
            />
          )}

          <View className="gap-4">
            {session.exercises.map((ex, idx) => {
              const def = EXERCISE_BY_ID[ex.exerciseId];
              if (!def) return null;
              const activeRoutine = routines.find(
                (r) => r.id === session.routineId
              );
              const routineExercise = activeRoutine?.exercises.find(
                (re) => re.exerciseId === ex.exerciseId
              );
              const targetSets = routineExercise?.targetSets ?? 3;
              const targetReps = routineExercise?.targetReps ?? "8-10";
              const restSec = routineExercise?.restSeconds ?? 90;
              const lastTopSet = ex.sets
                .filter((s) => !s.isWarmup)
                .reduce<typeof ex.sets[number] | undefined>(
                  (best, s) =>
                    !best || s.weight > best.weight ? s : best,
                  undefined
                );
              const remaining = Math.max(targetSets - ex.sets.length, 0);
              const pr = prs[ex.exerciseId];

              return (
                <View
                  key={ex.exerciseId}
                  className="bg-ink-700 border border-ink-500 rounded-3xl p-4"
                >
                  <View className="flex-row items-start mb-3">
                    <View className="flex-1">
                      <Text className="text-white font-black text-base">
                        {def.name}
                      </Text>
                      <View className="flex-row gap-2 mt-2">
                        <MuscleTag muscle={def.muscle} />
                        <View className="bg-ink-500 rounded-full px-2 py-0.5">
                          <Text className="text-ink-100 text-[10px] font-bold uppercase tracking-wider">
                            {def.equipment}
                          </Text>
                        </View>
                        <Text className="text-ink-200 text-[10px] uppercase font-bold tracking-wider self-center ml-1">
                          Target: {targetSets}×{targetReps}
                        </Text>
                      </View>
                      {pr ? (
                        <Text className="text-gold text-[11px] font-bold mt-1.5 uppercase tracking-wider">
                          PR: {unit === "lb" ? Math.round(pr.weightKg * 2.20462) : Math.round(pr.weightKg)}
                          {unit} × {pr.reps}
                        </Text>
                      ) : null}
                    </View>
                  </View>

                  <View className="flex-row px-2 mb-1">
                    <Text className="w-7 text-ink-200 text-[10px] uppercase font-bold tracking-widest text-center">
                      Set
                    </Text>
                    <Text className="flex-1 text-ink-200 text-[10px] uppercase font-bold tracking-widest text-center">
                      Weight
                    </Text>
                    <Text className="flex-1 text-ink-200 text-[10px] uppercase font-bold tracking-widest text-center">
                      Reps
                    </Text>
                    <View style={{ width: 60 }} />
                  </View>

                  <View className="gap-2">
                    {ex.sets.map((s, i) => (
                      <SetEntryRow
                        key={s.id}
                        index={i}
                        unit={unit}
                        weight={
                          unit === "lb"
                            ? Math.round(s.weight * 2.20462 * 100) / 100
                            : Math.round(s.weight * 100) / 100
                        }
                        reps={s.reps}
                        isPR={s.isPR}
                        isWarmup={s.isWarmup}
                        isLogged
                        onToggleWarmup={() =>
                          toggleWarmup(ex.exerciseId, s.id)
                        }
                        onRemove={() => removeSet(ex.exerciseId, s.id)}
                        onLog={() => {}}
                      />
                    ))}
                    {remaining > 0 ? (
                      <SetEntryRow
                        index={ex.sets.length}
                        unit={unit}
                        defaultWeight={
                          lastTopSet
                            ? unit === "lb"
                              ? Math.round(lastTopSet.weight * 2.20462)
                              : Math.round(lastTopSet.weight)
                            : undefined
                        }
                        defaultReps={lastTopSet?.reps}
                        onLog={(w, r, warm) =>
                          handleLog(ex.exerciseId, w, r, warm, restSec)
                        }
                      />
                    ) : null}
                  </View>

                  <View className="flex-row gap-2 mt-3">
                    <Pressable
                      onPress={() => {
                        if (activeRoutine) {
                          updateRoutine(activeRoutine.id, {
                            exercises: activeRoutine.exercises.map((re) =>
                              re.exerciseId === ex.exerciseId
                                ? { ...re, targetSets: re.targetSets + 1 }
                                : re
                            ),
                          });
                        }
                      }}
                      className="flex-1 border border-ink-400 rounded-xl py-2 items-center"
                    >
                      <Text className="text-ink-100 font-bold text-xs uppercase tracking-widest">
                        + Add set
                      </Text>
                    </Pressable>
                    <Pressable
                      onPress={() => startRest(restSec)}
                      className="flex-1 border border-ink-400 rounded-xl py-2 items-center"
                    >
                      <Text className="text-ink-100 font-bold text-xs uppercase tracking-widest">
                        Start rest {restSec}s
                      </Text>
                    </Pressable>
                  </View>
                </View>
              );
            })}
          </View>

          <Pressable
            onPress={() =>
              router.push({
                pathname: "/routine/pick-exercise",
                params: { mode: "active" },
              })
            }
            className="border-2 border-dashed border-ink-400 rounded-2xl py-5 items-center mt-4"
          >
            <Text className="text-ink-100 font-black uppercase tracking-widest">
              + Add exercise
            </Text>
          </Pressable>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}
