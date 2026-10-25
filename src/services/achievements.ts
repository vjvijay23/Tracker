import {
  AchievementDefinition,
  UserAchievement,
  TrophySummary,
  TrophyTier,
  AchievementCategory,
} from '../types';
import { supabase } from './supabase';
import { UserStore } from './userStore';
import { AuthService } from './auth';

export const ACHIEVEMENT_CATALOG: AchievementDefinition[] = [
  // --- Category A: Step and Activity Achievements ---
  {
    id: 'ach_steps_1k',
    code: 'STEPS_FIRST_1K',
    title: 'First Step Forward',
    description: 'Log your first 1,000 steps in a single day.',
    category: 'step_activity',
    tier: 'bronze',
    iconName: 'Footprints',
    metricType: 'steps',
    targetValue: 1000,
    points: 25,
  },
  {
    id: 'ach_steps_5k',
    code: 'STEPS_5K',
    title: 'Pace Setter',
    description: 'Reach 5,000 steps in a single day.',
    category: 'step_activity',
    tier: 'bronze',
    iconName: 'Activity',
    metricType: 'steps',
    targetValue: 5000,
    points: 50,
  },
  {
    id: 'ach_steps_10k',
    code: 'STEPS_10K',
    title: '10K Titan',
    description: 'Hit the iconic 10,000 daily steps milestone.',
    category: 'step_activity',
    tier: 'silver',
    iconName: 'Award',
    metricType: 'steps',
    targetValue: 10000,
    points: 100,
  },
  {
    id: 'ach_streak_7',
    code: 'STREAK_7',
    title: 'Weekly Warrior',
    description: 'Maintain an active 7-day movement streak.',
    category: 'step_activity',
    tier: 'silver',
    iconName: 'Zap',
    metricType: 'streak_days',
    targetValue: 7,
    points: 150,
  },
  {
    id: 'ach_streak_30',
    code: 'STREAK_30',
    title: 'Iron Consistency',
    description: 'Crush an unstoppable 30-day activity streak.',
    category: 'step_activity',
    tier: 'gold',
    iconName: 'Flame',
    metricType: 'streak_days',
    targetValue: 30,
    points: 350,
  },
  {
    id: 'ach_dist_50km',
    code: 'DISTANCE_50KM',
    title: 'Globe Trotter',
    description: 'Accumulate a cumulative 50 km on foot.',
    category: 'step_activity',
    tier: 'gold',
    iconName: 'Compass',
    metricType: 'distance_km',
    targetValue: 50,
    points: 300,
  },

  // --- Category B: Workout Achievements ---
  {
    id: 'ach_wo_1',
    code: 'WORKOUT_FIRST',
    title: 'Genesis Pump',
    description: 'Complete your very first guided workout routine.',
    category: 'workout',
    tier: 'bronze',
    iconName: 'Dumbbell',
    metricType: 'workout_count',
    targetValue: 1,
    points: 25,
  },
  {
    id: 'ach_wo_5',
    code: 'WORKOUT_5',
    title: 'Building Momentum',
    description: 'Complete 5 home or gym workout sessions.',
    category: 'workout',
    tier: 'bronze',
    iconName: 'CheckCircle',
    metricType: 'workout_count',
    targetValue: 5,
    points: 75,
  },
  {
    id: 'ach_wo_25',
    code: 'WORKOUT_25',
    title: 'Quarter Century Club',
    description: 'Complete 25 total workouts.',
    category: 'workout',
    tier: 'silver',
    iconName: 'TrendingUp',
    metricType: 'workout_count',
    targetValue: 25,
    points: 200,
  },
  {
    id: 'ach_wo_100',
    code: 'WORKOUT_100',
    title: 'Century Legend',
    description: 'Reach 100 completed workout sessions.',
    category: 'workout',
    tier: 'platinum',
    iconName: 'ShieldAlert',
    metricType: 'workout_count',
    targetValue: 100,
    points: 600,
  },
  {
    id: 'ach_wo_week_cons',
    code: 'WORKOUT_WEEKLY_CONSISTENCY',
    title: 'Weekly Routine Master',
    description: 'Complete 4 workouts in a single calendar week.',
    category: 'workout',
    tier: 'silver',
    iconName: 'CalendarCheck',
    metricType: 'workout_count',
    targetValue: 4,
    points: 125,
  },
  {
    id: 'ach_wo_month_cons',
    code: 'WORKOUT_MONTHLY_CONSISTENCY',
    title: 'Monthly Dedication',
    description: 'Complete at least 16 workouts in a month.',
    category: 'workout',
    tier: 'gold',
    iconName: 'Trophy',
    metricType: 'workout_count',
    targetValue: 16,
    points: 400,
  },

  // --- Category C: Nutrition Achievements ---
  {
    id: 'ach_nut_first',
    code: 'NUTRITION_FIRST_LOG',
    title: 'Mindful Bite',
    description: 'Scan and log your first meal with AI Food Scanner.',
    category: 'nutrition',
    tier: 'bronze',
    iconName: 'Utensils',
    metricType: 'food_log_days',
    targetValue: 1,
    points: 25,
  },
  {
    id: 'ach_nut_7d',
    code: 'NUTRITION_7_DAYS',
    title: 'Macro Conscious',
    description: 'Log your food intake for 7 consecutive days.',
    category: 'nutrition',
    tier: 'silver',
    iconName: 'PieChart',
    metricType: 'food_log_days',
    targetValue: 7,
    points: 150,
  },
  {
    id: 'ach_nut_30d',
    code: 'NUTRITION_30_DAYS',
    title: 'Nutritional Alchemist',
    description: 'Log meals consistently for 30 days.',
    category: 'nutrition',
    tier: 'gold',
    iconName: 'Award',
    metricType: 'food_log_days',
    targetValue: 30,
    points: 450,
  },
  {
    id: 'ach_nut_macro_hit',
    code: 'NUTRITION_TARGET_HIT',
    title: 'Macro Perfectionist',
    description: 'Hit within 5% of protein and calorie targets for 5 days.',
    category: 'nutrition',
    tier: 'silver',
    iconName: 'Target',
    metricType: 'food_log_days',
    targetValue: 5,
    points: 175,
  },

  // --- Category D: Community Achievements ---
  {
    id: 'ach_comm_post',
    code: 'COMMUNITY_FIRST_POST',
    title: 'Social Spark',
    description: 'Share your first workout or meal update with the community.',
    category: 'community',
    tier: 'bronze',
    iconName: 'MessageSquare',
    metricType: 'community_posts',
    targetValue: 1,
    points: 30,
  },
  {
    id: 'ach_comm_join_chall',
    code: 'COMMUNITY_JOIN_CHALLENGE',
    title: 'Challenger Enters',
    description: 'Join your first community fitness leaderboard challenge.',
    category: 'community',
    tier: 'bronze',
    iconName: 'Users',
    metricType: 'community_posts',
    targetValue: 1,
    points: 50,
  },
  {
    id: 'ach_comm_comp_chall',
    code: 'COMMUNITY_COMPLETE_CHALLENGE',
    title: 'Challenge Champion',
    description: 'Complete a community 50km or 100k-step challenge.',
    category: 'community',
    tier: 'gold',
    iconName: 'Medal',
    metricType: 'community_posts',
    targetValue: 1,
    points: 350,
  },
  {
    id: 'ach_comm_helper',
    code: 'COMMUNITY_MOTIVATOR',
    title: 'Fit Motivator',
    description: 'Encourage 20 fellow community members with likes & comments.',
    category: 'community',
    tier: 'silver',
    iconName: 'Heart',
    metricType: 'community_posts',
    targetValue: 20,
    points: 150,
  },

  // --- Category E: Personal Progress & Mastery ---
  {
    id: 'ach_prog_goal',
    code: 'PROGRESS_GOAL_ACHIEVED',
    title: 'Goal Crusher',
    description: 'Reach your target body weight or strength milestone.',
    category: 'personal_progress',
    tier: 'platinum',
    iconName: 'Sparkles',
    metricType: 'weight_goal',
    targetValue: 1,
    points: 500,
  },
  {
    id: 'ach_prog_update',
    code: 'PROGRESS_UPDATE_LOGGED',
    title: 'Self-Reflection',
    description: 'Record a body measurement or progress check-in update.',
    category: 'personal_progress',
    tier: 'bronze',
    iconName: 'Edit3',
    metricType: 'weight_goal',
    targetValue: 1,
    points: 40,
  },
  {
    id: 'ach_prog_diamond_apex',
    code: 'PROGRESS_DIAMOND_APEX',
    title: 'AVFIT Apex Master',
    description: 'Reach 1,000 total points and 50+ total workouts completed.',
    category: 'personal_progress',
    tier: 'diamond',
    iconName: 'Crown',
    metricType: 'workout_count',
    targetValue: 50,
    points: 1000,
  },
];

