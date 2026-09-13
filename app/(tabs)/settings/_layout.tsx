// app/(tabs)/settings/_layout.tsx
// Stack navigator for the Settings tab — keeps all sub-screens inside this tab.

import { Stack } from 'expo-router';

export default function SettingsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="business-profile" />
      <Stack.Screen name="pricing" />
      <Stack.Screen name="quotation-defaults" />
      <Stack.Screen name="backup" />
      <Stack.Screen name="vat" />
    </Stack>
  );
}
