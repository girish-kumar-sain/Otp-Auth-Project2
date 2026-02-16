import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import LoginScreen   from './src/screens/LoginScreen';
import OtpScreen     from './src/screens/OtpScreen';
import SessionScreen from './src/screens/SessionScreen';
import { initAnalytics } from './src/services/analytics';
import { Colors, Font } from './src/styles/theme';

const Stack = createNativeStackNavigator();

export default function App() {
  useEffect(() => { void initAnalytics(); }, []);

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" backgroundColor={Colors.white} />
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Login"
          screenOptions={{
            headerStyle:         { backgroundColor: Colors.white },
            headerTintColor:     Colors.blue800,
            headerTitleStyle:    { fontWeight: Font.bold, fontSize: Font.lg },
            headerShadowVisible: false,
            contentStyle:        { backgroundColor: Colors.white },
            animation:           'slide_from_right',
          }}
        >
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Otp"
            component={OtpScreen}
            options={{ title: 'Verify OTP', headerBackTitle: 'Back' }}
          />
          <Stack.Screen
            name="Session"
            component={SessionScreen}
            options={{ title: 'My Session', headerBackVisible: false, gestureEnabled: false }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
