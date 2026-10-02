// src/components/ai/SuggestedPrompts.tsx
// Shows quick-tap suggested prompts to help the electrician get started.
// Displayed when the chat is empty and when the AI is available.

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Radius } from '../../constants/theme';

interface SuggestedPrompt {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
  prompt: string;
}

const PROMPTS: SuggestedPrompt[] = [
  {
    icon: 'home-lightning-bolt',
    label: '3 Bedroom House',
    prompt: 'I need a quotation for a 3 bedroom house with 12 LED points, 8 socket points and 3 ceiling fans.',
  },
  {
    icon: 'lightbulb-on-outline',
    label: 'LED Points',
    prompt: 'Add 20 LED points to the quote',
  },
  {
    icon: 'power-socket',
    label: 'Socket Points',
    prompt: 'Add 15 socket points',
  },
  {
    icon: 'fan',
    label: 'Fan Points',
    prompt: 'Add 3 ceiling fan points',
  },
  {
    icon: 'calculator-variant-outline',
    label: 'Quote Total',
    prompt: 'What is the total for this quote?',
  },
  {
    icon: 'magnify',
    label: 'Find Wire',
    prompt: 'Find 2.5mm wire in the database',
  },
  {
    icon: 'alert-circle-outline',
    label: 'Missing Items',
    prompt: 'What materials are missing from this quote?',
  },
  {
    icon: 'currency-usd-off',
    label: 'Reduce Cost',
    prompt: 'Can you suggest ways to make this quote cheaper?',
  },
];

interface Props {
  onSelectPrompt: (prompt: string) => void;
}

export function SuggestedPrompts({ onSelectPrompt }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Try asking:</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {PROMPTS.map((p, i) => (
          <TouchableOpacity
            key={i}
            style={styles.chip}
            onPress={() => onSelectPrompt(p.prompt)}
            activeOpacity={0.75}
          >
            <MaterialCommunityIcons name={p.icon} size={16} color={Colors.accent} />
            <Text style={styles.chipText}>{p.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: Spacing.md,
  },
  heading: {
    fontSize: Typography.xs,
    color: Colors.textDisabled,
    fontFamily: Typography.fontRegular,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    paddingHorizontal: Spacing.base,
    marginBottom: Spacing.sm,
  },
  scrollContent: {
    paddingHorizontal: Spacing.base,
    gap: Spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.bg2,
    borderWidth: 1,
    borderColor: Colors.accent + '40',
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  chipText: {
    fontSize: Typography.sm,
    color: Colors.textPrimary,
    fontFamily: Typography.fontMedium,
  },
});
