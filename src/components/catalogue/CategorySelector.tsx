// src/components/catalogue/CategorySelector.tsx

import React from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { Colors, Typography, Spacing, Radius } from '../../constants/theme';
import type { MaterialCategory } from '../../types/models';

interface CategorySelectorProps {
  categories: MaterialCategory[];
  selectedCategoryId: number | undefined; // undefined = "All"
  onSelectCategory: (id: number | undefined) => void;
}

export function CategorySelector({
  categories,
  selectedCategoryId,
  onSelectCategory,
}: CategorySelectorProps) {
  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <TouchableOpacity
          style={[
            styles.chip,
            selectedCategoryId === undefined && styles.chipActive,
          ]}
          onPress={() => onSelectCategory(undefined)}
        >
          <Text
            style={[
              styles.chipText,
              selectedCategoryId === undefined && styles.chipTextActive,
            ]}
          >
            All
          </Text>
        </TouchableOpacity>

        {categories.map((cat) => {
          const isSelected = selectedCategoryId === cat.id;
          return (
            <TouchableOpacity
              key={cat.id}
              style={[styles.chip, isSelected && styles.chipActive]}
              onPress={() => onSelectCategory(cat.id)}
            >
              <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                {cat.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.bg0,
  },
  scrollContent: {
    paddingHorizontal: Spacing.base,
    gap: Spacing.sm,
  },
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: Radius.full,
    backgroundColor: Colors.bg2,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipActive: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  chipText: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
    fontFamily: Typography.fontMedium,
  },
  chipTextActive: {
    color: Colors.textInverse,
    fontFamily: Typography.fontSemiBold,
  },
});
