import {
  UserProfile,
  FitnessProfile,
  UserAchievement,
  UserFitnessStats,
  RecordedActivity,
} from '../types';
import { ACHIEVEMENT_CATALOG } from './achievements';

// Pre-configured existing account for demo/returning user (Alex Vance)
const ALEX_USER_ID = 'usr_vyalwin_001';

const existingProfiles: Record<string, UserProfile> = {
  [ALEX_USER_ID]: {
    id: ALEX_USER_ID,
    phone: '+1 (555) 019-2834',
    fullName: 'Alex Vance',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
    dateOfBirth: '1996-06-15',
    age: 28,
    gender: 'male',
    country: 'United States',
    preferredUnits: 'metric',
    isOnboarded: true,
    streakCount: 14,
    totalPoints: 850,
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
};

const existingFitnessProfiles: Record<string, FitnessProfile> = {
  [ALEX_USER_ID]: {
    id: 'fit_prof_001',
    userId: ALEX_USER_ID,
    heightCm: 178,
    weightKg: 74,
    targetWeightKg: 71,
    fitnessGoal: 'weight_loss',
    fitnessLevel: 'intermediate',
    activityLevel: 'moderately_active',
    workoutPreference: 'combination',
    availableEquipment: ['dumbbells', 'resistance_bands', 'bodyweight'],
    preferredWorkoutDurationMin: 30,
    weeklyWorkoutFrequencyDays: 4,
    dietaryPreference: 'non_vegetarian',
    allergiesAndRestrictions: ['none'],
    bmr: 1715,
    tdee: 2658,
    dailyCalorieTarget: 2150,
    dailyProteinG: 148,
    dailyCarbsG: 242,
    dailyFatG: 65,
    dailyStepGoal: 10000,
    dailyWaterMl: 3000,
    isPrivate: true,
    updatedAt: new Date().toISOString(),
  },
};

const existingUserStats: Record<string, UserFitnessStats> = {
  [ALEX_USER_ID]: {
    userId: ALEX_USER_ID,
    totalActivities: 12,
    totalDistanceKm: 42.5,
    totalDurationMinutes: 380,
    totalCaloriesBurned: 4850,
    streakDays: 14,
    todaySteps: 8420,
    todayStepGoal: 10000,
    todayCalories: 450,
    todayWaterMl: 1750,
    todayWaterGoalMl: 3000,
    lastActiveDate: new Date().toISOString().split('T')[0],
  },
};

const existingActivities: Record<string, RecordedActivity[]> = {
  [ALEX_USER_ID]: [
    {
      id: 'act_alex_001',
      userId: ALEX_USER_ID,
      title: 'Morning Park Run',
      sportType: 'running',
      startTime: new Date(Date.now() - 3600000 * 4).toISOString(),
      endTime: new Date(Date.now() - 3600000 * 3.5).toISOString(),
      durationSeconds: 1800,
      activeDurationSeconds: 1740,
      distanceKm: 5.2,
      caloriesBurned: 420,
      avgPaceSecPerKm: 335,
      avgSpeedKmh: 10.7,
      heartRate: {
        avgBpm: 146,
        maxBpm: 168,
        sensorConnected: true,
        sensorName: 'Polar H10 BLE',
      },
      routeCoordinates: [],
      privacy: 'public',
      createdAt: new Date(Date.now() - 3600000 * 3.5).toISOString(),
    },
  ],
};

const existingUserAchievements: Record<string, Record<string, UserAchievement>> = {
  [ALEX_USER_ID]: {
    ach_steps_1k: {
      id: 'uach_01',
      userId: ALEX_USER_ID,
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
      userId: ALEX_USER_ID,
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
      userId: ALEX_USER_ID,
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
      userId: ALEX_USER_ID,
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
      userId: ALEX_USER_ID,
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
      userId: ALEX_USER_ID,
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
      userId: ALEX_USER_ID,
      achievementId: 'ach_comm_post',
      currentValue: 1,
      targetValue: 1,
      progressPercent: 100,
      isUnlocked: true,
      unlockedAt: '2026-10-11T16:20:00Z',
      isShared: true,
    },
  },
};

export class UserStore {
  private static profiles = existingProfiles;
  private static fitnessProfiles = existingFitnessProfiles;
  private static userStats = existingUserStats;
  private static activities = existingActivities;
  private static achievements = existingUserAchievements;

  /**
   * Initialize a brand-new user with ZERO statistics, ZERO trophies, and empty history.
   */
  static initializeNewUser(
    userId: string,
    phone: string,
    fullName: string,
    country: string = 'United States',
    avatarUrl?: string,
    dateOfBirth?: string,
    gender?: any
  ): UserProfile {
    const newProfile: UserProfile = {
      id: userId,
      phone,
      fullName: fullName || 'New Athlete',
      avatarUrl: avatarUrl || '🏃‍♂️',
      dateOfBirth: dateOfBirth || '2000-01-01',
      age: 24,
      gender: gender || 'male',
      country,
      preferredUnits: 'metric',
      isOnboarded: false,
      streakCount: 0,   // Starts from 0!
      totalPoints: 0,   // Starts from 0!
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // 1. Save profile
    this.profiles[userId] = newProfile;

    // 2. Initialize ALL FITNESS STATS TO ZERO
    this.userStats[userId] = {
      userId,
      totalActivities: 0,
      totalDistanceKm: 0,
      totalDurationMinutes: 0,
      totalCaloriesBurned: 0,
      streakDays: 0,
      todaySteps: 0,
      todayStepGoal: 8000,
      todayCalories: 0,
      todayWaterMl: 0,
      todayWaterGoalMl: 2500,
      lastActiveDate: undefined,
    };

    // 3. Initialize ZERO recorded activities
    this.activities[userId] = [];

    // 4. Initialize achievements: ALL LOCKED (0 earned trophies)
    this.achievements[userId] = {};
    ACHIEVEMENT_CATALOG.forEach((def) => {
      this.achievements[userId][def.id] = {
        id: `uach_${userId}_${def.id}`,
        userId,
        achievementId: def.id,
        achievement: def,
        currentValue: 0,
        targetValue: def.targetValue,
        progressPercent: 0,
        isUnlocked: false,
        isShared: false,
      };
    });

    return newProfile;
  }

  // --- Profile methods ---
  static getProfile(userId: string): UserProfile | null {
    return this.profiles[userId] || null;
  }

  static saveProfile(profile: UserProfile): void {
    this.profiles[profile.id] = {
      ...this.profiles[profile.id],
      ...profile,
      updatedAt: new Date().toISOString(),
    };
  }

  // --- Fitness Profile methods ---
  static getFitnessProfile(userId: string): FitnessProfile | null {
    return this.fitnessProfiles[userId] || null;
  }

  static saveFitnessProfile(fitnessProfile: FitnessProfile): void {
    this.fitnessProfiles[fitnessProfile.userId] = fitnessProfile;
  }

  // --- Stats methods (isolated per user) ---
  static getStats(userId: string): UserFitnessStats {
    if (!this.userStats[userId]) {
      // Return zeroed stats if not yet initialized
      this.userStats[userId] = {
        userId,
        totalActivities: 0,
        totalDistanceKm: 0,
        totalDurationMinutes: 0,
        totalCaloriesBurned: 0,
        streakDays: 0,
        todaySteps: 0,
        todayStepGoal: 8000,
        todayCalories: 0,
        todayWaterMl: 0,
        todayWaterGoalMl: 2500,
      };
    }
    return this.userStats[userId];
  }

  static updateStats(userId: string, partial: Partial<UserFitnessStats>): UserFitnessStats {
    const current = this.getStats(userId);
    const updated = { ...current, ...partial };
    this.userStats[userId] = updated;
    return updated;
  }

  // --- Activities methods (isolated per user) ---
  static getActivities(userId: string): RecordedActivity[] {
    return this.activities[userId] || [];
  }

  static addActivity(activity: RecordedActivity): void {
    if (!this.activities[activity.userId]) {
      this.activities[activity.userId] = [];
    }
    this.activities[activity.userId].unshift(activity);

    // Automatically update cumulative stats for THIS user
    const stats = this.getStats(activity.userId);
    const newTotalActivities = stats.totalActivities + 1;
    const newDistance = Math.round((stats.totalDistanceKm + (activity.distanceKm || 0)) * 100) / 100;
    const newDuration = stats.totalDurationMinutes + Math.round(activity.activeDurationSeconds / 60);
    const newCalories = stats.totalCaloriesBurned + (activity.caloriesBurned || 0);
    const newTodayCalories = stats.todayCalories + (activity.caloriesBurned || 0);

    // Approximate step count for outdoor runs/walks if not explicitly counted
    let stepBonus = 0;
    if (activity.sportType === 'running' || activity.sportType === 'walking' || activity.sportType === 'hiking') {
      stepBonus = Math.round(activity.distanceKm * 1300); // avg 1300 steps per km
    }
    const newTodaySteps = stats.todaySteps + stepBonus;
    const newStreak = stats.streakDays === 0 ? 1 : stats.streakDays;

    this.updateStats(activity.userId, {
      totalActivities: newTotalActivities,
      totalDistanceKm: newDistance,
      totalDurationMinutes: newDuration,
      totalCaloriesBurned: newCalories,
      todayCalories: newTodayCalories,
      todaySteps: newTodaySteps,
      streakDays: newStreak,
      lastActiveDate: new Date().toISOString().split('T')[0],
    });

    // Update streak in user profile as well
    const profile = this.getProfile(activity.userId);
    if (profile) {
      this.saveProfile({
        ...profile,
        streakCount: newStreak,
      });
    }
  }

  // --- Achievements methods (isolated per user) ---
  static getUserAchievements(userId: string): Record<string, UserAchievement> {
    if (!this.achievements[userId]) {
      // Initialize zeroed achievement records for this user
      this.achievements[userId] = {};
      ACHIEVEMENT_CATALOG.forEach((def) => {
        this.achievements[userId][def.id] = {
          id: `uach_${userId}_${def.id}`,
          userId,
          achievementId: def.id,
          achievement: def,
          currentValue: 0,
          targetValue: def.targetValue,
          progressPercent: 0,
          isUnlocked: false,
          isShared: false,
        };
      });
    }
    return this.achievements[userId];
  }

  static unlockAchievement(userId: string, achievementId: string): UserAchievement | null {
    const userAchs = this.getUserAchievements(userId);
    const record = userAchs[achievementId];
    if (record && !record.isUnlocked) {
      record.isUnlocked = true;
      record.progressPercent = 100;
      record.currentValue = record.targetValue;
      record.unlockedAt = new Date().toISOString();

      // Award points to this specific user's profile
      const def = record.achievement;
      const profile = this.getProfile(userId);
      if (profile && def) {
        this.saveProfile({
          ...profile,
          totalPoints: (profile.totalPoints || 0) + def.points,
        });
      }
      return record;
    }
    return null;
  }
}
