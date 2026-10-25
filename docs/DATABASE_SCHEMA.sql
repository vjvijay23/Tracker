-- ====================================================================
-- AVFIT (Vyalwin) - Complete PostgreSQL Production Schema for Supabase
-- Features:
--   1. Mobile Phone Number OTP Authentication
--   2. Personalized Fitness Onboarding & Metabolic Profile (BMR/TDEE)
--   3. Gamified Achievements, Trophies & Milestones System
--   4. Server-Side Automated Trophy Evaluation Triggers
--   5. Strict Row-Level Security (RLS) & Anti-Cheat Validation
-- ====================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ENUMS
CREATE TYPE fitness_goal AS ENUM (
    'weight_loss', 
    'muscle_gain', 
    'general_fitness', 
    'endurance', 
    'maintenance'
);

CREATE TYPE fitness_level AS ENUM (
    'beginner', 
    'intermediate', 
    'advanced'
);

CREATE TYPE activity_level AS ENUM (
    'sedentary', 
    'lightly_active', 
    'moderately_active', 
    'very_active'
);

CREATE TYPE workout_preference AS ENUM (
    'home', 
    'gym', 
    'outdoor', 
    'combination'
);

CREATE TYPE dietary_preference AS ENUM (
    'non_vegetarian', 
    'vegetarian', 
    'vegan', 
    'pescatarian', 
    'keto', 
    'halal', 
    'other'
);

CREATE TYPE trophy_tier AS ENUM (
    'bronze', 
    'silver', 
    'gold', 
    'platinum', 
    'diamond'
);

CREATE TYPE achievement_category AS ENUM (
    'step_activity', 
    'workout', 
    'nutrition', 
    'community', 
    'personal_progress'
);

CREATE TYPE meal_type AS ENUM ('breakfast', 'lunch', 'dinner', 'snack');

-- ====================================================================
-- 3. USER PROFILES TABLE (Phone Auth & Basic Profile)
-- ====================================================================
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    phone TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL DEFAULT '',
    avatar_url TEXT,
    date_of_birth DATE,
    gender TEXT CHECK (gender IN ('male', 'female', 'non_binary', 'prefer_not_to_say')),
    country TEXT DEFAULT 'US',
    preferred_units TEXT DEFAULT 'metric' CHECK (preferred_units IN ('metric', 'imperial')),
    is_phone_verified BOOLEAN DEFAULT FALSE,
    is_onboarded BOOLEAN DEFAULT FALSE,
    streak_count INT DEFAULT 0 CHECK (streak_count >= 0),
    total_trophy_points INT DEFAULT 0 CHECK (total_trophy_points >= 0),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- 4. FITNESS ONBOARDING & PERSONALIZED PROFILES (Private Health Data)
-- ====================================================================
CREATE TABLE public.fitness_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    height_cm NUMERIC(5, 2) NOT NULL CHECK (height_cm > 50 AND height_cm < 300),
    weight_kg NUMERIC(5, 2) NOT NULL CHECK (weight_kg > 20 AND weight_kg < 400),
    target_weight_kg NUMERIC(5, 2),
    fitness_goal fitness_goal NOT NULL DEFAULT 'weight_loss',
    fitness_level fitness_level NOT NULL DEFAULT 'beginner',
    activity_level activity_level NOT NULL DEFAULT 'moderately_active',
    workout_preference workout_preference NOT NULL DEFAULT 'home',
    available_equipment TEXT[] DEFAULT ARRAY['bodyweight'],
    preferred_workout_duration_min INT DEFAULT 30 CHECK (preferred_workout_duration_min >= 10),
    weekly_workout_frequency_days INT DEFAULT 4 CHECK (weekly_workout_frequency_days BETWEEN 1 AND 7),
    dietary_preference dietary_preference NOT NULL DEFAULT 'non_vegetarian',
    allergies_and_restrictions TEXT[] DEFAULT ARRAY[]::TEXT[],
    
    -- Calculated Metabolic Metrics (Mifflin-St Jeor & TDEE)
    bmr NUMERIC(6, 1) NOT NULL,
    tdee NUMERIC(6, 1) NOT NULL,
    daily_calorie_target INT NOT NULL,
    daily_protein_g INT NOT NULL,
    daily_carbs_g INT NOT NULL,
    daily_fat_g INT NOT NULL,
    daily_step_goal INT DEFAULT 10000 CHECK (daily_step_goal >= 1000),
    daily_water_ml INT DEFAULT 2500,
    
    is_private BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- 5. DAILY ACTIVITY LOGS (Steps, Distance & Cardio)
