import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Colors } from '../theme/colors';
import {
  Home,
  Footprints,
  Camera,
  Heart,
  Users,
} from 'lucide-react-native';

// Tab Screens (Original Core Features)
import DashboardScreen from '../screens/DashboardScreen';
import ActivityTrackerScreen from '../screens/ActivityTrackerScreen';
import FoodScannerScreen from '../screens/FoodScannerScreen';
import WorkoutScreen from '../screens/WorkoutScreen';
import CommunityScreen from '../screens/CommunityScreen';

// Auth, Onboarding & Extra Feature Screens
import AuthWelcomeScreen from '../screens/auth/AuthWelcomeScreen';
import SignupScreen from '../screens/auth/SignupScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import PhoneAuthScreen from '../screens/auth/PhoneAuthScreen';
import OtpVerificationScreen from '../screens/auth/OtpVerificationScreen';
import FitnessOnboardingScreen from '../screens/onboarding/FitnessOnboardingScreen';
import AchievementsScreen from '../screens/achievements/AchievementsScreen';
import ProfileEditScreen from '../screens/profile/ProfileEditScreen';
import RecordActivityScreen from '../screens/activity/RecordActivityScreen';
import ActivitySummaryScreen from '../screens/activity/ActivitySummaryScreen';
import { LiveWalkingAnalyzerScreen } from '../modules/walking-analyzer';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function MainTabs() {
  const insets = useSafeAreaInsets();
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: [
          styles.floatingPillTabBar,
          { bottom: Math.max(insets.bottom, 14) },
        ],
        tabBarActiveTintColor: '#FFFFFF',
        tabBarInactiveTintColor: '#6F7771',
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={[styles.tabIconBox, focused && styles.activeTabBadge]}>
              <Home
                size={focused ? 20 : 18}
                color={focused ? Colors.primary : '#6F7771'}
                fill={focused ? Colors.primary : 'transparent'}
              />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Activity"
        component={ActivityTrackerScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={[styles.tabIconBox, focused && styles.activeTabBadge]}>
              <Footprints
                size={focused ? 20 : 18}
                color={focused ? Colors.primary : '#6F7771'}
              />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="FoodScanner"
        component={FoodScannerScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={[styles.tabIconBox, focused && styles.activeTabBadge]}>
              <Camera
                size={focused ? 20 : 18}
                color={focused ? Colors.primary : '#6F7771'}
              />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Workouts"
        component={WorkoutScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={[styles.tabIconBox, focused && styles.activeTabBadge]}>
              <Heart
                size={focused ? 20 : 18}
                color={focused ? Colors.primary : '#6F7771'}
                fill={focused ? Colors.primary : 'transparent'}
              />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Community"
        component={CommunityScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={[styles.tabIconBox, focused && styles.activeTabBadge]}>
              <Users
                size={focused ? 20 : 18}
                color={focused ? Colors.primary : '#6F7771'}
              />
            </View>
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function RootNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="AuthWelcome"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      {/* Auth Entry & Gateway */}
      <Stack.Screen name="AuthWelcome" component={AuthWelcomeScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />

      {/* Phone Auth & OTP Verification */}
      <Stack.Screen name="PhoneAuth" component={PhoneAuthScreen} />
      <Stack.Screen name="OtpVerification" component={OtpVerificationScreen} />

      {/* Fitness Onboarding Wizard */}
      <Stack.Screen name="FitnessOnboarding" component={FitnessOnboardingScreen} />

      {/* Primary Tab App (Supporting both 'Main' and 'Dashboard') */}
      <Stack.Screen name="Main" component={MainTabs} />
      <Stack.Screen name="Dashboard" component={MainTabs} />

      {/* Extra GPS Outdoor Tracker & Summary */}
      <Stack.Screen name="RecordActivity" component={RecordActivityScreen} />
      <Stack.Screen name="Record" component={RecordActivityScreen} />
      <Stack.Screen name="ActivitySummary" component={ActivitySummaryScreen} />

      {/* Strava-grade Live Walking Analyzer (Screen-off Foreground Service) */}
      <Stack.Screen name="LiveWalkingAnalyzer" component={LiveWalkingAnalyzerScreen} />
      <Stack.Screen name="WalkingAnalyzer" component={LiveWalkingAnalyzerScreen} />

      {/* Gamified Achievements & Trophy Room */}
      <Stack.Screen name="Achievements" component={AchievementsScreen} />

      {/* Fitness Profile & Target Editor */}
      <Stack.Screen name="ProfileEdit" component={ProfileEditScreen} />

      {/* Historical Activity Tracker */}
      <Stack.Screen name="ActivityHistory" component={ActivityTrackerScreen} />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  floatingPillTabBar: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 24 : 16,
    left: 20,
    right: 20,
    backgroundColor: '#161A17', // Dark Charcoal Dock matching original AVFIT design
    borderRadius: 36,
    height: 64,
    borderTopWidth: 0,
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTabBadge: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
});
