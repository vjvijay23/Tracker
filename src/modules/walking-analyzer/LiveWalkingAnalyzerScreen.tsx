import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  Modal,
  ScrollView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  BatteryCharging,
  ShieldAlert,
  Flame,
  Clock,
  TrendingUp,
  Award,
  Zap,
  CheckCircle,
} from 'lucide-react-native';
import { useWalkingTracker } from './hooks/useWalkingTracker';
import { LiveWalkingMap } from './components/LiveWalkingMap';
import { LiveWalkingHUD } from './components/LiveWalkingHUD';
import { WalkingSummary } from './types';

const STRAVA_ORANGE = '#FC5200';

interface LiveWalkingAnalyzerScreenProps {
  navigation?: any;
}

export const LiveWalkingAnalyzerScreen: React.FC<LiveWalkingAnalyzerScreenProps> = ({
  navigation,
}) => {
  const insets = useSafeAreaInsets();
  const {
    status,
    telemetry,
    permissionState,
    lastSummary,
    startTracking,
    pauseTracking,
    resumeTracking,
    finishTracking,
    requestPermissions,
    openBatterySettings,
  } = useWalkingTracker();

  const [summaryModalVisible, setSummaryModalVisible] = useState(false);
  const [showBatteryBanner, setShowBatteryBanner] = useState(true);

  const handleFinish = async () => {
    const summary = await finishTracking();
    if (summary) {
      setSummaryModalVisible(true);
    }
  };

  const handleDismissSummary = () => {
    setSummaryModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      {/* Floating Header */}
      <View style={[styles.headerContainer, { top: insets.top + 8 }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation?.goBack?.()}
          activeOpacity={0.8}
        >
          <ArrowLeft size={20} color="#1E293B" />
        </TouchableOpacity>

        <View style={styles.headerTitleBox}>
          <Text style={styles.headerTitle}>Walking Analyzer</Text>
          <Text style={styles.headerSubtitle}>Strava-Grade Engine</Text>
        </View>

        {/* Battery Optimization Indicator */}
        <TouchableOpacity
          style={styles.batteryPill}
          onPress={openBatterySettings}
          activeOpacity={0.8}
        >
          <BatteryCharging size={16} color={STRAVA_ORANGE} />
        </TouchableOpacity>
      </View>

      {/* OEM Battery Kill / Permissions Notice Banner */}
      {showBatteryBanner &&
        (!permissionState.canStartForegroundTracking ||
          permissionState.backgroundLocation !== 'granted') && (
          <View style={[styles.bannerContainer, { top: insets.top + 64 }]}>
            <View style={styles.bannerIconBox}>
              <ShieldAlert size={18} color="#EA580C" />
            </View>
            <View style={styles.bannerTextBox}>
              <Text style={styles.bannerTitle}>Screen-OFF Tracking Setup</Text>
              <Text style={styles.bannerBody}>
                Grant background location & battery exclusion so Samsung/Xiaomi task killers do not
                halt GPS when locked.
              </Text>
            </View>
            <TouchableOpacity
              style={styles.bannerActionButton}
              onPress={requestPermissions}
              activeOpacity={0.8}
            >
              <Text style={styles.bannerActionText}>Grant</Text>
            </TouchableOpacity>
          </View>
        )}

      {/* Live Google Map */}
      <View style={styles.mapContainer}>
        <LiveWalkingMap
          currentLocation={telemetry.currentLocation}
          routeCoordinates={telemetry.routeCoordinates}
          isTracking={status === 'tracking'}
          status={status}
        />
      </View>

      {/* Live Telemetry Floating HUD */}
      <View style={[styles.hudWrapper, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <LiveWalkingHUD
          status={status}
          telemetry={telemetry}
          onStart={startTracking}
          onPause={pauseTracking}
          onResume={resumeTracking}
          onFinish={handleFinish}
        />
      </View>

      {/* Session Finished Summary Modal */}
      <Modal
        visible={summaryModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={handleDismissSummary}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.summaryCard, { paddingBottom: Math.max(insets.bottom + 16, 24) }]}>
            <View style={styles.summaryDragIndicator} />

            <View style={styles.summaryHeader}>
              <CheckCircle size={32} color="#10B981" />
              <Text style={styles.summaryTitle}>Walk Completed!</Text>
              <Text style={styles.summarySubtitle}>
                {lastSummary?.sessionTitle || 'Morning Walk'}
              </Text>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={styles.summaryScroll}>
              {/* Big Distance Stat */}
              <View style={styles.summaryPrimaryMetric}>
                <Text style={styles.summaryPrimaryValue}>
                  {lastSummary ? (lastSummary.totalDistanceMeters / 1000).toFixed(2) : '0.00'}
                </Text>
                <Text style={styles.summaryPrimaryUnit}>KILOMETERS</Text>
              </View>

              {/* 4-Cell Analytics Matrix */}
              <View style={styles.summaryGrid}>
                <View style={styles.summaryGridCell}>
                  <Clock size={18} color="#64748B" />
                  <Text style={styles.summaryCellLabel}>Duration</Text>
                  <Text style={styles.summaryCellValue}>
                    {lastSummary ? Math.floor(lastSummary.activeDurationSeconds / 60) : 0}m{' '}
                    {lastSummary ? lastSummary.activeDurationSeconds % 60 : 0}s
                  </Text>
                </View>

                <View style={styles.summaryGridCell}>
                  <TrendingUp size={18} color="#64748B" />
                  <Text style={styles.summaryCellLabel}>Avg Pace</Text>
                  <Text style={styles.summaryCellValue}>
                    {lastSummary?.formattedAvgPace || '--:-- /km'}
                  </Text>
                </View>

                <View style={styles.summaryGridCell}>
                  <Flame size={18} color="#EA580C" />
                  <Text style={styles.summaryCellLabel}>Calories</Text>
                  <Text style={styles.summaryCellValue}>
                    {lastSummary?.estimatedCaloriesBurned || 0} kcal
                  </Text>
                </View>

                <View style={styles.summaryGridCell}>
                  <Zap size={18} color="#EAB308" />
                  <Text style={styles.summaryCellLabel}>Max Speed</Text>
                  <Text style={styles.summaryCellValue}>
                    {lastSummary?.maxSpeedKmh || 0} km/h
                  </Text>
                </View>
              </View>

              {/* Waypoint Fidelity Badge */}
              <View style={styles.fidelityCard}>
                <Award size={18} color={STRAVA_ORANGE} />
                <Text style={styles.fidelityText}>
                  Recorded {lastSummary?.routeCoordinates.length || 0} filtered GPS points with
                  unthrottled foreground service accuracy.
                </Text>
              </View>
            </ScrollView>

            <TouchableOpacity
              style={styles.summaryDoneButton}
              onPress={handleDismissSummary}
              activeOpacity={0.88}
            >
              <Text style={styles.summaryDoneButtonText}>SAVE & RETURN</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  headerContainer: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  headerTitleBox: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  headerSubtitle: {
    fontSize: 10,
    color: STRAVA_ORANGE,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  batteryPill: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  bannerContainer: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 25,
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FFEDD5',
    borderRadius: 14,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 4,
  },
  bannerIconBox: {
    marginRight: 10,
  },
  bannerTextBox: {
    flex: 1,
    marginRight: 8,
  },
  bannerTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#9A3412',
    marginBottom: 2,
  },
  bannerBody: {
    fontSize: 11,
    color: '#C2410C',
    lineHeight: 14,
  },
  bannerActionButton: {
    backgroundColor: '#EA580C',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  bannerActionText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  mapContainer: {
    flex: 1,
  },
  hudWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 12,
    maxHeight: '85%',
  },
  summaryDragIndicator: {
    width: 40,
    height: 4,
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  summaryHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0F172A',
    marginTop: 8,
  },
  summarySubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '600',
  },
  summaryScroll: {
    marginBottom: 16,
  },
  summaryPrimaryMetric: {
    alignItems: 'center',
    paddingVertical: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  summaryPrimaryValue: {
    fontSize: 48,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -1,
  },
  summaryPrimaryUnit: {
    fontSize: 12,
    fontWeight: '800',
    color: STRAVA_ORANGE,
    letterSpacing: 1.5,
    marginTop: 2,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  summaryGridCell: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  summaryCellLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    marginTop: 6,
  },
  summaryCellValue: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 2,
  },
  fidelityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF7ED',
    borderRadius: 12,
    padding: 12,
    gap: 10,
    marginBottom: 8,
  },
  fidelityText: {
    flex: 1,
    fontSize: 11,
    color: '#9A3412',
    lineHeight: 15,
    fontWeight: '600',
  },
  summaryDoneButton: {
    backgroundColor: STRAVA_ORANGE,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: STRAVA_ORANGE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  summaryDoneButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
