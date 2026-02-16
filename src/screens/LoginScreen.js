import React, { useCallback, useRef, useState } from 'react';
import {
  Alert, KeyboardAvoidingView, Platform,
  ScrollView, StyleSheet, Text, TextInput, View,
} from 'react-native';
import { Button, Card, Input, SectionHeader } from '../components';
import { generateOTP } from '../services/otpManager';
import { analytics } from '../services/analytics';
import { Colors, Font, Radius, Shadow, Space } from '../styles/theme';

const isValidEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e.trim());

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  const handleChange = useCallback((text) => {
    setEmail(text);
    if (error) setError('');
  }, [error]);

  const handleSend = useCallback(async () => {
    const trimmed = email.trim();
    if (!trimmed) { setError('Please enter your email address.'); return; }
    if (!isValidEmail(trimmed)) { setError('Please enter a valid email address.'); return; }
    setLoading(true);
    setError('');
    try {
      const code = generateOTP(trimmed);
      analytics.otpGenerated(trimmed);
      Alert.alert(
        '🔑 Your OTP',
        `${code}`,
        [{ text: 'OK', onPress: () => navigation.navigate('Otp', { email: trimmed }) }]
      );
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [email, navigation]);

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
        {/* ── Hero header ── */}
        <View style={s.header}>
          <View style={s.decCircleLg} />
          <View style={s.decCircleSm} />
          <View style={s.logoBox}>
            <Text style={s.logoEmoji}>🔐</Text>
          </View>
          <Text style={s.heroTitle}>Welcome Back</Text>
          <Text style={s.heroSub}>Sign in with your email — no password needed</Text>
        </View>

        {/* ── Form ── */}
        <View style={s.body}>
          <Card>
            <SectionHeader
              title="Sign In"
              subtitle="We'll send a 6-digit code to verify you"
            />
            <Input
              ref={inputRef}
              label="Email Address"
              placeholder="you@example.com"
              value={email}
              onChangeText={handleChange}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="done"
              onSubmitEditing={handleSend}
              error={error}
              leftIcon={<Text style={{ fontSize: Font.md }}>✉️</Text>}
            />
            <View style={{ marginTop: Space[5] }}>
              <Button
                label="Send OTP"
                onPress={handleSend}
                loading={loading}
                disabled={!email.trim()}
              />
            </View>
          </Card>

          <View style={s.infoBanner}>
            <Text style={s.infoBannerTitle}>🛡️ Passwordless & Secure</Text>
            <Text style={s.infoBannerText}>
              A 6-digit code valid for 60 seconds. You have 3 attempts to enter it correctly.
            </Text>
          </View>

          <View style={s.devBanner}>
            <Text style={s.devBannerTitle}>👀 Dev Mode</Text>
            <Text style={s.devBannerText}>
              No backend needed. After tapping "Send OTP", check the console / Metro terminal for your code.
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const s = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.white },
  grow: { flexGrow: 1 },

  header: {
    backgroundColor: Colors.blue50,
    paddingTop: Space[16],
    paddingBottom: Space[10],
    paddingHorizontal: Space[6],
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  decCircleLg: {
    position: 'absolute', top: -60, right: -60,
    width: 200, height: 200, borderRadius: 100,
    backgroundColor: Colors.blue100, opacity: 0.6,
  },
  decCircleSm: {
    position: 'absolute', bottom: -30, left: -30,
    width: 120, height: 120, borderRadius: 60,
    backgroundColor: Colors.blue200, opacity: 0.4,
  },
  logoBox: {
    width: 80, height: 80, borderRadius: Radius.xl,
    backgroundColor: Colors.blue600,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: Space[5], ...Shadow.blue,
  },
  logoEmoji: { fontSize: 36 },
  heroTitle: { fontSize: Font['4xl'] - 2, fontWeight: Font.bold, color: Colors.blue900, letterSpacing: -0.5 },
  heroSub: { color: Colors.blue500, fontSize: Font.base, marginTop: Space[1] + 2, textAlign: 'center', fontWeight: Font.medium },

  body: { flex: 1, padding: Space[5], paddingTop: Space[7] },

  infoBanner: {
    marginTop: Space[4], backgroundColor: Colors.infoLight,
    borderRadius: Radius.lg, padding: Space[4],
    borderWidth: 1, borderColor: Colors.infoBorder,
  },
  infoBannerTitle: { color: Colors.blue700, fontWeight: Font.bold, fontSize: Font.sm, marginBottom: Space[1] + 2 },
  infoBannerText: { color: Colors.blue500, fontWeight: Font.regular, fontSize: Font.xs, lineHeight: Font.xs * Font.loose },

  devBanner: {
    marginTop: Space[2] + 2, backgroundColor: Colors.warningLight,
    borderRadius: Radius.lg, padding: Space[4],
    borderWidth: 1, borderColor: Colors.warningBorder,
  },
  devBannerTitle: { color: '#92400e', fontWeight: Font.bold, fontSize: Font.xs, marginBottom: Space[1] },
  devBannerText: { color: '#b45309', fontWeight: Font.regular, fontSize: Font.xs, lineHeight: Font.xs * Font.loose },
});

export default LoginScreen;
