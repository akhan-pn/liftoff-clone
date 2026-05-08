import { Tabs } from "expo-router";
import { View, Text, Pressable } from "react-native";
import { BlurView } from "expo-blur";

type IconKey = "home" | "routines" | "progress" | "leaderboard" | "profile";

const ICON: Record<IconKey, string> = {
  home: "▶︎",
  routines: "≡",
  progress: "ƒ",
  leaderboard: "★",
  profile: "◉",
};

const LABEL: Record<IconKey, string> = {
  home: "Home",
  routines: "Routines",
  progress: "Progress",
  leaderboard: "Ranks",
  profile: "Profile",
};

function TabBarIcon({ name, focused }: { name: IconKey; focused: boolean }) {
  return (
    <View className="items-center" style={{ width: 64 }}>
      <Text
        style={{
          fontSize: 22,
          color: focused ? "#FF5630" : "#5C6178",
          marginTop: 6,
        }}
      >
        {ICON[name]}
      </Text>
      <Text
        style={{
          fontSize: 10,
          color: focused ? "#FFFFFF" : "#5C6178",
          marginTop: 2,
          fontWeight: "700",
          letterSpacing: 0.5,
        }}
      >
        {LABEL[name].toUpperCase()}
      </Text>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        sceneStyle: { backgroundColor: "#06070D" },
        tabBarStyle: {
          position: "absolute",
          backgroundColor: "rgba(12,14,22,0.92)",
          borderTopColor: "#262A3B",
          borderTopWidth: 1,
          height: 78,
          paddingTop: 4,
        },
      }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="routines" />
      <Tabs.Screen name="progress" />
      <Tabs.Screen name="leaderboard" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}

import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";

function CustomTabBar({ state, navigation }: BottomTabBarProps) {
  const keys: IconKey[] = ["home", "routines", "progress", "leaderboard", "profile"];
  return (
    <BlurView
      tint="dark"
      intensity={60}
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        borderTopColor: "#262A3B",
        borderTopWidth: 1,
        backgroundColor: "rgba(6,7,13,0.85)",
      }}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-around",
          paddingTop: 4,
          paddingBottom: 22,
        }}
      >
        {state.routes.map((route, idx) => {
          const focused = state.index === idx;
          return (
            <Pressable
              key={route.key}
              onPress={() => {
                const event = navigation.emit({
                  type: "tabPress",
                  target: route.key,
                  canPreventDefault: true,
                });
                if (!focused && !event.defaultPrevented) {
                  navigation.navigate(route.name);
                }
              }}
              style={{ flex: 1, alignItems: "center" }}
            >
              <TabBarIcon name={keys[idx]} focused={focused} />
            </Pressable>
          );
        })}
      </View>
    </BlurView>
  );
}
