import { useMemo, useState } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useStore } from "@/lib/store";
import { generateLeaderboard } from "@/lib/leaderboard";
import { rankFromVolume } from "@/lib/colors";
import {
  weeklyVolume,
  monthlyVolume,
  currentStreak,
} from "@/lib/volume";
import { Card } from "@/components/Card";
import * as Haptics from "expo-haptics";

type Tab = "weekly" | "monthly" | "streak";

export default function Leaderboard() {
  const username = useStore((s) => s.username);
  const sessions = useStore((s) => s.sessions);
  const unit = useStore((s) => s.unit);
  const [tab, setTab] = useState<Tab>("weekly");

  const myWeekly = weeklyVolume(sessions);
  const myMonthly = monthlyVolume(sessions);
  const myStreak = currentStreak(sessions);

  const board = useMemo(() => {
    const seeded = generateLeaderboard();
    const me = {
      id: "me",
      name: username,
      avatar: username
        .split(" ")
        .map((p) => p[0])
        .slice(0, 2)
        .join("")
        .toUpperCase() || "U",
      weeklyVolumeKg: myWeekly,
      monthlyVolumeKg: myMonthly,
      streak: myStreak,
      rank: rankFromVolume(myMonthly).name,
      isMe: true,
    };
    const rows = [...seeded.map((u) => ({ ...u, rank: rankFromVolume(u.monthlyVolumeKg).name })), me];
    if (tab === "weekly")
      return rows.sort((a, b) => b.weeklyVolumeKg - a.weeklyVolumeKg);
    if (tab === "monthly")
      return rows.sort((a, b) => b.monthlyVolumeKg - a.monthlyVolumeKg);
    return rows.sort((a, b) => b.streak - a.streak);
  }, [tab, myWeekly, myMonthly, myStreak, username]);

  function fmtVol(kg: number) {
    if (unit === "lb") {
      const lb = kg * 2.20462;
      return lb >= 1000 ? `${(lb / 1000).toFixed(1)}k` : `${Math.round(lb)}`;
    }
    return kg >= 1000 ? `${(kg / 1000).toFixed(1)}k` : `${Math.round(kg)}`;
  }

  const myIdx = board.findIndex((u) => u.isMe);

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient
        colors={["#1B1E2C", "#06070D"]}
        style={{ paddingTop: 64, paddingHorizontal: 20, paddingBottom: 16 }}
      >
        <Text className="text-white text-4xl font-black">Leaderboard</Text>
        <Text className="text-ink-200 mt-1">
          You're ranked #{myIdx + 1} of {board.length} this {tab === "streak" ? "season" : tab.replace("ly", "")}.
        </Text>
        <View className="flex-row gap-2 mt-4">
          {(["weekly", "monthly", "streak"] as const).map((t) => (
            <Pressable
              key={t}
              onPress={() => {
                Haptics.selectionAsync();
                setTab(t);
              }}
              className={`px-4 py-2 rounded-full border ${
                tab === t
                  ? "bg-accent border-accent"
                  : "bg-ink-700 border-ink-500"
              }`}
            >
              <Text
                className={`uppercase text-[11px] tracking-widest font-black ${
                  tab === t ? "text-white" : "text-ink-100"
                }`}
              >
                {t === "weekly"
                  ? "Volume / Wk"
                  : t === "monthly"
                  ? "Volume / Mo"
                  : "Streak"}
              </Text>
            </Pressable>
          ))}
        </View>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 140, paddingHorizontal: 20 }}
      >
        <View className="gap-2 mt-4">
          {board.map((u, i) => {
            const rank = rankFromVolume(u.monthlyVolumeKg);
            const isPodium = i < 3;
            return (
              <View
                key={u.id}
                className={`rounded-2xl p-4 flex-row items-center gap-3 border ${
                  u.isMe
                    ? "bg-accent/15 border-accent"
                    : isPodium
                    ? "bg-ink-700 border-gold/40"
                    : "bg-ink-700 border-ink-500"
                }`}
              >
                <Text
                  className="font-black text-lg w-7 text-center"
                  style={{ color: isPodium ? "#F5C04A" : "#9AA0B4" }}
                >
                  {i + 1}
                </Text>
                <View
                  className="w-10 h-10 rounded-full items-center justify-center"
                  style={{
                    backgroundColor: u.isMe ? "#FF5630" : rank.color + "33",
                  }}
                >
                  <Text
                    className="font-black text-sm"
                    style={{ color: u.isMe ? "#fff" : rank.color }}
                  >
                    {u.avatar}
                  </Text>
                </View>
                <View className="flex-1">
                  <View className="flex-row items-center gap-2">
                    <Text className="text-white font-bold">{u.name}</Text>
                    {u.isMe && (
                      <View className="bg-accent rounded-full px-1.5 py-0.5">
                        <Text className="text-white text-[9px] font-black uppercase tracking-widest">
                          you
                        </Text>
                      </View>
                    )}
                  </View>
                  <Text
                    className="text-[10px] uppercase font-black tracking-widest mt-0.5"
                    style={{ color: rank.color }}
                  >
                    {rank.name}
                  </Text>
                </View>
                <View className="items-end">
                  {tab === "streak" ? (
                    <Text className="text-white font-black text-lg">
                      {u.streak}d 🔥
                    </Text>
                  ) : (
                    <Text className="text-white font-black text-base">
                      {fmtVol(
                        tab === "weekly" ? u.weeklyVolumeKg : u.monthlyVolumeKg
                      )}
                      <Text className="text-ink-100 font-normal text-xs">
                        {" "}
                        {unit}
                      </Text>
                    </Text>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}
