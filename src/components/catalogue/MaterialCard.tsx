// src/components/catalogue/MaterialCard.tsx

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Radius, Shadow } from '../../constants/theme';
import type { MaterialWithCategory } from '../../types/models';
import { PricingService } from '../../services/PricingService';

interface MaterialCardProps {
  material: MaterialWithCategory;
  onEdit: (material: MaterialWithCategory) => void;
  onDelete: (material: MaterialWithCategory) => void;
}

export function MaterialCard({ material, onEdit, onDelete }: MaterialCardProps) {
  // Compute selling price using PricingService
  const effectiveMarkup = material.markupPct ?? material.category?.defaultMarkupPct ?? 0;
  const computedSellPrice = PricingService.calculateSellPrice(
    material.costPrice,
    material.markupPct,
    material.category?.defaultMarkupPct
  );
  const displaySellPrice = material.priceOverride ? material.sellPrice : computedSellPrice;

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.titleArea}>
          <Text style={styles.name} numberOfLines={2}>
            {material.name}
          </Text>
          {material.brand ? (
            <Text style={styles.brand}>Brand: {material.brand}</Text>
          ) : null}
        </View>

        {material.category ? (
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{material.category.name}</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.unitRow}>
        <View style={styles.unitBadge}>
          <MaterialCommunityIcons name="ruler" size={16} color={Colors.accent} />
          <Text style={styles.unitLabel}>Unit:</Text>
          <Text style={styles.unitVal}>{material.unit}</Text>
        </View>
      </View>

      {material.sku || material.wastagePct > 0 ? (
        <View style={styles.metaRow}>
          {material.sku ? (
            <Text style={styles.metaText}>SKU: {material.sku}</Text>
          ) : null}
          {material.wastagePct > 0 ? (
            <Text style={styles.metaText}>Wastage: +{material.wastagePct}%</Text>
          ) : null}
        </View>
      ) : null}

      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.actionBtn} onPress={() => onEdit(material)}>
          <MaterialCommunityIcons name="pencil" size={16} color={Colors.accent} />
          <Text style={styles.actionTextEdit}>Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionBtn} onPress={() => onDelete(material)}>
          <MaterialCommunityIcons name="trash-can-outline" size={16} color={Colors.error} />
          <Text style={styles.actionTextDelete}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.bg2,
    borderRadius: Radius.md,
    padding: Spacing.base,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.sm,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  titleArea: {
    flex: 1,
  },
  name: {
    fontSize: Typography.base,
    fontFamily: Typography.fontSemiBold,
    color: Colors.textPrimary,
  },
  brand: {
    fontSize: Typography.xs,
    fontFamily: Typography.fontRegular,
    color: Colors.textSecondary,
    marginTop: Spacing.xxs,
  },
  categoryBadge: {
    backgroundColor: Colors.bg3,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xxs,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  categoryText: {
    fontSize: Typography.xs,
    fontFamily: Typography.fontMedium,
    color: Colors.accent,
  },
  pricingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bg1,
    borderRadius: Radius.sm,
    padding: Spacing.sm,
    marginBottom: Spacing.md,
  },
  priceCol: {
    flex: 1,
    alignItems: 'center',
  },
  divider: {
    width: 1,
    height: '70%',
    backgroundColor: Colors.border,
  },
  unitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  unitBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.bg1,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  unitLabel: {
    fontSize: Typography.xs,
    fontFamily: Typography.fontRegular,
    color: Colors.textSecondary,
  },
  unitVal: {
    fontSize: Typography.sm,
    fontFamily: Typography.fontSemiBold,
    color: Colors.textPrimary,
  },
  metaRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  metaText: {
    fontSize: Typography.xs,
    color: Colors.textSecondary,
    fontFamily: Typography.fontRegular,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing.sm,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  actionTextEdit: {
    fontSize: Typography.xs,
    fontFamily: Typography.fontMedium,
    color: Colors.accent,
  },
  actionTextDelete: {
    fontSize: Typography.xs,
    fontFamily: Typography.fontMedium,
    color: Colors.error,
  },
});
