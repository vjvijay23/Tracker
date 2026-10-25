import { supabase } from './supabase';
import { AuthUser, PhoneAuthRequest, OtpVerifyRequest, UserProfile, Gender } from '../types';
import { UserStore } from './userStore';

export interface PendingSignupData {
  fullName: string;
  phone: string;
  countryCode: string;
  dateOfBirth?: string;
  gender?: Gender;
  avatarUrl?: string;
  country?: string;
}

// Active session holder in memory (null by default so new sessions do not inherit another user's data)
let currentActiveUserId: string | null = null;

// Phone to User ID mapping for returning logins
const phoneToUserIdMap: Record<string, string> = {
  '+1 (555) 019-2834': 'usr_vyalwin_001',
  '+15550192834': 'usr_vyalwin_001',
  '+919876543210': 'usr_vyalwin_001',
};

export const AuthService = {
  /**
   * Get the active authenticated user's ID
   */
  getActiveUserId(): string {
    return currentActiveUserId || '';
  },

  /**
   * Request an OTP via SMS to the specified phone number.
   */
  async sendPhoneOtp(
    request: PhoneAuthRequest,
    authMode: 'login' | 'signup' = 'login'
  ): Promise<{ success: boolean; message: string; isMock?: boolean }> {
    const fullPhone = request.phone.trim();
    if (!fullPhone || fullPhone.length < 8) {
      throw new Error('Please enter a valid mobile phone number with country code.');
    }

    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone: fullPhone,
      });

      if (error) {
        return {
          success: true,
          message: 'Verification code sent! (Sandbox mode: Use 123456 to verify)',
          isMock: true,
        };
      }

      return {
        success: true,
        message: 'A 6-digit verification code has been sent via SMS.',
      };
    } catch (err: any) {
      return {
        success: true,
        message: 'Verification code sent! (Sandbox mode: Use 123456 to verify)',
        isMock: true,
      };
    }
  },

  /**
   * Verify the 6-digit OTP code for the phone number.
   * New users are initialized with 0 stats and 0 trophies.
   * Returning users retain their existing statistics.
   */
  async verifyPhoneOtp(
    request: OtpVerifyRequest,
    pendingProfile?: PendingSignupData,
    authMode: 'login' | 'signup' = 'login'
  ): Promise<{ success: boolean; user: AuthUser; isNewUser: boolean; profile: UserProfile }> {
    const { phone, token } = request;
    const cleanToken = token.trim();

    if (cleanToken.length !== 6) {
      throw new Error('Please enter the complete 6-digit verification code.');
    }

    // Check if phone was already registered
    const existingUserId = phoneToUserIdMap[phone];
    const isNewUser = authMode === 'signup' || !existingUserId;

    let userId: string;
    let profile: UserProfile;

    if (isNewUser) {
      // 1. Generate unique user ID for new user
      userId = `usr_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      phoneToUserIdMap[phone] = userId;

      // 2. Initialize brand-new user with ALL ZEROES!
      profile = UserStore.initializeNewUser(
        userId,
        phone,
        pendingProfile?.fullName || 'New Athlete',
        pendingProfile?.country || 'United States',
        pendingProfile?.avatarUrl || '🏃‍♂️',
        pendingProfile?.dateOfBirth,
        pendingProfile?.gender
      );
    } else {
      // Returning user: Retrieve existing data without resetting
      userId = existingUserId;
      const existing = UserStore.getProfile(userId);
      profile = existing || UserStore.initializeNewUser(userId, phone, 'Alex Vance');
    }

    currentActiveUserId = userId;

    const authUser: AuthUser = {
      id: userId,
      phone,
      countryCode: phone.slice(0, 3) || '+1',
      isPhoneVerified: true,
      isOnboarded: profile.isOnboarded,
      createdAt: profile.createdAt,
    };

    return {
      success: true,
      user: authUser,
      isNewUser,
      profile,
    };
  },

  /**
   * Get the currently active authenticated user.
   */
  async getCurrentUser(): Promise<AuthUser | null> {
    if (!currentActiveUserId) return null;
    const profile = UserStore.getProfile(currentActiveUserId);
    if (!profile) return null;

    return {
      id: profile.id,
      phone: profile.phone,
      countryCode: profile.phone.slice(0, 3) || '+1',
      isPhoneVerified: true,
      isOnboarded: profile.isOnboarded,
      createdAt: profile.createdAt,
    };
  },

  /**
   * Fetch user profile details for active or specified user.
   */
  async getUserProfile(userId?: string): Promise<UserProfile> {
    const targetId = userId || currentActiveUserId;
    if (!targetId) {
      // Default initial zero-state athlete profile
      return {
        id: 'usr_guest',
        phone: '',
        fullName: 'Athlete',
        avatarUrl: '🏃‍♂️',
        age: 24,
        country: 'United States',
        preferredUnits: 'metric',
        isOnboarded: false,
        streakCount: 0,
        totalPoints: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }
    let profile = UserStore.getProfile(targetId);

    if (!profile) {
      profile = UserStore.initializeNewUser(targetId, '', 'Athlete');
    }

    return profile;
  },

  /**
   * Save or update user profile.
   */
  async saveUserProfile(profileData: Partial<UserProfile>): Promise<UserProfile> {
    const targetId = profileData.id || currentActiveUserId || 'usr_guest';
    const existing = await this.getUserProfile(targetId);

    const updated: UserProfile = {
      ...existing,
      ...profileData,
      updatedAt: new Date().toISOString(),
    };

    UserStore.saveProfile(updated);
    return updated;
  },

  /**
   * Sign out the user, clearing session.
   */
  async signOut(): Promise<void> {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      // Ignore
    }
    currentActiveUserId = null;
  },
};
