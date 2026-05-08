import { Pressable, View } from "react-native";
import type { ReactNode } from "react";
import * as Haptics from "expo-haptics";

export function PressableCard({
  children,
  onPress,
  className = "",
}: {
  children: ReactNode;
  onPress: () => void;
  className?: string;
}) {
  return (
    <Pressable
      onPress={() => {
        Haptics.selectionAsync();
        onPress();
      }}
      style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
    >
      <View
        className={`bg-ink-700 border border-ink-500 rounded-3xl p-5 ${className}`}
      >
        {children}
      </View>
    </Pressable>
  );
}
