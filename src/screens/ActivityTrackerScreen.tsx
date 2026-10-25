import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../theme/colors';
import {
  SportType,
  RecordedActivity,
  UserFitnessStats,
  UserProfile,
} from '../types';
import { ActivityService } from '../services/activityService';
import { AuthService } from '../services/auth';
import AvfitLogo from '../components/common/AvfitLogo';
import {
  Navigation,
  Play,
  TrendingUp,
  Flame,
  Clock,
  MapPin,
  ChevronRight,
  Sparkles,
  Trophy,
  Compass,
} from 'lucide-react-native';

const SPORT_OPTIONS: { id: SportType; label: string; icon: string; actionLabel: string }[] = [
  { id: 'running', label: 'Run', icon: '🏃‍♂️', actionLabel: 'Start Running' },
  { id: 'walking', label: 'Walk', icon: '🚶‍♂️', actionLabel: 'Start Walking' },
  { id: 'cycling', label: 'Ride', icon: '🚴‍♂️', actionLabel: 'Start Cycling' },
  { id: 'hiking', label: 'Hike', icon: '🥾', actionLabel: 'Start Hiking' },
  { id: 'weight_training', label: 'Gym', icon: '🏋️', actionLabel: 'Start Workout' },
];

export default function ActivityTrackerScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const [selectedSport, setSelectedSport] = useState<SportType>('running');
  const [userStats, setUserStats] = useState<UserFitnessStats | null>(null);
  const [activities, setActivities] = useState<RecordedActivity[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  const loadData = async () => {
    const stats = await ActivityService.getUserStats();
    const list = await ActivityService.getUserActivities();
    const profile = await AuthService.getUserProfile();
    setUserStats(stats);
    setActivities(list);
    setUserProfile(profile);
  };

  useEffect(() => {
    loadData();
    const unsubscribe = navigation?.addListener?.('focus', () => {
      loadData();
    });
    return unsubscribe;
  }, [navigation]);

  const activeSportConfig = SPORT_OPTIONS.find((s) => s.id === selectedSport) || SPORT_OPTIONS[0];

  const handleStartActivity = () => {
    if (selectedSport === 'walking') {
      navigation.navigate('LiveWalkingAnalyzer');
      return;
    }
    navigation.navigate('RecordActivity', { initialSport: selectedSport });
  };

  const caloriesBurned = userStats?.todayCalories || 0;
  const totalDistance = userStats?.totalDistanceKm || 0;
  const activeDuration = userStats?.totalDurationMinutes || 0;
  const totalCompleted = userStats?.totalActivities || 0;

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 16) }]}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      {/* Screen Header */}
      <View style={styles.topHeader}>
        <AvfitLogo size={32} showWordmark={true} />
        <TouchableOpacity
          style={styles.profileBadge}
          onPress={() => navigation?.navigate?.('ProfileEdit')}
          activeOpacity={0.8}
        >
          <Text style={styles.avatarEmoji}>{userProfile?.avatarUrl || '🏃‍♂️'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: 130 + insets.bottom },
        ]}
      >
        {/* Title & Introduction */}
        <View style={styles.titleSection}>
          <Text style={styles.pageTitle}>Record & Track</Text>
          <Text style={styles.pageSubtitle}>
            GPS-calibrated route tracking, distance, and real-time pace.
          </Text>
        </View>

        {/* Activity Category Selector Pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.sportSelectorScroll}
        >
          {SPORT_OPTIONS.map((sport) => {
            const isSelected = selectedSport === sport.id;
            return (
              <TouchableOpacity
                key={sport.id}
                style={[
                  styles.sportPill,
                  isSelected && styles.sportPillSelected,
                ]}
                onPress={() => setSelectedSport(sport.id)}
                activeOpacity={0.8}
              >
                <Text style={styles.sportPillIcon}>{sport.icon}</Text>
                <Text
                  style={[
                    styles.sportPillLabel,
                    isSelected && styles.sportPillLabelSelected,
                  ]}
                >
                  {sport.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Primary Hero Tracking Card (Integrated naturally) */}
        <View style={styles.heroActionCard}>
          <View style={styles.heroCardHeader}>
            <View style={styles.heroSportBadge}>
              <Text style={{ fontSize: 24 }}>{activeSportConfig.icon}</Text>
              <View style={{ marginLeft: 10 }}>
                <Text style={styles.heroSportTitle}>{activeSportConfig.label} Tracking</Text>
                <Text style={styles.heroSportSub}>Live GPS route & cadence</Text>
              </View>
            </View>

            {/* GPS Signal Status Badge */}
            <View style={styles.gpsStatusPill}>
              <View style={styles.gpsGreenDot} />
              <Text style={styles.gpsStatusText}>GPS Ready</Text>
            </View>
          </View>

          {/* Quick Metrics HUD Preview */}
          <View style={styles.heroMetricsGrid}>
            <View style={styles.heroMetricBox}>
              <Text style={styles.heroMetricLabel}>TARGET</Text>
              <Text style={styles.heroMetricValue}>Open Run</Text>
            </View>
            <View style={styles.heroMetricDivider} />
            <View style={styles.heroMetricBox}>
              <Text style={styles.heroMetricLabel}>AVG PACE</Text>
              <Text style={styles.heroMetricValue}>
                {activities.length > 0 && activities[0].avgPaceSecPerKm
                  ? `${Math.floor(activities[0].avgPaceSecPerKm / 60)}:${(activities[0].avgPaceSecPerKm % 60).toString().padStart(2, '0')} /km`
                  : '--:--'}
              </Text>
            </View>
            <View style={styles.heroMetricDivider} />
            <View style={styles.heroMetricBox}>
              <Text style={styles.heroMetricLabel}>SENSOR</Text>
              <Text style={styles.heroMetricValue}>High Accuracy</Text>
            </View>
          </View>

          {/* Explicit Start Action Button */}
          <TouchableOpacity
            style={styles.startActionButton}
            onPress={handleStartActivity}
            activeOpacity={0.85}
          >
            <View style={styles.playIconCircle}>
              <Play size={18} color={Colors.primary} fill={Colors.primary} />
            </View>
            <Text style={styles.startActionText}>{activeSportConfig.actionLabel}</Text>
          </TouchableOpacity>
        </View>

        {/* Strava Engine Live Walking Analyzer Launcher */}
        <TouchableOpacity
          style={styles.walkingAnalyzerBanner}
          onPress={() => navigation.navigate('LiveWalkingAnalyzer')}
          activeOpacity={0.88}
        >
          <View style={styles.walkingAnalyzerIconCircle}>
            <Navigation size={18} color="#FFFFFF" />
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.walkingAnalyzerTitle}>Live Walking Analyzer</Text>
              <View style={styles.stravaEngineBadge}>
                <Text style={styles.stravaEngineBadgeText}>STRAVA ENGINE</Text>
              </View>
            </View>
            <Text style={styles.walkingAnalyzerSub}>
              Screen-OFF background tracking • Fused GPS • Live Pace HUD
            </Text>
          </View>
          <ChevronRight size={18} color="#94A3B8" />
        </TouchableOpacity>

        {/* Authenticated User's Real Daily Fitness Summary */}
        <View style={styles.dailySummaryCard}>
          <View style={styles.summaryTitleRow}>
            <TrendingUp size={16} color={Colors.primary} />
            <Text style={styles.summaryTitle}>Your Recorded Progress</Text>
          </View>

          <View style={styles.summaryMetricsRow}>
            {/* Calories Burned */}
            <View style={styles.summaryMetricItem}>
              <View style={styles.summaryIconCircle}>
                <Flame size={16} color={Colors.accentOrange} />
              </View>
              <Text style={styles.summaryMetricNumber}>{caloriesBurned}</Text>
              <Text style={styles.summaryMetricUnit}>kcal burned</Text>
            </View>

            <View style={styles.summaryDivider} />

            {/* Total Distance */}
            <View style={styles.summaryMetricItem}>
              <View style={[styles.summaryIconCircle, { backgroundColor: '#E8F1EC' }]}>
                <MapPin size={16} color={Colors.primary} />
              </View>
              <Text style={styles.summaryMetricNumber}>{totalDistance.toFixed(1)}</Text>
              <Text style={styles.summaryMetricUnit}>km total</Text>
            </View>

            <View style={styles.summaryDivider} />

            {/* Active Minutes */}
            <View style={styles.summaryMetricItem}>
              <View style={[styles.summaryIconCircle, { backgroundColor: '#F3E8FF' }]}>
                <Clock size={16} color="#7E22CE" />
              </View>
              <Text style={styles.summaryMetricNumber}>{activeDuration}</Text>
              <Text style={styles.summaryMetricUnit}>active mins</Text>
            </View>
          </View>
        </View>

        {/* Activity History Section */}
        <View style={styles.historySection}>
          <View style={styles.historyHeaderRow}>
            <Text style={styles.historyTitle}>Activity History</Text>
            <Text style={styles.historyCountText}>{totalCompleted} sessions</Text>
          </View>

          {activities.length === 0 ? (
            /* Clean Empty State for New Users */
            <View style={styles.emptyStateContainer}>
              <View style={styles.emptyStateIconCircle}>
                <Text style={{ fontSize: 32 }}>🏃‍♂️</Text>
              </View>
              <Text style={styles.emptyStateTitle}>No activities recorded yet</Text>
              <Text style={styles.emptyStateSubtitle}>
                Tap &ldquo;{activeSportConfig.actionLabel}&rdquo; above to record your first outdoor GPS route.
              </Text>
            </View>
          ) : (
            /* Real Activity History Cards */
            activities.map((act) => {
              const sportInfo =
                SPORT_OPTIONS.find((s) => s.id === act.sportType) || SPORT_OPTIONS[0];
              const dateStr = new Date(act.startTime).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
              });
              const mins = Math.floor(act.activeDurationSeconds / 60);
              const paceTotal = act.avgPaceSecPerKm || 0;
              const paceMin = Math.floor(paceTotal / 60);
              const paceSec = (paceTotal % 60).toString().padStart(2, '0');

              return (
                <TouchableOpacity
                  key={act.id}
                  style={styles.activityItemCard}
                  onPress={() => navigation.navigate('ActivitySummary', { activity: act })}
                  activeOpacity={0.8}
                >
                  <View style={styles.activitySportBadge}>
                    <Text style={{ fontSize: 20 }}>{sportInfo.icon}</Text>
                  </View>
                  <View style={styles.activityMainInfo}>
                    <Text style={styles.activityTitleText}>{act.title}</Text>
                    <Text style={styles.activityMetaText}>
                      {dateStr} • {mins} mins • {act.caloriesBurned} kcal
                    </Text>
                  </View>
                  <View style={styles.activityRightStats}>
                    <Text style={styles.activityDistanceText}>
                      {act.distanceKm.toFixed(2)} km
                    </Text>
                    <Text style={styles.activityPaceText}>{paceMin}:{paceSec} /km</Text>
                  </View>
                  <ChevronRight size={16} color={Colors.textSecondary} style={{ marginLeft: 6 }} />
                </TouchableOpacity>
              );
            })
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  profileBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E8DFC8',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  avatarEmoji: {
    fontSize: 20,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  titleSection: {
    marginTop: 6,
    marginBottom: 16,
  },
  pageTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  pageSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 3,
    lineHeight: 18,
  },
  sportSelectorScroll: {
    gap: 10,
    paddingBottom: 16,
  },
  sportPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#E8DFC8',
  },
  sportPillSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  sportPillIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  sportPillLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  sportPillLabelSelected: {
    color: '#FFFFFF',
  },
  heroActionCard: {
    backgroundColor: '#1C2B22', // Charcoal forest finish
    borderRadius: 24,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    marginBottom: 20,
  },
  heroCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heroSportBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroSportTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  heroSportSub: {
    fontSize: 12,
    color: '#A0ABA4',
    marginTop: 1,
  },
  gpsStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(36, 74, 50, 0.7)',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(56, 225, 255, 0.3)',
  },
  gpsGreenDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#34D399',
    marginRight: 6,
  },
  gpsStatusText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  heroMetricsGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 16,
    marginVertical: 18,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  heroMetricBox: {
    flex: 1,
    alignItems: 'center',
  },
  heroMetricLabel: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#8A968E',
    letterSpacing: 0.6,
  },
  heroMetricValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 3,
  },
  heroMetricDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  startActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.accentOrange,
    paddingVertical: 14,
    borderRadius: 18,
    elevation: 3,
    shadowColor: Colors.accentOrange,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
  },
  playIconCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  startActionText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  dailySummaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E8DFC8',
    marginBottom: 20,
  },
  summaryTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  summaryMetricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  summaryMetricItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FDF1EC',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  summaryMetricNumber: {
    fontSize: 18,
    fontWeight: '900',
    color: Colors.textPrimary,
  },
  summaryMetricUnit: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '600',
    marginTop: 1,
  },
  summaryDivider: {
    width: 1,
    height: 36,
    backgroundColor: '#E8DFC8',
  },
  historySection: {
    marginTop: 4,
  },
  historyHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  historyTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  historyCountText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  emptyStateContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E8DFC8',
    padding: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  emptyStateIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F3EFE6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyStateTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  emptyStateSubtitle: {
    fontSize: 12.5,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
    maxWidth: 260,
  },
  activityItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E8DFC8',
    marginBottom: 10,
  },
  activitySportBadge: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#F3EFE6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  activityMainInfo: {
    flex: 1,
  },
  activityTitleText: {
    fontSize: 14.5,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  activityMetaText: {
    fontSize: 11.5,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  activityRightStats: {
    alignItems: 'flex-end',
  },
  activityDistanceText: {
    fontSize: 14.5,
    fontWeight: '800',
    color: Colors.primary,
  },
  activityPaceText: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  walkingAnalyzerBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#FC520025',
    marginBottom: 16,
    shadowColor: '#FC5200',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  walkingAnalyzerIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FC5200',
    alignItems: 'center',
    justifyContent: 'center',
  },
  walkingAnalyzerTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  stravaEngineBadge: {
    backgroundColor: '#FC520015',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 6,
  },
  stravaEngineBadgeText: {
    color: '#FC5200',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  walkingAnalyzerSub: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
});
