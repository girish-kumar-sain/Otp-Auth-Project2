import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert, ScrollView, StyleSheet,
  Text, TouchableOpacity, View,
} from 'react-native';
import { CommonActions } from '@react-navigation/native';
import { Button, Card, Divider, InfoRow, SectionHeader } from '../components';
import { analytics } from '../services/analytics';
import { clearOTP } from '../services/otpManager';
import { useSessionTimer } from '../hooks/useSessionTimer';
import { Colors, Font, Radius, Shadow, Space } from '../styles/theme';

const formatTime = (ts) =>
  new Date(ts).toLocaleTimeString(undefined, {
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });

const formatDate = (ts) =>
  new Date(ts).toLocaleDateString(undefined, {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

const SessionScreen = ({ navigation, route }) => {
  const { email, sessionStart } = route.params;
  const { formatted, elapsedMs } = useSessionTimer(sessionStart);
  const [loggingOut, setLoggingOut] = useState(false);

  // Log session start once on mount
  useEffect(() => { analytics.sessionStarted(email); }, []); // eslint-disable-line

  const handleLogout = useCallback(() => {
    Alert.alert('Log Out', 'Are you sure you want to end your session?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out', style: 'destructive',
        onPress: () => {
          setLoggingOut(true);
          analytics.logout(email, elapsedMs);
          clearOTP(email);
          navigation.dispatch(
            CommonActions.reset({ index: 0, routes: [{ name: 'Login' }] }),
          );
        },
      },
    ]);
  }, [email, elapsedMs, navigation]);

  const isLongSession = elapsedMs > 14 * 60_000;

  return (
    <ScrollView
      style={s.scroll}
      contentContainerStyle={s.grow}
      showsVerticalScrollIndicator={false}
    >
      {/* ── Header ── */}
      <View style={s.header}>
        <View style={s.decCircle} />
        <View style={s.avatar}>
          <Text style={{ fontSize: 36 }}>👤</Text>
        </View>
        <Text style={s.headerTitle}>Active Session</Text>
        <Text style={s.headerEmail} numberOfLines={1}>{email}</Text>
        <View style={s.liveBadge}>
          <View style={s.liveDot} />
          <Text style={s.liveBadgeText}>Live</Text>
        </View>
      </View>

      {/* ── Timer card ── */}
      <View style={s.timerWrap}>
        <View style={s.timerCard}>
          <View style={s.timerStrip} />
          <Text style={s.timerLabel}>SESSION DURATION</Text>
          <Text style={s.timerValue}>{formatted}</Text>
          <Text style={s.timerSub}>mm : ss</Text>
          <View style={s.timerDivider} />
          <View style={s.timerMeta}>
            <Text style={s.timerMetaLabel}>Started at</Text>
            <Text style={s.timerMetaValue}>{formatTime(sessionStart)}</Text>
          </View>
        </View>
      </View>

      {/* ── Session details ── */}
      <View style={s.section}>
        <Card>
          <SectionHeader title="Session Details" />
          <InfoRow label="Signed in as"  value={email.length > 26 ? `${email.slice(0, 24)}…` : email} />
          <InfoRow label="Login time"    value={formatTime(sessionStart)} />
          <InfoRow label="Date"          value={formatDate(sessionStart)} />
          <InfoRow label="Auth method"   value="Email OTP"     valueColor={Colors.blue600} />
          <InfoRow label="Status"        value="Authenticated" valueColor={Colors.success} />
        </Card>
      </View>

      {/* ── Long session warning ── */}
      {isLongSession && (
        <View style={s.warnBox}>
          <Text style={s.warnTitle}>⏰ Long Session Detected</Text>
          <Text style={s.warnText}>
            You have been logged in for over 15 minutes. Consider logging out when done.
          </Text>
        </View>
      )}

      {/* ── Security info ── */}
      <View style={s.secBox}>
        <Text style={s.secTitle}>🔒 Session Security</Text>
        <Text style={s.secText}>
          Your session is local and secure. Logging out clears your OTP record and auth state.
        </Text>
      </View>

      {/* ── Logout ── */}
      <View style={s.logoutWrap}>
        <Divider />
        <Button
          label="Log Out"
          variant="outline"
          onPress={handleLogout}
          loading={loggingOut}
        />
        <Text style={s.logoutHint}>Tap to safely end your session</Text>
      </View>
    </ScrollView>
  );
};

