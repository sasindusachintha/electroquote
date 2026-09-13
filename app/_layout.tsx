// app/_layout.tsx
// Root layout — initialises SQLiteProvider, loads fonts, wraps the entire app in providers.

import React from 'react';
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SQLiteProvider } from 'expo-sqlite';
import FlashMessage from 'react-native-flash-message';
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import { runMigrations } from '../src/db/migrations/runner';
import { Colors } from '../src/constants/theme';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 30, // 30 seconds
      gcTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    // Load vector icon font so tab bar icons render correctly
    MaterialCommunityIcons: require('@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/MaterialCommunityIcons.ttf'),
  });

  if (!fontsLoaded) {
    return (
      <View style={styles.splash}>
        <StatusBar style="light" />
        <View style={styles.splashContent}>
          <Text style={styles.splashTitle}>⚡ ElectroQuote</Text>
          <ActivityIndicator color={Colors.accent} size="large" />
        </View>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <SQLiteProvider
          databaseName="electroquote.db"
          onInit={async (db) => {
            await db.execAsync('PRAGMA journal_mode = WAL;');
            await db.execAsync('PRAGMA foreign_keys = ON;');
            await runMigrations(db);
          }}
        >
          <QueryClientProvider client={queryClient}>
            <StatusBar style="light" />
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="customers" options={{ headerShown: false }} />
              <Stack.Screen name="projects" options={{ headerShown: false }} />
              <Stack.Screen
                name="(modals)"
                options={{
                  presentation: 'modal',
                  animation: 'slide_from_bottom',
                  headerShown: false,
                }}
              />
            </Stack>
            <FlashMessage position="top" />
          </QueryClientProvider>
        </SQLiteProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.bg0,
  },
  splash: {
    flex: 1,
    backgroundColor: Colors.bg0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  splashContent: {
    alignItems: 'center',
    gap: 24,
  },
  splashTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.accent,
    letterSpacing: 1,
  },
});
