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
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../theme/colors';
import { AuthService } from '../../services/auth';
import AvfitLogo from '../../components/common/AvfitLogo';
import { Smartphone, ArrowRight, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react-native';

interface PhoneAuthScreenProps {
  navigation: any;
  onCodeSent?: (phone: string, countryCode: string) => void;
}

const COUNTRY_CODES = [
  { code: '+1', name: 'US / Canada', flag: '🇺🇸' },
  { code: '+91', name: 'India', flag: '🇮🇳' },
  { code: '+44', name: 'United Kingdom', flag: '🇬🇧' },
  { code: '+61', name: 'Australia', flag: '🇦🇺' },
  { code: '+49', name: 'Germany', flag: '🇩🇪' },
  { code: '+971', name: 'UAE', flag: '🇦🇪' },
];

export default function PhoneAuthScreen({ navigation, onCodeSent }: PhoneAuthScreenProps) {
  const insets = useSafeAreaInsets();
  const [selectedCountry, setSelectedCountry] = useState(COUNTRY_CODES[0]);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('signup');

  const handleSendOtp = async () => {
    setErrorMessage(null);
    const cleaned = phoneNumber.replace(/[^0-9]/g, '');

    if (!cleaned || cleaned.length < 7) {
      setErrorMessage('Please enter a valid mobile number (at least 7-10 digits).');
      return;
    }

    const fullPhone = `${selectedCountry.code}${cleaned}`;
    setIsLoading(true);

    try {
      const response = await AuthService.sendPhoneOtp({
        phone: fullPhone,
        countryCode: selectedCountry.code,
      });

      if (response.success) {
        if (onCodeSent) {
          onCodeSent(fullPhone, selectedCountry.code);
        } else if (navigation?.navigate) {
          navigation.navigate('OtpVerification', {
            phone: fullPhone,
            countryCode: selectedCountry.code,
            authMode,
          });
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Unable to send verification code. Please check your network and try again.');
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
        {/* Brand Header */}
        <View style={styles.header}>
          <AvfitLogo size={42} showWordmark={true} />
        </View>

        {/* Auth Mode Toggle Pill */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tabButton, authMode === 'signup' && styles.tabButtonActive]}
            onPress={() => setAuthMode('signup')}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabText, authMode === 'signup' && styles.tabTextActive]}>
              New Account
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, authMode === 'login' && styles.tabButtonActive]}
            onPress={() => setAuthMode('login')}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabText, authMode === 'login' && styles.tabTextActive]}>
              Log In
            </Text>
          </TouchableOpacity>
        </View>

        {/* Card Form */}
        <View style={styles.card}>
          <Text style={styles.title}>
            {authMode === 'signup' ? 'Start Your Fitness Journey' : 'Welcome Back'}
          </Text>
          <Text style={styles.subtitle}>
            Enter your mobile number to receive a secure 6-digit one-time verification code via SMS.
          </Text>

          {errorMessage && (
            <View style={styles.errorBanner}>
              <AlertCircle size={16} color={Colors.danger} />
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          )}

          {/* Phone Input Box */}
          <Text style={styles.inputLabel}>Mobile Phone Number</Text>
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
              placeholder="e.g. 555-019-2834"
              placeholderTextColor="#9EA6A0"
              keyboardType="phone-pad"
              value={phoneNumber}
              onChangeText={(val) => {
                setPhoneNumber(val);
                if (errorMessage) setErrorMessage(null);
              }}
              autoFocus
              editable={!isLoading}
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

          {/* Security & Consent Note */}
          <View style={styles.consentBox}>
            <ShieldCheck size={16} color={Colors.primary} />
            <Text style={styles.consentText}>
              By proceeding, you authorize AVFIT to send an SMS verification OTP. Standard carrier rates may apply. No passwords to remember.
            </Text>
          </View>

          {/* Submit Action Button */}
          <TouchableOpacity
            style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
            onPress={handleSendOtp}
            disabled={isLoading}
            activeOpacity={0.85}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Text style={styles.submitButtonText}>
                  {authMode === 'signup' ? 'Send Signup OTP' : 'Send Login OTP'}
                </Text>
                <ArrowRight size={18} color="#FFFFFF" />
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Feature Highlights Footer */}
        <View style={styles.featuresRow}>
          <View style={styles.featureItem}>
            <CheckCircle2 size={16} color={Colors.primary} />
            <Text style={styles.featureText}>Zero Password Hassle</Text>
          </View>
          <View style={styles.featureItem}>
            <CheckCircle2 size={16} color={Colors.primary} />
            <Text style={styles.featureText}>End-to-End Encrypted</Text>
          </View>
          <View style={styles.featureItem}>
            <CheckCircle2 size={16} color={Colors.primary} />
            <Text style={styles.featureText}>Instant Sync</Text>
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
    padding: 24,
    paddingTop: Platform.OS === 'ios' ? 54 : 40,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceWarm,
    borderRadius: 16,
    padding: 4,
    marginBottom: 20,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 12,
  },
  tabButtonActive: {
    backgroundColor: Colors.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
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
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  phoneInputRow: {
    flexDirection: 'row',
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#FAFAF8',
    marginBottom: 16,
  },
  countryPickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 14,
    backgroundColor: Colors.surfaceWarm,
    borderRightWidth: 1,
    borderRightColor: Colors.border,
  },
  countryFlag: {
    fontSize: 18,
  },
  countryCodeText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  phoneTextInput: {
    flex: 1,
    paddingHorizontal: 14,
    fontSize: 16,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  countryDropdown: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 16,
    overflow: 'hidden',
  },
  countryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderSubtle,
  },
  countryItemActive: {
    backgroundColor: Colors.primarySoft,
  },
  countryItemFlag: {
    fontSize: 16,
    marginRight: 10,
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
  consentBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: Colors.primarySoft,
    padding: 12,
    borderRadius: 14,
    marginBottom: 20,
  },
  consentText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 16,
    color: Colors.primaryDark,
    fontWeight: '500',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 16,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  featuresRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    paddingHorizontal: 6,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  featureText: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
});
