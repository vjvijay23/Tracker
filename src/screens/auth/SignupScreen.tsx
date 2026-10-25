import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../theme/colors';
import { AuthService, PendingSignupData } from '../../services/auth';
import { Gender } from '../../types';
import AvfitLogo from '../../components/common/AvfitLogo';
import {
  User,
  Smartphone,
  Calendar,
  ArrowRight,
  ShieldCheck,
  Check,
  ChevronLeft,
  AlertCircle,
  Camera,
} from 'lucide-react-native';

const COUNTRY_CODES = [
  { code: '+1', name: 'US / CA', flag: '🇺🇸' },
  { code: '+91', name: 'India', flag: '🇮🇳' },
  { code: '+44', name: 'UK', flag: '🇬🇧' },
  { code: '+61', name: 'Australia', flag: '🇦🇺' },
  { code: '+49', name: 'Germany', flag: '🇩🇪' },
  { code: '+971', name: 'UAE', flag: '🇦🇪' },
];

const AVATAR_OPTIONS = ['🏃‍♂️', '🏃‍♀️', '🧘‍♂️', '🏋️‍♀️', '🚴‍♂️', '🧗'];

interface SignupScreenProps {
  navigation: any;
}

export default function SignupScreen({ navigation }: SignupScreenProps) {
  const insets = useSafeAreaInsets();
  // Profile Input States
  const [fullName, setFullName] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(COUNTRY_CODES[1]); // Default India +91 or +1
  const [phoneNumber, setPhoneNumber] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState<Gender>('male');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATAR_OPTIONS[0]);
  const [agreedToTerms, setAgreedToTerms] = useState(true);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showCountryPicker, setShowCountryPicker] = useState(false);

  const handleSignup = async () => {
    setErrorMessage(null);

    // Form Validations
    if (!fullName.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }

    const cleanPhone = phoneNumber.replace(/[^0-9]/g, '');
    if (!cleanPhone || cleanPhone.length < 8) {
      setErrorMessage('Please enter a valid mobile phone number (8-10 digits).');
      return;
    }

    if (!agreedToTerms) {
      setErrorMessage('Please agree to the Terms of Service & Privacy Policy.');
      return;
    }

    const fullPhone = `${selectedCountry.code}${cleanPhone}`;
    setIsLoading(true);

    try {
      // 1. Send SMS OTP verification code
      const response = await AuthService.sendPhoneOtp(
        {
          phone: fullPhone,
          countryCode: selectedCountry.code,
        },
        'signup'
      );

      if (response.success) {
        const pendingData: PendingSignupData = {
          fullName: fullName.trim(),
          phone: fullPhone,
          countryCode: selectedCountry.code,
          dateOfBirth: dateOfBirth || '1998-05-12',
          gender,
          avatarUrl: selectedAvatar,
          country: selectedCountry.name,
        };

        // 2. Navigate to OTP Verification with pending profile details
        navigation.navigate('OtpVerification', {
          phone: fullPhone,
          countryCode: selectedCountry.code,
          authMode: 'signup',
          pendingProfile: pendingData,
        });
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Unable to register. Please check your network and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: Math.max(insets.top, 16), paddingBottom: 40 + insets.bottom },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Navigation Bar */}
        <View style={styles.topNav}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <ChevronLeft size={22} color={Colors.textPrimary} />
          </TouchableOpacity>
          <AvfitLogo size={34} showWordmark={true} />
          <View style={{ width: 34 }} />
        </View>

        {/* Card Form */}
        <View style={styles.card}>
          <Text style={styles.title}>Create AVFIT Account</Text>
          <Text style={styles.subtitle}>
            Join thousands tracking activities, scanning meals with AI, and competing in fitness challenges.
          </Text>

          {errorMessage && (
            <View style={styles.errorBanner}>
              <AlertCircle size={16} color={Colors.danger} />
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          )}

          {/* Avatar Selector */}
          <View style={styles.avatarPickerSection}>
            <Text style={styles.inputLabel}>Choose Your Athlete Avatar</Text>
            <View style={styles.avatarRow}>
              {AVATAR_OPTIONS.map((item) => (
                <TouchableOpacity
                  key={item}
                  style={[
                    styles.avatarBadge,
                    selectedAvatar === item && styles.avatarBadgeActive,
                  ]}
                  onPress={() => setSelectedAvatar(item)}
                  activeOpacity={0.8}
                >
                  <Text style={{ fontSize: 24 }}>{item}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Full Name Input */}
          <Text style={styles.inputLabel}>Full Name</Text>
          <View style={styles.inputContainer}>
            <User size={18} color={Colors.textSecondary} style={styles.inputIcon} />
            <TextInput
              style={styles.textInput}
              placeholder="e.g. Alex Vance"
              placeholderTextColor="#9EA6A0"
              value={fullName}
              onChangeText={(val) => {
                setFullName(val);
                if (errorMessage) setErrorMessage(null);
              }}
              autoCapitalize="words"
            />
          </View>

          {/* Mobile Phone Number Input */}
          <Text style={styles.inputLabel}>Mobile Phone Number (For SMS Verification)</Text>
          <View style={styles.phoneInputRow}>
            {/* Country Selector Trigger */}
            <TouchableOpacity
              style={styles.countryPickerButton}
              onPress={() => setShowCountryPicker(!showCountryPicker)}
              activeOpacity={0.7}
            >
              <Text style={styles.countryFlag}>{selectedCountry.flag}</Text>
              <Text style={styles.countryCodeText}>{selectedCountry.code}</Text>
            </TouchableOpacity>

            <TextInput
              style={styles.phoneTextInput}
              placeholder="e.g. 98765 43210"
              placeholderTextColor="#9EA6A0"
              keyboardType="phone-pad"
              value={phoneNumber}
              onChangeText={(val) => {
                setPhoneNumber(val);
                if (errorMessage) setErrorMessage(null);
              }}
            />
          </View>

          {/* Country Picker Dropdown */}
          {showCountryPicker && (
            <View style={styles.countryDropdown}>
              {COUNTRY_CODES.map((item) => (
                <TouchableOpacity
                  key={item.code}
                  style={[
                    styles.countryItem,
                    selectedCountry.code === item.code && styles.countryItemActive,
                  ]}
                  onPress={() => {
                    setSelectedCountry(item);
                    setShowCountryPicker(false);
                  }}
                >
                  <Text style={styles.countryItemFlag}>{item.flag}</Text>
                  <Text style={styles.countryItemName}>{item.name}</Text>
                  <Text style={styles.countryItemCode}>{item.code}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Date of Birth & Gender Row */}
          <View style={styles.row}>
            <View style={styles.halfCol}>
              <Text style={styles.inputLabel}>Birth Date (Optional)</Text>
              <View style={styles.inputContainer}>
                <Calendar size={16} color={Colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="#9EA6A0"
                  value={dateOfBirth}
                  onChangeText={setDateOfBirth}
                  keyboardType="numbers-and-punctuation"
                />
              </View>
            </View>

            <View style={styles.halfCol}>
              <Text style={styles.inputLabel}>Gender</Text>
              <View style={styles.genderRow}>
                <TouchableOpacity
                  style={[styles.miniChip, gender === 'male' && styles.miniChipActive]}
                  onPress={() => setGender('male')}
                >
                  <Text style={[styles.miniChipText, gender === 'male' && styles.miniChipTextActive]}>
                    M
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.miniChip, gender === 'female' && styles.miniChipActive]}
                  onPress={() => setGender('female')}
                >
                  <Text style={[styles.miniChipText, gender === 'female' && styles.miniChipTextActive]}>
                    F
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

          {/* Terms & Consent Checkbox */}
          <TouchableOpacity
            style={styles.termsRow}
            onPress={() => setAgreedToTerms(!agreedToTerms)}
            activeOpacity={0.8}
          >
            <View style={[styles.checkbox, agreedToTerms && styles.checkboxActive]}>
              {agreedToTerms && <Check size={14} color="#FFFFFF" />}
            </View>
            <Text style={styles.termsText}>
              I agree to the <Text style={{ fontWeight: '700' }}>Terms of Service</Text>, <Text style={{ fontWeight: '700' }}>Privacy Policy</Text>, and consent to SMS OTP delivery.
            </Text>
          </TouchableOpacity>

          {/* Submit Action */}
          <TouchableOpacity
            style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
            onPress={handleSignup}
            disabled={isLoading}
            activeOpacity={0.85}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Text style={styles.submitButtonText}>Verify Phone & Continue</Text>
                <ArrowRight size={18} color="#FFFFFF" />
              </>
            )}
          </TouchableOpacity>

          {/* Link to Login */}
          <View style={styles.loginLinkRow}>
            <Text style={styles.loginLinkText}>Already have an AVFIT account?</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')} activeOpacity={0.7}>
              <Text style={styles.loginLinkAction}>Log In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 44 : 24,
    paddingBottom: 40,
  },
  topNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 26,
    padding: 22,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 18,
    color: Colors.textSecondary,
    marginBottom: 20,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEE2E2',
    padding: 10,
    borderRadius: 12,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 12,
    color: Colors.danger,
    fontWeight: '600',
    flex: 1,
  },
  avatarPickerSection: {
    marginBottom: 16,
  },
  avatarRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 6,
    marginTop: 4,
  },
  avatarBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surfaceWarm,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarBadgeActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primarySoft,
    transform: [{ scale: 1.08 }],
  },
  inputLabel: {
    fontSize: 11.5,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 14,
    backgroundColor: '#FAFAF8',
    paddingHorizontal: 12,
    marginBottom: 14,
  },
  inputIcon: {
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  phoneInputRow: {
    flexDirection: 'row',
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#FAFAF8',
    marginBottom: 14,
  },
  countryPickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: Colors.surfaceWarm,
    borderRightWidth: 1,
    borderRightColor: Colors.border,
  },
  countryFlag: {
    fontSize: 16,
  },
  countryCodeText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  phoneTextInput: {
    flex: 1,
    paddingHorizontal: 12,
    fontSize: 15,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  countryDropdown: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 14,
    overflow: 'hidden',
  },
  countryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderSubtle,
  },
  countryItemActive: {
    backgroundColor: Colors.primarySoft,
  },
  countryItemFlag: {
    fontSize: 16,
    marginRight: 8,
  },
  countryItemName: {
    flex: 1,
    fontSize: 13,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  countryItemCode: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
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
    gap: 4,
    marginBottom: 14,
  },
  miniChip: {
    flex: 1,
    paddingVertical: 11,
    backgroundColor: Colors.surfaceWarm,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  miniChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  miniChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  miniChipTextActive: {
    color: '#FFFFFF',
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 20,
    marginTop: 4,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: '#FAFAF8',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  checkboxActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  termsText: {
    flex: 1,
    fontSize: 11.5,
    lineHeight: 16,
    color: Colors.textSecondary,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 16,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  loginLinkRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: 18,
  },
  loginLinkText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  loginLinkAction: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.primary,
  },
});
