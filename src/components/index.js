/**
 * components/index.js
 * All reusable UI primitives.
 * Styling: React Native StyleSheet only — zero external CSS libraries.
 */

import React, { forwardRef } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Colors, Font, Radius, Shadow, Space } from '../styles/theme';

// ─── Card ─────────────────────────────────────────────────────────────────────
export const Card = ({ children }) => (
  <View style={cs.card}>{children}</View>
);

// ─── Button ───────────────────────────────────────────────────────────────────
export const Button = ({
  label,
  loading = false,
  variant = 'primary',
  disabled,
  ...rest
}) => {
  const isDisabled = disabled || loading;
  return (
    <TouchableOpacity
      style={[
        cs.btnBase,
        variant === 'primary'   && cs.btnPrimary,
        variant === 'secondary' && cs.btnSecondary,
        variant === 'outline'   && cs.btnOutline,
        variant === 'ghost'     && cs.btnGhost,
        isDisabled && cs.btnDisabled,
      ]}
      disabled={isDisabled}
      activeOpacity={0.85}
      {...rest}
    >
      {loading && (
        <ActivityIndicator
          color={variant === 'primary' ? Colors.white : Colors.blue600}
          size="small"
          style={{ marginRight: Space[2] }}
        />
      )}
      <Text style={[
        cs.btnLabel,
        variant === 'primary'   && cs.btnLabelPrimary,
        variant === 'secondary' && cs.btnLabelSecondary,
        variant === 'outline'   && cs.btnLabelOutline,
        variant === 'ghost'     && cs.btnLabelGhost,
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

// ─── Input ────────────────────────────────────────────────────────────────────
export const Input = forwardRef(
  ({ label, error, hint, leftIcon, rightIcon, ...rest }, ref) => {
    const hasError = Boolean(error);
    return (
      <View style={cs.inputWrapper}>
        {label ? <Text style={cs.inputLabel}>{label}</Text> : null}
        <View style={[cs.inputRow, hasError && cs.inputRowError]}>
          {leftIcon ? <View style={{ marginRight: Space[2] }}>{leftIcon}</View> : null}
          <TextInput
            ref={ref}
            style={cs.inputField}
            placeholderTextColor={Colors.blue300}
            {...rest}
          />
          {rightIcon ? <View style={{ marginLeft: Space[2] }}>{rightIcon}</View> : null}
        </View>
        {error ? (
          <Text style={cs.inputError}>{error}</Text>
        ) : hint ? (
          <Text style={cs.inputHint}>{hint}</Text>
        ) : null}
      </View>
    );
  },
);
Input.displayName = 'Input';

// ─── OTP Box ──────────────────────────────────────────────────────────────────
export const OTPBox = ({ value, isFocused, hasError }) => (
  <View style={[
    cs.otpBox,
    isFocused && !hasError && cs.otpBoxFocused,
    hasError              && cs.otpBoxError,
    value && !hasError && !isFocused && cs.otpBoxFilled,
  ]}>
    <Text style={[cs.otpDigit, hasError && cs.otpDigitError]}>{value}</Text>
  </View>
);

// ─── Section Header ───────────────────────────────────────────────────────────
export const SectionHeader = ({ title, subtitle }) => (
  <View style={{ marginBottom: Space[5] }}>
    <Text style={cs.sectionTitle}>{title}</Text>
    {subtitle ? <Text style={cs.sectionSub}>{subtitle}</Text> : null}
  </View>
);

// ─── Info Row ─────────────────────────────────────────────────────────────────
export const InfoRow = ({ label, value, valueColor = Colors.blue900 }) => (
  <View style={cs.infoRow}>
    <Text style={cs.infoLabel}>{label}</Text>
    <Text style={[cs.infoValue, { color: valueColor }]}>{value}</Text>
  </View>
);

// ─── Divider ──────────────────────────────────────────────────────────────────
export const Divider = () => <View style={cs.divider} />;

// ─── Styles ───────────────────────────────────────────────────────────────────
const cs = StyleSheet.create({
  // Card
  card: {
    backgroundColor: Colors.white,
    borderRadius:    Radius['2xl'],
    padding:         Space[6],
    borderWidth:     1,
    borderColor:     Colors.blue100,
    ...Shadow.md,
  },

  // Button
  btnBase: {
    flexDirection:     'row',
    alignItems:        'center',
    justifyContent:    'center',
    borderRadius:      Radius.lg,
    paddingHorizontal: Space[6],
    paddingVertical:   Space[4],
    width:             '100%',
  },
  btnPrimary:        { backgroundColor: Colors.blue600 },
  btnSecondary:      { backgroundColor: Colors.blue100 },
  btnOutline:        { backgroundColor: 'transparent', borderWidth: 2, borderColor: Colors.blue600 },
  btnGhost:          { backgroundColor: 'transparent' },
  btnDisabled:       { opacity: 0.5 },
  btnLabel:          { fontSize: Font.md, fontWeight: Font.bold },
  btnLabelPrimary:   { color: Colors.white },
  btnLabelSecondary: { color: Colors.blue700 },
  btnLabelOutline:   { color: Colors.blue600 },
  btnLabelGhost:     { color: Colors.blue600 },

  // Input
  inputWrapper: { width: '100%', marginBottom: Space[1] },
  inputLabel: {
    color:        Colors.blue800,
    fontWeight:   Font.semibold,
    fontSize:     Font.sm,
    marginBottom: Space[1] + 2,
    marginLeft:   Space[1],
  },
  inputRow: {
    flexDirection:     'row',
    alignItems:        'center',
    borderRadius:      Radius.lg,
    borderWidth:       1.5,
    borderColor:       Colors.blue200,
    backgroundColor:   Colors.blue50,
    paddingHorizontal: Space[4],
  },
  inputRowError: { borderColor: Colors.errorBorder, backgroundColor: Colors.errorLight },
  inputField: {
    flex:            1,
    color:           Colors.blue900,
    fontSize:        Font.md,
    paddingVertical: Space[3] + 2,
    fontWeight:      Font.medium,
  },
  inputError: { color: Colors.error,  fontSize: Font.xs, marginTop: Space[1] + 2, marginLeft: Space[1], fontWeight: Font.medium },
  inputHint:  { color: Colors.blue400, fontSize: Font.xs, marginTop: Space[1] + 2, marginLeft: Space[1] },

  // OTP Box
  otpBox: {
    width:           46,
    height:          56,
    borderRadius:    Radius.md,
    borderWidth:     2,
    borderColor:     Colors.blue200,
    backgroundColor: Colors.blue50,
    alignItems:      'center',
    justifyContent:  'center',
  },
  otpBoxFocused: { borderColor: Colors.blue600, backgroundColor: Colors.white, ...Shadow.sm },
  otpBoxFilled:  { borderColor: Colors.blue400, backgroundColor: Colors.white },
  otpBoxError:   { borderColor: Colors.errorBorder, backgroundColor: Colors.errorLight },
  otpDigit:      { fontSize: Font['2xl'], fontWeight: Font.bold, color: Colors.blue800 },
  otpDigitError: { color: Colors.error },

  // Section Header
  sectionTitle: { fontSize: Font['3xl'], fontWeight: Font.bold, color: Colors.blue900, letterSpacing: -0.5 },
  sectionSub:   { color: Colors.blue500, fontSize: Font.base, marginTop: Space[1], fontWeight: Font.medium },

  // Info Row
  infoRow: {
    flexDirection:     'row',
    justifyContent:    'space-between',
    alignItems:        'center',
    paddingVertical:   Space[3],
    borderBottomWidth: 1,
    borderBottomColor: Colors.blue50,
  },
  infoLabel: { color: Colors.blue500, fontWeight: Font.medium,  fontSize: Font.sm },
  infoValue: { fontSize: Font.sm,     fontWeight: Font.semibold },

  // Divider
  divider: { height: 1, backgroundColor: Colors.blue100, marginVertical: Space[4] },
});
