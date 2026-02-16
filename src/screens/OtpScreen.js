import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert, KeyboardAvoidingView, Platform,
  ScrollView, StyleSheet, Text,
  TextInput, TouchableOpacity, View,
} from 'react-native';
import { Button, Card, OTPBox, SectionHeader } from '../components';
import { validateOTP } from '../services/otpManager';
import { analytics } from '../services/analytics';
import { useOTP } from '../hooks/useOTP';
import { Colors, Font, Radius, Space } from '../styles/theme';

const OTP_LEN = 6;

const OtpScreen = ({ navigation, route }) => {
  const { email } = route.params;

  const [otp,      setOtp]      = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading,  setLoading]  = useState(false);
  const [success,  setSuccess]  = useState(false);
  const [focusIdx, setFocusIdx] = useState(0);

  const inputRef = useRef(null);

  const handleExpire = useCallback(() =>
    setErrorMsg('Your OTP has expired. Please request a new one.'), []);

  const {
    secondsLeft, countdownFormatted, isExpired,
    isLocked, remainingAttempts,
    requestNewOTP, lockOTP, recordFailedAttempt,
  } = useOTP({ email, onExpire: handleExpire });

  // Auto-focus input on mount
  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 400);
    return () => clearTimeout(t);
  }, []);

  // Keep virtual focus index in sync with OTP length
  useEffect(() => { setFocusIdx(Math.min(otp.length, OTP_LEN - 1)); }, [otp]);

  const handleResend = useCallback(() => {
    setOtp(''); setErrorMsg(''); setSuccess(false);
    const code = requestNewOTP();
    console.log(`[DEV] New OTP for ${email}: ${code}`);
    Alert.alert('OTP Sent', `A new OTP has been generated.\n(Dev: ${code})`);
  }, [email, requestNewOTP]);

  const verifyOTP = useCallback(async (code) => {
    if (loading) return;
    setLoading(true); setErrorMsg('');
    try {
      const result = validateOTP(email, code);
      switch (result.status) {
        case 'success':
          setSuccess(true);
          analytics.otpValidationSuccess(email);
          setTimeout(() =>
            navigation.replace('Session', { email, sessionStart: Date.now() }), 700);
          break;
        case 'invalid':
          analytics.otpValidationFailure(email, 'invalid_code', result.remainingAttempts ?? 0);
          recordFailedAttempt();
          setErrorMsg(result.message);
          setOtp('');
          inputRef.current?.focus();
          if ((result.remainingAttempts ?? 0) === 0) lockOTP();
          break;
        default:
          if (result.status === 'max_attempts') lockOTP();
          setErrorMsg(result.message);
          setOtp('');
      }
    } finally {
      setLoading(false);
    }
  }, [email, loading, navigation, recordFailedAttempt, lockOTP]);

  const handleOTPChange = useCallback((text) => {
    const cleaned = text.replace(/\D/g, '').slice(0, OTP_LEN);
    setOtp(cleaned);
    if (errorMsg) setErrorMsg('');
    if (cleaned.length === OTP_LEN) void verifyOTP(cleaned);
  }, [errorMsg, verifyOTP]);

  const isDisabled   = isLocked || isExpired || success || loading;
  const canResend    = isExpired || isLocked;
  const digits       = Array.from({ length: OTP_LEN }, (_, i) => otp[i] ?? '');
  const ringProgress = (secondsLeft / 60) * 100;
  const isUrgent     = secondsLeft <= 10 && !isExpired;

  const countdownColor = isExpired  ? Colors.error
    : isUrgent                      ? Colors.warning
    : secondsLeft <= 30             ? '#f59e0b'
    : Colors.blue600;

  return (
    <KeyboardAvoidingView
      style={s.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={s.flex}
        contentContainerStyle={s.grow}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ── */}
        <View style={s.header}>
          <View style={[s.countdownRing, isUrgent && s.countdownRingUrgent]}>
            <Text style={[s.countdownNum, { color: countdownColor }]}>
              {isExpired ? '✕' : secondsLeft}
            </Text>
            <Text style={s.countdownLabel}>{isExpired ? 'expired' : 'sec'}</Text>
          </View>
          <Text style={s.title}>Enter Your OTP</Text>
          <Text style={s.sub}>
            Sent to <Text style={s.emailHighlight}>{email}</Text>
          </Text>
        </View>

        {/* ── Card ── */}
        <View style={s.body}>
          <Card>
            <SectionHeader
              title="Verify Code"
              subtitle={
                isLocked  ? 'Too many attempts. Request a new OTP.' :
                isExpired ? 'This OTP has expired.' :
                `Enter the 6-digit code · ${countdownFormatted} remaining`
              }
            />

            {/* OTP boxes */}
            <View style={s.boxRow}>
              {digits.map((d, i) => (
                <TouchableOpacity
                  key={i}
                  onPress={() => !isDisabled && inputRef.current?.focus()}
                  activeOpacity={0.7}
                >
                  <OTPBox
                    value={d}
                    isFocused={i === focusIdx && !isDisabled}
                    hasError={Boolean(errorMsg)}
                  />
                </TouchableOpacity>
              ))}
            </View>

            {/* Hidden driving input */}
            <TextInput
              ref={inputRef}
              value={otp}
              onChangeText={handleOTPChange}
              keyboardType="number-pad"
              maxLength={OTP_LEN}
              editable={!isDisabled}
              style={s.hiddenInput}
            />

            {/* Feedback messages */}
            {success ? (
              <View style={s.successBox}>
                <Text style={s.successText}>✓ Verified! Logging you in...</Text>
              </View>
            ) : errorMsg ? (
              <View style={s.errorBox}>
                <Text style={s.errorText}>{errorMsg}</Text>
              </View>
            ) : null}

            {/* Attempt indicator dots */}
            {!isLocked && !isExpired && !success && (
              <View style={s.attemptsRow}>
                {[0, 1, 2].map(i => (
                  <View key={i} style={[s.dot, i < remainingAttempts ? s.dotOn : s.dotOff]} />
                ))}
                <Text style={s.attemptsLabel}>
                  {remainingAttempts} attempt{remainingAttempts !== 1 ? 's' : ''} left
                </Text>
              </View>
            )}

            <Button
              label={loading ? 'Verifying...' : 'Verify OTP'}
              onPress={() => void verifyOTP(otp)}
              loading={loading}
              disabled={isDisabled || otp.length < OTP_LEN}
            />

            {/* Resend / back */}
            <View style={s.actionRow}>
              {canResend ? (
                <TouchableOpacity onPress={handleResend} style={s.resendBtn}>
                  <Text style={s.resendLabel}>Resend OTP</Text>
                </TouchableOpacity>
              ) : (
                <Text style={s.resendHint}>Resend available after expiry</Text>
              )}
              <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
                <Text style={s.backLabel}>Change Email</Text>
              </TouchableOpacity>
            </View>
          </Card>

          {/* Countdown progress bar */}
          {!isExpired && !isLocked && (
            <View style={s.progressBg}>
              <View
                style={[
                  s.progressFill,
                  { width: `${ringProgress}%`, backgroundColor: isUrgent ? Colors.error : Colors.blue500 },
                ]}
              />
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const s = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.white },
  grow: { flexGrow: 1 },

  header: {
    backgroundColor: Colors.blue50, paddingTop: Space[14],
    paddingBottom: Space[10], paddingHorizontal: Space[6], alignItems: 'center',
  },
  countdownRing: {
    width: 96, height: 96, borderRadius: 48,
    backgroundColor: Colors.blue100, alignItems: 'center', justifyContent: 'center',
    marginBottom: Space[4],
    shadowColor: Colors.blue600, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18, shadowRadius: 12, elevation: 6,
  },
  countdownRingUrgent: { backgroundColor: '#fee2e2' },
  countdownNum:   { fontSize: 36, fontWeight: Font.bold, lineHeight: 42 },
  countdownLabel: { fontSize: Font.xs, color: Colors.blue300, fontWeight: Font.medium },
  title:          { fontSize: Font['2xl'], fontWeight: Font.bold, color: Colors.blue900, letterSpacing: -0.5 },
  sub:            { color: Colors.blue500, fontSize: Font.sm, marginTop: Space[1], fontWeight: Font.medium },
  emailHighlight: { color: Colors.blue700, fontWeight: Font.bold },

  body:       { flex: 1, padding: Space[5], paddingTop: Space[6] },
  boxRow:     { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Space[5] },
  hiddenInput:{ position: 'absolute', opacity: 0, height: 0, width: 0 },

  successBox:  { backgroundColor: Colors.successLight, borderWidth: 1, borderColor: Colors.successBorder, borderRadius: Radius.md, padding: Space[3], marginBottom: Space[4] },
  successText: { color: '#065f46', fontWeight: Font.semibold, fontSize: Font.sm, textAlign: 'center' },
  errorBox:    { backgroundColor: Colors.errorLight, borderWidth: 1, borderColor: Colors.errorBorder, borderRadius: Radius.md, padding: Space[3], marginBottom: Space[4] },
  errorText:   { color: Colors.error, fontWeight: Font.semibold, fontSize: Font.sm, textAlign: 'center' },

  attemptsRow:  { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: Space[4] },
  dot:          { width: 8, height: 8, borderRadius: 4, marginHorizontal: 3 },
  dotOn:        { backgroundColor: Colors.blue500 },
  dotOff:       { backgroundColor: Colors.blue100 },
  attemptsLabel:{ color: Colors.blue300, fontSize: Font.xs, marginLeft: Space[2], fontWeight: Font.medium },

  actionRow:  { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: Space[4], gap: Space[4] },
  resendBtn:  { backgroundColor: Colors.blue600, paddingHorizontal: Space[4], paddingVertical: Space[2], borderRadius: Radius.md },
  resendLabel:{ color: Colors.white, fontWeight: Font.bold, fontSize: Font.sm },
  resendHint: { color: Colors.blue300, fontSize: Font.xs },
  backBtn:    { padding: Space[2] },
  backLabel:  { color: Colors.blue500, fontWeight: Font.medium, fontSize: Font.sm },

  progressBg:   { height: 8, backgroundColor: Colors.blue100, borderRadius: Radius.full, marginTop: Space[4], overflow: 'hidden' },
  progressFill: { height: 8, borderRadius: Radius.full },
});

export default OtpScreen;
