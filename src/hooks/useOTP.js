/**
 * useOTP.js
 * Encapsulates OTP countdown timer and attempt state.
 * Keeps all OTP-related side-effects out of the screen component.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { generateOTP, getOTPSecondsRemaining, OTP_EXPIRY_MS } from '../services/otpManager';
import { analytics } from '../services/analytics';

export const OTP_MAX = 3;

/**
 * @param {{ email: string, onExpire?: () => void }} options
 */
export const useOTP = ({ email, onExpire }) => {
  const [secondsLeft,        setSecondsLeft]        = useState(OTP_EXPIRY_MS / 1000);
  const [remainingAttempts,  setRemainingAttempts]  = useState(OTP_MAX);
  const [isLocked,           setIsLocked]           = useState(false);

  const intervalRef = useRef(null);
  const expiredRef  = useRef(false);

  const clearCountdown = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startCountdown = useCallback(() => {
    clearCountdown();
    expiredRef.current = false;
    setSecondsLeft(OTP_EXPIRY_MS / 1000);

    intervalRef.current = setInterval(() => {
      const secs = getOTPSecondsRemaining(email);
      setSecondsLeft(secs);
      if (secs <= 0 && !expiredRef.current) {
        expiredRef.current = true;
        clearCountdown();
        analytics.otpExpired(email);
        onExpire?.();
      }
    }, 1000);
  }, [email, clearCountdown, onExpire]);

  // Cleanup on unmount
  useEffect(() => () => clearCountdown(), [clearCountdown]);

  const requestNewOTP = useCallback(() => {
    const code = generateOTP(email);
    analytics.otpGenerated(email);
    setRemainingAttempts(OTP_MAX);
    setIsLocked(false);
    startCountdown();
    return code;
  }, [email, startCountdown]);

  const lockOTP = useCallback(() => {
    setIsLocked(true);
    setRemainingAttempts(0);
    clearCountdown();
    analytics.otpMaxAttempts(email);
  }, [email, clearCountdown]);

  const recordFailedAttempt = useCallback(() => {
    setRemainingAttempts(prev => Math.max(0, prev - 1));
  }, []);

  const countdownFormatted = useMemo(() => {
    const m = Math.floor(secondsLeft / 60);
    const s = secondsLeft % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  }, [secondsLeft]);

  return {
    secondsLeft,
    countdownFormatted,
    isExpired: secondsLeft <= 0,
    isLocked,
    remainingAttempts,
    requestNewOTP,
    lockOTP,
    recordFailedAttempt,
  };
};
