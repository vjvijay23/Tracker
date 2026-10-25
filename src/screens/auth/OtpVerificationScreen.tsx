import React, { useState, useEffect, useRef } from 'react';
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
  ShieldCheck,
  RotateCcw,
  CheckCircle,
  AlertCircle,
  Edit2,
  Lock,
} from 'lucide-react-native';

interface OtpVerificationScreenProps {
  route?: {
    params?: {
      phone?: string;
      countryCode?: string;
      authMode?: 'login' | 'signup';
      pendingProfile?: any;
    };
  };
  navigation?: any;
  onVerifiedSuccess?: (isNewUser: boolean) => void;
  onBackToPhone?: () => void;
}

export default function OtpVerificationScreen({
  route,
  navigation,
  onVerifiedSuccess,
  onBackToPhone,
}: OtpVerificationScreenProps) {
  const insets = useSafeAreaInsets();
  const phone = route?.params?.phone || '+1 (555) 019-2834';
  const countryCode = route?.params?.countryCode || '+1';
  const authMode = route?.params?.authMode || 'signup';
  const pendingProfile = route?.params?.pendingProfile;

  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(
    'Verification code sent! (Sandbox mode: Use 123456 to test)'
  );

  const inputRefs = useRef<Array<TextInput | null>>([]);

  // 60-second countdown timer for OTP resend
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleDigitChange = (value: string, index: number) => {
    setErrorMessage(null);
    const cleaned = value.replace(/[^0-9]/g, '');

    const newDigits = [...otpDigits];
    newDigits[index] = cleaned.slice(-1); // Take latest digit
    setOtpDigits(newDigits);

    // Auto advance focus to next input
    if (cleaned && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-verify if all 6 digits are populated
    const completeCode = newDigits.join('');
    if (completeCode.length === 6) {
      verifyCode(completeCode);
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const verifyCode = async (tokenOverride?: string) => {
    const code = tokenOverride || otpDigits.join('');
    if (code.length !== 6) {
      setErrorMessage('Please enter all 6 digits of your OTP.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const result = await AuthService.verifyPhoneOtp(
        {
          phone,
          token: code,
        },
        pendingProfile,
        authMode
      );

      if (result.success) {
        if (onVerifiedSuccess) {
          onVerifiedSuccess(result.isNewUser);
        } else if (navigation?.replace) {
          if (authMode === 'signup' || result.isNewUser || !result.user.isOnboarded) {
            navigation.replace('FitnessOnboarding');
          } else {
            navigation.replace('Main');
          }
        }
      }
    } catch (err: any) {
      setErrorMessage(
        err.message || 'The verification code entered is incorrect or expired. Try 123456.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend || isLoading) return;

    setIsLoading(true);
    setErrorMessage(null);
    setSuccessNotice(null);

    try {
      await AuthService.sendPhoneOtp({ phone, countryCode });
      setCountdown(60);
      setCanResend(false);
      setSuccessNotice('New verification code dispatched to your phone!');
      setOtpDigits(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to resend code. Please try again shortly.');
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
          <AvfitLogo size={36} showWordmark={true} />
        </View>

        <View style={styles.card}>
          <View style={styles.iconCircle}>
            <Lock size={28} color={Colors.primary} />
          </View>

          <Text style={styles.title}>Enter 6-Digit OTP</Text>
          <Text style={styles.subtitle}>
            We've sent a one-time verification code to:
          </Text>

          {/* Phone Display with Edit */}
          <View style={styles.phoneBadge}>
            <Text style={styles.phoneText}>{phone}</Text>
            <TouchableOpacity
              onPress={() => {
                if (onBackToPhone) onBackToPhone();
                else if (navigation?.goBack) navigation.goBack();
              }}
              style={styles.editButton}
              activeOpacity={0.7}
            >
              <Edit2 size={14} color={Colors.primary} />
              <Text style={styles.editText}>Edit</Text>
            </TouchableOpacity>
          </View>

          {/* Success or Error Notice */}
          {successNotice && (
            <View style={styles.noticeBanner}>
              <CheckCircle size={15} color={Colors.primary} />
              <Text style={styles.noticeText}>{successNotice}</Text>
            </View>
          )}

          {errorMessage && (
            <View style={styles.errorBanner}>
              <AlertCircle size={15} color={Colors.danger} />
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          )}

          {/* 6 Digit Input Cells */}
          <View style={styles.otpInputRow}>
            {otpDigits.map((digit, idx) => (
              <TextInput
                key={idx}
                ref={(el) => (inputRefs.current[idx] = el)}
                style={[
                  styles.otpCell,
                  digit ? styles.otpCellFilled : null,
                  errorMessage ? styles.otpCellError : null,
                ]}
                keyboardType="number-pad"
                maxLength={1}
                value={digit}
                onChangeText={(val) => handleDigitChange(val, idx)}
                onKeyPress={(e) => handleKeyPress(e, idx)}
                autoFocus={idx === 0}
                selectTextOnFocus
              />
            ))}
          </View>

          {/* Resend Countdown Row */}
          <View style={styles.resendContainer}>
            {canResend ? (
              <TouchableOpacity
                style={styles.resendActiveButton}
                onPress={handleResend}
                disabled={isLoading}
                activeOpacity={0.7}
              >
                <RotateCcw size={15} color={Colors.primary} />
                <Text style={styles.resendActiveText}>Resend OTP Code</Text>
              </TouchableOpacity>
            ) : (
              <Text style={styles.countdownText}>
                Resend code in{' '}
                <Text style={styles.countdownHighlight}>
                  {countdown > 9 ? `00:${countdown}` : `00:0${countdown}`}
                </Text>
              </Text>
            )}
          </View>

          {/* Confirm Button */}
          <TouchableOpacity
            style={[styles.verifyButton, isLoading && styles.verifyButtonDisabled]}
            onPress={() => verifyCode()}
            disabled={isLoading}
            activeOpacity={0.85}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.verifyButtonText}>Verify & Proceed</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Security Assurance */}
        <View style={styles.securityRow}>
          <ShieldCheck size={16} color={Colors.primary} />
          <Text style={styles.securityText}>
            Protected by Supabase Auth with SMS Rate-Limiting & Anti-Abuse
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
    padding: 24,
    paddingTop: Platform.OS === 'ios' ? 54 : 40,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
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
    alignItems: 'center',
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
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
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 12,
  },
  phoneBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.surfaceWarm,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 20,
  },
  phoneText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingLeft: 6,
    borderLeftWidth: 1,
    borderLeftColor: Colors.border,
  },
  editText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  noticeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.primarySoft,
    padding: 10,
    borderRadius: 12,
    marginBottom: 16,
    width: '100%',
  },
  noticeText: {
    fontSize: 11.5,
    color: Colors.primaryDark,
    fontWeight: '600',
    flex: 1,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEE2E2',
    padding: 10,
    borderRadius: 12,
    marginBottom: 16,
    width: '100%',
  },
  errorText: {
    fontSize: 12,
    color: Colors.danger,
    fontWeight: '600',
    flex: 1,
  },
  otpInputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 24,
    gap: 8,
  },
  otpCell: {
    flex: 1,
    height: 52,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: '#FAFAF8',
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  otpCellFilled: {
    borderColor: Colors.primary,
    backgroundColor: '#FFFFFF',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  otpCellError: {
    borderColor: Colors.danger,
    backgroundColor: '#FFF5F5',
  },
  resendContainer: {
    marginBottom: 24,
  },
  countdownText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  countdownHighlight: {
    color: Colors.accentOrange,
    fontWeight: '700',
  },
  resendActiveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  resendActiveText: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '700',
  },
  verifyButton: {
    width: '100%',
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  verifyButtonDisabled: {
    opacity: 0.7,
  },
  verifyButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  securityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 24,
    paddingHorizontal: 16,
  },
  securityText: {
    fontSize: 11,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 16,
  },
});
