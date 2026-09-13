// app/(modals)/discount-modal.tsx — Discount Configuration Modal

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { showMessage } from 'react-native-flash-message';

import { Colors, Typography, Spacing, Radius, Shadow } from '../../src/constants/theme';
import { useQuotationDraftStore } from '../../src/stores/quotationDraftStore';

export default function DiscountModalScreen() {
  const { draft, totals, setDiscount } = useQuotationDraftStore();

  const [type, setType] = useState<'pct' | 'fixed'>(draft.discountType || 'pct');
  const [value, setValue] = useState(draft.discountValue ? String(draft.discountValue) : '');
  const [note, setNote] = useState(draft.discountNote || '');

  const numericValue = parseFloat(value) || 0;

  // Real-time calculation preview
  let calculatedAmount = 0;
  if (type === 'pct') {
    calculatedAmount = (totals.subtotalBeforeDiscount * Math.min(100, Math.max(0, numericValue))) / 100;
  } else {
    calculatedAmount = Math.max(0, numericValue);
  }

  const newSubtotalAfterDiscount = Math.max(0, totals.subtotalBeforeDiscount - calculatedAmount);

  const handleApply = () => {
    if (numericValue < 0) {
      showMessage({ message: 'Discount value cannot be negative', type: 'danger' });
      return;
    }
    if (type === 'fixed' && numericValue > totals.subtotalBeforeDiscount) {
      showMessage({
        message: 'Discount amount cannot exceed subtotal',
        type: 'danger',
      });
      return;
    }
    if (type === 'pct' && numericValue > 100) {
      showMessage({ message: 'Percentage discount cannot exceed 100%', type: 'danger' });
      return;
    }

    setDiscount(numericValue > 0 ? type : undefined, numericValue, note.trim());
    showMessage({ message: 'Discount applied to draft', type: 'success' });
    router.back();
  };

  const handleRemove = () => {
    setDiscount(undefined, 0, '');
    showMessage({ message: 'Discount removed', type: 'info' });
    router.back();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
          <MaterialCommunityIcons name="close" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Apply Discount</Text>
        <TouchableOpacity style={styles.applyBtn} onPress={handleApply}>
          <Text style={styles.applyBtnText}>Apply</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {/* Subtotal Context Banner */}
        <View style={styles.infoBanner}>
          <Text style={styles.infoLabel}>Current Subtotal Before Discount:</Text>
          <Text style={styles.infoAmount}>Rs. {totals.subtotalBeforeDiscount.toLocaleString()}</Text>
        </View>

        {/* Discount Type Toggle */}
        <View style={styles.field}>
          <Text style={styles.label}>Discount Type</Text>
          <View style={styles.toggleRow}>
            <TouchableOpacity
              style={[styles.toggleBtn, type === 'pct' && styles.toggleBtnActive]}
              onPress={() => setType('pct')}
            >
              <MaterialCommunityIcons
                name="percent"
                size={18}
                color={type === 'pct' ? Colors.textInverse : Colors.textSecondary}
              />
              <Text style={[styles.toggleBtnText, type === 'pct' && styles.toggleBtnTextActive]}>
                Percentage (%)
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.toggleBtn, type === 'fixed' && styles.toggleBtnActive]}
              onPress={() => setType('fixed')}
            >
              <MaterialCommunityIcons
                name="cash"
                size={18}
                color={type === 'fixed' ? Colors.textInverse : Colors.textSecondary}
              />
              <Text style={[styles.toggleBtnText, type === 'fixed' && styles.toggleBtnTextActive]}>
                Fixed Amount (Rs.)
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Value Input */}
        <View style={styles.field}>
          <Text style={styles.label}>
            {type === 'pct' ? 'Discount Percentage (%)' : 'Discount Fixed Amount (Rs.)'}
          </Text>
          <TextInput
            style={styles.valueInput}
            keyboardType="numeric"
            placeholder={type === 'pct' ? '10' : '2500'}
            placeholderTextColor={Colors.textDisabled}
            value={value}
            onChangeText={setValue}
          />
        </View>

        {/* Note Input */}
        <View style={styles.field}>
          <Text style={styles.label}>Discount Reason / Note (optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Friends & Family / Early Payment Discount"
            placeholderTextColor={Colors.textDisabled}
            value={note}
            onChangeText={setNote}
          />
        </View>

        {/* Live Calculation Preview Box */}
        <View style={styles.previewBox}>
          <Text style={styles.previewHeader}>Calculation Preview</Text>
          <View style={styles.previewRow}>
            <Text style={styles.previewLabel}>Discount Amount:</Text>
            <Text style={styles.previewAmount}>
              - Rs. {calculatedAmount.toLocaleString()}
            </Text>
          </View>
          <View style={[styles.previewRow, styles.borderTop]}>
            <Text style={styles.previewLabel}>New Subtotal After Discount:</Text>
            <Text style={styles.previewGrand}>
              Rs. {newSubtotalAfterDiscount.toLocaleString()}
            </Text>
          </View>
        </View>

        {/* Remove Discount Button */}
        {draft.discountType ? (
          <TouchableOpacity style={styles.removeBtn} onPress={handleRemove}>
            <MaterialCommunityIcons name="trash-can-outline" size={18} color={Colors.error} />
            <Text style={styles.removeBtnText}>Remove Discount</Text>
          </TouchableOpacity>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg0 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  closeBtn: { padding: Spacing.xs },
  headerTitle: {
    fontSize: Typography.md,
    fontFamily: Typography.fontBold,
    color: Colors.textPrimary,
  },
  applyBtn: {
    backgroundColor: Colors.accent,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xs + 2,
    borderRadius: Radius.full,
    ...Shadow.accent,
  },
  applyBtnText: {
    fontSize: Typography.sm,
    fontFamily: Typography.fontBold,
    color: Colors.textInverse,
  },
  content: {
    padding: Spacing.base,
    gap: Spacing.lg,
  },
  infoBanner: {
    backgroundColor: Colors.bg1,
    borderRadius: Radius.md,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: Typography.xs,
    fontFamily: Typography.fontRegular,
    color: Colors.textSecondary,
  },
  infoAmount: {
    fontSize: Typography.lg,
    fontFamily: Typography.fontBold,
    color: Colors.textPrimary,
    marginTop: Spacing.xxs,
  },
  field: { gap: Spacing.xs },
  label: {
    fontSize: Typography.sm,
    fontFamily: Typography.fontMedium,
    color: Colors.textSecondary,
  },
  toggleRow: {
    flexDirection: 'row',
    backgroundColor: Colors.bg1,
    borderRadius: Radius.md,
    padding: Spacing.xxs,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.xs,
  },
  toggleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    gap: Spacing.xs,
    borderRadius: Radius.sm,
  },
  toggleBtnActive: {
    backgroundColor: Colors.accent,
  },
  toggleBtnText: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
    fontFamily: Typography.fontMedium,
  },
  toggleBtnTextActive: {
    color: Colors.textInverse,
    fontFamily: Typography.fontBold,
  },
  valueInput: {
    backgroundColor: Colors.bg2,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontSize: Typography.lg,
    color: Colors.accent,
    fontFamily: Typography.fontBold,
  },
  input: {
    backgroundColor: Colors.bg2,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontSize: Typography.base,
    color: Colors.textPrimary,
    fontFamily: Typography.fontRegular,
  },
  previewBox: {
    backgroundColor: Colors.bg1,
    borderRadius: Radius.md,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.sm,
  },
  previewHeader: {
    fontSize: Typography.xs,
    fontFamily: Typography.fontSemiBold,
    color: Colors.accent,
    textTransform: 'uppercase',
  },
  previewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  borderTop: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing.xs,
  },
  previewLabel: {
    fontSize: Typography.xs,
    color: Colors.textSecondary,
    fontFamily: Typography.fontRegular,
  },
  previewAmount: {
    fontSize: Typography.sm,
    fontFamily: Typography.fontBold,
    color: Colors.error,
  },
  previewGrand: {
    fontSize: Typography.base,
    fontFamily: Typography.fontBold,
    color: Colors.success,
  },
  removeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.error,
  },
  removeBtnText: {
    color: Colors.error,
    fontSize: Typography.sm,
    fontFamily: Typography.fontSemiBold,
  },
});
