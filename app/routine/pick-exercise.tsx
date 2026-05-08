import { useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  FlatList,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { EXERCISES, MUSCLE_GROUPS, EQUIPMENT } from "@/lib/exercises";
import { MuscleTag } from "@/components/MuscleTag";
import { useStore } from "@/lib/store";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";

export default function PickExercise() {
  const params = useLocalSearchParams<{ routineId?: string; mode?: string }>();
  const [q, setQ] = useState("");
  const [muscle, setMuscle] = useState<string>("All");
  const [equipment, setEquipment] = useState<string>("All");
  const addToRoutine = useStore((s) => s.addExerciseToRoutine);
  const addToActive = useStore((s) => s.addExerciseToActive);

  const filtered = useMemo(() => {
    const ql = q.trim().toLowerCase();
    return EXERCISES.filter((e) => {
      if (muscle !== "All" && e.muscle !== muscle) return false;
      if (equipment !== "All" && e.equipment !== equipment) return false;
      if (ql && !e.name.toLowerCase().includes(ql)) return false;
      return true;
    });
  }, [q, muscle, equipment]);

  function pick(id: string, name: string) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (params.mode === "active") {
      addToActive(id);
    } else if (params.routineId) {
      addToRoutine(params.routineId, {
        exerciseId: id,
        targetSets: 3,
        targetReps: "8-10",
        restSeconds: 90,
      });
    }
    router.back();
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#06070D" }}>
      <LinearGradient
        colors={["#1B1E2C", "#06070D"]}
        style={{ paddingTop: 56, paddingHorizontal: 20, paddingBottom: 12 }}
      >
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-white text-2xl font-black">
            Pick exercise
          </Text>
          <Pressable onPress={() => router.back()}>
            <Text className="text-ink-100 text-base">Close</Text>
          </Pressable>
        </View>
        <View className="bg-ink-700 border border-ink-500 rounded-2xl px-4 py-3 flex-row items-center gap-2">
          <Text className="text-ink-200">⌕</Text>
          <TextInput
            value={q}
            onChangeText={setQ}
            placeholder={`Search ${EXERCISES.length}+ exercises...`}
            placeholderTextColor="#5C6178"
            className="text-white flex-1 text-base"
            autoFocus
          />
        </View>
      </LinearGradient>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingVertical: 12,
          gap: 8,
        }}
      >
        {(["All", ...MUSCLE_GROUPS] as const).map((m) => (
          <Pressable
            key={m}
            onPress={() => setMuscle(m as any)}
            className={`px-3 py-1.5 rounded-full border ${
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
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: 12,
          gap: 8,
        }}
      >
        {(["All", ...EQUIPMENT] as const).map((eq) => (
          <Pressable
            key={eq}
            onPress={() => setEquipment(eq as any)}
            className={`px-3 py-1.5 rounded-full border ${
              equipment === eq
                ? "bg-ink-100 border-ink-100"
                : "bg-ink-700 border-ink-500"
            }`}
          >
            <Text
              className={`text-[11px] font-bold uppercase tracking-wider ${
                equipment === eq ? "text-ink-900" : "text-ink-100"
              }`}
            >
              {eq}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 80 }}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        renderItem={({ item }) => (
          <Pressable onPress={() => pick(item.id, item.name)}>
            <View className="bg-ink-700 border border-ink-500 rounded-2xl p-4 flex-row items-center">
              <View className="flex-1">
                <Text className="text-white font-bold text-base">
                  {item.name}
                </Text>
                <View className="flex-row gap-2 mt-2">
                  <MuscleTag muscle={item.muscle} />
                  <View className="bg-ink-500 rounded-full px-2.5 py-0.5">
                    <Text className="text-ink-100 text-[10px] font-bold uppercase tracking-wider">
                      {item.equipment}
                    </Text>
                  </View>
                </View>
              </View>
              <Text className="text-accent text-2xl">+</Text>
            </View>
          </Pressable>
        )}
        ListEmptyComponent={
          <View className="items-center py-12">
            <Text className="text-ink-200">No exercises match your filters.</Text>
          </View>
        }
      />
    </View>
  );
}
