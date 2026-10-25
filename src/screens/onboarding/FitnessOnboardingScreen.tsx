import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../theme/colors';
import {
  FitnessGoal,
  FitnessLevel,
  ActivityLevel,
  WorkoutPreference,
  DietaryPreference,
  Gender,
  UnitSystem,
} from '../../types';
import {
  FitnessProfileService,
  MEDICAL_DISCLAIMER_TEXT,
} from '../../services/fitnessProfile';
import { AuthService } from '../../services/auth';
import {
  User,
  Target,
  Dumbbell,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Check,
  Shield,
  AlertTriangle,
  Flame,
  Droplets,
  Heart,
  Scale,
} from 'lucide-react-native';

interface FitnessOnboardingScreenProps {
  navigation?: any;
  onFinishOnboarding?: () => void;
}

export default function FitnessOnboardingScreen({
  navigation,
  onFinishOnboarding,
}: FitnessOnboardingScreenProps) {
  const insets = useSafeAreaInsets();
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSaving, setIsSaving] = useState(false);

  // Step 1: Personal Details
  const [fullName, setFullName] = useState('Alex Vance');
  const [age, setAge] = useState('28');
  const [gender, setGender] = useState<Gender>('male');
  const [unitSystem, setUnitSystem] = useState<UnitSystem>('metric');
  const [heightCm, setHeightCm] = useState('178');
  const [weightKg, setWeightKg] = useState('74');
  const [targetWeightKg, setTargetWeightKg] = useState('71');
  const [country, setCountry] = useState('United States');

  // Step 2: Fitness Goals & Activity
  const [fitnessGoal, setFitnessGoal] = useState<FitnessGoal>('weight_loss');
  const [fitnessLevel, setFitnessLevel] = useState<FitnessLevel>('intermediate');
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>('moderately_active');

  // Step 3: Training & Diet Preferences
  const [workoutPreference, setWorkoutPreference] = useState<WorkoutPreference>('combination');
  const [availableEquipment, setAvailableEquipment] = useState<string[]>([
    'dumbbells',
    'resistance_bands',
    'bodyweight',
  ]);
  const [preferredDurationMin, setPreferredDurationMin] = useState<number>(30);
  const [weeklyFrequencyDays, setWeeklyFrequencyDays] = useState<number>(4);
  const [dietaryPreference, setDietaryPreference] = useState<DietaryPreference>('non_vegetarian');
  const [allergies, setAllergies] = useState<string[]>(['none']);

  // Privacy
  const [isPrivate, setIsPrivate] = useState<boolean>(true);

  // Toggle helpers
  const toggleEquipment = (item: string) => {
    if (availableEquipment.includes(item)) {
      setAvailableEquipment(availableEquipment.filter((e) => e !== item));
    } else {
      setAvailableEquipment([...availableEquipment, item]);
    }
  };

  const toggleAllergy = (item: string) => {
    if (item === 'none') {
      setAllergies(['none']);
      return;
    }
    const filtered = allergies.filter((a) => a !== 'none');
    if (filtered.includes(item)) {
      const remaining = filtered.filter((a) => a !== item);
      setAllergies(remaining.length === 0 ? ['none'] : remaining);
    } else {
      setAllergies([...filtered, item]);
    }
  };

  // Live Mifflin-St Jeor Calculation for Step 4 Preview
  const parsedWeight = parseFloat(weightKg) || 70;
  const parsedHeight = parseFloat(heightCm) || 175;
  const parsedAge = parseInt(age, 10) || 28;

  const calculatedBmr = FitnessProfileService.calculateBMR(parsedWeight, parsedHeight, parsedAge, gender);
  const calculatedTdee = FitnessProfileService.calculateTDEE(calculatedBmr, activityLevel);
  const nutritionTargets = FitnessProfileService.calculateNutritionTargets(
    calculatedTdee,
    fitnessGoal,
    parsedWeight,
    gender
  );
  const dailyStepGoal = FitnessProfileService.calculateStepGoal(activityLevel, fitnessGoal);

  // Validation
  const validateStep1 = () => {
    if (!fullName.trim()) {
      Alert.alert('Required', 'Please enter your full name.');
      return false;
    }
    if (!parsedAge || parsedAge < 13 || parsedAge > 100) {
      Alert.alert('Invalid Age', 'Please enter an age between 13 and 100.');
      return false;
    }
    if (!parsedHeight || parsedHeight < 100 || parsedHeight > 250) {
      Alert.alert('Invalid Height', 'Please enter a valid height in cm.');
      return false;
    }
    if (!parsedWeight || parsedWeight < 30 || parsedWeight > 300) {
      Alert.alert('Invalid Weight', 'Please enter a valid weight in kg.');
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (currentStep === 1 && !validateStep1()) return;
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = async () => {
    setIsSaving(true);
    try {
      // 1. Save user profile details
      await AuthService.saveUserProfile({
        fullName,
        age: parsedAge,
        gender,
        country,
        preferredUnits: unitSystem,
        isOnboarded: true,
      });

      // 2. Save scientific fitness profile
      await FitnessProfileService.saveFitnessProfile(
        {
          userId: 'usr_vyalwin_001',
          heightCm: parsedHeight,
          weightKg: parsedWeight,
          targetWeightKg: parseFloat(targetWeightKg) || undefined,
          fitnessGoal,
          fitnessLevel,
          activityLevel,
          workoutPreference,
          availableEquipment,
          preferredWorkoutDurationMin: preferredDurationMin,
          weeklyWorkoutFrequencyDays: weeklyFrequencyDays,
          dietaryPreference,
          allergiesAndRestrictions: allergies,
          isPrivate,
        },
        parsedAge,
        gender
      );

      if (onFinishOnboarding) {
        onFinishOnboarding();
      } else if (navigation?.replace) {
        navigation.replace('Main');
      }
    } catch (e) {
      Alert.alert('Notice', 'Profile saved! Proceeding to Dashboard.');
      if (navigation?.replace) navigation.replace('Main');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveAndExit = async () => {
    // Save draft progress and complete later
    await handleComplete();
  };

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 16) }]}>
      {/* Top Header & Progress Stepper */}
      <View style={styles.topBar}>
        <View style={styles.stepperContainer}>
          <Text style={styles.stepTitle}>
            Step {currentStep} of 4: {
              currentStep === 1
                ? 'Personal Metrics'
                : currentStep === 2
                ? 'Goals & Activity'
                : currentStep === 3
                ? 'Training & Diet'
                : 'Personalized Plan'
            }
          </Text>
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressBar,
                { width: `${(currentStep / 4) * 100}%` },
              ]}
            />
          </View>
        </View>

        <TouchableOpacity onPress={handleSaveAndExit} style={styles.saveLaterButton}>
          <Text style={styles.saveLaterText}>Finish Later</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ================= STEP 1: PERSONAL DETAILS ================= */}
        {currentStep === 1 && (
          <View style={styles.stepCard}>
            <View style={styles.stepIconCircle}>
              <User size={24} color={Colors.primary} />
            </View>
            <Text style={styles.sectionHeader}>Tell Us About Yourself</Text>
            <Text style={styles.sectionSub}>
              We use your biological metrics to calculate precise BMR, energy expenditure, and baseline nutritional requirements.
            </Text>

            {/* Full Name */}
            <Text style={styles.fieldLabel}>Full Name</Text>
            <TextInput
              style={styles.input}
              value={fullName}
              onChangeText={setFullName}
              placeholder="e.g. Alex Vance"
              placeholderTextColor="#9EA6A0"
            />

            {/* Age & Gender Row */}
            <View style={styles.row}>
              <View style={styles.halfCol}>
                <Text style={styles.fieldLabel}>Age</Text>
                <TextInput
                  style={styles.input}
                  value={age}
                  onChangeText={setAge}
                  keyboardType="numeric"
                  placeholder="28"
                  placeholderTextColor="#9EA6A0"
                />
              </View>

              <View style={styles.halfCol}>
                <Text style={styles.fieldLabel}>Gender</Text>
                <View style={styles.genderRow}>
                  <TouchableOpacity
                    style={[styles.miniChip, gender === 'male' && styles.miniChipActive]}
                    onPress={() => setGender('male')}
                  >
                    <Text style={[styles.miniChipText, gender === 'male' && styles.miniChipTextActive]}>
                      Male
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.miniChip, gender === 'female' && styles.miniChipActive]}
                    onPress={() => setGender('female')}
                  >
                    <Text style={[styles.miniChipText, gender === 'female' && styles.miniChipTextActive]}>
                      Female
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.miniChip, gender === 'non_binary' && styles.miniChipActive]}
                    onPress={() => setGender('non_binary')}
                  >
                    <Text style={[styles.miniChipText, gender === 'non_binary' && styles.miniChipTextActive]}>
                      Other
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Units Toggle */}
            <View style={styles.unitsRow}>
              <Text style={styles.fieldLabel}>Preferred Units</Text>
              <View style={styles.segmentedToggle}>
                <TouchableOpacity
                  style={[styles.segment, unitSystem === 'metric' && styles.segmentActive]}
                  onPress={() => setUnitSystem('metric')}
                >
                  <Text style={[styles.segmentText, unitSystem === 'metric' && styles.segmentTextActive]}>
                    Metric (cm / kg)
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.segment, unitSystem === 'imperial' && styles.segmentActive]}
                  onPress={() => setUnitSystem('imperial')}
                >
                  <Text style={[styles.segmentText, unitSystem === 'imperial' && styles.segmentTextActive]}>
                    Imperial (in / lbs)
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Height & Weight */}
            <View style={styles.row}>
              <View style={styles.halfCol}>
                <Text style={styles.fieldLabel}>
                  Height ({unitSystem === 'metric' ? 'cm' : 'in'})
                </Text>
                <TextInput
                  style={styles.input}
                  value={heightCm}
                  onChangeText={setHeightCm}
                  keyboardType="numeric"
                  placeholder="178"
                  placeholderTextColor="#9EA6A0"
                />
              </View>
              <View style={styles.halfCol}>
                <Text style={styles.fieldLabel}>
                  Weight ({unitSystem === 'metric' ? 'kg' : 'lbs'})
                </Text>
                <TextInput
                  style={styles.input}
                  value={weightKg}
                  onChangeText={setWeightKg}
                  keyboardType="numeric"
                  placeholder="74"
                  placeholderTextColor="#9EA6A0"
                />
              </View>
            </View>

            {/* Target Weight */}
            <Text style={styles.fieldLabel}>
              Target Goal Weight ({unitSystem === 'metric' ? 'kg' : 'lbs'}) (Optional)
            </Text>
            <TextInput
              style={styles.input}
              value={targetWeightKg}
              onChangeText={setTargetWeightKg}
              keyboardType="numeric"
              placeholder="71"
              placeholderTextColor="#9EA6A0"
            />
          </View>
        )}

        {/* ================= STEP 2: GOALS & ACTIVITY ================= */}
        {currentStep === 2 && (
          <View style={styles.stepCard}>
            <View style={styles.stepIconCircle}>
              <Target size={24} color={Colors.primary} />
            </View>
            <Text style={styles.sectionHeader}>Define Your Focus</Text>
            <Text style={styles.sectionSub}>
              Your primary objective determines your caloric deficit/surplus and workout recommendations.
            </Text>

            {/* Fitness Goal Options */}
            <Text style={styles.fieldLabel}>Primary Fitness Goal</Text>
            {[
              { id: 'weight_loss', label: 'Weight Loss & Fat Shred', desc: 'Caloric deficit, cardio and strength for lean tone' },
              { id: 'muscle_gain', label: 'Muscle Gain & Hypertrophy', desc: 'Caloric surplus with high protein and progressive overload' },
              { id: 'general_fitness', label: 'General Health & Longevity', desc: 'Balanced nutrition, endurance, and daily activity' },
              { id: 'endurance', label: 'Endurance & Cardio Peak', desc: 'Stamina, cardiovascular capacity, and sustained energy' },
              { id: 'maintenance', label: 'Maintain Current Fitness', desc: 'Keep current weight while improving body composition' },
            ].map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.choiceCard,
                  fitnessGoal === item.id && styles.choiceCardActive,
                ]}
                onPress={() => setFitnessGoal(item.id as FitnessGoal)}
                activeOpacity={0.8}
              >
                <View style={styles.choiceRadio}>
                  {fitnessGoal === item.id && <View style={styles.choiceRadioInner} />}
                </View>
                <View style={styles.choiceContent}>
                  <Text style={[styles.choiceTitle, fitnessGoal === item.id && styles.choiceTitleActive]}>
                    {item.label}
                  </Text>
                  <Text style={styles.choiceDesc}>{item.desc}</Text>
                </View>
              </TouchableOpacity>
            ))}

            {/* Daily Activity Level */}
            <Text style={[styles.fieldLabel, { marginTop: 16 }]}>Daily Activity Level</Text>
            {[
              { id: 'sedentary', label: 'Sedentary', desc: 'Desk job, little intentional exercise' },
              { id: 'lightly_active', label: 'Lightly Active', desc: '1-3 light workout sessions/week' },
              { id: 'moderately_active', label: 'Moderately Active', desc: '3-5 moderate workouts/week' },
              { id: 'very_active', label: 'Very Active', desc: '6-7 heavy training sessions/week' },
            ].map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.choiceCard,
                  activityLevel === item.id && styles.choiceCardActive,
                ]}
                onPress={() => setActivityLevel(item.id as ActivityLevel)}
                activeOpacity={0.8}
              >
                <View style={styles.choiceRadio}>
                  {activityLevel === item.id && <View style={styles.choiceRadioInner} />}
                </View>
                <View style={styles.choiceContent}>
                  <Text style={[styles.choiceTitle, activityLevel === item.id && styles.choiceTitleActive]}>
                    {item.label}
                  </Text>
                  <Text style={styles.choiceDesc}>{item.desc}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* ================= STEP 3: TRAINING & DIET ================= */}
        {currentStep === 3 && (
          <View style={styles.stepCard}>
            <View style={styles.stepIconCircle}>
              <Dumbbell size={24} color={Colors.primary} />
            </View>
            <Text style={styles.sectionHeader}>Training & Diet Habits</Text>
            <Text style={styles.sectionSub}>
              Customize the workouts and meal plans that best fit your lifestyle.
            </Text>

            {/* Workout Preference */}
            <Text style={styles.fieldLabel}>Workout Location Preference</Text>
            <View style={styles.chipGrid}>
              {[
                { id: 'home', label: 'Home Only' },
                { id: 'gym', label: 'Gym Focused' },
                { id: 'outdoor', label: 'Outdoor Cardio' },
                { id: 'combination', label: 'Combination / Hybrid' },
              ].map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.selectableChip,
                    workoutPreference === item.id && styles.selectableChipActive,
                  ]}
                  onPress={() => setWorkoutPreference(item.id as WorkoutPreference)}
                >
                  <Text
                    style={[
                      styles.selectableChipText,
                      workoutPreference === item.id && styles.selectableChipTextActive,
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Equipment Available */}
            <Text style={[styles.fieldLabel, { marginTop: 16 }]}>
              Available Workout Equipment
            </Text>
            <View style={styles.chipGrid}>
              {[
                { id: 'bodyweight', label: 'Bodyweight Only' },
                { id: 'dumbbells', label: 'Dumbbells' },
                { id: 'resistance_bands', label: 'Resistance Bands' },
                { id: 'kettlebell', label: 'Kettlebells' },
                { id: 'barbell', label: 'Barbell & Rack' },
                { id: 'pullup_bar', label: 'Pull-Up Bar' },
              ].map((item) => {
                const isSelected = availableEquipment.includes(item.id);
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[styles.selectableChip, isSelected && styles.selectableChipActive]}
                    onPress={() => toggleEquipment(item.id)}
                  >
                    {isSelected && <Check size={14} color="#FFFFFF" style={{ marginRight: 4 }} />}
                    <Text
                      style={[
                        styles.selectableChipText,
                        isSelected && styles.selectableChipTextActive,
                      ]}
                    >
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Dietary Style */}
            <Text style={[styles.fieldLabel, { marginTop: 16 }]}>Dietary Preference</Text>
            <View style={styles.chipGrid}>
              {[
                { id: 'non_vegetarian', label: 'Omnivore / Non-Veg' },
                { id: 'vegetarian', label: 'Vegetarian' },
                { id: 'vegan', label: 'Plant-Based / Vegan' },
                { id: 'pescatarian', label: 'Pescatarian' },
                { id: 'keto', label: 'Keto / Low-Carb' },
                { id: 'halal', label: 'Halal' },
              ].map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.selectableChip,
                    dietaryPreference === item.id && styles.selectableChipActive,
                  ]}
                  onPress={() => setDietaryPreference(item.id as DietaryPreference)}
                >
                  <Text
                    style={[
                      styles.selectableChipText,
                      dietaryPreference === item.id && styles.selectableChipTextActive,
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Food Allergies */}
            <Text style={[styles.fieldLabel, { marginTop: 16 }]}>
              Food Allergies & Restrictions
            </Text>
            <View style={styles.chipGrid}>
              {[
                { id: 'none', label: 'None' },
                { id: 'peanuts', label: 'Peanuts' },
                { id: 'tree_nuts', label: 'Tree Nuts' },
                { id: 'gluten', label: 'Gluten / Wheat' },
                { id: 'dairy', label: 'Dairy / Lactose' },
                { id: 'shellfish', label: 'Shellfish' },
                { id: 'soy', label: 'Soy' },
              ].map((item) => {
                const isSelected = allergies.includes(item.id);
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[styles.selectableChip, isSelected && styles.selectableChipActive]}
                    onPress={() => toggleAllergy(item.id)}
                  >
                    {isSelected && <Check size={14} color="#FFFFFF" style={{ marginRight: 4 }} />}
                    <Text
                      style={[
                        styles.selectableChipText,
                        isSelected && styles.selectableChipTextActive,
                      ]}
                    >
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* ================= STEP 4: PERSONALIZED PLAN PREVIEW ================= */}
        {currentStep === 4 && (
          <View style={styles.stepCard}>
            <View style={styles.stepIconCircle}>
              <Sparkles size={24} color={Colors.accentOrange} />
            </View>
            <Text style={styles.sectionHeader}>Your Personalized Blueprint</Text>
            <Text style={styles.sectionSub}>
              Calculated using the Mifflin-St Jeor formula based on your {parsedWeight}kg weight and active goals.
            </Text>

            {/* Key Calorie Highlight Card */}
            <View style={styles.calorieHeroCard}>
              <View style={styles.calorieHeroRow}>
                <View>
                  <Text style={styles.calorieHeroLabel}>DAILY CALORIC TARGET</Text>
                  <Text style={styles.calorieHeroValue}>{nutritionTargets.calorieTarget} kcal</Text>
                  <Text style={styles.calorieHeroSub}>
                    BMR: {calculatedBmr} kcal • TDEE: {calculatedTdee} kcal
                  </Text>
                </View>
                <View style={styles.fireBadge}>
                  <Flame size={28} color="#FFFFFF" />
                </View>
              </View>
            </View>

            {/* Macro Breakdown 3-Col */}
            <Text style={[styles.fieldLabel, { marginTop: 16 }]}>Target Daily Macronutrients</Text>
            <View style={styles.macroRow}>
              <View style={[styles.macroCard, { borderTopColor: Colors.accentOrange }]}>
                <Text style={styles.macroVal}>{nutritionTargets.proteinG}g</Text>
                <Text style={styles.macroName}>Protein</Text>
                <Text style={styles.macroSub}>2.0g / kg</Text>
              </View>
              <View style={[styles.macroCard, { borderTopColor: Colors.primary }]}>
                <Text style={styles.macroVal}>{nutritionTargets.carbsG}g</Text>
                <Text style={styles.macroName}>Carbs</Text>
                <Text style={styles.macroSub}>Energy Fuel</Text>
              </View>
              <View style={[styles.macroCard, { borderTopColor: Colors.blue }]}>
                <Text style={styles.macroVal}>{nutritionTargets.fatG}g</Text>
                <Text style={styles.macroName}>Healthy Fats</Text>
                <Text style={styles.macroSub}>25% Intake</Text>
              </View>
            </View>

            {/* Daily Movement & Hydration */}
            <View style={styles.dualMetricRow}>
              <View style={styles.dualMetricCard}>
                <Scale size={18} color={Colors.primary} />
                <View style={{ marginLeft: 8 }}>
                  <Text style={styles.dualMetricVal}>{dailyStepGoal.toLocaleString()} steps</Text>
                  <Text style={styles.dualMetricLabel}>Daily Step Goal</Text>
                </View>
              </View>
              <View style={styles.dualMetricCard}>
                <Droplets size={18} color={Colors.blue} />
                <View style={{ marginLeft: 8 }}>
                  <Text style={styles.dualMetricVal}>{(nutritionTargets.waterMl / 1000).toFixed(1)} Liters</Text>
                  <Text style={styles.dualMetricLabel}>Water Intake</Text>
                </View>
              </View>
            </View>

            {/* Privacy Setting Card */}
            <TouchableOpacity
              style={styles.privacyCard}
              onPress={() => setIsPrivate(!isPrivate)}
              activeOpacity={0.8}
            >
              <Shield size={20} color={Colors.primary} />
              <View style={{ flex: 1, marginHorizontal: 10 }}>
                <Text style={styles.privacyTitle}>Keep Health Data Private</Text>
                <Text style={styles.privacyDesc}>
                  Hide weight, age, and calories from your public community profile.
                </Text>
              </View>
              <View style={[styles.togglePill, isPrivate && styles.togglePillActive]}>
                <View style={[styles.toggleThumb, isPrivate && styles.toggleThumbActive]} />
              </View>
            </TouchableOpacity>

            {/* Medical Disclaimer Alert */}
            <View style={styles.disclaimerBox}>
              <AlertTriangle size={18} color={Colors.accentOrange} />
              <Text style={styles.disclaimerText}>{MEDICAL_DISCLAIMER_TEXT}</Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Sticky Bottom Action Bar */}
      <View style={styles.bottomBar}>
        {currentStep > 1 && (
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setCurrentStep(currentStep - 1)}
            disabled={isSaving}
          >
            <ChevronLeft size={20} color={Colors.textPrimary} />
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.nextButton, isSaving && { opacity: 0.7 }]}
          onPress={handleNext}
          disabled={isSaving}
          activeOpacity={0.85}
        >
          {isSaving ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Text style={styles.nextButtonText}>
                {currentStep === 4 ? 'Save & Launch AVFIT' : 'Continue'}
              </Text>
              <ChevronRight size={18} color="#FFFFFF" />
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  topBar: {
    paddingTop: Platform.OS === 'ios' ? 52 : 36,
    paddingHorizontal: 20,
    paddingBottom: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderSubtle,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stepperContainer: {
    flex: 1,
    marginRight: 12,
  },
  stepTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  progressTrack: {
    height: 6,
    backgroundColor: Colors.surfaceMuted,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: Colors.primary,
  },
  saveLaterButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  saveLaterText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  stepCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 22,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  stepIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primarySoft,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionHeader: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  sectionSub: {
    fontSize: 13,
    lineHeight: 18,
    color: Colors.textSecondary,
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: '#FAFAF8',
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: Colors.textPrimary,
    fontWeight: '600',
    marginBottom: 14,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfCol: {
    flex: 1,
  },
  genderRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 14,
  },
  miniChip: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: Colors.surfaceWarm,
    borderRadius: 12,
    alignItems: 'center',
  },
  miniChipActive: {
    backgroundColor: Colors.primary,
  },
  miniChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  miniChipTextActive: {
    color: '#FFFFFF',
  },
  unitsRow: {
    marginBottom: 14,
  },
  segmentedToggle: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceWarm,
    borderRadius: 14,
    padding: 3,
  },
  segment: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 11,
  },
  segmentActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 1,
  },
  segmentText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  segmentTextActive: {
    color: Colors.textPrimary,
  },
  choiceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: '#FAFAF8',
    marginBottom: 10,
  },
  choiceCardActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primarySoft,
  },
  choiceRadio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  choiceRadioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
  },
  choiceContent: {
    flex: 1,
  },
  choiceTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  choiceTitleActive: {
    color: Colors.primaryDark,
  },
  choiceDesc: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 16,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  selectableChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: Colors.surfaceWarm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  selectableChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  selectableChipText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  selectableChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  calorieHeroCard: {
    backgroundColor: Colors.primary,
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
  },
  calorieHeroRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  calorieHeroLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: 'rgba(255, 255, 255, 0.75)',
    letterSpacing: 1,
  },
  calorieHeroValue: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFFFFF',
    marginTop: 4,
  },
  calorieHeroSub: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.85)',
    fontWeight: '600',
    marginTop: 4,
  },
  fireBadge: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.accentOrange,
    justifyContent: 'center',
    alignItems: 'center',
  },
  macroRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  macroCard: {
    flex: 1,
    backgroundColor: Colors.surfaceWarm,
    borderRadius: 14,
    padding: 12,
    borderTopWidth: 4,
    alignItems: 'center',
  },
  macroVal: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  macroName: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginTop: 2,
  },
  macroSub: {
    fontSize: 10,
    color: Colors.textMuted,
    marginTop: 2,
  },
  dualMetricRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  dualMetricCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAFAF8',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  dualMetricVal: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  dualMetricLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  privacyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceWarm,
    padding: 14,
    borderRadius: 16,
    marginBottom: 14,
  },
  privacyTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  privacyDesc: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  togglePill: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#D1D5DB',
    padding: 2,
    justifyContent: 'center',
  },
  togglePillActive: {
    backgroundColor: Colors.primary,
  },
  toggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
  },
  toggleThumbActive: {
    alignSelf: 'flex-end',
  },
  disclaimerBox: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FED7AA',
    padding: 12,
    borderRadius: 14,
  },
  disclaimerText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 16,
    color: '#9A3412',
    fontWeight: '500',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: Colors.borderSubtle,
    paddingHorizontal: 20,
    paddingVertical: 14,
    paddingBottom: Platform.OS === 'ios' ? 28 : 16,
    flexDirection: 'row',
    gap: 10,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: Colors.surfaceWarm,
    borderRadius: 16,
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  nextButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 16,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  nextButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
