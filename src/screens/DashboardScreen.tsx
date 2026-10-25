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
  Flame,
  Zap,
  TrendingUp,
  Plus,
  Footprints,
  Camera,
  Dumbbell,
  Droplets,
  Trophy,
  Award,
  Sparkles,
  ChevronRight,
  User,
  Settings,
  CircleDot,
  Navigation,
} from 'lucide-react-native';
import AvfitLogo from '../components/common/AvfitLogo';
import { AuthService } from '../services/auth';
import { FitnessProfileService } from '../services/fitnessProfile';
import { AchievementService } from '../services/achievements';
import { ActivityService } from '../services/activityService';
import { TrophySummary, FitnessProfile, UserProfile, UserFitnessStats, RecordedActivity } from '../types';

export default function DashboardScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [fitnessProfile, setFitnessProfile] = useState<FitnessProfile | null>(null);
  const [trophySummary, setTrophySummary] = useState<TrophySummary | null>(null);
  const [userStats, setUserStats] = useState<UserFitnessStats | null>(null);
  const [recentActivities, setRecentActivities] = useState<RecordedActivity[]>([]);
  const [waterMl, setWaterMl] = useState(0);

  const fetchData = async () => {
    const u = await AuthService.getUserProfile();
    const f = await FitnessProfileService.getFitnessProfile();
    const t = await AchievementService.getTrophySummary();
    const s = await ActivityService.getUserStats();
    const acts = await ActivityService.getUserActivities();

    setUserProfile(u);
    setFitnessProfile(f);
    setTrophySummary(t);
    setUserStats(s);
    setRecentActivities(acts);
    setWaterMl(s.todayWaterMl || 0);
  };

  useEffect(() => {
    fetchData();
    const unsubscribe = navigation?.addListener?.('focus', () => {
      fetchData();
    });
    return unsubscribe;
  }, [navigation]);

  const addWater = () => {
    const targetMl = fitnessProfile?.dailyWaterMl || 2500;
    setWaterMl((prev) => {
      const nextVal = Math.min(prev + 250, targetMl);
      if (userProfile?.id) {
        ActivityService.getUserStats().then((st) => {
          st.todayWaterMl = nextVal;
        });
      }
      return nextVal;
    });
  };

  const streakDays = userProfile?.streakCount || 0;
  const userName = userProfile?.fullName ? userProfile.fullName.split(' ')[0] : 'Athlete';
  const isNewUser = (userStats?.totalActivities || 0) === 0;

  const calorieTarget = fitnessProfile?.dailyCalorieTarget || 2000;
  const proteinTarget = fitnessProfile?.dailyProteinG || 140;

  // Actual stats belonging strictly to THIS user
  const caloriesBurned = userStats?.todayCalories || 0;
  const totalDistance = userStats?.totalDistanceKm || 0;
  const totalActivities = userStats?.totalActivities || 0;
  const activeDurationMin = userStats?.totalDurationMinutes || 0;

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 16) }]}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      {/* Top Header Row with AVFIT Logo */}
      <View style={styles.topHeader}>
        {/* User Avatar - Tapping opens Profile Edit */}
        <TouchableOpacity
          style={styles.avatarContainer}
          onPress={() => navigation?.navigate?.('ProfileEdit')}
          activeOpacity={0.8}
        >
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarEmoji}>{userProfile?.avatarUrl || '🏃‍♂️'}</Text>
          </View>
        </TouchableOpacity>

        {/* Official AVFIT Brand Logo Badge */}
        <View style={styles.brandBadgePill}>
          <AvfitLogo size={28} showWordmark={true} />
        </View>

        {/* Quick Trophy Room Shortcut */}
        <TouchableOpacity
          style={styles.circleActionButton}
          onPress={() => navigation?.navigate?.('Achievements')}
          activeOpacity={0.8}
        >
          <Trophy size={18} color={Colors.accentOrange} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: 130 + insets.bottom },
        ]}
      >
        {/* Greeting & Streak Row */}
        <View style={styles.greetingRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.greetingTitle}>Hey, {userName}</Text>
            <Text style={styles.greetingSubtitle}>
              {isNewUser
                ? 'Welcome to AVFIT • Start your first workout!'
                : `Day ${streakDays} • Goal: ${fitnessProfile?.fitnessGoal === 'weight_loss' ? 'Weight Loss' : 'Muscle Tone'}`}
            </Text>
          </View>
          <View style={styles.streakPill}>
            <Flame size={16} color={Colors.accentOrange} fill={Colors.accentOrange} />
            <Text style={styles.streakNumber}>{streakDays} Days</Text>
          </View>
        </View>

        {/* Athletic Focus Hero Card */}
        <View style={styles.heroOverviewCard}>
          <View style={styles.heroCardHeader}>
            <View>
              <Text style={styles.heroOverline}>TODAY&apos;S FOCUS</Text>
              <Text style={styles.heroMainTitle}>
                {isNewUser ? 'Ready for Workout #1' : `${totalActivities} Sessions Completed`}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.heroActionPill}
              onPress={() => navigation?.navigate?.('Record')}
              activeOpacity={0.8}
            >
              <CircleDot size={14} color="#FFFFFF" />
              <Text style={styles.heroActionPillText}>Start GPS</Text>
            </TouchableOpacity>
          </View>

          {/* Quick Stat Highlights */}
          <View style={styles.heroMetricsSplitRow}>
            <View style={styles.heroMetricCol}>
              <Text style={styles.heroMetricValue}>{caloriesBurned}</Text>
              <Text style={styles.heroMetricLabel}>kcal burned</Text>
            </View>
            <View style={styles.heroDivider} />
            <View style={styles.heroMetricCol}>
              <Text style={styles.heroMetricValue}>{totalDistance.toFixed(1)}</Text>
              <Text style={styles.heroMetricLabel}>km total</Text>
            </View>
            <View style={styles.heroDivider} />
            <View style={styles.heroMetricCol}>
              <Text style={styles.heroMetricValue}>{activeDurationMin}</Text>
              <Text style={styles.heroMetricLabel}>active mins</Text>
            </View>
          </View>
        </View>

        {/* Personalized Nutrition Target Engine */}
        <View style={styles.nutritionEngineCard}>
          <View style={styles.nutritionEngineHeader}>
            <Text style={styles.engineTitle}>Personalized Nutrition Targets</Text>
            <TouchableOpacity onPress={() => navigation?.navigate?.('ProfileEdit')}>
              <Settings size={14} color={Colors.primary} />
            </TouchableOpacity>
          </View>
          <View style={styles.nutritionRow}>
            <View>
              <Text style={styles.engineVal}>{calorieTarget} kcal</Text>
              <Text style={styles.engineSub}>Daily Calorie Target</Text>
            </View>
            <View style={styles.nutritionPillBadge}>
              <Text style={styles.nutritionPillText}>{proteinTarget}g Protein</Text>
            </View>
          </View>
        </View>

        {/* Gamified Achievements & Trophy Room Card */}
        <TouchableOpacity
          style={styles.trophyBannerCard}
          onPress={() => navigation?.navigate?.('Achievements')}
          activeOpacity={0.88}
        >
          <View style={styles.trophyBannerTop}>
            <View style={styles.trophyIconWrap}>
              <Trophy size={20} color={Colors.primary} />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <View style={styles.trophyTitleRow}>
                <Text style={styles.trophyBannerTitle}>Trophy Room & Badges</Text>
                <View style={styles.pointsPill}>
                  <Text style={styles.pointsPillText}>{trophySummary?.totalPoints || 0} pts</Text>
                </View>
              </View>
              <Text style={styles.trophyBannerSub}>
                {trophySummary?.unlockedCount || 0} of {trophySummary?.totalTrophies || 23} Milestones Unlocked
              </Text>
            </View>
            <ChevronRight size={18} color={Colors.textSecondary} />
          </View>

          {/* Next Milestone Mini Track */}
          {trophySummary?.nextMilestone && (
            <View style={styles.nextMilestoneRow}>
              <Text style={styles.nextMilestoneText}>
                Next: <Text style={{ fontWeight: '700' }}>{trophySummary.nextMilestone.achievement?.title}</Text>
              </Text>
              <View style={styles.miniTrack}>
                <View
                  style={[
                    styles.miniTrackFill,
                    { width: `${trophySummary.nextMilestone.progressPercent}%` },
                  ]}
                />
              </View>
              <Text style={styles.miniTrackPercent}>
                {trophySummary.nextMilestone.progressPercent}%
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Recent Activities Feed or Callout */}
        {isNewUser ? (
          <TouchableOpacity
            style={styles.newWorkoutCallout}
            onPress={() => navigation?.navigate?.('Record')}
            activeOpacity={0.88}
          >
            <View style={styles.calloutIcon}>
              <Navigation size={22} color="#FFFFFF" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.calloutTitle}>Record Your First Workout</Text>
              <Text style={styles.calloutSub}>
                Track live distance, GPS route map, cadence, and pace.
              </Text>
            </View>
            <ChevronRight size={18} color="#FFFFFF" />
          </TouchableOpacity>
        ) : (
          <View style={styles.recentSection}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Your Recent Activities</Text>
              <TouchableOpacity onPress={() => navigation?.navigate?.('Record')}>
                <Text style={styles.seeAllText}>+ Record New</Text>
              </TouchableOpacity>
            </View>

            {recentActivities.slice(0, 3).map((act) => (
              <TouchableOpacity
                key={act.id}
                style={styles.activityItemCard}
                onPress={() => navigation?.navigate?.('ActivitySummary', { activity: act })}
                activeOpacity={0.8}
              >
                <View style={styles.activityItemIcon}>
                  <Text style={{ fontSize: 20 }}>
                    {act.sportType === 'cycling'
                      ? '🚴‍♂️'
                      : act.sportType === 'running'
                      ? '🏃‍♂️'
                      : act.sportType === 'weight_training'
                      ? '🏋️'
                      : act.sportType === 'hiking'
                      ? '🥾'
                      : '🚶‍♂️'}
                  </Text>
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.activityItemTitle}>{act.title}</Text>
                  <Text style={styles.activityItemMeta}>
                    {act.distanceKm > 0 ? `${act.distanceKm.toFixed(2)} km • ` : ''}
                    {Math.round(act.activeDurationSeconds / 60)} min • {act.caloriesBurned} kcal
                  </Text>
                </View>
                <Text style={styles.activityItemDate}>
                  {new Date(act.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Quick Action Goals */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Daily Goals & Logging</Text>
        </View>

        {/* Goal 1: Record Activity */}
        <TouchableOpacity
          style={styles.goalCard}
          onPress={() => navigation?.navigate?.('Record')}
          activeOpacity={0.8}
        >
          <View style={[styles.goalIconBox, { backgroundColor: '#E8F1EC' }]}>
            <CircleDot size={18} color={Colors.primary} />
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.goalTitle}>Record Outdoor Session</Text>
            <Text style={styles.goalMeta}>Live GPS route, pace, and calories</Text>
          </View>
          <View style={styles.statusProgressPill}>
            <Text style={styles.statusProgressText}>Start</Text>
          </View>
        </TouchableOpacity>

        {/* Goal 2: Food & Nutrition AI Scan */}
        <TouchableOpacity
          style={styles.goalCard}
          onPress={() => navigation?.navigate?.('FoodScanner')}
          activeOpacity={0.8}
        >
          <View style={[styles.goalIconBox, { backgroundColor: '#FDF1EC' }]}>
            <Camera size={18} color={Colors.accentOrange} />
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.goalTitle}>AI Food Macro Scanner</Text>
            <Text style={styles.goalMeta}>Scan plates to calculate macros</Text>
          </View>
          <View style={styles.statusCompletedPill}>
            <Text style={styles.statusCompletedText}>Scan</Text>
          </View>
        </TouchableOpacity>

        {/* Goal 3: Hydration Tracker */}
        <TouchableOpacity style={styles.goalCard} onPress={addWater} activeOpacity={0.8}>
          <View style={[styles.goalIconBox, { backgroundColor: '#E6F0FA' }]}>
            <Droplets size={18} color="#2A75A0" />
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.goalTitle}>Hydration Tracker</Text>
            <Text style={styles.goalMeta}>
              {waterMl} / {fitnessProfile?.dailyWaterMl || 2500} ml (+250 ml tap)
            </Text>
          </View>
          <View style={[styles.statusProgressPill, { backgroundColor: '#E6F0FA' }]}>
            <Text style={[styles.statusProgressText, { color: '#2A75A0' }]}>+250ml</Text>
          </View>
        </TouchableOpacity>
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
    paddingVertical: 8,
  },
  avatarContainer: {
    width: 38,
    height: 38,
  },
  avatarCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E8DFC8',
  },
  avatarEmoji: {
    fontSize: 20,
  },
  brandBadgePill: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E8DFC8',
    elevation: 1,
  },
  circleActionButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E8DFC8',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  greetingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 16,
  },
  greetingTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: Colors.textPrimary,
    letterSpacing: -0.3,
  },
  greetingSubtitle: {
    fontSize: 12.5,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  streakPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FDF1EC',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    gap: 4,
  },
  streakNumber: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.accentOrange,
  },
  heroOverviewCard: {
    backgroundColor: '#1C2B22',
    borderRadius: 22,
    padding: 18,
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  heroCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heroOverline: {
    fontSize: 10,
    fontWeight: '800',
    color: '#8A968E',
    letterSpacing: 0.8,
  },
  heroMainTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 2,
  },
  heroActionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.accentOrange,
    paddingVertical: 7,
    paddingHorizontal: 13,
    borderRadius: 16,
    gap: 6,
  },
  heroActionPillText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  heroMetricsSplitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 14,
    marginTop: 14,
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  heroMetricCol: {
    flex: 1,
    alignItems: 'center',
  },
  heroMetricValue: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  heroMetricLabel: {
    fontSize: 10,
    color: '#8A968E',
    fontWeight: '700',
    marginTop: 2,
  },
  heroDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  nutritionEngineCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E8DFC8',
    marginBottom: 14,
  },
  nutritionEngineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  engineTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  nutritionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  engineVal: {
    fontSize: 20,
    fontWeight: '900',
    color: Colors.primary,
  },
  engineSub: {
    fontSize: 11.5,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  nutritionPillBadge: {
    backgroundColor: '#E8F1EC',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 14,
  },
  nutritionPillText: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.primary,
  },
  trophyBannerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E8DFC8',
    marginBottom: 16,
  },
  trophyBannerTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trophyIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#E8F1EC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  trophyTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginRight: 6,
  },
  trophyBannerTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  pointsPill: {
    backgroundColor: '#FEF9C3',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  pointsPillText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#A16207',
  },
  trophyBannerSub: {
    fontSize: 11.5,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  nextMilestoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F0EBE1',
    gap: 8,
  },
  nextMilestoneText: {
    fontSize: 11,
    color: Colors.textSecondary,
    maxWidth: 140,
  },
  miniTrack: {
    flex: 1,
    height: 6,
    backgroundColor: '#E8DFC8',
    borderRadius: 3,
    overflow: 'hidden',
  },
  miniTrackFill: {
    height: '100%',
    backgroundColor: Colors.accentOrange,
    borderRadius: 3,
  },
  miniTrackPercent: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.accentOrange,
  },
  newWorkoutCallout: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    borderRadius: 18,
    padding: 16,
    marginBottom: 18,
    gap: 12,
  },
  calloutIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  calloutTitle: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  calloutSub: {
    fontSize: 11.5,
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: 2,
    lineHeight: 16,
  },
  recentSection: {
    marginBottom: 16,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  seeAllText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: Colors.primary,
  },
  activityItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E8DFC8',
    marginBottom: 8,
  },
  activityItemIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3EFE6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityItemTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  activityItemMeta: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  activityItemDate: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  goalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E8DFC8',
    marginBottom: 8,
  },
  goalIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  goalMeta: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  statusProgressPill: {
    backgroundColor: '#E8F1EC',
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  statusProgressText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: Colors.primary,
  },
  statusCompletedPill: {
    backgroundColor: '#FDF1EC',
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  statusCompletedText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: Colors.accentOrange,
  },
});
