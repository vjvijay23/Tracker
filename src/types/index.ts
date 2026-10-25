// ====================================================================
// AVFIT (Vyalwin) - Enhanced TypeScript Definitions
// ====================================================================

// --------------------------------------------------------------------
// 1. AUTHENTICATION & SESSIONS
// --------------------------------------------------------------------
export interface AuthUser {
  id: string;
  phone: string;
  countryCode: string;
  isPhoneVerified: boolean;
  isOnboarded: boolean;
  createdAt: string;
}

export interface PhoneAuthRequest {
  phone: string; // e.g., '+15551234567' or '+919876543210'
  countryCode: string; // e.g., '+1' or '+91'
}

export interface OtpVerifyRequest {
  phone: string;
  token: string;
}

// --------------------------------------------------------------------
// 2. USER PROFILE & BASIC DETAILS
// --------------------------------------------------------------------
export type Gender = 'male' | 'female' | 'non_binary' | 'prefer_not_to_say';
export type UnitSystem = 'metric' | 'imperial';

export interface UserProfile {
  id: string;
  phone: string;
  fullName: string;
  avatarUrl?: string;
  dateOfBirth?: string;
  age?: number;
  gender?: Gender;
  country: string;
  preferredUnits: UnitSystem;
  isOnboarded: boolean;
  streakCount: number;
  totalPoints: number;
  createdAt: string;
  updatedAt: string;
}

// --------------------------------------------------------------------
// 3. FITNESS PROFILE & PERSONALIZATION
// --------------------------------------------------------------------
export type FitnessGoal =
  | 'weight_loss'
  | 'muscle_gain'
  | 'general_fitness'
  | 'endurance'
  | 'maintenance';

export type FitnessLevel = 'beginner' | 'intermediate' | 'advanced';

export type ActivityLevel =
  | 'sedentary'          // Little or no exercise (Desk job)
  | 'lightly_active'     // Exercise 1-3 days/week
  | 'moderately_active'  // Exercise 3-5 days/week
  | 'very_active';       // Hard exercise 6-7 days/week

export type WorkoutPreference = 'home' | 'gym' | 'outdoor' | 'combination';

export type DietaryPreference =
  | 'non_vegetarian'
  | 'vegetarian'
  | 'vegan'
  | 'pescatarian'
  | 'keto'
  | 'halal'
  | 'other';

export interface FitnessProfile {
  id: string;
  userId: string;
  heightCm: number;
  weightKg: number;
  targetWeightKg?: number;
  fitnessGoal: FitnessGoal;
  fitnessLevel: FitnessLevel;
  activityLevel: ActivityLevel;
  workoutPreference: WorkoutPreference;
  availableEquipment: string[]; // e.g. ['dumbbells', 'resistance_bands', 'bodyweight']
  preferredWorkoutDurationMin: number; // e.g. 15, 30, 45, 60
  weeklyWorkoutFrequencyDays: number; // e.g. 3, 4, 5
  dietaryPreference: DietaryPreference;
  allergiesAndRestrictions: string[]; // e.g. ['peanuts', 'gluten', 'dairy', 'lactose']
  
  // Calculated Metrics (Mifflin-St Jeor & TDEE)
  bmr: number;
  tdee: number;
  dailyCalorieTarget: number;
  dailyProteinG: number;
  dailyCarbsG: number;
  dailyFatG: number;
  dailyStepGoal: number;
  dailyWaterMl: number;
  
  isPrivate: boolean;
  updatedAt: string;
}

// --------------------------------------------------------------------
// 4. ACHIEVEMENTS, TROPHIES & MILESTONES
// --------------------------------------------------------------------
export type AchievementCategory =
  | 'step_activity'
  | 'workout'
  | 'nutrition'
  | 'community'
  | 'personal_progress';

export type TrophyTier =
  | 'bronze'    // Beginner & initial milestones
  | 'silver'    // Consistency & habits
  | 'gold'      // Significant milestones
  | 'platinum'  // Advanced accomplishments
  | 'diamond';  // Special long-term mastery

export interface AchievementDefinition {
  id: string;
  code: string; // e.g., 'STEPS_FIRST_1K', 'WORKOUTS_5', 'STREAK_7'
  title: string;
  description: string;
  category: AchievementCategory;
  tier: TrophyTier;
  iconName: string;
  metricType: 'steps' | 'streak_days' | 'workout_count' | 'food_log_days' | 'community_posts' | 'weight_goal' | 'distance_km';
  targetValue: number;
  points: number; // e.g., Bronze: 20, Silver: 50, Gold: 100, Platinum: 250, Diamond: 500
}

export interface UserAchievement {
  id: string;
  userId: string;
  achievementId: string;
  achievement?: AchievementDefinition;
  currentValue: number;
  targetValue: number;
  progressPercent: number;
  isUnlocked: boolean;
  unlockedAt?: string;
  isShared: boolean;
}

