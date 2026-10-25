import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../theme/colors';
import {
  AchievementCategory,
  TrophyTier,
  UserAchievement,
  TrophySummary,
  AchievementDefinition,
} from '../../types';
import { AchievementService } from '../../services/achievements';
import TrophyUnlockModal from '../../components/achievements/TrophyUnlockModal';
import {
  Trophy,
  Award,
  Crown,
  Flame,
  Zap,
  Lock,
  CheckCircle,
  Share2,
  Sparkles,
  ChevronLeft,
  Filter,
} from 'lucide-react-native';

const CATEGORIES: { id: 'all' | AchievementCategory; label: string }[] = [
  { id: 'all', label: 'All Trophies' },
  { id: 'step_activity', label: 'Steps & Cardio' },
  { id: 'workout', label: 'Workouts' },
  { id: 'nutrition', label: 'Nutrition' },
  { id: 'community', label: 'Community' },
  { id: 'personal_progress', label: 'Mastery' },
];

const TIER_COLORS: Record<TrophyTier, { bg: string; border: string; text: string; glow: string }> = {
  bronze: { bg: '#FDF7F2', border: '#CD7F32', text: '#9B5A1A', glow: 'rgba(205, 127, 50, 0.2)' },
  silver: { bg: '#F8FAFC', border: '#94A3B8', text: '#475569', glow: 'rgba(148, 163, 184, 0.2)' },
  gold: { bg: '#FEF9C3', border: '#EAB308', text: '#A16207', glow: 'rgba(234, 179, 8, 0.2)' },
  platinum: { bg: '#E0F2FE', border: '#0284C7', text: '#0369A1', glow: 'rgba(2, 132, 199, 0.2)' },
  diamond: { bg: '#FCE7F3', border: '#BE185D', text: '#9D174D', glow: 'rgba(190, 24, 93, 0.25)' },
};

interface AchievementsScreenProps {
  navigation?: any;
}