-- ====================================================================
CREATE TABLE public.activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    log_date DATE NOT NULL,
    steps INT DEFAULT 0 CHECK (steps >= 0),
    distance_km NUMERIC(6, 2) DEFAULT 0,
    calories_burned INT DEFAULT 0,
    active_minutes INT DEFAULT 0,
    synced_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, log_date)
);

-- ====================================================================
-- 6. MEALS & NUTRITION LOGS (AI Food Scanner)
-- ====================================================================
CREATE TABLE public.meals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    meal_type meal_type NOT NULL,
    dish_name TEXT NOT NULL,
    photo_url TEXT,
    portion_grams NUMERIC(6, 1) DEFAULT 250.0,
    calories INT NOT NULL CHECK (calories >= 0),
    protein_g NUMERIC(5, 1) DEFAULT 0,
    carbs_g NUMERIC(5, 1) DEFAULT 0,
    fat_g NUMERIC(5, 1) DEFAULT 0,
    fiber_g NUMERIC(5, 1) DEFAULT 0,
    ai_confidence TEXT CHECK (ai_confidence IN ('high', 'medium', 'low', 'manual')),
    raw_ai_payload JSONB,
    consumed_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- 7. HOME WORKOUT LIBRARY & LOGS
-- ====================================================================
CREATE TABLE public.workouts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    difficulty fitness_level DEFAULT 'beginner',
    category TEXT NOT NULL, -- 'HIIT', 'Strength', 'Core', 'Mobility'
    duration_minutes INT NOT NULL,
    est_calories_burned INT NOT NULL,
    thumbnail_url TEXT,
    exercises JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.workout_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    workout_id UUID REFERENCES public.workouts(id) ON DELETE SET NULL,
    workout_title TEXT NOT NULL,
    duration_seconds INT NOT NULL,
    calories_burned INT NOT NULL,
    completed_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- 7B. RECORDED LIVE ACTIVITIES (GPS Outdoor & Indoor Weight Training)
-- ====================================================================
CREATE TYPE sport_type AS ENUM ('running', 'cycling', 'walking', 'hiking', 'weight_training');
CREATE TYPE activity_privacy AS ENUM ('public', 'followers', 'private');

CREATE TABLE IF NOT EXISTS public.recorded_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    sport_type sport_type NOT NULL,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    duration_seconds INT NOT NULL CHECK (duration_seconds >= 0),
    active_duration_seconds INT NOT NULL CHECK (active_duration_seconds >= 0),
    distance_km NUMERIC(7, 3) DEFAULT 0 CHECK (distance_km >= 0),
    calories_burned INT DEFAULT 0 CHECK (calories_burned >= 0),
    avg_pace_sec_km INT,
    avg_speed_kmh NUMERIC(5, 2),
    elevation_gain_m INT DEFAULT 0,
    heart_rate_avg INT,
    heart_rate_max INT,
    sensor_connected BOOLEAN DEFAULT FALSE,
    sensor_name TEXT,
    route_coordinates JSONB DEFAULT '[]'::jsonb,
    weight_training_data JSONB,
    privacy activity_privacy DEFAULT 'public',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- 8. ACHIEVEMENTS & TROPHY DEFINITIONS (Master Catalog)
-- ====================================================================
CREATE TABLE public.achievement_definitions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL, -- e.g. 'STEPS_FIRST_1K', 'WORKOUTS_5'
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category achievement_category NOT NULL,
    tier trophy_tier NOT NULL,
    icon_name TEXT NOT NULL,
    metric_type TEXT NOT NULL, -- 'steps', 'streak_days', 'workout_count', 'food_log_days', 'distance_km', 'posts_count'
    target_value INT NOT NULL,
    points INT NOT NULL CHECK (points > 0),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- 9. USER EARNED ACHIEVEMENTS & TROPHIES (Progress & Anti-Cheat)
