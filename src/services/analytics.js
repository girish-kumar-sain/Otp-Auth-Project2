/**
 * analytics.js
 * External SDK: AsyncStorage (persistent log) + NetInfo (network enrichment)
 *
 * All logEvent calls are fire-and-forget — analytics never blocks the UI.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform }  from 'react-native';

const ANALYTICS_KEY = 'analytics_log';

let initialised = false;

/** Call once at app startup (inside App.js useEffect). */
export const initAnalytics = async () => {
  if (initialised) return;
  try {
    const existing = await AsyncStorage.getItem(ANALYTICS_KEY);
    if (existing === null) {
      await AsyncStorage.setItem(ANALYTICS_KEY, JSON.stringify([]));
    }
    initialised = true;
    console.log('[Analytics] Initialised');
  } catch (err) {
    console.warn('[Analytics] Init failed:', err);
  }
};

// Web-safe network helper — navigator.onLine on web, NetInfo on native
const getNetworkState = async () => {
  if (Platform.OS === 'web') {
    return {
      isConnected: typeof navigator !== 'undefined' ? navigator.onLine : true,
      type: 'web',
    };
  }
  try {
    const NetInfo = await import('@react-native-community/netinfo');
    const state   = await NetInfo.default.fetch();
    return { isConnected: state.isConnected, type: state.type };
  } catch {
    return { isConnected: null, type: 'unknown' };
  }
};

/**
 * Log an analytics event.
 * Fire-and-forget — never await this in UI code.
 *
 * @param {string} event
 * @param {string} [email]
 * @param {Object} [metadata]
 */
export const logEvent = (event, email, metadata) => {
  void (async () => {
    try {
      const net   = await getNetworkState();
      const entry = {
        event,
        email,
        timestamp:      Date.now(),
        metadata,
        isConnected:    net.isConnected,
        connectionType: net.type,
        loggedAt:       new Date().toISOString(),
      };
      const raw      = await AsyncStorage.getItem(ANALYTICS_KEY);
      const existing = raw ? JSON.parse(raw) : [];
      existing.push(entry);
      await AsyncStorage.setItem(ANALYTICS_KEY, JSON.stringify(existing));
      console.log(`[Analytics] ${event}`, { email, network: net.type, ...metadata });
    } catch (err) {
      console.warn('[Analytics] logEvent failed:', err);
    }
  })();
};

// Convenience helpers — one per event type
export const analytics = {
  otpGenerated:         (email)                          => logEvent('otp_generated',         email, { action: 'generate' }),
  otpValidationSuccess: (email)                          => logEvent('otp_validation_success', email),
  otpValidationFailure: (email, reason, attemptsLeft)    => logEvent('otp_validation_failure', email, { reason, attemptsLeft }),
  logout:               (email, sessionDurationMs)       => logEvent('logout',                 email, { sessionDurationMs }),
  sessionStarted:       (email)                          => logEvent('session_started',        email),
  otpExpired:           (email)                          => logEvent('otp_expired',            email),
  otpMaxAttempts:       (email)                          => logEvent('otp_max_attempts',       email),
};