export default function AchievementsScreen({ navigation }: AchievementsScreenProps) {
  const insets = useSafeAreaInsets();
  const [selectedCategory, setSelectedCategory] = useState<'all' | AchievementCategory>('all');
  const [achievements, setAchievements] = useState<UserAchievement[]>([]);
  const [summary, setSummary] = useState<TrophySummary | null>(null);
  const [celebrationAchievement, setCelebrationAchievement] = useState<AchievementDefinition | null>(null);

  const loadData = async () => {
    const list = await AchievementService.getAllUserAchievements();
    const sum = await AchievementService.getTrophySummary();
    setAchievements(list);
    setSummary(sum);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleShare = async (ach: AchievementDefinition) => {
    await AchievementService.shareTrophyToCommunity(ach.id);
    Alert.alert(
      'Shared to AVFIT Community!',
      `Your "${ach.title}" achievement has been published to the community feed. Get ready for high fives!`
    );
    loadData();
  };

  const filteredList = achievements.filter((item) => {
    if (selectedCategory === 'all') return true;
    return item.achievement?.category === selectedCategory;
  });

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 16) }]}>
      {/* Top Header */}
      <View style={styles.topHeader}>
        {navigation?.goBack && (
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <ChevronLeft size={22} color={Colors.textPrimary} />
          </TouchableOpacity>
        )}
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Trophy Room & Badges</Text>
          <Text style={styles.headerSub}>Real milestones unlocked through verified workout tracking</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 130 + insets.bottom }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Scoreboard Banner */}
        <View style={styles.scoreHero}>
          <View style={styles.scoreHeroTop}>
            <View>
              <Text style={styles.scoreLabel}>TOTAL COMMUNITY POINTS</Text>
              <Text style={styles.scorePoints}>{summary?.totalPoints || 0} pts</Text>
            </View>
            <View style={styles.unlockedBox}>
              <Trophy size={22} color={Colors.accentOrange} />
              <Text style={styles.unlockedCount}>
                {summary?.unlockedCount || 0} / {summary?.totalTrophies || 0}
              </Text>
              <Text style={styles.unlockedText}>Unlocked</Text>
            </View>
          </View>

          {/* Tier Counts Pill Bar */}
          <View style={styles.tierPillRow}>
            {(['bronze', 'silver', 'gold', 'platinum', 'diamond'] as TrophyTier[]).map((tier) => (
              <View
                key={tier}
                style={[
                  styles.tierCountPill,
                  { borderColor: TIER_COLORS[tier].border, backgroundColor: TIER_COLORS[tier].bg },
                ]}
              >
                <Text style={[styles.tierCountVal, { color: TIER_COLORS[tier].text }]}>
                  {summary?.byTier[tier] || 0}
                </Text>
                <Text style={[styles.tierCountName, { color: TIER_COLORS[tier].text }]}>
                  {tier.slice(0, 3).toUpperCase()}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Next Milestone Spotlight */}
        {summary?.nextMilestone && summary.nextMilestone.achievement && (
          <View style={styles.nextMilestoneCard}>
            <View style={styles.nextMilestoneHeader}>
              <View style={styles.pulseDot} />
              <Text style={styles.nextMilestoneLabel}>NEXT MILESTONE IN REACH</Text>
            </View>
            <View style={styles.nextMilestoneBody}>
              <View style={styles.nextIconBox}>
                <Flame size={26} color={Colors.accentOrange} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.nextMilestoneTitle}>
                  {summary.nextMilestone.achievement.title}
                </Text>
                <Text style={styles.nextMilestoneDesc}>
                  {summary.nextMilestone.achievement.description}
                </Text>
                {/* Progress bar */}
                <View style={styles.milestoneProgressRow}>
                  <View style={styles.progressBarTrack}>
                    <View
                      style={[
                        styles.progressBarFill,
                        { width: `${summary.nextMilestone.progressPercent}%` },
                      ]}
                    />
                  </View>
                  <Text style={styles.milestonePercent}>
                    {summary.nextMilestone.progressPercent}%
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Category Horizontal Filter Bar */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScroll}
        >
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.categoryChip,
                selectedCategory === cat.id && styles.categoryChipActive,
              ]}
              onPress={() => setSelectedCategory(cat.id)}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  selectedCategory === cat.id && styles.categoryChipTextActive,
                ]}
              >
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Trophies List */}
        <View style={styles.trophyList}>
          {filteredList.map((item) => {
            const def = item.achievement;
            if (!def) return null;
            const tierStyle = TIER_COLORS[def.tier];

            return (
              <View
                key={item.id}
                style={[
                  styles.trophyCard,
                  !item.isUnlocked && styles.trophyCardLocked,
                ]}
              >
                {/* Emblem Box */}
                <View
                  style={[
                    styles.emblemBox,
                    {
                      backgroundColor: item.isUnlocked ? tierStyle.bg : '#EAE8E2',
                      borderColor: item.isUnlocked ? tierStyle.border : '#D5CFC3',
                    },
                  ]}
                >
                  {item.isUnlocked ? (
                    def.tier === 'diamond' ? (
                      <Crown size={28} color={tierStyle.border} />
                    ) : def.tier === 'gold' ? (
                      <Trophy size={28} color={tierStyle.border} />
                    ) : def.tier === 'platinum' ? (
                      <Award size={28} color={tierStyle.border} />
                    ) : def.tier === 'silver' ? (
                      <Zap size={28} color={tierStyle.border} />
                    ) : (
                      <Flame size={28} color={tierStyle.border} />
                    )
                  ) : (
                    <Lock size={24} color="#8F8A7E" />
                  )}
                </View>

                {/* Details */}
                <View style={styles.trophyInfo}>
                  <View style={styles.trophyHeaderRow}>
                    <Text style={[styles.trophyTitle, !item.isUnlocked && styles.trophyTitleLocked]}>
                      {def.title}
                    </Text>
                    <View
                      style={[
                        styles.tierBadge,
                        {
                          backgroundColor: item.isUnlocked ? tierStyle.border : '#B8B2A4',
                        },
                      ]}
                    >
                      <Text style={styles.tierBadgeText}>{def.tier.toUpperCase()}</Text>
                    </View>
                  </View>

                  <Text style={styles.trophyDesc}>{def.description}</Text>

                  {/* Progress or Unlock Meta */}
                  {item.isUnlocked ? (
                    <View style={styles.unlockedMetaRow}>
                      <View style={styles.unlockedTag}>
                        <CheckCircle size={14} color={Colors.primary} />
                        <Text style={styles.unlockedTagText}>Earned +{def.points} pts</Text>
                      </View>
                      <TouchableOpacity
                        style={styles.shareButton}
                        onPress={() => handleShare(def)}
                        activeOpacity={0.7}
                      >
                        <Share2 size={13} color={item.isShared ? Colors.primary : Colors.textSecondary} />
                        <Text
                          style={[
                            styles.shareButtonText,
                            item.isShared && { color: Colors.primary, fontWeight: '700' },
                          ]}
                        >
                          {item.isShared ? 'Shared' : 'Share'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View style={styles.lockedProgressBox}>
                      <View style={styles.lockedTrack}>
                        <View
                          style={[
                            styles.lockedFill,
                            { width: `${item.progressPercent}%` },
                          ]}
                        />
                      </View>
                      <Text style={styles.lockedProgressText}>
                        {item.currentValue} / {item.targetValue} ({item.progressPercent}%) • +{def.points} pts
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* Unlock Celebration Modal */}
      <TrophyUnlockModal
        visible={!!celebrationAchievement}
        achievement={celebrationAchievement}
        onClose={() => setCelebrationAchievement(null)}
        onShare={(ach) => {
          handleShare(ach);
          setCelebrationAchievement(null);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  topHeader: {
    paddingTop: Platform.OS === 'ios' ? 52 : 36,
    paddingHorizontal: 20,
    paddingBottom: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderSubtle,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    padding: 6,
  },
  headerTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  headerSub: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  simButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.accentOrange,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  simButtonText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 90,
  },
  scoreHero: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  scoreHeroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  scoreLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    color: Colors.textSecondary,
  },
  scorePoints: {
    fontSize: 32,
    fontWeight: '900',
    color: Colors.primary,
    marginTop: 2,
  },
  unlockedBox: {
    alignItems: 'center',
    backgroundColor: Colors.surfaceWarm,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 16,
  },
  unlockedCount: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginTop: 2,
  },
  unlockedText: {
    fontSize: 10,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  tierPillRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 6,
  },
  tierCountPill: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
  },
  tierCountVal: {
    fontSize: 14,
    fontWeight: '800',
  },
  tierCountName: {
    fontSize: 9,
    fontWeight: '800',
    marginTop: 1,
  },
  nextMilestoneCard: {
    backgroundColor: Colors.surfaceWarm,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 16,
  },
  nextMilestoneHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.accentOrange,
  },
  nextMilestoneLabel: {
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 0.8,
    color: Colors.accentOrange,
  },
  nextMilestoneBody: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  nextIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextMilestoneTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  nextMilestoneDesc: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  milestoneProgressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  progressBarTrack: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#E5DFD4',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.accentOrange,
  },
  milestonePercent: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.accentOrange,
  },
  categoryScroll: {
    gap: 8,
    paddingBottom: 14,
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
  },
  categoryChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  categoryChipText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  categoryChipTextActive: {
    color: '#FFFFFF',
  },
  trophyList: {
    gap: 12,
  },
  trophyCard: {
    flexDirection: 'row',
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
    alignItems: 'center',
    gap: 14,
  },
  trophyCardLocked: {
    backgroundColor: '#FAF8F4',
    borderColor: '#ECE6DA',
  },
  emblemBox: {
    width: 58,
    height: 58,
    borderRadius: 29,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trophyInfo: {
    flex: 1,
  },
  trophyHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  trophyTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  trophyTitleLocked: {
    color: '#656057',
  },
  tierBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  tierBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  trophyDesc: {
    fontSize: 12,
    lineHeight: 16,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  unlockedMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  unlockedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  unlockedTagText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: Colors.surfaceWarm,
  },
  shareButtonText: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  lockedProgressBox: {
    width: '100%',
  },
  lockedTrack: {
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#E5DFD4',
    overflow: 'hidden',
    marginBottom: 4,
  },
  lockedFill: {
    height: '100%',
    backgroundColor: Colors.primaryLight,
  },
  lockedProgressText: {
    fontSize: 10.5,
    color: Colors.textMuted,
    fontWeight: '600',
  },
});
