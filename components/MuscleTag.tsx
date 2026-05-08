import { View, Text } from "react-native";
import { muscleColors } from "@/lib/colors";
import type { MuscleGroup } from "@/lib/types";

export function MuscleTag({ muscle }: { muscle: MuscleGroup }) {
  const color = muscleColors[muscle];
  return (
    <View
      className="rounded-full px-3 py-1"
      style={{ backgroundColor: color + "22", borderWidth: 1, borderColor: color + "55" }}
    >
      <Text className="text-[11px] font-bold uppercase tracking-wider" style={{ color }}>
        {muscle}
      </Text>
    </View>
  );
}
