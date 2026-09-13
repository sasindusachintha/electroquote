// src/components/quotations/TotalsFooter.tsx

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Radius, Shadow } from '../../constants/theme';
import type { DraftTotals, CurrencySymbol } from '../../types/models';

interface TotalsFooterProps {
  totals: DraftTotals;
  currencySymbol?: CurrencySymbol;
  discountType?: 'pct' | 'fixed';
  discountValue?: number;
  discountNote?: string;
  vatEnabled: boolean;
  vatPct: number;
  onOpenDiscount: () => void;
  onToggleVat: (enabled: boolean) => void;
  onSave: () => void;
  isSaving?: boolean;
}

export function TotalsFooter({
  totals,
  currencySymbol = 'Rs.',
  discountType,
  discountValue = 0,
  discountNote,
  vatEnabled,
  vatPct,
  onOpenDiscount,
  onToggleVat,
  onSave,
  isSaving = false,
}: TotalsFooterProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <View style={styles.container}>
      {/* Main Docked Summary Bar */}
      <View style={styles.mainBar}>
        <View style={styles.grandTotalCol}>
          <View style={styles.grandTotalHeader}>
            <MaterialCommunityIcons name="format-list-bulleted" size={18} color={Colors.accent} />
            <Text style={styles.grandTotalLabel}>LIST READY</Text>
          </View>
          <Text style={styles.grandTotalAmount}>Save & Generate List</Text>
        </View>

        <TouchableOpacity style={[styles.saveBtn, isSaving && styles.saveBtnDisabled]} onPress={onSave} disabled={isSaving}>
          <MaterialCommunityIcons name="content-save-check" size={20} color={Colors.textInverse} />
          <Text style={styles.saveBtnText}>{isSaving ? 'Saving...' : 'Save List'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.bg1,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    ...Shadow.lg,
  },
  breakdownDrawer: {
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  borderTop: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing.xs,
  },
  interactiveRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
  },
  labelWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  label: {
    fontSize: Typography.xs,
    fontFamily: Typography.fontRegular,
    color: Colors.textSecondary,
  },
  value: {
    fontSize: Typography.xs,
    fontFamily: Typography.fontMedium,
    color: Colors.textPrimary,
  },
  subtotalLabel: {
    fontSize: Typography.sm,
    fontFamily: Typography.fontMedium,
    color: Colors.textPrimary,
  },
  subtotalValue: {
    fontSize: Typography.sm,
    fontFamily: Typography.fontBold,
    color: Colors.textPrimary,
  },
  discountLabel: {
    fontSize: Typography.xs,
    fontFamily: Typography.fontMedium,
    color: Colors.accent,
  },
  discountValue: {
    fontSize: Typography.xs,
    fontFamily: Typography.fontRegular,
    color: Colors.textDisabled,
  },
  discountValueActive: {
    color: Colors.error,
    fontFamily: Typography.fontBold,
  },
  vatToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  vatText: {
    fontSize: Typography.xs,
    fontFamily: Typography.fontMedium,
    color: Colors.textPrimary,
  },
  mainBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    gap: Spacing.md,
  },
  summaryClickable: {
    flex: 1,
  },
  grandTotalCol: {
    gap: Spacing.xxs,
  },
  grandTotalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  grandTotalLabel: {
    fontSize: Typography.xs,
    fontFamily: Typography.fontSemiBold,
    color: Colors.textSecondary,
    letterSpacing: 0.5,
  },
  grandTotalAmount: {
    fontSize: Typography.xl,
    fontFamily: Typography.fontBold,
    color: Colors.accent,
  },
  saveBtn: {
    backgroundColor: Colors.accent,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: Radius.full,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    ...Shadow.accent,
  },
  saveBtnDisabled: {
    opacity: 0.6,
  },
  saveBtnText: {
    color: Colors.textInverse,
    fontSize: Typography.base,
    fontFamily: Typography.fontBold,
  },
});
