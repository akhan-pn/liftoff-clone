import { View, Text } from "react-native";
import Svg, { Rect } from "react-native-svg";

export type Bar = { label: string; value: number; color?: string };

export function BarChart({
  bars,
  width,
  height = 140,
  color = "#FF5630",
}: {
  bars: Bar[];
  width: number;
  height?: number;
  color?: string;
}) {
  if (!bars || bars.length === 0) return <View style={{ width, height }} />;
  const padX = 4;
  const padTop = 8;
  const padBottom = 28;
  const inner = width - padX * 2;
  const innerH = height - padTop - padBottom;
  const max = Math.max(...bars.map((b) => b.value), 1);
  const gap = 6;
  const barW = (inner - gap * (bars.length - 1)) / bars.length;

  return (
    <View>
      <Svg width={width} height={height}>
        {bars.map((b, i) => {
          const h = (b.value / max) * innerH;
          const x = padX + i * (barW + gap);
          const y = padTop + innerH - h;
          return (
            <Rect
              key={i}
              x={x}
              y={y}
              width={barW}
              height={h}
              rx={6}
              fill={b.color ?? color}
              opacity={b.value === 0 ? 0.18 : 1}
            />
          );
        })}
      </Svg>
      <View
        style={{
          flexDirection: "row",
          paddingHorizontal: padX,
          marginTop: -22,
        }}
      >
        {bars.map((b, i) => (
          <View
            key={i}
            style={{
              width: barW,
              marginRight: i === bars.length - 1 ? 0 : gap,
              alignItems: "center",
            }}
          >
            <Text className="text-ink-200 text-[10px] font-semibold">
              {b.label}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}
