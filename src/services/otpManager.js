/**
 * otpManager.js
 * All OTP business logic — completely isolated from UI.
 *
 * Rules:
 *  • 6-digit numeric OTP via crypto.getRandomValues (CSPRNG)
 *  • Expires after exactly 60 seconds (timestamp-based, not counter)
 *  • Max 3 wrong attempts before lock
 *  • Resend overwrites record and resets attempts
 *  • Per-email isolation: plain object keyed by email
 */

export const OTP_LENGTH       = 6;
export const OTP_EXPIRY_MS    = 60_000;
export const OTP_MAX_ATTEMPTS = 3;

// Module-level store — encapsulated here, never exported directly
const otpStore = {};

const normalise = (email) => email.trim().toLowerCase();

const generateSecureCode = () => {
  const bytes = new Uint8Array(4);
  (globalThis.crypto ?? global.crypto).getRandomValues(bytes);
  const val = (
    ((bytes[0] << 24) | (bytes[1] << 16) | (bytes[2] << 8) | bytes[3]) >>> 0
  );
  return String(100_000 + (val % 900_000));
};

/**
 * Generate (or regenerate) an OTP for the given email.
 * Overwrites any existing record, resets attempts.
 * Returns the plaintext code (for dev console logging).
 */
export const generateOTP = (email) => {
  const key  = normalise(email);
  const code = generateSecureCode();
  const now  = Date.now();
  otpStore[key] = {
    code,
    generatedAt: now,
    expiresAt:   now + OTP_EXPIRY_MS,
    attempts:    0,
    consumed:    false,
  };
  return code;
};

/**
 * Validate a user-supplied OTP for the given email.
 * Returns { status, message, remainingAttempts? }
 * Statuses: 'success' | 'invalid' | 'expired' | 'max_attempts' | 'not_found'
 */
export const validateOTP = (email, submitted) => {
  const key    = normalise(email);
  const record = otpStore[key];

  if (!record || record.consumed) {
    return { status: 'not_found', message: 'No active OTP found. Please request a new one.' };
  }
  if (Date.now() > record.expiresAt) {
    return { status: 'expired', message: 'Your OTP has expired. Please request a new one.' };
  }
  if (record.attempts >= OTP_MAX_ATTEMPTS) {
    return { status: 'max_attempts', message: 'Too many incorrect attempts. Please request a new OTP.' };
  }
  if (submitted.trim() !== record.code) {
    record.attempts += 1;
    const remaining = OTP_MAX_ATTEMPTS - record.attempts;
    if (record.attempts >= OTP_MAX_ATTEMPTS) {
      return { status: 'max_attempts', message: 'Too many incorrect attempts. Please request a new OTP.', remainingAttempts: 0 };
    }
    return {
      status:            'invalid',
      message:           `Incorrect OTP. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.`,
      remainingAttempts: remaining,
    };
  }
  record.consumed = true;
  return { status: 'success', message: 'OTP verified successfully.' };
};

/** Returns seconds remaining until OTP expires (0 if not found or expired). */
export const getOTPSecondsRemaining = (email) => {
  const record = otpStore[normalise(email)];
  if (!record) return 0;
  return Math.max(0, Math.ceil((record.expiresAt - Date.now()) / 1000));
};

/** Removes the OTP record for an email (call on logout). */
export const clearOTP = (email) => {
  delete otpStore[normalise(email)];
};
