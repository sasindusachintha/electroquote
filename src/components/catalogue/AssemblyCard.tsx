// src/components/catalogue/AssemblyCard.tsx

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Radius, Shadow } from '../../constants/theme';
import type { AssemblyDetail } from '../../types/models';
import { PricingService } from '../../services/PricingService';

interface AssemblyCardProps {
  assembly: AssemblyDetail;
  onPreviewMultiplier: (assembly: AssemblyDetail) => void;
  onEdit: (assembly: AssemblyDetail) => void;
  onDuplicate: (assembly: AssemblyDetail) => void;
  onToggleFavourite: (id: number) => void;
  onDelete: (assembly: AssemblyDetail) => void;
}

export function AssemblyCard({
  assembly,
  onPreviewMultiplier,
  onEdit,
  onDuplicate,
  onToggleFavourite,
  onDelete,
}: AssemblyCardProps) {
  const [expanded, setExpanded] = useState(false);

  // Calculate base estimated price per unit of assembly
  let estimatedBasePrice = 0;
  for (const ml of assembly.materialLines) {
    if (ml.material) {
      const unitPrice = PricingService.calculateSellPrice(
        ml.material.costPrice,
        ml.material.markupPct,
        ml.material.category?.defaultMarkupPct
      );
      estimatedBasePrice += unitPrice * ml.quantity;
    }
  }
  for (const ll of assembly.labourLines) {
    if (ll.labourItem) {
      estimatedBasePrice += ll.labourItem.unitRate * ll.quantity;
    }
  }

  return (
    <View style={styles.card}>
      {/* Header Row */}
      <View style={styles.headerRow}>
        <TouchableOpacity
          style={styles.favouriteBtn}
          onPress={() => onToggleFavourite(assembly.id)}
        >
          <MaterialCommunityIcons
            name={assembly.isFavourite ? 'star' : 'star-outline'}
            size={22}
            color={assembly.isFavourite ? Colors.accent : Colors.textDisabled}
          />
        </TouchableOpacity>

        <View style={styles.titleCol}>
          <Text style={styles.name}>{assembly.name}</Text>
          {assembly.description ? (
            <Text style={styles.description} numberOfLines={2}>
              {assembly.description}
            </Text>
          ) : null}
        </View>

        <View style={styles.badgeCol}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>
              {assembly.category?.name || 'General'}
            </Text>
          </View>
          <Text style={styles.unitTag}>per {assembly.unit}</Text>
        </View>
      </View>

      {/* Summary Box */}
      <View style={styles.summaryBox}>
        <View style={styles.componentCounts}>
          <Text style={styles.countText}>
            📦 {assembly.materialLines.length} materials · 🔧 {assembly.labourLines.length} labour
          </Text>
        </View>
      </View>

      {/* Toggle Expand Recipe Details */}
      <TouchableOpacity
        style={styles.expandToggle}
        onPress={() => setExpanded(!expanded)}
      >
        <Text style={styles.expandToggleText}>
          {expanded ? 'Hide Component Recipe' : 'View Component Recipe'}
        </Text>
        <MaterialCommunityIcons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={18}
          color={Colors.accent}
        />
      </TouchableOpacity>

      {/* Component Details */}
      {expanded ? (
        <View style={styles.recipeDetails}>
          <Text style={styles.recipeHeader}>Materials Included:</Text>
          {assembly.materialLines.map((ml) => (
            <View key={ml.id} style={styles.lineItemRow}>
              <Text style={styles.lineItemBullet}>•</Text>
              <Text style={styles.lineItemName}>
                {ml.material?.name || `Material #${ml.materialId}`}
              </Text>
              <Text style={styles.lineItemQty}>
                {ml.quantity} {ml.material?.unit || 'each'}
              </Text>
            </View>
          ))}

          <Text style={[styles.recipeHeader, styles.labourSectionHeader]}>
            Labour Items Included:
          </Text>
          {assembly.labourLines.map((ll) => (
            <View key={ll.id} style={styles.lineItemRow}>
              <Text style={styles.lineItemBullet}>•</Text>
              <Text style={styles.lineItemName}>
                {ll.labourItem?.name || `Labour #${ll.labourItemId}`}
              </Text>
              <Text style={styles.lineItemQty}>
                {ll.quantity} {ll.labourItem?.unit || 'item'}
              </Text>
            </View>
          ))}
        </View>
      ) : null}

      {/* Action Buttons */}
      <View style={styles.actionRow}>
        <TouchableOpacity
          style={styles.previewBtn}
          onPress={() => onPreviewMultiplier(assembly)}
        >
          <MaterialCommunityIcons name="calculator-variant" size={16} color={Colors.accent} />
          <Text style={styles.previewBtnText}>Test Multiplier (× Qty)</Text>
        </TouchableOpacity>

        <View style={styles.rightActions}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => onDuplicate(assembly)}>
            <MaterialCommunityIcons name="content-copy" size={16} color={Colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.iconBtn} onPress={() => onEdit(assembly)}>
            <MaterialCommunityIcons name="pencil" size={16} color={Colors.accent} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.iconBtn} onPress={() => onDelete(assembly)}>
            <MaterialCommunityIcons name="trash-can-outline" size={16} color={Colors.error} />
          </TouchableOpacity>
        </View>
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
    alignItems: 'flex-start',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  favouriteBtn: {
    paddingTop: Spacing.xxs,
  },
  titleCol: {
    flex: 1,
  },
  name: {
    fontSize: Typography.base,
    fontFamily: Typography.fontBold,
    color: Colors.textPrimary,
  },
  description: {
    fontSize: Typography.xs,
    fontFamily: Typography.fontRegular,
    color: Colors.textSecondary,
    marginTop: Spacing.xxs,
    lineHeight: 18,
  },
  badgeCol: {
    alignItems: 'flex-end',
    gap: Spacing.xxs,
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
  unitTag: {
    fontSize: Typography.xs,
    fontFamily: Typography.fontRegular,
    color: Colors.textSecondary,
  },
  summaryBox: {
    backgroundColor: Colors.bg1,
    borderRadius: Radius.sm,
    padding: Spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  summaryCol: { flex: 1 },
  summaryLabel: {
    fontSize: Typography.xs,
    fontFamily: Typography.fontRegular,
    color: Colors.textSecondary,
  },
  summaryPrice: {
    fontSize: Typography.md,
    fontFamily: Typography.fontBold,
    color: Colors.success,
    marginTop: Spacing.xxs,
  },
  summaryUnit: {
    fontSize: Typography.xs,
    fontFamily: Typography.fontRegular,
    color: Colors.textSecondary,
  },
  componentCounts: {
    alignItems: 'flex-end',
  },
  countText: {
    fontSize: Typography.xs,
    fontFamily: Typography.fontMedium,
    color: Colors.textSecondary,
  },
  expandToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.xs,
  },
  expandToggleText: {
    fontSize: Typography.xs,
    fontFamily: Typography.fontMedium,
    color: Colors.accent,
  },
  recipeDetails: {
    backgroundColor: Colors.bg3,
    borderRadius: Radius.sm,
    padding: Spacing.md,
    marginVertical: Spacing.xs,
    gap: Spacing.xs,
  },
  recipeHeader: {
    fontSize: Typography.xs,
    fontFamily: Typography.fontSemiBold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xxs,
  },
  labourSectionHeader: {
    marginTop: Spacing.sm,
  },
  lineItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  lineItemBullet: {
    color: Colors.accent,
    fontSize: Typography.xs,
  },
  lineItemName: {
    flex: 1,
    fontSize: Typography.xs,
    color: Colors.textSecondary,
    fontFamily: Typography.fontRegular,
  },
  lineItemQty: {
    fontSize: Typography.xs,
    color: Colors.textPrimary,
    fontFamily: Typography.fontMedium,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing.sm,
    marginTop: Spacing.xs,
  },
  previewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.bg3,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  previewBtnText: {
    fontSize: Typography.xs,
    fontFamily: Typography.fontSemiBold,
    color: Colors.accent,
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  iconBtn: {
    padding: Spacing.xs,
  },
});
