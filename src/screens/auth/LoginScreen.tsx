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
import {
  Smartphone,
  ArrowRight,
  ShieldCheck,
  ChevronLeft,
  AlertCircle,
  Zap,
  Lock,
} from 'lucide-react-native';

const COUNTRY_CODES = [
  { code: '+1', name: 'US / CA', flag: '🇺🇸' },
  { code: '+91', name: 'India', flag: '🇮🇳' },
  { code: '+44', name: 'UK', flag: '🇬🇧' },
  { code: '+61', name: 'Australia', flag: '🇦🇺' },
  { code: '+49', name: 'Germany', flag: '🇩🇪' },
  { code: '+971', name: 'UAE', flag: '🇦🇪' },
];

interface LoginScreenProps {
  navigation: any;
}

export default function LoginScreen({ navigation }: LoginScreenProps) {
  const insets = useSafeAreaInsets();
  const [selectedCountry, setSelectedCountry] = useState(COUNTRY_CODES[1]); // Default +91 or +1
  const [phoneNumber, setPhoneNumber] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showCountryPicker, setShowCountryPicker] = useState(false);

  const handleSendLoginOtp = async () => {
    setErrorMessage(null);
    const cleanPhone = phoneNumber.replace(/[^0-9]/g, '');

    if (!cleanPhone || cleanPhone.length < 8) {
      setErrorMessage('Please enter a valid registered mobile number (8-10 digits).');
      return;
    }

    const fullPhone = `${selectedCountry.code}${cleanPhone}`;
    setIsLoading(true);

    try {
      const response = await AuthService.sendPhoneOtp(
        {
          phone: fullPhone,
          countryCode: selectedCountry.code,
        },
        'login'
      );

      if (response.success) {
        navigation.navigate('OtpVerification', {
          phone: fullPhone,
          countryCode: selectedCountry.code,
          authMode: 'login',
        });
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Unable to send login OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Instant demo helper to log in directly without typing
  const handleQuickDemoLogin = async () => {
    navigation.navigate('Main');
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
          <View style={styles.iconCircle}>
            <Lock size={26} color={Colors.primary} />
          </View>

          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>
            Enter your mobile phone number to receive a secure SMS one-time verification password.
          </Text>

          {errorMessage && (
            <View style={styles.errorBanner}>
              <AlertCircle size={16} color={Colors.danger} />
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          )}

          {/* Mobile Phone Number Input */}
          <Text style={styles.inputLabel}>Registered Mobile Number</Text>
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
              autoFocus
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

          {/* Submit Action */}
          <TouchableOpacity
            style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
            onPress={handleSendLoginOtp}
            disabled={isLoading}
            activeOpacity={0.85}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Text style={styles.submitButtonText}>Send Login OTP</Text>
                <ArrowRight size={18} color="#FFFFFF" />
              </>
            )}
          </TouchableOpacity>

          {/* Quick Demo Login Option */}
          <TouchableOpacity
            style={styles.quickDemoButton}
            onPress={handleQuickDemoLogin}
            activeOpacity={0.8}
          >
            <Zap size={15} color={Colors.accentOrange} />
            <Text style={styles.quickDemoText}>Quick Test: Enter as Alex Vance (Demo)</Text>
          </TouchableOpacity>

          {/* Link to Sign Up */}
          <View style={styles.signupLinkRow}>
            <Text style={styles.signupLinkText}>Don't have an AVFIT account?</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Signup')} activeOpacity={0.7}>
              <Text style={styles.signupLinkAction}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Security & Recovery */}
        <View style={styles.securityBox}>
          <ShieldCheck size={16} color={Colors.primary} />
          <Text style={styles.securityText}>
            Changed your phone number? You can recover access by verifying your new phone identity.
          </Text>
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
    marginBottom: 20,
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
    padding: 24,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  iconCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: Colors.primarySoft,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
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
    fontSize: 11.5,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  phoneInputRow: {
    flexDirection: 'row',
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#FAFAF8',
    marginBottom: 20,
  },
  countryPickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 14,
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
    marginBottom: 16,
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
    marginBottom: 12,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  quickDemoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.surfaceWarm,
    paddingVertical: 13,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 18,
  },
  quickDemoText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  signupLinkRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  signupLinkText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  signupLinkAction: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.primary,
  },
  securityBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: Colors.surfaceWarm,
    padding: 14,
    borderRadius: 16,
    marginTop: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  securityText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 16,
    color: Colors.textSecondary,
  },
});
