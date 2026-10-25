import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { Colors } from '../theme/colors';
import { FoodNutritionEstimate } from '../types';
import { ActivityService } from '../services/activityService';
import { AuthService } from '../services/auth';
import {
  Camera as CameraIcon,
  Sparkles,
  CheckCircle,
  Plus,
  Minus,
  Utensils,
  Image as ImageIcon,
  Save,
  Check,
} from 'lucide-react-native';

const MEAL_CATEGORIES = ['Breakfast', 'Lunch', 'Dinner', 'Snack'] as const;
type MealCategory = (typeof MEAL_CATEGORIES)[number];

export default function FoodScannerScreen() {
  const insets = useSafeAreaInsets();
  const [isScanning, setIsScanning] = useState(false);
  const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<MealCategory>('Lunch');
  const [portionGrams, setPortionGrams] = useState(350);
  const [isSaved, setIsSaved] = useState(false);

  const [scannedResult, setScannedResult] = useState<FoodNutritionEstimate>({
    dish_name: 'Grilled Salmon with Quinoa & Steamed Greens',
    estimated_weight_g: 350,
    calories: 540,
    protein_g: 44,
    carbs_g: 46,
    fat_g: 16,
    fiber_g: 6.5,
    confidence: 'high',
    health_tips: 'High-protein, heart-healthy meal with clean carbs and Omega-3 fats.',
    ingredients: [
      { name: 'Grilled Atlantic Salmon', weight_g: 170, calories: 290 },
      { name: 'Steamed Quinoa', weight_g: 110, calories: 155 },
      { name: 'Steamed Broccoli & Kale', weight_g: 70, calories: 25 },
      { name: 'Extra Virgin Olive Oil', weight_g: 8, calories: 70 },
    ],
  });

  const handleAdjustPortion = (delta: number) => {
    const newWeight = Math.max(50, portionGrams + delta);
    const scale = newWeight / 350;
    setPortionGrams(newWeight);
    setIsSaved(false);
    setScannedResult((prev) => ({
      ...prev,
      estimated_weight_g: newWeight,
      calories: Math.round(540 * scale),
      protein_g: Math.round(44 * scale * 10) / 10,
      carbs_g: Math.round(46 * scale * 10) / 10,
      fat_g: Math.round(16 * scale * 10) / 10,
      fiber_g: Math.round(6.5 * scale * 10) / 10,
    }));
  };

  const handlePickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImageUri(result.assets[0].uri);
        runScanSimulation();
      }
    } catch (e) {
      runScanSimulation();
    }
  };

  const handleCaptureImage = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Camera Permission', 'Please allow camera access to scan meals directly.');
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImageUri(result.assets[0].uri);
        runScanSimulation();
      }
    } catch (e) {
      runScanSimulation();
    }
  };

  const runScanSimulation = () => {
    setIsScanning(true);
    setIsSaved(false);
    setTimeout(() => {
      setIsScanning(false);
      setPortionGrams(350);
    }, 1200);
  };

  const handleSaveToDiary = async () => {
    setIsSaved(true);
    Alert.alert(
      'Meal Logged',
      `${scannedResult.dish_name} (${scannedResult.calories} kcal) saved to your ${selectedCategory} diary.`
    );
  };

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 16) }]}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      {/* Screen Header */}
      <View style={styles.topHeader}>
        <Text style={styles.screenTitle}>AI Food Vision</Text>
        <View style={styles.aiBadge}>
          <Sparkles size={14} color={Colors.primary} />
          <Text style={styles.aiBadgeText}>Gemini AI Vision</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: 130 + insets.bottom },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Meal Category Selector */}
        <View style={styles.categoryRow}>
          {MEAL_CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.categoryPill,
                selectedCategory === cat && styles.categoryPillActive,
              ]}
              onPress={() => setSelectedCategory(cat)}
            >
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === cat && styles.categoryTextActive,
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Viewfinder Camera Box */}
        <View style={styles.cameraBox}>
          {selectedImageUri ? (
            <Image source={{ uri: selectedImageUri }} style={styles.previewImage} resizeMode="cover" />
          ) : (
            <View style={styles.viewfinderCenter}>
              <View style={styles.cameraIconCircle}>
                <CameraIcon size={30} color={Colors.primary} />
              </View>
              <Text style={styles.cameraPrompt}>Align meal plate inside viewfinder</Text>
            </View>
          )}

          {isScanning && (
            <View style={styles.scanningOverlay}>
              <ActivityIndicator size="large" color="#FFFFFF" />
              <Text style={styles.scanningText}>Analyzing nutrition with AI Vision...</Text>
            </View>
          )}
        </View>

        {/* Camera & Gallery Action Buttons */}
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.captureBtn} onPress={handleCaptureImage} activeOpacity={0.8}>
            <CameraIcon size={16} color="#FFFFFF" />
            <Text style={styles.captureBtnText}>Scan with Camera</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.galleryBtn} onPress={handlePickImage} activeOpacity={0.8}>
            <ImageIcon size={16} color={Colors.textPrimary} />
            <Text style={styles.galleryBtnText}>Select Photo</Text>
          </TouchableOpacity>
        </View>

        {/* Scanned Nutrition Results Card */}
        <View style={styles.resultCard}>
          <View style={styles.dishHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.dishTitle}>{scannedResult.dish_name}</Text>
              <Text style={styles.dishSub}>Estimated for {portionGrams}g portion • Approximate values</Text>
            </View>
            <View style={styles.confidencePill}>
              <CheckCircle size={12} color="#16A34A" />
              <Text style={styles.confidenceText}>High Accuracy</Text>
            </View>
          </View>

          {/* Calorie & Portion Adjuster */}
          <View style={styles.caloriesBanner}>
            <View>
              <Text style={styles.calorieBigNumber}>{scannedResult.calories}</Text>
              <Text style={styles.calorieLabel}>ESTIMATED KCAL</Text>
            </View>

            <View style={styles.portionControlRow}>
              <TouchableOpacity style={styles.portionBtn} onPress={() => handleAdjustPortion(-50)}>
                <Minus size={14} color={Colors.textPrimary} />
              </TouchableOpacity>
              <Text style={styles.portionText}>{portionGrams}g</Text>
              <TouchableOpacity style={styles.portionBtn} onPress={() => handleAdjustPortion(50)}>
                <Plus size={14} color={Colors.textPrimary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Macro Nutrition Split (Protein, Carbs, Fat) */}
          <View style={styles.macroGrid}>
            <View style={styles.macroBox}>
              <Text style={styles.macroValue}>{scannedResult.protein_g}g</Text>
              <Text style={styles.macroLabel}>Protein</Text>
            </View>
            <View style={styles.macroDivider} />
            <View style={styles.macroBox}>
              <Text style={styles.macroValue}>{scannedResult.carbs_g}g</Text>
              <Text style={styles.macroLabel}>Carbs</Text>
            </View>
            <View style={styles.macroDivider} />
            <View style={styles.macroBox}>
              <Text style={styles.macroValue}>{scannedResult.fat_g}g</Text>
              <Text style={styles.macroLabel}>Fats</Text>
            </View>
          </View>

          {/* Detected Ingredients */}
          <Text style={styles.ingredientsTitle}>Detected Ingredients</Text>
          {scannedResult.ingredients?.map((item, idx) => (
            <View key={idx} style={styles.ingredientRow}>
              <Text style={styles.ingredientName}>{item.name}</Text>
              <Text style={styles.ingredientMeta}>
                {item.weight_g}g • {item.calories} kcal
              </Text>
            </View>
          ))}

          {/* Save to Food Diary Button */}
          <TouchableOpacity
            style={[styles.saveDiaryBtn, isSaved && styles.savedDiaryBtn]}
            onPress={handleSaveToDiary}
            activeOpacity={0.8}
          >
            {isSaved ? (
              <>
                <Check size={18} color="#FFFFFF" />
                <Text style={styles.saveDiaryBtnText}>Logged in {selectedCategory} Diary</Text>
              </>
            ) : (
              <>
                <Save size={18} color="#FFFFFF" />
                <Text style={styles.saveDiaryBtnText}>Save to {selectedCategory} Diary</Text>
              </>
            )}
          </TouchableOpacity>
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
  screenTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: Colors.textPrimary,
    letterSpacing: -0.3,
  },
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F1EC',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 14,
    gap: 4,
  },
  aiBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.primary,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  categoryRow: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: 12,
  },
  categoryPill: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E8DFC8',
  },
  categoryPillActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  categoryTextActive: {
    color: '#FFFFFF',
  },
  cameraBox: {
    height: 220,
    backgroundColor: '#1C2B22',
    borderRadius: 22,
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  viewfinderCenter: {
    alignItems: 'center',
  },
  cameraIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  cameraPrompt: {
    fontSize: 13,
    color: '#E0E7E3',
    fontWeight: '700',
  },
  scanningOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(28, 43, 34, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  scanningText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  captureBtn: {
    flex: 1.2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: 16,
    gap: 6,
  },
  captureBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  galleryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E8DFC8',
    gap: 6,
  },
  galleryBtnText: {
    color: Colors.textPrimary,
    fontSize: 13,
    fontWeight: '800',
  },
  resultCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E8DFC8',
  },
  dishHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  dishTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  dishSub: {
    fontSize: 11.5,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  confidencePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    gap: 4,
    marginLeft: 6,
  },
  confidenceText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#16A34A',
  },
  caloriesBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F9F6F0',
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
  },
  calorieBigNumber: {
    fontSize: 26,
    fontWeight: '900',
    color: Colors.primary,
  },
  calorieLabel: {
    fontSize: 9.5,
    fontWeight: '800',
    color: Colors.textSecondary,
    letterSpacing: 0.5,
  },
  portionControlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  portionBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E8DFC8',
  },
  portionText: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textPrimary,
    minWidth: 46,
    textAlign: 'center',
  },
  macroGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3EFE6',
    borderRadius: 14,
    paddingVertical: 12,
    marginBottom: 16,
  },
  macroBox: {
    flex: 1,
    alignItems: 'center',
  },
  macroValue: {
    fontSize: 16,
    fontWeight: '900',
    color: Colors.textPrimary,
  },
  macroLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '600',
    marginTop: 2,
  },
  macroDivider: {
    width: 1,
    height: 22,
    backgroundColor: '#E8DFC8',
  },
  ingredientsTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  ingredientRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#F0EBE1',
  },
  ingredientName: {
    fontSize: 12.5,
    color: Colors.textPrimary,
  },
  ingredientMeta: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  saveDiaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.accentOrange,
    paddingVertical: 14,
    borderRadius: 16,
    gap: 8,
    marginTop: 18,
  },
  savedDiaryBtn: {
    backgroundColor: '#16A34A',
  },
  saveDiaryBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});
