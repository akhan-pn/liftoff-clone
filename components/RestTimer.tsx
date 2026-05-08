import { useEffect, useRef, useState } from "react";
import { View, Text, Pressable, Platform } from "react-native";
import * as Haptics from "expo-haptics";
import { useStore } from "@/lib/store";

export function RestTimer() {
  const restEndsAt = useStore((s) => s.activeSession?.restEndsAt);
  const restDuration = useStore((s) => s.activeSession?.restDurationSec);
  const cancel = useStore((s) => s.cancelRest);
  const [now, setNow] = useState(Date.now());
  const playedRef = useRef(false);

  useEffect(() => {
    if (!restEndsAt) {
      playedRef.current = false;
      return;
    }
    const id = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(id);
  }, [restEndsAt]);

  if (!restEndsAt || !restDuration) return null;

  const remainingMs = Math.max(0, restEndsAt - now);
  const remaining = Math.ceil(remainingMs / 1000);
  const progress = 1 - remainingMs / (restDuration * 1000);

  if (remaining <= 0 && !playedRef.current) {
    playedRef.current = true;
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }

  return (
    <View className="bg-ink-700 border border-ink-500 rounded-2xl px-4 py-3">
      <View className="flex-row justify-between items-center">
        <Text className="text-ink-200 text-[10px] uppercase font-bold tracking-widest">
          Rest
        </Text>
        <Pressable onPress={cancel} hitSlop={12}>
          <Text className="text-ink-100 text-xs">Skip</Text>
        </Pressable>
      </View>
      <View className="flex-row items-baseline gap-1 mt-1">
        <Text
          className={`text-4xl font-black ${
            remaining <= 5 && remaining > 0 ? "text-accent" : "text-white"
          }`}
        >
          {Math.floor(remaining / 60)}:
          {(remaining % 60).toString().padStart(2, "0")}
        </Text>
        <Text className="text-ink-200">/ {restDuration}s</Text>
      </View>
      <View className="h-1.5 bg-ink-500 rounded-full mt-2 overflow-hidden">
        <View
          className="h-full bg-accent"
          style={{ width: `${Math.min(100, Math.max(0, progress * 100))}%` }}
        />
      </View>
    </View>
  );
}
