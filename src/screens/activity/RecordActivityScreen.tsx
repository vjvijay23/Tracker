import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../theme/colors';
import { SportType, GPSPoint, HeartRateSummary, KmSplit, ActivityPrivacy } from '../../types';
import { ActivityService } from '../../services/activityService';
import { AuthService } from '../../services/auth';
import GoogleActivityMap from '../../components/map/GoogleActivityMap';
import GpsInfoPanel from '../../components/activity/GpsInfoPanel';
import {
  useLocationTracker,
  formatDuration,
} from '../../hooks/useLocationTracker';
import {
  Play,
  Pause,
  Square,
  Navigation,
  ChevronLeft,
  AlertTriangle,
  RotateCcw,
  Save,
  Trash2,
  CheckCircle2,
  Share2,
  Award,
} from 'lucide-react-native';

const SPORT_OPTIONS: { id: SportType; label: string; icon: string }[] = [
  { id: 'running', label: 'Run', icon: '🏃‍♂️' },
  { id: 'cycling', label: 'Ride', icon: '🚴‍♂️' },
  { id: 'walking', label: 'Walk', icon: '🚶‍♂️' },
  { id: 'hiking', label: 'Hike', icon: '🥾' },
  { id: 'weight_training', label: 'Gym', icon: '🏋️' },
];