const s = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: Colors.white },
  grow:   { flexGrow: 1 },

  // Header
  header: {
    backgroundColor:   Colors.blue50,
    paddingTop:        Space[14],
    paddingBottom:     Space[10],
    paddingHorizontal: Space[6],
    alignItems:        'center',
    overflow:          'hidden',
    position:          'relative',
  },
  decCircle: {
    position: 'absolute', top: -80, right: -80,
    width: 240, height: 240, borderRadius: 120,
    backgroundColor: Colors.blue100, opacity: 0.5,
  },
  avatar: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: Colors.blue600,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: Space[3], ...Shadow.blue,
  },
  headerTitle:   { fontSize: Font['2xl'], fontWeight: Font.bold, color: Colors.blue900, letterSpacing: -0.3 },
  headerEmail:   { color: Colors.blue500, fontSize: Font.sm, marginTop: Space[1], fontWeight: Font.medium },
  liveBadge: {
    flexDirection: 'row', alignItems: 'center',
    marginTop: Space[3], backgroundColor: Colors.blue100,
    paddingHorizontal: Space[4], paddingVertical: Space[1] + 2,
    borderRadius: Radius.full, gap: Space[1] + 2,
  },
  liveDot:       { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.success },
  liveBadgeText: { color: Colors.blue700, fontSize: Font.sm, fontWeight: Font.bold },

  // Timer card
  timerWrap: { paddingHorizontal: Space[5], marginTop: -Space[5] },
  timerCard: {
    backgroundColor: Colors.blue600,
    borderRadius: Radius['2xl'],
    paddingVertical: Space[8], paddingHorizontal: Space[6],
    alignItems: 'center', overflow: 'hidden', ...Shadow.blue,
  },
  timerStrip: {
    position: 'absolute', top: 0, left: 0, right: 0,
    height: 4, backgroundColor: Colors.sky500,
  },
  timerLabel:     { color: Colors.blue200, fontSize: Font.xs, fontWeight: Font.bold, letterSpacing: 2.5, marginBottom: Space[2] },
  timerValue:     { color: Colors.white, fontSize: Font.hero, fontWeight: Font.bold, lineHeight: Font.hero * 1.15 },
  timerSub:       { color: Colors.blue300, fontSize: Font.sm, marginTop: Space[1], fontWeight: Font.medium },
  timerDivider:   { width: 40, height: 1, backgroundColor: Colors.blue500, marginVertical: Space[4] },
  timerMeta:      { flexDirection: 'row', alignItems: 'center', gap: Space[2] },
  timerMetaLabel: { color: Colors.blue300, fontSize: Font.xs, fontWeight: Font.medium },
  timerMetaValue: { color: Colors.blue100, fontSize: Font.xs, fontWeight: Font.bold },

  // Sections
  section: { padding: Space[5] },
  warnBox: {
    marginHorizontal: Space[5], marginBottom: Space[3],
    backgroundColor: Colors.warningLight, borderRadius: Radius.lg,
    padding: Space[4], borderWidth: 1, borderColor: Colors.warningBorder,
  },
  warnTitle: { color: '#92400e', fontWeight: Font.bold,    fontSize: Font.sm, marginBottom: Space[1] },
  warnText:  { color: '#b45309', fontWeight: Font.regular, fontSize: Font.sm, lineHeight: Font.sm * Font.normal },
  secBox: {
    marginHorizontal: Space[5], marginBottom: Space[3],
    backgroundColor: Colors.infoLight, borderRadius: Radius.lg,
    padding: Space[4], borderWidth: 1, borderColor: Colors.infoBorder,
  },
  secTitle: { color: Colors.blue700, fontWeight: Font.bold,    fontSize: Font.sm, marginBottom: Space[1] },
  secText:  { color: Colors.blue500, fontWeight: Font.regular, fontSize: Font.sm, lineHeight: Font.sm * Font.normal },

  // Logout
  logoutWrap: { paddingHorizontal: Space[5], paddingBottom: Space[10] },
  logoutHint: { color: Colors.blue300, fontSize: Font.xs, textAlign: 'center', marginTop: Space[2] + 2 },
});

export default SessionScreen;
