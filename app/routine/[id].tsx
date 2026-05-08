import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  Alert,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useStore } from "@/lib/store";
import { EXERCISE_BY_ID } from "@/lib/exercises";
import { LinearGradient } from "expo-linear-gradient";
import { MuscleTag } from "@/components/MuscleTag";
import { Card } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import * as Haptics from "expo-haptics";

export default function RoutineDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const routine = useStore((s) => s.routines.find((r) => r.id === id));
  const update = useStore((s) => s.updateRoutine);
  const startWorkout = useStore((s) => s.startWorkout);
  const removeExercise = useStore((s) => s.removeExerciseFromRoutine);
  const reorder = useStore((s) => s.reorderRoutineExercise);
  const deleteRoutine = useStore((s) => s.deleteRoutine);

  if (!routine) {
    return (
      <View style={{ flex: 1, backgroundColor: "#06070D", paddingTop: 80 }}>
        <EmptyState
          icon="🤔"
          title="Routine not found"
          body="It may have been deleted."
          cta="Back"
          onPress={() => router.back()}
        />
      </View>
    );
  }

  function setSets(exerciseId: string, sets: number) {
    update(routine!.id, {
      exercises: routine!.exercises.map((e) =>
        e.exerciseId === exerciseId
          ? { ...e, targetSets: Math.max(1, sets) }
          : e
      ),
    });
  }

  function setReps(exerciseId: string, reps: string) {
    update(routine!.id, {
      exercises: routine!.exercises.map((e) =>
        e.exerciseId === exerciseId ? { ...e, targetReps: reps } : e
      ),
    });
  }

  function setRest(exerciseId: string, rest: number) {
    update(routine!.id, {
      exercises: routine!.exercises.map((e) =>
        e.exerciseId === exerciseId ? { ...e, restSeconds: rest } : e
      ),
    });
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#06070D" }}>
      <LinearGradient
        colors={["#1B1E2C", "#06070D"]}
        style={{ paddingTop: 56, paddingHorizontal: 20, paddingBottom: 24 }}
      >
        <View className="flex-row justify-between items-start">
          <View className="flex-1">
            <View className="flex-row items-center gap-3">
              <Text className="text-4xl">{routine.emoji ?? "🔥"}</Text>
              <TextInput
                value={routine.name}
                onChangeText={(t) => update(routine.id, { name: t })}
                className="text-white text-3xl font-black flex-1"
              />
            </View>
            <TextInput
              value={routine.description ?? ""}
              onChangeText={(t) => update(routine.id, { description: t })}
              placeholder="Add description..."
              placeholderTextColor="#5C6178"
              className="text-ink-100 mt-2"
            />
          </View>
          <Pressable onPress={() => router.back()}>
            <Text className="text-ink-100 text-base">Done</Text>
          </Pressable>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 140 }}>
        {routine.exercises.length === 0 ? (
          <EmptyState
            icon="➕"
            title="No exercises yet"
            body="Add exercises from the library."
            cta="Add exercise"
            onPress={() =>
              router.push({
                pathname: "/routine/pick-exercise",
                params: { routineId: routine.id },
              })
            }
          />
        ) : (
          <View className="gap-3">
            {routine.exercises.map((re, i) => {
              const ex = EXERCISE_BY_ID[re.exerciseId];
              if (!ex) return null;
              return (
                <Card key={re.exerciseId + i}>
                  <View className="flex-row items-start">
                    <Text className="text-ink-100 text-xl font-black mr-3">
                      {i + 1}
                    </Text>
                    <View className="flex-1">
                      <Text className="text-white font-black text-base">
                        {ex.name}
                      </Text>
                      <View className="flex-row gap-2 mt-1">
                        <MuscleTag muscle={ex.muscle} />
                        <View className="bg-ink-500 rounded-full px-2 py-0.5">
                          <Text className="text-ink-100 text-[10px] font-bold uppercase tracking-wider">
                            {ex.equipment}
                          </Text>
                        </View>
                      </View>
                    </View>
                    <Pressable
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        removeExercise(routine.id, re.exerciseId);
                      }}
                      hitSlop={12}
                    >
                      <Text className="text-ink-200 text-lg">✕</Text>
                    </Pressable>
                  </View>

                  <View className="flex-row gap-2 mt-4">
                    <Field label="Sets">
                      <View className="flex-row items-center gap-2">
                        <Pressable
                          onPress={() => setSets(re.exerciseId, re.targetSets - 1)}
                          className="w-7 h-7 rounded-full bg-ink-500 items-center justify-center"
                        >
                          <Text className="text-white">-</Text>
                        </Pressable>
                        <Text className="text-white font-black text-lg w-6 text-center">
                          {re.targetSets}
                        </Text>
                        <Pressable
                          onPress={() => setSets(re.exerciseId, re.targetSets + 1)}
                          className="w-7 h-7 rounded-full bg-ink-500 items-center justify-center"
                        >
                          <Text className="text-white">+</Text>
                        </Pressable>
                      </View>
                    </Field>
                    <Field label="Reps">
                      <TextInput
                        value={re.targetReps}
                        onChangeText={(t) => setReps(re.exerciseId, t)}
                        className="text-white font-black text-lg"
                      />
                    </Field>
                    <Field label="Rest">
                      <View className="flex-row items-center gap-2">
                        <Pressable
                          onPress={() =>
                            setRest(
                              re.exerciseId,
                              Math.max(0, re.restSeconds - 15)
                            )
                          }
                          className="w-7 h-7 rounded-full bg-ink-500 items-center justify-center"
                        >
                          <Text className="text-white">-</Text>
                        </Pressable>
                        <Text className="text-white font-black text-lg">
                          {re.restSeconds}s
                        </Text>
                        <Pressable
                          onPress={() =>
                            setRest(re.exerciseId, re.restSeconds + 15)
                          }
                          className="w-7 h-7 rounded-full bg-ink-500 items-center justify-center"
                        >
                          <Text className="text-white">+</Text>
                        </Pressable>
                      </View>
                    </Field>
                  </View>
                </Card>
              );
            })}
          </View>
        )}

        <Pressable
          onPress={() =>
            router.push({
              pathname: "/routine/pick-exercise",
              params: { routineId: routine.id },
            })
          }
          className="border-2 border-dashed border-ink-400 rounded-2xl py-5 items-center mt-3"
        >
          <Text className="text-ink-100 font-black uppercase tracking-widest">
            + Add exercise
          </Text>
        </Pressable>

        <View className="flex-row gap-2 mt-6">
          <Pressable
            onPress={() => {
              startWorkout(routine.id);
              router.replace("/workout/active");
            }}
            disabled={routine.exercises.length === 0}
            className={`flex-1 py-4 rounded-2xl items-center ${
              routine.exercises.length === 0 ? "bg-ink-500" : "bg-accent"
            }`}
          >
            <Text className="text-white font-black uppercase tracking-widest">
              Start workout
            </Text>
          </Pressable>
          <Pressable
            onPress={() => {
              Alert.alert("Delete routine?", "This cannot be undone.", [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Delete",
                  style: "destructive",
                  onPress: () => {
                    deleteRoutine(routine.id);
                    router.back();
                  },
                },
              ]);
            }}
            className="px-5 py-4 rounded-2xl bg-danger/20 border border-danger/40"
          >
            <Text className="text-danger font-bold uppercase">Delete</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View className="flex-1 bg-ink-600 rounded-xl p-3">
      <Text className="text-ink-200 text-[10px] uppercase font-bold tracking-widest mb-1">
        {label}
      </Text>
      {children}
    </View>
  );
}
