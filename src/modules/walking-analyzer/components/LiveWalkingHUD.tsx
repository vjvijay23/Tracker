import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import {
  Play,
  Pause,
  Square,
  Compass,
  Clock,
  TrendingUp,
  Activity,
} from 'lucide-react-native';
import { WalkingTelemetry, TrackerStatus } from '../types';

interface LiveWalkingHUDProps {
  status: TrackerStatus;
  telemetry: WalkingTelemetry;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onFinish: () => void;
}

const STRAVA_ORANGE = '#FC5200';

export const LiveWalkingHUD: React.FC<LiveWalkingHUDProps> = ({
  status,
  telemetry,
  onStart,
  onPause,
  onResume,
  onFinish,
}) => {
  // GPS Accuracy badge helper
  const renderGpsBadge = () => {
    const accuracy = telemetry.gpsAccuracy;
    if (accuracy === null || accuracy === undefined) {
      return (
        <View style={[styles.accuracyBadge, styles.accuracySearching]}>
          <Text style={styles.accuracyText}>NO GPS</Text>
        </View>
      );
    }

    let badgeStyle = styles.accuracyGood;
    let label = `GPS ±${Math.round(accuracy)}m`;

    if (accuracy <= 8) {
      badgeStyle = styles.accuracyGood;
    } else if (accuracy <= 15) {
      badgeStyle = styles.accuracyFair;
    } else {
      badgeStyle = styles.accuracyPoor;
    }

    return (
      <View style={[styles.accuracyBadge, badgeStyle]}>
        <View style={styles.accuracyDot} />
        <Text style={styles.accuracyText}>{label}</Text>
      </View>
    );
  };

  return (
    <View style={styles.hudContainer}>
      {/* Top Status & GPS Pill Bar */}
      <View style={styles.topMetaRow}>
        <View style={styles.statusPill}>
          <View
            style={[
              styles.statusPulse,
              status === 'tracking'
                ? styles.pulseActive
                : status === 'paused'
                ? styles.pulsePaused
                : styles.pulseIdle,
            ]}
          />
          <Text style={styles.statusLabel}>
            {status === 'tracking'
              ? 'LIVE RECORDING'
              : status === 'paused'
              ? 'PAUSED'
              : status === 'starting'
              ? 'INITIALIZING'
              : 'READY TO WALK'}
          </Text>
        </View>

        {renderGpsBadge()}
      </View>

      {/* Primary Analytics Grid (Strava-style High Contrast) */}
      <View style={styles.primaryMetricBox}>
        <Text style={styles.metricLabel}>ELAPSED TIME</Text>
        <Text style={styles.primaryMetricValue}>{telemetry.formattedTime}</Text>
      </View>

      <View style={styles.secondaryMetricsRow}>
        {/* Distance Card */}
        <View style={styles.metricCard}>
          <View style={styles.metricCardHeader}>
            <TrendingUp size={14} color="#718096" />
            <Text style={styles.cardHeaderLabel}>DISTANCE</Text>
          </View>
          <Text style={styles.cardValue}>{telemetry.formattedDistance}</Text>
        </View>

        {/* Live Pace Card */}
        <View style={styles.metricCard}>
          <View style={styles.metricCardHeader}>
            <Activity size={14} color="#718096" />
            <Text style={styles.cardHeaderLabel}>PACE</Text>
          </View>
          <Text style={styles.cardValue}>{telemetry.formattedPace}</Text>
        </View>
      </View>

      {/* Control Buttons */}
      <View style={styles.controlsRow}>
        {status === 'idle' || status === 'finished' ? (
          <TouchableOpacity
            style={[styles.actionButton, styles.startButton]}
            onPress={onStart}
            activeOpacity={0.88}
          >
            <Play size={22} color="#FFFFFF" fill="#FFFFFF" />
            <Text style={styles.startButtonText}>START WALK</Text>
          </TouchableOpacity>
        ) : status === 'starting' ? (
          <View style={[styles.actionButton, styles.startingButton]}>
            <ActivityIndicator size="small" color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text style={styles.startButtonText}>ACQUIRING GPS...</Text>
          </View>
        ) : status === 'tracking' ? (
          <TouchableOpacity
            style={[styles.actionButton, styles.pauseButton]}
            onPress={onPause}
            activeOpacity={0.88}
          >
            <Pause size={22} color="#FFFFFF" fill="#FFFFFF" />
            <Text style={styles.pauseButtonText}>PAUSE</Text>
          </TouchableOpacity>
        ) : status === 'paused' ? (
          <View style={styles.pausedButtonsContainer}>
            <TouchableOpacity
              style={[styles.dualButton, styles.resumeButton]}
              onPress={onResume}
              activeOpacity={0.88}
            >
              <Play size={20} color="#FFFFFF" fill="#FFFFFF" />
              <Text style={styles.dualButtonText}>RESUME</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.dualButton, styles.finishButton]}
              onPress={onFinish}
              activeOpacity={0.88}
            >
              <Square size={18} color="#FFFFFF" fill="#FFFFFF" />
              <Text style={styles.dualButtonText}>FINISH</Text>
            </TouchableOpacity>
          </View>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  hudContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 12,
  },
  topMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  statusPulse: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  pulseActive: {
    backgroundColor: STRAVA_ORANGE,
  },
  pulsePaused: {
    backgroundColor: '#EAB308',
  },
  pulseIdle: {
    backgroundColor: '#94A3B8',
  },
  statusLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#334155',
    letterSpacing: 0.5,
  },
  accuracyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  accuracyDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
    marginRight: 5,
  },
  accuracyGood: {
    backgroundColor: '#10B981',
  },
  accuracyFair: {
    backgroundColor: '#F59E0B',
  },
  accuracyPoor: {
    backgroundColor: '#EF4444',
  },
  accuracySearching: {
    backgroundColor: '#94A3B8',
  },
  accuracyText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  primaryMetricBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 1,
    marginBottom: 2,
  },
  primaryMetricValue: {
    fontSize: 44,
    fontWeight: '900',
    color: '#0F172A',
    fontVariant: ['tabular-nums'],
    letterSpacing: -1,
  },
  secondaryMetricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginVertical: 14,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  metricCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  cardHeaderLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  cardValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    fontVariant: ['tabular-nums'],
  },
  controlsRow: {
    marginTop: 4,
  },
  actionButton: {
    height: 54,
    borderRadius: 27,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: STRAVA_ORANGE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  startButton: {
    backgroundColor: STRAVA_ORANGE,
  },
  startingButton: {
    backgroundColor: '#94A3B8',
  },
  pauseButton: {
    backgroundColor: '#F59E0B',
    shadowColor: '#F59E0B',
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginLeft: 8,
  },
  pauseButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginLeft: 8,
  },
  pausedButtonsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  dualButton: {
    flex: 1,
    height: 52,
    borderRadius: 26,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
  },
  resumeButton: {
    backgroundColor: '#10B981',
  },
  finishButton: {
    backgroundColor: '#0F172A',
  },
  dualButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginLeft: 6,
  },
});
