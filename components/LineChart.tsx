import { View } from "react-native";
import Svg, {
  Path,
  Circle,
  Line as SvgLine,
  Defs,
  LinearGradient as SvgLinearGradient,
  Stop,
} from "react-native-svg";

export type ChartPoint = { x: number; y: number };

export function LineChart({
  data,
  width,
  height = 160,
  color = "#FF5630",
  showDots = true,
}: {
  data: ChartPoint[];
  width: number;
  height?: number;
  color?: string;
  showDots?: boolean;
}) {
  if (!data || data.length === 0) {
    return <View style={{ width, height }} />;
  }
  const padX = 12;
  const padY = 16;
  const innerW = width - padX * 2;
  const innerH = height - padY * 2;
  const xs = data.map((p) => p.x);
  const ys = data.map((p) => p.y);
  const xMin = Math.min(...xs);
  const xMax = Math.max(...xs);
  const yMin = Math.min(...ys);
  const yMax = Math.max(...ys);
  const xRange = xMax - xMin || 1;
  const yRange = Math.max(yMax - yMin, 1);

  const sx = (x: number) =>
    padX + ((x - xMin) / xRange) * (data.length === 1 ? 0 : innerW);
  const sy = (y: number) => padY + innerH - ((y - yMin) / yRange) * innerH;

  const path =
    data.length === 1
      ? `M ${sx(data[0].x)} ${sy(data[0].y)}`
      : data
          .map((p, i) => `${i === 0 ? "M" : "L"} ${sx(p.x)} ${sy(p.y)}`)
          .join(" ");

  const areaPath =
    data.length > 1
      ? `${path} L ${sx(xMax)} ${padY + innerH} L ${sx(xMin)} ${padY + innerH} Z`
      : "";

  const id = `g_${Math.round(width)}_${Math.round(height)}_${color}`;

  return (
    <Svg width={width} height={height}>
      <Defs>
        <SvgLinearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={color} stopOpacity="0.35" />
          <Stop offset="1" stopColor={color} stopOpacity="0" />
        </SvgLinearGradient>
      </Defs>

      {[0.25, 0.5, 0.75].map((f) => (
        <SvgLine
          key={f}
          x1={padX}
          x2={padX + innerW}
          y1={padY + innerH * f}
          y2={padY + innerH * f}
          stroke="#262A3B"
          strokeWidth={1}
        />
      ))}

      {areaPath ? <Path d={areaPath} fill={`url(#${id})`} /> : null}

      <Path d={path} stroke={color} strokeWidth={2.5} fill="none" />

      {showDots &&
        data.map((p, i) => (
          <Circle
            key={i}
            cx={sx(p.x)}
            cy={sy(p.y)}
            r={i === data.length - 1 ? 4 : 2.5}
            fill={i === data.length - 1 ? "#fff" : color}
            stroke={color}
            strokeWidth={i === data.length - 1 ? 2 : 0}
          />
        ))}
    </Svg>
  );
}
