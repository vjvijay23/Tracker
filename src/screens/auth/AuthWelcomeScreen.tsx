import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../theme/colors';
import AvfitLogo from '../../components/common/AvfitLogo';
import {
  Footprints,
  Camera,
  Heart,
  Trophy,
  ArrowRight,
  ShieldCheck,
  Sparkles,
} from 'lucide-react-native';

interface AuthWelcomeScreenProps {
  navigation: any;
}

export default function AuthWelcomeScreen({ navigation }: AuthWelcomeScreenProps) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 16) }]}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 40 + insets.bottom }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Brand Header */}
        <View style={styles.header}>
          <AvfitLogo size={52} showWordmark={true} />
          <View style={styles.badgePill}>
            <Sparkles size={12} color={Colors.accentOrange} />
            <Text style={styles.badgePillText}>ALL-IN-ONE FITNESS ECOSYSTEM</Text>
          </View>
        </View>

        {/* Hero Visual Block */}
        <View style={styles.heroCard}>
          <View style={styles.heroCenterGraphic}>
            <View style={styles.athleteBadge}>
              <Text style={{ fontSize: 44 }}>🏃‍♂️</Text>
            </View>
          </View>
          <Text style={styles.heroTitle}>Your Complete Fitness Journey, Unified.</Text>
          <Text style={styles.heroSubtitle}>
            Replace multiple disjointed apps with one integrated community experience for movement, nutrition, and daily habits.
          </Text>
        </View>

        {/* 4 Feature Highlights */}
        <View style={styles.featuresList}>
          <View style={styles.featureItem}>
            <View style={[styles.featureIconBox, { backgroundColor: '#E8F1EC' }]}>
              <Footprints size={18} color={Colors.primary} />
            </View>
            <View style={styles.featureTextBox}>
              <Text style={styles.featureTitle}>Step & Activity Tracking</Text>
              <Text style={styles.featureSub}>Daily streaks, GPS distance, and Strava-inspired leaderboards</Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <View style={[styles.featureIconBox, { backgroundColor: '#FDF1EC' }]}>
              <Camera size={18} color={Colors.accentOrange} />
            </View>
            <View style={styles.featureTextBox}>
              <Text style={styles.featureTitle}>AI Food Scanner & Macros</Text>
              <Text style={styles.featureSub}>Instant plate recognition, calories, protein, carbs, and fats</Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <View style={[styles.featureIconBox, { backgroundColor: '#EAE1D3' }]}>
              <Heart size={18} color={Colors.primary} />
            </View>
            <View style={styles.featureTextBox}>
              <Text style={styles.featureTitle}>Personalized Home Workouts</Text>
              <Text style={styles.featureSub}>Adaptive routines with rest countdowns and minimal equipment</Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <View style={[styles.featureIconBox, { backgroundColor: '#FEF9C3' }]}>
              <Trophy size={18} color="#A16207" />
            </View>
            <View style={styles.featureTextBox}>
              <Text style={styles.featureTitle}>Gamified 5-Tier Trophy Room</Text>
              <Text style={styles.featureSub}>Unlock Bronze, Silver, Gold, Platinum, and Diamond badges</Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionSection}>
          {/* Sign Up CTA */}
          <TouchableOpacity
            style={styles.signupButton}
            onPress={() => navigation.navigate('Signup')}
            activeOpacity={0.85}
          >
            <Text style={styles.signupButtonText}>Create Account / Sign Up</Text>
            <ArrowRight size={18} color="#FFFFFF" />
          </TouchableOpacity>

          {/* Log In CTA */}
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => navigation.navigate('Login')}
            activeOpacity={0.85}
          >
            <Text style={styles.loginButtonText}>I Already Have an Account • Log In</Text>
          </TouchableOpacity>

          {/* Guest / Demo Mode */}
          <TouchableOpacity
            style={styles.guestButton}
            onPress={() => navigation.navigate('Main')}
            activeOpacity={0.7}
          >
            <Text style={styles.guestButtonText}>Explore App as Guest (Demo Mode)</Text>
          </TouchableOpacity>
        </View>

        {/* Security Assurance */}
        <View style={styles.securityRow}>
          <ShieldCheck size={14} color={Colors.primary} />
          <Text style={styles.securityText}>
            Secured by Supabase Phone Auth. Sensitive health metrics private by default.
          </Text>
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
    paddingTop: Platform.OS === 'ios' ? 24 : 16,
    paddingBottom: 36,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  badgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.surfaceWarm,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 16,
    marginTop: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  badgePillText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: 0.8,
  },
  heroCard: {
    backgroundColor: '#F3EDE2',
    borderRadius: 24,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  heroCenterGraphic: {
    marginBottom: 12,
  },
  athleteBadge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 6,
  },
  heroSubtitle: {
    fontSize: 13,
    lineHeight: 18,
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  featuresList: {
    gap: 10,
    marginBottom: 24,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    gap: 12,
  },
  featureIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureTextBox: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  featureSub: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  actionSection: {
    gap: 10,
    marginBottom: 16,
  },
  signupButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 18,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  signupButtonText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 15,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  loginButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  guestButton: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  guestButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
    textDecorationLine: 'underline',
  },
  securityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 16,
  },
  securityText: {
    fontSize: 11,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
