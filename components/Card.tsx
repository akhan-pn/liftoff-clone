import { View, ViewProps } from "react-native";
import type { ReactNode } from "react";

export function Card({
  children,
  className = "",
  ...rest
}: ViewProps & { children: ReactNode; className?: string }) {
  return (
    <View
      className={`bg-ink-700 border border-ink-500 rounded-3xl p-5 ${className}`}
      {...rest}
    >
      {children}
    </View>
  );
}
