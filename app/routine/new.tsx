import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
} from "react-native";
import { router } from "expo-router";
import { useStore } from "@/lib/store";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";

const EMOJIS = ["🔥", "💪", "🪝", "🦵", "⚡", "🏋️", "💀", "🥊", "🌪", "🚀"];

export default function NewRoutine() {
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("🔥");
  const [description, setDescription] = useState("");
  const createRoutine = useStore((s) => s.createRoutine);
  const updateRoutine = useStore((s) => s.updateRoutine);

  function create() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const id = createRoutine(name || "Untitled Routine", emoji);
    updateRoutine(id, { description: description || undefined });
    router.replace({ pathname: "/routine/[id]", params: { id } });
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#06070D" }}>
      <LinearGradient
        colors={["#1B1E2C", "#06070D"]}
        style={{ paddingTop: 56, paddingHorizontal: 20, paddingBottom: 24 }}
      >
        <View className="flex-row justify-between items-center mb-2">
          <Text className="text-white text-3xl font-black">New routine</Text>
          <Pressable onPress={() => router.back()}>
            <Text className="text-ink-100 text-base">Cancel</Text>
          </Pressable>
        </View>
        <Text className="text-ink-200">
          Build a reusable plan you can launch in one tap.
        </Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text className="text-ink-200 text-xs font-bold uppercase tracking-widest mb-2">
          Name
        </Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Push Day"
          placeholderTextColor="#5C6178"
          className="text-white text-2xl font-black bg-ink-700 border border-ink-500 rounded-2xl px-4 py-4"
        />

        <Text className="text-ink-200 text-xs font-bold uppercase tracking-widest mb-2 mt-6">
          Description
        </Text>
        <TextInput
          value={description}
          onChangeText={setDescription}
          placeholder="Chest / Shoulders / Triceps"
          placeholderTextColor="#5C6178"
          className="text-white bg-ink-700 border border-ink-500 rounded-2xl px-4 py-3"
        />

        <Text className="text-ink-200 text-xs font-bold uppercase tracking-widest mb-2 mt-6">
          Icon
        </Text>
        <View className="flex-row flex-wrap gap-2">
          {EMOJIS.map((e) => (
            <Pressable
              key={e}
              onPress={() => setEmoji(e)}
              className={`w-12 h-12 rounded-2xl items-center justify-center border ${
                emoji === e
                  ? "bg-accent/20 border-accent"
                  : "bg-ink-700 border-ink-500"
              }`}
            >
              <Text style={{ fontSize: 22 }}>{e}</Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>

      <Pressable
        onPress={create}
        className="bg-accent mx-5 mb-10 py-5 rounded-2xl items-center"
        style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
      >
        <Text className="text-white font-black text-base uppercase tracking-widest">
          Create & add exercises
        </Text>
      </Pressable>
    </View>
  );
}
