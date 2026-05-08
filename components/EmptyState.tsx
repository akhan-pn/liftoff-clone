import { View, Text, Pressable } from "react-native";
import type { ReactNode } from "react";

export function EmptyState({
  icon,
  title,
  body,
  cta,
  onPress,
}: {
  icon: string;
  title: string;
  body: string;
  cta?: string;
  onPress?: () => void;
}) {
  return (
    <View className="items-center justify-center py-12 px-6">
      <Text className="text-6xl mb-4">{icon}</Text>
      <Text className="text-white text-xl font-black mb-2">{title}</Text>
      <Text className="text-ink-200 text-center text-base">{body}</Text>
      {cta && onPress ? (
        <Pressable
          onPress={onPress}
          className="bg-accent mt-6 px-6 py-3 rounded-xl"
        >
          <Text className="text-white font-bold uppercase tracking-wider">
            {cta}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}