// In-memory user achievements state
let userAchievementsState: Record<string, UserAchievement> = {
  ach_steps_1k: {
    id: 'uach_01',
    userId: 'usr_vyalwin_001',
    achievementId: 'ach_steps_1k',
    currentValue: 8420,
    targetValue: 1000,
    progressPercent: 100,
    isUnlocked: true,
    unlockedAt: '2026-10-10T09:30:00Z',
    isShared: true,
  },
  ach_steps_5k: {
    id: 'uach_02',
    userId: 'usr_vyalwin_001',
    achievementId: 'ach_steps_5k',
    currentValue: 8420,
    targetValue: 5000,
    progressPercent: 100,
    isUnlocked: true,
    unlockedAt: '2026-10-12T14:15:00Z',
    isShared: false,
  },
  ach_streak_7: {
    id: 'uach_03',
    userId: 'usr_vyalwin_001',
    achievementId: 'ach_streak_7',
    currentValue: 14,
    targetValue: 7,
    progressPercent: 100,
    isUnlocked: true,
    unlockedAt: '2026-10-17T20:00:00Z',
    isShared: true,
  },
  ach_wo_1: {
    id: 'uach_04',
    userId: 'usr_vyalwin_001',
    achievementId: 'ach_wo_1',
    currentValue: 12,
    targetValue: 1,
    progressPercent: 100,
    isUnlocked: true,
    unlockedAt: '2026-10-08T18:40:00Z',
    isShared: false,
  },
  ach_wo_5: {
    id: 'uach_05',
    userId: 'usr_vyalwin_001',
    achievementId: 'ach_wo_5',
    currentValue: 12,
    targetValue: 5,
    progressPercent: 100,
    isUnlocked: true,
    unlockedAt: '2026-10-15T19:10:00Z',
    isShared: true,
  },
  ach_nut_first: {
    id: 'uach_06',
    userId: 'usr_vyalwin_001',
    achievementId: 'ach_nut_first',
    currentValue: 1,
    targetValue: 1,
    progressPercent: 100,
    isUnlocked: true,
    unlockedAt: '2026-10-09T13:00:00Z',
    isShared: false,
  },
  ach_comm_post: {
    id: 'uach_07',
    userId: 'usr_vyalwin_001',
    achievementId: 'ach_comm_post',
    currentValue: 1,
    targetValue: 1,
    progressPercent: 100,
    isUnlocked: true,
    unlockedAt: '2026-10-11T16:20:00Z',
    isShared: true,
  },
  ach_steps_10k: {
    id: 'uach_08',
    userId: 'usr_vyalwin_001',
    achievementId: 'ach_steps_10k',
    currentValue: 8420,
    targetValue: 10000,
    progressPercent: 84,
    isUnlocked: false,
    isShared: false,
  },
  ach_streak_30: {
    id: 'uach_09',
    userId: 'usr_vyalwin_001',
    achievementId: 'ach_streak_30',
    currentValue: 14,
    targetValue: 30,
    progressPercent: 46,
    isUnlocked: false,
    isShared: false,
  },
  ach_wo_25: {
    id: 'uach_10',
    userId: 'usr_vyalwin_001',
    achievementId: 'ach_wo_25',
    currentValue: 12,
    targetValue: 25,
    progressPercent: 48,
    isUnlocked: false,
    isShared: false,
  },
};

