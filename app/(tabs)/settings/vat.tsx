import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing } from '../../../src/constants/theme';

export default function PlaceholderScreen() {
  return (
    <SafeAreaView style={styles.c} edges={['top']}>
      <View style={styles.v}>
        <Text style={styles.t}>VAT Settings</Text>
        <Text style={styles.s}>Coming in Phase 5</Text>
      </View>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: Colors.bg0 },
  v: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  t: { fontSize: Typography.lg, color: Colors.textPrimary, fontFamily: Typography.fontSemiBold },
  s: { fontSize: Typography.base, color: Colors.textSecondary, fontFamily: Typography.fontRegular },
});
