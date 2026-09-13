// app/(tabs)/quotations/_layout.tsx
// Stack navigator for the Quotations tab — keeps all sub-screens inside this tab.

import { Stack } from 'expo-router';

export default function QuotationsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="new/edit" />
      <Stack.Screen name="[id]/index" />
      <Stack.Screen name="[id]/edit" />
    </Stack>
  );
}
