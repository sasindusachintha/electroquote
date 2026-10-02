// app/(tabs)/_layout.tsx
// Bottom tab navigator — the main navigation chrome of the app.

import React from 'react';
import { Tabs } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, View, Text } from 'react-native';
import { Colors, Typography, Spacing } from '../../src/constants/theme';

type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

function TabIcon({
  name,
  focused,
  color,
}: {
  name: IconName;
  focused: boolean;
  color: string | import('react-native').ColorValue;
}) {
  return (
    <MaterialCommunityIcons
      name={name}
      size={focused ? 26 : 24}
      color={color as string}
    />
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.bg2,
          borderTopColor: Colors.border,
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: Colors.accent,
        tabBarInactiveTintColor: Colors.textDisabled,
        tabBarLabelStyle: {
          fontSize: Typography.xs,
          fontFamily: Typography.fontMedium,
          marginTop: 2,
        },
      }}
    >
      {/* ── Visible tabs ── */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon name="home-lightning-bolt" focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="quotations"
        options={{
          title: 'Quotes',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon name="file-document-multiple" focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="ai"
        options={{
          title: 'AI',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon name="robot-excited-outline" focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon name="cog" focused={focused} color={color} />
          ),
        }}
      />

      {/* ── Hidden from tab bar ── */}
      <Tabs.Screen name="catalogue" options={{ href: null }} />
    </Tabs>
  );
}
