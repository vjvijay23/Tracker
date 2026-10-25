# FitPulse Mobile Application - Product Requirements Document (PRD)

**Version:** 1.0.0  
**Target Platform:** Mobile First (React Native for Android & iOS)  
**Authors:** FitPulse Core Team (2-Developer Sprint)  
**Status:** Approved for MVP Execution  

---

## 1. Executive Summary & Vision

### 1.1 Problem Statement
Modern fitness enthusiasts are forced to juggle 3–5 different specialized apps to manage their daily health journey:
- A pedometer app (e.g., Google Fit / Apple Health) for step counts.
- A calorie-tracking app (e.g., MyFitnessPal) requiring tedious manual logging and paywalled barcode scanners.
- A home workout app (e.g., Nike Training Club) for exercise routines.
- A social fitness network (e.g., Strava) for peer motivation and leaderboards.

This fragmented experience leads to app fatigue, inconsistent logging, and abandoned fitness goals.

### 1.2 The Solution: FitPulse
**FitPulse** is an all-in-one native mobile application that unifies:
1. Continuous background step & activity tracking with Strava-inspired leaderboards.
2. AI-powered instant food photo analysis and macro/calorie estimation.
3. Personalized diet plans based on individual metabolic profile (BMR/TDEE).
4. Interactive home workout routines with audio-guided rest timers.
5. An inspiring social community feed with high-fives, comments, and challenges.
6. A single unified dashboard displaying the complete health journey.

---

## 2. User Personas

| Persona | Needs & Goals | Pain Points with Existing Apps | How FitPulse Solves It |
|---|---|---|---|
| **Alex (26, Office Worker)** | Wants to lose 8kg, hit 10k steps daily, and improve posture via quick 15-min home routines. | Too tired to type in 10 food ingredients every lunch; gives up on calorie counting. | AI camera scans his plate in 3 seconds; step streak widget keeps him accountable. |
| **Priya (22, College Student)** | Wants to build lean muscle, track protein intake, and stay motivated with friends. | Expensive fitness subscriptions; loneliness during home workouts. | Free personalized macro targets, community feed to share workout selfies, and weekly friend challenges. |
| **David (34, Busy Parent)** | Zero gym access; needs effective bodyweight workouts and simple meal guidance. | Complicated workout routines requiring dumbbells; disjointed habit tracking. | No-equipment home workouts with built-in rest timers; unified daily health score. |

---

## 3. Detailed Feature Specifications

### Module 1: Unified Fitness Dashboard
- **Daily Rings / Progress Circles:**
  - Steps Ring (Current / Daily Goal e.g., 7,420 / 10,000)
  - Active Calories Burned (e.g., 420 kcal)
  - Calories Consumed vs. Target (e.g., 1,650 / 2,100 kcal)
  - Water Intake Tracker (Tap to add 250ml glass)
- **Macronutrient Breakdown Bar:** Visual progress of Protein, Carbs, and Fats with remaining grams.
- **Active Streak Card:** Visual badge displaying consecutive days active (steps + food log + workout).
- **Today's Scheduled Workout Preview:** One-tap jump into today's planned session.
- **Quick Action Bar:** Floating action button (FAB) for "Scan Food", "Start Workout", or "Post to Community".

### Module 2: Step & Activity Tracking
- **Hardware Sensor Integration:** Uses native device pedometer via `expo-sensors` (`Pedometer` API) on Android/iOS.
- **Background Tracking:** Persists daily step metrics locally and syncs to Supabase on network connectivity.
- **Metric Calculations:**
  - Distance: Estimated via step length formula ($Distance = Steps \times 0.762m$).
  - Caloric Burn: Estimated using MET values based on user weight and walking speed.
- **Leaderboards & Challenges:**
  - Strava-style weekly leaderboard ranking friends and community members.
  - Active challenge cards (e.g. "Weekend 20K Step Blitz").

### Module 3: AI Food Scanner & Nutrition Calculator
- **Camera Capture / Gallery Picker:** Native camera module (`expo-camera`) to snap photo of meal.
- **Multimodal AI Analysis:** Image submitted to Google Gemini 1.5 Flash API with custom nutrition prompt.
- **Extracted Fields:**
  - Primary dish identification (e.g., "Grilled Salmon with Quinoa and Steamed Broccoli").
  - Ingredient breakdown with estimated portion sizes (grams/oz).
  - Calculated Nutritional Values: Total Calories, Protein (g), Carbohydrates (g), Total Fat (g), Dietary Fiber (g).
  - Confidence rating (High / Medium / Low).
- **User Correction Modal:**
  - Tap any ingredient or portion to adjust slider (e.g., change 150g to 200g).
  - Automatic proportional recalculation of macros.
- **Food Diary Log:** Saved to user's daily nutrition log (Breakfast, Lunch, Dinner, Snack).

### Module 4: Personalized Diet & Nutrition Plans
- **Onboarding Metabolic Profiler:**
  - Inputs: Age, Gender, Height, Current Weight, Target Weight, Activity Level (Sedentary, Light, Moderate, Very Active), Goal (Fat Loss, Maintenance, Muscle Gain).
  - Formula: Mifflin-St Jeor Equation for Basal Metabolic Rate (BMR) + Activity Multiplier = Total Daily Energy Expenditure (TDEE).
  - Macro Splits:
    - *Muscle Gain:* 30% Protein, 45% Carbs, 25% Fat.
    - *Fat Loss:* 35% Protein, 35% Carbs, 30% Fat.
    - *Maintenance:* 25% Protein, 50% Carbs, 25% Fat.
- **Meal Suggestions:** AI-curated recipes meeting user calorie/macro budget and dietary constraints (Veg, Vegan, Keto, Halal, etc.).

### Module 5: Home Workout Plans
- **Workout Library:**
  - Filter by category: Full Body HIIT, Core & Abs, Upper Body Push, Lower Body Tone, Mobility & Stretch.
  - Filter by level: Beginner (10-15m), Intermediate (20-30m), Advanced (35-45m).
  - Equipment Filter: Bodyweight only, Resistance band, Dumbbell optional.
- **Interactive Exercise Player:**
  - Clean video/GIF animation demonstration for each exercise.
  - Rep count or countdown timer.
  - Guided Rest Timer: 30s/45s/60s rest countdown with haptic feedback & chime.
  - One-tap "Next Exercise" and "Complete Workout".
- **Post-Workout Summary:** Calories burned estimate, total duration, heart rate zone indicator, and "Share to Community" prompt.

### Module 6: Fitness Community & Social Feed
- **Feed Stream:** Chronological & trending posts from followed friends and local community.
- **Rich Post Types:**
  - Workout Achievement (e.g., "Alex crushed 20-min HIIT + 310 kcal!").
  - Food & Meal Inspiration (AI scan photo + macro pill overlay).
  - Step Milestones (e.g., "Hit 15,000 steps today!").
- **Social Engagement:**
  - High-Five (Like) button with dynamic animation.
  - Comment threads with notifications.
  - User Profiles displaying badges earned, current streak, and weekly step average.

---

## 4. Non-Functional Requirements

- **Performance:** App initial load under 2.5s; screen transition frame rate 60 FPS.
- **Offline First:** Step tracking and cached workout routines must work seamlessly without active internet connection; sync queues automatically when network reconnects.
- **Security & Privacy:**
  - User health data strictly sandboxed.
  - Row Level Security (RLS) on Supabase ensuring users can only view their own private health logs.
  - Public community posts opt-in by explicit toggle.
- **Cost Ceiling:** \$0 operational baseline during MVP validation (Supabase free tier + Gemini API free tier + Expo free tier).
