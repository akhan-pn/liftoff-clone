import { useEffect, useRef } from "react";
import { View, Text, Animated, Easing, Pressable } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useStore } from "@/lib/store";
import * as Haptics from "expo-haptics";

export function PRCelebration() {
  const pending = useStore((s) => s.activeSession?.pendingCelebrations ?? []);
  const drain = useStore((s) => s.drainCelebration);
  const unit = useStore((s) => s.unit);
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.85)).current;
  const top = pending[0];

  useEffect(() => {
    if (!top) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
        bounciness: 18,
        speed: 12,
      }),
    ]).start();

    const t = setTimeout(() => {
      Animated.timing(opacity, {
        toValue: 0,
        duration: 240,
        useNativeDriver: true,
      }).start(() => {
        scale.setValue(0.85);
        drain();
      });
    }, 1900);
    return () => clearTimeout(t);
  }, [top]);

  if (!top) return null;
  const w = unit === "lb" ? Math.round(top.weight * 2.20462) : top.weight;

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: "absolute",
        top: 80,
        left: 20,
        right: 20,
        opacity,
        transform: [{ scale }],
        zIndex: 50,
      }}
    >
      <LinearGradient
        colors={["#F5C04A", "#FF9F1C"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          padding: 16,
          borderRadius: 18,
          flexDirection: "row",
          alignItems: "center",
          gap: 12,
          shadowColor: "#F5C04A",
          shadowOpacity: 0.4,
          shadowRadius: 20,
          shadowOffset: { width: 0, height: 6 },
        }}
      >
        <Text style={{ fontSize: 36 }}>🏆</Text>
        <View style={{ flex: 1 }}>
          <Text className="font-black text-ink-900 text-sm uppercase tracking-widest">
            New PR!
          </Text>
          <Text className="text-ink-900 font-black text-base" numberOfLines={1}>
            {top.exerciseName}
          </Text>
          <Text className="text-ink-900 font-bold">
            {w} {unit} × {top.reps}
          </Text>
        </View>
      </LinearGradient>
    </Animated.View>
  );
}
