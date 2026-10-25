import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../theme/colors';
import {
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  RotateCcw,
  Moon,
  Sparkles,
  Check,
} from 'lucide-react-native';

export default function WorkoutScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const [timeToggle, setTimeToggle] = useState<'Day' | 'Week'>('Day');
  const [isPlaying, setIsPlaying] = useState(false);
  const [restSeconds, setRestSeconds] = useState(30);

  useEffect(() => {
    let timer: any;
    if (isPlaying && restSeconds > 0) {
      timer = setInterval(() => {
        setRestSeconds((prev) => prev - 1);
      }, 1000);
    } else if (restSeconds === 0) {
      setIsPlaying(false);
    }
    return () => clearInterval(timer);
  }, [isPlaying, restSeconds]);

  const toggleTimer = () => {
    setIsPlaying(!isPlaying);
  };

  const resetTimer = () => {
    setIsPlaying(false);
    setRestSeconds(30);
  };

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 16) }]}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 130 + insets.bottom }]}
      >
        
        {/* Top Header: Back Chevron & Day/Week Pill Toggle (Exact Match to Screen 3) */}
        <View style={styles.topHeader}>
          <TouchableOpacity
            style={styles.backButtonCircle}
            onPress={() => navigation.goBack ? navigation.goBack() : null}
          >
            <ChevronLeft size={20} color={Colors.textPrimary} />
          </TouchableOpacity>

          {/* Day | Week Pill Toggle */}
          <View style={styles.dayWeekTogglePill}>
            <TouchableOpacity
              style={[
                styles.toggleOption,
                timeToggle === 'Day' && styles.toggleOptionActive,
              ]}
              onPress={() => setTimeToggle('Day')}
            >
              <Text
                style={[
                  styles.toggleText,
                  timeToggle === 'Day' && styles.toggleTextActive,
                ]}
              >
                Day
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.toggleOption,
                timeToggle === 'Week' && styles.toggleOptionActive,
              ]}
              onPress={() => setTimeToggle('Week')}
            >
              <Text
                style={[
                  styles.toggleText,
                  timeToggle === 'Week' && styles.toggleTextActive,
                ]}
              >
                Week
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Title */}
        <Text style={styles.screenTitle}>Heart Health & Recovery</Text>

        {/* Metric Badges (Stretch: 78%, Endurance: 64%, Stability: 71%) */}
        <View style={styles.metricBadgesRow}>
          <View style={[styles.metricPill, { backgroundColor: '#EDE4F2' }]}>
            <Text style={[styles.metricPillText, { color: '#6A4B82' }]}>Stretch: 78%</Text>
          </View>
          <View style={[styles.metricPill, { backgroundColor: '#E4EEF2' }]}>
            <Text style={[styles.metricPillText, { color: '#3A6878' }]}>Endurance: 64%</Text>
          </View>
          <View style={[styles.metricPill, { backgroundColor: '#F3EDE2' }]}>
            <Text style={[styles.metricPillText, { color: '#78603A' }]}>Stability: 71%</Text>
          </View>
        </View>

        {/* Center Botanical / Organic Health Artwork with Carousel Arrows */}
        <View style={styles.heroArtworkContainer}>
          <TouchableOpacity style={styles.carouselArrowBtn}>
            <ChevronLeft size={18} color={Colors.textPrimary} />
          </TouchableOpacity>

          <View style={styles.artworkCenterPill}>
            <Text style={{ fontSize: 72 }}>🫀</Text>
            <View style={styles.foliageOverlay}>
              <Text style={{ fontSize: 24 }}>🌿🌸</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.carouselArrowBtn}>
            <ChevronRight size={18} color={Colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Sleep Time Card (Exact Match to Reference Screen 3) */}
        <View style={styles.sleepCard}>
          <View style={styles.sleepHeader}>
            <View>
              <Text style={styles.cardSmallTitle}>Sleep Time</Text>
              <View style={styles.sleepNumberRow}>
                <Text style={styles.sleepBigNumber}>7<Text style={styles.sleepSubscript}>h</Text>30<Text style={styles.sleepSubscript}>m</Text></Text>
                <Text style={styles.sleepSubLabel}>last night</Text>
              </View>
            </View>
            {/* Cloud & Moon graphic */}
            <View style={styles.moonGraphicBox}>
              <Text style={{ fontSize: 32 }}>🌙☁️</Text>
            </View>
          </View>

          {/* Daily Sleep Checkmarks Row */}
          <View style={styles.checkmarksRow}>
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => (
              <View
                key={idx}
                style={[
                  styles.checkCircle,
                  idx < 4 ? styles.checkCircleActive : styles.checkCirclePending,
                ]}
              >
                {idx < 4 && <Check size={10} color="#FFFFFF" />}
              </View>
            ))}
          </View>
        </View>

        {/* Performing Stretch Routine Card with Play Button (Exact Match to Reference Screen 3) */}
        <View style={styles.stretchCard}>
          <View style={styles.stretchAvatarBox}>
            <Text style={{ fontSize: 36 }}>🧘‍♀️</Text>
          </View>

          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.stretchTitle}>Performing stretch</Text>
            <Text style={styles.stretchDesc}>
              Hold stretch for 20-30 minutes per day
            </Text>
            
            {/* Live Rest / Hold Timer */}
            <View style={styles.stretchTimerRow}>
              <Text style={styles.timerDisplay}>00:{restSeconds < 10 ? `0${restSeconds}` : restSeconds}</Text>
              <TouchableOpacity onPress={resetTimer} style={styles.miniResetBtn}>
                <RotateCcw size={12} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Circular Green Play / Pause Button */}
          <TouchableOpacity style={styles.playButtonCircle} onPress={toggleTimer}>
            {isPlaying ? (
              <Pause size={18} color={Colors.primary} />
            ) : (
              <Play size={18} color={Colors.primary} fill={Colors.primary} />
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
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 90,
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  backButtonCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
  },
  dayWeekTogglePill: {
    flexDirection: 'row',
    backgroundColor: '#F3EDE2',
    padding: 3,
    borderRadius: 22,
  },
  toggleOption: {
    paddingVertical: 7,
    paddingHorizontal: 16,
    borderRadius: 18,
  },
  toggleOptionActive: {
    backgroundColor: Colors.primary,
  },
  toggleText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  toggleTextActive: {
    color: '#FFFFFF',
  },
  screenTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -0.5,
    marginBottom: 12,
  },
  metricBadgesRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  metricPill: {
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 14,
  },
  metricPillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  heroArtworkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    marginBottom: 12,
  },
  carouselArrowBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
  },
  artworkCenterPill: {
    alignItems: 'center',
    position: 'relative',
  },
  foliageOverlay: {
    position: 'absolute',
    bottom: -4,
  },
  sleepCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 26,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 5,
  },
  sleepHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  cardSmallTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  sleepNumberRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    marginTop: 2,
  },
  sleepBigNumber: {
    fontSize: 28,
    fontWeight: '900',
    color: Colors.textPrimary,
  },
  sleepSubscript: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  sleepSubLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  moonGraphicBox: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: '#F7F2EA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarksRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#F3EDE2',
    paddingTop: 12,
  },
  checkCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkCircleActive: {
    backgroundColor: Colors.accentOrange,
  },
  checkCirclePending: {
    backgroundColor: '#EAE1D3',
  },
  stretchCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    marginBottom: 10,
  },
  stretchAvatarBox: {
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: '#F3EDE2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stretchTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  stretchDesc: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  stretchTimerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  timerDisplay: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.primary,
    fontFamily: 'monospace',
  },
  miniResetBtn: {
    padding: 2,
  },
  playButtonCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E8F1EC',
    borderWidth: 1.5,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