export default function RecordActivityScreen({ route, navigation }: any) {
  const insets = useSafeAreaInsets();
  const initialSport = route?.params?.initialSport || 'running';
  const [selectedSport, setSelectedSport] = useState<SportType>(initialSport);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (route?.params?.initialSport) {
      setSelectedSport(route.params.initialSport);
    }
  }, [route?.params?.initialSport]);

  // Hook managing GPS permissions, location updates, Haversine distance, and filtering
  const {
    status,
    permissionState,
    errorMessage,
    currentLocation,
    routeCoordinates,
    totalDistanceKm,
    activeDurationSec,
    livePace,
    avgPace,
    gpsAccuracy,
    lastUpdateTime,
    pointsCount,
    workoutSteps,
    dailySteps,
    stepSensorAvailable,
    pauseEvents,
    sessionStartTime,
    requestPermissions,
    startTracking,
    pauseTracking,
    resumeTracking,
    stopTracking,
    resetTracking,
  } = useLocationTracker();

  // Calories burned calculation (~62 kcal per km for running)
  const caloriesBurned = ActivityService.estimateCaloriesBurned(selectedSport, activeDurationSec, 70);

  // Start activity
  const handleStart = () => {
    startTracking();
  };

  // Stop Activity Prompt
  const handleStopPrompt = () => {
    Alert.alert(
      'Stop Activity?',
      'Are you sure you want to stop this workout session? You can review, save, or discard your workout summary.',
      [
        { text: 'Keep Tracking', style: 'cancel' },
        {
          text: 'Stop Activity',
          style: 'destructive',
          onPress: () => {
            stopTracking();
          },
        },
      ]
    );
  };

  // Discard Session
  const handleDiscardPrompt = () => {
    Alert.alert(
      'Discard Session?',
      'Are you sure you want to discard this workout? The recorded GPS coordinates and distance will not be saved.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Discard Workout',
          style: 'destructive',
          onPress: () => {
            resetTracking();
            Alert.alert('Session Discarded', 'Your workout session was discarded.');
          },
        },
      ]
    );
  };

  // Save Completed Workout to User Profile and Database
  const handleSaveSession = async () => {
    try {
      setIsSaving(true);
      const user = await AuthService.getUserProfile();

      // Calculate kilometer splits from coordinates and duration
      const finalSplits = ActivityService.calculateSplits(
        activeDurationSec,
        totalDistanceKm,
        routeCoordinates,
        148
      );

      const sportLabel = SPORT_OPTIONS.find((s) => s.id === selectedSport)?.label || 'Workout';
      const defaultTitle = `Outdoor ${sportLabel} - ${new Date().toLocaleDateString([], {
        month: 'short',
        day: 'numeric',
      })}`;

      const { activity, newlyUnlockedTrophies } = await ActivityService.saveActivity({
        userId: user.id,
        sportType: selectedSport,
        title: defaultTitle,
        notes: `Recorded with high-accuracy GPS tracking. Total ${pointsCount} coordinates collected.`,
        startTime: new Date(sessionStartTime ?? (Date.now() - activeDurationSec * 1000)).toISOString(),
        endTime: new Date().toISOString(),
        durationSeconds: activeDurationSec,
        activeDurationSeconds: activeDurationSec,
        elapsedDurationSeconds: sessionStartTime ? Math.floor((Date.now() - sessionStartTime) / 1000) : activeDurationSec,
        totalSteps: stepSensorAvailable ? workoutSteps : undefined,
        pauseEvents,
        avgSpeedKmh: activeDurationSec > 0 ? totalDistanceKm / activeDurationSec * 3600 : 0,
        avgPaceSecPerKm: totalDistanceKm > 0 ? Math.round(activeDurationSec / totalDistanceKm) : undefined,
        distanceKm: totalDistanceKm,
        caloriesBurned,
        routeCoordinates,
        splits: finalSplits,
        privacy: 'followers',
      });

      setIsSaving(false);

      // Navigate to summary screen or back to main
      Alert.alert(
        'Workout Saved!',
        `Your ${totalDistanceKm.toFixed(2)} km ${sportLabel.toLowerCase()} session has been saved to your profile.`,
        [
          {
            text: 'View Summary',
            onPress: () => {
              resetTracking();
              navigation.navigate('ActivitySummary', {
                sportType: selectedSport,
                title: defaultTitle,
                saved: true,
                startTime: sessionStartTime,
                totalSteps: stepSensorAvailable ? workoutSteps : undefined,
                pauseEvents,
                activeDurationSec,
                elapsedDurationSec: activeDurationSec,
                distanceKm: totalDistanceKm,
                caloriesBurned,
                routePoints: routeCoordinates,
                splits: finalSplits,
              });
            },
          },
          {
            text: 'Dashboard',
            onPress: () => {
              resetTracking();
              navigation.navigate('Main');
            },
          },
        ]
      );
    } catch (err: any) {
      setIsSaving(false);
      Alert.alert('Save Failed', err?.message || 'Could not save your workout.');
    }
  };

  const isRecording = status === 'recording';
  const isPaused = status === 'paused';
  const isStopped = status === 'stopped';
  const isTracking = isRecording || isPaused;

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 16) }]}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      {/* Top Navigation Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => {
            if (isTracking) {
              Alert.alert('Tracking in Progress', 'Please stop or pause your workout before leaving.', [
                { text: 'Keep Tracking', style: 'cancel' },
                {
                  text: 'Stop & Exit',
                  style: 'destructive',
                  onPress: () => {
                    stopTracking();
                    navigation.goBack();
                  },
                },
              ]);
            } else {
              navigation.goBack();
            }
          }}
        >
          <ChevronLeft size={22} color={Colors.textPrimary} />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Google Maps Tracker</Text>

        {/* GPS Live Status Indicator */}
        <View style={styles.gpsStatusIndicator}>
          <View
            style={[
              styles.gpsDot,
              isRecording
                ? styles.gpsDotActive
                : status === 'ready'
                ? styles.gpsDotReady
                : styles.gpsDotAmber,
            ]}
          />
          <Text style={styles.gpsIndicatorText}>
            {isRecording ? 'LIVE GPS' : status === 'ready' ? 'READY' : 'LOCATING'}
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Permission Denied / Error Banner */}
        {errorMessage && (
          <View style={styles.errorBanner}>
            <AlertTriangle size={18} color="#D97706" />
            <Text style={styles.errorBannerText}>{errorMessage}</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={requestPermissions}>
              <Text style={styles.retryBtnText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Sport Type Selector (visible before tracking starts) */}
        {!isTracking && !isStopped && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.sportScroll}>
            {SPORT_OPTIONS.map((sport) => {
              const active = selectedSport === sport.id;
              return (
                <TouchableOpacity
                  key={sport.id}
                  style={[styles.sportPill, active && styles.sportPillActive]}
                  onPress={() => setSelectedSport(sport.id)}
                >
                  <Text style={styles.sportIcon}>{sport.icon}</Text>
                  <Text style={[styles.sportLabel, active && styles.sportLabelActive]}>
                    {sport.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}

        {/* INTERACTIVE GOOGLE MAP (MAIN FOCUS OF THE SCREEN) */}
        <View style={styles.mapHeroCard}>
          <GoogleActivityMap
            currentLocation={currentLocation}
            routeCoordinates={routeCoordinates}
            isTracking={isTracking}
            status={status}
            height={360}
          />
        </View>

        {/* LIVE GPS INFORMATION PANEL */}
        <GpsInfoPanel
          latitude={currentLocation?.latitude ?? null}
          longitude={currentLocation?.longitude ?? null}
          accuracy={gpsAccuracy}
          lastUpdateTime={lastUpdateTime}
          status={status}
          isTracking={isTracking}
        />

        {/* WORKOUT METRICS SUMMARY / HUD */}
        <View style={styles.metricsCard}>
          {/* Main Hero Distance */}
          <View style={styles.heroDistanceBox}>
            <Text style={styles.heroDistanceNumber}>
              {totalDistanceKm > 0 ? totalDistanceKm.toFixed(2) : '0.00'}
            </Text>
            <Text style={styles.heroDistanceUnit}>KILOMETERS (APPROX.)</Text>
          </View>

          {/* 3-Column Shelf: Duration | Live Pace | Calories */}
          <View style={styles.metricShelfRow}>
            <View style={styles.shelfItem}>
              <Text style={styles.shelfLabel}>DURATION</Text>
              <Text style={styles.shelfValue}>{formatDuration(activeDurationSec)}</Text>
            </View>

            <View style={styles.shelfDivider} />

            <View style={styles.shelfItem}>
              <Text style={styles.shelfLabel}>LIVE PACE</Text>
              <Text style={[styles.shelfValue, { color: Colors.accentOrange }]}>{livePace}</Text>
            </View>

            <View style={styles.shelfDivider} />

            <View style={styles.shelfItem}>
              <Text style={styles.shelfLabel}>CALORIES</Text>
              <Text style={styles.shelfValue}>{caloriesBurned} kcal</Text>
            </View>
          </View>

          {/* Secondary Row: Steps | GPS points */}
          <View style={styles.secondaryShelfRow}>
            <View style={styles.shelfItem}>
              <Text style={styles.shelfLabel}>WORKOUT STEPS</Text>
              <Text style={styles.shelfValueSmall}>{stepSensorAvailable === false ? 'Unavailable' : workoutSteps.toLocaleString()}</Text>
            </View>

            <View style={styles.shelfDivider} />

            <View style={styles.shelfItem}>
              <Text style={styles.shelfLabel}>CADENCE</Text>
              <Text style={styles.shelfValueSmall}>{activeDurationSec > 0 && stepSensorAvailable ? Math.round(workoutSteps / (activeDurationSec / 60)) : '--'} spm</Text>
            </View>
          </View>
        </View>

        <Text style={styles.shelfLabel}>DAILY STEPS  {dailySteps == null ? 'Unavailable on this device' : dailySteps.toLocaleString()}</Text>

        {/* WORKOUT SUMMARY ACTIONS (WHEN STOPPED) */}
        {isStopped && (
          <View style={styles.stoppedSummaryCard}>
            <View style={styles.stoppedHeaderRow}>
              <CheckCircle2 size={20} color={Colors.primary} />
              <Text style={styles.stoppedTitle}>Workout Session Complete</Text>
            </View>
            <Text style={styles.stoppedSub}>
              Review your route above. Save to persist this activity in your activity history and
              update your dashboard statistics, or discard to cancel.
            </Text>

            <View style={styles.summaryBtnRow}>
              <TouchableOpacity
                style={styles.discardBtn}
                onPress={handleDiscardPrompt}
                disabled={isSaving}
              >
                <Trash2 size={16} color="#DC2626" />
                <Text style={styles.discardBtnText}>Discard Activity</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.saveBtn}
                onPress={handleSaveSession}
                disabled={isSaving}
              >
                {isSaving ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Save size={16} color="#FFFFFF" />
                    <Text style={styles.saveBtnText}>Save Activity</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={{ height: 110 }} />
      </ScrollView>

      {/* BOTTOM CONTROLS DOCK */}
      {!isStopped && (
        <View style={[styles.bottomDock, { bottom: Math.max(insets.bottom, 16) }]}>
          {!isTracking ? (
            <TouchableOpacity
              style={styles.startBtn}
              onPress={handleStart}
              activeOpacity={0.8}
            >
              <Play size={20} color="#FFFFFF" fill="#FFFFFF" />
              <Text style={styles.startBtnText}>
                {selectedSport === 'running'
                  ? 'Start Running'
                  : selectedSport === 'walking'
                  ? 'Start Walking'
                  : selectedSport === 'cycling'
                  ? 'Start Cycling'
                  : selectedSport === 'hiking'
                  ? 'Start Hiking'
                  : 'Start Workout'}
              </Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.activeBtnRow}>
              {/* Pause / Resume */}
              <TouchableOpacity
                style={[styles.pauseBtn, isPaused && styles.resumeBtn]}
                onPress={isPaused ? resumeTracking : pauseTracking}
              >
                {isPaused ? (
                  <>
                    <Play size={18} color="#FFFFFF" fill="#FFFFFF" />
                    <Text style={styles.resumeBtnText}>Resume Activity</Text>
                  </>
                ) : (
                  <>
                    <Pause size={18} color={Colors.textPrimary} />
                    <Text style={styles.pauseBtnText}>Pause Activity</Text>
                  </>
                )}
              </TouchableOpacity>

              {/* Finish Activity */}
              <TouchableOpacity style={styles.stopBtn} onPress={handleStopPrompt}>
                <Square size={18} color="#FFFFFF" fill="#FFFFFF" />
                <Text style={styles.stopBtnText}>Finish Activity</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderSubtle,
    backgroundColor: Colors.background,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginLeft: 2,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  gpsStatusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
  },
  gpsDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    marginRight: 6,
  },
  gpsDotActive: {
    backgroundColor: Colors.accentOrange,
  },
  gpsDotReady: {
    backgroundColor: '#10B981',
  },
  gpsDotAmber: {
    backgroundColor: '#F59E0B',
  },
  gpsIndicatorText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: 0.5,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  errorBanner: {
    backgroundColor: '#FEF3C7',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  errorBannerText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    color: '#92400E',
    marginLeft: 8,
    lineHeight: 16,
  },
  retryBtn: {
    backgroundColor: '#D97706',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    marginLeft: 8,
  },
  retryBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  sportScroll: {
    marginBottom: 12,
  },
  sportPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
  },
  sportPillActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  sportIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  sportLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  sportLabelActive: {
    color: '#FFFFFF',
  },
  mapHeroCard: {
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 12,
  },
  metricsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    marginBottom: 12,
  },
  heroDistanceBox: {
    alignItems: 'center',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderSubtle,
  },
  heroDistanceNumber: {
    fontSize: 54,
    fontWeight: '900',
    color: Colors.primary,
    letterSpacing: -1.5,
    lineHeight: 60,
  },
  heroDistanceUnit: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.textSecondary,
    letterSpacing: 1.5,
    marginTop: 2,
  },
  metricShelfRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
  },
  secondaryShelfRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.borderSubtle,
    paddingTop: 14,
  },
  shelfItem: {
    flex: 1,
    alignItems: 'center',
  },
  shelfLabel: {
    fontSize: 9.5,
    fontWeight: '800',
    color: Colors.textSecondary,
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  shelfValue: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  shelfValueSmall: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  shelfDivider: {
    width: 1,
    height: 30,
    backgroundColor: Colors.borderSubtle,
  },
  stoppedSummaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.primary,
    marginBottom: 16,
  },
  stoppedHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  stoppedTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.primary,
  },
  stoppedSub: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 18,
    marginBottom: 14,
  },
  summaryBtnRow: {
    flexDirection: 'row',
    gap: 10,
  },
  discardBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEE2E2',
    height: 48,
    borderRadius: 16,
    gap: 6,
  },
  discardBtnText: {
    color: '#DC2626',
    fontSize: 14,
    fontWeight: '800',
  },
  saveBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    height: 48,
    borderRadius: 16,
    gap: 6,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  bottomDock: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: Colors.borderSubtle,
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 28 : 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 8,
  },
  startBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 28,
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  startBtnDisabled: {
    opacity: 0.7,
  },
  startBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  activeBtnRow: {
    flexDirection: 'row',
    gap: 12,
  },
  pauseBtn: {
    flex: 1,
    backgroundColor: Colors.surfaceWarm,
    borderRadius: 24,
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  resumeBtn: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  pauseBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  resumeBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  stopBtn: {
    flex: 1,
    backgroundColor: Colors.accentOrange,
    borderRadius: 24,
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: Colors.accentOrange,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 3,
  },
  stopBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});
