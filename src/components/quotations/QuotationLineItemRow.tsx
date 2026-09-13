// src/components/quotations/QuotationLineItemRow.tsx

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Radius, Shadow } from '../../constants/theme';
import type { DraftLineItem } from '../../types/models';

interface QuotationLineItemRowProps {
  item: DraftLineItem;
  sectionLocalId: string;
  onUpdateQty: (newQty: number) => void;
  onUpdateUnitPrice: (newPrice: number) => void;
  onRemove: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}

export function QuotationLineItemRow({
  item,
  onUpdateQty,
  onUpdateUnitPrice,
  onRemove,
  onMoveUp,
  onMoveDown,
}: QuotationLineItemRowProps) {
  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        {/* Item Icon */}
        <MaterialCommunityIcons
          name={item.isMaterial ? 'package-variant' : 'wrench'}
          size={18}
          color={item.isMaterial ? Colors.accent : Colors.info}
        />

        {/* Description */}
        <View style={styles.descriptionCol}>
          <Text style={styles.description} numberOfLines={2}>
            {item.description}
          </Text>
          <View style={styles.badgeRow}>
            <View style={styles.unitBadge}>
              <Text style={styles.unitText}>{item.unit}</Text>
            </View>
            {item.markupPct > 0 && item.isMaterial ? (
              <Text style={styles.markupText}>+{item.markupPct}% markup</Text>
            ) : null}
            {item.priceOverridden ? (
              <Text style={styles.overrideBadge}>Manual Price</Text>
            ) : null}
          </View>
        </View>

        {/* Reorder Buttons */}
        <View style={styles.reorderCol}>
          {onMoveUp ? (
            <TouchableOpacity style={styles.reorderBtn} onPress={onMoveUp}>
              <MaterialCommunityIcons name="chevron-up" size={18} color={Colors.textSecondary} />
            </TouchableOpacity>
          ) : null}
          {onMoveDown ? (
            <TouchableOpacity style={styles.reorderBtn} onPress={onMoveDown}>
              <MaterialCommunityIcons name="chevron-down" size={18} color={Colors.textSecondary} />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Delete Button */}
        <TouchableOpacity style={styles.deleteBtn} onPress={onRemove}>
          <MaterialCommunityIcons name="trash-can-outline" size={18} color={Colors.error} />
        </TouchableOpacity>
      </View>

      {/* Quantity Controls Row */}
      <View style={styles.bottomRow}>
        <View style={styles.qtyControlRow}>
          <Text style={styles.controlLabel}>Qty:</Text>
          <TouchableOpacity
            style={styles.counterBtn}
            onPress={() => onUpdateQty(Math.max(0.5, item.quantity - 1))}
          >
            <MaterialCommunityIcons name="minus" size={16} color={Colors.accent} />
          </TouchableOpacity>

          <TextInput
            style={styles.qtyInput}
            keyboardType="numeric"
            value={String(item.quantity)}
            onChangeText={(val) => onUpdateQty(parseFloat(val) || 0)}
          />

          <TouchableOpacity
            style={styles.counterBtn}
            onPress={() => onUpdateQty(item.quantity + 1)}
          >
            <MaterialCommunityIcons name="plus" size={16} color={Colors.accent} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.bg2,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.sm,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  descriptionCol: {
    flex: 1,
    gap: Spacing.xxs,
  },
  description: {
    fontSize: Typography.base,
    fontFamily: Typography.fontSemiBold,
    color: Colors.textPrimary,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  unitBadge: {
    backgroundColor: Colors.bg3,
    paddingHorizontal: Spacing.xs + 2,
    paddingVertical: Spacing.xxs,
    borderRadius: Radius.xs,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  unitText: {
    fontSize: Typography.xs,
    fontFamily: Typography.fontMedium,
    color: Colors.textSecondary,
  },
  markupText: {
    fontSize: Typography.xs,
    fontFamily: Typography.fontRegular,
    color: Colors.accent,
  },
  overrideBadge: {
    fontSize: Typography.xs,
    fontFamily: Typography.fontMedium,
    color: Colors.info,
  },
  reorderCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xxs,
  },
  reorderBtn: {
    padding: Spacing.xxs,
  },
  deleteBtn: {
    padding: Spacing.xs,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.bg1,
    borderRadius: Radius.sm,
    padding: Spacing.sm,
    gap: Spacing.xs,
  },
  qtyControlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  controlLabel: {
    fontSize: Typography.xs,
    fontFamily: Typography.fontRegular,
    color: Colors.textSecondary,
  },
  counterBtn: {
    width: 28,
    height: 28,
    borderRadius: Radius.full,
    backgroundColor: Colors.bg3,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  qtyInput: {
    width: 44,
    height: 28,
    backgroundColor: Colors.bg3,
    borderRadius: Radius.xs,
    textAlign: 'center',
    color: Colors.textPrimary,
    fontFamily: Typography.fontBold,
    fontSize: Typography.xs,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 0,
  },
  priceControlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  priceInput: {
    width: 60,
    height: 28,
    backgroundColor: Colors.bg3,
    borderRadius: Radius.xs,
    textAlign: 'center',
    color: Colors.textPrimary,
    fontFamily: Typography.fontMedium,
    fontSize: Typography.xs,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 0,
  },
  lineTotalCol: {
    alignItems: 'flex-end',
  },
  lineTotalLabel: {
    fontSize: Typography.xs,
    fontFamily: Typography.fontRegular,
    color: Colors.textSecondary,
  },
  lineTotalAmount: {
    fontSize: Typography.sm,
    fontFamily: Typography.fontBold,
    color: Colors.success,
  },
});
