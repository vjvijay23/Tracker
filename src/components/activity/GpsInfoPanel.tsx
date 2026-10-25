import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../theme/colors';
import { Compass, Crosshair, Clock, Activity, AlertCircle } from 'lucide-react-native';

interface GpsInfoPanelProps {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  lastUpdateTime: string | null;
  status: string;
  isTracking: boolean;
}

export default function GpsInfoPanel({
  latitude,
  longitude,
  accuracy,
  lastUpdateTime,
  status,
  isTracking,
}: GpsInfoPanelProps) {
  const formatCoord = (coord: number | null, isLat: boolean) => {
    if (coord === null || coord === undefined || isNaN(coord)) {
      return '--.------';
    }
    const dir = isLat ? (coord >= 0 ? 'N' : 'S') : coord >= 0 ? 'E' : 'W';
    return `${Math.abs(coord).toFixed(6)}° ${dir}`;
  };

  const getStatusBadge = () => {
    switch (status) {
      case 'recording':
        return { label: 'RECORDING (HIGH ACCURACY)', color: Colors.primary, bg: Colors.primarySoft };
      case 'paused':
        return { label: 'SESSION PAUSED', color: Colors.accentOrange, bg: Colors.accentSoft };
      case 'ready':
        return { label: 'GPS READY', color: '#10B981', bg: '#E8F5E9' };
      case 'initializing':
        return { label: 'ACQUIRING GPS...', color: '#F59E0B', bg: '#FEF3C7' };
      case 'stopped':
        return { label: 'WORKOUT COMPLETED', color: Colors.primaryDark, bg: Colors.surfaceWarm };
      default:
        return { label: 'GPS IDLE', color: Colors.textSecondary, bg: Colors.surfaceWarm };
    }
  };

  const badge = getStatusBadge();

  return (
    <View style={styles.container}>
      {/* Top Header with Tracking Status */}
      <View style={styles.statusRow}>
        <View style={[styles.statusBadge, { backgroundColor: badge.bg }]}>
          <View style={[styles.statusDot, { backgroundColor: badge.color }]} />
          <Text style={[styles.statusLabel, { color: badge.color }]}>{badge.label}</Text>
        </View>

        <Text style={styles.gpsNoteText}>GPS-derived estimates</Text>
      </View>

      {/* 2x2 Information Grid: Coordinates, Accuracy & Timestamp */}
      <View style={styles.grid}>
        {/* Latitude */}
        <View style={styles.gridItem}>
          <View style={styles.labelRow}>
            <Compass size={11} color={Colors.textSecondary} />
            <Text style={styles.label}>LATITUDE</Text>
          </View>
          <Text style={[styles.value, !latitude && styles.mutedValue]}>
            {formatCoord(latitude, true)}
          </Text>
        </View>

        {/* Longitude */}
        <View style={styles.gridItem}>
          <View style={styles.labelRow}>
            <Compass size={11} color={Colors.textSecondary} />
            <Text style={styles.label}>LONGITUDE</Text>
          </View>
          <Text style={[styles.value, !longitude && styles.mutedValue]}>
            {formatCoord(longitude, false)}
          </Text>
        </View>

        {/* Accuracy */}
        <View style={styles.gridItem}>
          <View style={styles.labelRow}>
            <Crosshair size={11} color={Colors.textSecondary} />
            <Text style={styles.label}>GPS ACCURACY</Text>
          </View>
          <Text style={[styles.value, !accuracy && styles.mutedValue]}>
            {accuracy !== null && accuracy !== undefined ? `± ${accuracy} m` : 'Calculating...'}
          </Text>
        </View>

        {/* Last Location Update Time */}
        <View style={styles.gridItem}>
          <View style={styles.labelRow}>
            <Clock size={11} color={Colors.textSecondary} />
            <Text style={styles.label}>LAST UPDATE</Text>
          </View>
          <Text style={[styles.value, !lastUpdateTime && styles.mutedValue]}>
            {lastUpdateTime || 'Searching...'}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    marginVertical: 10,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  statusLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  gpsNoteText: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: 10,
  },
  gridItem: {
    width: '50%',
    paddingRight: 8,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  label: {
    fontSize: 9.5,
    fontWeight: '700',
    color: Colors.textSecondary,
    letterSpacing: 0.5,
  },
  value: {
    fontSize: 13.5,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  mutedValue: {
    color: Colors.textMuted,
  },
});
