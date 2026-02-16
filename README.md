# 🔐 OTP Auth App

Passwordless Email + OTP authentication built with **React Native (Expo)** and **JavaScript**.

**Styling**: Pure `React Native StyleSheet` — zero external CSS libraries.
**Theme**: White background with contrasting shades of blue (design tokens in `src/styles/theme.js`).

---

## 🚀 Setup

```bash
npm install
npm run web       # http://localhost:8081
npm start         # scan QR with Expo Go
npm run android   # Android emulator
npm run ios       # iOS simulator (Mac only)
```

### Getting the OTP
After tapping "Send OTP", check the Metro terminal:
```
[DEV] OTP for you@email.com: 847291
```

---

## 🏗️ Project Structure

```
src/
├── styles/theme.js          ← All design tokens (Colors, Font, Space, Radius, Shadow)
├── services/otpManager.js   ← OTP generate / validate / expire
├── services/analytics.js    ← AsyncStorage + NetInfo SDK
├── hooks/useSessionTimer.js ← Live mm:ss timer
├── hooks/useOTP.js          ← Countdown + attempt tracking
├── components/index.js      ← Button, Input, Card, OTPBox, InfoRow, Divider
└── screens/                 ← LoginScreen, OtpScreen, SessionScreen
```

---

## ✅ Requirements Checklist

- [x] Email + OTP login, 6-digit code, 60s expiry, max 3 attempts
- [x] Resend invalidates old OTP and resets attempts
- [x] Per-email OTP storage (plain object, O(1) lookup)
- [x] Session screen with start time, live mm:ss timer, logout
- [x] Timer does NOT reset on re-render (useRef interval)
- [x] Timer drift-proof across background/foreground (Date.now() diff)
- [x] Interval cleaned up on unmount (useEffect cleanup)
- [x] External SDK: AsyncStorage + NetInfo, all 7 events logged
- [x] Pure StyleSheet CSS — no Tailwind, no NativeWind
- [x] JavaScript only — no TypeScript
- [x] Functional components + hooks, no logic in JSX