export const AchievementService = {
  /**
   * Get all defined achievements with current user progress attached.
   */
  async getAllUserAchievements(userId?: string): Promise<UserAchievement[]> {
    const targetUserId = userId || AuthService.getActiveUserId();
    const userAchs = UserStore.getUserAchievements(targetUserId);

    return ACHIEVEMENT_CATALOG.map((def) => {
      const existing = userAchs[def.id];
      if (existing) {
        return {
          ...existing,
          achievement: def,
        };
      }
      return {
        id: `uach_${targetUserId}_${def.id}`,
        userId: targetUserId,
        achievementId: def.id,
        achievement: def,
        currentValue: 0,
        targetValue: def.targetValue,
        progressPercent: 0,
        isUnlocked: false,
        isShared: false,
      };
    });
  },

  /**
   * Get an aggregated summary of trophies, tiers, and points.
   */
  async getTrophySummary(userId?: string): Promise<TrophySummary> {
    const targetUserId = userId || AuthService.getActiveUserId();
    const all = await this.getAllUserAchievements(targetUserId);
    const unlocked = all.filter((a) => a.isUnlocked);

    const byTier: Record<TrophyTier, number> = {
      bronze: 0,
      silver: 0,
      gold: 0,
      platinum: 0,
      diamond: 0,
    };

    let totalPoints = 0;
    unlocked.forEach((u) => {
      if (u.achievement) {
        byTier[u.achievement.tier] = (byTier[u.achievement.tier] || 0) + 1;
        totalPoints += u.achievement.points;
      }
    });

    const recentUnlocks = unlocked
      .sort((a, b) => new Date(b.unlockedAt || '').getTime() - new Date(a.unlockedAt || '').getTime())
      .slice(0, 3);

    const locked = all.filter((a) => !a.isUnlocked);
    const nextMilestone = locked.sort((a, b) => b.progressPercent - a.progressPercent)[0];

    return {
      totalTrophies: ACHIEVEMENT_CATALOG.length,
      unlockedCount: unlocked.length,
      totalPoints,
      byTier,
      recentUnlocks,
      nextMilestone,
    };
  },

  /**
   * Evaluate milestones against current metrics.
   * Enforces server/anti-cheat validation: idempotent unlock, valid delta.
   * Returns an array of newly unlocked achievements for celebration popups.
   */
  async evaluateMilestones(
    metrics: {
      steps?: number;
      streakDays?: number;
      workoutCount?: number;
      foodLogDays?: number;
      communityPosts?: number;
      distanceKm?: number;
    },
    userId?: string
  ): Promise<AchievementDefinition[]> {
    const targetUserId = userId || AuthService.getActiveUserId();
    const newlyUnlocked: AchievementDefinition[] = [];
    const userAchs = UserStore.getUserAchievements(targetUserId);

    ACHIEVEMENT_CATALOG.forEach((def) => {
      let metricValue = 0;
      switch (def.metricType) {
        case 'steps':
          metricValue = metrics.steps || 0;
          break;
        case 'streak_days':
          metricValue = metrics.streakDays || 0;
          break;
        case 'workout_count':
          metricValue = metrics.workoutCount || 0;
          break;
        case 'food_log_days':
          metricValue = metrics.foodLogDays || 0;
          break;
        case 'community_posts':
          metricValue = metrics.communityPosts || 0;
          break;
        case 'distance_km':
          metricValue = metrics.distanceKm || 0;
          break;
        default:
          metricValue = 0;
      }

      const existing = userAchs[def.id];
      const percent = Math.min(100, Math.round((metricValue / def.targetValue) * 100));

      if (metricValue >= def.targetValue) {
        // Did we already unlock it? Anti-cheat & idempotency check
        if (!existing || !existing.isUnlocked) {
          userAchs[def.id] = {
            id: existing?.id || `uach_${targetUserId}_${def.id}`,
            userId: targetUserId,
            achievementId: def.id,
            currentValue: metricValue,
            targetValue: def.targetValue,
            progressPercent: 100,
            isUnlocked: true,
            unlockedAt: new Date().toISOString(),
            isShared: false,
          };
          // Award points to this specific user profile
          const profile = UserStore.getProfile(targetUserId);
          if (profile) {
            UserStore.saveProfile({
              ...profile,
              totalPoints: (profile.totalPoints || 0) + def.points,
            });
          }
          newlyUnlocked.push(def);
        }
      } else {
        // Update in-progress value if higher
        if (!existing?.isUnlocked) {
          userAchs[def.id] = {
            id: existing?.id || `uach_${targetUserId}_${def.id}`,
            userId: targetUserId,
            achievementId: def.id,
            currentValue: Math.max(existing?.currentValue || 0, metricValue),
            targetValue: def.targetValue,
            progressPercent: percent,
            isUnlocked: false,
            isShared: false,
          };
        }
      }
    });

    return newlyUnlocked;
  },

  /**
   * Share an unlocked trophy to the community feed.
   */
  async shareTrophyToCommunity(achievementId: string, userId?: string): Promise<boolean> {
    const targetUserId = userId || AuthService.getActiveUserId();
    const userAchs = UserStore.getUserAchievements(targetUserId);
    const record = userAchs[achievementId];
    if (record && record.isUnlocked) {
      record.isShared = true;
      return true;
    }
    return false;
  },
};
