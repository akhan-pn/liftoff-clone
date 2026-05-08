import {
  View,
  Text,
  ScrollView,
  Pressable,
  Alert,
  TextInput,
} from "react-native";
import { useStore } from "@/lib/store";
import { Card } from "@/components/Card";
import { useState } from "react";
import {
  monthlyVolume,
  weeklyVolume,
  currentStreak,
} from "@/lib/volume";
import { rankFromVolume } from "@/lib/colors";

export default function Profile() {
  const username = useStore((s) => s.username);
  const setUsername = useStore((s) => s.setUsername);
  const unit = useStore((s) => s.unit);
  const setUnit = useStore((s) => s.setUnit);
  const bw = useStore((s) => s.bodyweightKg);
  const setBw = useStore((s) => s.setBodyweight);
  const sessions = useStore((s) => s.sessions);
  const prs = useStore((s) => s.prs);
  const reset = useStore((s) => s.resetAll);

  const [editingName, setEditingName] = useState(false);
  const [draft, setDraft] = useState(username);
  const [bwDraft, setBwDraft] = useState(String(bw));

  const moVol = monthlyVolume(sessions);
  const wkVol = weeklyVolume(sessions);
  const streak = currentStreak(sessions);
  const rank = rankFromVolume(moVol);

  const totalVolume = sessions.reduce((a, s) => a + s.totalVolumeKg, 0);
  const totalSets = sessions.reduce(
    (a, s) => a + s.exercises.reduce((x, e) => x + e.sets.length, 0),
    0
  );
  const prCount = Object.keys(prs).length;
  const totalDuration = sessions.reduce((a, s) => a + s.durationSec, 0);

  return (
    <ScrollView contentContainerStyle={{ paddingTop: 64, paddingBottom: 140 }}>
      <View className="px-5 items-center">
        <View
          className="w-24 h-24 rounded-full items-center justify-center"
          style={{ backgroundColor: rank.color + "33" }}
        >
          <Text
            className="font-black text-3xl"
            style={{ color: rank.color }}
          >
            {(username || "L").substring(0, 2).toUpperCase()}
          </Text>
        </View>
        {editingName ? (
          <TextInput
            value={draft}
            onChangeText={setDraft}
            autoFocus
            onBlur={() => {
              setUsername(draft);
              setEditingName(false);
            }}
            className="text-white text-2xl font-black mt-3 border-b border-ink-400 px-3"
          />
        ) : (
          <Pressable onPress={() => setEditingName(true)}>
            <Text className="text-white text-3xl font-black mt-3">
              {username}
            </Text>
            <Text className="text-ink-200 text-xs text-center mt-0.5">
              tap to edit
            </Text>
          </Pressable>
        )}
        <View
          className="rounded-full px-3 py-1.5 mt-3 flex-row items-center gap-2"
          style={{
            backgroundColor: rank.color + "22",
            borderWidth: 1,
            borderColor: rank.color + "55",
          }}
        >
          <Text style={{ color: rank.color, fontSize: 14 }}>★</Text>
          <Text
            className="font-black uppercase tracking-widest text-xs"
            style={{ color: rank.color }}
          >
            {rank.name}
          </Text>
        </View>
      </View>

      <View className="px-5 mt-8">
        <Text className="text-ink-200 text-xs font-bold uppercase tracking-widest mb-3">
          Lifetime
        </Text>
        <View className="flex-row gap-3 flex-wrap">
          <StatBox label="Sessions" value={String(sessions.length)} />
          <StatBox
            label="Volume"
            value={
              unit === "lb"
                ? `${Math.round((totalVolume * 2.20462) / 1000)}k`
                : `${Math.round(totalVolume / 1000)}k`
            }
            sub={unit}
          />
          <StatBox label="Sets" value={String(totalSets)} />
          <StatBox label="PRs" value={String(prCount)} />
          <StatBox label="Hours" value={String(Math.round(totalDuration / 3600))} />
          <StatBox label="Streak" value={`${streak}d`} />
        </View>
      </View>

      <View className="px-5 mt-8">
        <Text className="text-ink-200 text-xs font-bold uppercase tracking-widest mb-3">
          Settings
        </Text>
        <Card>
          <Text className="text-ink-200 text-xs uppercase font-bold tracking-wider mb-2">
            Unit
          </Text>
          <View className="flex-row gap-2">
            {(["kg", "lb"] as const).map((u) => (
              <Pressable
                key={u}
                onPress={() => setUnit(u)}
                className={`flex-1 py-3 rounded-xl border ${
                  unit === u
                    ? "bg-accent/20 border-accent"
                    : "bg-ink-600 border-ink-400"
                }`}
              >
                <Text
                  className={`text-center font-black uppercase ${
                    unit === u ? "text-accent" : "text-white"
                  }`}
                >
                  {u}
                </Text>
              </Pressable>
            ))}
          </View>
        </Card>
        <View className="h-3" />
        <Card>
          <Text className="text-ink-200 text-xs uppercase font-bold tracking-wider mb-2">
            Bodyweight
          </Text>
          <View className="flex-row items-center gap-3">
            <TextInput
              value={bwDraft}
              onChangeText={setBwDraft}
              onBlur={() => setBw(parseFloat(bwDraft) || 0)}
              keyboardType="decimal-pad"
              className="text-white text-2xl font-black flex-1 border-b border-ink-400 pb-1"
            />
            <Text className="text-ink-100 uppercase font-bold">{unit}</Text>
          </View>
        </Card>
      </View>

      <View className="px-5 mt-8">
        <Pressable
          onPress={() => {
            Alert.alert(
              "Reset all data",
              "This deletes routines, sessions, and PRs. Cannot be undone.",
              [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Reset",
                  style: "destructive",
                  onPress: () => reset(),
                },
              ]
            );
          }}
          className="bg-danger/20 border border-danger/40 py-4 rounded-2xl items-center"
        >
          <Text className="text-danger font-black uppercase tracking-widest">
            Reset all data
          </Text>
        </Pressable>
      </View>

      <Text className="text-ink-300 text-center mt-8 text-xs">
        Liftoff • built for the 8x Engineer contest
      </Text>
    </ScrollView>
  );
}

function StatBox({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <View
      className="bg-ink-700 border border-ink-500 rounded-2xl p-4"
      style={{ width: "31%" }}
    >
      <Text className="text-ink-200 text-[10px] uppercase tracking-widest font-bold">
        {label}
      </Text>
      <View className="flex-row items-end gap-1 mt-1">
        <Text className="text-white font-black text-xl">{value}</Text>
        {sub ? (
          <Text className="text-ink-100 text-xs uppercase pb-0.5">{sub}</Text>
        ) : null}
      </View>
    </View>
  );
}
