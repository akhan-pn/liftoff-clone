import {
  View,
  Text,
  ScrollView,
  Pressable,
  RefreshControl,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useStore } from "@/lib/store";
import { useState } from "react";
import { router } from "expo-router";
import { format, formatDistanceToNowStrict } from "date-fns";
import { rankFromVolume } from "@/lib/colors";
import {
  weeklyVolume,
  monthlyVolume,
  currentStreak,
  trainingDaysThisWeek,
  lastWorkoutDays,
} from "@/lib/volume";
import { StatBadge } from "@/components/StatBadge";
import { Card } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import { PressableCard } from "@/components/PressableCard";
import * as Haptics from "expo-haptics";

export default function Home() {
  const username = useStore((s) => s.username);
  const sessions = useStore((s) => s.sessions);
  const routines = useStore((s) => s.routines);
  const startWorkout = useStore((s) => s.startWorkout);
  const startEmpty = useStore((s) => s.startEmptyWorkout);
  const unit = useStore((s) => s.unit);
  const [refresh, setRefresh] = useState(0);

  const wkVol = weeklyVolume(sessions);
  const moVol = monthlyVolume(sessions);
  const streak = currentStreak(sessions);
  const daysThisWeek = trainingDaysThisWeek(sessions);
  const lastDays = lastWorkoutDays(sessions);
  const rank = rankFromVolume(moVol);

  function fmtVol(kg: number) {
    if (unit === "lb") {
      const lb = kg * 2.20462;
      return `${(lb / 1000).toFixed(1)}k lb`;
    }
    return `${(kg / 1000).toFixed(1)}k kg`;
  }

  const recent = sessions.slice(0, 5);

  return (
    <ScrollView
      contentContainerStyle={{ paddingBottom: 120 }}
      refreshControl={
        <RefreshControl
          tintColor="#FF5630"
          refreshing={false}
          onRefresh={() => setRefresh((r) => r + 1)}
        />
      }
    >
      <LinearGradient
        colors={["#1B1E2C", "#06070D"]}
        style={{ paddingTop: 64, paddingHorizontal: 20, paddingBottom: 24 }}
      >
        <View className="flex-row justify-between items-start">
          <View>
            <Text className="text-ink-200 text-sm">Welcome back,</Text>
            <Text className="text-white text-3xl font-black mt-1">
              {username}
            </Text>
          </View>
          <View
            className="rounded-full px-3 py-1.5 flex-row items-center gap-2"
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

        <View className="flex-row gap-3 mt-6">
          <StatBadge label="Streak" value={`${streak}d`} accent={streak > 0} />
          <StatBadge label="This week" value={`${daysThisWeek}/7`} />
          <StatBadge label="Volume" value={fmtVol(wkVol)} />
        </View>
      </LinearGradient>

      <View className="px-5 mt-4">
        <Text className="text-ink-200 text-xs font-bold uppercase tracking-widest mb-3">
          Quick start
        </Text>
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            startEmpty();
            router.push("/workout/active");
          }}
          className="rounded-3xl overflow-hidden"
        >
          <LinearGradient
            colors={["#FF5630", "#B92C12"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ padding: 22 }}
          >
            <Text className="text-white font-black text-lg uppercase tracking-wider">
              Quick workout
            </Text>
            <Text className="text-white/80 mt-1">
              Just start lifting — pick exercises as you go.
            </Text>
            <Text className="text-white text-3xl font-black mt-4">▶︎</Text>
          </LinearGradient>
        </Pressable>
      </View>

      <View className="px-5 mt-6">
        <View className="flex-row justify-between items-end mb-3">
          <Text className="text-ink-200 text-xs font-bold uppercase tracking-widest">
            Your routines
          </Text>
          <Pressable onPress={() => router.push("/routine/new")}>
            <Text className="text-accent font-bold">+ New</Text>
          </Pressable>
        </View>
        <View className="gap-3">
          {routines.length === 0 && (
            <EmptyState
              icon="📋"
              title="No routines yet"
              body="Build your first routine to start lifting on autopilot."
              cta="Build Routine"
              onPress={() => router.push("/routine/new")}
            />
          )}
          {routines.map((r) => (
            <PressableCard
              key={r.id}
              onPress={() => {
                startWorkout(r.id);
                router.push("/workout/active");
              }}
            >
              <View className="flex-row items-center gap-3">
                <Text className="text-3xl">{r.emoji ?? "🔥"}</Text>
                <View className="flex-1">
                  <Text className="text-white font-black text-lg">
                    {r.name}
                  </Text>
                  <Text className="text-ink-200 text-sm" numberOfLines={1}>
                    {r.exercises.length} exercises •{" "}
                    {r.description ?? "tap to start"}
                  </Text>
                </View>
                <Text className="text-accent text-2xl">▶︎</Text>
              </View>
            </PressableCard>
          ))}
        </View>
      </View>

      <View className="px-5 mt-8">
        <Text className="text-ink-200 text-xs font-bold uppercase tracking-widest mb-3">
          Recent sessions
        </Text>
        <View className="gap-3">
          {recent.length === 0 ? (
            <Card>
              <Text className="text-ink-200 text-center">
                No sessions yet.{" "}
                {lastDays !== null
                  ? `Last lift ${lastDays}d ago.`
                  : "Time to get under the bar."}
              </Text>
            </Card>
          ) : (
            recent.map((s) => (
              <Card key={s.id}>
                <View className="flex-row justify-between items-start">
                  <View className="flex-1">
                    <Text className="text-white font-bold text-base">
                      {s.routineName}
                    </Text>
                    <Text className="text-ink-200 text-xs mt-0.5">
                      {format(s.startedAt, "EEE, MMM d • h:mm a")} •{" "}
                      {formatDistanceToNowStrict(s.startedAt, {
                        addSuffix: true,
                      })}
                    </Text>
                  </View>
                  {s.prCount > 0 ? (
                    <View className="bg-gold/20 border border-gold/40 rounded-full px-2 py-0.5">
                      <Text className="text-gold text-[11px] font-black">
                        {s.prCount} PR
                      </Text>
                    </View>
                  ) : null}
                </View>
                <View className="flex-row gap-3 mt-3">
                  <View className="flex-1">
                    <Text className="text-ink-200 text-[10px] uppercase tracking-widest">
                      Volume
                    </Text>
                    <Text className="text-white font-black text-xl">
                      {fmtVol(s.totalVolumeKg)}
                    </Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-ink-200 text-[10px] uppercase tracking-widest">
                      Time
                    </Text>
                    <Text className="text-white font-black text-xl">
                      {Math.round(s.durationSec / 60)}m
                    </Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-ink-200 text-[10px] uppercase tracking-widest">
                      Sets
                    </Text>
                    <Text className="text-white font-black text-xl">
                      {s.exercises.reduce((a, e) => a + e.sets.length, 0)}
                    </Text>
                  </View>
                </View>
              </Card>
            ))
          )}
        </View>
      </View>
    </ScrollView>
  );
}
