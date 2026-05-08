import { View, Text } from "react-native";

export function StatBadge({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <View
      className={`flex-1 rounded-2xl p-4 border ${
        accent ? "bg-accent/15 border-accent/40" : "bg-ink-700 border-ink-500"
      }`}
    >
      <Text className="text-ink-200 text-[10px] uppercase tracking-widest font-bold">
        {label}
      </Text>
      <Text
        className={`mt-2 font-black text-2xl ${
          accent ? "text-accent" : "text-white"
        }`}
      >
        {value}
      </Text>
    </View>
  );
}