export interface TrophySummary {
  totalTrophies: number;
  unlockedCount: number;
  totalPoints: number;
  byTier: {
    bronze: number;
    silver: number;
    gold: number;
    platinum: number;
    diamond: number;
  };
  recentUnlocks: UserAchievement[];
  nextMilestone?: UserAchievement;
}

// --------------------------------------------------------------------
// 5. EXISTING APP METRICS (Preserved & Extended)
// --------------------------------------------------------------------
export interface DailyActivity {
  steps: number;
  stepGoal: number;
  distanceKm: number;
  caloriesBurned: number;
  activeMinutes: number;
  waterIntakeMl: number;
  waterGoalMl: number;
}

export interface FoodNutritionEstimate {
  dish_name: string;
  estimated_weight_g: number;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
  confidence: 'high' | 'medium' | 'low';
  health_tips?: string;
  ingredients?: Array<{
    name: string;
    weight_g: number;
    calories: number;
  }>;
}

export interface WorkoutRoutine {
  id: string;
  title: string;
  category: 'HIIT' | 'Strength' | 'Core' | 'Mobility';
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  durationMinutes: number;
  caloriesBurned: number;
  exerciseCount: number;
  exercises: Array<{
    name: string;
    durationOrReps: string;
    restSeconds: number;
    tip: string;
  }>;
}

export interface CommunityPost {
  id: string;
  authorName: string;
  authorAvatar: string;
  timeAgo: string;
  content: string;
  postType: 'workout' | 'food' | 'steps' | 'general' | 'trophy_unlock';
  mediaUrl?: string;
  metricBadge?: string;
  trophyData?: {
    title: string;
    tier: TrophyTier;
    category: AchievementCategory;
  };
  likesCount: number;
  commentsCount: number;
  hasLiked: boolean;
}

// --------------------------------------------------------------------
// 6. ACTIVITY TRACKING & LIVE WORKOUT RECORDING
// --------------------------------------------------------------------
export type SportType =
  | 'running'
  | 'cycling'
  | 'walking'
  | 'hiking'
  | 'weight_training';

export type ActivityPrivacy = 'public' | 'followers' | 'private';

export interface GPSPoint {
  latitude: number;
  longitude: number;
  altitude?: number;
  timestamp: number;
  speed?: number; // m/s
  accuracy?: number; // meters
}

export type HeartRateZone = 'warmup' | 'fat_burn' | 'cardio' | 'peak';

export interface HeartRateSummary {
  avgBpm: number;
  maxBpm: number;
  sensorConnected: boolean;
  sensorName?: string;
  zones?: {
    warmupSec: number;
    fatBurnSec: number;
    cardioSec: number;
    peakSec: number;
  };
}

export interface WeightTrainingData {
  setsCount: number;
  repsTotal: number;
  exerciseName: string;
  restTimeSeconds: number;
}

export interface KmSplit {
  km: number;
  pace: string;
  paceSeconds: number;
  elevationMeters: number;
  heartRate?: number;
  barPercentage: number;
}

export interface RaceGapPoint {
  distanceKm: number;
  gapPedroSec: number;
  gapJimenaSec: number;
  paceDiffSec: number;
}

export interface ActivityPauseEvent {
  type: 'pause' | 'resume';
  timestamp: string;
}

export interface RecordedActivity {
  id: string;
  userId: string;
  title: string;
  notes?: string;
  locationName?: string;
  sportType: SportType;
  startTime: string;
  endTime: string;
  durationSeconds: number;
  activeDurationSeconds: number;
  elapsedDurationSeconds?: number;
  totalSteps?: number;
  pauseEvents?: ActivityPauseEvent[];
  distanceKm: number;
  caloriesBurned: number;
  avgPaceSecPerKm?: number;
  avgSpeedKmh?: number;
  elevationGainMeters?: number;
  heartRate?: HeartRateSummary;
  routeCoordinates: GPSPoint[];
  splits?: KmSplit[];
  isPersonalRecord?: boolean;
  prBadgeText?: string;
  weightTrainingData?: WeightTrainingData;
  privacy: ActivityPrivacy;
  createdAt: string;
}

// --------------------------------------------------------------------
// 7. PER-USER ISOLATED FITNESS STATISTICS
// --------------------------------------------------------------------
export interface UserFitnessStats {
  userId: string;
  totalActivities: number;
  totalDistanceKm: number;
  totalDurationMinutes: number;
  totalCaloriesBurned: number;
  streakDays: number;
  todaySteps: number;
  todayStepGoal: number;
  todayCalories: number;
  todayWaterMl: number;
  todayWaterGoalMl: number;
  lastActiveDate?: string;
}