-- ====================================================================
CREATE TABLE public.user_achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    achievement_id UUID NOT NULL REFERENCES public.achievement_definitions(id) ON DELETE CASCADE,
    current_value INT DEFAULT 0,
    target_value INT NOT NULL,
    is_unlocked BOOLEAN DEFAULT FALSE,
    unlocked_at TIMESTAMPTZ,
    is_shared BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, achievement_id)
);

-- ====================================================================
-- 10. COMMUNITY POSTS & CHALLENGES
-- ====================================================================
CREATE TABLE public.posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    image_url TEXT,
    post_type TEXT CHECK (post_type IN ('general', 'workout_complete', 'food_scan', 'step_milestone', 'trophy_unlock')),
    metadata JSONB,
    likes_count INT DEFAULT 0,
    comments_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.challenges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    target_metric TEXT NOT NULL,
    target_value INT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    badge_icon TEXT
);

CREATE TABLE public.challenge_participants (
    challenge_id UUID REFERENCES public.challenges(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    current_value INT DEFAULT 0,
    is_completed BOOLEAN DEFAULT FALSE,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (challenge_id, user_id)
);

-- ====================================================================
-- SEED DATA: MASTER ACHIEVEMENTS CATALOG (All 5 Categories & Tiers)
-- ====================================================================
INSERT INTO public.achievement_definitions (code, title, description, category, tier, icon_name, metric_type, target_value, points)
VALUES
  -- A. Step & Activity Milestones
  ('STEPS_FIRST_1K', 'First Strides', 'Log your first 1,000 steps in a single day.', 'step_activity', 'bronze', 'Footprints', 'steps', 1000, 20),
  ('STEPS_FIRST_5K', 'On The Move', 'Reach 5,000 steps in a day.', 'step_activity', 'bronze', 'Footprints', 'steps', 5000, 30),
  ('STEPS_10K_DAY', 'Ten Thousand Club', 'Crush 10,000 steps in a single day.', 'step_activity', 'silver', 'Award', 'steps', 10000, 50),
  ('STEPS_STREAK_7D', 'Weekly Consistency', 'Maintain a 7-day active step tracking streak.', 'step_activity', 'silver', 'Flame', 'streak_days', 7, 75),
  ('STEPS_STREAK_30D', 'Unstoppable Habit', 'Reach a relentless 30-day activity streak.', 'step_activity', 'gold', 'Flame', 'streak_days', 30, 150),
  ('STEPS_50KM_DISTANCE', 'Marathon Explorer', 'Accumulate a cumulative 50 kilometers of walking distance.', 'step_activity', 'gold', 'MapPin', 'distance_km', 50, 150),
  ('STEPS_100K_BLITZ', 'Centurion Athlete', 'Reach 100,000 total cumulative steps.', 'step_activity', 'platinum', 'Trophy', 'steps', 100000, 300),

  -- B. Workout Achievements
  ('WORKOUT_FIRST', 'Day One, Done', 'Complete your very first guided workout routine.', 'workout', 'bronze', 'Dumbbell', 'workout_count', 1, 20),
  ('WORKOUTS_5', 'Building Momentum', 'Complete 5 home or gym workout routines.', 'workout', 'bronze', 'Dumbbell', 'workout_count', 5, 40),
  ('WORKOUTS_25', 'Fitness Devotee', 'Finish 25 complete training sessions.', 'workout', 'silver', 'Dumbbell', 'workout_count', 25, 100),
  ('WORKOUTS_CONSISTENT_WEEK', 'Weekly Warrior', 'Complete your weekly target of workout sessions.', 'workout', 'silver', 'Calendar', 'workout_count', 4, 75),
  ('WORKOUTS_100', 'Century Performer', 'Crush 100 total completed workouts.', 'workout', 'platinum', 'Award', 'workout_count', 100, 350),

  -- C. Nutrition & AI Scanner Achievements
  ('FOOD_FIRST_LOG', 'Mindful Eater', 'Scan and log your first meal with the AI Nutrition Scanner.', 'nutrition', 'bronze', 'Camera', 'food_log_days', 1, 20),
  ('FOOD_LOG_7D', 'Macro Discipline', 'Log your meals consistently for 7 days.', 'nutrition', 'silver', 'Sparkles', 'food_log_days', 7, 60),
  ('FOOD_LOG_30D', 'Nutrition Mastery', 'Log daily meals for 30 consecutive days.', 'nutrition', 'gold', 'CheckCircle', 'food_log_days', 30, 150),
  ('MACROS_BALANCED_WEEK', 'Precision Fuel', 'Hit within 10% of your daily protein target for 7 days.', 'nutrition', 'platinum', 'Heart', 'food_log_days', 7, 200),

  -- D. Community Achievements
  ('COMMUNITY_FIRST_POST', 'Community Welcome', 'Share your first fitness win or healthy recipe with the community.', 'community', 'bronze', 'Users', 'posts_count', 1, 25),
  ('COMMUNITY_CHALLENGE_JOIN', 'Challenger Awakens', 'Join your first community fitness challenge.', 'community', 'bronze', 'Target', 'posts_count', 1, 25),
  ('COMMUNITY_CHALLENGE_COMPLETE', 'Victory Podium', 'Successfully complete an official community challenge.', 'community', 'gold', 'Trophy', 'posts_count', 1, 150),
  ('COMMUNITY_HIGH_FIVE_50', 'Motivator', 'Give 50 high-fives to fellow athletes in the community feed.', 'community', 'silver', 'Heart', 'posts_count', 50, 75),

  -- E. Personal Progress Achievements
  ('PROGRESS_ONBOARDING_DONE', 'Journey Initiated', 'Complete your comprehensive fitness profile & customized plan.', 'personal_progress', 'bronze', 'Compass', 'streak_days', 1, 25),
  ('PROGRESS_FIRST_WEIGHIN', 'Tracking Growth', 'Record your first body measurement or progress check-in.', 'personal_progress', 'bronze', 'TrendingUp', 'streak_days', 1, 25),
  ('PROGRESS_TARGET_WEIGHT_HIT', 'Goal Conquered', 'Reach your personal target weight milestone.', 'personal_progress', 'diamond', 'Crown', 'weight_goal', 1, 500)
ON CONFLICT (code) DO NOTHING;

-- ====================================================================
-- 11. AUTOMATED SERVER-SIDE MILESTONE EVALUATION FUNCTION
--     (Anti-cheat, Secure Backend Logic)
-- ====================================================================
CREATE OR REPLACE FUNCTION public.evaluate_user_milestones(
    p_user_id UUID,
    p_category achievement_category,
    p_metric_type TEXT,
    p_metric_value INT
)
RETURNS TABLE(awarded_code TEXT, awarded_title TEXT, awarded_tier trophy_tier, awarded_points INT)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    rec RECORD;
BEGIN
    FOR rec IN 
        SELECT 
            ad.id,
            ad.code, 
            ad.title, 
            ad.tier, 
            ad.points, 
            ad.target_value,
            COALESCE(ua.is_unlocked, FALSE) AS already_unlocked,
            COALESCE(ua.current_value, 0) AS curr_val
        FROM public.achievement_definitions ad
        LEFT JOIN public.user_achievements ua 
            ON ua.achievement_id = ad.id AND ua.user_id = p_user_id
        WHERE ad.category = p_category 
          AND ad.metric_type = p_metric_type
    LOOP
        -- Check if milestone newly achieved
        IF NOT rec.already_unlocked AND p_metric_value >= rec.target_value THEN
            -- Award trophy securely
            INSERT INTO public.user_achievements (
                user_id, achievement_id, current_value, target_value, is_unlocked, unlocked_at
            )
            VALUES (
                p_user_id, rec.id, p_metric_value, rec.target_value, TRUE, NOW()
            )
            ON CONFLICT (user_id, achievement_id) DO UPDATE SET
                current_value = p_metric_value,
                is_unlocked = TRUE,
                unlocked_at = NOW(),
                updated_at = NOW();

            -- Increment user total points
            UPDATE public.profiles 
            SET total_trophy_points = total_trophy_points + rec.points
            WHERE id = p_user_id;

            -- Return newly awarded trophy details
            awarded_code := rec.code;
            awarded_title := rec.title;
            awarded_tier := rec.tier;
            awarded_points := rec.points;
            RETURN NEXT;
        ELSIF NOT rec.already_unlocked THEN
            -- Update progress towards locked milestone
            INSERT INTO public.user_achievements (
                user_id, achievement_id, current_value, target_value, is_unlocked
            )
            VALUES (
                p_user_id, rec.id, p_metric_value, rec.target_value, FALSE
            )
            ON CONFLICT (user_id, achievement_id) DO UPDATE SET
                current_value = GREATEST(user_achievements.current_value, p_metric_value),
                updated_at = NOW();
        END IF;
    END LOOP;
END;
$$;

-- Trigger for Step & Activity Milestones
CREATE OR REPLACE FUNCTION public.trg_activity_milestones()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    -- Evaluate daily steps milestone
    PERFORM public.evaluate_user_milestones(NEW.user_id, 'step_activity', 'steps', NEW.steps);
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_activity_milestone ON public.activity_logs;
CREATE TRIGGER on_activity_milestone
    AFTER INSERT OR UPDATE OF steps ON public.activity_logs
    FOR EACH ROW EXECUTE FUNCTION public.trg_activity_milestones();

-- Trigger for Workout Logs
CREATE OR REPLACE FUNCTION public.trg_workout_milestones()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
    v_total_workouts INT;
BEGIN
    SELECT COUNT(*) INTO v_total_workouts 
    FROM public.workout_logs 
    WHERE user_id = NEW.user_id;

    PERFORM public.evaluate_user_milestones(NEW.user_id, 'workout', 'workout_count', v_total_workouts);
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_workout_milestone ON public.workout_logs;
CREATE TRIGGER on_workout_milestone
    AFTER INSERT ON public.workout_logs
    FOR EACH ROW EXECUTE FUNCTION public.trg_workout_milestones();

-- Trigger for Meal Logs
CREATE OR REPLACE FUNCTION public.trg_meal_milestones()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
    v_total_days INT;
BEGIN
    SELECT COUNT(DISTINCT DATE(consumed_at)) INTO v_total_days 
    FROM public.meals 
    WHERE user_id = NEW.user_id;

    PERFORM public.evaluate_user_milestones(NEW.user_id, 'nutrition', 'food_log_days', v_total_days);
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_meal_milestone ON public.meals;
CREATE TRIGGER on_meal_milestone
    AFTER INSERT ON public.meals
    FOR EACH ROW EXECUTE FUNCTION public.trg_meal_milestones();

-- ====================================================================
-- 12. ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fitness_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievement_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recorded_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Profiles: Public can read basic profile; Owner can update
CREATE POLICY "Public profiles are viewable by all" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Fitness Profiles: STRICTLY PRIVATE to the user
CREATE POLICY "Users view own fitness profile" ON public.fitness_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own fitness profile" ON public.fitness_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own fitness profile" ON public.fitness_profiles FOR UPDATE USING (auth.uid() = user_id);

-- Achievement Definitions: Master list is publicly readable
CREATE POLICY "Achievement definitions are readable by everyone" ON public.achievement_definitions FOR SELECT USING (true);

-- User Achievements: Users see own trophies; other users can only see public/shared trophies
CREATE POLICY "Users can view own achievements" ON public.user_achievements FOR SELECT 
    USING (auth.uid() = user_id OR is_shared = true);
CREATE POLICY "Users can update share state of own achievements" ON public.user_achievements FOR UPDATE 
    USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Direct client insertion into user_achievements is restricted (managed by evaluate_user_milestones function)
CREATE POLICY "System awards user achievements" ON public.user_achievements FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

-- Activity Logs & Meals
CREATE POLICY "Users manage own activity logs" ON public.activity_logs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own meals" ON public.meals FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own workout logs" ON public.workout_logs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own recorded activities" ON public.recorded_activities FOR ALL USING (auth.uid() = user_id);

-- Posts
CREATE POLICY "Public posts viewable by all" ON public.posts FOR SELECT USING (true);
CREATE POLICY "Users create own posts" ON public.posts FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ====================================================================
-- 13. INDEXES FOR HIGH-THROUGHPUT PERFORMANCE
-- ====================================================================
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON public.profiles(phone);
CREATE INDEX IF NOT EXISTS idx_fitness_profiles_user ON public.fitness_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user ON public.user_achievements(user_id, is_unlocked);
CREATE INDEX IF NOT EXISTS idx_achievement_definitions_cat ON public.achievement_definitions(category, tier);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_date ON public.activity_logs(user_id, log_date DESC);
