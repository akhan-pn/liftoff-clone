import { useState, useEffect } from "react";
import { View, Text, TextInput, Pressable } from "react-native";
import * as Haptics from "expo-haptics";

export function SetEntryRow({
  index,
  defaultWeight,
  defaultReps,
  unit,
  onLog,
  onRemove,
  isWarmup,
  onToggleWarmup,
  weight,
  reps,
  isPR,
  isLogged,
}: {
  index: number;
  defaultWeight?: number;
  defaultReps?: number;
  unit: "kg" | "lb";
  onLog: (weight: number, reps: number, isWarmup: boolean) => void;
  onRemove?: () => void;
  isWarmup?: boolean;
  onToggleWarmup?: () => void;
  weight?: number;
  reps?: number;
  isPR?: boolean;
  isLogged?: boolean;
}) {
  const [w, setW] = useState(
    weight !== undefined ? String(weight) : defaultWeight ? String(defaultWeight) : ""
  );
  const [r, setR] = useState(
    reps !== undefined ? String(reps) : defaultReps ? String(defaultReps) : ""
  );

  useEffect(() => {
    if (weight !== undefined) setW(String(weight));
    if (reps !== undefined) setR(String(reps));
  }, [weight, reps]);

  const wDisplay =
    unit === "lb" && weight !== undefined ? Math.round(weight * 2.20462) : weight;

  function commit() {
    const wn = parseFloat(w);
    const rn = parseInt(r, 10);
    if (isNaN(wn) || isNaN(rn) || wn <= 0 || rn <= 0) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // store always in kg
    const kg = unit === "lb" ? wn / 2.20462 : wn;
    onLog(kg, rn, !!isWarmup);
  }

  return (
    <View
      className={`flex-row items-center rounded-xl px-3 py-2.5 gap-2 ${
        isLogged
          ? isPR
            ? "bg-gold/15 border border-gold/40"
            : "bg-success/10 border border-success/30"
          : "bg-ink-600 border border-ink-500"
      }`}
    >
      <Pressable onPress={onToggleWarmup} hitSlop={8}>
        <Text
          className={`w-7 text-center font-black text-base ${
            isWarmup ? "text-gold" : isLogged ? "text-success" : "text-ink-100"
          }`}
        >
          {isWarmup ? "W" : index + 1}
        </Text>
      </Pressable>
      <TextInput
        editable={!isLogged}
        value={w}
        onChangeText={setW}
        keyboardType="decimal-pad"
        placeholder="0"
        placeholderTextColor="#5C6178"
        className={`flex-1 text-center text-lg font-black ${
          isLogged ? "text-ink-100" : "text-white"
        }`}
      />
      <Text className="text-ink-200 text-xs uppercase tracking-widest">{unit}</Text>
      <TextInput
        editable={!isLogged}
        value={r}
        onChangeText={setR}
        keyboardType="number-pad"
        placeholder="0"
        placeholderTextColor="#5C6178"
        className={`flex-1 text-center text-lg font-black ${
          isLogged ? "text-ink-100" : "text-white"
        }`}
      />
      <Text className="text-ink-200 text-xs uppercase tracking-widest">reps</Text>
      {isLogged ? (
        onRemove ? (
          <Pressable onPress={onRemove} hitSlop={8}>
            <Text className="text-ink-200 text-base">✕</Text>
          </Pressable>
        ) : null
      ) : (
        <Pressable
          onPress={commit}
          className="bg-accent px-3 py-1.5 rounded-lg"
          style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
        >
          <Text className="text-white font-black text-xs uppercase tracking-widest">
            Log
          </Text>
        </Pressable>
      )}
      {isPR ? (
        <View className="bg-gold rounded-full w-6 h-6 items-center justify-center">
          <Text className="text-ink-900 font-black text-[11px]">PR</Text>
        </View>
      ) : null}
    </View>
  );
}
