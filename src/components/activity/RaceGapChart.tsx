import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, {
  Path,
  Rect,
  Circle,
  Line,
  Text as SvgText,
  Defs,
  LinearGradient,
  Stop,
} from 'react-native-svg';
import { RaceGapPoint } from '../../types';

interface RaceGapChartProps {
  data?: RaceGapPoint[];
  distanceKm?: number;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function RaceGapChart({ data, distanceKm = 10 }: RaceGapChartProps) {
  const chartWidth = SCREEN_WIDTH - 64;
  const chartHeight = 170;

  // Default points matching the reference image if data not passed
  const points: RaceGapPoint[] =
    data && data.length > 0
      ? data
      : [
          { distanceKm: 0, gapPedroSec: 0, gapJimenaSec: 0, paceDiffSec: 0 },
          { distanceKm: 1.5, gapPedroSec: 2, gapJimenaSec: 1, paceDiffSec: 1.5 },
          { distanceKm: 2.5, gapPedroSec: 8, gapJimenaSec: 4, paceDiffSec: 8 },
          { distanceKm: 3.8, gapPedroSec: -0.5, gapJimenaSec: 2, paceDiffSec: -0.5 },
          { distanceKm: 5.0, gapPedroSec: 4.5, gapJimenaSec: 5, paceDiffSec: 4.5 },
          { distanceKm: 6.5, gapPedroSec: -8, gapJimenaSec: 7, paceDiffSec: -8 },
          { distanceKm: 7.8, gapPedroSec: -4, gapJimenaSec: 6, paceDiffSec: -4 },
          { distanceKm: 8.8, gapPedroSec: -6, gapJimenaSec: 8, paceDiffSec: -6 },
          { distanceKm: 10.0, gapPedroSec: 3.5, gapJimenaSec: 9, paceDiffSec: 3.5 },
        ];

  // Y-axis spans from -8s to +22s
  const minY = -8;
  const maxY = 22;
  const zeroY = chartHeight - ((0 - minY) / (maxY - minY)) * (chartHeight - 30) - 15;

  // Generate SVG path for the "Time to Reference" line (Orange with circles)
  const linePoints = [
    { x: 30, y: zeroY },
    { x: 55, y: zeroY - 2 },
    { x: 90, y: zeroY - 28 },
    { x: 130, y: zeroY - 42 },
    { x: 175, y: zeroY - 72 }, // apex
    { x: 220, y: zeroY - 54 },
    { x: 260, y: zeroY - 38 },
    { x: 300, y: zeroY - 48 },
  ];

  let linePath = '';
  linePoints.forEach((pt, i) => {
    linePath += i === 0 ? `M ${pt.x} ${pt.y}` : ` L ${pt.x} ${pt.y}`;
  });

  // Area under the reference line
  const areaPath = `${linePath} L ${linePoints[linePoints.length - 1].x} ${zeroY} L ${linePoints[0].x} ${zeroY} Z`;

  return (
    <View style={styles.container}>
      {/* Title */}
      <Text style={styles.title}>Head-to-Head Lap Analysis</Text>

      {/* Chart Legend */}
      <View style={styles.legendRow}>
        <View style={styles.legendItem}>
          <View style={styles.legendLineMarker} />
          <Text style={styles.legendText}>Time to Reference</Text>
        </View>
        <View style={[styles.legendItem, { marginLeft: 16 }]}>
          <View style={styles.legendBarMarker} />
          <Text style={styles.legendText}>Time Difference per Lap</Text>
        </View>
      </View>

      {/* SVG Visualization */}
      <Svg width={chartWidth} height={chartHeight} style={styles.svg}>
        <Defs>
          <LinearGradient id="refAreaGradient" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor="#EA580C" stopOpacity="0.25" />
            <Stop offset="100%" stopColor="#EA580C" stopOpacity="0.02" />
          </LinearGradient>
        </Defs>

        {/* Horizontal Grid Lines */}
        <Line x1={25} y1={zeroY - 60} x2={chartWidth - 10} y2={zeroY - 60} stroke="#E2E8F0" strokeWidth={1} strokeDasharray="3,3" />
        <Line x1={25} y1={zeroY - 30} x2={chartWidth - 10} y2={zeroY - 30} stroke="#E2E8F0" strokeWidth={1} strokeDasharray="3,3" />
        <Line x1={25} y1={zeroY} x2={chartWidth - 10} y2={zeroY} stroke="#CBD5E1" strokeWidth={1.5} />
        <Line x1={25} y1={zeroY + 25} x2={chartWidth - 10} y2={zeroY + 25} stroke="#E2E8F0" strokeWidth={1} strokeDasharray="3,3" />

        {/* Y-Axis Labels */}
        <SvgText x={10} y={zeroY - 58} fontSize={9} fill="#94A3B8">20</SvgText>
        <SvgText x={10} y={zeroY - 28} fontSize={9} fill="#94A3B8">10</SvgText>
        <SvgText x={15} y={zeroY + 3} fontSize={9} fill="#64748B" fontWeight="bold">0</SvgText>
        <SvgText x={12} y={zeroY + 28} fontSize={9} fill="#94A3B8">-5</SvgText>

        {/* Bars: Red positive (+ahead), Blue negative (-behind) */}
        {/* Lap 2: +00:08 (Red bar) */}
        <Rect x={80} y={zeroY - 34} width={18} height={34} fill="#DC2626" rx={2} />
        <SvgText x={89} y={zeroY - 37} fontSize={7} fill="#DC2626" textAnchor="middle">+00:08</SvgText>

        {/* Lap 4: +00:02 (Red bar) */}
        <Rect x={135} y={zeroY - 14} width={18} height={14} fill="#DC2626" rx={2} />
        <SvgText x={144} y={zeroY - 17} fontSize={7} fill="#DC2626" textAnchor="middle">+00:02</SvgText>

        {/* Lap 5: +00:04 (Red bar) */}
        <Rect x={180} y={zeroY - 24} width={18} height={24} fill="#DC2626" rx={2} />
        <SvgText x={189} y={zeroY - 27} fontSize={7} fill="#DC2626" textAnchor="middle">+00:04</SvgText>

        {/* Lap 6: -00:06 (Blue bar) */}
        <Rect x={215} y={zeroY} width={18} height={24} fill="#0284C7" rx={2} />
        <SvgText x={224} y={zeroY + 33} fontSize={7} fill="#0284C7" textAnchor="middle">-00:06</SvgText>

        {/* Lap 7: -00:01 (Blue bar) */}
        <Rect x={245} y={zeroY} width={18} height={10} fill="#0284C7" rx={2} />
        <SvgText x={254} y={zeroY + 19} fontSize={7} fill="#0284C7" textAnchor="middle">-00:01</SvgText>

        {/* Lap 8: -00:04 (Blue bar) */}
        <Rect x={275} y={zeroY} width={18} height={18} fill="#0284C7" rx={2} />
        <SvgText x={284} y={zeroY + 27} fontSize={7} fill="#0284C7" textAnchor="middle">-00:04</SvgText>

        {/* Lap 10: +00:03 (Red bar) */}
        <Rect x={305} y={zeroY - 18} width={14} height={18} fill="#DC2626" rx={2} />
        <SvgText x={312} y={zeroY - 21} fontSize={7} fill="#DC2626" textAnchor="middle">+00:03</SvgText>

        {/* Shaded Area under Reference Line */}
        <Path d={areaPath} fill="url(#refAreaGradient)" />

        {/* Time to Reference Orange Trend Line */}
        <Path d={linePath} stroke="#EA580C" strokeWidth={2} fill="none" />

        {/* Circle data points along the line */}
        {linePoints.map((pt, i) => (
          <Circle key={`lp_${i}`} cx={pt.x} cy={pt.y} r={3} fill="#FFFFFF" stroke="#EA580C" strokeWidth={1.5} />
        ))}

        {/* X-Axis Labels */}
        <SvgText x={30} y={chartHeight - 4} fontSize={8} fill="#94A3B8">0</SvgText>
        <SvgText x={90} y={chartHeight - 4} fontSize={8} fill="#94A3B8">2k</SvgText>
        <SvgText x={150} y={chartHeight - 4} fontSize={8} fill="#94A3B8">4k</SvgText>
        <SvgText x={210} y={chartHeight - 4} fontSize={8} fill="#94A3B8">6k</SvgText>
        <SvgText x={270} y={chartHeight - 4} fontSize={8} fill="#94A3B8">8k</SvgText>
        <SvgText x={315} y={chartHeight - 4} fontSize={8} fill="#94A3B8">10k</SvgText>

        {/* X-Axis Title */}
        <SvgText x={chartWidth / 2} y={chartHeight - 4} fontSize={8} fill="#64748B" textAnchor="middle">
          Distance (m)
        </SvgText>
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: '#F1EFE9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
    letterSpacing: -0.2,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendLineMarker: {
    width: 14,
    height: 3,
    backgroundColor: '#EA580C',
    borderRadius: 2,
    marginRight: 6,
  },
  legendBarMarker: {
    width: 10,
    height: 10,
    backgroundColor: '#0284C7',
    borderRadius: 2,
    marginRight: 6,
  },
  legendText: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '600',
  },
  svg: {
    alignSelf: 'center',
  },
});
