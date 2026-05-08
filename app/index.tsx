import { Redirect } from "expo-router";
import { useStore } from "@/lib/store";

export default function Index() {
  const hasOnboarded = useStore((s) => s.hasOnboarded);
  return <Redirect href={hasOnboarded ? "/(tabs)" : "/onboarding"} />;
}
