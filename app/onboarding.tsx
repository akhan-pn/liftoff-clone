import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useStore } from "@/lib/store";
import * as Haptics from "expo-haptics";

const STEPS = ["welcome", "name", "unit", "weight"] as const;

export default function Onboarding() {
  const [step, setStep] = useState<(typeof STEPS)[number]>("welcome");
  const [name, setName] = useState("");
  const [unit, setUnit] = useState<"kg" | "lb">("kg");
  const [bw, setBw] = useState("80");

  const setUsername = useStore((s) => s.setUsername);
  const setUnitFn = useStore((s) => s.setUnit);
  const setBodyweight = useStore((s) => s.setBodyweight);
  const finishOnboarding = useStore((s) => s.finishOnboarding);

  function next() {
    Haptics.selectionAsync();
    const idx = STEPS.indexOf(step);
    if (idx === STEPS.length - 1) {
      setUsername(name);
      setUnitFn(unit);
      setBodyweight(parseFloat(bw) || 80);
      finishOnboarding();
      router.replace("/(tabs)");
      return;
    }
    setStep(STEPS[idx + 1]);
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <LinearGradient
        colors={["#0C0E16", "#06070D"]}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, padding: 24, paddingTop: 64 }}
        >
          <View className="flex-row gap-2 mb-12">
            {STEPS.map((s, i) => (
              <View
                key={s}
                className={`flex-1 h-1 rounded-full ${
                  i <= STEPS.indexOf(step) ? "bg-accent" : "bg-ink-500"
                }`}
              />
            ))}
          </View>

          {step === "welcome" && (
            <View className="gap-6 mt-12">
              <Text className="text-7xl font-black text-white tracking-tight">
                LIFTOFF
              </Text>
              <Text className="text-ink-100 text-lg leading-relaxed">
                Log every set. Crush every PR. Climb the ranks.
              </Text>
              <View className="mt-8 gap-3">
                <Stat label="500+ exercises" />
                <Stat label="Auto rest timer" />
                <Stat label="PR detection & celebration" />
                <Stat label="Strength charts per muscle" />
                <Stat label="Weekly volume leaderboard" />
              </View>
            </View>
          )}

          {step === "name" && (
            <View className="gap-6 mt-12">
              <Text className="text-4xl font-black text-white">
                What should we call you?
              </Text>
              <Text className="text-ink-200 text-base">
                Show up on the leaderboard.
              </Text>
              <TextInput
                value={name}
                onChangeText={setName}
                autoFocus
                placeholder="Username"
                placeholderTextColor="#5C6178"
                className="text-white text-2xl font-bold border-b border-ink-400 pb-3 mt-6"
              />
            </View>
          )}

          {step === "unit" && (
            <View className="gap-6 mt-12">
              <Text className="text-4xl font-black text-white">
                Pick your weight unit.
              </Text>
              <View className="flex-row gap-3 mt-6">
                {(["kg", "lb"] as const).map((u) => (
                  <Pressable
                    key={u}
                    onPress={() => {
                      Haptics.selectionAsync();
                      setUnit(u);
                    }}
                    className={`flex-1 p-6 rounded-2xl border ${
                      unit === u
                        ? "border-accent bg-accent/15"
                        : "border-ink-400 bg-ink-700"
                    }`}
                  >
                    <Text className="text-white text-3xl font-black uppercase">
                      {u}
                    </Text>
                    <Text className="text-ink-200 mt-1">
                      {u === "kg" ? "Kilograms" : "Pounds"}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          )}

          {step === "weight" && (
            <View className="gap-6 mt-12">
              <Text className="text-4xl font-black text-white">
                Bodyweight?
              </Text>
              <Text className="text-ink-200 text-base">
                Used for bodyweight movements like pull-ups.
              </Text>
              <View className="flex-row items-end gap-3 mt-6">
                <TextInput
                  value={bw}
                  onChangeText={setBw}
                  keyboardType="decimal-pad"
                  className="text-white text-6xl font-black border-b border-ink-400 pb-2"
                  style={{ minWidth: 140 }}
                />
                <Text className="text-ink-200 text-2xl font-bold pb-3 uppercase">
                  {unit}
                </Text>
              </View>
            </View>
          )}
        </ScrollView>

        <Pressable
          onPress={next}
          className="bg-accent mx-6 mb-10 py-5 rounded-2xl items-center"
          style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
        >
          <Text className="text-white font-black text-lg uppercase tracking-wider">
            {step === "weight" ? "Let's lift" : "Continue"}
          </Text>
        </Pressable>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

function Stat({ label }: { label: string }) {
  return (
    <View className="flex-row items-center gap-3">
      <View className="w-2 h-2 rounded-full bg-accent" />
      <Text className="text-white text-base">{label}</Text>
    </View>
  );
}
