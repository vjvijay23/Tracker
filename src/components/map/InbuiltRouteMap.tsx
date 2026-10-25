import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Image,
} from 'react-native';
import Svg, {
  Path,
  Circle,
  G,
  Text as SvgText,
  Rect,
  Defs,
  LinearGradient,
  Stop,
} from 'react-native-svg';
import { GPSPoint } from '../../types';
import { Colors } from '../../theme/colors';
import {
  Layers,
  Maximize2,
  Navigation,
  Compass,
  MapPin,
  Flag,
  Activity,
  TrendingUp,
} from 'lucide-react-native';

interface InbuiltRouteMapProps {
  routePoints: GPSPoint[];
  currentLocation?: GPSPoint | null;
  height?: number;
  interactive?: boolean;
  isLiveTracking?: boolean;
  showOverlayChart?: boolean;
  onToggleOverlay?: () => void;
  overlayTitle?: string;
  distanceKm?: number;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function InbuiltRouteMap({
  routePoints,
  currentLocation,
  height = 260,
  interactive = true,
  isLiveTracking = false,
  showOverlayChart = false,
  onToggleOverlay,
  overlayTitle = 'RACE GAP ANALYSIS',
  distanceKm = 0,
}: InbuiltRouteMapProps) {
  const [mapTheme, setMapTheme] = useState<'street' | 'terrain' | 'dark'>('street');
  const [showAnalysisOverlay, setShowAnalysisOverlay] = useState(showOverlayChart);

  const mapWidth = SCREEN_WIDTH - 32;
  const mapHeight = height;

  // Calculate coordinates bounds and projection
  const { pathString, projectedPoints, centerLat, centerLon, zoomLevel } = useMemo(() => {
    const points = routePoints || [];
    if (points.length === 0) return { pathString: '', projectedPoints: [], centerLat: 0, centerLon: 0, zoomLevel: 2 };

    const lats = points.map((p) => p.latitude);
    const lons = points.map((p) => p.longitude);

    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLon = Math.min(...lons);
    const maxLon = Math.max(...lons);

    const latDelta = Math.max(0.002, maxLat - minLat);
    const lonDelta = Math.max(0.002, maxLon - minLon);

    const padding = 36;
    const drawWidth = mapWidth - padding * 2;
    const drawHeight = mapHeight - padding * 2;

    const projected = points.map((p, index) => {
      const x = padding + ((p.longitude - minLon) / lonDelta) * drawWidth;
      const y = padding + ((maxLat - p.latitude) / latDelta) * drawHeight;
      return { x, y, lat: p.latitude, lon: p.longitude, index };
    });

    let d = '';
    projected.forEach((pt, i) => {
      d += i === 0 ? `M ${pt.x} ${pt.y}` : ` L ${pt.x} ${pt.y}`;
    });

    return {
      pathString: d,
      projectedPoints: projected,
      centerLat: (minLat + maxLat) / 2,
      centerLon: (minLon + maxLon) / 2,
      zoomLevel: 14,
    };
  }, [routePoints, mapWidth, mapHeight]);

  const startPoint = projectedPoints[0];
  const endPoint = projectedPoints[projectedPoints.length - 1];

  // Milestone split markers along the route (e.g. 2k, 4k, 6k, 8k, 10k)
  const splitMarkers = useMemo(() => {
    if (projectedPoints.length < 5) return [];
    const count = 4;
    const step = Math.floor(projectedPoints.length / (count + 1));
    const markers = [];
    for (let i = 1; i <= count; i++) {
      const pt = projectedPoints[i * step];
      if (pt) {
        const kmLabel = `${Math.round((i * (distanceKm || 10)) / (count + 1))}k`;
        markers.push({ ...pt, label: kmLabel });
      }
    }
    return markers;
  }, [projectedPoints, distanceKm]);

  // OpenStreetMap / CartoDB tile calculations
  const tileUrl = useMemo(() => {
    const n = Math.pow(2, 13);
    const x = Math.floor(((centerLon + 180) / 360) * n);
    const latRad = (centerLat * Math.PI) / 180;
    const y = Math.floor(
      ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n
    );

    if (mapTheme === 'dark') {
      return `https://a.basemaps.cartocdn.com/rastertiles/dark_all/13/${x}/${y}.png`;
    } else if (mapTheme === 'terrain') {
      return `https://tile.openstreetmap.org/13/${x}/${y}.png`;
    }
    // Clean Voyager light map (matching Strava style)
    return `https://a.basemaps.cartocdn.com/rastertiles/voyager/13/${x}/${y}.png`;
  }, [centerLat, centerLon, mapTheme]);

  if (routePoints.length === 0) {
    return <View style={[styles.mapContainer, styles.emptyRoute, { height: mapHeight }]}><Text style={styles.emptyRouteText}>No GPS route recorded</Text></View>;
  }

  return (
    <View style={[styles.mapContainer, { height: mapHeight }]}>
      {/* Background Map Tile Layer */}
      <Image
        source={{ uri: tileUrl }}
        style={StyleSheet.absoluteFillObject}
        resizeMode="cover"
      />

      {/* Stylized Map Overlays & Road Grid Background (Offline Fallback & Clean Aesthetics) */}
      <View style={[styles.tileBackdrop, mapTheme === 'dark' && styles.darkTileBackdrop]}>
        {/* Subtle grid lines mimicking street grid */}
        <Svg width={mapWidth} height={mapHeight} style={StyleSheet.absoluteFillObject}>
          <Defs>
            <LinearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor="#EB7142" />
              <Stop offset="70%" stopColor="#EB7142" />
              <Stop offset="100%" stopColor="#244A32" />
            </LinearGradient>
            <LinearGradient id="glowFilter" x1="0%" y1="0%" x2="100%" y2="0%">
              <Stop offset="0%" stopColor="#EB7142" stopOpacity="0.4" />
              <Stop offset="100%" stopColor="#244A32" stopOpacity="0.4" />
            </LinearGradient>
          </Defs>

          {/* Park / Greenery area */}
          <Path
            d={`M 15 25 Q ${mapWidth * 0.3} 10 ${mapWidth * 0.45} 40 T ${mapWidth * 0.35} 120 Z`}
            fill="#E8F4EC"
            opacity={0.8}
          />
          {/* Waterway / Canal */}
          <Path
            d={`M 0 ${mapHeight * 0.75} Q ${mapWidth * 0.5} ${mapHeight * 0.65} ${mapWidth} ${mapHeight * 0.85}`}
            stroke="#D6EAF8"
            strokeWidth={14}
            fill="none"
            opacity={0.85}
          />
          {/* Secondary streets */}
          <Path
            d={`M 0 60 L ${mapWidth} 80 M 50 0 L 70 ${mapHeight} M ${mapWidth * 0.6} 0 L ${mapWidth * 0.65} ${mapHeight} M 0 ${mapHeight * 0.4} L ${mapWidth} ${mapHeight * 0.35}`}
            stroke="#EFEBE4"
            strokeWidth={3}
            fill="none"
          />

          {/* Primary Route Outer Glow */}
          <Path
            d={pathString}
            stroke="rgba(235, 113, 66, 0.28)"
            strokeWidth={10}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />

          {/* Primary Athletic Route Line (Strava High-Visibility Orange) */}
          <Path
            d={pathString}
            stroke="#EB7142"
            strokeWidth={4.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />

          {/* Start Marker (Green Pin) */}
          {startPoint && (
            <G>
              <Circle cx={startPoint.x} cy={startPoint.y} r={9} fill="#244A32" />
              <Circle cx={startPoint.x} cy={startPoint.y} r={5} fill="#FFFFFF" />
            </G>
          )}

          {/* Split Kilometer Milestones along Route */}
          {splitMarkers.map((marker, idx) => (
            <G key={`split_${idx}`}>
              <Circle cx={marker.x} cy={marker.y} r={8} fill="#FFFFFF" stroke="#0F172A" strokeWidth={1.5} />
              <SvgText
                x={marker.x}
                y={marker.y + 3}
                fontSize={8}
                fontWeight="bold"
                fill="#0F172A"
                textAnchor="middle"
              >
                {marker.label}
              </SvgText>
            </G>
          ))}

          {/* Finish Marker (Checkered / Bold Pin) */}
          {endPoint && (
            <G>
              <Circle cx={endPoint.x} cy={endPoint.y} r={11} fill="#0F172A" stroke="#FFFFFF" strokeWidth={2} />
              <Circle cx={endPoint.x} cy={endPoint.y} r={6} fill="#EB7142" />
            </G>
          )}

          {/* Live User Position Puck (When Tracking) */}
          {isLiveTracking && endPoint && (
            <G>
              <Circle cx={endPoint.x} cy={endPoint.y} r={18} fill="rgba(37, 99, 235, 0.25)" />
              <Circle cx={endPoint.x} cy={endPoint.y} r={8} fill="#2563EB" stroke="#FFFFFF" strokeWidth={2.5} />
            </G>
          )}
        </Svg>
      </View>

      {/* Top Map Badges: GPS Status & Theme Selector */}
      <View style={styles.topControlRow}>
        <View style={styles.gpsBadge}>
          <View style={[styles.gpsDot, isLiveTracking && styles.gpsDotLive]} />
          <Text style={styles.gpsText}>
            {isLiveTracking ? 'GPS Recording Active' : 'Recorded GPS Route'}
          </Text>
        </View>

        <View style={styles.rightControls}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => {
              const themes: ('street' | 'terrain' | 'dark')[] = ['street', 'terrain', 'dark'];
              const nextIndex = (themes.indexOf(mapTheme) + 1) % themes.length;
              setMapTheme(themes[nextIndex]);
            }}
          >
            <Layers size={16} color="#0F172A" />
          </TouchableOpacity>

          {onToggleOverlay && (
            <TouchableOpacity
              style={[styles.iconButton, showAnalysisOverlay && styles.iconButtonActive]}
              onPress={() => {
                setShowAnalysisOverlay(!showAnalysisOverlay);
                onToggleOverlay();
              }}
            >
              <TrendingUp size={16} color={showAnalysisOverlay ? '#FFFFFF' : '#0F172A'} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Reference Image: RACE GAP ANALYSIS Overlay Card */}
      {showAnalysisOverlay && (
        <View style={styles.raceGapCard}>
          <View style={styles.raceGapHeader}>
            <View style={styles.raceGapTag}>
              <Text style={styles.raceGapTagText}>RACE GAP ANALYSIS</Text>
            </View>
          </View>

          {/* Embedded Mini Line Chart */}
          <Svg width={mapWidth - 36} height={100} style={styles.gapChartSvg}>
            {/* Grid lines */}
            <Path
              d={`M 25 15 L ${mapWidth - 55} 15 M 25 45 L ${mapWidth - 55} 45 M 25 75 L ${mapWidth - 55} 75`}
              stroke="#E2E8F0"
              strokeDasharray="2,2"
              strokeWidth={1}
            />
            {/* Y axis labels */}
            <SvgText x={15} y={18} fontSize={9} fill="#94A3B8">0</SvgText>
            <SvgText x={10} y={48} fontSize={9} fill="#94A3B8">-20</SvgText>
            <SvgText x={10} y={78} fontSize={9} fill="#94A3B8">-40</SvgText>

            {/* Gap to Pedro (Purple Line) */}
            <Path
              d={`M 30 18 Q 80 18 120 38 T 200 48 T 280 32 T 320 40`}
              stroke="#8B5CF6"
              strokeWidth={2}
              fill="none"
            />
            {/* Gap to Jimena (Cyan/Blue Line) */}
            <Path
              d={`M 30 20 Q 90 28 140 44 T 220 54 T 270 76 T 320 90`}
              stroke="#0EA5E9"
              strokeWidth={2}
              fill="none"
            />

            {/* X axis labels */}
            <SvgText x={30} y={96} fontSize={8} fill="#94A3B8">0</SvgText>
            <SvgText x={100} y={96} fontSize={8} fill="#94A3B8">2k</SvgText>
            <SvgText x={170} y={96} fontSize={8} fill="#94A3B8">4k</SvgText>
            <SvgText x={240} y={96} fontSize={8} fill="#94A3B8">6k</SvgText>
            <SvgText x={310} y={96} fontSize={8} fill="#94A3B8">10k</SvgText>
          </Svg>

          {/* Legend Badges */}
          <View style={styles.gapLegendRow}>
            <View style={[styles.legendPill, { backgroundColor: '#8B5CF6' }]}>
              <Text style={styles.legendText}>Gap to Pedro</Text>
            </View>
            <View style={[styles.legendPill, { backgroundColor: '#0EA5E9', marginLeft: 8 }]}>
              <Text style={styles.legendText}>Gap to Jimena</Text>
            </View>
          </View>
        </View>
      )}

      {/* Bottom Route Summary Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.statMini}>
          <Text style={styles.statMiniLabel}>START</Text>
          <Text style={styles.statMiniVal}>Falkirk Track</Text>
        </View>
        <View style={styles.statMiniDivider} />
        <View style={styles.statMini}>
          <Text style={styles.statMiniLabel}>FINISH</Text>
          <Text style={styles.statMiniVal}>Callendar Park</Text>
        </View>
        <View style={styles.statMiniDivider} />
        <View style={styles.statMini}>
          <Text style={styles.statMiniLabel}>ELEVATION</Text>
          <Text style={styles.statMiniVal}>+5 m</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  emptyRoute: { alignItems: 'center', justifyContent: 'center', backgroundColor: '#EEF1ED' },
  emptyRouteText: { color: Colors.textSecondary, fontSize: 15, fontWeight: '600' },
  mapContainer: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#F3F0E6',
    borderWidth: 1,
    borderColor: '#E6E1D5',
  },
  tileBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(247, 244, 237, 0.72)',
  },
  darkTileBackdrop: {
    backgroundColor: 'rgba(15, 23, 42, 0.82)',
  },
  topControlRow: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
  },
  gpsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  gpsDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#10B981',
    marginRight: 6,
  },
  gpsDotLive: {
    backgroundColor: '#EB7142',
  },
  gpsText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#0F172A',
  },
  rightControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  iconButtonActive: {
    backgroundColor: '#244A32',
  },
  raceGapCard: {
    position: 'absolute',
    top: 48,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 14,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  raceGapHeader: {
    alignItems: 'center',
    marginBottom: 6,
  },
  raceGapTag: {
    backgroundColor: '#FFEDD5',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 6,
  },
  raceGapTagText: {
    color: '#EA580C',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  gapChartSvg: {
    alignSelf: 'center',
  },
  gapLegendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 6,
  },
  legendPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  legendText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    right: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    borderRadius: 10,
    flexDirection: 'row',
    paddingVertical: 6,
    paddingHorizontal: 12,
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  statMini: {
    alignItems: 'center',
    flex: 1,
  },
  statMiniLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.4,
  },
  statMiniVal: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 1,
  },
  statMiniDivider: {
    width: 1,
    height: 18,
    backgroundColor: '#E2E8F0',
  },
});
