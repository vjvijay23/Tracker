import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StatusBar,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../theme/colors';
import {
  SportType,
  ActivityPrivacy,
  HeartRateSummary,
  AchievementDefinition,
  KmSplit,
  GPSPoint,
  RecordedActivity,
} from '../../types';
import { ActivityService } from '../../services/activityService';
import { AuthService } from '../../services/auth';
import { UserStore } from '../../services/userStore';
import TrophyUnlockModal from '../../components/achievements/TrophyUnlockModal';
import InbuiltRouteMap from '../../components/map/InbuiltRouteMap';
import KilometerSplitsTable from '../../components/activity/KilometerSplitsTable';
import {
  ChevronLeft,
  Share2,
  MoreHorizontal,
  Award,
  Lock,
  Globe,
  Users,
  Save,
  CheckCircle2,
} from 'lucide-react-native';

const SPORT_NAMES: Record<SportType, string> = {
  running: 'Run',
  cycling: 'Ride',
  walking: 'Walk',
  hiking: 'Hike',
  weight_training: 'Gym Workout',
};

export default function ActivitySummaryScreen({ route, navigation }: any) {
  const insets = useSafeAreaInsets();
  const params = route.params || {};
  const activity: RecordedActivity | undefined = params.activity;

  const sportType: SportType = params.sportType ?? activity?.sportType ?? 'running';
  const [title, setTitle] = useState<string>(params.title ?? activity?.title ?? 'Outdoor Workout');
  const [description, setDescription] = useState<string>(
    params.description ?? activity?.notes ?? ''
  );
  const [privacy, setPrivacy] = useState<ActivityPrivacy>(activity?.privacy ?? 'followers');
  const [isSaving, setIsSaving] = useState(false);
  const [unlockedTrophies, setUnlockedTrophies] = useState<AchievementDefinition[]>([]);
  const [currentModalTrophy, setCurrentModalTrophy] = useState<AchievementDefinition | null>(null);

  // Stats
  const activeDurationSec = params.activeDurationSec ?? activity?.activeDurationSeconds ?? 0;
  const elapsedDurationSec = params.elapsedDurationSec ?? activity?.elapsedDurationSeconds ?? activity?.durationSeconds ?? activeDurationSec;
  const distanceKm = params.distanceKm ?? activity?.distanceKm ?? 0;
  const caloriesBurned = params.caloriesBurned ?? activity?.caloriesBurned ?? 0;
  const heartRate: HeartRateSummary | undefined = params.heartRate ?? activity?.heartRate;
  const splits: KmSplit[] = params.splits ?? activity?.splits ?? [];
  const elevationGainMeters = params.elevationGainMeters ?? activity?.elevationGainMeters;
  const totalSteps = params.totalSteps ?? activity?.totalSteps;
  const isSavedWorkout = params.saved === true || !!activity;

  const routePoints: GPSPoint[] = params.routePoints ?? activity?.routeCoordinates ?? [];

  // Pace calculations (3:45 /km)
  const calcAvgPace = () => {
    if (distanceKm <= 0) return '--:-- /km';
    const totalSecPerKm = Math.round(activeDurationSec / distanceKm);
    const mins = Math.floor(totalSecPerKm / 60);
    const secs = totalSecPerKm % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs} /km`;
  };

  const formatDuration = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleSaveActivity = async () => {
    try {
      setIsSaving(true);
      const user = await AuthService.getUserProfile();

      const { activity: savedActivity, newlyUnlockedTrophies } = await ActivityService.saveActivity({
        userId: user.id,
        sportType,
        title: title.trim() || 'Outdoor Workout',
        notes: description.trim(),
        startTime: params.startTime ? new Date(params.startTime).toISOString() : activity?.startTime ?? new Date(Date.now() - activeDurationSec * 1000).toISOString(),
        endTime: new Date().toISOString(),
        durationSeconds: elapsedDurationSec,
        activeDurationSeconds: activeDurationSec,
        elapsedDurationSeconds: elapsedDurationSec,
        totalSteps,
        pauseEvents: params.pauseEvents ?? activity?.pauseEvents,
        distanceKm,
        caloriesBurned,
        elevationGainMeters,
        heartRate,
        routeCoordinates: routePoints,
        splits,
        privacy,
      });

      setIsSaving(false);

      if (newlyUnlockedTrophies && newlyUnlockedTrophies.length > 0) {
        setUnlockedTrophies(newlyUnlockedTrophies);
        setCurrentModalTrophy(newlyUnlockedTrophies[0]);
      } else {
        Alert.alert('Activity Saved!', 'Your workout stats have been added to your profile.', [
          { text: 'View Dashboard', onPress: () => navigation.navigate('Main') },
        ]);
      }
    } catch (e: any) {
      setIsSaving(false);
      Alert.alert('Save Failed', e?.message || 'Could not save workout.');
    }
  };

  const handleTrophyModalClose = () => {
    if (unlockedTrophies.length > 1) {
      const remaining = unlockedTrophies.slice(1);
      setUnlockedTrophies(remaining);
      setCurrentModalTrophy(remaining[0]);
    } else {
      setCurrentModalTrophy(null);
      navigation.navigate('Main');
    }
  };

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 16) }]}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      {/* Top Header */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.navBackBtn} onPress={() => navigation.goBack()}>
          <ChevronLeft size={22} color={Colors.textPrimary} />
          <Text style={styles.navBackText}>Back</Text>
        </TouchableOpacity>

        <Text style={styles.navTitle}>{SPORT_NAMES[sportType]}</Text>

        <View style={styles.navActions}>
          <TouchableOpacity style={styles.navIconBtn}>
            <Share2 size={20} color={Colors.textPrimary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.navIconBtn}>
            <MoreHorizontal size={20} color={Colors.textPrimary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 130 + insets.bottom }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Athlete Header */}
        <View style={styles.athleteRow}>
          <View style={styles.athleteAvatar}>
            <Text style={styles.athleteAvatarEmoji}>🏃‍♂️</Text>
          </View>
          <View style={styles.athleteMeta}>
            <Text style={styles.athleteName}>Workout summary</Text>
            <Text style={styles.athleteDate}>
              {activity?.startTime || params.startTime ? new Date(activity?.startTime ?? params.startTime).toLocaleString() : new Date().toLocaleString()}
            </Text>
          </View>
        </View>

        {/* Title & Notes */}
        <View style={styles.titleSection}>
          <TextInput
            style={styles.activityTitleInput}
            value={title}
            onChangeText={setTitle}
            placeholder="Name your workout"
            placeholderTextColor={Colors.textMuted}
          />
          <TextInput
            style={styles.activityDescInput}
            value={description}
            onChangeText={setDescription}
            placeholder="Add notes about your workout..."
            placeholderTextColor={Colors.textMuted}
            multiline
          />
        </View>

        {/* INBUILT ROUTE MAP */}
        <View style={styles.mapContainerCard}>
          <InbuiltRouteMap
            routePoints={routePoints}
            height={260}
            distanceKm={distanceKm}
          />
        </View>
        {/* Primary workout stats */}
        <View style={styles.statGridCard}>
          <View style={styles.statGridRow}>
            <View style={styles.statGridItem}>
              <Text style={styles.statGridLabel}>Distance</Text>
              <Text style={styles.statGridNumber}>
                {distanceKm.toFixed(2)} <Text style={styles.statGridUnit}>km</Text>
              </Text>
            </View>

            <View style={styles.statGridItem}>
              <Text style={styles.statGridLabel}>Pace</Text>
              <Text style={[styles.statGridNumber, { color: Colors.accentOrange }]}>
                {calcAvgPace().replace(' /km', '')} <Text style={styles.statGridUnit}>/km</Text>
              </Text>
            </View>
          </View>

          <View style={styles.gridDivider} />

          <View style={styles.statGridRow}>
            <View style={styles.statGridItem}>
              <Text style={styles.statGridLabel}>Time</Text>
              <Text style={styles.statGridNumber}>{formatDuration(activeDurationSec)}</Text>
            </View>

            <View style={styles.statGridItem}>
              <Text style={styles.statGridLabel}>{totalSteps == null ? 'Elevation gain' : 'Steps'}</Text>
              <Text style={styles.statGridNumber}>
                {totalSteps == null ? (elevationGainMeters == null ? '—' : elevationGainMeters) : totalSteps.toLocaleString()} <Text style={styles.statGridUnit}>{totalSteps == null ? 'm' : 'steps'}</Text>
              </Text>
            </View>
          </View>
        </View>

        {/* Kilometer Splits Table */}
        <KilometerSplitsTable splits={splits} />

        {/* Privacy Selector */}
        <View style={styles.privacyCard}>
          <Text style={styles.privacyTitle}>Who can see this activity?</Text>
          <View style={styles.privacyOptions}>
            {(['public', 'followers', 'private'] as ActivityPrivacy[]).map((p) => {
              const active = privacy === p;
              const label = p === 'public' ? 'Everyone' : p === 'followers' ? 'Followers' : 'Only You';
              const Icon = p === 'public' ? Globe : p === 'followers' ? Users : Lock;
              return (
                <TouchableOpacity
                  key={p}
                  style={[styles.privacyOption, active && styles.privacyActive]}
                  onPress={() => setPrivacy(p)}
                >
                  <Icon size={14} color={active ? '#FFFFFF' : Colors.textSecondary} />
                  <Text style={[styles.privacyText, active && styles.privacyTextActive]}>
                    {label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {!isSavedWorkout && (
        <TouchableOpacity style={styles.saveButton} onPress={handleSaveActivity} disabled={isSaving} activeOpacity={0.85}>
          {isSaving ? <ActivityIndicator color="#FFFFFF" size="small" /> : <><Save size={18} color="#FFFFFF" /><Text style={styles.saveButtonText}>Save to Activity Log</Text></>}
        </TouchableOpacity>
        )}
      </ScrollView>

      {/* Trophy Unlock Celebration Modal */}
      {currentModalTrophy && (
        <TrophyUnlockModal
          visible={currentModalTrophy !== null}
          achievement={currentModalTrophy}
          onClose={handleTrophyModalClose}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderSubtle,
    backgroundColor: Colors.background,
  },
  navBackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  navBackText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginLeft: 2,
  },
  navTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  navActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  navIconBtn: {
    padding: 6,
    marginLeft: 6,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 40,
  },
  athleteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  athleteAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surfaceWarm,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  athleteAvatarEmoji: {
    fontSize: 22,
  },
  athleteMeta: {
    flex: 1,
  },
  athleteName: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  athleteDate: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  titleSection: {
    marginBottom: 14,
  },
  activityTitleInput: {
    fontSize: 22,
    fontWeight: '900',
    color: Colors.textPrimary,
    letterSpacing: -0.3,
    marginBottom: 4,
    paddingVertical: 4,
  },
  activityDescInput: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    paddingVertical: 4,
  },
  mapContainerCard: {
    marginBottom: 14,
    borderRadius: 20,
    overflow: 'hidden',
  },
  prCalloutCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceWarm,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  prBadgeIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.accentOrange,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  prBadgeTextWrap: {
    flex: 1,
  },
  prBadgeTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  statGridCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  statGridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  statGridItem: {
    flex: 1,
  },
  statGridLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  statGridNumber: {
    fontSize: 26,
    fontWeight: '900',
    color: Colors.primary,
    letterSpacing: -0.5,
  },
  statGridUnit: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  gridDivider: {
    height: 1,
    backgroundColor: Colors.borderSubtle,
    marginVertical: 10,
  },
  privacyCard: {
    backgroundColor: Colors.surfaceWarm,
    borderRadius: 18,
    padding: 16,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
  },
  privacyTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 10,
  },
  privacyOptions: {
    flexDirection: 'row',
  },
  privacyOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    borderRadius: 12,
    paddingVertical: 10,
    marginHorizontal: 3,
  },
  privacyActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  privacyText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginLeft: 4,
  },
  privacyTextActive: {
    color: '#FFFFFF',
  },
  saveButton: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 28,
    marginTop: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginLeft: 8,
  },
});
