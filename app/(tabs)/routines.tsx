import { View, Text, ScrollView, Pressable, Alert } from "react-native";
import { router } from "expo-router";
import { useStore } from "@/lib/store";
import { Card } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import { PressableCard } from "@/components/PressableCard";
import { EXERCISE_BY_ID } from "@/lib/exercises";
import { MuscleTag } from "@/components/MuscleTag";

export default function RoutinesTab() {
  const routines = useStore((s) => s.routines);
  const startWorkout = useStore((s) => s.startWorkout);
  const deleteRoutine = useStore((s) => s.deleteRoutine);

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 120, paddingTop: 64 }}>
      <View className="px-5 flex-row justify-between items-end">
        <View>
          <Text className="text-white text-4xl font-black">Routines</Text>
          <Text className="text-ink-200 mt-1">
            {routines.length} routine{routines.length === 1 ? "" : "s"}
          </Text>
        </View>
        <Pressable
          onPress={() => router.push("/routine/new")}
          className="bg-accent px-4 py-2.5 rounded-full"
        >
          <Text className="text-white font-bold">+ New</Text>
        </Pressable>
      </View>

      <View className="px-5 mt-6 gap-3">
        {routines.length === 0 ? (
          <EmptyState
            icon="📋"
            title="No routines"
            body="Build your first routine — push, pull, legs, or whatever your split is."
            cta="Create Routine"
            onPress={() => router.push("/routine/new")}
          />
        ) : (
          routines.map((r) => {
            const muscleSet = new Set(
              r.exercises
                .map((e) => EXERCISE_BY_ID[e.exerciseId]?.muscle)
                .filter(Boolean) as string[]
            );
            const muscles = Array.from(muscleSet).slice(0, 4);
            return (
              <View key={r.id}>
                <PressableCard
                  onPress={() => router.push(`/routine/${r.id}`)}
                >
                  <View className="flex-row items-center gap-3">
                    <Text className="text-3xl">{r.emoji ?? "🔥"}</Text>
                    <View className="flex-1">
                      <Text className="text-white font-black text-lg">
                        {r.name}
                      </Text>
                      <Text className="text-ink-200 text-sm">
                        {r.exercises.length} exercises
                      </Text>
                    </View>
                  </View>
                  {muscles.length > 0 && (
                    <View className="flex-row flex-wrap gap-2 mt-3">
                      {muscles.map((m) => (
                        <MuscleTag key={m} muscle={m as any} />
                      ))}
                    </View>
                  )}
                  <View className="flex-row gap-2 mt-4">
                    <Pressable
                      onPress={() => {
                        startWorkout(r.id);
                        router.push("/workout/active");
                      }}
                      className="flex-1 bg-accent rounded-xl py-3 items-center"
                    >
                      <Text className="text-white font-black uppercase tracking-wider">
                        Start
                      </Text>
                    </Pressable>
                    <Pressable
                      onPress={() => router.push(`/routine/${r.id}`)}
                      className="flex-1 border border-ink-400 rounded-xl py-3 items-center"
                    >
                      <Text className="text-white font-bold uppercase tracking-wider">
                        Edit
                      </Text>
                    </Pressable>
                  </View>
                </PressableCard>
              </View>
            );
          })
        )}
      </View>
    </ScrollView>
  );
}
