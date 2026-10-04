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

// -- OPFS lock guard (web only) ------------------------------------------------
// On web, expo-sqlite uses the browser's Origin Private File System (OPFS).
// If a previous tab / hot-reload context still holds the sync access handle,
// the new mount throws "createSyncAccessHandle ... another open Access Handle".
// This boundary catches that specific error and auto-reloads once to clear it.
class SqliteErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { crashed: boolean; errorMsg: string }
> {
  state = { crashed: false, errorMsg: '' };

  static getDerivedStateFromError(err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    const name = err instanceof Error ? err.name : '';
    if (
      msg.includes('createSyncAccessHandle') ||
      msg.includes('Access Handle') ||
      msg.includes('NoModificationAllowedError') ||
      msg.includes('FileSystemFileHandle') ||
      name === 'NoModificationAllowedError'
    ) {
      if (typeof window !== 'undefined') {
        setTimeout(() => window.location.reload(), 1200);
      }
      return { crashed: true, errorMsg: msg };
    }
    return null; // Let other errors propagate
  }

  render() {
    if (this.state.crashed) {
      return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#0d0d0d', padding: 24 }}>
          <ActivityIndicator color="#f59e0b" size="large" />
          <Text style={{ color: '#f59e0b', marginTop: 16, fontSize: 18, fontWeight: 'bold' }}>
            Releasing Database Lock...
          </Text>
          <Text style={{ color: '#9ca3af', marginTop: 8, fontSize: 14, textAlign: 'center', maxWidth: 400 }}>
            Another tab or background reload is releasing the local database file lock. Page will auto-reload shortly.
          </Text>
        </View>
      );
    }
    return this.props.children;
  }
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 30,
      gcTime: 1000 * 60 * 5,
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
        <SqliteErrorBoundary>
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
        </SqliteErrorBoundary>
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
